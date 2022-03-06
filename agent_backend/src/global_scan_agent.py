#!/usr/bin/env python3

# author: tcneko <tcneko@outlook.com>
# start from: 2021.10
# last test environment: ubuntu 20.04
# description:


# import
import aiohttp
import asyncio
import ipaddress
import json
import os
import random
import re

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI, WebSocket, WebSocketDisconnect


# variable
agent_alias = os.environ.get("GLOBAL_SCAN_AGENT_ALIAS") or "localhost"
agent_hostname = os.environ.get("GLOBAL_SCAN_AGENT_HOSTNAME") or "127.0.0.1"
agent_port = os.environ.get("GLOBAL_SCAN_AGENT_PORT") or "8001"

core_hostname = os.environ.get("GLOBAL_SCAN_CORE_HOSTNAME") or "127.0.0.1"
core_port = os.environ.get("GLOBAL_SCAN_CORE_PORT") or "8000"

enable_tls = os.environ.get("GLOBAL_SCAN_ENABLE_TLS") or ""

if enable_tls == "True":
    http_protocol = "https"
else:
    http_protocol = "http"

random_delay_limit = int(os.environ.get(
    "GLOBAL_SCAN_RANDOM_DELAY_LIMIT") or "3")

agent_exist_url = "{}://{}:{}/api/v1/agent_exist".format(
    http_protocol, core_hostname, core_port)

scan_out = {}


# function
async def fping(prefix: str):
    ip_network = ipaddress.ip_network(prefix)
    address_count = ip_network.num_addresses
    network_address = str(ip_network.network_address)
    broadcast_address = str(ip_network.broadcast_address)
    fping = await asyncio.create_subprocess_exec("fping", "-sq", "-c5", "-t1000", "-g", network_address, broadcast_address,
                                                 stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    fping_stderr = (await fping.communicate())[1]
    fping_out_list = fping_stderr.decode("utf-8").split("\n")
    fping_out_ip_list = fping_out_list[0:address_count]
    fping_out_summary_list = fping_out_list[address_count:-1]
    alive_addr_list = []
    dead_addr_list = []
    for line in fping_out_ip_list:
        re_out = re.search(r"min/avg/max", line)
        if re_out:
            alive_addr_list.append(line.split(" ")[0])
        else:
            dead_addr_list.append(line.split(" ")[0])
    alive_addr_set = set(alive_addr_list)
    dead_addr_set = set(dead_addr_list)
    alive_count, dead_count, unknown_count = map(lambda x: int(
        x.strip().split(" ")[0]), fping_out_summary_list[-14:-11])
    min_rrt, avg_rrt, max_rrt = map(lambda x: float(
        x.strip().split(" ")[0]), fping_out_summary_list[-5:-2])
    return {"alive_addr_set": alive_addr_set, "dead_addr_set": dead_addr_set,
            "alive_addr_count": alive_count, "dead_addr_count": dead_count,
            "min_rrt": min_rrt, "avg_rrt": avg_rrt, "max_rrt": max_rrt}


async def scan_step(task_id: str, prefix: str, step: int, interval: int, ws: WebSocket):
    random_delay = random.randint(0, random_delay_limit)
    await asyncio.sleep(interval * step + random_delay)
    if ws.client_state.name != "CONNECTED":
        raise WebSocketDisconnect
    scan_step_out = await fping(prefix)
    if step == 0:
        scan_step_out["avg_rrt_diff"] = 0
        scan_step_out["alive_addr_diff_list"] = []
        scan_step_out["dead_addr_diff_list"] = []
    else:
        scan_step_out["avg_rrt_diff"] = round(scan_step_out["avg_rrt"] -
                                              scan_out[task_id][prefix][step - 1]["avg_rrt"], 2)
        scan_step_out["alive_addr_diff_list"] = list(scan_step_out["alive_addr_set"] -
                                                     scan_out[task_id][prefix][step - 1]["alive_addr_set"])
        scan_step_out["dead_addr_diff_list"] = list(scan_step_out["dead_addr_set"] -
                                                    scan_out[task_id][prefix][step - 1]["dead_addr_set"])
    scan_out[task_id][prefix][step] = scan_step_out
    json_msg = {"event": "step_end",
                "scanner": agent_alias,
                "prefix": prefix, "step": step,
                "alive_addr_count": scan_step_out["alive_addr_count"],
                "dead_addr_count": scan_step_out["dead_addr_count"],
                "avg_rrt": scan_step_out["avg_rrt"],
                "alive_addr_diff_list": scan_step_out["alive_addr_diff_list"],
                "dead_addr_diff_list": scan_step_out["dead_addr_diff_list"],
                "avg_rrt_diff": scan_step_out["avg_rrt_diff"]}
    await ws.send_json(json_msg)
    return


async def scan_prefix(task_id: str, prefix: str, repeat: int, interval: int, ws: WebSocket):
    aio_task_list = []
    scan_out[task_id][prefix] = {}
    for step in range(0, repeat):
        aio_task_list.append(asyncio.create_task(
            scan_step(task_id, prefix, step, interval, ws)))
    try:
        await asyncio.gather(*aio_task_list)
    except Exception as e:
        for aio_task in aio_task_list:
            aio_task.cancel()
        raise
    return


async def scan_task(task_id: str, prefix_list: list, repeat: int, interval: int, ws: WebSocket):
    aio_task_list = []
    for prefix in prefix_list:
        aio_task_list.append(asyncio.create_task(
            scan_prefix(task_id, prefix, repeat, interval, ws)))
    try:
        await asyncio.gather(*aio_task_list)
    except Exception as e:
        for aio_task in aio_task_list:
            aio_task.cancel()
        raise
    return


async def keepalive_ws(ws: WebSocket, scan_task: asyncio.Task):
    while not scan_task.done():
        json_msg = {"event": "keepalive"}
        await ws.send_json(json_msg)
        await asyncio.sleep(5)


def init_scan_out_stack(task_id: str, prefix_list: list, repeat: int):
    scan_out[task_id] = {}
    for prefix in prefix_list:
        scan_out[task_id][prefix] = {}
        for step in range(0, repeat):
            scan_out[task_id][prefix][step] = None


async def notify_agent_exist():
    async with aiohttp.ClientSession() as session:
        json_msg = {"agent_alias": agent_alias,
                    "agent_hostname": agent_hostname, "agent_port": agent_port}
        await session.post(agent_exist_url, json=json_msg)


app = FastAPI()
scheduler = AsyncIOScheduler()


@app.on_event("startup")
async def task_notify_agent_exist():
    scheduler.add_job(notify_agent_exist, 'interval', seconds=60)
    scheduler.start()


@app.on_event("startup")
async def dump_env():
    json_msg = {"event": "dump_env",
                "agent_alias": agent_alias, "agent_hostname": agent_hostname, "agent_port": agent_port,
                "core_hostname": core_hostname, "core_port": core_port,
                "enable_tls": enable_tls}
    print(json.dumps(json_msg))


@app.websocket("/ws/v1/scan_task")
async def ws_task(ws: WebSocket):
    await ws.accept()
    aio_task_map = {}
    try:
        task_info = await ws.receive_json()
        repeat = int(task_info["repeat"])
        interval = int(task_info["interval"])
        prefix_list = task_info["prefix_list"]
        task_id = str(task_info["task_id"])
        json_msg = {"event": "scanner_start",
                    "task_id": task_id, "scanner": agent_alias, "prefix_list": prefix_list, "repeat": repeat, "interval": interval}
        print(json.dumps(json_msg))
        await ws.send_json(json_msg)
        init_scan_out_stack(task_id, prefix_list, repeat)
        aio_task_map["scan_task"] = asyncio.create_task(
            scan_task(task_id, prefix_list, repeat, interval, ws))
        aio_task_map["keepalive_ws"] = asyncio.create_task(
            keepalive_ws(ws, aio_task_map["scan_task"]))
        await asyncio.gather(*aio_task_map.values())
        json_msg = {"event": "scanner_end",
                    "reason": "finish", "task_id": task_id,  "scanner": agent_alias}
        print(json.dumps(json_msg))
        await ws.send_json(json_msg)
    except Exception as e:
        json_msg = {"event": "scanner_end",
                    "reason": "exception", "task_id": task_id}
        print(json.dumps(json_msg))
        for key in aio_task_map:
            aio_task_map[key].cancel()
    finally:
        del scan_out[task_id]
        await ws.close()

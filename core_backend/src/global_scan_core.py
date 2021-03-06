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
import re
import time
import uuid

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI, WebSocket
from pydantic import BaseModel


# variable
enable_tls = os.environ.get("GLOBAL_SCAN_ENABLE_TLS") or ""

if enable_tls == "True":
    ws_protocol = "wss"
else:
    ws_protocol = "ws"

agent_map = {}


# function
def verify_prefix(prefix: str, ipv4_prefix_len: int):
    try:
        prefix = ipaddress.ip_network(prefix)
        if prefix.version == 4 and prefix.prefixlen >= ipv4_prefix_len:
            return True
    except:
        return False


def extract_prefix(raw_prefix_list: list, ipv4_prefix_len: int):
    regexp_ipv4_prefix = r"(?:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/(?:3[012]|[12][0-9]|[1-9])"
    # regexp_ipv6_prefix = r"(?:(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,4}:[^\s:](?:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])))|(?:::(?:ffff(?::0{1,4}){0,1}:){0,1}[^\s:](?:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])))|(?:fe80:(?::(?:(?:[0-9a-fA-F]){1,4})){0,4}%[0-9a-zA-Z]{1,})|(?::(?:(?::(?:(?:[0-9a-fA-F]){1,4})){1,7}|:))|(?:(?:(?:[0-9a-fA-F]){1,4}):(?:(?::(?:(?:[0-9a-fA-F]){1,4})){1,6}))|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,2}(?::(?:(?:[0-9a-fA-F]){1,4})){1,5})|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,3}(?::(?:(?:[0-9a-fA-F]){1,4})){1,4})|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,4}(?::(?:(?:[0-9a-fA-F]){1,4})){1,3})|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,5}(?::(?:(?:[0-9a-fA-F]){1,4})){1,2})|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,6}:(?:(?:[0-9a-fA-F]){1,4}))|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){1,7}:)|(?:(?:(?:(?:[0-9a-fA-F]){1,4}):){7,7}(?:(?:[0-9a-fA-F]){1,4})))/(?:12[0-8]|1[01][0-9]|[1-9][0-9]|[1-9])"
    # regexp_prefix = "({}|{})".format(regexp_ipv4_prefix, regexp_ipv6_prefix)
    regexp_prefix = regexp_ipv4_prefix
    prefix_list_s1 = []
    for prefix_src in raw_prefix_list:
        l_re_out_prefix = re.findall(regexp_prefix, prefix_src)
        if l_re_out_prefix:
            if verify_prefix(l_re_out_prefix[0], ipv4_prefix_len):
                prefix_list_s1.append(l_re_out_prefix[0])
    prefix_list = list(set(prefix_list_s1))
    return prefix_list


def extract_scanner(raw_scanner_list: list):
    scanner_list = []
    for scanner in raw_scanner_list:
        if scanner in agent_map:
            scanner_list.append(scanner)
    return scanner_list


def verify_reduce_task(scanner_list, prefix_list, ipv4_prefix_len):
    arg_validity_map = {"all": True, "scanner_list": True, "prefix_list": True,
                        "ipv4_prefix_len": True}
    if len(prefix_list) == 0:
        arg_validity_map["all"] = False
        arg_validity_map["prefix_list"] = False
    if len(scanner_list) == 0:
        arg_validity_map["all"] = False
        arg_validity_map["scanner_list"] = False
    if type(ipv4_prefix_len) != int or ipv4_prefix_len > 32 or ipv4_prefix_len < 20:
        arg_validity_map["all"] = False
        arg_validity_map["ipv4_prefix_len"] = False
    return arg_validity_map


def verify_task(scanner_list, prefix_list, repeat, interval):
    arg_validity_map = {"all": True,  "scanner_list": True, "prefix_list": True,
                        "repeat": True, "interval": True}
    if len(prefix_list) == 0:
        arg_validity_map["all"] = False
        arg_validity_map["prefix_list"] = False
    if len(scanner_list) == 0:
        arg_validity_map["all"] = False
        arg_validity_map["scanner_list"] = False
    if type(repeat) != int or repeat > 100 or repeat < 1:
        arg_validity_map["all"] = False
        arg_validity_map["repeat"] = False
    if type(interval) != int or interval < 30 or interval > 300:
        arg_validity_map["all"] = False
        arg_validity_map["interval"] = False
    return arg_validity_map


def remove_dead_agent():
    now = int(time.time())
    dead_agent_list = []
    for agent in agent_map:
        if now - agent_map[agent]["last_seen"] > 300:
            dead_agent_list.append(agent)
    for agent in dead_agent_list:
        del agent_map[agent]
    return


async def scan_scanner(task_id, scanner, prefix_list, repeat, interval, ws):
    agent_ws_url_task = "{}://{}:{}/ws/v1/scan_task".format(
        ws_protocol, agent_map[scanner]["agent_hostname"], agent_map[scanner]["agent_port"])
    async with aiohttp.ClientSession() as session:
        async with session.ws_connect(agent_ws_url_task) as scanner_ws:
            await scanner_ws.send_json({"event": "task_request", "task_id": task_id, "prefix_list": prefix_list, "repeat": repeat, "interval": interval})
            async for msg in scanner_ws:
                if msg.type == aiohttp.WSMsgType.TEXT:
                    json_msg = json.loads(msg.data)
                    if json_msg["event"] != "keepalive":
                        await ws.send_json(json_msg)
                elif msg.type == aiohttp.WSMsgType.ERROR:
                    json_msg = {"event": "scanner_end",
                                "reason": "exception", "task_id": task_id, "scanner": scanner}
                    await ws.send_json(json_msg)
                    break
    return


async def scan_task(task_id, scanner_list, prefix_list, repeat, interval, ws):
    aio_task_list = []
    for scanner in scanner_list:
        aio_task_list.append(asyncio.create_task(
            scan_scanner(task_id, scanner, prefix_list, repeat, interval, ws)))
    try:
        await asyncio.gather(*aio_task_list)
    except Exception as e:
        for aio_task in aio_task_list:
            aio_task.cancel()
        raise
    return


def reduce_prefix_list(prefix_list, ipv4_prefix_len):
    reduced_prefix_list = []
    for prefix in prefix_list:
        network = ipaddress.ip_network(prefix)
        if network.version == 4 and network.prefixlen >= 16:
            if network.prefixlen < ipv4_prefix_len:
                subnet_list = network.subnets(new_prefix=ipv4_prefix_len)
                for subnet in subnet_list:
                    reduced_prefix_list.append(str(subnet))
            else:
                reduced_prefix_list.append(str(network))
    return reduced_prefix_list


async def keepalive_ws(ws: WebSocket, scan_task: asyncio.Task):
    while not scan_task.done():
        json_msg = {"event": "keepalive"}
        await ws.send_json(json_msg)
        await asyncio.sleep(5)


class AgentExistBody(BaseModel):
    agent_alias: str
    agent_hostname: str
    agent_port: int


app = FastAPI()
scheduler = AsyncIOScheduler()


@ app.on_event("startup")
async def task_remove_dead_agent():
    scheduler.add_job(remove_dead_agent, 'interval', seconds=60)
    scheduler.start()
    return


@ app.on_event("startup")
async def dump_env():
    json_msg = {"event": "dump_env", "enable_tls": enable_tls}
    print(json.dumps(json_msg))


@ app.post("/api/v1/agent_exist")
async def api_agent_exist(body: AgentExistBody):
    if body.agent_alias in agent_map:
        agent_map[body.agent_alias]["last_seen"] = int(time.time())
    else:
        agent_map[body.agent_alias] = {"agent_hostname": body.agent_hostname, "agent_port": body.agent_port,
                                       "last_seen": int(time.time())}
    return


@ app.get("/api/v1/agent_list")
async def api_agent_list():
    return list(agent_map.keys())


@ app.websocket("/ws/v1/reduce_task")
async def ws_reduce_task(ws: WebSocket):
    await ws.accept()
    aio_task_map = {}
    try:
        task_info = await ws.receive_json()
        scanner_list = extract_scanner(task_info["scanner_list"])
        prefix_list = extract_prefix(task_info["prefix_list"], 16)
        ipv4_prefix_len = task_info["ipv4_prefix_len"]
        task_id = str(uuid.uuid4())
        arg_validity_map = verify_reduce_task(
            scanner_list, prefix_list, ipv4_prefix_len)
        if arg_validity_map["all"]:
            reduced_prefix_list = reduce_prefix_list(
                prefix_list, ipv4_prefix_len)
            json_msg = {"event": "task_start",
                        "task_id": task_id,  "scanner_list": scanner_list, "prefix_list": reduced_prefix_list, "ipv4_prefix_len": ipv4_prefix_len}
            await ws.send_json(json_msg)
            print(json.dumps(json_msg))
            aio_task_map["reduce_task"] = asyncio.create_task(
                scan_task(task_id, scanner_list, reduced_prefix_list, 1, 60, ws))
            aio_task_map["keepalive_ws"] = asyncio.create_task(
                keepalive_ws(ws, aio_task_map["reduce_task"]))
            await asyncio.gather(*aio_task_map.values())
            json_msg = {"event": "task_end",
                        "reason": "finish", "task_id": task_id}
            await ws.send_json(json_msg)
            print(json.dumps(json_msg))
        else:
            json_msg = {"event": "task_arg_error",
                        "arg_validity_map": arg_validity_map}
            await ws.send_json(json_msg)
            print(json.dumps(json_msg))
    except Exception as e:
        json_msg = {"event": "task_end",
                    "reason": "exception", "task_id": task_id}
        print(json.dumps(json_msg))
        for key in aio_task_map:
            aio_task_map[key].cancel()
    finally:
        await ws.close()
    return


@ app.websocket("/ws/v1/scan_task")
async def ws_scan_task(ws: WebSocket):
    await ws.accept()
    aio_task_map = {}
    try:
        task_info = await ws.receive_json()
        scanner_list = extract_scanner(task_info["scanner_list"])
        prefix_list = extract_prefix(task_info["prefix_list"], 20)
        repeat = task_info["repeat"]
        interval = task_info["interval"]
        task_id = str(uuid.uuid4())
        arg_validity_map = verify_task(
            scanner_list, prefix_list, repeat, interval)
        if arg_validity_map["all"]:
            json_msg = {"event": "task_start",
                        "task_id": task_id,  "scanner_list": scanner_list, "prefix_list": prefix_list, "repeat": repeat, "interval": interval}
            await ws.send_json(json_msg)
            print(json.dumps(json_msg))
            aio_task_map["scan_task"] = asyncio.create_task(
                scan_task(task_id, scanner_list, prefix_list, repeat, interval, ws))
            aio_task_map["keepalive_ws"] = asyncio.create_task(
                keepalive_ws(ws, aio_task_map["scan_task"]))
            await asyncio.gather(*aio_task_map.values())
            json_msg = {"event": "task_end",
                        "reason": "finish", "task_id": task_id}
            await ws.send_json(json_msg)
            print(json.dumps(json_msg))
        else:
            json_msg = {"event": "task_arg_error",
                        "arg_validity_map": arg_validity_map}
            await ws.send_json(json_msg)
            print(json.dumps(json_msg))
    except Exception as e:
        json_msg = {"event": "task_end",
                    "reason": "exception", "task_id": task_id}
        print(json.dumps(json_msg))
        for key in aio_task_map:
            aio_task_map[key].cancel()
    finally:
        await ws.close()
    return

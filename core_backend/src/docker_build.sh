#!/bin/bash

# auther: tcneko <tcneko@outlook.com>
# start from: 2021.10
# last test environment: ubuntu 20.04
# description:

export PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

export DEBIAN_FRONTEND=noninteractive

# variables
d_src="/src"
d_global_scan_core="/opt/global_scan_core"

# function
ins_from_apt() {
  apt-get update
  apt-get install -y --no-install-recommends python3 python3-pip
}

ins_from_pip() {
  python3 -m pip --no-cache-dir install aiohttp ipaddress fastapi pydantic apscheduler uvicorn[standard]
}

ins_global_scan_core() {
  mkdir -p /opt/global_scan_core
  cp ${d_src}/global_scan_core.py ${d_global_scan_core}/global_scan_core.py
}

clean() {
  apt-get -y autoremove
  apt-get clean
  rm -rf /root/.bash_history
  rm -rf ${d_src}
}

main() {
  ins_from_apt
  ins_from_pip
  ins_global_scan_core
  clean
}

# main
main

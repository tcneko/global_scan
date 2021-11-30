## Global Scan

Scan your entire network in real time from different agents all over the world.



### How to use

#### Before you start

You need at least two servers, one of which serves as the core and all other servers as agents. Please ensure that there is good network quality between the agent and the core.



#### Installation and running steps for core server

##### Run docker container for global scan

* Build the backend docker image

```bash
git clone https://github.com/tcneko/global_scan.git
cd global_scan/core_backend
docker build -t global_scan_core_backend:1.0.0 .
```

* Run the backend docker container

```bash
docker run \
--name=global_scan_core \
-e TZ=${time_zone} \
-e PYTHONUNBUFFERED=1 \
-e GLOBAL_SCAN_ENABLE_TLS=True \
--restart=always \
--network=host -d \
global_scan_core_backend:1.0.0 --host ${listen_addr} --port ${listen_port}
```

* Build the frontend docker image

```bash
cd global_scan/core_frontend
docker build -t global_scan_core_frontend:1.0.0 .
```

* Run the frontend docker container

```bash
docker run \
--name=global_scan_core_frontend \
-e TZ=${time_zone} \
-e PYTHONUNBUFFERED=1 \
-e GLOBAL_SCAN_ENABLE_TLS=True \
--restart=always \
--network=host -d \
global_scan_core_frontend:1.0.0 --host ${listen_addr} --port ${listen_port}
```



##### Run the web server for reverse proxy

* Create a web server configuration (the following is a sample configuration of Caddy )

``` bash
${domain_name} {
  reverse_proxy /ws/v1/* ${backend_listen_addr}:${backend_listen_port}
  reverse_proxy * ${frontend_listen_addr}:${frontend_listen_port}
}
```

* Run the web server



#### Installation and running steps for agent server

##### Run the docker container for global scan

* Build the docker image

```bash
git clone https://github.com/tcneko/global_scan.git
cd global_scan/agent_backend
docker build -t global_scan_agent:1.0.0 .
```

* Run the docker container

```bash
docker run \
--name=global_scan_agent \
-e TZ=${time_zone} \
-e PYTHONUNBUFFERED=1 \
-e GLOBAL_SCAN_AGENT_ALIAS=${agent_alias} \
-e GLOBAL_SCAN_AGENT_HOSTNAME=${agent_hostname} \
-e GLOBAL_SCAN_AGENT_PORT=${agent_port} \
-e GLOBAL_SCAN_CORE_HOSTNAME=${core_hostname} \
-e GLOBAL_SCAN_CORE_PORT=${core_port} \
-e GLOBAL_SCAN_ENABLE_TLS=True \
--restart=always \
--network=host -d \
global_scan_agent:1.0.0 --host ${listen_addr} --port ${listen_port}
```



##### Run the web server for reverse proxy

* Create a web server configuration (the following is a sample configuration of Caddy )

``` bash
${domain_name} {
  reverse_proxy /ws/v1/* ${listen_addr}:${listen_port}
}
```

* Run the web server


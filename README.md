## Global Scan

Scan your entire network in real time from different agents all over the world.



### How to use

#### Before you start

You need at least two servers, one of which serves as the core and all other servers as agents. Please ensure that there is good network quality between the agent and the core.



#### Installation and running steps for core server

##### Run docker container for global scan

* Build a docker image

```bash
git clone https://github.com/tcneko/global_scan.git
cd global_scan/core_backend
docker build -t global_scan_core:1.0.0 .
```

* Run the docker container

```bash
docker run \
--name=global_scan_core \
-w /opt/global_scan_core \
-e TZ=${time_zone} \
-e PYTHONUNBUFFERED=1 \
-e GLOBAL_SCAN_ENABLE_TLS=True \
--restart=always \
--network=host -d \
global_scan_core:1.0.0 --host ${listen_addr} --port ${listen_port}
```



##### Run web server for reverse proxy

* Compile the JavaScript source code

```bash
cd global_scan/core_frontend
npm install babel-cli@6 babel-preset-react-app@3
npx babel src --out-dir . --presets @babel/preset-react
```

* Create a web root directory

``` bash
cp global_scan.html global_scan.js /path/to/web_root
cp path/to/favicon.ico path/to/logo.png /path/to/web_root
```

* Create a web server configuration (the following is a sample configuration of Caddy )

```bash
${domain_name} {
  reverse_proxy /api/v1/* ${listen_addr}:${listen_port}
  reverse_proxy /ws/v1/* ${listen_addr}:${listen_port}
  file_server * {
    root /path/to/web_root
    index global_scan.html
  }
}
```

* Run the web server



#### Installation and running steps for agent server

##### Run docker container for global scan

* Build docker image

```bash
git clone https://github.com/tcneko/global_scan.git
cd global_scan/agent_backend
docker build -t global_scan_agent:1.0.0 .
```

* Run the docker container

```bash
docker run \
--name=global_scan_agent \
-w /opt/global_scan_agent \
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



##### Run web server for reverse proxy

* Create a web server configuration (the following is a sample configuration of Caddy )

``` bash
${domain_name} {
  reverse_proxy /ws/v1/* ${listen_addr}:${listen_port}
}
```

* Run the web server


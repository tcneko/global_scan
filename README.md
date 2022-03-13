## Global Scan

Scan your entire network in real time from different agents all over the world.



### How to use

#### Before you start

You need at least two servers, one of which serves as the core and all other servers as agents. Please ensure that there is good network quality between the agent and the core.



#### Installation and running steps for core server

##### Run the docker container for global scan

* Build the backend docker image

```bash
git clone https://github.com/tcneko/global_scan.git
cd global_scan/core_backend
docker build -t global_scan_core_backend:1.0.0 .
```

* Run the backend docker container

```bash
cd global_scan/core_backend
cp docker-compose.yaml.j2 docker-compose.yaml
vim docker-compose.yaml
docker-compose up -d
```

* Build the frontend docker image

```bash
cd global_scan/core_frontend

cd etc/caddy
cp Caddyfile.j2 Caddyfile
vim Caddyfile

cd ../..
mkdir static
cd static
touch favicon.ico
touch logo.png

cd ..
docker build -t global_scan_core_frontend:1.0.0 .
```

* Run the frontend docker container

```bash
cd global_scan/core_frontend
cp docker-compose.yaml.j2 docker-compose.yaml
vim docker-compose.yaml
docker-compose up -d
```



##### Run the web server for reverse proxy

* Create a web server configuration (the following is a sample configuration of Caddy )

``` bash
${core_hostname}:${core_port} {{
  reverse_proxy /api/v1/* ${core_backend_listen_addr}:${core_backend_listen_port}
  reverse_proxy /ws/v1/* ${core_backend_listen_addr}:${core_backend_listen_port}
  reverse_proxy * ${core_frontend_listen_addr}:${core_frontend_listen_port}
}
```

* Run the web server



#### Installation and running steps for agent server

##### Run the docker container for global scan

* Build the docker image

```bash
git clone https://github.com/tcneko/global_scan.git
cd global_scan/agent_backend
docker build -t global_scan_agent_backend:1.0.0 .
```

* Run the docker container

```bash
cd global_scan/agent_backend
cp docker-compose.yaml.j2 docker-compose.yaml
vim docker-compose.yaml
docker-compose up -d
```



##### Run the web server for reverse proxy

* Create a web server configuration (the following is a sample configuration of Caddy )

``` bash
${agent_hostname}:{$agent_port} {
  reverse_proxy /ws/v1/* ${agent_backend_listen_addr}:${agent_backend_listen_port}
}
```

* Run the web server


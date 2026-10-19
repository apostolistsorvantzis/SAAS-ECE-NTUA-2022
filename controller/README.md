# SAAS Controller

## Description
---

This command line tool allows users to control the SAAS microservices and docker containers.

## Installation
---

In order to install the SAAS controller globally, `cd` in the controller directory and run:

`npm i -g`

This will make the `saasc` command availale in every terminal.

## Usage
---

- `saasc list`: Lists all services and their status.
- `saasc start <service>`: Starts a service.
- `saasc stop <service>`: Stops a service.
- `saasc start all`: Starts all services.
- `saasc stop all`: Stops all services.

The name of the `<service>` parameter can be found in the output of the `saasc list` command.

Here is a short description for each:

- `atl`: The Actual Total Load microservice. Connects with the database and exposes an API for CRUD operations on the atl data.
- `cbf`: The Cross Border Flows microservice. Connects with the database and exposes an API for CRUD operations on the cbf data.
- `gpt`: The Aggregate Generation Per Type microservice. Connects with the database and exposes an API for CRUD operations on the gpt data.
- `auth`: The Authentication microservice. Connects with the database and handles login, register, subscribe operations with GoogleAuth and JWT.
- `frontend`: The frontend. This is exposed on port 8080 during development but should be built and served statically on production (possibly on 443 with HTTPS).
-  `kafka`: The Kafka/Zookeeper docker container. It uses `docker-compose` to build the 2 containers. When the stop command is issued, the containers are deleted.
- `sftp`: The SFTP docker container. It uses a simple `docker run` command to build the container from the `atmoz/sftp` image with several defaults. As with Kafka, when you issue the stop command the container is deleted and rebuilt on the next start.
- `kafkac`: This is the Kafka Consumer microservice. It listens on the kafka topics, consumes the messages and forwards them to the corresponding database microservices. 
- `atlp`: The Actual Total Load Producer microservice. It produces messages to the atl topic.
- `cbfp`: The Cross Border Flows Producer microservice. It produces messages to the cbf topic.
- `gptp`: The Aggregate Generation Per Type Producer microservice. It produces messages to the gpt topic.

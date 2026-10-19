# KAFKA MICROSERVICE

## Description

This is the Kafka cluster microservice.

## Ports

Kafka: 9092
Zookeeper: 2181

## Instructions

To install it, run: `docker-compose -f docker-compose.yml up -d`

To connect to the Kafka cluster's shell: `docker exec -it kafka /bin/bash`

Shell scripts are located in: `/opt/kafka_<version>/bin`

To create a topic: `kafka-topics.sh --create --topic <topic> --partitions <partitions> --replication-factor <replication-factor> --zookeeper zookeeper:2181`

For our testing purposes, we will use the following topics:

- `atl-topic`
- `ff-topic`
- `agpt-topic`
  and we will keep replication-factor and partitions to 1.

We will be using 3 microservices to produce messages to the corresponding kafka topics:

- `atl-producer`
- `ff-producer`
- `agpt-producer`

and 1 microservice that will be consuming the messages from the kafka topics and handle communication
with the db microservices.

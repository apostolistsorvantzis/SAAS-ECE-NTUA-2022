const { Kafka } = require("kafkajs");
const axios = require("axios");

const kafka = new Kafka({
  clientId: "consumer",
  brokers: ["localhost:9092"]
});

const kafkaAdmin = kafka.admin();

async function run() {
  await kafkaAdmin.connect();
  await kafkaAdmin.createTopics({
    waitForLeaders: true,
    topics: [
      { topic: 'atl-topic' },
      { topic: 'ff-topic' },
      { topic: 'agpt-topic' },
    ]
  });
  await kafkaAdmin.disconnect();

  // Login in msauth service and store jwt
  const jwt = await getJWT().catch(error => {
    console.error(error);
  });

  const consumer = kafka.consumer({ groupId: "consumer" });
  await consumer.connect();
  await consumer.subscribe({ topic: "atl-topic", fromBeginning: false });
  await consumer.subscribe({ topic: "ff-topic", fromBeginning: false });
  await consumer.subscribe({ topic: "agpt-topic", fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const payload = JSON.parse(message.value.toString());
      switch (topic) {
        case "atl-topic":
        if (payload.hasOwnProperty("diff") && payload.diff.length > 0) {
          processATL(jwt, payload.diff);
        }
        break;
        case "ff-topic":
          if (payload.hasOwnProperty("diff") && payload.diff.length > 0) {
            processCBF(jwt, payload.diff);
          }
        break;
        case "agpt-topic":
          if (payload.hasOwnProperty("diff") && payload.diff.length > 0) {
            processGPT(jwt, payload.diff);
          }
        break;
      }
    }
  });
  
}

function getJWT() {
  return new Promise((resolve, reject) => {
    const baseURL = "http://localhost:3333";
    const registerURL = baseURL + "/auth/signup";
    const loginURL = baseURL + "/auth/signin";
    const email = "kafka@minitsios.com";
    const password = "kafka";

    // First we try to register a new user
    axios.post(registerURL, {
      email,
      password
    }).then(response => {
      resolve(response.data.access_token);
    }).catch(error => {
      // If we get an error, we try to login
      axios.post(loginURL, {
        email,
        password
      }).then(response => {
        resolve(response.data.access_token);
      }).catch(error => {
        // This means that there is an actual error
        // so we reject the promise (both register
        // and login failed)
        reject(error);
      });
    });

  });
}

function processATL(jwt, diff) {
  return new Promise((resolve, reject) => {
    const baseURL = "http://localhost:3320/api/v1/kafka";
    axios.post(baseURL, {
      data: JSON.stringify(diff)
    }, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });
  });
}
function processCBF(jwt, diff) {
  return new Promise((resolve, reject) => {
    const baseURL = "http://localhost:3321/api/v1/kafka";
    axios.post(baseURL, {
      data: JSON.stringify(diff)
    }, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });
  });
}
function processGPT(jwt, diff) {
  return new Promise((resolve, reject) => {
    const baseURL = "http://localhost:3322/api/v1/kafka";
    axios.post(baseURL, {
      data: JSON.stringify(diff)
    }, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });
  });
}

run();
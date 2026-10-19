const sftpMonitor = require("sftpmonitor");
const { Kafka } = require("kafkajs");
const fs = require("fs")

const fastcsvdiff = require("./fastcsvdiff");

const kafka = new Kafka({
  clientId: "msCBFproducer",
  brokers: ["localhost:9092"]
});

const producer = kafka.producer();

const config = {
  host: "localhost",
  username: "foo",
  password: "pass",
  path: "upload/ff",
  port: 22,
  heartbeat: 1000,
  debugMode: false,
};

async function run() {
  await producer.connect();
  
  const event = await sftpMonitor(config); // epistrofi apo promise tou sftpmonitor
  
  event.on("create", async () => {
    const files = await getFiles();
    let diff = files.new
    if (files.old != false){
      diff = await fastcsvdiff(files.new, files.old);
    }
    else {
      let difftext = fs.readFileSync('./' + files.new , { encoding:'ascii' })
      diff = difftext.split(/\r?\n/g);
      diff.shift();
    }

    // After we have taken the diff, we can safely delete the local files
    try {
      if (files.old) fs.unlink('./' + files.old);
      if (files.new) fs.unlink('./' + files.new);
    } catch(e) {}

    const payload = {
      type: 'create',
      files: files,
      diff,
      path: config.path
    };
    producer.send({
      topic: "ff-topic",
      messages: [
        {
          value: JSON.stringify(payload)
        }
      ]
    });
  });
}

async function getFiles() {
  return new Promise((resolve, reject) => {
    let Client = require('ssh2-sftp-client');
    let sftp = new Client();
    
    sftp.connect({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password
    }).then(() => {
      return sftp.list(config.path);
    }).then(data => {
      data.sort((a, b) => {
        return b.modifyTime - a.modifyTime;
      });
      const last2Files = data.slice(0, 2);
      // Download files
      if(last2Files.length > 1) {
        sftp.get(config.path + '/' + last2Files[0].name, './' + last2Files[0].name ).then(() => {
          sftp.get(config.path + '/' + last2Files[1].name, './' + last2Files[1].name ).then(() => {
          
            sftp.end();
            resolve({
              old: last2Files[1].name,
              new: last2Files[0].name
            });
          });
        });
      }
      else {
        sftp.get(config.path + '/' + last2Files[0].name, './' + last2Files[0].name ).then(() => {
        sftp.end();
        resolve({
          old: false,
          new: last2Files[0].name
        });
      });
      }

    }).catch(err => {
      console.log(err, 'catch error');
    });
  });
}

run();
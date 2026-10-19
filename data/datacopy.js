const CronJob = require("cron").CronJob;
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'first_day');


function getItems() {
  const items = {};
  
  subdirs = fs.readdirSync(dir);
  for (let i = 0; i < subdirs.length; i++) {
    if (!items[subdirs[i]]) {
      items[subdirs[i]] = [];
    }
    const subdirPath = path.join(dir, subdirs[i]);
    const files = fs.readdirSync(subdirPath);
    for (let j = 0; j < files.length; j++) {
      items[subdirs[i]].push(files[j]);
    }
  }
  return items;
}

function connect() {
  let Client = require("ssh2-sftp-client");
  let sftp = new Client();
  return new Promise((resolve, reject) => {
    sftp
      .connect({
        host: "localhost",
        port: "22",
        username: "foo",
        password: "pass",
      })
      .then(() => {
        resolve(sftp);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function disconnect(sftp) {
  return new Promise((resolve, reject) => {
    sftp
      .end()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function upload(sftp, file, subdir) {
  return new Promise((resolve, reject) => {
    sftp
      .put(`${dir}/${subdir}/${file}`, `/upload/${subdir}/${file}`)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

async function init () {
  const items = getItems();
  console.log('Establishing connection with sFTP server...');
  const sftp = await connect();
  console.log('Connection established.');
  const sftpJob = new CronJob("*/2 * * * * *", async () => {
    // Upload the first file from each subdir and remove it from the array
    for (let subdir in items) {
      if (items[subdir].length > 0) {
        console.log(`Uploading ${items[subdir][0]} to ${subdir}`);
        const file = items[subdir].shift();
        await upload(sftp, file, subdir);
      } else {
        console.log(`No files left`);
        console.log('Closing connection with sFTP server...');
        await disconnect(sftp);
        console.log('Connection closed.');
        console.log('Stopping cron job...');
        sftpJob.stop();
      }
    }
  });
  sftpJob.start();
}

init();
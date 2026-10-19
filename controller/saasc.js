#! /usr/bin/env node

require('dotenv').config();

const path = require('path');
global.appRoot = path.resolve(__dirname + '/../');

const ps = require('ps-node');

const { program } = require('commander');

const spawn = require('child_process').spawn;

// Use terminate in order to make sure that the process is killed
// and no zombies are created
const terminate = require('terminate');

const colors = require('colors');

const running = colors.green('| ✓ | Running!');
const notRunning = colors.red('| ✗ | Not running!');

program
.name('SaaS Controller')
.description('CLI to control Microservices, Kafka and Docker')
.version('0.1.0');

program
.command('start')
.description('Start a part of the system')
.argument('<service>')
.action(async (service) => {
  console.log(`Starting ${service}`);
  switch (service) {
    case 'atl':
    startProcess(appRoot + '/ATLmicroservice');
    break;
    case 'cbf':
    startProcess(appRoot + '/CBFmicroservice');
    break;
    case 'gpt':
    startProcess(appRoot + '/GPTmicroservice');
    break;
    case 'auth':
    startProcess(appRoot + '/msauth');
    break;
    case 'frontend':
    startProcess(appRoot + '/frontend');
    break;
    case 'kafka':
    startProcess(appRoot + '/mskafka');
    break;
    case 'sftp':
    startProcess(appRoot + '/msftp');
    break;
    case 'atlp':
    startProcess(appRoot + '/msATLproducer');
    break;
    case 'cbfp':
    startProcess(appRoot + '/msCBFproducer');
    break;
    case 'gptp':
    startProcess(appRoot + '/msGPTproducer');
    break;
    case 'kafkac':
    startProcess(appRoot + '/msKAFKAconsumer');
    break;
    case 'all':
    await startProcess(appRoot + '/mskafka');
    await startProcess(appRoot + '/msftp');
    await startProcess(appRoot + '/ATLmicroservice');
    await startProcess(appRoot + '/CBFmicroservice');
    await startProcess(appRoot + '/GPTmicroservice');
    await startProcess(appRoot + '/msauth');
    await startProcess(appRoot + '/frontend');
    
    // Wait for Kafka and SFTP to start
    await new Promise((resolve, reject) => {
      const kafkaPort = process.env.PORT_KAFKA;
      const sftpPort = process.env.PORT_SFTP;
      const interval = setInterval(async () => {
        const isKafkaRunning = await portInUse(kafkaPort);
        const isSftpRunning = await portInUse(sftpPort);
        if (isKafkaRunning && isSftpRunning) {
          clearInterval(interval);
          resolve();
        }
      }, 2000);
    });
    await startProcess(appRoot + '/msKAFKAconsumer');
    
    // Wait for 5 seconds for the consumer to start
    await new Promise((resolve, reject) => {
      console.log('Waiting for 5 seconds for the consumer to connect to Kafka and create topics...');
      setTimeout(() => {
        resolve();
      }, 5000);
    });
    
    await startProcess(appRoot + '/msATLproducer');
    await startProcess(appRoot + '/msCBFproducer');
    await startProcess(appRoot + '/msGPTproducer');
    
    break;
    default:
    console.log('Unknown service');
  }
});

function startProcess(chdir) {
  return new Promise((resolve, reject) => {
    process.chdir(chdir);
    let cmd;
    if (chdir.includes('msauth') || chdir.includes('frontend')) {
      console.log('Installing packages in ' + chdir);
      cmd = spawn('yarn', ['install']);
      cmd.on('close', () => {
        console.log('Finished installing packages for ' + chdir + '. Starting process...');
        if (chdir.includes('msauth')) {
          spawn('yarn', ['run', 'start:dev'], { stdio: 'ignore', detached: true }).unref();
          resolve();
        } else {
          spawn('yarn', ['run', 'serve'], { stdio: 'ignore', detached: true }).unref();
          resolve();
        }
      });
    } else {
      console.log('Installing packages in ' + chdir);
      cmd = spawn('npm', ['install']);
      cmd.on('close', () => {
        console.log('Finished installing packages for ' + chdir + '. Starting process...');
        spawn('npm', ['run', 'prod'], { stdio: 'ignore', detached: true }).unref();
        resolve();
      });
    }
  });
}

program
.command('stop')
.description('Stop a part of the system')
.argument('<service>')
.action((service) => {
  console.log(`Stopping ${service}`);
  switch(service) {
    case 'atl':
    killNodeProcess('atl');
    break;
    case 'cbf':
    killNodeProcess('cbf');
    break;
    case 'gpt':
    killNodeProcess('gpt');
    break;
    case 'msauth':
    case 'auth':
    killNodeProcess('msauth');
    break;
    case 'frontend':
    killNodeProcess('frontend');
    break;
    case 'kafka':
    const kafka = spawn('docker', ['rm', '-f', 'kafka']);
    kafka.on('close', (code) => {
      console.log(`Kafka container removed with code ${code}`);
    });
    const zookeeper = spawn('docker', ['rm', '-f', 'zookeeper']);
    zookeeper.on('close', (code) => {
      console.log(`Zookeeper container removed with code ${code}`);
    });
    break;
    case 'sftp':
    // Execute the "docker rm -f sftp" command using spawn
    const sftp = spawn('docker', ['rm', '-f', 'sftp']);
    sftp.on('close' , (code) => {
      console.log(`SFTP container removed with code ${code}`);
    });
    break;
    case 'kafkac':
    killNodeProcess('kafkac');
    break;
    case 'atlp':
    killNodeProcess('atlp');
    break;
    case 'cbfp':
    killNodeProcess('cbfp');
    break;
    case 'gptp':
    killNodeProcess('gptp');
    break;
    case 'all':
    killNodeProcess('atl');
    killNodeProcess('cbf');
    killNodeProcess('gpt');
    killNodeProcess('msauth');
    killNodeProcess('frontend');
    killNodeProcess('kafkac');
    killNodeProcess('atlp');
    killNodeProcess('cbfp');
    killNodeProcess('gptp');
    const kafkaa = spawn('docker', ['rm', '-f', 'kafka']);
    kafkaa.on('close', (code) => {
      console.log(`Kafka container removed with code ${code}`);
    });
    const zookeepera = spawn('docker', ['rm', '-f', 'zookeeper']);
    zookeepera.on('close', (code) => {
      console.log(`Zookeeper container removed with code ${code}`);
    });
    const sftpa = spawn('docker', ['rm', '-f', 'sftp']);
    sftpa.on('close' , (code) => {
      console.log(`SFTP container removed with code ${code}`);
    });
    cleanup();
    break;
    default:
    console.log('Unknown service');
  }
});

program
.command('ftp')
.description('Handle common FTP tasks')
.argument('<action>')
.action((action) => {
  switch(action) {
    case 'cleanup':
    ftpCleanup();
    break;
    default:
    console.log('Unknown action');
  }
});

program
.command('csv')
.description('Handle common CSV tasks')
.argument('<action>')
.action((action) => {
  switch(action) {
    case 'cleanup':
    csvCleanup();
    break;
    default:
    console.log('Unknown action');
  }
});

program
.command('list')
.description('List all services of the system')
.action(async () => {
  const psResult = await runPS();
  console.log(colors.blue('kafka    : ') + (await portInUse(process.env.PORT_KAFKA) ? running : notRunning));
  console.log(colors.blue('sftp     : ') + (await portInUse(process.env.PORT_SFTP) ? running : notRunning));
  console.log(colors.blue('atl      : ') + (findByName(psResult, 'atl.js') ? running : notRunning));
  console.log(colors.blue('cbf      : ') + (findByName(psResult, 'cbf.js') ? running : notRunning));
  console.log(colors.blue('gpt      : ') + (findByName(psResult, 'gpt.js') ? running : notRunning));
  console.log(colors.blue('auth     : ') + (findByName(psResult, 'nest.js') ? running : notRunning));
  console.log(colors.blue('frontend : ') + (findByName(psResult, 'vue-cli-service') ? running : notRunning));
  console.log(colors.blue('kafkac   : ') + (findByName(psResult, 'kafkac') ? running : notRunning));
  console.log(colors.blue('atlp     : ') + (findByName(psResult, 'atlp') ? running : notRunning));
  console.log(colors.blue('cbfp     : ') + (findByName(psResult, 'cbfp') ? running : notRunning));
  console.log(colors.blue('gptp     : ') + (findByName(psResult, 'gptp') ? running : notRunning));
});

program
.command('debug')
.description('Debug common issues')
.action(async () => {
  return new Promise((resolve, reject) => {
    ps.lookup({
      command: 'node'
    }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        let resolveResult = false;
        result.forEach((process) => {
          console.log(process);
        });
        resolve(resolveResult);
      }
    });
  });
})

function cleanup() {
  console.log('Cleaning up...');
  killByPort(process.env.PORT_ATL);
  killByPort(process.env.PORT_CBF);
  killByPort(process.env.PORT_GPT);
}

function killByPort(port) {
  const proc = spawn('lsof', ['-t', '-i:' + port]);
  let pid = '';
  proc.stdout.on('data', (data) => {
    pid += data.toString();
  });
  proc.on('close', () => {
    spawn('kill', ['-9', pid.trim()]);
  });
}

function runPS() {
  return new Promise((resolve, reject) => {
    ps.lookup({
      command: 'node'
    }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const arguments = [];
        result.forEach((process) => {
          for (let i = 0; i < process.arguments.length; i++) {
            arguments.push(process.arguments[i]);
          }
        });
        resolve(arguments.join("\n"));
      }
    });
  }); 
}

function findByName(psResult, name) {
  return psResult.indexOf(name) !== -1;
}

function killNodeProcess(name) {
  ps.lookup({
    command: 'node',
  }, function(err, resultList ) {
    if (err) {
      throw new Error( err );
    }
    resultList.forEach(function(process) {
      if (process) {
        let nameCheck;
        if (name === 'msauth' || name === 'frontend') {
          nameCheck = (process.arguments.length > 0 && process.arguments[0].includes(name));
        } else {
          nameCheck = (process.arguments.length > 0 && process.arguments[0].includes(name + '.js'));
        }
        // If the process.arguments array contains the string _name_ we kill it      
        if (nameCheck) {
          console.log(`Killing process with pid: ${process.pid} (name: ${name})...`);
          terminate(process.pid, function (err) {
            if (err) { // you will get an error if you did not supply a valid process.pid
              console.log('Oopsy:', err); // handle errors in your preferred way.
            }
            else {
              console.log('Killed!'); // terminating the Processes succeeded.
              // NOTE: The above won't be run in this example as the process itself will be killed before.
            }
          });
        }
      }
    });
  });
}

function portInUse(port) {
  return new Promise((resolve, reject) => {
    const net = require('net');
    const server = net.createServer();
    // console.log('i am in')
    // console.log(port)
    server.once('error', function(err) {
      // console.error(err);
      if (err.code === 'EADDRINUSE') {
        // console.log('address in use')
        resolve(true);
      } else if (err.code === 'EACCES' && parseInt(port) === 22) {
        // Permission problem means that we are in the SFTP case
        // We will try to connect to SFTP differently
        const { Client } = require('ssh2');
        const conn = new Client();
        conn.on('ready', function() {
          console.log('connection ready!')
          conn.end();
          resolve(true);
        }).on('error', function(err) {
          console.log('here')
          resolve(false);
        })
        .connect({
          host: 'localhost',
          port: 22,
          username: 'foo',
          password: 'pass',
        });
      }
    });
    
    server.once('listening', function() {
      // console.log('server listerning')
      server.close();
      resolve(false);
    });
    
    server.listen(port);
  });
}

async function csvCleanup() {
  const fs = require('fs');
  console.log('Cleaning up CSV files...');
  let files;
  files = fs.readdirSync('../msATLproducer');
  files.forEach((file) => {
    if (file.includes('.csv')) {
      fs.unlinkSync('../msATLproducer/' + file);
    }
  });
  files = fs.readdirSync('../msCBFproducer');
  files.forEach((file) => {
    if (file.includes('.csv')) {
      fs.unlinkSync('../msCBFproducer/' + file);
    }
  });
  files = fs.readdirSync('../msGPTproducer');
  files.forEach((file) => {
    if (file.includes('.csv')) {
      fs.unlinkSync('../msGPTproducer/' + file);
    }
  });
}

async function ftpCleanup() {
  const sftp = await connect();
  // Delete remote directories recursively and recreate them
  console.log("Delete remote directories...");
  await sftp.rmdir('/upload/agpt/', true);
  await sftp.rmdir('/upload/ff/', true);
  await sftp.rmdir('/upload/atl/', true);
  console.log("DONE!");
  console.log("Create remote directories...");
  await sftp.mkdir('/upload/agpt/');
  await sftp.mkdir('/upload/ff/');
  await sftp.mkdir('/upload/atl/');
  console.log("DONE!");
  console.log("Ending sftp connection...");
  await disconnect(sftp);
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

program.parse();


const spawn = require('child_process').spawn;

// Execute command `docker-compose -f docker-compose.yml up -d`
spawn('docker-compose', ['-f', 'docker-compose.yml', 'up', '-d'], { stdio: 'ignore', detached: true }).unref();
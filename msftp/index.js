const spawn = require('child_process').spawn;

// Execute the command `docker run --name sftp -p 22:22 -d atmoz/sftp foo:pass:::upload,upload/atl,upload/ff,upload/agpt`
spawn('docker', 
    [
        'run', 
        '--name', 
        'sftp', 
        '-p', 
        '22:22', 
        '-d', 
        'atmoz/sftp', 
        'foo:pass:::upload,upload/atl,upload/ff,upload/agpt'
    ], 
    { 
        stdio: 'ignore', 
        detached: true 
    }
    ).unref();
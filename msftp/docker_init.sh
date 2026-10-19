#!/bin/bash
docker run --name sftp -p 22:22 -d atmoz/sftp foo:pass:::upload,upload/atl,upload/ff,upload/agpt
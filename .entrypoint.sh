#!/bin/bash
sed -i "s|http://localhost:8000|$CACAO_BACKEND_URL|g" /output/build/app.js
echo "This container is complete, please serve the files from a static file server container. They have been build in /output/"

#!/bin/bash

sed -i "s|http://localhost:8000|$CACAO_BACKEND_URL|g" /var/www/html/build/app.js
nginx -g "daemon off;"

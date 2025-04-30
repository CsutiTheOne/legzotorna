#!/bin/bash

cd /root/legzotorna
export PORT=3000
export IP="127.0.0.1"
export DBURL="mongodb://localhost"

npm start

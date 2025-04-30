#!/bin/bash

cd /root/legzotorna

sleep 300

export PORT=8080
export S_PORT=8443
export IP="127.0.0.1"
export DBURL="mongodb+srv://heroku:wo6h1FcX9NTOqgGS@acluster-k0fqa.mongodb.net/<dbname>?retryWrites=true&w=majority"
export MAILPASS="madbhsoymkfwkyss"
export MAILSERV="Gmail"
export MAILUSER="websiteservicemail@gmail.com"

npm start

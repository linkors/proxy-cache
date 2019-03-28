#!/bin/bash

if which node > /dev/null
    then
        echo Node JS already installed ...
    else
        echo Installing nodejs ...
        curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
echo Downloading poject files ...
curl https://github.com/linkors/proxy-cache/archive/master.zip -LO
sudo apt-get install zip unzip
unzip master.zip -d ./proxy-cache

echo Installing project dependencies ...
cd proxy-cache/proxy-cache-master
npm install
./node_modules/.bin/anyproxy-ca

echo Opening project folder ...
nautilus --browser .

echo You are ready to go, please follow the next steps to setup proxy-cache
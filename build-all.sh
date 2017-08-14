#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: ./build-all.sh PLUGIN_VERSION"
  exit
fi;


for KIBANA_VERSION in 5.4.0 5.4.1 5.4.2 5.4.3 5.5.0 5.5.1
do
  ./build.sh ${KIBANA_VERSION} $1
done

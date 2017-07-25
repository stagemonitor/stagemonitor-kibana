#!/usr/bin/env bash

echo "building archive ..."

BASEDIR=$(dirname "$0")
rm -rf /tmp/kibana
rm /tmp/stagemonitor-kibana.zip

mkdir /tmp/kibana
cp -r "$BASEDIR" /tmp/kibana/stagemonitor-kibana

cd /tmp
zip -r stagemonitor-kibana.zip kibana

echo ""
echo "The built archive is here: /tmp/stagemonitor-kibana.zip"
echo "Install it in kibana with:"
echo "\$KIBANA_DIR/bin/kibana-plugin install /tmp/stagemonitor-kibana.zip"

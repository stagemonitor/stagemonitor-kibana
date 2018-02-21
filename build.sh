#!/usr/bin/env bash

set -o errexit
set -o nounset

echo "building archive ..."

if [ -z "${1-}" ] || [ -z "${2-}" ]; then
  echo "Usage: ./build.sh KIBANA_VERSION PLUGIN_VERSION"
  exit
else
  VERSION_KIBANA="$1"
  VERSION_PLUGIN="$2"
  ARRAY_VERSION_KIBANA=(${VERSION_KIBANA//./ })
fi;

FILENAME=/tmp/stagemonitor-kibana-${VERSION_PLUGIN}-${VERSION_KIBANA}.zip

echo "building archive for $VERSION_KIBANA ..."

BASEDIR=$(dirname "$0")
rm -rf /tmp/kibana &> /dev/null || true
rm $FILENAME &> /dev/null || true

mkdir /tmp/kibana
cp -r "$BASEDIR" /tmp/kibana/stagemonitor-kibana

if [ ${ARRAY_VERSION_KIBANA[0]} -ge 6 ]; then
  echo "use Kibana 6 template"
  sed "s/@@VERSION@@/$VERSION_KIBANA/g" /tmp/kibana/stagemonitor-kibana/package.json.template6 > /tmp/kibana/stagemonitor-kibana/package.json
else
  echo "use Kibana 5 template"
  sed "s/@@VERSION@@/$VERSION_KIBANA/g" /tmp/kibana/stagemonitor-kibana/package.json.template > /tmp/kibana/stagemonitor-kibana/package.json
fi;

# clean unneeded data
rm -rf /tmp/kibana/stagemonitor-kibana/.git
rm -rf /tmp/kibana/stagemonitor-kibana/tests
rm -rf /tmp/kibana/stagemonitor-kibana/package.json.template*

cd /tmp
zip -r $FILENAME kibana > /dev/null

echo ""
echo "The built archive is here: $FILENAME"
echo "Install it in kibana with:"
echo ""
echo "\$KIBANA_DIR/bin/kibana-plugin install file://$FILENAME"

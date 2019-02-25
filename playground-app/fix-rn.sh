#!/bin/bash
echo "Fixing React Native third party folder..."
rm -rf ~/.rncache
WD=$(pwd)
cd node_modules/react-native
rm -fr third-party
"$WD/node_modules/react-native/scripts/ios-install-third-party.sh"

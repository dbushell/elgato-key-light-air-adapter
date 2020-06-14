#!/bin/bash -e

# Package

rm -rf node_modules
shasum --algorithm 256 manifest.json package.json *.js LICENSE README.md > SHA256SUMS
TARFILE=`npm pack`
shasum --algorithm 256 ${TARFILE} > ${TARFILE}.sha256sum
rm -rf SHA256SUMS package

# Local install

rm -rf ~/webthings-addons/package
rm -rf ~/webthings-addons/elgato-key-light-air-adapter
tar -zxf ${TARFILE} --directory ~/webthings-addons
mv ~/webthings-addons/package ~/webthings-addons/elgato-key-light-air-adapter
rm ${TARFILE}
rm ${TARFILE}.sha256sum

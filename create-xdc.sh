#!/bin/sh

PACKAGE_NAME="Sharer"

cp -r module dist

cd dist
zip -9 -r "../$PACKAGE_NAME.xdc" -- *

cp ../eruda.js eruda.js
zip -9 -r "../$PACKAGE_NAME-dev.xdc" -- *
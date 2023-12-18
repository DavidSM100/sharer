#!/bin/sh

PACKAGE_NAME="Sharer"

rm "$PACKAGE_NAME.xdc"

cd dist
zip -9 -r "../$PACKAGE_NAME.xdc" -- *
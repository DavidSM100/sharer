#!/bin/sh

NAME="Sharer"

rm $NAME.xdc
rm $NAME-dev.xdc

cd dist
zip -9 -r "../$NAME.xdc" -- *

mkdir node_modules
mkdir node_modules/eruda
cp ../node_modules/eruda/eruda.js node_modules/eruda

zip -9 -r "../$NAME-dev.xdc" -- *
rm -r node_modules
#!/bin/bash
cd /home/z/my-project
NODE_OPTIONS="--max-old-space-size=3072" exec node node_modules/.bin/next dev -p 3000


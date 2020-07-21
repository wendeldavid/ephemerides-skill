# !/bin/bash

rm alexa-skill.zip

rm -rf node_modules

npm install --only=prod

zip -q -r alexa-skill.zip *

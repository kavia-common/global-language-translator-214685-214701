#!/bin/bash
cd /home/kavia/workspace/code-generation/global-language-translator-214685-214701/translator_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


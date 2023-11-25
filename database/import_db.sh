#!/bin/bash

file_name="/docker-entrypoint-initdb.d/dfunk.sql.dontrunplease"

if [ -e "$file_name" ]; then
    pg_restore --no-owner -U postgres -d dfunkt -1 "$file_name"
else
    echo "File $file_name does not exist."
fi

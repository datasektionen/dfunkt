#!/bin/bash

# file_name="/docker-entrypoint-initdb.d/dfunk.sql.dontrunplease"
file_name="/docker-entrypoint-initdb.d/dfunkt"

if [ -e "$file_name" ]; then
    psql -U postgres -d dfunkt -f "$file_name"
else
    echo "File $file_name does not exist."
fi

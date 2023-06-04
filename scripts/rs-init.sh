#!/bin/bash

_config=\
'
{
    "_id": "rs0",
    "version": 1,
    "members": [
        {
            "_id": 1,
            "host": "mongo0:27017",
            "priority": 4
        },
        {
            "_id": 2,
            "host": "mongo1:27017",
            "priority": 2
        }
    ]
}
'

mongosh --quiet \
--host mongo0:27017 \
<<-EOF
    rs.initiate($_config, { force: true });
EOF

exec "$@"

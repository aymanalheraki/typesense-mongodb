#!/bin/bash
_config=\
'
{"_id": "rs0","version": 1,"members": [{"_id": 1,"host": "localhost:27017","priority": 4},{"_id": 2,"host": "localhost:27017","priority": 2}]}
'
mongosh --quiet \
--host localhost:27017 \
<<-EOF
    rs.initiate('{"_id": "rs0","version": 1,"members": [{"_id": 1,"host": "localhost:27017","priority": 4},{"_id": 2,"host": "localhost:27017","priority": 2}]}', { force: true });
EOF
exec "$@"

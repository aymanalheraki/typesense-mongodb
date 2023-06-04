FROM mongo:latest

# Will be set through Environment Files
ARG DATABASE_URI

ENV DATABASE_URI ${DATABASE_URI}

COPY Json_document.json /Json_document.json

CMD mongoimport --uri ${DATABASE_URI} --db falak --collection corpus --drop --file /Json_document.json
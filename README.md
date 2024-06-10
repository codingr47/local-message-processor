# local-message-processor

The following is a monorepo, based on lerna containing 6 modules

## Installation and Prequesities

1. Before installing the repo's dependencies, install postgres sql and make sure it is running.
2. Create a new Database inside the postgres sql server
3. Open the command line at the root of the repo and run the command `npm install`
4. Open the command line at the root of the repo and run the command `npm run bootstrap`
5. The .env file on the relative path `src\server\.env` needs to be set
6. The .env file on the relative path `src\message_processor\.env` needs to be set


### Setting the .env files

Replace the relevant information:

DB_HOST="<LOCAL_IP_ADDRESS>"

DB_USERNAME="<POSTGRES_USERNAME>"

DB_PASSWORD="<POSTGRES_PASSWORD>"

DB_NAME="<POSTGRES_DB_NAME>"

AUTH_SECRET="secret"

EVENTS_FILE="<FULL_PATH_TO_EVENTS_FILE>"


## Running the project

Open the command line at the root of the repo:

Running the server: `npm run server:dev`
Running the message processor script: `npm run process:dev`
Runnig the message processor as a service (runs forever): `npm run process:dev-forever`

### Running the tests

First test `npm run test:client-server`
Second test: `npm run test:client-server-processor`
Third test: `npm run test:client-server-processor-parallel`

## Packages
### Client

Located under `./src/client` 

This package contains an axios based client, which can communicate with the events server.

### Common

Located under `./src/common`

This package contains some functions that are used within other packages in this repo

### Interfaces

Located under `./src/interfaces`

This package contains shared interfaces between the client and services

### Server

Located under `./src/server`

A Nest.js based service  which handles all the requests from the client
its main goal is to digest events and make sure they reach an events file on the disk of the server.

### Message Processor

A script / service which populates events from a file on the server into the database
the script can run either as a "one hit wonder" or as a service running forever.
it will run as a service if the cli argument `--forver` is passed as `true`.

### Tests

Located under `./src/tests`

This package contains 3 end to end tests 
1. A test Demonstrates how the server can handle 30000 random event being sent through the api, and verifies the file on the server actually contains all the sent events
2. A test Demonstrates how the server can handle 5000 random events being send through the api. afterwards it runs the message processor script and verifies all the events were processed correctly and that the calculated revenue for each user is correct.
3. A test Demonstrates how the server can handle 15000 random events being send through the api. in parallel (different process) it runs the message processor script in "forever mode" and verifies all the events were processed correctly and that the calculated revenue for each user is correct.

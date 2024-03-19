# MetaCatalog Ingest

Upload application for the Metacatalog ecosystem. This application consists of three parts:

* `/backend`: A FastAPI uvicorn application that uses `metacatalog` to connect to the MetaCatalog Postgres database and basically manages the upload into the database
* `/frontend`: A Vite / React.js / Ant.Design frontend to guide the user through the upload process
* Docker: a `./Dockerfile` that build the frontend and starts uvicorn to serve the API (and the frontend), as well as a `docker-compose.yml` that starts a fresh Postgres along

## Install

It is recommended to run the application using [docker compose](https://docs.docker.com/compose/). Use the 
[docker-compose.yml](./docker-compose.yml) as a reference. Instead of building the ingest application locally, you can also 
replace the `frontend` service with something similar to:

```yaml
frontend:
  image: ghcr.io/hydrocode-de/metacatalog-ingest:latest
  ports:
    - 8000:8000
  
  ...
```

In case you use the Dockerfile only, make sure to provide a connection to the actual database using the environment variable `METACATALOG_URI`.


### Backend Url

With version v0.4.0 it is possible to change the backend url in the frontend, using the Settings page. These settings are also stored in the local storage of the browser, meaning they are persistent over sessions. This setting is necessary, if you
run the application on a different port, or behind a proxy server. 

### What it does not do:

* Currently, only CSV import of data is possible
* It does not provide any kind of authentication or authorization

Be aware that some fields are quite annoying and the validation is not perfect yet. This will be improved with the next few versions.
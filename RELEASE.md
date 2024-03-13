# MetaCatalog Ingest

Upload application for the Metacatalog ecosystem. This application consists of three parts:

* `/backend`: A FastAPI uvicorn application that uses `metacatalog` to connect to the MetaCatalog Postgres database and basically manages the upload into the database
* `/frontend`: A Vite / React.js / Ant.Design frontend to guide the user through the upload process
* Docker: a `./Dockerfile` that build the frontend and starts uvicorn to serve the API (and the frontend), as well as a `docker-compose.yml` that starts a fresh Postgres along

In case you use the Dockerfile only, make sure to provide a connection to the actual database using the environment variable `METACATALOG_URI`.

What it does not do:

* Currently, only CSV import of data is possible
* It does not provide any kind of authentication or authorization

Be aware that some fields are quite annoying and the validation is not perfect yet. This will be improved with the next few versions.
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# figure out the paths
BASE = Path(__file__).resolve().parent


app = FastAPI()

# Mount the static files directory
app.mount("/", StaticFiles(directory= BASE / 'static', html=True), name="static")


# some helper routes


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)

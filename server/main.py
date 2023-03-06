from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from deta import Deta
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_settings_db():
    return Deta().Base("settings")


def get_files_drive():
    return Deta().Drive("files")


class Settings(BaseModel):
    light: Optional[bool]
    sidebar: Optional[bool]


@app.get("/")
def index():
    return {"ok": True}


@app.get("/settings")
def get_settings():
    return get_settings_db().get("settings")


@app.put("/settings")
def update_settings(settings: Settings):
    return get_settings_db().put(
        {"light": settings.light, "sidebar": settings.sidebar}, "settings"
    )


@app.post("/light")
def toggle_light_mode():
    try:
        current = get_settings_db().get("settings")["light"]
    except:
        current = False
    return get_settings_db().put({"light": not current}, "settings")


@app.post("/sidebar")
def toggle_sidebar():
    try:
        current = get_settings_db().get("settings")["sidebar"]
    except:
        current = True
    return get_settings_db().put({"sidebar": not current}, "settings")

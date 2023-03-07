from typing import Optional
from fastapi import FastAPI, UploadFile, File
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


@app.get("/files")
def get_all_files():
    res = get_files_drive().list()
    all_files = res.get("names")
    paging = res.get("paging")
    last = paging.get("last") if paging else None

    while last:
        res = get_files_drive().list(last=last)
        all_files += res.get("names")
        paging = res.get("paging")
        last = paging.get("last") if paging else None

    return {"files": all_files}


@app.get("/file")
def get_file(name: str):
    file = get_files_drive().get(name)
    content = file.read()
    file.close()
    return {"content": content}


@app.post("/upload")
async def upload_file(file: UploadFile = File("test")):
    content = await file.read()
    filename = file.filename.split(".")[:-1]
    key = filename[0] if len(filename) == 0 else ".".join(filename)
    if not key:
        key = file.filename + ".txt"
    else:
        key += ".md"
    get_files_drive().put(key, content)
    return {"ok": True}

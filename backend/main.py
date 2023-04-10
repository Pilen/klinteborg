from typing import Any
import importlib
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from backend.config import config
from backend.database import dbpool

app = FastAPI(
    title = "FDF K19 - Vanløse: Klinteborg",
    description = "Et system til at holde styr på vores sommerlejr"
)
@app.on_event("startup")
def startup() -> None:
    dbpool.open()

@app.on_event("shutdown")
def shutdown() -> None:
    dbpool.close()

@app.middleware("http")
async def logging_middleware(request: Any, call_next: Any) -> Any:
    # print(">>>", str(request.url))
    response = await call_next(request)
    # print("<<<")
    return response

app.mount("/static", StaticFiles(directory=config.static_dir), name="static")

def register_api(module_name: str, prefix: str | None = None, tags: list[str] | None = None) -> None:
    if prefix is None:
        prefix = module_name.replace(".", "/").replace("_", "-")
    if tags is None:
        tags = [prefix.rsplit("/")[1]]
    module = importlib.import_module(module_name, "backend")
    router = getattr(module, "router")
    app.include_router(router, prefix = prefix, tags = tags) # type: ignore

register_api(".api.deltagere")


@app.get("/api/database/pool/check")
def pool_check() -> Any:
    dbpool.pgpool.check()
    return ":)"

@app.get("/")
def root() -> Any:
    html = (config.static_dir / "index.html").read_text()
    return HTMLResponse(html)

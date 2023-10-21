import secrets
import asyncio
import hashlib
from fastapi import APIRouter, Depends, Request, Response, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel
from typing import Annotated
from backend.database import TX, DB, RawSQL
from backend.config import config
from backend.utils import fragment
from backend.exceptions import Error, BadInputError

router = APIRouter()

class User:
    fdfid: int
    groups: set[str]

def current_user(tx: TX, request: Request, response: Response):
    cookie = request.cookies.get("session", None)
    if cookie is None:
        return RedirectResponse("/")
    fdfid, session_token = cookie.split(";", 1)
    validate_session(tx, fdfid, session_token)
    # tx.fetch_all("""
    # SELECT gruppe,
    #        type
    # """)
    user = User(
        fdfid = fdfid,
        groups = set(),
    )
    return user

USER = Annotated["User", Depends(current_user)]


# @router.get("/example")
# def example(user: Annotated[User, Depends(user_in_group("livgrupper"))]):
#     return ":)"

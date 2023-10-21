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
from backend import log

router = APIRouter()

LOGIN_TOKEN_BYTES = 512
SESSION_TOKEN_BYTES = 512
RANDOM_SALT = secrets.token_bytes(128)


@router.get("/loginpage")
def loginpage_get():
    return HTMLResponse(fragment("login_form.html"))


@router.post("/loginpage")
async def loginpage_post(tx: TX, fdfid: Annotated[str, Form()]):
    await delay(fdfid)
    try:
        fdfid = int(fdfid)
    except ValueError as e:
        log.exception(f"Failed to create fdfid: {fdfid}")
        return HTMLResponse(fragment("login_form_bad_fdfid.html"))
    try:
        login_token = make_login_token(tx, fdfid)
    except BadInputError as e:
        log.exception(f"Failed to make_login_token for: {fdfid}")
        return HTMLResponse(fragment("login_bad.html"))
    send_invite(tx, fdfid, login_token)
    log.info(f"Invided {fdfid}")
    return HTMLResponse(fragment("login_response.html"))


def make_login_token(tx: TX, fdfid: int):
    # Ensure user has permission to login
    if tx.fetch_maybe("""SELECT true FROM login_permissions WHERE fdfid = ?""", fdfid) is None:
        raise BadInputError("No such user / user can't login")

    # Login tokens must be unique:
    while True:
        login_token = secrets.token_urlsafe(LOGIN_TOKEN_BYTES)
        if tx.fetch_maybe("""SELECT true FROM login_tokens WHERE login_token = ?""", login_token) is None:
            break

    # Disable previous login token for the user
    tx.execute("""UPDATE login_tokens SET used = true WHERE fdfid = ?""", fdfid)

    # Save login token
    tx.insert("login_tokens",
              fdfid = fdfid,
              login_token = login_token,
              used = False,
              expires_at = config.login_expires_at,
              created_at = RawSQL("now()"))

    return login_token


def send_invite(tx: TX, fdfid: int, login_token: str):
    # TODO: Implement
    link = f"{config.url}/login?token={login_token}"
    print(f"Hej dit login link er\n{link}")


async def delay(string: str, max=10):
    half_max = max // 2
    hash = hashlib.shake_128(string.encode())
    hash.update(RANDOM_SALT)
    size = 6
    n = int.from_bytes(hash.digest(size), "big")
    hash_duration = (n * half_max) / (256**size)
    rand_duration = secrets.randbelow(half_max * 1_000_000_000) / 1_000_000_000
    duration = hash_duration + rand_duration
    # print(hash_duration, "+", rand_duration, "=", duration)
    await asyncio.sleep(duration)




# @router.get("/login")
# def login(tx: TX, fdfid: int, token: str):
#     login_token = token
#     row = tx.fetch_maybe("""
#     SELECT login_token,
#            expires_at,
#            now()
#       FROM login_tokens
#      WHERE fdfid = ?
#     """, fdfid)
#     if row is None:
#         # Either the user doesn't exist, or isn't invited (yet)
#         raise HTTPException(status_code=403, detail="Not authenticated, please login.")
#     if row["now"] >= row["expires_at"]:
#         tx.execute("""
#         DELETE FROM login_tokens
#               WHERE fdfid = ?
#         """, fdfid)
#         raise HTTPException(status_code=403, detail="Not authenticated, please login.")
#     is_equal = secrets.compare_digest(row["login_token"], login_token)
#     if not is_equal:
#         # The token is wrong (either spoofed, tampered with or no longer valid)
#         raise HTTPException(status_code=403, detail="Not authenticated, please login.")
#     session_token = make_session(tx, fdfid)
#     response = RedirectResponse("/")
#     cookie = f"{fdfid};{session_token}"
#     max_age = (row["expires_at"] - row[now]).total_seconds()
#     response.set_cookie(
#         key = "session",
#         value = cookie,
#         max_age = max_age, # In seconds
#         httponly=True) # Only available to the backend, not the frontend
#     return response
@router.get("/login")
async def login(tx: TX, token: str):
    await delay(token)

    # Get login token from database
    row = tx.fetch_maybe("""
    SELECT fdfid,
           used,
           expires_at,
           now()
      FROM login_tokens
     WHERE login_token = ?
    """, token)
    if (row is None or
        row["now"] >= row["expires_at"] or
        row["used"]):
        log.warn(f"User could not log in: {row['fdfid']}")
        return HTMLResponse(fragment("login_bad2.html"))

    # Disable the login token
    tx.execute("""
    UPDATE login_tokens
       SET used = true
     WHERE login_token = ?
    """, token)

    # Ensure the user still has permission to log in
    if tx.fetch_maybe("""
    SELECT true
      FROM login_permissions
     WHERE fdfid = ?
    """, row["fdfid"]) is None:
        log.warn(f"User not allowed to log in: {row['fdfid']}")
        return HTMLResponse(fragment("login_bad.html"))

    # Create the session
    session_token = make_session(tx, row["fdfid"])
    response = RedirectResponse("/", status_code=303) # 303 means GET this url instead
    cookie = f"{row['fdfid']};{session_token}"
    max_age = (row["expires_at"] - row["now"]).total_seconds()
    response.set_cookie(
        key = "session",
        value = cookie,
        max_age = max_age, # In seconds
        httponly=True) # Only available to the backend, not the frontend
    log.info(f"User logged in: {row['fdfid']}")
    return response


def make_session(tx: TX, fdfid: int):
    # Make another session token, ensure the user does not already have it
    while True:
        session_token = secrets.token_urlsafe(SESSION_TOKEN_BYTES)
        row = tx.fetch_maybe("""
        SELECT true
          FROM session_tokens
         WHERE fdfid = ?
           AND session_token = ?
        """, fdfid, session_token)
        if row is None:
            break
    tx.insert("session_tokens",
              fdfid = fdfid,
              session_token = session_token,
              expires_at = config.session_expires_at,
              created_at = RawSQL("now()"))
    return session_token



@router.get("/logout")
def logout(tx: TX, request: Request):
    cookie = request.cookies.get("session", None)
    if cookie is None:
        return RedirectResponse("/")
    fdfid, session_token = cookie.split(";", 1)
    tx.execute("""
    UPDATE sesson_tokens
       SET expires_at = null
     WHERE fdfid = ?
       AND session_token = ?
    """, fdfid, session_token)
    reponse = RedirectResponse("/")
    response.delete_cookie(key="session")
    return response



@router.get("/disable-user")
def disable_user(tx: TX, fdfid: int):
    tx.execute("""
    DELETE FROM login_permissions
          WHERE fdfid = ?
    """, fdfid)

    tx.execute("""
    UPDATE login_tokens
       SET expires_at = null
     WHERE fdfid = ?
    """, fdfid)

    tx.execute("""
    UPDATE sesson_tokens
       SET expires_at = null
     WHERE fdfid = ?
    """, fdfid)











def validate_session(tx: TX, fdfid: int, session_token: str):
    # We don't really have to worry about timing attacks, as the tokens are of the same length (bytes * 1.3)
    row = tx.select_maybe("""
    SELECT expires_at,
           now()
      FROM session_tokens
     WHERE fdfid = ?
       AND session_token = ?
    """, fdfid, session_token)
    if (row is None
        or row["expires_at"] is None
        or row["now"] >= row["expires_at"]):
        raise HTTPException(status_code=403, detail="Not authenticated, please login.")
    return # Success

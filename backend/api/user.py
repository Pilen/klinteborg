import secrets
from fastapi import APIRouter, Depends, Request, Response
from typing import Annotated
from backend.database import TX, DB
from backend.config import config

router = APIRouter()


LOGIN_TOKEN_BYTES = 512
SESSION_TOKEN_BYTES = 512

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



@router.get("/login")
def login(tx: TX, fdfid: int, token: str):
    login_token = token
    row = tx.fetch_maybe("""
    SELECT login_token,
           expires_at,
           now()
      FROM login_tokens
     WHERE fdfid = ?
    """, fdfid)
    if row is None:
        # Either the user doesn't exist, or isn't invited (yet)
        raise HTTPException(status_code=403, detail="Not authenticated, please login.")
    if row["now"] >= row["expires_at"]:
        tx.execute("""
        DELETE FROM login_tokens
              WHERE fdfid = ?
        """, fdfid)
        raise HTTPException(status_code=403, detail="Not authenticated, please login.")
    is_equal = secrets.compare_digest(row["login_token"], login_token)
    if not is_equal:
        # The token is wrong (either spoofed, tampered with or no longer valid)
        raise HTTPException(status_code=403, detail="Not authenticated, please login.")
    session_token = make_session(tx, fdfid)
    response = RedirectResponse("/")
    cookie = f"{fdfid};{session_token}"
    max_age = (row["expires_at"] - row[now]).total_seconds()
    response.set_cookie(
        key = "session",
        value = cookie,
        max_age = max_age, # In seconds
        httponly=True) # Only available to the backend, not the frontend
    return response

def make_session(tx: TX, fdfid: int):
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
              expires_at = config.session_expiration_date)
    return session_token

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





def make_login(tx: TX, fdfid: int):
    login_token = secrets.token_urlsafe(LOGIN_TOKEN_BYTES)
    # tx.execute("""DELETE FROM login_tokens WHERE fdfid = ?""", fdfid)
    if tx.fetch_maybe("""SELECT true FROM login_tokens WHERE fdfid = ?""", fdfid):
        tx.execute("""
        UPDATE login_tokens
           SET login_token = ?,
               expires_at = ?
         WHERE fdfid = ?
        """, login_token, config.login_expires_at, fdfid)
    else:
        tx.insert("login_tokens",
                  fdfid = fdfid,
                  login_token = login_token,
                  expires_at = config.login_expires_at)
    link = f"{config.url}/api/user/login/{login_token}"
    return login_token, link
def make_invitation(tx: TX, fdfid: int, login_token: str):
    print(f"Hej dit login link er\n{link}")






    # if row["session_token"] is None:
    #     session_token = generate_token()
    #     tx.execute("""
    #     UPDATE login_tokens
    #        SET session_token = ?
    #      WHERE fdfid = ?
    #     """, session_token, fdfid)
    # else:
    #     session_token = row["session_token"]

import os
import bcrypt
import psycopg
from psycopg.rows import dict_row
from fastapi import FastAPI, HTTPException, Request
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles


app = FastAPI()

IS_PROD = os.environ.get("ENV") == "production"
SECRET_KEY = os.environ.get("SECRET_KEY")
if IS_PROD and not SECRET_KEY:
    raise RuntimeError("SECRET_KEY must be set in production")

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL must be set")

app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY or "dev-only-change-me",
    same_site="lax",
    https_only=IS_PROD,         
    max_age=60 * 60 * 24 * 7,
) 


def get_conn():
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)

def init_db():
    conn = get_conn()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id          SERIAL  PRIMARY KEY,
            username    TEXT            NOT NULL UNIQUE,
            password    TEXT            NOT NULL,
            plan        TEXT            NOT NULL DEFAULT 'free',
            created_at  TIMESTAMPTZ     NOT NULL DEFAULT now()
        )
        """
    )
    conn.commit()
    conn.close()

def current_user(request: Request):
    user_id = request.session.get("user_id")
    if not user_id:
        return None
    conn = get_conn()
    row = conn.execute(
        "SELECT id, username, plan FROM users WHERE id = %s", (user_id,)
    ).fetchone()
    conn.close()
    return row

def require_pro(request: Request):
    user = current_user(request)
    if user is None:
        raise HTTPException(status_code=401, detail="please log in")
    if user["plan"] != "pro":
        raise HTTPException(status_code=403, detail="pro plan required")
    return user

init_db()


class NewUser(BaseModel):
    username:str
    password:str

@app.post("/register")
def register(user: NewUser):
    username = user.username.strip().lower()
    password = user.password.encode()      
    if len(username) < 3:
        raise HTTPException(status_code=400, detail="username must be at least 3 characters")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="size must be at least 6")
    if len(password) > 72:
        raise HTTPException(status_code=400, detail="password is too long (max 72 characters)")
    
    hashed = bcrypt.hashpw(password, bcrypt.gensalt()).decode()

    conn = get_conn()
    try:    
        cur = conn.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s) RETURNING id",
            (username, hashed),
        )
        new_id = cur.fetchone()["id"]
        conn.commit()
    except psycopg.errors.UniqueViolation:
        raise HTTPException(status_code=400, detail="that username is taken")
    finally:
        conn.close()
    return {"saved": True, "id": new_id, "message": "Registration successful!"}


@app.post("/login")
def login(user: NewUser, request: Request):
    username = user.username.strip().lower()
    password = user.password.encode()

    conn = get_conn()
    row = conn.execute(
        "SELECT id, username, password FROM users WHERE username = %s", (username,)
    ).fetchone()
    conn.close()

    if row is None or len(password) > 72 or not bcrypt.checkpw(password, row["password"].encode()):
        raise HTTPException(status_code=401, detail="wrong username or password")
    request.session["user_id"] = row["id"]
    return {"loggedIn": True, "id": row["id"], "username": row["username"], "message": "Login successful!"}

@app.get("/me")
def me(request: Request):
    row = current_user(request)
    if row is None:
        return {"loggedIn": False}
    return {"loggedIn": True, "id": row["id"], "username": row["username"], "plan": row["plan"]}

@app.get("/premium-test")
def premium_test(request: Request):
    row = require_pro(request)
    return {"message": "welcome, pro user " + row["username"]}

@app.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"loggedIn": False}

app.mount("/", StaticFiles(directory="public", html=True), name="static")
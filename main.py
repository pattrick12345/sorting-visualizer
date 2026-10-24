import sqlite3
import bcrypt
from fastapi import FastAPI, HTTPException, Request
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from pathlib import Path


app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 

DB_FILE = Path(__file__).parent / "app.db"
app.add_middleware(SessionMiddleware, secret_key="dev-only-change-me")



def get_conn():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row      # lets us read columns by name
    return conn
def init_db():
    conn = get_conn()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            username    TEXT    UNIQUE,
            password    TEXT    NOT NULL,
            plan        TEXT    NOT NULL DEFAULT 'free',
            created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
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
        "SELECT id, username, plan FROM users WHERE id = ?", (user_id,)
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

@app.get("/")
def home():
    return {"message": "hello"}

class NewUser(BaseModel):
    username:str
    password:str

@app.post("/register")
def register(user: NewUser):
    password = user.password.encode()      # bcrypt works on bytes, not text

    if len(password) < 6:
        raise HTTPException(status_code=400, detail="size must be at least 6")
    
    hashed = bcrypt.hashpw(password, bcrypt.gensalt()).decode()

    conn = get_conn()
    try:    
        cur = conn.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (user.username, hashed),
        )
        conn.commit()
        new_id = cur.lastrowid
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="that username is taken")
    finally:
        conn.close()
    return {"saved": True, "id": new_id, "message": "Registration successful!"}

@app.get("/users")
def list_users(username: str | None = None):
    conn = get_conn()
    if username:
        rows = conn.execute(
            "SELECT username, id, created_at FROM users WHERE username = ? ORDER BY id DESC", (username,)
        ).fetchall()
    else:
        rows = conn.execute("SELECT username, id, created_at FROM users ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/login")
def login(user: NewUser, request: Request):
    username = user.username.strip().lower()
    password = user.password.encode()

    conn = get_conn()
    row = conn.execute(
        "SELECT id, username, password FROM users WHERE username = ?", (username,)
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
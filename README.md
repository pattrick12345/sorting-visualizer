# Sorting Algorithm Visualizer

Interactive visualizer that animates sorting algorithms step by step, with
plain-English explanations, live comparison/swap counts, and user accounts.

## Features
- Animated bar charts for multiple sorting algorithms
- Live counts of comparisons and swaps, plus time/space complexity
- User registration and login (bcrypt-hashed passwords, session cookies)
- Locked content for logged-out users

## Tech stack
FastAPI, PostgreSQL (Neon), HTML/CSS/JavaScript, deployed on Render

## Run locally
    pip install -r requirements.txt
    set DATABASE_URL=your_postgres_connection_string
    uvicorn main:app --reload
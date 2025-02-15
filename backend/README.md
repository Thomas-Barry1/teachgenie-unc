# Backend

- This backend sets up a FastApi service and then listens for API requests in main.py before making requests to Google Gemini for AI generated content.
- Everything now is in "main.py"

## Prerequisites

- You have to go and get API_KEY from gemini api.

## Running locally

- Run this command to run the backend FastApi application locally:
  `uvicorn main:app --reload --host 127.0.0.0 --port 3000`

## Code to run

- Updating Requirements

When you update requirements.txt, you need to install the new requirements in your virtual environment:

```
source /path/to/your/venv/bin/activate
pip install -r /path/to/your/app/requirements.txt
```

- Run code

```
source /path/to/your/venv/bin/activate
pip install -r /path/to/your/app/requirements.txt
python3 main.py
```

## See values in sqlite database

- `sqlite3 test.db`
- `SELECT * FROM users;`

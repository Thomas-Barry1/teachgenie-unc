# Documentation Plan

This is a document detailing how to run the necessary servers for development and to run the code locally.

## Backend

Before running any servers, you must get an API key for the Google Gemini API and store it as `API_KEY` in a local environment file.

To run FastApi locally, run the following command in the terminal:

`
uvicorn main:app --reload --host 127.0.0.0 --port 3000
`

All of the dependencies are listed in the `requirements.txt` file. To download them, navigate to the backend directory and run the following code in the terminal:

`
source .venv/bin/activate
`
`
pip install -r requirements.txt
`

*Note: file paths may be different depending on where your .venv file is located*

After installing dependencies and starting the virtual environment, run main.py:

`
python3 main.py
`

The backend server is now running.

## Frontend

To run the frontend development server, install the dependencies in the `package.json` and `package-lock.json` files by navigating to the frontend directory, and running the following code in the terminal:

`
npm install
`

After installing dependencies, you can run the frontend server with the following terminal command:

`
ng serve
`

Both servers are now running and the web app is running locally on `localhost:3000` or `localhost:4200`, depending on operating systems.

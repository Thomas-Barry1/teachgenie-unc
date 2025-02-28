from typing import List, Optional, Union
from fastapi import FastAPI, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import google.generativeai as genai
import os
import uvicorn
from dotenv import load_dotenv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a model for the request body
class FormRequest(BaseModel):
    topic: str = Form(str),
    numberOfQuestions: str = Form(None),
    gradeLevel: str = Form(None),
    commonCoreStandards: str = Form(None),
    skills: str = Form(None),
    questionType: Union[List[str], str] = Form(None),  # Accepting multiple values
    state: str = Form(None)

@app.post("/api/test")
async def test(request: FormRequest):
    print("Made it to TEST")
    print("TestRequest ", request)
    test = await generate_test(request)
    return {"test": test}

from fastapi import Depends
from sqlalchemy.orm import Session

# Storing user info
@app.post("/api/auth/google")
async def google_auth(info: dict):
    print("Auth info: ", info)
    return True


# Generating Gap Assessment
@app.post("/api/gap-assessment")
async def gap_test(file: dict):
   print("Reached the backend api call: ", file)
   return True

# Generating standards for gap test 
@app.post("/api/gap-standards")
async def gap_standards(request: FormRequest): 
    print("made it to main.py")
    standards =  await generate_standards(request)
    return {"standards": standards}

# Load .env environment variables
load_dotenv()

api_key = os.getenv("API_KEY")

if not api_key: 
    raise ValueError("API_KEY is missing")

genai.configure(api_key=os.environ["API_KEY"])

# Different models: https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models
model = genai.GenerativeModel('gemini-1.5-flash')

async def generate_gap_assessment(request: FormRequest):
    print("Reached the backend api: call")
    return True

async def generate_standards(request: FormRequest):
    prompt = f"Create a set of 10 educational standards on the topic '{request.topic} for a GAP assessment"
    prompt += f"The assessment should evaluate students' understanding of key concepts and identify gaps in their knowledge."
    if request.gradeLevel:
        prompt += f" The standards should be specific to {request.gradeLevel}"

    if request.commonCoreStandards:
        prompt += f" The standards should align with {request.commonCoreStandards}."

    if request.skills:
        prompt += f" The standards should align with {request.skills}."
    
    if request.questionType and (type(request.questionType) is not type((Form(None),))):
        prompt += f"Ensure the standards can be tested using the following question types: {', '.join(request.questionType)}."
    
    if request.state:
        prompt += f" Focus response using standards from this state: {request.state}."

    response = model.generate_content(prompt)
    print("Test response: ", response)
    # Only iterate 5 or more times if a bad response is received
    numIterations = 0
    isValidResp = False
    while not isValidResp and numIterations < 5:
        try:
            response.text
            isValidResp = True
        except:
            numIterations += 1
            print("Regenerate response")
            response = model.generate_content(prompt)
            print("Test response: ", response)
    if numIterations == 5:
        returnResp = "Error in AI response, try again or change request."
    else:
        returnResp = response.text
    return returnResp

async def generate_test(request: FormRequest):
    # Construct the prompt based on user input
    prompt = f"Write a test for a teacher on the topic '{request.topic}', and include answer key at end."

    if request.numberOfQuestions and (type(request.numberOfQuestions) is not type((Form(None),))):
        prompt += f" Include {request.numberOfQuestions} questions."

    if request.gradeLevel:
        prompt += f" Grade Level: {request.gradeLevel}."

    if request.commonCoreStandards:
        prompt += f" Common Core Standards: {request.commonCoreStandards}."

    if request.skills:
        prompt += f" Focus on skills: {request.skills}."

    if request.questionType and (type(request.questionType) is not type((Form(None),))):
        prompt += f" Question Types: {', '.join(request.questionType)}."
        if "Reading Passage" in request.questionType:
            print("Reading Passage")
            if request.gradeLevel:
                prompt += f" Very important the length of the reading passage should be at least 200 words and 100 times the grade level."
            else:
                prompt += " Very important the length of the reading passage should be at least 200 words and make it longer depending on the other criteria."
    if request.state:
        prompt += f" Focus response using standards from this state: {request.state}."
    print("Prompt: ", prompt)
    response = model.generate_content(prompt)
    print("Test response: ", response)
    # Only iterate 5 or more times if a bad response is received
    numIterations = 0
    isValidResp = False
    while not isValidResp and numIterations < 5:
        try:
            response.text
            isValidResp = True
        except:
            numIterations += 1
            print("Regenerate response")
            response = model.generate_content(prompt)
            print("Test response: ", response)
    if numIterations == 5:
        returnResp = "Error in AI response, try again or change request."
    else:
        returnResp = response.text
    return returnResp

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
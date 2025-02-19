from typing import List, Optional, Union
from fastapi import FastAPI, Form, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import google.generativeai as genai
import os
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

import csv
from io import StringIO
from typing import Dict

# Generateing Gap Assessment
@app.post("/api/gap-assessment")
async def extract_csv_file(file: UploadFile = File(...)):
    print("Reached the backend API call:", file.filename)
    
    file_contents = await file.read()
    decoded_contents = file_contents.decode("utf-8-sig")  # utf-8-sig removes the \ufeff at the start of the file.
    
    csv_file = StringIO(decoded_contents)
    reader = csv.DictReader(csv_file)
    
    extracted_information = {}
    
    for row in reader:
        print(row.keys())
        student_name = row["Student Name"]
        student_scores = {}
        
        for column in row:
            if column != "Student Name":
                student_scores[column] = int(row[column])
        
        extracted_information[student_name] = student_scores
    generated_gap_assessment = await generate_gap_assessment(extracted_information)
    print("Printing the results from backend")
    print(extracted_information, generated_gap_assessment)
    return {"extracted_information": extracted_information, "generated_gap_assessment": generated_gap_assessment}


async def generate_gap_assessment(extracted_information):
    #Make the prompt to ask genai to create appropriate test
    prompt = ''
    print(extracted_information.keys())
    print(extracted_information.values())
    
    for student_name, scores in extracted_information.items():
        scores_str = ", ".join([f"{subject}: {score}" for subject, score in scores.items()])
        prompt += (f"A teacher has a student named {student_name}, and they have the following assessments for their studies: {scores_str}. "
                   f"Assuming these scores are out of 10, can you create a plan and tell us which skills are the weakest for {student_name} "
                   f"and create plans on how they can improve?\n")
    
    print(f"Prompt to be passed to genai: {prompt}")

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
    
# Load .env environment variables
load_dotenv()

genai.configure(api_key=os.environ["API_KEY"])

# Different models: https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models
model = genai.GenerativeModel('gemini-1.5-flash')

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
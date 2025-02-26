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
import re
def categorize_question(given_question):
    prompt = f"What common core standard does this question belong to? {given_question}? Give the common core standard in the form like CCSS.3.MD.C.5.a or 3.NF.A.3"
    response = model.generate_content(prompt)
    
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
        cleaned_up_returnResp = re.findall(r"\b[A-Z0-9]+.[A-Z]+.[A-Z]+.[0-9]+[a-z]?\b|\b[0-9].[A-Z]+.[A-Z]+.[0-9]+[a-z]?\b", response.text)
    return returnResp, cleaned_up_returnResp

# Generateing Gap Assessment
@app.post("/api/gap-assessment")
async def extract_csv_file(file: UploadFile = File(...)):
    print("Reached the backend API call:", file.filename)
    
    file_contents = await file.read()
    decoded_contents = file_contents.decode("utf-8-sig")  # utf-8-sig removes the \ufeff at the start of the file.
    
    csv_file = StringIO(decoded_contents)
    reader = csv.DictReader(csv_file)
    
    #The input CSV has question, student answer, correct answer. 
    #We will send the questions to categorize them into correct standards like fractions 4.1, etc.
    #We will grade the student response for each category.
    #Make a new dictinaty with the list of {Student Name: Niyaz, {Fractions 4.1: 10, ALgebra 3.1: 9, etc}}.
    #call the generate_gap_assessment method to create gap assessment string and return it.
    

    #Here was the old-outdated code
    added_category_list = []

    for row in reader:
        print(row.keys())
        question = row["Question"]
        student_answer = row["Student Answer"]
        correct_answer = row["Correct Answer"]
        full_response, category = categorize_question(question)
        print(f"The full response for {question}: {full_response}, and the category is :{category}")
        # Append as a dictionary to the list
        added_category_list.append({
            "question": question,
            "student_answer": student_answer,
            "correct_answer": correct_answer,
            "category": category
        })
    print("The added_category_list: ", added_category_list)
    
    category_scores = {}

    for item in added_category_list:
        #If ["category"] is null, there was no category assigned by gemini.
        if not item["category"]:
            category = "unasssigned_category"
        else:
            category = item["category"][0] 
            
        student_answer = item["student_answer"].strip().lower()
        correct_answer = item["correct_answer"].strip().lower()

        # Assign score (exact match = 10, incorrect = 0)
        score = 10 if student_answer == correct_answer else 0

        if category not in category_scores:
            category_scores[category] = {"total_score": 0, "question_count": 0}

        category_scores[category]["total_score"] += score
        category_scores[category]["question_count"] += 1

    print("Category Scores: ", category_scores)
    # Calculate overall grade for each category (convert to percentage 0-100%)
    category_final_grades = {}
    for category, data in category_scores.items():
        total_score = data["total_score"]
        question_count = data["question_count"]
        
        overall_percentage = (total_score / (question_count * 10)) * 100 if question_count > 0 else 0
        category_final_grades[category] = round(overall_percentage, 2)

    print("Final categorized grades in percentages:", category_final_grades)
    generated_gap_assessment = await generate_gap_assessment(category_final_grades)
    extracted_information = category_final_grades
    return {"extracted_information": extracted_information, "generated_gap_assessment": generated_gap_assessment}
        
    #     student_name = row["Student Name"]
    #     student_scores = {}
        
    #     for column in row:
    #         if column != "Student Name":
    #             student_scores[column] = int(row[column])
        
    #     extracted_information[student_name] = student_scores
    # generated_gap_assessment = await generate_gap_assessment(extracted_information)
    # print("Printing the results from backend")
    # print(extracted_information, generated_gap_assessment)
    # return {"extracted_information": extracted_information, "generated_gap_assessment": generated_gap_assessment}


async def generate_gap_assessment(extracted_information):
    #Make the prompt to ask genai to create appropriate test
    prompt = 'A teacher has a student whose test results were analyzed. In particular,'
    print(extracted_information.keys())
    print(extracted_information.values())
    
    for category, score in extracted_information.items():
        prompt += (f"in the {category} category, they scored {score}%,")
    prompt += (f"Can you create a plan this student and create plans on how they can improve?\n")
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
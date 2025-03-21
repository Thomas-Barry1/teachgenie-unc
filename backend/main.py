from ctypes import Array
import re
from typing import List, Optional, Union
from fastapi import FastAPI, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import google.generativeai as genai
import os
import uvicorn
from dotenv import load_dotenv
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

# Define a model for the request body
class FormRequest(BaseModel):
    topic: str = Form(str),
    numberOfQuestions: str = Form(None),
    gradeLevel: str = Form(None),
    commonCoreStandards: str = Form(None),
    skills: str = Form(None),
    questionType: Union[List[str], str] = Form(None),  # Accepting multiple values
    state: str = Form(None),
    standards: Optional[str] = Form(None)
    
class Question(BaseModel):
    question: str
    answerChoices: List[str]
    correctAnswer: str

class Full_Question(BaseModel):
    question: Question
    selected_answer: Optional[str]  # Matches `string | null` in TypeScript

class StandardPerformance(BaseModel):
    standard: str
    strength: Optional[str]
    description: str

class InlineGapAssessment(BaseModel):
    overallStrength: Optional[str] #This can be string, modelerate or weak or null
    perforamnceSummary: str
    standardsPerforamnce: List[StandardPerformance]
    improvementPlan: str


@app.post("/api/test")
async def test(request: FormRequest):
    print("TestRequest ", request)
    test = await generate_test(request)
    return {"test": test}

from fastapi import Depends
from sqlalchemy.orm import Session

# Storing user info
@app.post("/api/auth/google")
async def google_auth(info: FormRequest):
    print("Auth info: ", info)
    return True


# Generating Gap Assessment
@app.post("/api/gap-test")
async def gap_test(request: FormRequest):
   print("Reached the backend gap test api call: ", request)
   test = await generate_gap_test(request)
   return {"test" : test}

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

@app.post("/api/gap-assessment-sample-question")
#interface InlineGapAssessment {
#   overallStrength: 'Strong' | 'Moderate' | 'Weak' | null;
#   performanceSummary: string;
#   standardsPerformance: {
#     standard: string;
#     strength: 'Strong' | 'Moderate' | 'Weak' | null;
#     description: string;
#   }[];
#   improvementPlan: string;
# }
async def wrapper_gap_assessment(sample_given_questions: List[Question]):
    print("Reached the sample backend API call, here are the sample_given_questions-question:", sample_given_questions)
    return sample_given_questions
@app.post("/api/gap-assessment-sample")
#interface InlineGapAssessment {
#   overallStrength: 'Strong' | 'Moderate' | 'Weak' | null;
#   performanceSummary: string;
#   standardsPerformance: {
#     standard: string;
#     strength: 'Strong' | 'Moderate' | 'Weak' | null;
#     description: string;
#   }[];
#   improvementPlan: string;
# }
async def wrapper_gap_assessment(sample_given_questions: List[str]):
    print("Reached the sample backend API call, here are the sample_given_questions:", sample_given_questions)
    return sample_given_questions

@app.post("/api/gap-assessment")
#interface InlineGapAssessment {
#   overallStrength: 'Strong' | 'Moderate' | 'Weak' | null;
#   performanceSummary: string;
#   standardsPerformance: {
#     standard: string;
#     strength: 'Strong' | 'Moderate' | 'Weak' | null;
#     description: string;
#   }[];
#   improvementPlan: string;
# }
async def wrapper_gap_assessment(given_questions: List[Full_Question] ): 
    print("Reached the backend API call, here are the given_questions:", given_questions)
    
    added_category_list = []

    for question_iterator in given_questions:
        question = question_iterator.question.question
        student_answer = question_iterator.selected_answer
        correct_answer = question_iterator.question.correctAnswer

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


    improvement_plan = await generate_gap_assessment(category_final_grades)
    extracted_information = category_final_grades
    return {"extracted_information": extracted_information, "improvement_plan": improvement_plan}

async def generate_gap_assessment(extracted_information):
    #Make the prompt to ask genai to create appropriate test
    prompt = 'A teacher has a student whose test results were analyzed. In particular,'
    print(extracted_information.keys())
    print(extracted_information.values())
    
    for category, score in extracted_information.items():
        prompt += (f"in the {category} category, they scored {score}%,")

    #First, ask for overall_strength
    overall_strength_prompt = prompt + (f"Can you give me a one word answer of the overall strength of this student. Either tell me Stong, Moderate, or Weak. Please only one word answer")
    print(f"overall_strength_prompt to be passed to genai: {overall_strength_prompt}")

    overall_strength = model.generate_content(overall_strength_prompt)
    print("Test overall_strength: ", overall_strength)
    # Only iterate 5 or more times if a bad overall_strength is received
    numIterations = 0
    isValidResp = False
    while not isValidResp and numIterations < 5:
        try:
            overall_strength.text
            isValidResp = True
        except:
            numIterations += 1
            print("Regenerate overall_strength")
            overall_strength = model.generate_content(prompt)
            print("Test overall_strength: ", overall_strength)
    if numIterations == 5:
        returnResp = "Error in AI overall_strength, try again or change request."
    else:
        returnResp = overall_strength.text
    overall_strength = returnResp
    print(f"The overall stength response after the prompt is : {overall_strength}")


    #Now get the performacne summary
    performance_summary_prompt = prompt + (f"Can you create performance summary for this student?\n")
    print(f"performance_summary_prompt to be passed to genai: {performance_summary_prompt}")
    
    performance_summary = model.generate_content(performance_summary_prompt)
    print("Test performance_summary: ", performance_summary)
    # Only iterate 5 or more times if a bad performance_summary is received
    numIterations = 0
    isValidResp = False
    while not isValidResp and numIterations < 5:
        try:
            performance_summary.text
            isValidResp = True
        except:
            numIterations += 1
            print("Regenerate performance_summary")
            performance_summary = model.generate_content(prompt)
            print("Test performance_summary: ", performance_summary)
    if numIterations == 5:
        returnResp = "Error in AI performance_summary, try again or change request."
    else:
        returnResp = performance_summary.text
    performance_summary = returnResp
    print(f"The performance_summary response after the prompt is : {performance_summary}")
    # return returnResp


    #now to get the standards performance, ahve to ask multiple prompts for each standard.
    standardsPerformance = []
    prompt_second = 'A teacher has a student whose test results were analyzed. In particular,'
    for category, score in extracted_information.items():
        particular_standards_performance_prompt = prompt_second + (f"in the {category} category, they scored {score}%,")
        #now we have the prompt ready
        print(f"particular_standards_performance_prompt: {particular_standards_performance_prompt}")
        particular_standards_performance_prompt_strength = particular_standards_performance_prompt + (f"Can you give me a one word answer of the strength of this student for this category? Either tell me Stong, Moderate, or Weak. Please only one word answer ")
        print(f"particular_standards_performance_prompt_strength prompt: {particular_standards_performance_prompt_strength}")
        numIterations = 0
        isValidResp = False
        while not isValidResp and numIterations < 5:
            try:
                particular_standards_performance_prompt_strength.text
                isValidResp = True
            except:
                numIterations += 1
                print("Regenerate particular_standards_performance_prompt_strength")
                particular_standards_performance_prompt_strength = model.generate_content(prompt)
                print("Test particular_standards_performance_prompt_strength: ", particular_standards_performance_prompt_strength)
        if numIterations == 5:
            returnResp = "Error in AI particular_standards_performance_prompt_strength, try again or change request."
        else:
            returnResp = particular_standards_performance_prompt_strength.text
        particular_standards_performance_prompt_strength = returnResp
        print(f"The particular_standards_performance_prompt_strength response after the prompt is : {particular_standards_performance_prompt_strength}")

        particular_standards_performance_prompt_description = particular_standards_performance_prompt + (f"Can you give me a the description of this student performance for this category?")
        print(f"particular_standards_performance_prompt_description prompt: {particular_standards_performance_prompt_description}")
        numIterations = 0
        isValidResp = False
        while not isValidResp and numIterations < 5:
            try:
                particular_standards_performance_prompt_description.text
                isValidResp = True
            except:
                numIterations += 1
                print("Regenerate particular_standards_performance_prompt_description")
                particular_standards_performance_prompt_description = model.generate_content(prompt)
                print("Test particular_standards_performance_prompt_description: ", particular_standards_performance_prompt_description)
        if numIterations == 5:
            returnResp = "Error in AI particular_standards_performance_prompt_description, try again or change request."
        else:
            returnResp = particular_standards_performance_prompt_description.text
        particular_standards_performance_prompt_description = returnResp
        print(f"The particular_standards_performance_prompt_description response after the prompt is : {particular_standards_performance_prompt_description}")

        #all the values are ready
        standard, description, strength = category, particular_standards_performance_prompt_description, particular_standards_performance_prompt_strength

        standardsPerformance.append({standard: standard, description: description, strength: strength})


        

    #Now get the improvement plan
    improvement_plan_prompt = prompt + (f"Can you create a plan this student and create plans on how they can improve?\n")
    print(f"improvement_plan_prompt to be passed to genai: {improvement_plan_prompt}")
    
    improvement_plan = model.generate_content(improvement_plan_prompt)
    print("Test improvement_plan: ", improvement_plan)
    # Only iterate 5 or more times if a bad improvement_plan is received
    numIterations = 0
    isValidResp = False
    while not isValidResp and numIterations < 5:
        try:
            improvement_plan.text
            isValidResp = True
        except:
            numIterations += 1
            print("Regenerate improvement_plan")
            improvement_plan = model.generate_content(prompt)
            print("Test improvement_plan: ", improvement_plan)
    if numIterations == 5:
        returnResp = "Error in AI improvement_plan, try again or change request."
    else:
        returnResp = improvement_plan.text
    improvement_plan = returnResp
    print(f"The improvement_plan response after the prompt is : {improvement_plan}")
    returnOverallGapAssessment = InlineGapAssessment("overallStrength": overall_strength
                                                     )
    return returnResp

# Generating standards for gap test 
@app.post("/api/gap-standards")
async def gap_standards(request: FormRequest): 
    print("Made it to main.py")
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

async def generate_gap_assessment(request: FormRequest):
    print("Reached the backend api: call")
    return True

async def generate_standards(request: FormRequest):
    prompt = f"Create a set of 10 educational standards on the topic '{request.topic}."
    prompt += f"For each standard, give one sentence only. So I want a total of 10 sentences only."
    prompt += "Make sure each standard is able to be tested via a multiple choice and/or true/false question to determine proficiency."
    if request.gradeLevel:
        prompt += f" The standards should be specific to {request.gradeLevel}"

    if request.commonCoreStandards:
        prompt += f" The standards should align with {request.commonCoreStandards}."

    if request.skills:
        prompt += f" The standards should align with {request.skills}."
    
    if request.state:
        prompt += f" Focus response using standards from this state: {request.state}."
    prompt+= f"I expect the format of the response to be only 10 sentences. One sentence per standard, and please number the standards."
    response = model.generate_content(prompt)
    print("Generate Standards Response: ", response)
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
            print("Generate Standards Response: ", response)
    if numIterations == 5:
        returnResp = "Error in AI response, try again or change request."
    else:
        returnResp = response.text
    return returnResp

async def generate_gap_test(request: FormRequest):
    # Construct the prompt based on user input
    prompt = f"Write a test for a teacher on the topic '{request.topic}', and include answer key at end. "

    if request.standards:
        prompt+= f"Base the questions on the following educational standards: {request.standards}. " # A GAP assessment will be produced after the test from these standards. "
        prompt+= "Ensure that each question directly assesses one or more of these standards, evaluating students' understanding and application. "
        prompt+= "Please only include questions and answer key, no explanation about how your response does so. "
        prompt+= "Each question must have exactly one correct answer. "
        prompt += "This next fact is VERY important. Please return your answer in the following JSON format. "
        prompt += "{Question, AnswerChoices[], CorrectAnswer}. Don't give me any additional sentences."
        print("Standards included")

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
    print("Gap test response: ", response)
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
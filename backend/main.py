from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio  # For async sleep
from groq import Groq
from dotenv import load_dotenv
import pandas as pd
import time
import os

# Initialize FastAPI
app = FastAPI()

# CORS Middleware (Allow frontend to talk to backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()

# Initialize Groq API
groq_API = os.getenv("GROQ_API_KEY")
client = Groq(api_key=groq_API)

# Load the dataset once when the server starts
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "reddit_post.csv")
df = pd.read_csv(DATA_PATH)

# Request model for fetching posts
class PostFetchRequest(BaseModel):
    severity: int
    category: str

@app.post("/get_posts")
def get_posts(data: PostFetchRequest):
    severity = data.severity
    category = data.category.strip().lower()  # Normalize category

    # Ensure category is valid
    valid_categories = ["depression", "anxiety", "mental illness"]
    if category not in valid_categories:
        raise HTTPException(status_code=400, detail="Invalid category provided")

    # Filter by category
    filtered_df = df[df["Subreddit"].str.lower() == category].copy()

    if filtered_df.empty:
        raise HTTPException(status_code=404, detail="No posts found for this category")

    # Convert 'severity' column to numeric, if it's not already
    filtered_df['Rating'] = pd.to_numeric(filtered_df['Rating'], errors='coerce')

    # Sort by closest severity score
    filtered_df.loc[:, "severity_diff"] = abs(filtered_df["Rating"] - severity)
    sorted_df = filtered_df.sort_values(by="severity_diff").head(3)

    # Convert to JSON
    result = sorted_df[["Text"]].to_dict(orient="records")
    return result


class PostInput(BaseModel):
    text: str

# Function to categorize content (synchronous version, because Groq is likely blocking)
def categorize_reddit_content(content: str):
    try:
        asyncio.sleep(3)  # Replaced time.sleep with async sleep
        messages = [
            {"role": "system", "content": "null"},
            {
                "role": "user",
                "content": f"Please categorize our reddit post content into one of the three categories: 'Depression', 'Anxiety', 'Mental Illness': \n\n {content}. The output should only be a word with no extra texts.",
            },
        ]
        chat_completion = client.chat.completions.create(
            temperature=0.1, messages=messages, model="llama3-70b-8192", n=1
        )
        category = chat_completion.choices[0].message.content
        return category
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error categorizing content: {str(e)}")

# Function to get severity rating (synchronous version, because Groq is likely blocking)
def severity_rating(content: str):
    try:
        asyncio.sleep(3)  # Replaced time.sleep with async sleep
        messages = [
            {"role": "system", "content": "null"},
            {
                "role": "user",
                "content": f"On a scale from 1 to 10, rate the severity of the situation described in the content.: \n\n {content}. A rating of 1 indicates minimal or no significant signs of depression, anxiety, or mental issues, while a rating of 10 represents an extremely severe and critical situation. The output should only be a single number in between with no extra texts.",
            },
        ]
        chat_completion = client.chat.completions.create(
            temperature=0.15, messages=messages, model="llama3-70b-8192", n=1
        )
        severity = chat_completion.choices[0].message.content
        return severity
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching severity rating: {str(e)}")
    
def provide_help(content: str):
    try:
        asyncio.sleep(3)  # Replaced time.sleep with async sleep
        messages = [
            {"role": "system", "content": "null"},
            {
                "role": "user",
                "content": f"Based on the content provided, please provide a brief response with some helpful advice or resources for the user. \n\n {content}. The output should be a helpful response to lessen the severity of the user's situation. If they are already in a good mood, just say something nice.",
            },
        ]
        chat_completion = client.chat.completions.create(
            temperature=0.15, messages=messages, model="llama3-70b-8192", n=1
        )
        help = chat_completion.choices[0].message.content
        return help
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching help: {str(e)}")

@app.post("/analyze")
async def analyze_post(post: PostInput):
    try:
        category = categorize_reddit_content(post.text)  # Non-async function
        severity = severity_rating(post.text)  # Non-async function
        help = provide_help(post.text)
        return {"category": category, "severity": int(severity), "help": help}  # Ensure severity is an integer
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing the post: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

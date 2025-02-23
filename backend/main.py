from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio  # For async sleep
from groq import Groq
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
# load_dotenv()

# Initialize Groq API
groq_API = "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"
client = Groq(api_key=groq_API)

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

@app.post("/analyze")
async def analyze_post(post: PostInput):
    try:
        category = categorize_reddit_content(post.text)  # Non-async function
        severity = severity_rating(post.text)  # Non-async function
        return {"category": category, "severity": int(severity)}  # Ensure severity is an integer
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing the post: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

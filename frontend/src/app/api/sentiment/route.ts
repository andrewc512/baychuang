import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Mock sentiment analysis logic
    let sentiment = "Neutral";
    let severity = 1;

    if (text.includes("happy") || text.includes("great")) {
      sentiment = "Positive";
      severity = 2;
    } else if (text.includes("sad") || text.includes("stressed")) {
      sentiment = "Negative";
      severity = 0;
    }

    return NextResponse.json({ sentiment, severity }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

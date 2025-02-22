"use client";
import type React from "react"

import { useState } from "react"

export default function Home() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState("")
  const [severity, setSeverity] = useState(0)


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    const res = await fetch("/api/sentiment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: input }),
    })
    const data = await res.json()
    setResponse(data.sentiment); // Changed `data.response` to `data.sentiment`
    setSeverity(data.severity || 1);
    setIsLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">BayChuang helps you!</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userInput" className="block text-sm font-medium text-gray-700">
            Describe how you're feeling:
          </label>
          <textarea
            id="userInput"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            rows={4}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? "Analyzing..." : "Analyze Sentiment"}
        </button>
      </form>
      {response && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-lg font-semibold">
            Sentiment:{" "}
            <span className={`text-${severity === 0 ? "red" : severity === 1 ? "yellow" : "green"}-500`}>
              {response}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardHeader, CardContent } from "./card"
// import { Heart } from "lucide-react"
import styles from "./page.module.css"
import Header from "./header"

export default function Home() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [category, setCategory] = useState("")
  const [severity, setSeverity] = useState(0)
  const [help, setHelp] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const res = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: input }),
    })

    if (res.ok) {
      const data = await res.json()
      setCategory(data.category)
      setSeverity(data.severity)
      setHelp(data.help)
    } else {
      setCategory("Error: Unable to fetch data")
    }
    setIsLoading(false)
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <Card>
          <CardHeader>
            <div className={styles.header}>
              <h2>Let Baymax help you!</h2>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="userInput">Give Baymax any text to analyze</label>
                <textarea
                  id="userInput"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  required
                  placeholder="Type your thoughts here..."
                />
              </div>
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Analyzing..." : "Analyze Sentiment"}
              </button>
            </form>

            {category && (
              <div className={styles.results}>
                <div className={styles.category}>
                  <span>Category:</span> {category}
                </div>

                <div className={styles.severityContainer}>
                  <label htmlFor="slider">Sentiment Severity (1-10):</label>
                  <div className={styles.sliderContainer}>
                    <input id="slider" type="range" min="1" max="10" value={severity} disabled />
                    <div className={styles.sliderLabels}>
                      {Array.from({ length: 10 }, (_, i) => (
                        <span key={i}>{i + 1}</span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.severityValue}>Severity: {severity}</div>
                </div>
              </div>
            )}
            <div className="text-lg font-medium p-5">
              {help && (
                <div className={styles.help}>
                  {help}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
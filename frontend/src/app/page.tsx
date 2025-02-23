"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "./card";
import styles from "./page.module.css";
import Header from "./header";
import TableauEmbed from "./components/TableauEmbed";

type RedditPost = {
  text: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState(0);
  const [help, setHelp] = useState("");
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showIframe, setShowIframe] = useState(false); // State to control iframe rendering

  useEffect(() => {
    // This will ensure that the iframe only renders on the client
    setShowIframe(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const res = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: input }),
    });

    if (res.ok) {
      const data = await res.json();
      setCategory(data.category);
      setSeverity(data.severity);
      setHelp(data.help);
      await fetchRelevantPosts(data.severity, data.category);
    } else {
      setCategory("Error: Unable to fetch data");
    }

    setIsLoading(false);
  }

  const fetchRelevantPosts = async (severity: number, category: string) => {
    try {
      const response = await fetch("http://localhost:8000/get_posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ severity, category }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      // console.log(data);
      setPosts(data.map((post: { Text: string }) => ({ text: post.Text }))); // Ensure correct typing
    } catch (error: any) {
      setError(error.message);
    }
  };

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
                <label htmlFor="userInput">
                  Give Baymax any text to analyze
                </label>
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
                    <input
                      id="slider"
                      type="range"
                      min="1"
                      max="10"
                      value={severity}
                      disabled
                    />
                    <div className={styles.sliderLabels}>
                      {Array.from({ length: 10 }, (_, i) => (
                        <span key={i}>{i + 1}</span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.severityValue}>
                    Severity: {severity}
                  </div>
                </div>
              </div>
            )}
            {help && (
              <div className={styles.results}>
                <div className="text-lg font-medium p-5">
                  <div
                    className={styles.help}
                    style={{
                      fontSize: "1.2rem",
                      color: "#b91c1c",
                      lineHeight: "1.8",
                      textAlign: "center",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                    }}
                  >
                    <strong>Suggestions:</strong>
                    <br /> {/* Adds a line break for spacing */}
                    {help}
                  </div>
                </div>
              </div>
            )}
            <div>
              <h2>Relevant Posts</h2>
              {posts.length > 0 ? (
                <ul className="list-disc pl-4">
                  {posts.map((post, index) => (
                    <li key={index} className="mb-2">
                      {post.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No posts available.</p>
              )}
            </div>
            <div className={styles.tableauContainer}>
              <TableauEmbed />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

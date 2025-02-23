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
            {/* <Heart className={styles.heartIcon} /> */}
            <h2>BayChuang helps you!</h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="userInput">Describe how you're feeling:</label>
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
        </CardContent>
      </Card>
    </div>
    </>
  )
}


// "use client";
// import type React from "react"

// import { useState } from "react"

// export default function Home() {
//   const [input, setInput] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [category, setCategory] = useState("")
//   const [severity, setSeverity] = useState(0)

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setIsLoading(true);

//     // Send the input to the backend for analysis
//     const res = await fetch("http://localhost:8000/analyze", {  // Backend API URL
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ text: input }), // Send the text input to backend
//     });

//     if (res.ok) {
//       const data = await res.json();
//       // Update response with the data from the backend
//       setCategory(data.category);  // Backend returns 'category' (Depression, Anxiety, Mental Illness)
//       setSeverity(data.severity);  // Backend returns 'severity' (a number)
//     } else {
//       setCategory("Error: Unable to fetch data");
//     }
//     setIsLoading(false);
//   }

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-red rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold mb-4">BayChuang helps you!</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="userInput" className="block text-sm font-medium text-gray-700">
//             Describe how you're feeling:
//           </label>
//           <textarea
//             id="userInput"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//             rows={4}
//             required
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//         >
//           {isLoading ? "Analyzing..." : "Analyze Sentiment"}
//         </button>
//       </form>
//       {category && (
//         <div className="mt-4">
//           <p><strong>Category:</strong> {category}</p>
//           <div className="mt-4 p-4 bg-gray-100 rounded-lg">
//             <label
//               htmlFor="slider"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Sentiment Severity (1-10):
//             </label>
//             <input
//               id="slider"
//               type="range"
//               min="1"
//               max="10"
//               value={severity}
//               disabled
//               className="w-full mt-2"
//             />
//             {/* Number labels under the slider */}
//             <div className="flex justify-between text-xs mt-2">
//               {Array.from({ length: 10 }, (_, i) => (
//                 <span key={i}>{i + 1}</span>
//               ))}
//             </div>
//             <div className="text-center mt-2">Severity: {severity}</div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

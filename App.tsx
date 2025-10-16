"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import type { MoralTask, QuoteVerification } from "./types"
import { generateMoralTask, verifyQuotePositive } from "./services/geminiService"
import Header from "./components/Header"
import TaskCard from "./components/TaskCard"
import LoadingSpinner from "./components/LoadingSpinner"
import ErrorDisplay from "./components/ErrorDisplay"
import Footer from "./components/Footer"

const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 4v5h5M20 20v-5h-5M4 4a12.94 12.94 0 0115.15 2.85A12.94 12.94 0 0120 20"
    />
  </svg>
)

const App: React.FC = () => {
  const [task, setTask] = useState<MoralTask | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [quoteInput, setQuoteInput] = useState<string>("")
  const [verifyResult, setVerifyResult] = useState<QuoteVerification | null>(null)
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)

  const fetchNewTask = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setTask(null)
    try {
      const newTask = await generateMoralTask()
      setTask(newTask)
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred. The guru may be meditating. Please try again later.")
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleVerifyQuote = useCallback(async () => {
    if (!quoteInput.trim()) {
      setVerifyError("Please enter a quote to verify.")
      setVerifyResult(null)
      return
    }
    setVerifyLoading(true)
    setVerifyError(null)
    setVerifyResult(null)
    try {
      const result = await verifyQuotePositive(quoteInput.trim())
      setVerifyResult(result)
    } catch (err) {
      console.error(err)
      setVerifyError(err instanceof Error ? err.message : "Failed to verify quote. Please try again.")
    } finally {
      setVerifyLoading(false)
    }
  }, [quoteInput])

  useEffect(() => {
    fetchNewTask()
  }, [fetchNewTask])

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-black p-4 sm:p-6 md:p-8">
      <Header />

      <main className="flex flex-col items-center justify-center w-full max-w-2xl flex-grow text-center transition-opacity duration-500">
        {isLoading && <LoadingSpinner />}
        {error && !isLoading && <ErrorDisplay message={error} />}
        {task && !isLoading && <TaskCard key={task.task} task={task} />}

        <section className="w-full mt-10 text-left">
          <h2 className="text-xl font-semibold mb-3">Verify a Quote’s Positivity</h2>
          <label htmlFor="quote" className="sr-only">
            Enter quote
          </label>
          <textarea
            id="quote"
            value={quoteInput}
            onChange={(e) => setQuoteInput(e.target.value)}
            placeholder="Type or paste a quote here..."
            className="w-full p-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 backdrop-blur text-slate-900 dark:text-slate-100"
            rows={3}
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleVerifyQuote}
              disabled={verifyLoading}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition"
            >
              {verifyLoading ? "Verifying..." : "Verify Quote"}
            </button>
            <button
              onClick={() => {
                setQuoteInput("")
                setVerifyError(null)
                setVerifyResult(null)
              }}
              className="px-4 py-2 border rounded-md text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition"
            >
              Clear
            </button>
          </div>

          {verifyError && <div className="mt-3 text-red-600 dark:text-red-400">{verifyError}</div>}

          {verifyResult && (
            <div className="mt-4 rounded-lg border border-slate-300 dark:border-slate-700 p-4 bg-white/60 dark:bg-slate-900/50 backdrop-blur">
              <p className="font-semibold">
                Result:{" "}
                <span
                  className={
                    verifyResult.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }
                >
                  {verifyResult.isPositive ? "Positive" : "Not Positive"}
                </span>
              </p>
              {verifyResult.categories?.length > 0 && (
                <p className="mt-1 text-sm">
                  Categories:{" "}
                  <span className="text-slate-700 dark:text-slate-200">{verifyResult.categories.join(", ")}</span>
                </p>
              )}
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">Reason: {verifyResult.reason}</p>
            </div>
          )}
        </section>

        <button
          onClick={fetchNewTask}
          disabled={isLoading}
          className="mt-8 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? (
            "Contemplating..."
          ) : (
            <>
              <RefreshIcon />
              <span className="ml-2">Generate New Task</span>
            </>
          )}
        </button>
      </main>

      <Footer />
    </div>
  )
}

export default App

import React, { useState, useEffect } from "react";
import Timer from "../components/Time";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import Result from "./Result";

const apiUrl = import.meta.env.VITE_BACKEND_URI;

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flagged, setFlagged] = useState([]);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`${apiUrl}/quiz/start`, { withCredentials: true });
        setQuestions(res.data.quiz);
        setAttempt(res.data.attemptNumber);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);

        if (err.response?.status === 403) {
          toast.error(err.response.data.message || "You reached the maximum attempts!");
          setAttempt("max");
        } else {
          toast.error("Error loading quiz");
        }
      }
    };

    fetchQuiz();
  }, []);

  // Select answer
  const handleSelect = (option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questions[currentIndex]._id]: option,
    });
  };

  // Navigation
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevQuestion = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // Skip question
  const handleSkip = () => {
    const nextIndex = questions.findIndex((_, i) => !(i in selectedAnswers));
    if (nextIndex !== -1) setCurrentIndex(nextIndex);
  };

  // Flag question
  const handleFlag = () => {
    if (!flagged.includes(currentIndex)) setFlagged([...flagged, currentIndex]);
  };

  // Submit quiz
  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      toast.error("You must attempt all questions before submitting!");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        `${apiUrl}/quiz/submit`,
        {
          attemptNumber: attempt,
          answers: Object.entries(selectedAnswers).map(([quizId, selectedAnswer]) => ({
            quizId,
            selectedAnswer,
          })),
        },
        { withCredentials: true }
      );

      toast.success('Quiz Submitted Successfully');
      setTimeout(() => {
        setScore(res.data.score);
        setSubmitted(true);
        setIsSubmitting(false);
      }, 1000);
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Error submitting quiz");
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading quiz...</p>;
  if (!questions.length) return <p>No questions found.</p>;
  if (attempt === "max") {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-200">
        <h2 className="text-2xl font-bold text-red-600">
          You have reached the maximum of 5 attempts. 🚫
        </h2>
      </div>
    );
  }

  if (submitted) {
    return (


      <div className="w-full min-h-screen bg-gray-200 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">Quiz Completed 🎉</h2>
        <p className="text-xl">
          Your Score: <span className="font-semibold">{score}</span> / {questions.length}
        </p>
      </div>

    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <>
      <ToastContainer position="top-right" />
      <div className="w-full min-h-screen bg-gray-200 mt-2 p-5" >
        <h3 className="text-center text-2xl md:text-4xl bg-slate-500 text-white p-3">
          Start Quiz
        </h3>

        <div className="flex md:flex-row flex-col items-center justify-center gap-3 m-3">
          {/* Question + Options */}
          <div className="flex-5 bg-white shadow-md w-full h-[600px] rounded-md p-6">
            <h4 className="text-xl md:text-2xl font-semibold mb-6">
              Q{currentIndex + 1}. {currentQuestion.question}
            </h4>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left p-4 rounded-md transition ${selectedAnswers[currentQuestion._id] === option
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-blue-200"
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="md:flex-1 w-full bg-white shadow-md md:w-[400px] md:h-[600px] rounded-md flex flex-col items-center p-4">
            <div className="mb-6"><Timer /></div>

            <div className="flex flex-wrap gap-3 justify-center">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-center w-10 h-10 rounded-full cursor-pointer ${i === currentIndex
                      ? "bg-blue-500 text-white"
                      : i in selectedAnswers
                        ? "bg-green-500 text-white hover:bg-green-700"
                        : "bg-gray-500 text-white hover:bg-gray-700"
                    }`}
                  onClick={() => setCurrentIndex(i)}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="text-lg md:text-xl p-3 bg-gray-500 text-white w-[120px] rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={nextQuestion}
            disabled={currentIndex === questions.length - 1}
            className="text-lg md:text-xl p-3 bg-gray-500 text-white w-[120px] rounded-md disabled:opacity-50"
          >
            Next
          </button>
          <button
            onClick={handleFlag}
            className="text-lg md:text-xl p-3 bg-yellow-500 text-white w-[120px] rounded-md"
          >
            Flag
          </button>
          <button
            onClick={handleSkip}
            className="text-lg md:text-xl p-3 bg-red-500 text-white w-[120px] rounded-md"
          >
            Skip
          </button>
          {currentIndex === questions.length - 1 && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(selectedAnswers).length < questions.length}
              className="text-lg md:text-xl p-3 bg-green-600 text-white w-[120px] rounded-md disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Quiz;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_BACKEND_URI;

const RoomDetails = ({ user }) => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [joinMessage, setJoinMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchRoom = async () => {
    try {
      const res = await axios.get(`${apiUrl}/room/${id}`, { withCredentials: true });
      setRoom(res.data.room);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load room");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 3000); // refresh every 3s
    return () => clearInterval(interval);
  }, [id]);

  const handleStartQuiz = async () => {
    try {
      await axios.post(`${apiUrl}/room/start/${id}`, {}, { withCredentials: true });
      fetchRoom();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start quiz");
    }
  };

  const handleJoinRoom = async () => {
    try {
      await axios.post(`${apiUrl}/room/join/${id}`, {}, { withCredentials: true });
      setJoinMessage(`${user.name} joined successfully 🎉`);
      fetchRoom();
      setTimeout(() => setJoinMessage(""), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join room");
    }
  };

  const handleChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    try {
      const answersArray = Object.keys(answers)
        .map(key => {
          const question = room.questions.find(q => q.questionId.toString() === key);
          if (!question) return null;
          return { quizId: question.questionId, answer: answers[key]?.trim() };
        })
        .filter(Boolean);

      if (!answersArray.length) {
        toast.error("Answer at least one question.");
        return;
      }

      await axios.post(`${apiUrl}/room/submit/${id}`, { answers: answersArray }, { withCredentials: true });
      toast.success("Quiz submitted!");
      fetchRoom();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit quiz");
    }
  };

  if (loading) return <p className="text-center py-6">Loading...</p>;
  if (!room) return <p className="text-center py-6">No Room Found</p>;

  // Correctly check creator using id (not _id)
  const isCreator = user?.id === room.createdBy?.id;
  const currentPlayer = room.players.find(p => p.user?._id === user?.id);
  const isPlayerJoined = isCreator || !!currentPlayer;
  const isCompleted = currentPlayer?.completed || false;
  const questions = room.questions || [];
  const currentQuestion = questions[currentIndex];
  const showLeaderboard = currentPlayer?.completed || isCreator

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white shadow-md rounded-xl p-4">
        <div>
          <h2 className="text-2xl font-bold">{room.roomName}</h2>
          <p className="text-gray-600 text-sm">Created by {room.createdBy?.name}</p>
        </div>
        <span className="px-3 py-1 text-sm rounded-lg bg-gray-100 text-gray-700">
          Status: {room.status}
        </span>
      </div>

      {/* Join Message */}
      {joinMessage && <div className="mt-3 p-3 bg-green-100 rounded-lg text-green-700 text-center">{joinMessage}</div>}

      {/* Join Room */}
      {!isPlayerJoined && room.status === "waiting" && (
        <div className="text-center mt-6">
          <button onClick={handleJoinRoom} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Join Room</button>
        </div>
      )}

      {/* Start Quiz */}
      {isCreator && room.status === "waiting" && (
        <div className="text-center mt-6">
          <button onClick={handleStartQuiz} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Start Quiz</button>
        </div>
      )}

      {/* Quiz Questions */}
      {isPlayerJoined && room.status === "inprogress" && !isCompleted && currentQuestion && (
        <form className="mt-6 space-y-6" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          <div className="p-5 bg-white rounded-xl shadow-md">
            <p className="font-semibold mb-4">{currentIndex + 1}. {currentQuestion.question}</p>
            <div className="space-y-2">
              {currentQuestion.options.map((opt, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50 transition">
                  <input type="radio" name={currentQuestion.questionId.toString()} value={opt} checked={answers[currentQuestion.questionId.toString()] === opt} onChange={e => handleChange(currentQuestion.questionId.toString(), e.target.value)} className="accent-blue-600" />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex(prev => prev - 1)} className="px-5 py-2 bg-gray-400 text-white rounded-lg disabled:opacity-50 hover:bg-gray-500 transition">Previous</button>
            <button type="button" onClick={() => setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1))} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Next</button>
            <button type="button" onClick={() => setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1))} className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition">Skip</button>
            {currentIndex === questions.length - 1 && <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Submit Quiz</button>}
          </div>
        </form>
      )}

      {/* Leaderboard */}
      {showLeaderboard && (
        <div className="mt-8 p-5 bg-white rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-4 text-center">🎉 Leaderboard</h3>
          <ul className="space-y-2">
            {room.players.filter(p => p.completed).sort((a, b) => (b.score || 0) - (a.score || 0)).map((p, i) => (
              <li key={i} className="p-3 bg-gray-50 border rounded-lg flex justify-between">
                <span>#{i + 1} <b>{p.user?.name}</b></span>
                <span>Score: {p.score ?? 0} | Attempts: {p.attemptNumber ?? 1}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RoomDetails;

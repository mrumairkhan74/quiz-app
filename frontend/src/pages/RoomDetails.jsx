import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_BACKEND_URI;

const RoomDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [joinMessage, setJoinMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch room details
  const fetchRoom = async () => {
    try {
      const res = await axios.get(`${apiUrl}/room/${id}`, {
        withCredentials: true,
      });
      setRoom(res.data.room);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
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
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

 const handleSubmit = async () => {
  try {
    const answersArray = Object.keys(answers).map((key) => {
      const question = room.questions.find(q => q._id.toString() === key);
      return {
        quizId: question ? question._id : key,
        answer: answers[key],
      };
    });

    await axios.post(
      `${apiUrl}/room/submit/${id}`,
      { answers: answersArray },
      { withCredentials: true }
    );

    toast.success("Quiz submitted!");
    await fetchRoom();
  } catch (err) {
    console.error(err.response?.data);
    toast.error(err.response?.data?.message || "Failed to submit quiz");
  }
};


  if (loading) return <p className="text-center py-6">Loading...</p>;
  if (error) return <p className="text-center text-red-500 py-6">{error}</p>;
  if (!room) return <p className="text-center py-6">No Room Found</p>;

  const currentPlayer = room.players.find(
    (p) => p.user?.id?.toString() === user?.id?.toString()
  );

  const isCreator = user?.id?.toString() === room.createdBy?.id?.toString();
  const isPlayerJoined = isCreator || !!currentPlayer;
  const isCompleted = currentPlayer?.completed || false;

  if (!isPlayerJoined && room.status !== "waiting") {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-semibold">
          You must join the room to view this quiz.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-3 px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const questions = room.questions || [];
  const currentQuestion = questions[currentIndex];

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

      {/* Join message */}
      {joinMessage && (
        <div className="mt-3 p-3 bg-green-100 rounded-lg text-green-700 text-center font-medium shadow">
          {joinMessage}
        </div>
      )}

      {/* Join room */}
      {!isPlayerJoined && room.status === "waiting" && (
        <div className="text-center mt-6">
          <button
            onClick={handleJoinRoom}
            className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
          >
            Join Room
          </button>
        </div>
      )}

      {/* Quiz */}
      {isPlayerJoined && room.status === "inprogress" && !isCompleted && (
        <form
          className="mt-6 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {currentQuestion && (
            <div className="p-5 bg-white rounded-xl shadow-md">
              <p className="font-semibold mb-4">
                {currentIndex + 1}. {currentQuestion.questionText}
              </p>
              <div className="space-y-2">
                {currentQuestion.options.map((opt, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={opt}
                      checked={answers[currentQuestion.id] === opt}
                      onChange={(e) =>
                        handleChange(currentQuestion.id, e.target.value)
                      }
                      className="accent-blue-600"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="px-5 py-2 bg-gray-400 text-white rounded-lg disabled:opacity-50 hover:bg-gray-500 transition"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev < questions.length - 1 ? prev + 1 : prev
                )
              }
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Next
            </button>

            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev < questions.length - 1 ? prev + 1 : prev
                )
              }
              className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            >
              Skip
            </button>

            {currentIndex === questions.length - 1 && (
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </form>
      )}

      {/* Leaderboard */}
      {isPlayerJoined && isCompleted && (
        <div className="mt-8 p-5 bg-white rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-4 text-center">
            🎉 You’ve completed this quiz!
          </h3>

          <h4 className="text-lg font-semibold mb-3">Leaderboard</h4>
          {room.players.filter((p) => p.completed).length > 0 ? (
            <ul className="space-y-2">
              {room.players
                .filter((p) => p.completed)
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map((p, i) => (
                  <li
                    key={i}
                    className="p-3 bg-gray-50 border rounded-lg flex justify-between"
                  >
                    <span>
                      #{i + 1} <span className="font-medium">{p.user?.name}</span>
                    </span>
                    <span className="text-gray-700">
                      Score: <b>{p.score ?? 0}</b> | Attempts:{" "}
                      {p.attemptNumber ?? 1}
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500">No completed attempts yet</p>
          )}

          {isCreator && (
            <div className="text-center">
              <button
                onClick={handleStartQuiz}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Start Quiz Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Creator control */}
      {isCreator && room.status === "waiting" && (
        <div className="text-center mt-6">
          <button
            onClick={handleStartQuiz}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Start Quiz
          </button>
        </div>
      )}

      {/* Joined users */}
      <div className="mt-8 bg-white rounded-xl shadow-md overflow-x-auto">
        <h3 className="font-semibold p-4 border-b">Joined Users</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Status</th>
              <th className="p-3">Score</th>
              <th className="p-3">Attempts</th>
            </tr>
          </thead>
          <tbody>
            {room.players.map((p, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{p.user?.name || "Unknown"}</td>
                <td className="p-3">
                  {p.completed ? "✅ Completed" : "⏳ In Progress"}
                </td>
                <td className="p-3">{p.completed ? p.score ?? 0 : "-"}</td>
                <td className="p-3">{p.attemptNumber ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomDetails;

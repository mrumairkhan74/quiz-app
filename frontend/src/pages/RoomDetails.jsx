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

  // Start quiz (creator only)
  const handleStartQuiz = async () => {
    try {
      await axios.post(`${apiUrl}/room/start/${id}`, {}, { withCredentials: true });
      fetchRoom();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to start quiz");
    }
  };

  // Join room
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

  // Track answer changes
  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Submit quiz
  const handleSubmit = async () => {
    try {
      const answersArray = Object.keys(answers).map((quizId) => ({
        quizId,
        answer: answers[quizId],
      }));

      await axios.post(
        `${apiUrl}/room/submit/${id}`,
        { answers: answersArray },
        { withCredentials: true }
      );

      toast.success("Quiz submitted!");
      fetchRoom();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit quiz");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!room) return <p>No Room Found</p>;

  // Find current player info
  const currentPlayer = room.players.find((p) => {
    const playerId =
      typeof p.user === "object" ? p.user._id?.toString() : p.user?.toString();
    return playerId === user?._id?.toString();
  });

  // Creator is always considered joined
  const isCreator = user?._id?.toString() === room.createdBy?._id?.toString();
  const isPlayerJoined = isCreator || !!currentPlayer;
  const isCompleted = currentPlayer?.completed || false;

  // Only block if user is not creator AND not joined
  if (!isPlayerJoined && room.status !== "waiting") {
    return (
      <div className="p-4">
        <p className="text-red-500">You must join the room to view this quiz.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 px-4 py-2 bg-gray-300 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">{room.roomName}</h2>
      <p>Status: {room.status}</p>

      {joinMessage && (
        <div className="mt-2 p-2 bg-green-100 rounded text-green-800 font-semibold">
          {joinMessage}
        </div>
      )}

      {/* Join Room button */}
      {!isPlayerJoined && room.status === "waiting" && (
        <button
          onClick={handleJoinRoom}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md"
        >
          Join Room
        </button>
      )}

      {/* Quiz Form */}
      {isPlayerJoined && room.status === "inprogress" && !isCompleted && (
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {room.questions.map((q, idx) => (
            <div key={q._id || idx} className="mb-4 p-2 border rounded-md">
              <p className="font-semibold">
                {idx + 1}. {q.questionText}
              </p>
              {q.options.map((opt, i) => (
                <label key={i} className="block mt-1">
                  <input
                    type="radio"
                    name={q._id}
                    value={opt}
                    checked={answers[q._id] === opt}
                    onChange={(e) => handleChange(q._id, e.target.value)}
                  />{" "}
                  {opt}
                </label>
              ))}
            </div>
          ))}
          <button
            type="submit"
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Submit Quiz
          </button>
        </form>
      )}

      {/* Start Quiz button for creator */}
      {room.status === "waiting" && isCreator && (
        <button
          onClick={handleStartQuiz}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md"
        >
          Start Quiz
        </button>
      )}

      {/* All joined users */}
      <div className="mt-4">
        <h3 className="font-semibold">Joined Users</h3>
        <ul>
          {room.players.map((p, i) => (
            <li key={i}>
              {p.user?.name || "Unknown"} {p.completed ? "(Completed)" : ""}
            </li>
          ))}
        </ul>
      </div>

      {/* Leaderboard */}
      {/* Leaderboard */}
      {(room.players.some((p) => p.completed) || room.status === "finished") && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-2">Leaderboard</h3>
          {room.players.filter((p) => p.completed).length > 0 ? (
            <ul>
              {room.players
                .filter((p) => p.completed)
                .sort((a, b) => b.score - a.score)
                .map((p, i) => (
                  <li key={i} className="mb-1">
                    #{i + 1} {p.user?.name || "Unknown"} - Score: {p.score} - Attempts:{" "}
                    {p.attemptNumber}
                  </li>
                ))}
            </ul>
          ) : (
            <p>No completed attempts yet</p>
          )}
        </div>
      )}

    </div>
  );
};

export default RoomDetails;

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_BACKEND_URI;

const Room = ({ user }) => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load more rooms
  const loadMore = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  // Fetch rooms
  const getRooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${apiUrl}/room/all?page=${page}&limit=10`,
        { withCredentials: true }
      );
      if (page === 1) setRooms(res.data.rooms);
      else setRooms((prev) => [...prev, ...res.data.rooms]);
      setTotalPages(res.data.totalPages);
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) setRooms([]);
      else {
        const msg = err.response?.data?.message || "Failed to fetch rooms";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Join a room
  const handleJoinRoom = async (id) => {
    try {
      await axios.post(
        `${apiUrl}/room/join/${id}`,
        {},
        { withCredentials: true }
      );
      toast.success(`${user.name} joined successfully 🎉`, { autoClose: 1000 });
      setTimeout(() => {
        navigate(`/roomDetail/${id}`);
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join room");
    }
  };

  // Delete a room
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/room/${id}`, { withCredentials: true });
      toast.success("Room deleted successfully");
      getRooms();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete room";
      setError(msg);
      toast.error(msg);
    }
  };

  useEffect(() => {
    getRooms();
  }, [page]);

  return (
    <div className="bg-gray-200 w-full min-h-screen p-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-200 rounded-md p-3">
        <h4 className="text-2xl md:text-3xl font-[Poppins] tracking-wide">
          All Rooms
        </h4>
        <Link
          to={"/create"}
          className="bg-green-600 px-3 py-2 rounded-md text-white hover:bg-green-700 transition"
        >
          Create Room
        </Link>
      </div>

      {/* No Rooms */}
      {rooms.length === 0 && !loading && (
        <p className="text-center text-xl mt-10 text-gray-600">
          {error || "No Room Available"}
        </p>
      )}

      {/* Rooms List */}
      {rooms.map((r) => {
        const isJoined = r.players?.some((p) => {
          const playerId = typeof p.user === "object" ? p.user._id : p.user;
          return playerId?.toString() === user?.id?.toString();
        });

        return (
          <div
            key={r._id}
            className="flex justify-between items-center p-3 bg-white rounded-md mt-5 shadow-sm"
          >
            <div>
              <p className="text-[12px] text-slate-500">
                {new Date(r.createdAt).toLocaleString()}
              </p>
              <Link to={`/roomDetail/${r._id}`}>
                <h3 className="text-xl md:text-2xl font-[Poppins] hover:underline">
                  {r.roomName}
                </h3>
              </Link>
              <p className="text-[12px] text-slate-500">
                {r.createdBy?.name || "Unknown"}
              </p>
            </div>

            <p className="text-[12px] text-slate-500">
              Players: {r.playerCount ?? (r.players?.length || 0)}
            </p>

            {isJoined ? (
              <div className="flex items-center gap-3">
                <button className="bg-gray-400 px-3 py-2 rounded-md text-white cursor-not-allowed">
                  Joined
                </button>
                {user?.id === r.createdBy?._id && (
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition"
                  >
                    Delete Room
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleJoinRoom(r._id)}
                  className="bg-green-500 px-3 py-2 rounded-md text-white hover:bg-green-600 transition"
                >
                  Join Room
                </button>

              </div>
            )}
          </div>
        );
      })}

      {/* Pagination */}
      {page < totalPages && rooms.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Room;

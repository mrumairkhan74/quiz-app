import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const apiUrl = import.meta.env.VITE_BACKEND_URI;

const Room = ({ user }) => {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const loadMore = () => {
        if (page < totalPages) setPage(prev => prev + 1);
    };

    const getRooms = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/room/all?page=${page}&limit=10`, { withCredentials: true });
            if (page === 1) setRooms(res.data.rooms);
            else setRooms(prev => [...prev, ...res.data.rooms]);
            setTotalPages(res.data.totalPages);
            setError(null);
        } catch (err) {
            if (err.response?.status === 404) setRooms([]);
            else setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async (roomId) => {
        try {
            await axios.post(`${apiUrl}/room/join/${roomId}`, {}, { withCredentials: true });
            toast.success(`${user.name} joined successfully 🎉`, { autoClose: 1000 });
            setTimeout(() => {
                navigate(`/roomDetail/${roomId}`);
            }, 1000);
        } catch (err) {
            toast.error(err.response?.data || "Failed to join room");
        }
    };

    useEffect(() => { getRooms(); }, [page]);

    return (
        <div className="bg-gray-200 w-full min-h-screen p-4">
            <div className="flex justify-between items-center bg-blue-200 rounded-md p-3">
                <h4 className='text-2xl md:text-3xl font-[Poppins] tracking-wide'>All Rooms</h4>
                <Link to={'/create'} className='bg-green-600 px-3 py-2 rounded-md text-white'>Create Room</Link>
            </div>

            {rooms.length === 0 && !loading && (
                <p className="text-center text-xl mt-10 text-gray-600">{error || "No Room Available"}</p>
            )}

            {rooms.map(r => {
                const isJoined = r.players?.some(p => {
                    const playerId = typeof p.user === "object" ? p.user._id : p.user;
                    return playerId?.toString() === user?._id?.toString();
                });

                return (
                    <Link to={`/roomDetail/${r._id}`} key={r._id} className="flex justify-between items-center p-3 bg-white rounded-md mt-5">
                        <div>
                            <p className='text-[12px] text-slate-500'>{new Date(r.createdAt).toLocaleString()}</p>
                            <h3 className='text-xl md:text-2xl font-[Poppins]'>{r.roomName}</h3>
                            <p className='text-[12px] text-slate-500'>{r.createdBy?.name || "Unknown"}</p>
                        </div>
                        <p className='text-[12px] text-slate-500'>Players: {r.playerCount ?? (r.players?.length || 0)}</p>
                        {isJoined ? (
                            <button className='bg-gray-400 px-3 py-2 rounded-md text-white cursor-not-allowed'>Joined</button>
                        ) : (
                            <button onClick={() => handleJoinRoom(r._id)} className='bg-green-200 px-3 py-2 rounded-md'>Join Room</button>
                        )}
                    </Link>
                );
            })}

            {page < totalPages && rooms.length > 0 && (
                <div className="flex justify-center mt-4">
                    <button onClick={loadMore} className="px-4 py-2 bg-blue-500 text-white rounded-md" disabled={loading}>
                        {loading ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Room;

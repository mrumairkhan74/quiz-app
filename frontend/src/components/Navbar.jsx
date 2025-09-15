import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const apiUrl = import.meta.env.VITE_BACKEND_URI;

const Navbar = ({ user, setUser }) => {
    const [isOpen, setIsOpen] = useState(false);


    const navigate = useNavigate()


    const handleLogout = async () => {
        try {
            await axios.post(`${apiUrl}/user/logout`, {}, { withCredentials: true })
            toast.success('Logout Successfully');
            setTimeout(() => {
                navigate('/')
            }, 1000)
            setUser(null)
        } catch (error) {
            console.err(error)
        }
    }

    // If no user, don't render navbar

    return (
        <>
            <ToastContainer position="top-right" />
            <nav className="w-full flex items-center p-4 bg-slate-500 justify-between relative z-999">
                {/* Logo */}
                <div className="logo text-2xl text-white font-bold tracking-wide">
                    Quiz{" "}
                    <span className="text-slate-500 bg-white rounded-r-md px-3 py-2">
                        App
                    </span>
                </div>

                {/* Toggle button (mobile) */}
                <button
                    className="text-white text-2xl md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? "✖" : "☰"}
                </button>

                {/* Links */}
                <div
                    className={`${isOpen ? "flex" : "hidden"
                        } absolute top-full left-0 w-full bg-slate-500 md:bg-none md:static md:flex md:w-auto`}
                >
                    <ul className="flex flex-col md:flex-row items-center w-full md:w-auto ">
                        <Link
                            to="/home"
                            className=" text-xl text-white px-4 py-2 hover:bg-white hover:text-slate-500 rounded-md"
                        >
                            Home
                        </Link>
                        <Link
                            to="/quiz"
                            className="text-xl text-white px-4 py-2 hover:bg-white hover:text-slate-500 rounded-md"
                        >
                            Quiz
                        </Link>
                        <Link
                            to="/result"
                            className="text-xl text-white px-4 py-2 hover:bg-white hover:text-slate-500 rounded-md"
                        >
                            Result
                        </Link>
                        <Link
                            to="/room"
                            className="text-xl text-white px-4 py-2 hover:bg-white hover:text-slate-500 rounded-md"
                        >
                            Room
                        </Link>
                    </ul>
                </div>

                {/* User name */}
                <div className="hidden md:block">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl text-white font-bold tracking-[3px]">
                                {user?.name}
                            </h3>
                            <button onClick={handleLogout} className="bg-red-500 text-white rounded-md px-3 py-1">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="text-white text-xl">Login</Link>
                    )}
                </div>

            </nav>
        </>
    );
};

export default Navbar;

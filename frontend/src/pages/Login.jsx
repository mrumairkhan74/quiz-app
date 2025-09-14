import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Background from '../components/Background'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'


const apiUrl = import.meta.env.VITE_BACKEND_URI

const Login = ({ setIsLoggedIn, setUser }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.post(`${apiUrl}/user/login`, { email, password }, { withCredentials: true })

            setUser(res.data.user);
            setIsLoggedIn(true)
            toast.success('Login Successfully')
            setTimeout(() => {
                navigate('/home')
            }, 1000)
        } catch (error) {
            console.error(error)
            navigate('/')
        }
    }

    return (
        <>
            <Background />
            <ToastContainer position={"top-right"} />
            <div className="relative min-h-screen flex items-center p-4 z-50">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-md md:w-[500px] h-[380px] w-[300px]">
                    <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center m-5">
                        <h4 className="text-center text-slate-500 text-3xl tracking-wide p-3 font-bold">Login</h4>

                        {/* Email Input */}
                        <input
                            type="email"
                            className="p-2 border-b-2 bg-slate-100 w-full outline-none m-3"
                            name="email"
                            id="email"
                            placeholder="Enter Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        {/* Password Input + Toggle */}
                        <div className="relative w-full m-3">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="p-2 border-b-2 bg-slate-100 w-full outline-none"
                                name="password"
                                id="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-blue-500"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        {/* Signup Link */}
                        <p className="w-full text-left text-sm text-slate-600">
                            Create New Account?{" "}
                            <Link to="/signup" className="text-slate-600 font-bold hover:underline">
                                Signup
                            </Link>
                        </p>

                        {/* Submit Button */}
                        <button className="text-center p-2 m-3 bg-slate-500 w-full rounded-md text-xl text-white">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Login

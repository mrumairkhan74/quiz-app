import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'

const apiUrl = import.meta.env.VITE_BACKEND_URI

const Signup = ({ setIsLoggedIn, setUser }) => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${apiUrl}/user/create`, { name, email, password }, { withCredentials: true })
            setUser(res.data.user);
            setIsLoggedIn(true)
            toast.success("USer created Successfully")
            setTimeout(() => {
                navigate('/home')
            }, 1000)
        } catch (error) {
            setTimeout(() => { return navigate('/') })
            toast.error(error)

        }
    }
    return (
        <>
            <Background />
            <ToastContainer position='top-right' />
            <div className='relative min-h-screen flex item-center p-4 z-50'>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-md md:w-[600px] h-[400px] w-[300px] m-0 ">
                    <form action="" onSubmit={handleSubmit} className='flex flex-col justify-center items-center m-5'>
                        <h4 className='text-center text-slate-500 text-3xl tracking-wide p-3 font-bold'>SignUp</h4>
                        <input type="text" className='p-2 border-b-2 bg-slate-100 w-full   outline-none m-3' name="name" id="" placeholder='Enter Name' value={name} onChange={(e) => setName(e.target.value)} />
                        <input type="email" className='p-2 border-b-2 bg-slate-100 w-full   outline-none m-3' name="email" id="" placeholder='Enter Email' value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="password" className='p-2 border-b-2 bg-slate-100 w-full  outline-none m-3' name="password" id="" placeholder='Enter password' value={password} onChange={(e) => setPassword(e.target.value)} />
                        <p className="w-full text-left text-sm text-slate-600">
                            I've an Account?{" "}
                            <Link to="/login" className="text-slate-600 font-bold hover:underline">
                                Login
                            </Link>
                        </p>

                        <button className='text-center p-2 m-3 bg-slate-500 w-full rounded-md md:text-1xl text-xl text-white '>Signup</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Signup
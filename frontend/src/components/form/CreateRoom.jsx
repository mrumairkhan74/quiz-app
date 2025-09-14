
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'

const apiUrl = import.meta.env.VITE_BACKEND_URI
const CreateRoom = () => {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [roomName, setRoomName] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${apiUrl}/room/create`, { roomName }, { withCredentials: true });
            toast.success("Room Created SuccessFully")
            setTimeout(() => {
                navigate('/room')
            }, 1000)
        }
        catch (error) {
            setError(error)
            toast.error("Error While creating Room")
        } finally {
            setLoading(false)
        }
    }

    if (loading) <p className='text-center'>Loading....</p>
    if (error) <p className='text-center'>{error}</p>

    return (
        <div className='bg-gray-200 w-full min-h-screen relative'>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[300px] md:w-[400px] h-[200px] p-3 rounded-md">
                <h5 className='text-center md:text-3xl text-2xl '>Create Room</h5>
                <form action="" onSubmit={handleSubmit} className='flex flex-col gap-3'>
                    <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder='Enter Room Name' className='bg-slate-200 rounded-md p-3 w-full mt-3 focus:outline-green-600 focus:bg-white  ' />
                    <button onSubmit={handleSubmit} className='bg-green-600 px-3 py-2 rounded-md text-white'>Create</button>
                </form>
            </div>
        </div>
    )
}

export default CreateRoom
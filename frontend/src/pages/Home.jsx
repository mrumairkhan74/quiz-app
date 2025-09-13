import React from 'react'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'
import Table from '../components/Table'
const Home = () => {
    return (
        <>

            <div className='relative w-full md:h-[400px] h-[300px] bg-gray-200'>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col m-3 items-center">
                    <h2 className='text-2xl md:text-5xl text-slate-900'>Start Your Quiz Now</h2>
                    <Link to={'/quiz'} className='text-center bg-slate-500 text-white p-3 rounded-md text-xl mt-3 hover:bg-white hover:text-slate-500 hover:font-bold'>Start Quiz</Link>
                </div>
            </div>
            <Table/>
        </>
    )
}

export default Home
import React from 'react'

const Background = () => {
    return (
        <div className='inset-0 w-full h-full z-0 fixed'>
            <img src="./images/bg.jpg" className='w-full h-full object-cover mask-b-from-20% mask-b-to-90%' loading='lazy' alt="" />
        </div>
    )
}

export default Background
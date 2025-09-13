import React, { useState, useEffect } from "react";

const Timer = () => {
    const [time, setTime] = useState(90); // start with 90 seconds

    useEffect(() => {
        if (time <= 0) return; // stop at 0
        const interval = setInterval(() => {
            setTime((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval); // cleanup
    }, [time]);

    return (
        <div className="time bg-gray-500 p-5 rounded-full m-5 text-2xl text-white font-bold">
            {time}s
        </div>
    );
};

export default Timer;

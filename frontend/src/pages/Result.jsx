import React, { useEffect, useState } from "react";
import { MdAppRegistration } from "react-icons/md";
import axios from 'axios';
const apiUrl = import.meta.env.VITE_BACKEND_URI;

const Result = () => {
  const [totalResult, setTotalResult] = useState({ attempts: 0, score: 0, name: "N/A" });

  const getResult = async () => {
    try {
      const res = await axios.get(`${apiUrl}/quiz/result`, { withCredentials: true });
      const results = res.data.results;

      if (results.length > 0) {
        const totalScore = results.reduce((acc, curr) => acc + Number(curr.score), 0);
        const totalAttempts = results.length;
        const userName = results[0].user?.name || "N/A";

        setTotalResult({ attempts: totalAttempts, score: totalScore, name: userName });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getResult();
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-gray-200 flex items-center justify-center">
      <div className="w-[300px] md:w-[600px] h-auto bg-white rounded-md shadow-md p-6">
        {/* Icon and Heading */}
        <div className="flex flex-col items-center justify-center mb-6">
          <MdAppRegistration className="md:text-9xl text-5xl text-green-700" />
          <h4 className="md:text-4xl text-2xl font-bold tracking-wide font-[Poppins]">
            Total Result
          </h4>
        </div>

        {/* Total Result */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-between w-3/4 border-b pb-2">
            <h5 className="font-semibold text-gray-700">Name:</h5>
            <h5 className="text-gray-900">{totalResult.name}</h5>
          </div>
          <div className="flex justify-between w-3/4 border-b pb-2">
            <h5 className="font-semibold text-gray-700">Total Score:</h5>
            <h5 className="text-gray-900">{totalResult.score}</h5>
          </div>
          <div className="flex justify-between w-3/4 border-b pb-2">
            <h5 className="font-semibold text-gray-700">Total Attempts:</h5>
            <h5 className="text-gray-900">{totalResult.attempts}</h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;

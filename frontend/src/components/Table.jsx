import React, { useState, useEffect } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_BACKEND_URI;

const Table = () => {
  const [users, setUsers] = useState([]);

  const getUsers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/user/all`, {
        withCredentials: true,
      });
      setUsers(res.data.users); // make sure your API returns an array
    } catch (error) {
      console.error("Invalid fetch error:", error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="relative w-full overflow-x-auto bg-gray-100 p-4 rounded-md shadow-md my-3">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-300">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Total Attempt</th>
            <th className="p-2 border">Score</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u, index) => (
              <tr key={index} className="hover:bg-gray-200">
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">
                  {u.result?.length > 0 ? u.result.length : 0}
                </td>
                <td className="p-2 border">
                  {u.result?.length > 0
                    ? u.result.reduce((acc, r) => acc + Number(r.score), 0)
                    : 0}
                </td>



              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center p-4">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

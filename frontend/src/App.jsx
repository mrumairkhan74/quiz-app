import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Outlet } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Quiz from "./pages/Quiz";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./ProtectedRoute";
import Result from "./pages/Result";

const apiUrl = import.meta.env.VITE_BACKEND_URI;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null)
  useEffect(() => {
    axios.get(`${apiUrl}/user/me`, { withCredentials: true })
      .then((res) => {
        setIsLoggedIn(true)
        setUser(res.data)

      })
      .catch(() => {
        setIsLoggedIn(false)
        setUser(null)
      });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
              <>
                <Navbar user={user} />
                <Outlet />
              </>
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/result" element={<Result user={user} />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;

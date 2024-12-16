// src/app/components/Login.tsx

import { useState } from "react";
import { loginUser, registerUser } from "./api";
import { sha256 } from 'crypto-hash';


//makes sure the Login component gets the correct data and functions
interface LoginProps {
  isLogin: boolean;
  toggleLogin: () => void;
  setIsLoggedIn: (value: boolean) => void; 
}

//collects user input, handles login/sign-up logic, and passes login status back
export default function Login({ isLogin, toggleLogin, setIsLoggedIn }: LoginProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  //when submitted
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
        if (!isLogin) {
            const isValidUsername = /^[^\s]+$/.test(username); 
            if (!isValidUsername) {
                setError("Username cannot contain spaces");
                return;
            }

            // Hash the password using SHA-256
            const hashedPassword = await sha256(password);
            await registerUser(username, email, hashedPassword); 
            setIsLoggedIn(true); 
            localStorage.setItem('username', username); 
        } else {
            // Hash the password for login
            const hashedPassword = await sha256(password);
            const userData = await loginUser(email, hashedPassword); 

            // Check if userData is returned successfully
            if (userData && userData.user) { 
                setIsLoggedIn(true);
                localStorage.setItem('username', userData.user.username); 
            } else {
                setError("Login failed: No user data returned.");
            }
        }
    } catch (error) {
        setError("An error occurred during login/registration.");
        console.error(error);
    }
};


  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md">
          <h2 className="text-center text-2xl font-bold mb-6">
            {isLogin ? "Login" : "Register"}
          </h2>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                  placeholder="Enter your username"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>
          <p className="text-center text-sm mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <span
              onClick={toggleLogin}
              className="text-blue-500 cursor-pointer"
            >
              {isLogin ? "Register here" : "Login here"}
            </span>
          </p>
        </div>
      </div>
    </>
  );
}

"use client";
import "../globals.css";
import Navbar from '../components/design/navbar';
import { useEffect, useState } from "react";
import { searchUser } from "../api.js";
import Logo from "../components/design/y_logo.png";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  username: string;
}

export default function Wall() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loggedInUsername, setLoggedInUsername] = useState<string | null>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedIn) {
      router.push('/');
    }
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setLoggedInUsername(storedUsername);
    }
  }, [router]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      console.warn("Search term is empty");
      return;
    }
    try {
      const users: User[] = await searchUser(searchTerm);
      setSearchResults(users);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleUserClick = (username: string) => {
    if (loggedInUsername === username) {
      router.push(`/profile/`);
    } else {
      router.push(`/users/${username}`);
    }
  };

  // lets you use enter key
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <Navbar />
      <div className="pt-8 bg-white-50 flex justify-center">
        <div className="max-w-3xl w-full mx-auto bg-white p-8 shadow-lg rounded-lg">
          <div className="flex justify-center mb-6">
            <Image src={Logo} alt="Logo" width={400} height={80} />
          </div>

          <div className="mb-2 flex justify-center flex-col items-center">
            <div className="w-full flex justify-center">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="p-2 border rounded w-3/4"
              />
              <button 
                onClick={handleSearch} 
                className="ml-2 p-2 bg-black text-white rounded">
                Search
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 w-3/4 text-left">
                <h3 className="text-xl font-semibold mb-2">Search Results:</h3>
                <ul>
                  {searchResults.map((user) => (
                    <li 
                      key={user._id} 
                      onClick={() => handleUserClick(user.username)}
                      className="cursor-pointer hover:underline text-black-600"
                    >
                      {user.username}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

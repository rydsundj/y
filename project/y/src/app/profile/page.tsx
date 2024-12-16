"use client";
import "../globals.css"; 
import Navbar from '../components/design/navbar'; 
import React, { useState, useEffect } from "react";
import { postMessage, loadMessagesForUser, fetchFriendRequest, fetchFriends, acceptFriendRequest } from '../api'; 
import { useRouter } from 'next/navigation';
import Button from "../components/design/button";


interface Message {
  sender?: string; 
  id: string;
  name: string;
  message: string;
  time: string;
}

interface FriendRequest {
  id: string;  
  username: string; 
}

interface Friend {
  id: string;  
  username: string; 
}

export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState(""); 
  const [textMsg, setTextMsg] = useState(""); 
  const [messages, setMessages] = useState<Message[]>([]); 
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]); 
  const [friends, setFriends] = useState<Friend[]>([]); 

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'; 
    if (!loggedIn) {
      router.push('/'); 
    }

    const storedUsername = localStorage.getItem('username'); 
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [router]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (username) {
        try {
          const loadedMessages = await loadMessagesForUser(username); 
          const sortedMessages = loadedMessages.sort(
            (a: Message, b: Message) => new Date(b.time).getTime() - new Date(a.time).getTime()
          );
          setMessages(sortedMessages);
        } catch (error) {
          console.log("Error loading messages:", error);
        }
      }
    };

    fetchMessages();
  }, [username]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (username) {
        try {
          const newFriendRequest = await fetchFriendRequest({ username });
          setFriendRequests(newFriendRequest);
        } catch (error) {
          console.log("Error loading friend requests:", error);
        }
      }
    };
  
    fetchFriendRequests();
  }, [username]);  

  useEffect(() => {
    const fetchFriendsList = async () => {
      if (username) {
        try {
          const loadedFriends = await fetchFriends({ username });
          setFriends(loadedFriends);
        } catch (error) {
          console.log("Error loading friends:", error);
        }
      }
    };

    fetchFriendsList();
  }, [username]);

  const handlePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    try {
      const newMessage = await postMessage({ name: username, message: message }); 
      setMessages((prevMessages) => [newMessage, ...prevMessages]); 
      setMessage(""); 
      setTextMsg("Message posted successfully!"); 
    } catch (error) {
      setTextMsg("Error posting message: " + error);
    }
  };

  const handleAccept = async (request: FriendRequest) => {
    try {
      await acceptFriendRequest({ senderUsername: request.username, receiverUsername: username });
      const updatedFriendRequests = await fetchFriendRequest({ username });
      setFriendRequests(updatedFriendRequests);
      const updatedFriends = await fetchFriends({ username });
      setFriends(updatedFriends);
      setTextMsg(`You accepted the friend request from ${request.username}`);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  return (
<div>
  <Navbar />
  <div className="min-h-screen p-8 flex"> {/* Change to flex for side-by-side layout */}
    
    {/* Friends div on the left */}
    <div className="max-w-sm bg-white p-5 shadow-md rounded-lg mr-4"> {/* Adjust margin-right for spacing */}
      <h3 className="text-xl font-bold mb-4">Friend Requests:</h3>
      {friendRequests.length === 0 ? (
        <p>No friend requests yet.</p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.id} className="request-item flex justify-between items-center p-2 border-b">
            <span>{request.username}</span>
            <Button text="Accept" onClick={() => handleAccept(request)} />
          </div>
        ))
      )}
      <div className="mb-6 border-b pb-2"></div>
      <h3 className="text-xl font-bold">Friends:</h3>
      <div className="mt-4">
        {friends.length === 0 ? (
          <p>No friends yet.</p>
        ) : (
          friends.map((friend) => (
            <div key={friend.id} className="p-2 border-b">
              <strong>{friend.username}</strong>
            </div>
          ))
        )}
      </div>
    </div>

    {/* Profile div on the right */}
    <div className="flex-grow"> 
      <div className="w-[900px] bg-white p-5 shadow-md rounded-lg mx-auto"> {/* Center the profile div */}
        <h2 className="text-2xl font-bold mb-4 text-center">Welcome, {username}!</h2>
        <div id="inputBox" className="card p-4 mx-auto">
          <form name="form1" onSubmit={handlePost}>
            <div className="mb-3">
              <textarea
                className="form-control w-full p-2 border border-gray-300 rounded-md"
                id="input2"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)} 
                style={{ backgroundColor: 'lightgrey' }} 
                placeholder="Type your message here..."
              />
            </div>
            <div className="d-grid">
              <Button text="Submit" type="submit"   />
            </div>
            {textMsg && <div id="textMsg" className="mt-2 text-green-600">{textMsg}</div>} 
          </form>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font">Posts:</h3>
          <div className="mt-4 flex flex-col">
            {messages.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="message-bubble bg-gray-100 p-3 my-1 rounded-md"
                >
                  <strong>{msg.sender ? msg.sender : msg.name}</strong> {msg.message}
                  <em>
                    {new Date(msg.time).toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' })} {new Date(msg.time).toLocaleTimeString('sv-SE', { timeZone: 'Europe/Stockholm', hour12: false, hour: '2-digit', minute: '2-digit' })}
                  </em>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  </div>
</div>

  );
}

"use client"; 
import "../../globals.css"; 
import Navbar from '../../components/design/navbar'; 
import { useState, useEffect } from "react";
//import { useRouter } from "next/navigation";
import { useParams } from "next/navigation"; 
import { loadMessagesForUser, sendFriendRequest, checkFriendship, postFriendMessage } from '../../api'; 
import Button from "../../components/design/button";

interface Message {
  sender?: string; 
  id: string;
  name: string;
  message: string;
  time: string;
}

export default function UserProfile() {
  //const router = useRouter();
  const { username } = useParams(); 
  const [isFriendRequestSent, setIsFriendRequestSent] = useState(false); 
  const [isFriends, setIsFriends] = useState(false); 
  const [loggedInUsername, setLoggedInUsername] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]); 
  const [message, setMessage] = useState(""); 
  const [textMsg, setTextMsg] = useState(""); 
  const [hasReceivedRequest, setHasReceivedRequest] = useState(false); // Track incoming friend requests


  useEffect(() => {
    const storedUsername = localStorage.getItem('username'); 
    if (storedUsername) {
      setLoggedInUsername(storedUsername);
    }

    const checkFriendshipStatus = async () => {
      if (!username || !loggedInUsername) return;
      try {
        const { isFriends, isRequestPending, isRequestReceived } = await checkFriendship({
          loggedInUsername,
          profileUsername: username
        });
    
        setIsFriends(isFriends);
        setIsFriendRequestSent(isRequestPending);
        setHasReceivedRequest(isRequestReceived); // New state to track received requests
      } catch (error) {
        console.error("Error checking friendship status:", error);
      }
    };
    

    checkFriendshipStatus();

    const fetchUserMessages = async () => {
      if (!username) return;
      try {
        const userMessages = await loadMessagesForUser(username as string); 
        
        const sortedMessages = userMessages.sort(
          (a: Message, b: Message) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );

        setMessages(sortedMessages);
      } catch (error) {
        console.error("Error loading user messages:", error);
      }
    };
    
    fetchUserMessages();
  }, [username, loggedInUsername]);

  const handleFriendRequest = async () => {
    try {
      if (!username) return;
  
      await sendFriendRequest({
        senderUsername: loggedInUsername,  
        receiverUsername: username  
      });
  
      setIsFriendRequestSent(true);
      console.log("Friend request sent");
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleFriendPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    try {
      const newMessage = await postFriendMessage({senderUsername: loggedInUsername, recipientUsername: username, message: message }); 
      setMessages((prevMessages) => [newMessage, ...prevMessages]); 
      setMessage(""); 
      setTextMsg("Message posted successfully!"); 
    } catch (error) {
      setTextMsg("Error posting message: " + error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex-grow flex p-8 justify-center"> {/* Use justify-center to center the profile div */}
        <div className="w-[900px] bg-white p-5 shadow-md rounded-lg"> 
          <h2 className="text-2xl font-bold mb-4 text-center">Profile of {username}</h2>
          {isFriends && ( 
            <div id="inputBox" className="card p-4 mx-auto">
              <form name="form1" onSubmit={handleFriendPost}>
                <div className="mb-3">
                  <textarea
                    className="form-control w-full p-2 border border-gray-300 rounded-md" // Add full width and styling
                    id="input2"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}  
                    style={{ backgroundColor: 'lightgrey' }} 
                    placeholder="Type your message here..."
                  />
                </div>
                <div className="d-grid">
                  <Button text="Submit" type="submit" />
                </div>
                {textMsg && <div id="textMsg" className="mt-2 text-danger">{textMsg}</div>} 
              </form>
            </div>
          )}
          
          <div className="mt-6 flex items-center justify-between">
              <h3 className="text-xl font">Posts:</h3>
              {!isFriends ? (
                isFriendRequestSent ? (
                  <p className="text-green-500">Pending Request</p>
                ) : hasReceivedRequest ? (
                  <p className="text-blue-500">{username} sent you a friend request</p>
                ) : (
                  <Button 
                    text="Add Friend"
                    onClick={handleFriendRequest} 
                    disabled={isFriendRequestSent} 
                    style={{
                      backgroundColor: "blue",
                      cursor: "pointer",
                    }}
                  />
                )
              ) : (
                <p className="text-blue-500">Already friends</p> 
              )}
            </div>



          
          <div className="mt-4 flex flex-col">
            {messages.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="message-bubble bg-gray-100 p-3 my-1 rounded-md">
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
  );
}

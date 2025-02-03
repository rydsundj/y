// api.js

const port = 3005;
const API_URL = `http://localhost:${port}`;


//USER STUFF
export const registerUser = async (username, email, password) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) {
      throw new Error('API: Registration failed');
    }
    return await response.json(); 
  };
  
  export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  
    if (!response.ok) {
      throw new Error('API: Login failed');
    }
  
    const data = await response.json();
    console.log("hello!!!");
  
    if (response.ok) {
      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      console.log("hello", data.token);
      return data; // Ensure the correct user data (including username) is returned here
    } else {
      console.error('Login failed:', data.error);
    }
  };
  
  

  export const searchUser = async (searchTerm) => {
    try {
        const response = await fetch(`${API_URL}/search-users?q=${encodeURIComponent(searchTerm)}`, {
            method: "GET",
        });
        if (!response.ok) {
            throw new Error('Search failed');
        }

        return await response.json();
    } catch (error) {
        console.error("API: Error fetching search results:", error);
        throw error;
    }
};




//FRIEND STUFF
export const sendFriendRequest = async ({ senderUsername, receiverUsername }) => {
  const response = await fetch(`${API_URL}/send-friend-request`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },


    body: JSON.stringify({ senderUsername, receiverUsername }),
    
  });

  console.log("RESPONSE send:", response);

  if (!response.ok) {
    throw new Error("API: Failed to send friend request");
  }

  return await response.json();
};


export const fetchFriendRequest = async ({ username }) => {
  const response = await fetch(`${API_URL}/fetch-friend-request?username=${encodeURIComponent(username)}`, {
    method: "GET",
  });
  console.log("API RESPONSE FETCH:", response);

  if (!response.ok) {
    throw new Error("API: Failed to fetch friend requests");
  }
  return await response.json(); 
 };

 
export const acceptFriendRequest = async ({ senderUsername, receiverUsername }) => {
  const response = await fetch(`${API_URL}/accept-friend-request?username=${encodeURIComponent(receiverUsername)}`, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({ senderUsername, receiverUsername }),
    
  });

  console.log("RESPONSE ACCEPT:", response);

  if (!response.ok) {
    throw new Error("API: Failed to accept friend request");
  }
};


export const fetchFriends = async ({ username }) => {
  try {
    const response = await fetch(`${API_URL}/fetch-friends?username=${encodeURIComponent(username)}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error("API: Failed to fetch friends");
    }

    const friendsData = await response.json(); 
    console.log("Fetched Friends Data:", friendsData); 
    return friendsData; 
  } catch (error) { 
    console.error("API: Error fetching friends:", error);
    throw error;
  }
};


export const checkFriendship = async ({ loggedInUsername, profileUsername }) => {
  console.log(loggedInUsername);
  console.log(profileUsername);

  try {
    const response = await fetch(`${API_URL}/check-friendship?loggedInUsername=${encodeURIComponent(loggedInUsername)}&profileUsername=${encodeURIComponent(profileUsername)}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error("API: Failed to check friendship status");
    }

    // Update the expected response structure to match the backend
    const { isFriends, isRequestPending, isRequestReceived } = await response.json();
    return { isFriends, isRequestPending, isRequestReceived }; // Return the relevant data
  } catch (error) {
    console.error("API: Error checking friendship:", error);
    throw error;
  }
};



//MESSAGE STUFF
export const postMessage = async ({ name, message }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated', token);
  }
  
  if (!name) {
    throw new Error("Name is required");
  }

  if (!message || message.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }

  if (message.length > 140) {
    throw new Error("API: Message must be less than 140 characters");
  }

  const timestamp = new Date().toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  try {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Corrected syntax here
      },
      body: JSON.stringify({ name, message, time: timestamp }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to post message');
    }

    const newMessage = await response.json();
    return newMessage; 
    
  } catch (error) {
    console.error('Error posting message:', error);
    throw error; 
  }
};




export const postFriendMessage = async ({ senderUsername, recipientUsername, message }) => {
  if (!senderUsername) {
    throw new Error("Sender username is required");
  }

  if (!recipientUsername) {
    throw new Error("Recipient username is required");
  }

  if (!message || message.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }

  if (message.length > 140) {
    throw new Error("Message must be less than 140 characters");
  }

  const timestamp = new Date().toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  try {
    const response = await fetch(`${API_URL}/send-friend-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, 
      },
      body: JSON.stringify({ senderUsername, recipientUsername, message, time: timestamp }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send friend message');
    }

    const newMessage = await response.json();
    return newMessage; 
  } catch (error) {
    console.error('Error sending friend message:', error);
    throw error;
  }
};


export const loadMessagesForUser = async (username) => {
  const response = await fetch(`${API_URL}/messages?username=${username}`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error("API: Failed to load messages");
  }
  
  const data = await response.json();
  return data;
};




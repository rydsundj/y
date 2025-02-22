import request from 'supertest';
import app from '../server.mjs'; 
import { User, Message } from '../db.mjs'; 

describe("API TESTS", () => {
/* ################################################################ 
   #                                                              #
   #                          USER TESTS                          #
   #                                                              #
   ################################################################ 
*/

describe("User tests", function(){
  beforeEach(async () => {
    await User.deleteMany();
    });

  it("registerUser: should register a new user and return 200", (done) => {
    const userData = { username: "Matilda", email: "matilda@example.com", password: "password123" };

    request(app)
        .post("/register") 
        .send(userData)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect(res => {
            if (!res.body._id) throw new Error("User ID not returned");
            if (res.body.username !== userData.username) throw new Error("Username is incorrect");
            if (res.body.email !== userData.email) throw new Error("Email is incorrect");
        })
        .end(done);
  });
  it("registerUser: should return 400 if email already exists", (done) => {
    const userData = { username: "Matilda", email: "matilda@example.com", password: "password123" };
    const duplicateUserData = { username: "Matilda2", email: "matilda@example.com", password: "password123" }; 

    request(app)
        .post("/register") 
        .send(userData)
        .expect(200) 
        .expect("Content-Type", /json/)
        .end((err) => {
            if (err) return done(err);

            request(app)
                .post("/register")
                .send(duplicateUserData)
                .expect(400) 
                .expect("Content-Type", /json/)
                .expect(res => {
                    if (res.body.error !== "Email already exists") {
                        throw new Error("Expected 'Email already exists' error message");
                    }
                })
                .end(done);
          });
      });



  it("loginUser: should login a user with correct credentials and return 200", async () => {
    // Create a new user
    const user = new User({ username: "Matilda", email: "matilda@example.com", password: "password123" });
    await user.save();

    const loginData = { email: "matilda@example.com", password: "password123" };

    await request(app)
      .post("/login") 
      .send(loginData)
      .expect(200)
      .expect("Content-Type", /json/)
      .expect(res => {
        console.log(res.body.user.email);
        console.log(loginData.email);

        if (res.body.user.email !== loginData.email) throw new Error("Email is incorrect");
        if (res.body.user.username !== "Matilda") throw new Error("Username is incorrect");
      });
  });

  it("loginUser: should return 400 if user doesn't exist", async () => {
    const loginData = { email: "nonexistent@example.com", password: "password123" };

    await request(app)
      .post("/login") 
      .send(loginData)
      .expect(400)
      .expect("Content-Type", /json/)
      .expect(res => {
        if (res.body.error !== "User doesn't exist") {
          throw new Error("Expected 'User doesnt exist' error message");
        }
      });
  });

  it("loginUser: should return 400 for incorrect password", async () => {
    // Create a new user
    const user = new User({ username: "Matilda", email: "matilda@example.com", password: "password123" });
    await user.save();

    const loginData = { email: "matilda@example.com", password: "wrongpassword" };

    await request(app)
      .post("/login")
      .send(loginData)
      .expect(400)
      .expect("Content-Type", /json/)
      .expect(res => {
        console.log(res.body.error);
        if (res.body.error !== "Invalid credentials") {
          throw new Error("Expected 'invalid credentials' error message");
        }
      });
  });

});

/* ################################################################ 
   #                                                              #
   #                         FRIEND TESTS                         #
   #                                                              #
   ################################################################ 
*/


describe("Friend tests", function() {
  beforeEach(async () => {
    await User.deleteMany(); // Clear the existing users

    // Create users
    const john = await User.create({ username: "john_doe", email: "john@example.com", password: "password123" });
    const jane = await User.create({ username: "jane_doe", email: "jane@example.com", password: "password123" });
    const jackson = await User.create({ username: "jackson_smith", email: "jackson@example.com", password: "password123" });

    // Establish friendships
    john.friends.push(jane._id, jackson._id);
    await john.save();
  });
  

  it("searchUsers: should return 200 and a list of users matching the search query", async () => {
    const user = new User({ username: "Matilda", email: "matilda@example.com", password: "password123" });

    await request(app)
      .get("/search-users?q=doe") 
      .expect(200)
      .expect("Content-Type", /json/)
      .expect(res => {
        if (res.body.length !== 2) throw new Error("Incorrect number of users returned");
        const usernames = res.body.map(user => user.username);
        if (!usernames.includes("john_doe") || !usernames.includes("jane_doe")) {
          throw new Error("Matching users not found");
        }
      });
  });

  /* #########################    ERROR SEARCH REQUEST   ######################### */


  it("searchUsers: It should return 400: Search query is required", async () => {

  await request(app)
    .get("/search-users?q=") 
    .expect(400)
    .expect("Content-Type", /json/)
    .expect(res => {
      if (res.body.error !== "Search query is required") throw new Error("Should return: Search query is required");
    });
  });


  it("searchUsers: It should return 404: no users found", async () => {

  await request(app)
    .get("/search-users?q=karl") 
    .expect(404)
    .expect("Content-Type", /json/)
    .expect(res => {
      if (res.body.error !== "No users found") throw new Error("Should return: No users found");
    });
  });

  /* #########################  SEND FRIEND REQUEST   ######################### */


  it("sendFriendRequest: should send a friend request and return 200", async () => {
    const friendRequestData = {
      senderUsername: "john_doe",
      receiverUsername: "jane_doe"
    };

    await request(app)
        .post("/send-friend-request") 
        .send(friendRequestData)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect(res => {
            if (res.body.message !== "Friend request sent") {
            throw new Error("Friend request was not successfully sent");
            }
        });

        const receiver = await User.findOne({ username: "jane_doe" });
        const sender = await User.findOne({ username: "john_doe" });
    
        if (!receiver.friendRequests.includes(sender._id)) {
            throw new Error("Sender ID not found in receiver's friendRequests");
        }
  });
  
  /* #########################    ERROR FRIEND REQUEST   ######################### */

  
  it("sendFriendRequest: it should return 404: User not found", async () => {
    const friendRequestData = {
      senderUsername: "john_doe",
      receiverUsername: "jones_doe"
    };

    await request(app)
        .post("/send-friend-request")
        .send(friendRequestData)
        .expect(404)
        .expect("Content-Type", /json/)
        .expect(res => {
            if (res.body.error !== "User not found") {
            throw new Error("Should return: User not found");
            }
        });
  });

  it("sendFriendRequest: it should return 400 if a friend request is already sent", async () => {
    const friendRequestData = {
      senderUsername: "john_doe",
      receiverUsername: "jane_doe"
    };
  
    // First friend request should succeed
    await request(app)
      .post("/send-friend-request")
      .send(friendRequestData)
      .expect(200)
      .expect("Content-Type", /json/);
  
    // Second (duplicate) friend request should fail with a 400 error
    await request(app)
      .post("/send-friend-request")
      .send(friendRequestData) // Same request data to simulate a duplicate
      .expect(400)
      .expect("Content-Type", /json/)
      .expect(res => {
        if (res.body.error !== "Friend request already sent") {
          throw new Error("Expected 'Friend request already sent' error message");
        }
      });
  
  });
  
  
  /* #########################  FETCH FRIEND REQUEST   ######################### */
  
  it("fetchFriendRequest: should fetch friend requests for a given user and return 200", async () => {
    // First, send a friend request to set up the scenario
    await request(app)
      .post("/send-friend-request")
      .send({ senderUsername: "john_doe", receiverUsername: "jane_doe" })
      .expect(200);

    const username = "jane_doe";

    await request(app)
      .get(`/fetch-friend-request?username=${username}`) 
      .expect(200)
      .expect("Content-Type", /json/)
      .expect(res => {
        if (!Array.isArray(res.body)) throw new Error("Response body should be an array");
        if (res.body.length !== 1) throw new Error("Expected one friend request");
        if (res.body[0].username !== "john_doe") throw new Error("Friend request sender's username is incorrect");
      });
  });


  /* #########################  ERROR FETCH FRIEND REQUEST   ######################### */

  it("fetchFriendRequest: it should return 400: Username is required", async () => {
  await request(app)
    .get(`/fetch-friend-request`) 
    .expect(400)
    .expect("Content-Type", /json/)
    .expect(res => {
      if (res.body.error !== "Username is required") throw new Error("Expected one friend request");
    });
  });



  it("fetchFriendRequest: should return 404: user not found", async () => {
    await request(app)
      .post("/send-friend-request")
      .send({ senderUsername: "john_doe", receiverUsername: "jane_doe" })
      .expect(200);
  
    const username = "jonesdoe"; // Username that does not exist
  
    // Make the request to fetch the friend request for a non-existent user
    await request(app)
      .get(`/fetch-friend-request?username=${username}`)
      .expect(404)
      .expect("Content-Type", /json/)
      .expect(res => {
        if (res.body.error !== "User not found") {
          throw new Error("Should return: User not found");
        }
      });
  });
  

/* #########################  ACCEPT FRIEND REQUEST   ######################### */
  
  it("acceptFriendRequest: should accept a friend request and return 200", async () => {
    // First, send a friend request to set up the scenario
    await request(app)
      .post("/send-friend-request")
      .send({ senderUsername: "john_doe", receiverUsername: "jane_doe" })
      .expect(200);
  
    // Now try to accept the friend request
    const acceptData = {
      senderUsername: "john_doe",
      receiverUsername: "jane_doe"
    };
  
    await request(app)
      .patch("/accept-friend-request") 
      .send(acceptData)
      .expect(200)
      .expect("Content-Type", /json/)
      .expect(res => {
        if (res.body.message !== "Friend request accepted") {
          throw new Error("Friend request was not successfully accepted");
        }
      });
  
    // Verify that both users are now in each other's friends list
    const sender = await User.findOne({ username: "john_doe" });
    const receiver = await User.findOne({ username: "jane_doe" });
    
    if (!sender.friends.includes(receiver._id)) {
      throw new Error("Receiver ID not found in sender's friends list");
    }
    
    if (!receiver.friends.includes(sender._id)) {
      throw new Error("Sender ID not found in receiver's friends list");
    }
  });

/* #########################  ERROR: ACCEPT FRIEND REQUEST   ######################### */

it("acceptFriendRequest: should return 404, user not found", async () => {
  // First, send a friend request to set up the scenario
  await request(app)
    .post("/send-friend-request")
    .send({ senderUsername: "john_doe", receiverUsername: "jane_doe" })
    .expect(200);

  // Now try to accept the friend request
  const acceptData = {
    senderUsername: "",
    receiverUsername: "jane_doe"
  };

  await request(app)
    .patch("/accept-friend-request") 
    .send(acceptData)
    .expect(404)
    .expect("Content-Type", /json/)
    .expect(res => {
      if (res.body.error !== "User not found") {
        throw new Error("Should return: User not found");
      }
    });
});


it("acceptFriendRequest: should return 400, no friend request found", async () => {
  // First, send a friend request to set up the scenario
  const acceptData = {
    senderUsername: "john_doe",
    receiverUsername: "jane_doe"
  };

  await request(app)
    .patch("/accept-friend-request") 
    .send(acceptData)
    .expect(400)
    .expect("Content-Type", /json/)
    .expect(res => {
      if (res.body.error !== "No friend request found") {
        throw new Error("Should return: No friend request found");
      }
    });
});


/* #########################  FETCH FRIENDS   ######################### */


  it("fetchFriends: should fetch friends for a given user and return 200", async () => {
    await request(app)
      .get("/fetch-friends?username=john_doe") 
      .expect(200)
      .expect("Content-Type", /json/)
      .expect(res => {
        if (res.body.length !== 2) {
          throw new Error("Incorrect number of friends returned");
        }

        const usernames = res.body.map(friend => friend.username);
        if (!usernames.includes("jane_doe") || !usernames.includes("jackson_smith")) {
          throw new Error("Expected friends not found in response");
        }
      });
  });

  /* #########################  ERROR FETCH FRIENDS   ######################### */

  it("fetchFriends: should return 400, username is required", async () => {
    await request(app)
      .get("/fetch-friends") 
      .expect(400)
      .expect("Content-Type", /json/)
      .expect(res => {
        if (res.body.error !== "Username is required") {
          throw new Error("Should return username is required");
        }
      });
  });


  it("fetchFriends: should return 404, user not found", async () => {
    await request(app)
      .get("/fetch-friends?username=mat") 
      .expect(404)
      .expect("Content-Type", /json/)
      .expect(res => {
        if (res.body.error !== "User not found") {
          throw new Error("Should return user not found");
        }
      });
  });


  /* #########################  CHECK FRIENDSHIP   ######################### */

  it("checkFriendship: should return friendship status when users are friends", async () => {
    await request(app)
      .get("/check-friendship?loggedInUsername=john_doe&profileUsername=jane_doe")
      .expect(200)
      .expect("Content-Type", /json/)
      .expect(res => {
        if (res.body.isFriends !== true) {
          throw new Error("Expected users to be friends");
        }
        if (res.body.isRequestPending !== false) {
          throw new Error("Expected no pending friend requests");
        }
      });
  });


  /* #########################  ERROR CHECK FRIENDSHIP   ######################### */



  it("checkFriendship: should return 400, both usernames are required", async () => {
    await request(app)
      .get("/check-friendship?&profileUsername=jane_doe")
      .expect(400)
      .expect("Content-Type", /json/)
      .expect(res => {
        if (res.body.error !== "Both usernames are required") {
          throw new Error("Should return: Both usernames are required");
        }
      });
  });

  it("checkFriendship: should return 404: user not found", async () => {
    await request(app)
    .get("/check-friendship?loggedInUsername=john_doe&profileUsername=jones_doe")
    .expect(404)
      .expect("Content-Type", /json/)
      .expect(res => {
        if (res.body.error !== "User not found") {
          throw new Error("Should return: user not found");
        }
      });
  });
});



/* ################################################################ 
   #                                                              #
   #                     POST/MESSAGE TESTS                       #
   #                                                              #
   ################################################################ 
*/
describe("Message tests", function () {
  let messageId;
  let authToken; // Variable to hold the authentication token

  beforeEach(async () => {
    await User.deleteMany(); // Clear the existing users
    await Message.deleteMany(); // Clear the existing messages

    // Create a user and some messages
    const user = new User({ username: "john_doe", email: "john@example.com", password: "password123" });
    await user.save();

    // Log in the user to get the auth token
    const loginResponse = await request(app)
      .post("/login") // Adjust to your login endpoint
      .send({ email: "john@example.com", password: "password123" });
    
    authToken = loginResponse.body.token; // Save the token

    const messages = [
      { sender: "jane_doe", name: "john_doe", message: "Hello, John!", time: new Date().toISOString() },
      { sender: "mark_smith", name: "john_doe", message: "How are you?", time: new Date().toISOString() },
    ];

    await Message.insertMany(messages);
  });

  it("postMessage: should return 200 and post a message", (done) => {
    request(app)
      .post("/messages")
      .set('Authorization', `Bearer ${authToken}`) // Add the token to the request
      .send({ name: "Matilda", message: "Test message", time: new Date().toISOString() })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect(res => {
        if (!res.body._id) throw new Error("Message ID not returned");
        if (res.body.message !== "Test message") throw new Error("Message content is incorrect");
      })
      .end(done);
  });

  /* #########################  ERROR POST MESSAGE   ######################### */

  it("postMessage: should return 400, message is required", async () => {
    await request(app)
      .post("/messages")
      .set('Authorization', `Bearer ${authToken}`) // Add the token to the request
      .send({ name: "Jones", time: new Date().toISOString() }) // Missing message
      .expect(400)
      .expect("Content-Type", /json/)
      .expect(res => {
        if (res.body.error !== "Name and message required") {
          throw new Error("Unexpected error message returned");
        }
      });
  });


  it("should return 400 if message is too long", async () => {
    const longMessage = "A".repeat(141); // Message longer than 100 characters
    await request(app)
      .post("/messages")
      .set('Authorization', `Bearer ${authToken}`) // Add the token to the request
      .send({ name: "John Doe", message: longMessage, time: new Date().toISOString() })
      .expect(400)
      .expect("Content-Type", /json/)
      .expect(res => {
        if (res.body.error !== "Message must be between 1 and 100 characters") {
          throw new Error("Message too long");
        }
      });
  });

/* #########################  GET MESSAGE BY USERNAME   ######################### */

it("getMessagesByUsername: should return 200 and a list of messages for a given username", async () => {
  const username = "john_doe";

  await request(app)
    .get(`/messages?username=${username}`) 
    .set('Authorization', `Bearer ${authToken}`) 
    .expect(200)
    .expect("Content-Type", /json/)
    .expect(res => {
      if (!Array.isArray(res.body)) throw new Error("Response body should be an array");
      if (res.body.length !== 2) throw new Error("Expected 2 messages to be returned");
      if (res.body[0].name !== username) throw new Error("Username in messages is incorrect");
    });
});


/* #########################  ERROR GET MESSAGE BY USERNAME   ######################### */
it("getMessagesByUsername: should return 400, username is required", async () => {
  await request(app)
    .get("/messages")
    .set('Authorization', `Bearer ${authToken}`) 
    .expect(400)
    .expect("Content-Type", /json/)
    .expect(res => {
      if (res.body.error !== "Username is required") {
        throw new Error("Should return: Username is required");
      }
    });
});

it("getMessagesByUsername: should return 404, no messages found for this user", async () => {
  const username = "isak"; // This user should not have any messages in the test database

  await request(app)
    .get(`/messages?username=${username}`) 
    .set('Authorization', `Bearer ${authToken}`) // Add the token to the request
    .expect(404)
    .expect("Content-Type", /json/)
    .expect(res => {
      if (res.body.error !== "No messages found for this user") {
        throw new Error("Should return: no messages found for this user");
      }
    });
});


/* #########################  POST FRIEND MESSAGE   ######################### */

it("postFriendMessage: should post a friend message and return 200", async () => {
  const messageData = {
    senderUsername: "john_doe",
    recipientUsername: "jane_doe",
    message: "Hello, Jane!",
    time: new Date().toISOString(),
  };

  await request(app)
    .post("/send-friend-message")
    .set('Authorization', `Bearer ${authToken}`) // Add the token to the request
    .send(messageData)
    .expect(200)
    .expect("Content-Type", /json/)
    .expect(res => {
      if (!res.body._id) throw new Error("Message ID not returned");
      if (res.body.message !== messageData.message) throw new Error("Message content is incorrect");
      if (res.body.sender !== messageData.senderUsername) throw new Error("Sender username is incorrect");
      if (res.body.name !== messageData.recipientUsername) throw new Error("Recipient username is incorrect");
    });
});


/* ######################### ERROR POST FRIEND MESSAGE   ######################### */


it("postFriendMessage: should return 400 if sender, recipient or message is missing", async () => {
  const messageData = {
    senderUsername: "", // testing for missing sender
    recipientUsername: "jane_doe",
    message: "Hello, Jane!",
    time: new Date().toISOString(),
  };

  await request(app)
    .post("/send-friend-message")
    .set('Authorization', `Bearer ${authToken}`)
    .send(messageData)
    .expect(400)
    .expect("Content-Type", /json/)
    .expect(res => {
      if (res.body.error !== "Sender username, recipient username, and message are required") {
        throw new Error("Should return: Sender username, recipient username, and message are required");
      }
    });
});



it("postFriendMessage: should return 400 if message is too long", async () => {
  const messageData = {
    senderUsername: "john_doe",
    recipientUsername: "jane_doe",
    message: "A".repeat(141), // Message exceeding 140 characters
    time: new Date().toISOString(),
  };

  await request(app)
    .post("/send-friend-message") 
    .set('Authorization', `Bearer ${authToken}`) 
    .send(messageData)
    .expect(400)
    .expect("Content-Type", /json/)
    .expect(res => {
      if (res.body.error !== "Message must be between 1 and 140 characters") {
        throw new Error("Unexpected error message returned");
      }
    });
});


it("postFriendMessage: should sanitize the message to prevent XSS", async () => {
  const messageData = {
    senderUsername: "john_doe",
    recipientUsername: "jane_doe",
    message: "<script>alert('XSS')</script>", // Message with XSS content
    time: new Date().toISOString(),
  };

  const res = await request(app)
    .post("/send-friend-message") 
    .set('Authorization', `Bearer ${authToken}`) // Add the token to the request
    .send(messageData)
    .expect(200)
    .expect("Content-Type", /json/);

  if (res.body.message.includes("<script>")) {
    throw new Error("Message not sanitized correctly");
  }
});
});

});
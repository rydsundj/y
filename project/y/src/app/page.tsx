
//this file is the main entry point. It determines whether the user is logged in and directs them to the login page or home page.
"use client"; 
import { useState, useEffect } from "react";
import Login from "./login"; 
import Wall from "./home/page"; 
import { useRouter } from 'next/navigation'; 

export default function Home() {
  const [isLogin, setIsLogin] = useState(true); //tracks whether the user is in login or signup. (default is true for login).
  const [isLoggedIn, setIsLoggedIn] = useState(false); //tracks whether the user is logged in (default is false).
  const router = useRouter(); 

  //used everytime the site is rendered
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'; //check if user is logged in
    setIsLoggedIn(loggedIn); //if logged in, set IsLoggedIn to true
  }, []);

  
  const handleSetIsLoggedIn = (value: boolean) => {
    setIsLoggedIn(value);
    localStorage.setItem('isLoggedIn', value.toString());

    if (value) {
      router.push('/home'); 
    }
  };

 
  const toggleLogin = () => {
    setIsLogin(!isLogin);
  };

 
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = '/favicon.ico';
    document.head.appendChild(link);

    document.title = isLoggedIn ? "Welcome Back" : "Login";

    
    return () => {
      document.head.removeChild(link);
    };
  }, [isLoggedIn]); 

  return (
    <>
      {isLoggedIn ? (
        <Wall />
      ) : (
        <Login 
          isLogin={isLogin} 
          toggleLogin={toggleLogin} 
          setIsLoggedIn={handleSetIsLoggedIn}
        />
      )}
    </>
  );
}

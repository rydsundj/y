"use client"; 
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "./y_logo.png"; 
import Button from "./button";
import { useRouter } from "next/navigation"; 
import { FaHome, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const router = useRouter(); 
  const toProfile = () => {
    router.push("/profile");
  };

  const toHome = () => 
  {
    router.push("/home"); 
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn'); 
    localStorage.removeItem('username'); 
    router.push("/"); 
  };

  return (
    <div className="w-full h-20 bg-gray-200 sticky top-0">
      <div className="container mx-auto px-2 h-full flex justify-between items-center">
      <Link href="/home">
          <Image src={Logo} alt="Logo" width={80} height={80} className="cursor-pointer" />
        </Link>

        <div className="flex items-center space-x-4">
          <Button text={<><FaHome className="mr-2" />Home</>} onClick={toHome} />
          <Button text={<><FaUser className="mr-2" />Profile</>} onClick={toProfile} />
          <Button text={<><FaSignOutAlt className="mr-2" />Log out</>} onClick={logout} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;

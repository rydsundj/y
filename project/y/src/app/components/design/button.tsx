import React from "react";

interface ButtonProps {
  text: React.ReactNode; //react nodes
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  type = "button",
  disabled = false,
}) => {
  return (
    <button
      className="bg-white text-black-800 px-4 py-2 rounded-md hover:bg-gray-200"
      onClick={onClick}
      type={type} 
      disabled={disabled} 
    >
      {text}
    </button>
  );
};

export default Button;

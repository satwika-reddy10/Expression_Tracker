import React from "react";
import { Circle, Square, Triangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StartGameButton = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate("/game"); // Redirect to the game page
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-purple-200 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl">
        {/* Animated shapes */}
        <div className="flex justify-center gap-8 mb-8 animate-bounce">
          <Circle className="text-pink-500" size={48} />
          <Square className="text-blue-500" size={48} />
          <Triangle className="text-purple-500" size={48} />
        </div>

        <h1 className="text-4xl font-bold text-purple-700 mb-6">
          Welcome to Shape Counting Game!
        </h1>

        <p className="text-xl text-gray-700 mb-8">
          Ready to have fun with shapes? Let's start counting! 🎮
        </p>

        <button
          onClick={handleStartGame} // Attach the onClick handler here
          className="bg-gradient-to-r from-purple-500 to-pink-500 
                   text-white text-2xl font-bold py-6 px-12 
                   rounded-full shadow-lg transform transition 
                   hover:scale-105 hover:shadow-xl 
                   active:scale-95"
        >
          Play Game! 🎯
        </button>
      </div>
    </div>
  );
};

export default StartGameButton;

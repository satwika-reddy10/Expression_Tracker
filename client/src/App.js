// src/App.js
import React from "react";
import "./App.css";
import GameComponent from "./components/GameComponent";
import ImageCaptureComponent from "./components/ImageCaptureComponent";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Shape Counting Game</h1>
      </header>
      <main>
        {/* Display the game component */}
        <GameComponent />
        {/* Display the image capture component */}
        <ImageCaptureComponent />
      </main>
    </div>
  );
}

export default App;

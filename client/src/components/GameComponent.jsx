// src/components/GameComponent.jsx
import React, { useState, useEffect } from 'react';
import './GameComponent.css';

const shapes = ['circle', 'square', 'triangle'];

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null); // New state to track correctness

  useEffect(() => {
    const newQuestions = Array(5)
      .fill(null)
      .map(() => {
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        const randomCount = Math.floor(Math.random() * 5) + 1;
        const sequence = Array(randomCount)
          .fill(randomShape)
          .concat(
            Array(9 - randomCount).fill(null).map(() => shapes[Math.floor(Math.random() * shapes.length)]),
          );
        return { shape: randomShape, sequence };
      });
    setQuestions(newQuestions);
  }, []);

  const handleAnswer = (answer) => {
    if (!isAnswered) {
      setSelectedAnswer(answer);
      setIsAnswered(true);

      const correctAnswer = questions[currentQuestion].sequence.filter((shape) => shape === questions[currentQuestion].shape).length;
      const correct = answer === correctAnswer;
      setIsCorrect(correct);

      if (correct) {
        setScore(score + 1);
      }
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null); // Reset correctness for next question
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentQuestion(questions.length);
    }
  };

  const restartGame = () => {
    setScore(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null); // Reset correctness for restart
  };

  if (currentQuestion >= questions.length) {
    return (
      <div className="app">
        <h1 className="game-title">Shape Counting Game</h1>
        <div className="game-container">
          <p className="result">Your score: {score} / {questions.length}</p>
          <button
            className="restart-btn"
            onClick={restartGame}
            aria-label="Play Again"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return <div>Loading...</div>;

  const { shape, sequence } = questions[currentQuestion];
  const correctAnswer = sequence.filter((s) => s === shape).length;
  const options = Array(4).fill(null).map((_, i) => (i === 0 ? correctAnswer : correctAnswer + i));

  return (
    <div className="app">
      <h1 className="game-title">Shape Counting Game</h1>
      <div className="game-container">
        <h3>How many <span className="target-shape">{shape}s</span> are in the sequence?</h3>
        <div className="shape-sequence">
          {sequence.map((s, index) => (
            <div key={index} className={`shape ${s} ${isCorrect === false ? 'sad' : ''}`} aria-label={`A ${s}`}>
              <div className={`smile ${isCorrect === false ? 'sad-smile' : ''}`}></div>
            </div>
          ))}
        </div>
        <div className="options-container">
          {options.map((option, index) => (
            <button
              key={index}
              className="option-btn"
              onClick={() => handleAnswer(option)}
              disabled={isAnswered}
              aria-label={`Select ${option}`}
            >
              {option}
            </button>
          ))}
        </div>
        {selectedAnswer !== null && (
          <div>
            <p className="result">
              {isCorrect ? 'Correct!' : `Wrong! The correct answer was ${correctAnswer}.`}
            </p>
            <button
              className="next-btn"
              onClick={nextQuestion}
              aria-label="Next Question"
            >
              Next Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

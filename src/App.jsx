// src/App.jsx
import React, { useState } from 'react';
import Menu from './Menu.jsx';
import Game from './Game.jsx';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  return (
    <div>
      {gameStarted ? <Game /> : <Menu onStartGame={handleStartGame} />}
    </div>
  );
};

export default App;

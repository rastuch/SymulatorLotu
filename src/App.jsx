import React, { useState } from 'react';
import Menu from './components/Menu.jsx';
import MovingMap from './components/MovingMap.jsx';
import Game from './components/Game.jsx';
import './style.css';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  return (
    <div>
      {gameStarted ? <Game start={true} /> : (
        <>
          <MovingMap />
          <Menu onStartGame={handleStartGame} />
        </>
      )}
    </div>
  );
};

export default App;

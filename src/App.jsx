import React, {useState} from 'react';
import Game from './components/Game.jsx';
import Menu from './components/Menu.jsx';
import MovingMap from './components/MovingMap.jsx';
import './style.css';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  return (
    <div>
      {gameStarted ? (<Game/>) : (<>
        <MovingMap/>
        <Menu onStartGame={handleStartGame}/>
      </>)}
    </div>);
};

export default App;

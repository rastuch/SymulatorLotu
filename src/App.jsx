import React, {useState} from 'react';
import Game from './components/Game.jsx';
import Menu from './components/Menu.jsx';
import MovingMap from './components/MovingMap.jsx';
import './style.css';

/**
 * Main application component.
 *
 * @component
 * @returns {JSX.Element} The main application component.
 */
const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef(null);

  /**
   * Handles starting the game by setting the gameStarted state to true.
   */
  const handleStartGame = () => {
    setGameStarted(true);
  };

  /**
   * Handles playing and pausing the background music.
   */
  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.volume = 0.2;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
      <div>
        {gameStarted ? (
            <Game/>
        ) : (
            <>
              <MovingMap/>
              <Menu onStartGame={handleStartGame} handlePlayMusic={handlePlay}/>
            </>
        )}
        <audio ref={audioRef} id="audio" src="https://cdn.freesound.org/previews/654/654029_14248671-lq.mp3" loop/>
      </div>
  );
};

export default App;

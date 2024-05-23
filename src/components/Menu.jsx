import React from 'react';

const Menu = ({onStartGame}) => {
  return (
    <div className="menu">
      <h1>Welcome to the Game</h1>
      <button onClick={onStartGame}>Start Game</button>
    </div>
  );
};

export default Menu;

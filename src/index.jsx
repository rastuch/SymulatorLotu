import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';

const rootElement = document.getElementById('react-root');
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

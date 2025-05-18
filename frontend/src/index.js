import React from 'react';
import ReactDOM from 'react-dom/client';
import './tailwind.css'; // Import Tailwind CSS source
import './tailwind.output.css'; // Import compiled Tailwind CSS
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

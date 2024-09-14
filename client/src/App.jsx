import React from 'react';
import './index.css';

function App() {
  return (
    <div>
      <h1>Welcome to the App</h1>
      <a href="/auth/github">Login with GitHub</a>
      <br />
      <a href="/auth/youtube">Login with YouTube</a>
      <br />
      <a href="/profile">Profile</a>
    </div>
  );
}

export default App;

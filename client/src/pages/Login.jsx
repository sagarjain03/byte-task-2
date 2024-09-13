import React from 'react';

const Login = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/github'; // Backend GitHub OAuth route
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleLogin}>Login with GitHub</button>
    </div>
  );
};

export default Login;

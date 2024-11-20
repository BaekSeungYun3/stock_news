import React from 'react';
import '../styles/Signup.css';

const Signup = () => {
  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>회원가입</h2>
        <form>
          <input type="text" placeholder="ID" />
          <input type="password" placeholder="Password" />
          <input type="password" placeholder="Password 확인" />
          <button type="submit">회원가입</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;

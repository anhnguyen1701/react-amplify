import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';

export default function Header() {
  return (
    <header className="header">
      <nav>
          <h1 style={{display: "inline-block"}}>
            <Link to="/user">Create account User</Link>
          </h1>
          <h1 style={{display: "inline-block", marginLeft: "50px"}}>
            <Link to="/admin">Create accout Admin</Link>
          </h1>
      </nav>
    </header>
  );
}

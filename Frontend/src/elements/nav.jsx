import React from "react";
import { Link } from 'react-router-dom';
import "../styles/nav.css";

const Nav = () => {
    return (
      <nav>
        <ul>
          <li>
            <Link to="/apartments">Apartments</Link> {/* Link to Apartments Page */}
          </li>
          <li>
            <Link to="/residents">Residents</Link> {/* Link to Residents Page */}
          </li>
        </ul>
      </nav>
    );
  };
  

export default Nav;

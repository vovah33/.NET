// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Import necessary components
import Nav from './elements/nav';
import Apartments from './pages/apartments';
import Residents from './pages/residents';

function App() {
  return (
    <Router>
      <Nav />  
      <div className="content">
        <Routes>
          <Route path="/apartments" element={<Apartments />} />  {/* Render Apartments page */}
          <Route path="/residents" element={<Residents />} />    {/* Render Residents page */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

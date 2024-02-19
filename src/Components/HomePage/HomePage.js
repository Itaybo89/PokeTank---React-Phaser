import React from 'react';
import { useNavigate } from 'react-router-dom';
import './homepage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const goToPokeTanksMain = () => {
    navigate('/poketanksmain');
  };

  const goToPokeTanksGame = () => {
    navigate('/poketanksgame');
  };

  return (
    <div className="homepage">
      <button onClick={goToPokeTanksMain} className="button">Go to PokeTanks Main Page</button>
      <button onClick={goToPokeTanksGame} className="button">Go to PokeTanks Game Board</button>
    </div>
  );
};

export default HomePage;

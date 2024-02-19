import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './poketankspage.css';
import audioFile from './intro.mp3';

const PokeTanksPage = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  
  const handleReady = () => {
    navigate('/poketanksgame');
  };
  
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  return (
    <div className="retro-container">
      <h1 className="title">Welcome to PokeTanks</h1>
      <button className="medieval-button" onClick={handleReady}>
        Ready
      </button>
      <button className="medieval-button-back" onClick={()=>navigate('/')}>
        Back
      </button>
      <button className="speaker-button" onClick={toggleMute}>
        {isMuted ? <i className="fas fa-volume-mute fa-2x"></i> : <i className="fas fa-volume-up fa-2x"></i>}
      </button>
      <audio id="background-music" ref={audioRef} loop autoPlay>
        <source src={audioFile} type="audio/mp3" />
      </audio>
    </div>
  );
};

export default PokeTanksPage;
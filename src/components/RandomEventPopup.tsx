import { useState, useEffect } from 'react';
import { RandomEvent } from '../game/randomEvents';
import './RandomEventPopup.css';

interface RandomEventPopupProps {
  event: RandomEvent;
  timeRemaining: number;
  onActivate: () => void;
}

export function RandomEventPopup({ event, timeRemaining, onActivate }: RandomEventPopupProps) {
  const [position] = useState({
    top: Math.random() * 60 + 20, // 20-80% from top
    left: Math.random() * 60 + 20, // 20-80% from left
  });

  const [shake, setShake] = useState(false);

  // Shake when time is running out
  useEffect(() => {
    if (timeRemaining < 5) {
      setShake(true);
    }
  }, [timeRemaining]);

  const getRarityClass = () => {
    switch (event.rarity) {
      case 'legendary': return 'rarity-legendary';
      case 'epic': return 'rarity-epic';
      case 'rare': return 'rarity-rare';
      default: return 'rarity-common';
    }
  };

  return (
    <div
      className={`random-event-popup ${getRarityClass()} ${shake ? 'shake' : ''}`}
      style={{
        top: `${position.top}%`,
        left: `${position.left}%`,
      }}
      onClick={onActivate}
      title={event.description}
    >
      <div className="event-icon">{event.icon}</div>
      <div className="event-content">
        <div className="event-name">{event.name}</div>
        <div className="event-timer">{Math.ceil(timeRemaining)}s</div>
      </div>
      <div className="event-glow"></div>
    </div>
  );
}

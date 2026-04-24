import { useEffect, useRef, useState } from "react";
import { RandomEvent } from "../game/randomEvents";
import "./RandomEventPopup.css";

interface RandomEventPopupProps {
  event: RandomEvent;
  timeRemaining: number;
  onActivate: () => void;
}

export function RandomEventPopup({
  event,
  timeRemaining,
  onActivate,
}: RandomEventPopupProps) {
  // Position is clamped well inside the viewport so the popup (translated
  // by -50%/-50%) never gets cut off on small/mobile screens.
  const [position] = useState({
    top: Math.random() * 50 + 25, // 25-75%
    left: Math.random() * 50 + 25, // 25-75%
  });
  const ref = useRef<HTMLButtonElement>(null);

  const [shake, setShake] = useState(false);

  // Shake when time is running out
  useEffect(() => {
    if (timeRemaining < 5) {
      setShake(true);
    }
  }, [timeRemaining]);

  // Only auto-focus if no other element currently holds focus — avoids
  // stealing focus mid-interaction.
  useEffect(() => {
    const active = document.activeElement;
    if (!active || active === document.body) {
      ref.current?.focus({ preventScroll: true });
    }
  }, [event.id]);

  const getRarityClass = () => {
    switch (event.rarity) {
      case "legendary":
        return "rarity-legendary";
      case "epic":
        return "rarity-epic";
      case "rare":
        return "rarity-rare";
      default:
        return "rarity-common";
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      className={`random-event-popup ${getRarityClass()} ${shake ? "shake" : ""}`}
      style={{
        top: `${position.top}%`,
        left: `${position.left}%`,
      }}
      onClick={onActivate}
      aria-label={`${event.rarity} event: ${event.name}. ${event.description}. ${Math.ceil(timeRemaining)} seconds remaining. Press Enter to activate.`}
      title={event.description}
    >
      <div className="event-icon" aria-hidden="true">
        {event.icon}
      </div>
      <div className="event-content">
        <div className="event-name">{event.name}</div>
        <div className="event-timer">{Math.ceil(timeRemaining)}s</div>
      </div>
      <div className="event-glow" aria-hidden="true"></div>
    </button>
  );
}

import { useEffect, useRef, useState } from "react";

interface MainButtonProps {
  onClick: (event: { clientX: number; clientY: number }) => void;
  disabled: boolean;
  distortionLevel: number;
}

const BUTTON_TEXTS = [
  "🌃 RUN THE NIGHT 🌃",
  "✨ OPTIMIZE THE VIBES ✨",
  "💊 MANAGE THE EXPERIENCE 💊",
  "🎯 MAXIMIZE OUTPUT 🎯",
];

const DISTORTED_TEXTS = [
  "✅ EVERYTHING IS FINE ✅",
  "🔥 NO STOP DONT STOP 🔥",
  "⭐ THE VIBES WANT MORE ⭐",
  "👁️ THEY'RE WATCHING 👁️",
  "💫 YOU CAN QUIT ANYTIME 💫",
  "🌀 JUST ONE MORE CLICK 🌀",
];

export function MainButton({
  onClick,
  disabled,
  distortionLevel,
}: MainButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  // Text changes on distortion level transitions, not every render —
  // prevents the label flickering between renders mid-second.
  const [text, setText] = useState(BUTTON_TEXTS[0]);
  useEffect(() => {
    if (distortionLevel >= 2 && Math.random() > 0.6) {
      setText(DISTORTED_TEXTS[Math.floor(Math.random() * DISTORTED_TEXTS.length)]);
    } else {
      setText(BUTTON_TEXTS[0]);
    }
  }, [distortionLevel]);

  const handleMouseClick = (event: React.MouseEvent) => {
    onClick({ clientX: event.clientX, clientY: event.clientY });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      const rect = ref.current?.getBoundingClientRect();
      const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      onClick({ clientX: cx, clientY: cy });
    }
  };

  return (
    <button
      ref={ref}
      className={`main-button ${distortionLevel >= 1 ? "distorted-1" : ""} ${distortionLevel >= 3 ? "distorted-3" : ""}`}
      onClick={handleMouseClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label="Run the night — main click button. Generates vibes."
    >
      {text}
    </button>
  );
}

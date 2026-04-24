import { useRef } from "react";

interface MainButtonProps {
  onClick: (event: { clientX: number; clientY: number }) => void;
  disabled: boolean;
  distortionLevel: number;
}

export function MainButton({
  onClick,
  disabled,
  distortionLevel,
}: MainButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const buttonTexts = [
    "🌃 RUN THE NIGHT 🌃",
    "✨ OPTIMIZE THE VIBES ✨",
    "💊 MANAGE THE EXPERIENCE 💊",
    "🎯 MAXIMIZE OUTPUT 🎯",
  ];

  const distortedTexts = [
    "✅ EVERYTHING IS FINE ✅",
    "🔥 NO STOP DONT STOP 🔥",
    "⭐ THE VIBES WANT MORE ⭐",
    "👁️ THEY'RE WATCHING 👁️",
    "💫 YOU CAN QUIT ANYTIME 💫",
    "🌀 JUST ONE MORE CLICK 🌀",
  ];

  const text =
    distortionLevel >= 2 && Math.random() > 0.6
      ? distortedTexts[Math.floor(Math.random() * distortedTexts.length)]
      : buttonTexts[0];

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

interface MainButtonProps {
  onClick: (event: React.MouseEvent) => void;
  disabled: boolean;
  distortionLevel: number;
}

export function MainButton({
  onClick,
  disabled,
  distortionLevel,
}: MainButtonProps) {
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

  return (
    <button
      className={`main-button ${distortionLevel >= 1 ? "distorted-1" : ""} ${distortionLevel >= 3 ? "distorted-3" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

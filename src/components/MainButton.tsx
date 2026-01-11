interface MainButtonProps {
  onClick: (event: React.MouseEvent) => void;
  disabled: boolean;
  distortionLevel: number;
}

export function MainButton({ onClick, disabled, distortionLevel }: MainButtonProps) {
  const buttonTexts = [
    '🌃 RUN THE NIGHT 🌃',
    '✨ MAXIMIZE VIBES ✨',
    '🎯 OPTIMIZE EXPERIENCE 🎯',
    '💎 GENERATE VALUE 💎',
  ];

  const distortedTexts = [
    '✅ EVERYTHING IS FINE ✅',
    '🔥 KEEP GOING 🔥',
    '⭐ YOU\'RE DOING GREAT ⭐',
    '👍 NO PROBLEMS HERE 👍',
  ];

  const text = distortionLevel >= 2 && Math.random() > 0.7
    ? distortedTexts[Math.floor(Math.random() * distortedTexts.length)]
    : buttonTexts[0];

  return (
    <button
      className={`main-button ${distortionLevel >= 1 ? 'distorted-1' : ''} ${distortionLevel >= 3 ? 'distorted-3' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

import { useEffect, useState } from 'react';
import '../styles/FloatingNumber.css';

interface FloatingNumberProps {
  value: number;
  x: number;
  y: number;
  id: string;
  onComplete: (id: string) => void;
}

export function FloatingNumber({ value, x, y, id, onComplete }: FloatingNumberProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete(id);
    }, 1000);

    return () => clearTimeout(timer);
  }, [id, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="floating-number"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      +{value}
    </div>
  );
}

interface DisclaimerModalProps {
  onAccept: () => void;
}

export function DisclaimerModal({ onAccept }: DisclaimerModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal disclaimer-modal">
        <h2>⚠️ THE FINE PRINT THAT ISN'T FINE</h2>
        <div className="modal-content">
          <p>
            This is satirical systems fiction. It cannot tell you what's safe.
            Real life has no save states. If you're worried about yourself
            or a mate, talk to someone who isn't a browser game.
          </p>
          <p className="resource-line">
            <strong>National Alcohol and Other Drug Hotline: 1800 250 015</strong>
          </p>
          <p className="disclaimer-note">
            This game uses abstracted mechanics and fictional substance names.
            It does not provide dosage information, consumption guides, or medical advice.
            The goal is to teach about compound risk through systems thinking, not instruction.
          </p>
        </div>
        <button className="modal-button primary" onClick={onAccept}>
          I understand. Let's go.
        </button>
      </div>
    </div>
  );
}

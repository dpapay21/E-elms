import landingLogo from "../../assets/877d674005f4.png";
import "./LoadingTransition.css";

export default function LoadingTransition({ label }) {
  if (!label) return null;

  return (
    <div className="brand-transition" role="status" aria-live="polite" aria-label={label} aria-busy="true">
      <div className="brand-transition-content">
        <div className="brand-transition-mark">
          <span className="brand-transition-ring" aria-hidden="true" />
          <img src={landingLogo} alt="" />
        </div>
        <strong>E-LMIS</strong>
        <span className="brand-transition-label">{label}</span>
        <span className="brand-transition-progress" aria-hidden="true"><i /></span>
      </div>
    </div>
  );
}

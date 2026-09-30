import landingLogo from '../../assets/877d674005f4.png';
import '../../styles/landing.css';

const links = [
  ['Services', '/services'],
  ['News & updates', '/news'],
  ['About E-LMIS', '/about'],
  ['Contact', '/contact'],
  ['Applicant directory', '/applicants'],
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <a className="site-footer-logo" href="/">
            <img src={landingLogo} alt="" />
            <span>E-LMIS</span>
          </a>
          <p>Ethiopia’s Labor Market Information System connects people with practical workforce information and public employment services.</p>
        </div>
        <div className="site-footer-links">
          <h2>Explore</h2>
          {links.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
        </div>
        <div className="site-footer-contact">
          <h2>Get support</h2>
          <p>For service questions and general support, call the Ministry of Labor and Skills hotline.</p>
          <a className="site-footer-hotline" href="tel:9138">9138 <span>Free hotline</span></a>
          <a className="site-footer-login" href="/login">Sign in to E-LMIS <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <div className="site-footer-bottom"><span>© {new Date().getFullYear()} E-LMIS · Ministry of Labor and Skills</span><a href="/about">About this service</a></div>
    </footer>
  );
}

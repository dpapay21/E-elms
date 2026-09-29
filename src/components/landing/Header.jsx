import asset0 from '../../assets/877d674005f4.png';
import '../../styles/landing.css';

export default function Header() {
  return (
    <header className="header">
      <a className="logo" href="#" aria-label="E-LMIS home">
        <img src={asset0} alt="" width="56" height="56" />
        E-LMIS
      </a>
      <nav className="nav-inline" aria-label="Main">
        <a href="#">Home</a>
        <a href="#features">Services</a>
        <a href="#updates">News &amp; Updates</a>
        <a href="#workforce">About</a>
        <a href="#get-started">Contact</a>
        <a className="nav-applicants" href="#applicants">Applicants</a>
      </nav>
      <div className="header-right">
        <a className="header-login" href="/login">Login</a>
        <a className="header-download" href="#mobile-app">Download App</a>
        <a className="header-applicants" href="#applicants">Applicants</a>
        <button className="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}

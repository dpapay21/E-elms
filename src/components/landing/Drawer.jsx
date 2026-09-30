import '../../styles/landing.css';

export default function Drawer() {
  return (
    <nav className="drawer" id="menu" aria-label="Main">
      <div className="drawer-links">
        <a href="/">Home</a>
        <a href="/services">Services</a>
        <a href="/news">News &amp; Updates</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/applicants">Applicants</a>
      </div>
      <div className="drawer-actions">
        <a className="drawer-btn outline" href="/login">Login</a>
        <a className="drawer-btn solid" href="/services#mobile-app">Explore services</a>
      </div>
    </nav>
  );
}

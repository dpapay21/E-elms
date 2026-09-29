import '../../styles/landing.css';

export default function Drawer() {
  return (
    <nav className="drawer" id="menu" aria-label="Main">
      <div className="drawer-links">
        <a href="#">Home</a>
        <a href="#features">Services</a>
        <a href="#updates">News &amp; Updates</a>
        <a href="#workforce">About</a>
        <a href="#get-started">Contact</a>
      </div>
      <div className="drawer-actions">
        <a className="drawer-btn outline" href="/login">Login</a>
        <a className="drawer-btn solid" href="#mobile-app">Download App</a>
      </div>
    </nav>
  );
}

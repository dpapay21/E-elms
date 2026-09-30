import Header from '../components/landing/Header.jsx';
import Drawer from '../components/landing/Drawer.jsx';
import Hero from '../components/landing/Hero.jsx';
import Slogan from '../components/landing/Slogan.jsx';
import Impact from '../components/landing/Impact.jsx';
import Cards from '../components/landing/Cards.jsx';
import Features from '../components/landing/Features.jsx';
import Empower from '../components/landing/Empower.jsx';
import Photo from '../components/landing/Photo.jsx';
import Destinations from '../components/landing/Destinations.jsx';
import News from '../components/landing/News.jsx';
import Intl from '../components/landing/Intl.jsx';
import Ss from '../components/landing/Ss.jsx';
import Ap from '../components/landing/Ap.jsx';
import Hand from '../components/landing/Hand.jsx';
import Svc from '../components/landing/Svc.jsx';
import Media from '../components/landing/Media.jsx';
import Cta from '../components/landing/Cta.jsx';
import Footer from '../components/landing/Footer.jsx';
import useLandingInteractions from '../hooks/useLandingInteractions.js';

export default function HomePage() {
  useLandingInteractions();
  return (
    <div className="page">
      <Header />
      <Drawer />
      <Hero />
      <Slogan />
      <Impact />
      <Cards />
      <Features />
      <Empower />
      <Photo />
      <Destinations />
      <News />
      <Intl />
      <Ss />
      <Ap />
      <Hand />
      <Svc />
      <Media />
      <Cta />
      <Footer />
    </div>
  );
}

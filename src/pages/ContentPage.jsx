import Header from '../components/landing/Header.jsx';
import Drawer from '../components/landing/Drawer.jsx';
import Footer from '../components/landing/Footer.jsx';
import Features from '../components/landing/Features.jsx';
import Svc from '../components/landing/Svc.jsx';
import Empower from '../components/landing/Empower.jsx';
import News from '../components/landing/News.jsx';
import Intl from '../components/landing/Intl.jsx';
import Ap from '../components/landing/Ap.jsx';
import useLandingInteractions from '../hooks/useLandingInteractions.js';
import aboutImage from '../assets/6bcb67001cc8.jpg';
import serviceImage from '../assets/ac91a3c45dee.jpg';
import contactImage from '../assets/7aa10e5f6065.jpg';
import applicantsImage from '../assets/9eb23d9416d2.jpg';
import '../styles/landing.css';

const pageDetails = {
  services: {
    eyebrow: 'SERVICES FOR A STRONGER WORKFORCE',
    title: 'Practical tools for your employment journey',
    copy: 'Use E-LMIS to understand the labor market, prepare your profile, explore employment services, and keep your information in one place.',
    image: serviceImage,
    alt: 'Illustration of connected labor market and employment services',
    primary: ['Create an account', '/register'],
    secondary: ['Explore applicants', '/applicants'],
  },
  news: {
    eyebrow: 'NEWS & UPDATES',
    title: 'What’s happening across the labor market',
    copy: 'Read service announcements, ministry updates, and international labor market stories collected for E-LMIS visitors.',
    image: contactImage,
    alt: 'E-LMIS support team member ready to help visitors',
    primary: ['Contact support', '/contact'],
    secondary: ['About E-LMIS', '/about'],
  },
  about: {
    eyebrow: 'ABOUT E-LMIS',
    title: 'Clearer information. Better opportunities.',
    copy: 'E-LMIS is a public-facing labor market information service designed to make workforce information and employment services easier to find and use.',
    image: aboutImage,
    alt: 'Ethiopian community members standing together outdoors',
    primary: ['Explore services', '/services'],
    secondary: ['Get support', '/contact'],
  },
  contact: {
    eyebrow: 'CONTACT & SUPPORT',
    title: 'We’re here to help you use E-LMIS',
    copy: 'Find the right next step for account access, service questions, and general support from the Ministry of Labor and Skills.',
    image: contactImage,
    alt: 'Support agent wearing a headset',
    primary: ['Call 9138', 'tel:9138'],
    secondary: ['Sign in', '/login'],
  },
  applicants: {
    eyebrow: 'APPLICANT DIRECTORY',
    title: 'Explore accepted applicant profiles',
    copy: 'Browse accepted public profiles and search by name, job, or destination. The directory updates when applications are approved.',
    image: applicantsImage,
    alt: 'People in Ethiopia representing the workforce served by E-LMIS',
    primary: ['View directory', '#applicants'],
    secondary: ['Learn about services', '/services'],
  },
};

function PageHero({ page, details }) {
  return (
    <section className={`content-hero content-hero-${page}`}>
      <div className="content-hero-copy">
        <p className="content-eyebrow">{details.eyebrow}</p>
        <h1>{details.title}</h1>
        <p className="content-hero-lead">{details.copy}</p>
        <div className="content-hero-actions">
          <a className="content-button content-button-primary" href={details.primary[1]}>{details.primary[0]} <span aria-hidden="true">→</span></a>
          <a className="content-button content-button-secondary" href={details.secondary[1]}>{details.secondary[0]}</a>
        </div>
      </div>
      <div className="content-hero-image-wrap">
        <img src={details.image} alt={details.alt} />
        <div className="content-image-caption"><span className="content-image-dot" />Public service · Workforce information</div>
      </div>
    </section>
  );
}

function ServicesDetails() {
  const steps = [
    ['01', 'Create your account', 'Register with your email and complete the requested profile details.'],
    ['02', 'Explore services', 'Review labor market information, career resources, and available destinations.'],
    ['03', 'Submit your application', 'Share your employment preferences and provide the requested supporting documents.'],
    ['04', 'Follow the decision', 'Your submission is reviewed by the authorized team. Accepted public profiles appear in the directory.'],
  ];
  return (
    <>
      <Features />
      <section className="content-steps" id="how-it-works">
        <div className="content-section-heading"><p className="content-eyebrow">GETTING STARTED</p><h2>A simple path through the service</h2><p>Use these steps to get started and understand what happens after you submit your information.</p></div>
        <ol>{steps.map(([number, title, copy]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol>
      </section>
      <Empower />
      <Svc />
      <section className="content-app-callout" id="mobile-app"><div><p className="content-eyebrow">ACCESS ANYWHERE</p><h2>Designed for mobile and desktop</h2><p>Use the E-LMIS website from your phone, tablet, or computer. Sign in to continue your application or create an account to begin.</p></div><a className="content-button content-button-primary" href="/register">Create an account <span aria-hidden="true">→</span></a></section>
    </>
  );
}

function AboutDetails() {
  return (
    <>
      <section className="content-story">
        <div className="content-section-heading"><p className="content-eyebrow">THE PLATFORM</p><h2>One place to understand work and opportunity</h2></div>
        <p>E-LMIS brings together information and services that help people make informed decisions about employment. It gives job seekers a clearer starting point, supports access to employment pathways, and helps visitors find relevant public resources.</p>
      </section>
      <section className="content-values">
        <article><span>01</span><h3>Useful information</h3><p>Explore labor market topics, destination information, service updates, and applicant profiles in one place.</p></article>
        <article><span>02</span><h3>Clear next steps</h3><p>Move from learning about the service to creating an account and submitting the information needed for review.</p></article>
        <article><span>03</span><h3>Responsible access</h3><p>Application details are managed through authorized review, while the public directory shows only limited accepted profile information.</p></article>
      </section>
      <div className="content-photo-note"><img src={aboutImage} alt="Community members together" loading="lazy" /><p>Supporting a connected and informed workforce is at the heart of E-LMIS.</p></div>
    </>
  );
}

function ContactDetails() {
  return (
    <>
      <section className="contact-options" id="contact-options">
        <article className="contact-option-card contact-hotline"><span className="contact-option-icon" aria-hidden="true">☎</span><p className="content-eyebrow">CALL THE HOTLINE</p><h2>9138</h2><p>Use the Ministry of Labor and Skills toll-free hotline for general support and service questions.</p><a href="tel:9138">Call 9138 <span aria-hidden="true">→</span></a></article>
        <article className="contact-option-card"><span className="contact-option-icon" aria-hidden="true">◎</span><p className="content-eyebrow">ONLINE SERVICES</p><h2>Continue on E-LMIS</h2><p>Sign in to continue with your account, or create one to start an application.</p><a href="/login">Go to sign in <span aria-hidden="true">→</span></a></article>
        <article className="contact-option-card"><span className="contact-option-icon" aria-hidden="true">▤</span><p className="content-eyebrow">APPLICANT DIRECTORY</p><h2>Browse accepted profiles</h2><p>Explore the public directory of applicants whose profiles have been accepted for display.</p><a href="/applicants">Open directory <span aria-hidden="true">→</span></a></article>
      </section>
      <section className="contact-faq"><div className="content-section-heading"><p className="content-eyebrow">HELPFUL INFORMATION</p><h2>Before you contact support</h2></div><details><summary>Where do I start an application?</summary><p>Create an account or sign in, then follow the registration steps to provide your profile and employment preferences.</p></details><details><summary>Why can’t I see my profile in the public directory?</summary><p>The directory displays accepted profiles only. Submissions must be reviewed before they appear there.</p></details><details><summary>What should I do if I can’t sign in?</summary><p>Check that you are using the email linked to your account. For further help, call the 9138 hotline.</p></details></section>
    </>
  );
}

export default function ContentPage({ page }) {
  useLandingInteractions();
  const details = pageDetails[page];
  return (
    <div className="page content-page">
      <Header />
      <Drawer />
      <main>
        <PageHero page={page} details={details} />
        {page === 'services' && <ServicesDetails />}
        {page === 'news' && <><News /><Intl /></>}
        {page === 'about' && <AboutDetails />}
        {page === 'contact' && <ContactDetails />}
        {page === 'applicants' && <Ap />}
      </main>
      <Footer />
    </div>
  );
}

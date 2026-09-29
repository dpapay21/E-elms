import asset2 from '../../assets/a5d2fb619e3d.jpg';
import asset3 from '../../assets/15c4f703fe7c.jpg';
import asset4 from '../../assets/ac91a3c45dee.jpg';
import asset5 from '../../assets/d20f5ba9131f.jpg';
import '../../styles/landing.css';

export default function Features() {
  return (
    <section className={'features'} id={'features'}> <div className={'tag'}>Latest Updates</div> <h2 className={'impact-title'}>Key Features And Services</h2> <p className={'impact-copy'}>Discover the core functionalities that make <span style={{whiteSpace: 'nowrap'}}>E-LMIS</span> your secure and trusted government platform for all labor market needs.</p> <ul className={'fc-list'}> <li><button className={'fc-btn'} type={'button'} aria-expanded={'false'}><img src={asset2} alt={'Intelligent Job Matching — Connecting job seekers with relevant opportunities based on skills, experience, and aspirations, as a public service.'} width={'653'} height={'342'} /></button></li> <li><button className={'fc-btn'} type={'button'} aria-expanded={'false'}><img src={asset3} alt={'Seamless Integration — Ensuring smooth data exchange and connectivity with other government and private sector platforms for a unified experience, bolstered by your secure Labor ID.'} width={'654'} height={'376'} /></button></li> <li><button className={'fc-btn'} type={'button'} aria-expanded={'false'}><img src={asset4} alt={'Comprehensive Services — A wide array of services including career counseling, skill development programs, and labor market advisory, available to all citizens.'} width={'659'} height={'370'} /></button></li> <li><button className={'fc-btn'} type={'button'} aria-expanded={'false'}><img src={asset5} alt={'Robust Data Security — Protecting your personal and business information with state-of-the-art security measures and privacy protocols, especially through the secure biometric Labor ID system.'} width={'657'} height={'372'} /></button></li> </ul> </section>
  );
}

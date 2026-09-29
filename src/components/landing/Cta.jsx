import '../../styles/landing.css';

export default function Cta() {
  return (
    <section className={'cta'} id={'get-started'} aria-labelledby={'ctaTitle'}> <div className={'cta-inner'}> <h2 id={'ctaTitle'}>Ready to Start Your Journey?</h2> <p>Join thousands of Ethiopians who have found meaningful employment through LMIS. Your dream job is waiting for you.</p> <div className={'cta-actions'}> <a className={'cta-btn wide'} href={'#'}><svg viewBox={'0 0 24 24'} fill={'none'} stroke={'currentColor'} strokeWidth={'1.8'} strokeLinecap={'round'} strokeLinejoin={'round'} aria-hidden={'true'}><rect x={'3'} y={'7'} width={'18'} height={'13'} rx={'2'}></rect><path d={'M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18'}></path></svg>Apply Now</a> <a className={'cta-btn'} href={'#'}>Contact Us Today <svg viewBox={'0 0 24 24'} fill={'none'} stroke={'currentColor'} strokeWidth={'1.8'} strokeLinecap={'round'} strokeLinejoin={'round'} aria-hidden={'true'}><path d={'M5 12h14M13 6l6 6-6 6'}></path></svg></a> </div> </div> <div className={'cta-flag'} aria-hidden={'true'}></div> </section>
  );
}

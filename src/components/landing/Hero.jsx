import asset1 from '../../assets/9eb23d9416d2.jpg';
import '../../styles/landing.css';

export default function Hero() {
  return (
    <main className={'hero'}> <div className={'hero-text'}> <h1>ETHIOPIAN<br />LABOR<br />MARKET</h1> <p className={'lead'}>Empowering Ethiopia's Workforce through comprehensive labor market information and seamless, secure connections, provided as a dedicated public service. We strive to create opportunities, foster growth, and build a prosperous future for all. Agreement today to get your official Labor ID.</p> <div className={'actions'}> <a className={'btn btn-primary'} href={'#'}>Agreement</a> <a className={'btn btn-outline'} href={'#'}> <svg width={'22'} height={'22'} viewBox={'0 0 24 24'} fill={'none'} stroke={'currentColor'} strokeWidth={'2.2'} strokeLinecap={'round'} aria-hidden={'true'}><path d={'M4 15v-3a8 8 0 0 1 16 0v3'}></path><rect x={'3'} y={'14'} width={'4'} height={'6'} rx={'1.5'}></rect><rect x={'17'} y={'14'} width={'4'} height={'6'} rx={'1.5'}></rect></svg>
        Support
      </a> <button className={'play'} type={'button'} aria-label={'Play intro video'}><svg viewBox={'0 0 12 14'} aria-hidden={'true'}><path d={'M0 0l12 7-12 7z'} fill={'#fff'}></path></svg></button> </div> </div> <div className={'art'}><img src={asset1} alt={'An older woman and a younger woman standing together in front of an outline of Ethiopia'} width={'900'} height={'597'} /></div> </main>
  );
}

import asset24 from '../../assets/da5629ac41ea.jpg';
import '../../styles/landing.css';

export default function Media() {
  return (
    <section className={'media'} id={'in-the-media'}> <div className={'media-card reveal'}> <div className={'media-text'}> <h2 className={'media-title'}>Featured in the Media Our Story, Innovation</h2> <p className={'media-copy'}>E-LMIS is making headlines for its innovative approach to labor market development as a key government initiative. Discover our journey and impact on empowering Ethiopia's workforce.</p> <a className={'media-btn'} href={'#'}><svg viewBox={'0 0 24 24'} fill={'none'} stroke={'currentColor'} strokeWidth={'1.8'} strokeLinecap={'round'} strokeLinejoin={'round'} aria-hidden={'true'}><path d={'M4 14v-2a8 8 0 0 1 16 0v2'}></path><rect x={'3'} y={'14'} width={'4'} height={'6'} rx={'1.5'}></rect><rect x={'17'} y={'14'} width={'4'} height={'6'} rx={'1.5'}></rect></svg>Support</a> </div> <img className={'media-img'} src={asset24} alt={'Smiling man celebrating while holding a smartphone'} width={'446'} height={'383'} loading={'lazy'} /> </div> </section>
  );
}

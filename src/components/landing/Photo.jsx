import asset6 from '../../assets/6bcb67001cc8.jpg';
import '../../styles/landing.css';

export default function Photo() {
  return (
    <section className={'photo'} aria-label={'Our community'}> <figure className={'photo-frame'}> <img src={asset6} alt={'Four smiling Ethiopians in traditional blue and white clothing standing together in a sunlit field'} width={'368'} height={'639'} loading={'lazy'} /> </figure> </section>
  );
}

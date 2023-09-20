import { Link } from 'react-router-dom';
import './Home.css'

const Home = () => {
  return (
    <div className='home-container'>
        <div className="hero-container">
            <h1 className='hero-h1'>Create a bitpac, vote&nbsp;on statements, and control a treasury</h1>
            <img className='hero-img' src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="A group of people working together" />
            <p>A bitpac is a publicly auditable cooperative that lives on bitcoin. Use this site to create a bitpac so that you and the other members of your cooperative can control some money and vote on how to spend it.</p>
        </div>
        <div className="cta-container">
            <Link className='cta-btn' to='create'>Create your tribe</Link>
            <Link className='cta-btn' to='join'>Join a tribe</Link>
        </div>
        
    </div>
  )
};

export default Home;

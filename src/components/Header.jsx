import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { getAddress } from 'sats-connect'
import tribeLogo from '../assets/tribe-logo.png'

import './Header.css'

const Header = () => {
    const [addresses, setAddresses] = useState(null)

    console.log(addresses)

    const getAddressOptions = {
      payload: {
      purposes: ['ordinals', 'payment'],
      message: 'Address for receiving Ordinals and payments',
      network: {
          type:'Mainnet'
      },
      },
      onFinish: (response) => {
      console.log(response)
      setAddresses(response.addresses)
      },
      onCancel: () => alert('Request canceled'),
      };

  return (
    <div className="header-container">
      <Link to='/' className="company-logo">
        <h1 className="company-name">Tribe</h1>
        <img className="company-img" src={tribeLogo} alt="Tribe logo" />
        {/* <img className="company-img" src="https://raw.githubusercontent.com/22388o/12345/main/PNG%202.png" alt="Tribe logo" /> */}
      </Link>
      <nav className="navbar">
        <Link className='nav-links' to='create'>create</Link>
        <Link className='nav-links' to='join'>join</Link>
        <Link className='nav-links' to='about'>about</Link>
        <button className='connect-wallet-btn' onClick={() => getAddress(getAddressOptions)}><FontAwesomeIcon icon={faWallet} /> connect wallet</button>
      </nav>
      
    </div>
  )
};

export default Header;
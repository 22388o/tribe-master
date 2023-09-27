import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { getAddress } from 'sats-connect'
import tribeLogo from '../assets/tribe-new-logo.png'
import { Twirl as Hamburger } from 'hamburger-react'

import './Header.css'

const Header = () => {

    const [isOpen, setOpen] = useState(false)

    let navbarRef = useRef();

    useEffect(()=>{
    
    let handler = (e) => {
      if(!navbarRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handler);

    return() => {
      document.removeEventListener('click', handler);
    }

  })

    const [addresses, setAddresses] = useState(null)

    const activeStyle = {
      fontWeight: "bold",
      color: "#454545",
      backgroundColor: '#ffa500',
      borderBottom: '5px solid #454545'
    }

    console.log(addresses)

    const getAddressOptions = {
      payload: {
      purposes: ['ordinals', 'payment'],
      message: 'Address for receiving Ordinals and payments',
      network: {
          type:'Testnet'
      },
      },
      onFinish: (response) => {
      console.log(response)
      setAddresses(response.addresses)
      },
      onCancel: () => alert('Request canceled'),
      };

  return (
    <div 
      className="header-container"
      ref={navbarRef}>
      <Link to='/' className="company-logo">
        <h1 className="company-name">Tribe</h1>
        <img className="company-img" src={tribeLogo} alt="Tribe logo" />
      </Link>
      <nav 
        className={isOpen ? "navbar-open" : "navbar-closed"}>
        <NavLink 
          className='nav-links' to='create'
          style={({isActive}) => isActive ? activeStyle : null}
          >
            create
        </NavLink>
        <NavLink 
          className='nav-links' 
          to='join'
          style={({isActive}) => isActive ? activeStyle : null}
          >
            join
        </NavLink>
        <NavLink 
          className='nav-links' to='about'
          style={({isActive}) => isActive ? activeStyle : null}
          >
            about
        </NavLink>
        <button className='connect-wallet-btn' onClick={() => getAddress(getAddressOptions)}><FontAwesomeIcon icon={faWallet} /> connect wallet</button>
      </nav>
      <div className="hamburger">
        <Hamburger 
          toggled={isOpen} 
          toggle={setOpen}
          color="orange" />
      </div>
      
    </div>
  )
};

export default Header;
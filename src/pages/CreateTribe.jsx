// import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import './CreateTribe.css'

const CreateTribe = () => {

    const activeStyle = {
        fontWeight: "bold",
        color: "#ff5722",
        borderBottom: '2px solid #ff5722'
      }

  return (
    <div className="create-container">
        <h1>Create your tribe</h1>

        <p>A tribe is a publicly auditable cooperative that lives on bitcoin. Use this form to create a tribe so that you and the other members of your cooperative can control some money and vote on how to spend it.
        </p>
        <p>What is your tribe based on?</p>

        <div
            className="choose-bitpac">
            <NavLink
                className='bitpac-type'
                to='nostr'
                style={({isActive}) => isActive ? activeStyle : null}>nostr pubkey
            </NavLink>
            <NavLink
                className='bitpac-type'
                to="bitcoin"
                style={({isActive}) => isActive ? activeStyle : null}>bitcoin tr address
            </NavLink>
            <NavLink
                className='bitpac-type'
                to="ordinals"
                style={({isActive}) => isActive ? activeStyle : null}
                >
              ordinals
            </NavLink>
        </div>
        <Outlet />
    </div>
  )
};

export default CreateTribe;

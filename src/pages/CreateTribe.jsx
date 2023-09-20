import { useState } from "react";
import './CreateTribe.css'

const CreateTribe = () => {
    const [tribe, setTribe] = useState({
        tribeName: '',
        type: '',
        pubkeys: []
    })


    const handleChange = (e) => {
        setTribe({...tribe,
                tribeName: e.target.value, 
            });
      }
    console.log(tribe)
  return (
    <div className="create-container">
      <div className="multisig_creator">
            <p>A bitpac is a publicly auditable cooperative that lives on bitcoin. Use this form to create a bitpac so that you and the other members of your cooperative can control some money and vote on how to spend it.</p>
            <form id="create-form">
                {/* <p>Name your bitpac:</p>
                <input className="bitpac_name" /> */}
                <label>Name your bitpac:
                    <input type="text" onChange={(event) => handleChange(event)} />
                </label>
                <p>What is your bitpac based on?</p>
                <label
                    className="radio-label">
                <input
                    className="radio-btn"
                    onChange={e => setTribe({...tribe,
                        type: e.target.value
                    })} 
                    type="radio" 
                    name="myRadio" 
                    value="npub" />
                    nostr
                </label>
                <label
                    className="radio-label">
                <input
                    className="radio-btn"
                    onChange={e => setTribe({...tribe,
                        type: e.target.value
                    })} 
                    type="radio" 
                    name="myRadio" 
                    value="bc1p" />
                    btc
                </label>
                <label
                    className="radio-label">
                <input
                    className="radio-btn"
                    onChange={e => setTribe({...tribe,
                        type: e.target.value
                    })} 
                    type="radio" 
                    name="myRadio" 
                    value="ordinals" />
                    ordinals
                </label>
                {/* <input 
                    type="radio"
                    name="select-type"
                    form="create-form" 
                    onChange={(event) => handleChange(event)} 
                    id="options"
                    required>
                    <option value="npub">NOSTR npubs</option>
                    <option value="btcddress">BTC Wallet Addresses</option>
                    <option value="Ordinals">Ordinals</option>
                </input> */}
                <p>Enter an npub for everyone in your bitpac:</p>
                <div className="select_npubs">
                </div>
                <p>Pick how many votes are needed to spend the money:</p>
                {/* <input 
                    className="select_threshold" type="number" 
                    value="1" 
                    min="1" 
                    step="1" 
                    max="74" /> */}
                <p>Your policy so far: <span className="threshold_num">1</span> out of <span className="multisig_num">1</span></p>
                <div className="nostr_profiles"></div>
                <input type="submit" className="create_bitpac" />

            </form>
        </div>
    </div>
  )
};

export default CreateTribe;

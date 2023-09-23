import MultiSig from "../../components/MultiSig";

const CreateTribeNostr = () => {
  return (
    <div>
      <p>Enter an npub for everyone in your tribe:</p>
      
        <script>
            var $ = document.querySelector.bind( document );
            var $$ = document.querySelectorAll.bind( document );
            var url_params = new URLSearchParams( window.location.search );
            var url_keys = url_params.keys();
            var $_GET = {}
            for ( var key of url_keys ) $_GET[ key ] = url_params.get( key );
        </script>
        <script>
            if ( !window.location.href.includes( "dhtesting.htm" ) ) {
                var url = "https://" + window.location.hostname + "/dhtesting.html";
                if ( $_GET[ "network" ] ) url += "?network=" + $_GET[ "network" ];
                window.location.href = url;
            }
        </script>
        <script>
            var mempoolnet = "mainnet"; //the full word: mainnet | testnet (works for signet too) | regtest
            var mempoolNetwork = ""; //mainnet: "" | signet: "signet/"
            if ( $_GET[ "network" ] == "testnet" ) {
                mempoolNetwork = "testnet/";
                mempoolnet = "testnet";
            }
            if ( $_GET[ "network" ] == "signet" ) {
                mempoolNetwork = "signet/";
                mempoolnet = "testnet"; //this one is identical for testnet and signet
            }
            if ( $_GET[ "network" ] == "mainnet" ) {
                mempoolNetwork = "";
                mempoolnet = "mainnet";
            }
            if ( $_GET[ "network" ] == "regtest" ) {
                mempoolNetwork = "";
                mempoolnet = "regtest";
            }
            sessionStorage.clear();
            var relays = {
                'wss://relay.damus.io': null,
                'wss://nos.lol': null,
                'wss://booger.pro': null,
                'wss://nostr.mutinywallet.com': null,
            }
            var bad_relays = {
                'wss://relay.damus.io': 0,
                'wss://nos.lol': 0,
                'wss://booger.pro': 0,
            }
            sessionStorage[ "utxos" ] = "[]";
            var known_proposals = [];
            var getting_info_for = [];
            var threshold = null;
            var dont_broadcast = [];
            var sigs = {}
            var denys = {}
            var sha256  = bitcoinjs.crypto.sha256;
            var { getSharedSecret, schnorr, utils } = nobleSecp256k1;
            var bytesToHex = ( bytes ) => {return bytes.reduce( ( str, byte ) => str + byte.toString( 16 ).padStart( 2, "0" ), "" );}
            if ( !$_GET[ "multisig" ] ) {
                var privKey = bytesToHex( nobleSecp256k1.utils.randomPrivateKey() );
                var pubKey = nobleSecp256k1.getPublicKey( privKey, true ).substring( 2 );
            } else {
                var multisig = null;
            }
            function addNpub( element ) {
                if ( $$( '.select_npub' ).length >= 67 ) {
                    showModal( "max number of keys for the multisig is 67" );
                    return;
                }
                if ( element && $$( '.select_npub' ).length < 67 ) {
                    element.previousElementSibling.style.display = "inline-block";
                }
                if ( $( '.plus_button' ) ) {
                    $( '.plus_button' ).remove();
                }
                var input = document.createElement( "input" );
                input.type = "text";
                var identifier = bytesToHex( nobleSecp256k1.utils.randomPrivateKey() );
                input.className = `select_npub npub_${identifier}`;
                input.onchange = (i) => {
                    var npub = i.srcElement.value;
                    var identifier = i.srcElement.classList[ 1 ].substring( 5 );
                    if ( getting_info_for.includes( JSON.stringify( [ npub, identifier ] ) ) ) return;
                    getting_info_for.push( JSON.stringify( [ npub, identifier ] ) );
                    getCounterpartyInfo( npub, identifier );
                }
                input.onkeyup = (i) => {
                    var npub = i.srcElement.value;
                    var identifier = i.srcElement.classList[ 1 ].substring( 5 );
                    if ( getting_info_for.includes( JSON.stringify( [ npub, identifier ] ) ) ) return;
                    getting_info_for.push( JSON.stringify( [ npub, identifier ] ) );
                    getCounterpartyInfo( npub, identifier );
                }
                $( '.select_npubs' ).append( input );
                var minus = document.createElement( "div" );
                minus.className = "minus_button";
                minus.setAttribute( "data-identifier", identifier );
                minus.innerText = "-";
                minus.onclick = function() {
                    this.previousElementSibling.remove();
                    this.remove();
                    $( `.profile_${this.getAttribute( "data-identifier" )}` ).remove();
                    $( '.multisig_num' ).innerText = $$( '.select_npub' ).length;
                    if ( Number( $( '.select_threshold' ).value ) > $$( '.select_npub' ).length ) $( '.select_threshold' ).value = $$( '.select_npub' ).length;
                    $( '.threshold_num' ).innerText = $( '.select_threshold' ).value;
                }
                $( '.select_npubs' ).append( minus );
                var plus = document.createElement( "div" );
                plus.className = "plus_button";
                plus.innerText = "+";
                plus.onclick = function() {addNpub( this );}
                $( '.select_npubs' ).append( plus );
                var profile = document.createElement( "div" );
                profile.className = `profile profile_${identifier}`;
                profile.innerHTML = `
                    <div style="display: none; background-color: white; padding: 1rem; margin: 1rem 0.5rem; border-radius: 1rem; max-width: 10rem; text-align: center; border: 1px solid black;"><div style="width: 8rem; height: 8rem; background-size: cover; background-position: center center; margin-bottom: 1rem;" class="pic"><!--<img class="pic" style="width: 100%">--></div><div class="nym" style="color: black; word-wrap: break-word;"></div></div>
                `;
                $( '.nostr_profiles' ).append( profile );
                $( '.multisig_num' ).innerText = $$( '.select_npub' ).length;
                if ( Number( $( '.select_threshold' ).value ) > $$( '.select_npub' ).length ) $( '.select_threshold' ).value = $$( '.select_npub' ).length;
                $( '.threshold_num' ).innerText = $( '.select_threshold' ).value;
            }
            async function getCounterpartyInfo( npub, identifier ) {
                var div_to_get = `.profile_${identifier}`;
                if ( !npub ) {
                    npub = $( div_to_get ).getAttribute( "data-npub" );
                    $( div_to_get ).innerHTML = `
                        <div style="display: none; background-color: white; padding: 1rem; margin: 1rem 0.5rem; border-radius: 1rem; max-width: 10rem; text-align: center; border: 1px solid black;"><div style="width: 8rem; height: 8rem; background-size: cover; background-position: center center; margin-bottom: 1rem;" class="pic"><!--<img class="pic" style="width: 100%">--></div><div class="nym" style="color: black; word-wrap: break-word;"></div></div>
                    `;
                    getting_info_for.splice( getting_info_for.indexOf( JSON.stringify( [ npub, identifier ] ) ), 1 );
                    return;
                }
                sessionStorage[ identifier ] = npub;
                sessionStorage[ "identifier" ] = identifier;
                sessionStorage[ "npub" ] = npub;
                $$( '.profile' ).forEach( item => {
                    setTimeout( () => {
                        var innerText = item.firstElementChild.getElementsByClassName( "nym" )[ 0 ].innerText;
                        if ( !innerText || innerText === "undefined" ) item.firstElementChild.getElementsByClassName( "nym" )[ 0 ].innerText = "Profile not found";
                        item.firstElementChild.style.display = "inline-block";
                    }, 3000 );
                });
                var i; for ( i=0; i<Object.keys( relays ).length; i++ ) {
                    var myrelay = Object.keys( relays )[ i ];
                    await waitForOneRelay( true );
                    if ( !relays[ myrelay ] || relays[ myrelay ].readyState != 1 ) continue;
                    var subId   = bytesToHex( nobleSecp256k1.utils.randomPrivateKey() ).toString( "hex" ).substring( 0, 24 );
                    var filter = { "kinds": [ 0 ], "authors": [ pubkeyFromNpub( npub ) ], limit: 1 }
                    var subscription = [ "REQ", subId, filter ];
                    relays[ myrelay ].addEventListener( "message", handleMessage );
                    relays[ myrelay ].send( JSON.stringify( subscription ) );
                    await waitSomeSeconds( 2 );
                    relays[ myrelay ].close();
                }
            }
            function pubkeyFromNpub(npub) {
                return Buffer.from(bech32.bech32.fromWords(bech32.bech32.decode(npub).words)).toString("hex");
            }
            function pubkeyToNpub(hex) {
                return bech32.bech32.encode("npub", bech32.bech32.toWords(Buffer.from(hex, "hex")));
            }
            function privkeyFromNsec( nsec ) {
                return Buffer.from( bech32.bech32.fromWords( bech32.bech32.decode( nsec ).words ) ).toString( "hex" );
            }
            var isValidNpub = (npub) => {
                try {
                    var pubkey = pubkeyFromNpub( npub );
                    return true;
                } catch( e ) {
                    return;
                }
            }
            var handleMessage = async ( message ) => {
                var [ type, subId, event ] = JSON.parse( message.data );
                var { kind, content } = event || {}
                if ( !event || event === true ) return;
                if ( kind === 4 ) {
                    content = await decrypt(privKey, event.pubkey, content);
                }
                if ( kind === 0 ) {
                    if ( $_GET[ "multisig" ] ) {
                        var i; for ( i=0; i<67; i++ ) {
                            if ( i > $$( ".profile" ).length - 1 ) continue;
                            var div_to_get = `.profile_${event.pubkey}_${i}`;
                            if ( !$( div_to_get ) ) continue;
                            $( '.loading_profiles' ).style.display = "none";
                            $( div_to_get ).setAttribute( "data-npub", pubkeyToNpub( event.pubkey ) );
                            if ( !JSON.parse( content )[ "name" ] && !JSON.parse( content )[ "picture" ] ) continue;
                            $( div_to_get ).firstElementChild.style.display = "inline-block";
                            $( `${div_to_get} .nym` ).innerText = JSON.parse( content )[ "name" ];
                            $( `${div_to_get} .pic` ).style.backgroundImage = `url( ${JSON.parse( content )[ "picture" ]} )`;
                        }
                    } else {
                        var div_to_get = `.profile_${sessionStorage[ "identifier" ]}`;
                        $( div_to_get ).setAttribute( "data-npub", pubkeyToNpub( event.pubkey ) );
                        if ( !JSON.parse( content )[ "name" ] && !JSON.parse( content )[ "picture" ] ) return;
                        $( div_to_get ).firstElementChild.style.display = "inline-block";
                        $( `${div_to_get} .nym` ).innerText = JSON.parse( content )[ "name" ];
                        $( `${div_to_get} .pic` ).style.backgroundImage = `url( ${JSON.parse( content )[ "picture" ]} )`;
                    }
                }
                if ( kind === 2858 ) {
                    if ( multisig ) return;
                    var bitpac = JSON.parse( content );
                    bitpac_name = bitpac[ 0 ];
                    multisig = bitpac[ 1 ];
                    var temp_multisig = [...multisig];
                    threshold = temp_multisig[ 0 ];
                    temp_multisig.splice( 0, 1 );
                    var script = [0];
                    temp_multisig.forEach( item => {
                        script.push( item, "OP_CHECKSIGADD" );
                    });
                    var pubkey = "ab".repeat( 32 );
                    script.push( threshold, "OP_EQUAL" );
                    var sbytes = tapscript.Script.encode( script );
                    var tapleaf = tapscript.Tap.tree.getLeaf( sbytes );
                    var [ tpubkey, cblock ] = tapscript.Tap.getPubKey(pubkey, { target: tapleaf });
                    var multisig_address = tapscript.Address.p2tr.fromPubKey( tpubkey, mempoolnet );
                    var url = "bitcoin:" + multisig_address;
                    var a = document.createElement( "a" );
                    a.href = url;
                    a.target = "_blank";
                    a.append( createQR( url ) );
                    var div = document.createElement( "div" );
                    div.append( a );
                    var div_html = div.innerHTML;
                    var html = `
                        <div class="menu" onclick='if ( window.innerWidth > 600 ) return; if ( this.getElementsByClassName( "menu_internal" )[ 0 ].style.display != "block" ) {this.getElementsByClassName( "menu_internal" )[ 0 ].style.display = "block"} else {this.getElementsByClassName( "menu_internal" )[ 0 ].style.display = "none"}'>
                            <div class="menu_items">
                                <div class="menu_internal">
                                    <div class="menu_members">Members</div>
                                    <div class="menu_balance">Treasury</div>
                                    <div class="menu_statements">Statements</div>
                                    <div class="menu_cprops">Current proposals [<span class="cprops">0</span>]</div>
                                    <div class="menu_pprops">Past proposals [<span class="pprops">0</span>]</div>
                                    <div class="menu_login_or_create">Login</div>
                                </div>
                            </div>
                        </div>
                        <div class="members">
                            <h2>Members</h2>
                            Bitpac name: ${bitpac_name}<br>
                            Policy: ${threshold} out of ${temp_multisig.length}
                        <div class="nostr_profiles">
                            <p class="loading_profiles">Loading<span class="dots">.</span></p>
                        </div>
                        </div>
                        <div class="balance">
                            <h2>Treasury</h2>
                            Balance (usd): <span class="bitpac_balance">loading<span class="dots">.</span></span><br>
                            Balance (sats): <span class="bitpac_balance_sats">loading<span class="dots">.</span></span><br>
                            <div class="qr_div">
                                ${div_html}
                                <div class="addy">${multisig_address}</div><br>
                            </div>
                        </div>
                        <div class="statements">
                            <h2>Statements</h2>
                            <p class="no_statements">Loading<span class="dots">.</span></p>
                        </div>
                        <div class="current_proposals">
                            <h2>Current proposals</h2>
                            <p class="none_currently">Loading<span class="dots">.</span></p>
                        </div>
                        <div class="past_proposals">
                            <h2>Past proposals</h2>
                            <p class="no_past_proposals">Loading<span class="dots">.</span></p>
                        </div>
                        <div class="crafter">
                            <h2>Craft a proposal</h2>
                            <p>Briefly name or describe your proposal</p>
                            <p><input class="proposal_desc"></p>
                            <p>Propose a statement (optional)</p>
                            <p><textarea class="statement"></textarea></p>
                            <p class="will_spend_parent" onclick='if ( $( ".spend_info" ).style.display != "block" ) {$( ".spend_info" ).style.display = "block";$( ".will_spend" ).checked = true;} else {$( ".spend_info" ).style.display = "none";$( ".will_spend" ).checked = false;}'>
                                <input type="checkbox" class="will_spend" name="will_spend">
                                <label for="will_spend">I want to spend some money</label>
                            </p>
                            <div class="spend_info">
                                <p>How do you want to spend the money?</p>
                                Balance (usd): <span class="bitpac_balance">loading<span class="dots">.</span></span><br>
                                Balance (sats): <span class="bitpac_balance_sats">loading<span class="dots">.</span></span>
                                <br><br>
                                <div class="add_outputs"></div>
                            </div>
                            <p><button class="craft_proposal">Submit</button></p>
                        </div>
                    `;
                    var div = document.createElement( "div" );
                    div.innerHTML = html;
                    $( '.loading' ).remove();
                    $( '.multisig_viewer' ).append( div );
                    $( '.menu_members' ).onclick = () => {
                        showPage( "members" );
                    }
                    $( '.menu_balance' ).onclick = () => {
                        showPage( "balance" );
                    }
                    $( '.menu_statements' ).onclick = () => {
                        if ( $( '.statements .proposal_div' ) ) $( '.no_statements' ).style.display = "none"; else $( '.no_statements' ).style.display = "block";
                        showPage( "statements" );
                    }
                    $( '.menu_cprops' ).onclick = () => {
                        if ( $( '.current_proposals .proposal_div' ) ) $( '.none_currently' ).style.display = "none"; else $( '.none_currently' ).style.display = "block";
                        showPage( "current_proposals" );
                    }
                    $( '.menu_pprops' ).onclick = () => {
                        if ( $( '.past_proposals .proposal_div' ) ) $( '.no_past_proposals' ).style.display = "none"; else $( '.no_past_proposals' ).style.display = "block";
                        showPage( "past_proposals" );
                    }
                    $( '.menu_login_or_create' ).onclick = () => {
                        if ( $( '.proposal_desc' ) ) {
                            $( '.proposal_desc' ).value = "";
                            $( '.statement' ).value = "";
                            $$( '.add_outputs .output_addy' ).forEach( item => {
                                item.value = "";
                            });
                            $$( '.add_outputs .output_amt' ).forEach( item => {
                                item.value = "";
                            });
                            $$( '.add_outputs .minus_button' ).forEach( (item, index) => {
                                if ( index != $$( '.add_outputs .minus_button' ).length - 1 ) {
                                    setTimeout( function() {
                                        item.click();
                                    }, index );
                                }
                            });
                            if ( $( '.will_spend' ).checked ) $( '.will_spend_parent' ).click();
                        }
                        showPage( "login_form" );
                    }
                    $( '.craft_proposal' ).onclick = spendCoins;
                    var i; for ( i=0; i<temp_multisig.length; i++ ) {
                        var item = temp_multisig[ i ];
                        var profile = document.createElement( "div" );
                        profile.className = `profile profile_${item}_${i}`;
                        profile.innerHTML = `
                            <div style="display: none; background-color: white; padding: 1rem; margin: 1rem 0.5rem; border-radius: 1rem; max-width: 10rem; text-align: center; border: 1px solid black;"><div style="width: 8rem; height: 8rem; background-size: cover; background-position: center center; margin-bottom: 1rem;" class="pic"><!--<img class="pic" style="width: 100%">--></div><div class="nym" style="color: black; word-wrap: break-word;"></div></div>
                        `;
                        $$( '.nostr_profiles' )[ 1 ].append( profile );
                    }
                    $$( '.profile' ).forEach( item => {
                        setTimeout( () => {
                            var innerText = item.firstElementChild.getElementsByClassName( "nym" )[ 0 ].innerText;
                            if ( !innerText || innerText === "undefined" ) {
                                item.firstElementChild.getElementsByClassName( "nym" )[ 0 ].innerText = "Profile not found";
                                $( '.loading_profiles' ).style.display = "none";
                                item.firstElementChild.style.display = "inline-block";
                            }
                        }, 3000 );
                    });
                    var i; for ( i=0; i<Object.keys( relays ).length; i++ ) {
                        var myrelay = Object.keys( relays )[ i ];
                        await waitForOneRelay( true );
                        if ( !relays[ myrelay ] || relays[ myrelay ].readyState != 1 ) continue;
                        var subId   = bytesToHex( nobleSecp256k1.utils.randomPrivateKey() ).toString( "hex" ).substring( 0, 24 );
                        var filter = { authors: temp_multisig, kinds: [ 0 ], limit: 1 }
                        var one_month_ago = Math.floor( Date.now() / 1000 ) - ( 60 * 60 * 24 * 30 );
                        var filter2 = { authors: temp_multisig, kinds: [ 2859 ], "#e": [ $_GET[ "multisig" ] ], since: one_month_ago }
                        var subscription = [ "REQ", subId, filter, filter2 ];
                        relays[ myrelay ].addEventListener( "message", handleMessage );
                        relays[ myrelay ].send( JSON.stringify( subscription ) );
                    }
                    $( '.none_currently' ).innerText = "None currently";
                    addOutput();
                }
                if ( kind === 2859 ) {
                    if ( known_proposals.includes( event.id ) ) return;
                    known_proposals.push( event.id );
                    await waitForBalanceToLoad();
                    $( '.no_statements' ).innerText = "None yet";
                    $( '.no_past_proposals' ).innerText = "None yet";
                    var proposal = JSON.parse( content );
                    var html = `
                        <p class="proposal_name" style="font-weight: bold;"></p>
                        <div class="proposal_statement"></div>
                    `;
                    var div = document.createElement( "div" );
                    div.innerHTML = html;
                    div.className = `proposal_div proposal_${event.id}`;
                    div.style = "border: 1px solid black; border-radius: 1rem; padding: 1rem;"
                    div.getElementsByClassName( "proposal_name" )[ 0 ].innerText = proposal[ 0 ];
                    if ( proposal[ 3 ] ) {
                        div.getElementsByClassName( "proposal_statement" )[ 0 ].innerText = proposal[ 3 ];
                    }
                    if ( !proposal[ 1 ].length && !proposal[ 3 ] ) return;
                    if ( proposal[ 1 ].length && proposal[ 2 ].length ) {
                        var from_amount = Number( $( '.bitpac_balance_sats' ).innerText );
                        //ensure the input(s) exist in our utxo set
                        //otherwise this proposal should go into past proposals
                        var input_utxos_are_ours = true;
                        var utxos = JSON.parse( sessionStorage[ "utxos" ] );
                        var stringified_utxos = [];
                        utxos.forEach( item => {
                            stringified_utxos.push( JSON.stringify( item ) );
                        });
                        proposal[ 1 ].every( item => {
                            var txid = item[ "txid" ];
                            var vout = item[ "vout" ];
                            var amt = item[ "prevout" ][ "value" ];
                            var stringified_input = JSON.stringify( [txid, vout, amt] );
                            if ( !stringified_utxos.includes( stringified_input ) ) {
                                input_utxos_are_ours = false;
                                return;
                            }
                            return true;
                        });
                        if ( !input_utxos_are_ours ) {
                            var proposal_should_go_in_past_proposals = true;
                            dont_broadcast.push( event.id );
                        }
                        $( '.none_currently' ).style.display = "none";
                        var has_change = tapscript.Address.fromScriptPubKey( proposal[ 2 ][ proposal[ 2 ].length - 1 ][ "scriptPubKey" ] ) == tapscript.Address.fromScriptPubKey( tapscript.Address.toScriptPubKey( $( '.addy' ).innerText ) ) ? true : false;
                        if ( has_change ) {
                            var change_amount = proposal[ 2 ][ proposal[ 2 ].length - 1 ][ "value" ];
                        } else {
                            var change_amount = 0;
                        }
                        var to_amount = 0;
                        proposal[ 2 ].forEach( ( item, index ) => {
                            if ( has_change && index == proposal[ 2 ].length - 1 ) return;
                            to_amount = to_amount + item.value;
                            var div2 = document.createElement( "div" );
                            div2.innerHTML = `
                                <p><input class="output_addy proposed_output" disabled><input class="output_amt proposed_amt" disabled></p>
                            `;
                            div2.getElementsByClassName( "output_addy" )[ 0 ].value = tapscript.Address.fromScriptPubKey( item.scriptPubKey, mempoolnet );
                            div2.getElementsByClassName( "output_amt" )[ 0 ].value = item.value + " sats";
                            div.append( div2 );
                        });
                        try {
                            var txdata = tapscript.Tx.create({
                              vin  : proposal[ 1 ],
                              vout : proposal[ 2 ]
                            });
                            var txid = tapscript.Tx.util.getTxid( txdata );
                            var tx_exists = await checkIfTxHappened( txid );
                            if ( tx_exists ) var proposal_should_go_in_past_proposals = true;
                        } catch( e ) {}
                        var fee_amount = from_amount - ( to_amount + change_amount );
                        if ( fee_amount < 1 && !proposal_should_go_in_past_proposals ) {
                            var number_of_visible_proposals = 0;
                            $$( '.current_proposals .proposal_div' ).forEach( item => {
                                if ( item.style.display != "none" ) number_of_visible_proposals = number_of_visible_proposals + 1;
                            });
                            if ( !number_of_visible_proposals ) $( '.none_currently' ).style.display = "block";
                            return;
                        }
                        var fee = document.createElement( "div" );
                        fee.className = "fee_parent";
                        fee.innerHTML = `<p>Mining fee: ${fee_amount} sats</p>`;
                        //check for low fees and warn if too low
                        var size_of_each_input = 0;
                        var temp_multisig = [...multisig];
                        threshold = temp_multisig[ 0 ];
                        temp_multisig.splice( 0, 1 );
                        var i; for ( i=0; i<temp_multisig.length; i++ ) {
                            size_of_each_input = size_of_each_input + ( 64 + 32 + 8 );
                        }
                        var txsize = 0;
                        var i; for ( i=0; i<proposal[ 1 ].length; i++ ) {
                            txsize = txsize + size_of_each_input;
                        }
                        var i; for ( i=0; i<proposal[ 2 ].length; i++ ) {
                            //I calculate that outputs add 30 bytes apiece by
                            //assuming the average scriptpubkey is 26 bytes
                            //and assuming amounts are denoted in 4 bytes
                            txsize = txsize + 30;
                        }
                        var fee_options = await getThreeFeeRates( mempoolNetwork );
                        var min_fee = fee_options[ 0 ];
                        min_fee = ( Number( min_fee ) * txsize ) - 30;
                        //I subtracted 30 because the parent transaction often-but-not-always
                        //adds an additional change output after calculating the feerate, so
                        //that makes it too-frequently trigger the fee warning -- also, I am
                        //overestimating fees anyway due to not understanding how the witness
                        //discount works so this should be safe
                        if ( fee_amount < min_fee ) fee.innerHTML += `<p class="fee_warning">Warning, this is a low fee, likely to be rejected by miners. The estimated size of this transaction is ${txsize} bytes and the lowest feerate that most mempools accept right now is ${fee_options[ 0 ]} sat per byte. That means your tx should pay at least ${min_fee} sats as a fee. Be careful what you sign.</p>`;
                        div.append( fee );
                    }
                    var buttons = document.createElement( "div" );
                    buttons.className = "approve_or_deny";
                    buttons.innerHTML = `<p><button class="approve approve_${event.id}">Approve</button> <button class="deny deny_${event.id}">Deny</button></p>`;
                    div.append( buttons );
                    var inputs_and_outputs = document.createElement( "div" );
                    inputs_and_outputs.style = "display: none;";
                    inputs_and_outputs.innerHTML = `
                        <div class="inputs"></div>
                        <div class="outputs"></div>
                    `;
                    inputs_and_outputs.getElementsByClassName( "inputs" )[ 0 ].innerText = JSON.stringify( proposal[ 1 ] );
                    inputs_and_outputs.getElementsByClassName( "outputs" )[ 0 ].innerText = JSON.stringify( proposal[ 2 ] );
                    div.append( inputs_and_outputs );
                    div.getElementsByClassName( "deny" )[ 0 ].onclick = async () => {
                        var seckey = sessionStorage[ "myprivkey" ];
                        var pubKey = nobleSecp256k1.getPublicKey( seckey, true ).substring( 2 );
                        var reply = {
                            "content"    : "",
                            "created_at" : Math.floor( Date.now() / 1000 ),
                            "kind"       : 2860,
                            "tags"       : [ [ "e", event.id ] ],
                            "pubkey"     : pubKey,
                        }
                        var signedEvent = await getSignedEvent(reply, seckey);
                        var i; for ( i=0; i<Object.keys( relays ).length; i++ ) {
                            var myrelay = Object.keys( relays )[ i ];
                            if ( !relays[ myrelay ] || relays[ myrelay ].readyState != 1 ) continue;
                            relays[ myrelay ].addEventListener( "message", handleMessage );
                            relays[ myrelay ].send(JSON.stringify([ "EVENT", signedEvent ]));
                            await waitSomeSeconds( 2 );
                            relays[ myrelay ].close();
                        }
                        console.log( "denied!" );
                        // window.location.reload();
                    }
                    div.getElementsByClassName( "approve" )[ 0 ].onclick = async () => {
                        var inputs = proposal[ 1 ];
                        var outputs = proposal[ 2 ];
                        var seckey = sessionStorage[ "myprivkey" ];
                        var pubKey = nobleSecp256k1.getPublicKey( seckey, true ).substring( 2 );
                        if ( inputs.length && outputs.length ) {
                            var txdata = tapscript.Tx.create({
                              vin  : inputs,
                              vout : outputs
                            });
                            var temp_multisig = [...multisig];
                            var threshold = temp_multisig[ 0 ];
                            temp_multisig.splice( 0, 1 );
                            var script = [0];
                            temp_multisig.forEach( item => {
                                script.push( item, "OP_CHECKSIGADD" );
                            });
                            var pubkey = "ab".repeat( 32 );
                            script.push( threshold, "OP_EQUAL" );
                            var sbytes = tapscript.Script.encode( script );
                            var tapleaf = tapscript.Tap.tree.getLeaf( sbytes );
                            var [ tpubkey, cblock ] = tapscript.Tap.getPubKey(pubkey, { target: tapleaf });
                            var all_sigs = [];
                            var i; for ( i=0; i<inputs.length; i++ ) {
                                var sig = tapscript.Signer.taproot.sign(seckey, txdata, i, { extension: tapleaf });
                                all_sigs.push( sig.hex );
                            }
                        } else {
                            var all_sigs = 1;
                        }
                        var reply = {
                            "content"    : JSON.stringify( all_sigs ),
                            "created_at" : Math.floor( Date.now() / 1000 ),
                            "kind"       : 2860,
                            "tags"       : [ [ "e", event.id ] ],
                            "pubkey"     : pubKey,
                        }
                        var signedEvent = await getSignedEvent(reply, seckey);
                        var i; for ( i=0; i<Object.keys( relays ).length; i++ ) {
                            var myrelay = Object.keys( relays )[ i ];
                            if ( !relays[ myrelay ] || relays[ myrelay ].readyState != 1 ) continue;
                            relays[ myrelay ].addEventListener( "message", handleMessage );
                            relays[ myrelay ].send(JSON.stringify([ "EVENT", signedEvent ]));
                        }
                        console.log( "approved!" );
                        // window.location.reload();
                    }
                    var sigs_obtained = document.createElement( "div" );
                    sigs_obtained.className = "computed_proposal_info";
                    sigs_obtained.innerHTML = `
                        Approvals: <span class="sigs_obtained">0</span><br>
                        Denials: <span class="denys_obtained">0</span><br>
                        Approvals needed to pass: ${threshold}<br>
                        <div class="denials_needed">Denials needed to fail: ${( $$( '.profile' ).length - threshold ) + 1}<br></div>
                        <div class="num_of_respondents">Number of respondents so far: <span class="respondents_num">0</span> out of ${$$( '.profile' ).length}</div>
                    `;
                    div.append( sigs_obtained );
                    if ( !proposal_should_go_in_past_proposals ) {
                        $( '.current_proposals' ).append( div );
                    } else {
                        $( '.no_past_proposals' ).style.display = "none";
                        div.getElementsByClassName( "approve_or_deny" )[ 0 ].style.display = "none";
                        if ( div.getElementsByClassName( "fee_parent" )[ 0 ] ) div.getElementsByClassName( "fee_parent" )[ 0 ].innerHTML = ``;
                        $( '.past_proposals' ).append( div );
                    }
                    if ( sessionStorage[ "myprivkey" ] ) {
                        $$( '.current_proposals .approve_or_deny' ).forEach( item => {
                            item.style.display = "block";
                        });
                        $$( '.current_proposals .fee_warning' ).forEach( item => {
                            item.style.display = "block";
                        });
                    }
                    $( '.cprops' ).innerText = $$( `.current_proposals .proposal_div` ).length;
                    $( '.pprops' ).innerText = $$( `.past_proposals .proposal_div` ).length;
                    var i; for ( i=0; i<Object.keys( relays ).length; i++ ) {
                        var myrelay = Object.keys( relays )[ i ];
                        if ( !relays[ myrelay ] || relays[ myrelay ].readyState != 1 ) continue;
                        var subId   = bytesToHex( nobleSecp256k1.utils.randomPrivateKey() ).toString( "hex" ).substring( 0, 24 );
                        var filter = { authors: temp_multisig, kinds: [ 2860 ], "#e": [ event.id ] }
                        var subscription = [ "REQ", subId, filter ];
                        relays[ myrelay ].addEventListener( "message", handleMessage );
                        relays[ myrelay ].send( JSON.stringify( subscription ) );
                    }
                }
                if ( kind === 2860 ) {
                    var temp_multisig = [...multisig];
                    threshold = temp_multisig[ 0 ];
                    temp_multisig.splice( 0, 1 );
                    var proposal = event.tags[ 0 ][ 1 ];
                    if ( !content ) {
                        if ( proposal in denys && Object.keys( denys[ proposal ] ).length > ( $$( '.profile' ).length - threshold ) + 1 ) return;
                        if ( !( proposal in denys ) ) denys[ proposal ] = {};
                        var deny_exists_already = false;
                        Object.keys( denys[ proposal ] ).every( item => {
                            if ( item == event.pubkey ) {
                                deny_exists_already = true;
                                return;
                            }
                            return true;
                        });
                        if ( deny_exists_already ) return;
                        denys[ proposal ][ event.pubkey ] = 1;
                        if ( event.pubkey == sessionStorage[ "mypubkey" ] ) {
                            $( `.proposal_${proposal} .approve` ).disabled = true;
                            $( `.proposal_${proposal} .deny` ).disabled = true;
                        }
                        $( `.proposal_${proposal} .denys_obtained` ).innerText = Number( $( `.proposal_${proposal} .denys_obtained` ).innerText ) + 1;
                        $( `.proposal_${proposal} .respondents_num` ).innerText = Number( $( `.proposal_${proposal} .respondents_num` ).innerText ) + 1;
                        if ( Number( $( `.proposal_${proposal} .denys_obtained` ).innerText ) < ( ( $$( '.profile' ).length - threshold ) + 1 ) ) return;
                        //make rejected proposals disappear
                        $( '.no_past_proposals' ).style.display = "none";
                        $( `.proposal_${proposal} .approve_or_deny` ).style.display = "none";
                        if ( $( `.proposal_${proposal} .fee_parent` ) ) $( `.proposal_${proposal} .fee_parent` ).innerHTML = ``;
                        $( '.past_proposals' ).append( $( `.proposal_${proposal}` ) );
                        $( '.pprops' ).innerText = $$( `.past_proposals .proposal_div` ).length;
                        $( '.cprops' ).innerText = $$( `.current_proposals .proposal_div` ).length;
                        var number_of_visible_proposals = 0;
                        $$( '.current_proposals .proposal_div' ).forEach( item => {
                            if ( item.style.display != "none" ) number_of_visible_proposals = number_of_visible_proposals + 1;
                        });
                        if ( !number_of_visible_proposals ) {
                            $( '.cprops' ).innerText = 0;
                            $( '.none_currently' ).style.display = "block";
                        }
                    } else {
                        if ( proposal in sigs && Object.keys( sigs[ proposal ] ).length >= threshold ) return;
                        if ( !( proposal in sigs ) ) sigs[ proposal ] = {};
                        if ( event.pubkey == sessionStorage[ "mypubkey" ] ) {
                            $( `.proposal_${proposal} .deny` ).disabled = true;
                            $( `.proposal_${proposal} .approve` ).disabled = true;
                        }
                        if ( !all_sigs ) var all_sigs = [];
                        JSON.parse( content ).forEach( item => {
                            all_sigs.push( item );
                        });
                        //todo: fix the issue whereby these lines sometimes result in
                        //a proposal seeming to be approved multiple times by the same
                        //person
                        var sigs_exist_already = false;
                        Object.keys( sigs[ proposal ] ).every( item => {
                            if ( item == event.pubkey ) {
                                sigs_exist_already = true;
                                return;
                            }
                            return true;
                        });
                        if ( sigs_exist_already ) return;
                        if ( content != "1" ) {
                            //validate each signature
                            //but to do that I need the txdata and tapleaf
                            //because those give me the scripthash
                            //and to get the tapleaf I need the script
                            var script = [0];
                            temp_multisig.forEach( item => {
                                script.push( item, "OP_CHECKSIGADD" );
                            });
                            var pubkey = "ab".repeat( 32 );
                            script.push( threshold, "OP_EQUAL" );
                            var sbytes = tapscript.Script.encode( script );
                            var tapleaf = tapscript.Tap.tree.getLeaf( sbytes );
                            var [ tpubkey, cblock ] = tapscript.Tap.getPubKey(pubkey, { target: tapleaf });
                            var inputs = JSON.parse( $( `.proposal_${proposal} .inputs` ).innerText );
                            var outputs = JSON.parse( $( `.proposal_${proposal} .outputs` ).innerText );
                            //now I have the script and tapleaf but I still need the txdata
                            var txdata = tapscript.Tx.create({
                              vin  : inputs,
                              vout : outputs
                            });
                            //now I can validate each signature
                            var all_sigs_are_valid = true;
                            var i; for ( i=0; i<inputs.length; i++ ) {
                                var sighash = tapscript.Signer.taproot.hash( txdata, i, { extension: tapleaf } );
                                try {
                                    var is_valid = await nobleSecp256k1.schnorr.verify( all_sigs[ i ], bytesToHex( sighash ), event.pubkey );
                                } catch ( e ) {
                                    var is_valid = false;
                                }
                                if ( !is_valid ) all_sigs_are_valid = false;
                            }
                            if ( !all_sigs_are_valid ) return;
                        }
                        if ( proposal in sigs && event.pubkey in sigs[ proposal ] && sigs[ proposal ][ event.pubkey ].length ) return;
                        sigs[ proposal ][ event.pubkey ] = all_sigs;
                        $( `.proposal_${proposal} .sigs_obtained` ).innerText = Number( $( `.proposal_${proposal} .sigs_obtained` ).innerText ) + 1;
                        $( `.proposal_${proposal} .respondents_num` ).innerText = Number( $( `.proposal_${proposal} .respondents_num` ).innerText ) + 1;
                        if ( Object.keys( sigs[ proposal ] ).length != threshold ) return;
                        var i; for ( i=0; i<JSON.parse( content ).length; i++ ) {
                            //put sigs in reverse order of multisig keys
                            var sigs_array = [];
                            temp_multisig.reverse();
                            temp_multisig.forEach( item => {
                                if ( Object.keys( sigs[ proposal ] ).includes( item ) ) {
                                    sigs_array.push( sigs[ proposal ][ item ][ i ] );
                                } else {
                                    sigs_array.push( "" );
                                }
                            });
                            var sig_counter = 0;
                            sigs_array.forEach( (item, index) => {
                                if ( sig_counter == threshold ) sigs_array[ index ] = "";
                                if ( sigs_array[ index ] ) {
                                    sig_counter = sig_counter + 1;
                                }
                            });
                            temp_multisig.reverse();
                            if ( txdata ) txdata.vin[ i ].witness = [ ...sigs_array, script, cblock ];
                        }
                        if ( txdata && !dont_broadcast.includes( proposal ) ) {
                            var txid = await pushBTCpmt( tapscript.Tx.encode( txdata ).hex, mempoolNetwork );
                            sessionStorage[ "loop_num" ] = "2";
                        } else if ( txdata ) {
                            //I am disabling this else statement because I don't think I need it anymore
                            //but I am not sure so I am keeping it aroud just in case
                            //it used to rebroadcast transactions that should have been broadcast but
                            //were accidentally not broadcasted -- but I do not think that is necessary
                            //now because of the new way I put things into the dont_broadcast category,
                            //which I now only do if the transaction's inputs don't exist
                            // var txid = tapscript.Tx.util.getTxid( txdata );
                            // var tx_exists = await checkIfTxHappened( txid );
                            // if ( !tx_exists ) {
                            //     var rand = Math.floor( Math.random() * 3000 );
                            //     setTimeout( function() {
                            //         pushBTCpmt( tapscript.Tx.encode( txdata ).hex, mempoolNetwork );
                            //     }, Number( rand ) + 1000 );
                            // }
                        }
                        var it_was_only_a_statement = true;
                        Object.keys( sigs[ proposal ] ).forEach( item => {
                            if ( sigs[ proposal ][ item ] != 1 ) it_was_only_a_statement = false;
                        });
                        $( `.proposal_${proposal} .approve_or_deny` ).style.display = "none";
                        if ( it_was_only_a_statement ) {
                            $( '.no_statements' ).style.display = "none";
                            $( '.statements' ).append( $( `.proposal_${proposal}` ) );
                            var second_statement = $( `.proposal_${proposal}` ).cloneNode( true );
                            $( '.no_past_proposals' ).style.display = "none";
                            if ( $( `.proposal_${proposal} .fee_parent` ) ) $( `.proposal_${proposal} .fee_parent` ).innerHTML = ``;
                            $( '.past_proposals' ).append( second_statement );
                        } else {
                            $( '.no_past_proposals' ).style.display = "none";
                            if ( $( `.proposal_${proposal} .fee_parent` ) ) $( `.proposal_${proposal} .fee_parent` ).innerHTML = ``;
                            $( '.past_proposals' ).append( $( `.proposal_${proposal}` ) );
                            if ( txdata ) {
                                try {
                                    var tx = tapscript.Tx.decode( tapscript.Tx.encode( txdata ).hex );
                                    var txid = tapscript.Tx.util.getTxid( tx );
                                } catch ( e ) {
                                    console.log( "error 0:", txdata );
                                    var tx = tapscript.Tx.decode( tapscript.Tx.encode( txdata ).hex );
                                    console.log( "error 1:", tx );
                                    var txid = tapscript.Tx.util.getTxid( tx );
                                    console.log( "error 2:", txid );
                                }
                            }
                            if ( txdata && $( `.proposal_${proposal} .fee_parent` ) ) $( `.proposal_${proposal} .fee_parent` ).innerHTML = `<p><a href="https://mempool.space/${mempoolNetwork}tx/${txid}" target="_blank" data-txhex="${tapscript.Tx.encode( txdata ).hex}" onclick='pushBTCpmt( this.getAttribute( "data-txhex" ), "${mempoolNetwork}" )'>View this transaction</a></p>`;
                        }
                        $( '.pprops' ).innerText = $$( `.past_proposals .proposal_div` ).length;
                        $( '.cprops' ).innerText = $$( `.current_proposals .proposal_div` ).length;
                        var number_of_visible_proposals = 0;
                        $$( '.current_proposals .proposal_div' ).forEach( item => {
                            if ( item.style.display != "none" ) number_of_visible_proposals = number_of_visible_proposals + 1;
                        });
                        if ( !number_of_visible_proposals ) {
                            $( '.cprops' ).innerText = 0;
                            $( '.none_currently' ).style.display = "block";
                        }
                        if ( txdata && !dont_broadcast.includes( proposal ) ) showModal( `The transaction was approved! You can view it here: https://mempool.space/${mempoolNetwork}tx/${txid}` );
                    }
                }
            }
            function waitSomeSeconds(num) {
                var num = num.toString() + "000";
                num = Number(num);
                return new Promise(resolve => setTimeout(resolve, num));
            }
            function prepend(value, array) {
              var newArray = array.slice();
              newArray.unshift(value);
              return newArray;
            }
            async function getSignedEvent(event, privateKey) {
                var eventData = JSON.stringify([
                    0,                  // Reserved for future use
                    event['pubkey'],        // The sender's public key
                    event['created_at'],    // Unix timestamp
                    event['kind'],      // Message “kind” or type
                    event['tags'],      // Tags identify replies/recipients
                    event['content']        // Your note contents
                ])
                event.id  = sha256( eventData ).toString( 'hex' );
                event.sig = await schnorr.sign( event.id, privateKey );
                return event;
            }
            var spendCoins = async () => {
                var inputs = [];
                var outputs = [];
                if ( $( '.will_spend' ).checked ) {
                    var temp_multisig = [...multisig];
                    var threshold = temp_multisig[ 0 ];
                    temp_multisig.splice( 0, 1 );
                    var script = [0];
                    temp_multisig.forEach( item => {
                        script.push( item, "OP_CHECKSIGADD" );
                    });
                    var pubkey = "ab".repeat( 32 );
                    script.push( threshold, "OP_EQUAL" );
                    var sbytes = tapscript.Script.encode( script );
                    var tapleaf = tapscript.Tap.tree.getLeaf( sbytes );
                    var [ tpubkey, cblock ] = tapscript.Tap.getPubKey(pubkey, { target: tapleaf });
                    var utxos = JSON.parse( sessionStorage[ "utxos" ] );
                    var from_amount = 0;
                    utxos.forEach( utxo => {
                        from_amount = from_amount + utxo[ 2 ];
                        var txid = utxo[ 0 ];
                        var vout = utxo[ 1 ];
                        var amt = utxo[ 2 ];
                        inputs.push({
                            txid: txid,
                            vout: vout,
                            prevout: {
                                value: amt,
                                scriptPubKey: [ 'OP_1', tpubkey ]
                            },
                        });
                    });
                    if ( !from_amount ) {
                        showModal( "You cannot spend without money. Please make a deposit, then try again." );
                        return;
                    }
                    var to_amount = 0;
                    var there_be_dust = false;
                    $$( '.add_outputs .output_addy' ).forEach( (item, index) => {
                        outputs.push({
                            value: Number( $$( '.add_outputs .output_amt' )[ index ].value ),
                            scriptPubKey: tapscript.Address.toScriptPubKey( item.value )
                        });
                        to_amount = to_amount + Number( $$( '.add_outputs .output_amt' )[ index ].value );
                        if ( Number( $$( '.add_outputs .output_amt' )[ index ].value ) < 546 ) there_be_dust = true;
                    });
                    if ( there_be_dust ) {
                        showModal( "You cannot send less than 546 sats because that is bitcoin's dust limit. Please try again" );
                        return;
                    }
                    if ( from_amount - to_amount < 1 ) {
                        showModal( "You must leave enough to pay a mining fee, please try again" );
                        return;
                    }
                    console.log( "from amount:", from_amount, "to amount:", to_amount );
                    var size_of_each_input = 0;
                    var i; for ( i=0; i<temp_multisig.length; i++ ) {
                        size_of_each_input = size_of_each_input + ( 64 + 32 + 8 );
                    }
                    var txsize = 0;
                    var i; for ( i=0; i<inputs.length; i++ ) {
                        txsize = txsize + size_of_each_input;
                    }
                    var i; for ( i=0; i<outputs.length; i++ ) {
                        //I calculate that outputs add 30 bytes apiece by
                        //assuming the average scriptpubkey is 26 bytes
                        //and assuming amounts are denoted in 4 bytes
                        txsize = txsize + 30;
                    }
                    var fee_options = await getThreeFeeRates( mempoolNetwork );
                    var sats_per_byte = prompt( `Please enter a fee rate as a number. Specifically, the number of sats per byte you want to pay. The minimum rate is ${fee_options[ 0 ]}, the average rate is ${fee_options[ 1 ]}, and the urgent rate is ${fee_options[ 2 ]}.` );
                    sats_per_byte = Number( sats_per_byte );
                    if ( !sats_per_byte ) {
                        showModal( "You entered an invalid fee rate. You must enter a number greater than 0, such as 5, 10, or 25. Please try again." );
                        return;
                    }
                    var mining_fee = txsize * sats_per_byte;
                    if ( mining_fee < 172 ) mining_fee = 172;
                    if ( from_amount - to_amount < mining_fee ) {
                        showModal( `With your chosen fee rate you must leave at least ${mining_fee} sats to pay for mining fees, which means the max you can spend is ${from_amount - mining_fee} sats. Please try again` );
                        return;
                    }
                    if ( from_amount - ( to_amount + mining_fee ) >= 546 ) {
                        outputs.push({
                            value: from_amount - ( to_amount + mining_fee ),
                            scriptPubKey: tapscript.Address.toScriptPubKey( $( '.addy' ).innerText )
                        });
                    }
                }
                var seckey = sessionStorage[ "myprivkey" ];
                var pubKey = nobleSecp256k1.getPublicKey( seckey, true ).substring( 2 );
                var proposal = [$( '.proposal_desc' ).value, inputs, outputs];
                if ( $( '.statement' ).value ) proposal.push( $( '.statement' ).value );
                proposal = JSON.stringify( proposal );
                var event = {
                    "content"    : proposal,
                    "created_at" : Math.floor( Date.now() / 1000 ),
                    "kind"       : 2859,
                    "tags"       : [ [ "e", $_GET[ "multisig" ] ] ],
                    "pubkey"     : pubKey,
                }
                var signedEvent = await getSignedEvent(event, seckey);
                var i; for ( i=0; i<Object.keys( relays ).length; i++ ) {
                    var myrelay = Object.keys( relays )[ i ];
                    if ( !relays[ myrelay ] || relays[ myrelay ].readyState != 1 ) continue;
                    relays[ myrelay ].addEventListener( "message", handleMessage );
                    relays[ myrelay ].send(JSON.stringify([ "EVENT", signedEvent ]));
                }
                setTimeout( function() {$( '.menu_cprops' ).click();}, 1500 );
            }
            function addOutput( element ) {
                if ( element ) {
                    element.previousElementSibling.style.display = "inline-block";
                }
                if ( $( '.output_plus_button' ) ) {
                    $( '.output_plus_button' ).remove();
                }
                var output_addy = document.createElement( "input" );
                output_addy.type = "text";
                output_addy.className = "output_addy";
                output_addy.placeholder = "address";
                var output_amt = document.createElement( "input" );
                output_amt.type = "number";
                output_amt.className = "output_amt";
                output_amt.placeholder = "amount (in sats)";
                $( '.add_outputs' ).append( output_addy );
                $( '.add_outputs' ).append( output_amt );
                var minus = document.createElement( "div" );
                minus.className = "minus_button";
                minus.innerText = "-";
                minus.onclick = function() {this.previousElementSibling.remove();this.previousElementSibling.remove();this.remove();}
                $( '.add_outputs' ).append( minus );
                var plus = document.createElement( "div" );
                plus.className = "output_plus_button";
                plus.innerText = "+";
                plus.onclick = function() {addOutput( this );}
                $( '.add_outputs' ).append( plus );
            }
            async function getBitcoinPriceFromCoinbase() {
                    var data = await getData( "https://api.coinbase.com/v2/prices/BTC-USD/spot" );
                    if ( data == "error" ) return 0;
                    var json = JSON.parse( data );
                    var price = json[ "data" ][ "amount" ];
                    return price;
            }
            async function getBitcoinPriceFromKraken() {
                    var data = await getData( "https://api.kraken.com/0/public/Ticker?pair=XBTUSD" );
                    if ( data == "error" ) return 0;
                    var json = JSON.parse( data );
                    var price = json[ "result" ][ "XXBTZUSD" ][ "a" ][ 0 ];
                    return price;
            }
            async function getBitcoinPriceFromCoindesk() {
                    var data = await getData( "https://api.coindesk.com/v1/bpi/currentprice.json" );
                    if ( data == "error" ) return 0;
                    var json = JSON.parse( data );
                    var price = json[ "bpi" ][ "USD" ][ "rate_float" ];
                    return price;
            }
            async function getBitcoinPriceFromGemini() {
                    var data = await getData( "https://api.gemini.com/v2/ticker/BTCUSD" );
                    if ( data == "error" ) return 0;
                    var json = JSON.parse( data );
                    var price = json[ "bid" ];
                    return price;
            }
            async function getBitcoinPriceFromCoinGecko() {
                    var data = await getData( "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&precision=2" );
                    if ( data == "error" ) return 0;
                    var json = JSON.parse( data );
                    var price = json[ "bitcoin" ][ "usd" ];
                    return price;
            }
            async function getBitcoinPrice() {
                var prices = [];
                var cbprice = await getBitcoinPriceFromCoinbase();
                var kprice = await getBitcoinPriceFromKraken();
                var cdprice = await getBitcoinPriceFromCoindesk();
                var gprice = await getBitcoinPriceFromGemini();
                var cgprice = await getBitcoinPriceFromCoinGecko();
                prices.push( Number( cbprice ), Number( kprice ), Number( cdprice ), Number( gprice ), Number( cgprice ) );
                prices.sort();
                sessionStorage[ "btc_price" ] = prices[ 2 ];
                return prices[ 2 ];
            }
            async function satsToDollars( sats ) {
                if ( sats >= 100000000 ) sats = sats * 10;
                if ( !sessionStorage[ "btc_price" ] ) await getBitcoinPrice();
                var bitcoin_price = Number( sessionStorage[ "btc_price" ] );
                var value_in_dollars = Number( String( sats ).padStart( 8, "0" ).slice( 0,-9 ) + "." + String( sats ).padStart( 8, "0" ).slice( -9 ) ) * bitcoin_price;
                return value_in_dollars;
            }
            function getData( url ) {
                return new Promise( async function( resolve, reject ) {
                    function inner_get( url ) {
                        var xhttp = new XMLHttpRequest();
                        xhttp.open( "GET", url, true );
                        xhttp.send();
                        return xhttp;
                    }
                    var data = inner_get( url );
                    data.onerror = function( e ) {
                        resolve( "error" );
                    }
                    async function isResponseReady() {
                        return new Promise( function( resolve2, reject ) {
                            if ( !data.responseText || data.readyState != 4 ) {
                                setTimeout( async function() {
                                    var msg = await isResponseReady();
                                    resolve2( msg );
                                }, 1 );
                            } else {
                                resolve2( data.responseText );
                            }
                        });
                    }
                    var returnable = await isResponseReady();
                    resolve( returnable );
                });
            }
            function getUTXOs( address, network ) {
                return new Promise( function( resolve, reject ) {
                    var xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function() {
                        if ( this.readyState == 4 && this.status == 200 ) {
                            var esplorautxos = JSON.parse( xhttp.responseText );
                            var utxos = [];
                            esplorautxos.forEach( function( item, index ) {
                                var utxo = [];
                                utxo.push( item[ "txid" ] );
                                utxo.push( item[ "vout" ] );
                                utxo.push( item[ "value" ] );
                                utxos.push( utxo );
                            });
                            resolve( utxos );
                        }
                    }
                    xhttp.open( "GET", `https://mempool.space/${network}api/address/` + address + "/utxo", true );
                    xhttp.send();
                });
            }
            async function getThreeFeeRates( network ) {
                var fees = await getData("https://mempool.space/" + network + "api/v1/fees/recommended");
                fees = JSON.parse(fees);
                var array = [ fees["minimumFee"], fees["hourFee"], fees["fastestFee"] ];
                return array;
            }
            function dotLoop(string) {
                if (!$('.dots')) {
                    setTimeout(function () {
                        dotLoop(string);
                    }, 1000);
                    return;
                }
                if (string.length < 3) {
                    string = string + ".";
                } else {
                    string = ".";
                }
                $$('.dots').forEach( item => {
                    item.innerText = string;
                });
                setTimeout(function () {
                    dotLoop(string);
                }, 1000);
            }
            async function pushBTCpmt( rawtx, network ) {
                var txid = await postData( "https://mempool.space/" + network + "api/tx", rawtx );
                return txid;
            }
            async function postData( url, json, content_type = "", apikey = "" ) {
                var rtext = "";
                function inner_post( url, json, content_type = "", apikey = "" ) {
                    var xhttp = new XMLHttpRequest();
                    xhttp.open( "POST", url, true );
                    if ( content_type ) {
                        xhttp.setRequestHeader( `Content-Type`, content_type );
                    }
                    if ( apikey ) {
                        xhttp.setRequestHeader( `X-Api-Key`, apikey );
                    }
                    xhttp.send( json );
                    return xhttp;
                }
                var data = inner_post( url, json, content_type, apikey );
                data.onerror = function( e ) {
                    rtext = "error";
                }
                async function isResponseReady() {
                    return new Promise( function( resolve, reject ) {
                        if ( rtext == "error" ) {
                            resolve( rtext );
                        }
                        if ( !data.responseText || data.readyState != 4 ) {
                            setTimeout( async function() {
                                var msg = await isResponseReady();
                                resolve( msg );
                            }, 50 );
                        } else {
                            resolve( data.responseText );
                        }
                    });
                }
                var returnable = await isResponseReady();
                return returnable;
            }
            function createQR( content ) {
                var dataUriPngImage = document.createElement( "img" ),
                s = QRCode.generatePNG( content, {
                    ecclevel: "M",
                    format: "html",
                    fillcolor: "#FFFFFF",
                    textcolor: "#000000",
                    margin: 4,
                    modulesize: 8,
                });
                dataUriPngImage.src = s;
                dataUriPngImage.className = "qr_code";
                return dataUriPngImage;
            }
            var showPage = ( page ) => {
                if ( page == "login_form" && !sessionStorage.myprivkey ) {
                    login_fn();
                    return;
                }
                $( '.members' ).style.display = "none";
                $( '.balance' ).style.display = "none";
                $( '.statements' ).style.display = "none";
                $( '.current_proposals' ).style.display = "none";
                $( '.past_proposals' ).style.display = "none";
                $( '.crafter' ).style.display = "none";
                if ( sessionStorage.myprivkey && page == "login_form" ) page = "crafter";
                $( `.${page}` ).style.display = "block";
            }
            var login_fn = () => {
                var nsec = prompt( "Enter your nsec" );
                if ( !nsec ) return;
                var myprivkey = privkeyFromNsec( nsec );
                var mypubkey = nobleSecp256k1.getPublicKey( myprivkey, true ).substring( 2 );
                if ( !multisig.includes( mypubkey ) ) {
                    showModal( "Sorry, it looks like you are not a keyholder in this bitpac" );
                    return;
                }
                sessionStorage[ "myprivkey" ] = myprivkey;
                sessionStorage[ "mypubkey" ] = mypubkey;
                $( '.menu_login_or_create' ).innerText = "Craft proposal";
                $$( '.current_proposals .approve_or_deny' ).forEach( item => {
                    item.style.display = "block";
                });
                $$( '.current_proposals .fee_warning' ).forEach( item => {
                    item.style.display = "block";
                });
                Object.keys( sigs ).forEach( item => {
                    Object.keys( sigs[ item ] ).forEach( item2 => {
                        if ( item2 == sessionStorage[ "mypubkey" ] ) {
                            $( `.proposal_${item} .approve` ).disabled = true;
                            $( `.proposal_${item} .deny` ).disabled = true;
                        }
                    });
                });
                Object.keys( denys ).forEach( item => {
                    Object.keys( denys[ item ] ).forEach( item2 => {
                        if ( item2 == sessionStorage[ "mypubkey" ] ) {
                            $( `.proposal_${item} .approve` ).disabled = true;
                            $( `.proposal_${item} .deny` ).disabled = true;
                        }
                    });
                });
            }
            function modalVanish() {
                $( ".black-bg" ).style.display = "none";
                $( ".modal" ).style.display = "none";
            }
            function showModal( content ) {
                $( ".modal" ).innerHTML = `<div style="position: absolute;right: 1rem;top: 0.5rem;font-size: 2rem; cursor: pointer; color: black;" onclick="modalVanish()">&times;</div>`;
                $( ".modal" ).innerHTML += `<div style="overflow-y: scroll; max-height: 80vh; margin-top: 1.5rem;">${content}</div>`;
                $( ".black-bg" ).style.display = "block";
                $( ".modal" ).style.display = "block";
            }
            var fixReadyState = async relay => {
                if ( bad_relays[ relay ] > 9 ) {
                    delete relays[ relay ];
                    setTimeout( function() {
                        relays[ relay ] = null;
                        bad_relays[ relay ] = 0;
                    }, 30000 );
                    return;
                }
                var relay_is_good = !!relays[ relay ] && relays[ relay ].readyState == 1;
                if ( !!relays[ relay ] ) {
                    if ( relays[ relay ].readyState == 1 ) {
                        var i; for ( i=0; i<Object.keys( relays ).length; i++ ) {
                            var myrelay = Object.keys( relays )[ i ];
                            if ( !relays[ myrelay ] || relays[ myrelay ].readyState != 1 ) continue;
                            if ( !$_GET[ "multisig"] ) continue;
                            relays[ myrelay ].addEventListener( "message", handleMessage );
                            var subId   = bytesToHex( nobleSecp256k1.utils.randomPrivateKey() ).toString( "hex" ).substring( 0, 24 );
                            var filter  = { "ids": [ $_GET[ "multisig"] ] }
                            var subscription = [ "REQ", subId, filter ];
                            relays[ myrelay ].send( JSON.stringify( subscription ) );
                        }
                        return true;
                    } else {
                        relays[ relay ].close();
                        relays[ relay ] = new WebSocket( relay );
                        await waitSomeSeconds( 1 );
                        if ( relays[ relay ] && relays[ relay ].readyState == 1 ) {
                            var i; for ( i=0; i<Object.keys( relays ).length; i++ ) {
                                var myrelay = Object.keys( relays )[ i ];
                                if ( !relays[ myrelay ] || relays[ myrelay ].readyState != 1 ) continue;
                                if ( !$_GET[ "multisig"] ) continue;
                                relays[ myrelay ].addEventListener( "message", handleMessage );
                                var subId   = bytesToHex( nobleSecp256k1.utils.randomPrivateKey() ).toString( "hex" ).substring( 0, 24 );
                                var filter  = { "ids": [ $_GET[ "multisig"] ] }
                                var subscription = [ "REQ", subId, filter ];
                                relays[ myrelay ].send( JSON.stringify( subscription ) );
                            }
                            return true;
                        }
                    }
                } else {
                    relays[ relay ] = new WebSocket( relay );
                }
                await waitSomeSeconds( 1 );
                console.log( "fixing this relay:", relay );
                bad_relays[ relay ] = bad_relays[ relay ] + 1;
                return fixReadyState( relay );
            }
            var waitForBalanceToLoad = async () => {
                if ( !isNaN( $( '.bitpac_balance_sats' ).innerText ) ) return;
                await waitSomeSeconds( 1 );
                return waitForBalanceToLoad();
            }
            var waitForOneRelay = async ( waiting_for_damus ) => {
                await waitSomeSeconds( 1 );
                if ( waiting_for_damus && relays[ "wss://relay.damus.io" ] && relays[ "wss://relay.damus.io" ].readyState == 1 ) {
                    return;
                } else if ( waiting_for_damus ) {
                    return waitForOneRelay( true );
                }
                var relay_is_ready = false;
                Object.keys( relays ).every( item => {
                    if ( relays[ item ] && relays[ item ].readyState == 1 ) {
                        relay_is_ready = true;
                        return;
                    }
                    return true;
                });
                if ( !relay_is_ready ) {
                    return waitForOneRelay();
                }
            }
            var checkIfTxHappened = async txid => {
                var data = await getData( `https://mempool.space/${mempoolNetwork}api/tx/${txid}` );
                if ( data != "Transaction not found" ) return true;
            }
        </script>
    </head>
    <body>
<h1><a href="http://www.tribebtc.com/dhonboard.html">Tribe</a></h1>
        <div class="multisig_creator">
            <p>
                A bitpac is a publicly auditable cooperative that lives on bitcoin. Use this form to create a bitpac so that you and the other members of your cooperative can control some money and vote on how to spend it.
            </p>
            <p>Name your bitpac:</p>
            <input class="bitpac_name">
            <p>What is your bitpac based on?</p>
            <select id="options">
           <option value="npub">NOSTR npubs</option>
           <option value="btcddress">BTC Wallet Addresses</option>
            <option value="Ordinals">Ordinals</option>
           </select>
            <p>Enter an npub for everyone in your bitpac:</p>
            <div class="select_npubs">
            </div>
            <p>Pick how many votes are needed to spend the money:</p>
            <input class="select_threshold" type="number" value="1" min="1" step="1" max="74">
            <p>Your policy so far: <span class="threshold_num">1</span> out of <span class="multisig_num">1</span></p>
            <div class="nostr_profiles"></div>
            <button class="create_bitpac">Submit</button>
        </div>
        <div class="multisig_viewer">
            <div class="loading">Loading<span class="dots">.</span></div>
        </div>
        <script>
            var init = async () => {
                dotLoop( "." );
                if ( !$_GET[ "multisig" ] ) {
                    addNpub();
                    $( '.select_threshold' ).onchange = () => {
                        if ( isNaN( $( '.select_threshold' ).value ) ) return;
                        if ( Number( $( '.select_threshold' ).value ) > $$( '.select_npub' ).length ) $( '.select_threshold' ).value = $$( '.select_npub' ).length;
                        $( '.threshold_num' ).innerText = $( '.select_threshold' ).value;
                    }
                    $( '.select_threshold' ).onkeyup = () => {
                        if ( isNaN( $( '.select_threshold' ).value ) ) return;
                        if ( Number( $( '.select_threshold' ).value ) > $$( '.select_npub' ).length ) $( '.select_threshold' ).value = $$( '.select_npub' ).length;
                        $( '.threshold_num' ).innerText = $( '.select_threshold' ).value;
                    }
                    $( '.threshold_num' ).innerText = $( '.select_threshold' ).value;
                    $( '.create_bitpac' ).onclick = async () => {
                        var keep_going = true;
                        $$( '.select_npub' ).forEach( item => {
                            if ( !item.value ) {
                                keep_going = false;
                            }
                            if ( !isValidNpub( item.value ) ) {
                                keep_going = false;
                            }
                        });
                        if ( !keep_going ) {
                            showModal( "One of your npubs is invalid or empty, please fix it and try again" );
                            return;
                        }
                        var conf_message = `Are you sure you want to use a policy of ${String( $( '.select_threshold' ).value )} out of ${String( $$( '.select_npub' ).length )}?`;
                        var conf = confirm( conf_message );
                        if ( !conf ) return;
                        var npubs = [];
                        var pubkeys = [ Number( $( '.select_threshold' ).value ) ];
                        $$( '.select_npub' ).forEach( item => {
                            npubs.push( item.value );
                            pubkeys.push( pubkeyFromNpub( item.value ) );
                        });
                        var bitpac_name = $( '.bitpac_name' ).value;
                        var event = {
                            "content"    : JSON.stringify( [bitpac_name, pubkeys] ),
                            "created_at" : Math.floor( Date.now() / 1000 ),
                            "kind"       : 2858,
                            "tags"       : [],
                            "pubkey"     : pubKey,
                        }
                        var signedEvent = await getSignedEvent(event, privKey);
                        var note_id = signedEvent.id;
                        var divider = window.location.href.includes( "?" ) ? "&" : "?";
                        var url = window.location.href + divider + "multisig=" + note_id;
                        var i; for ( i=0; i<Object.keys( relays ).length; i++ ) {
                            var myrelay = Object.keys( relays )[ i ];
                            if ( !relays[ myrelay ] || relays[ myrelay ].readyState != 1 ) continue;
                            relays[ myrelay ].addEventListener( "message", handleMessage );
                            relays[ myrelay ].send(JSON.stringify([ "EVENT", signedEvent ]));
                        }
                        showModal( `Success, your multisig is created and can be viewed and managed here:\n\n${url}` );
                    }
                } else {
                    $( '.multisig_creator' ).style.display = "none";
                    $( '.multisig_viewer' ).style.display = "block";
                    var i; for ( i=0; i<Object.keys( relays ).length; i++ ) {
                        var myrelay = Object.keys( relays )[ i ];
                        await waitForOneRelay();
                        if ( !relays[ myrelay ] || relays[ myrelay ].readyState != 1 ) continue;
                        if ( !$_GET[ "multisig"] ) continue;
                        relays[ myrelay ].addEventListener( "message", handleMessage );
                        var subId   = bytesToHex( nobleSecp256k1.utils.randomPrivateKey() ).toString( "hex" ).substring( 0, 24 );
                        var filter  = { "ids": [ $_GET[ "multisig"] ] }
                        var subscription = [ "REQ", subId, filter ];
                        relays[ myrelay ].send( JSON.stringify( subscription ) );
                    }
                }
            }
            getUtxosOnLoop = async () => {
                var num = Number( sessionStorage[ "loop_num" ] );
                if ( $( '.addy' ) && num < 1 ) {
                    getBitcoinPrice();
                    num = 10;
                    var utxos = await getUTXOs( $( '.addy' ).innerText, mempoolNetwork );
                    sessionStorage[ "utxos" ] = JSON.stringify( utxos );
                    var full_balance = 0;
                    utxos.forEach( item => {
                        full_balance = full_balance + item[ 2 ];
                    });
                    var usd_balance = await satsToDollars( full_balance );
                    usd_balance = usd_balance.toFixed( 2 );
                    $( '.bitpac_balance' ).innerText = usd_balance;
                    $$( '.bitpac_balance' )[ 1 ].innerText = usd_balance;
                    $( '.bitpac_balance_sats' ).innerText = full_balance;
                    $$( '.bitpac_balance_sats' )[ 1 ].innerText = full_balance;
                    Object.keys( relays ).forEach( item => {
                        fixReadyState( item );
                    });
                } else if ( num < 1 ) {
                    num = 10;
                    Object.keys( relays ).forEach( item => {
                        fixReadyState( item );
                    });
                }
                num = num - 1;
                sessionStorage[ "loop_num" ] = String( num );
                await waitSomeSeconds( 1 );
                getUtxosOnLoop();
            }
            init();
            sessionStorage[ "loop_num" ] = "3";
            getUtxosOnLoop();
        </script>
        <div class="black-bg" onclick="modalVanish();"></div>
        <div class="modal"></div>
      <MultiSig />
    </div>
  )
};

export default CreateTribeNostr;

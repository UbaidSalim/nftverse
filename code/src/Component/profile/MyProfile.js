import React, { useEffect } from "react";
import { useStore } from "../../context/GlobalState";
import { useState } from "react";
import Username from "../navbar/Username";

function MyProfile() {
    const [{user_data, network}] = useStore();
    const [user_nfts, set_user_nfts] = useState([]);

    const[displayNetwork, setNetwork] = useState("");
    useEffect(() => {
        if(network === 5){
            setNetwork("Ethereum (Goreli)");
        }
        else if(network === 80001){
            setNetwork("Polygon (Matic)");
        }
        else if(network === 97){
            setNetwork("Binance Smart Chain (Testnet)");
        }
        else{
            setNetwork("");
        }
        if(JSON.stringify(user_data) !== '{}'){
            if(user_data.nfts.length > 0){
                const filteredData = user_data.nfts.filter(obj => (obj.network === network));
                set_user_nfts(filteredData);
            }
        }
    },[user_data, network]);

    return (
        // <div className="Theme_ui">
            <div className="profile-section row">
                <div className="profile-section-background row">
                    {/* <div className="nav-section-blur row"></div> */}
                    {/* <NavbarAfterLogin /> */}
                    <div className="my-assets-container">
                        <div className="Container">

                            <div className="row">
                                <div className="myassets-Title row">
                                    <Username/>
                                    <h1 className="my-assets-head d-flex justify-content-center">My Profile</h1>
                                    <center>
                                        <p className="create-collection-desc">Select the Blockchain Network from Metamask.</p>
                                        <input type="text" readOnly value={displayNetwork} className="input-collection-name" style={{width: "30%"}}/>
                                        <br/>
                                    </center>
                                </div>
                                <hr/>
                                <div className="row">
                                    {
                                        user_nfts.length > 0 ?
                                        user_nfts.map(data => (
                                            <div className="col-sm-3">
                                                <div className="my-assets-field row mt-5">
                                                    <img className="my-assets-images row" src={data.image} alt ="" style={{width:"280px"}}/>
                                                    <div className="row pt-2 pl-2">
                                                        <div className="my-assets-Title col-sm"><span>{data.name}</span></div>
                                                        <div className="intro-button col-sm"><button className="btn btn-sm"><a className="nav-link" href={`/ViewProfileDetails?details=${JSON.stringify(data)}`}>Expand Item</a></button></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : <h5 style={{textAlign: "center"}}>You don't have NFTs</h5>
                                    }
                                </div>
                            </div>
                        </div>

                    </div>


                </div>
                {/* <h1>Hii</h1> */}
            </div>
        // </div>
    )
}

export default MyProfile;
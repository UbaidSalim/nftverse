import { useEffect, useState } from "react";
import firebaseDb from "../../firebase/config";
import { useStore } from "../../context/GlobalState";
import axios from "axios"
import { addNFTInDB, addOrEdit, getNFTs, addStrpieNFTInDB } from "../../store/asyncActions";
import { NFTVERSE_POLYGON_ADDRESS } from "../../contract/NFTVERSE";
import { generateSecuriyCode, getStripeNFTs } from "../../store/asyncActions";
import swal from 'sweetalert';
import Username from "../navbar/Username";

export default function ClaimNFT(){

    const [{user_data, network, accounts}] = useStore();

    const initialFieldValues = {
        paymentID: '',
        nftID: 0,
        securityCode: '',
        _securityCode: ''
    }
    const [values, setValues] = useState(initialFieldValues);
    const [showChaim, setClaim] = useState(false);
    const [details, setDetails] = useState({});

    function disableCopy(event) {
        event.preventDefault();
    }

    useEffect(() => {
        let security_code = generateSecuriyCode();
        setValues({ ...values, securityCode: security_code });
    }, [])

    const validate = async (e) => {
        e.preventDefault();

        if (values.securityCode !== values._securityCode) {
            swal({ text: "Incorrect Security Code", icon: "error", className: "sweat-bg-color" });
        }
        else {
            let stripeNFts = await getStripeNFTs();
            console.log(stripeNFts);
            let filtered = stripeNFts.filter(data => (data.payment_id === values.paymentID && data.id === values.nftID));
            if(filtered.length === 1){
                setClaim(true)
                setDetails(filtered[0])
            }
            else{
                setClaim(false)
                setDetails({})
                swal({ text: "InValid Payment_ID or NFT_ID", icon: "error", className: "sweat-bg-color" });
            }
        }
    }

    const claimNFT = async (e) => {
        e.preventDefault();

        if(user_data.wallet_address !== accounts[0]){
            swal({text: "Please Connect with correct Wallet", icon: "warning", className: "sweat-bg-color"});
        }
        else{
            let nfts = await getNFTs();
            let stripe_nfts = await getStripeNFTs();
            let index = stripe_nfts.findIndex((obj => (obj.id === details.id && obj.network === details.network)));
            stripe_nfts.splice(index, 1);

            try {  
                const trx_response = await axios.post("http://localhost:4000/claimNFT", {
                    contract_address: NFTVERSE_POLYGON_ADDRESS,
                    wallet_address: user_data.wallet_address,
                    token_id: details.id,
                });
                if(trx_response.data.success){

                    addStrpieNFTInDB(stripe_nfts, "NFT Created");

                    user_data.nfts.push({id: trx_response.data.nft_id, name: details.name, image: details.image, description: details.description, network: details.network, attributes: details.attributes});
                    addOrEdit(user_data, "NFT Created");
                        
                    nfts.push({id: trx_response.data.nft_id, name: details.name, image: details.image, description: details.description, network: details.network, attributes: details.attributes, saleType: 1})
                    addNFTInDB(nfts, "NFT Added");

                    const el = document.createElement('div');
                    if(network === 5){
                        el.innerHTML = `Transaction Link: <a href='https://goerli.etherscan.io/tx/${trx_response.data.transactionHash}'>Check Transaction</a>`
                    }
                    else if(network === 97){
                        el.innerHTML = `Transaction Link: <a href='https://testnet.bscscan.com/tx/${trx_response.data.transactionHash}'>Check Transaction</a>`
                    }
                    else if(network === 80001){
                        el.innerHTML = `Transaction Link: <a href='https://mumbai.polygonscan.com/tx/${trx_response.data.transactionHash}'>Check Transaction</a>`
                    }
                    await swal({text: "NFT Transfered to Wallet Successfully", icon: "success", content: el, className: "sweat-bg-color"});
                    window.location.href = '/'
                }
            }catch (error){
                console.log("error trax = ",error); 
                swal({text: error.message, icon: "error", className: "sweat-bg-color"});
            }
        }
    }

    return(
        <div className="Create-Collection-section row">
            <div className="collection-section-background row">
                {/* <div className="nav-section-blur row"></div> */}
                {/* <NavbarBeforeLogin/> */}
                <div className="Create-Collection-Container">
                    <Username/>
                    <div className="container">
                        <div className="Create-Collection-Title row text-center">
                            <h1 className="Create-collection-head">Claim NFT in Wallet</h1>
                        </div>
                        <div className="row">
                            <div className="col-md-5 mx-auto login-form">
                                <form className="justify-content-center" onSubmit={validate}>
                                    <div className="form-group">
                                        <div className="row">
                                            <div className="col-md-5" style={{ marginRight: "8%" }}>
                                                <label className="field-title">Payment ID</label>
                                                <input type="text" className="input-register" placeholder="Enter Stripe Payment ID" onChange={(e) => setValues({ ...values, paymentID: e.target.value })} required/>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="field-title">NFT ID</label>
                                                <input type="number" className="input-register" placeholder="Enter NFT ID" onChange={(e) => setValues({ ...values, nftID: Number(e.target.value) })} required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <div className="row">
                                            <label className="field-title">Captcha Code</label>
                                            <div className="col-md-5" style={{ marginRight: "8%" }}>
                                                <input type="text" className="input-register"  value={values.securityCode} style={{ fontFamily: "'Shadows Into Light', cursive", cursor: "not-allowed" }} readOnly onCopy={(e) => disableCopy(e)}/>
                                            </div>
                                            <div className="col-md-6">
                                                <input type="text" className="input-register" placeholder="Enter Captcha Code" onChange={(e) => setValues({ ...values, _securityCode: e.target.value })} required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group text-center">
                                        <br />
                                        <div className="intro-button">
                                            <button type="submit" className="btn btn-primary field-title" style={{ width: '40%' }}>Validate</button>
                                        </div>
                                    </div>

                                </form>
                            </div>
                        </div>
                        <hr/>
                    </div>

                    {
                        showChaim ? 
                        <div className="container">
                            <br/><br/><br/>
                            <div className="row">
                                <div className="col-md-5 mx-auto login-form">
                                    <form className="justify-content-center" onSubmit={claimNFT}>
                                        <div className="form-group text-center">
                                            <img src={details.image} width="200px" style={{borderRadius: "50%"}}/>
                                        </div>
                                        <div className="form-group text-center">
                                            <h2>{details.name}</h2>
                                        </div>
                                        <div className="form-group text-center">
                                            <p>{details.description}</p>
                                        </div>
                                        <div className="form-group text-center">
                                        <div className="row justify-content-center">
                                            <div className="col-md-9">
                                                <input type="text" className="input-register" value={user_data.wallet_address} readOnly/>
                                            </div>
                                        </div>
                                        </div>
                                        <div className="form-group text-center">
                                            <div className="intro-button">
                                                <button type="submit" className="btn btn-primary field-title" style={{ width: '40%' }}>Claim NFT</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        : null
                    }
                    

                </div>

            </div>
        </div>
    )
}
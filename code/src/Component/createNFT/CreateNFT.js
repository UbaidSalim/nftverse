import React, { useEffect, useState } from "react";
import {pinataConfig} from '../../ipfs/ipfs'
import axios from 'axios';

import { useStore } from "../../context/GlobalState";
import { NFTMinting, addNFTInDB, addOrEdit, getNFTs } from "../../store/asyncActions";

import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

import swal from 'sweetalert';
import Username from "../navbar/Username";
import StripeForm from "./StripeForm"

function CreateNFT(){

    // ********** Test Pinata Connection **********
    // useEffect(async() => {
    //     try {
    //         const url =`${pinataConfig.root}/data/testAuthentication`
    //         const res = await axios.get(url, {headers: pinataConfig.headers});
    //         console.log(res.data);
    //       } catch (error) {
    //         console.log(error)
    //       }
    // })

    const [{web3, contract, accounts, network, mintFee, user_data}, dispatch] = useStore();
   
    const values = {
        name: "",
        description: "",
        network: 0,
        attributes: [],
    }
    const [data, setData] = useState(values);
    const [displayImage, setDisplayImage] = useState(null);
    const [img_File, setImg_File] = useState(null);
    let imageHash = null;
   
    const imageFile = (e) => {
        e.preventDefault();
        setDisplayImage(URL.createObjectURL(e.target.files[0]));
        setImg_File(e.target.files[0]);
    }

    const[displayNetwork, setNetwork] = useState("");
    useEffect(() => {
        if(network === 5){
            setData({...data, network: 5});
            setNetwork("Ethereum (Goreli)");
        }
        else if(network === 80001){
            setData({...data, network: 80001});
            setNetwork("Polygon (Matic)");
        }
        else if(network === 97){
            setData({...data, network: 97});
            setNetwork("Binance Smart Chain (Testnet)");
        }
        else{
            setData({...data, network: 0});
            setNetwork("");
        }
    },[network])

    const addAttribute = () => {
        setData({...data, attributes: [...data.attributes, {trait_type: "", value: ""}] });
    };

    const handleTraitsType = (e, value) => {
        e.preventDefault();
        const index = e.target.id;
        
        const attr = [...data.attributes];
        attr[index].trait_type = value;
        setData({...data, attributes: attr}); 
    }

    const handleTraitsValue = (e, value) => {
        e.preventDefault();
        const index = e.target.id;
        
        const attr = [...data.attributes];
        attr[index].value = value;
        setData({...data, attributes: attr}); 
    }

    const [paymentOption, setPaymentOption] = useState(false);

    const upload_ipfs_data = async () => {
        try{
            const formData = new FormData();
            formData.append('file', img_File);
        
            const img_url = `${pinataConfig.root}/pinning/pinFileToIPFS`;
            const img_response = await axios({
            method: 'post',
            url: img_url,
            data: formData,
            headers: pinataConfig.headers
            })
            imageHash = img_response.data.IpfsHash;
            
            let obj = {
                name: data.name,
                image: `https://gateway.pinata.cloud/ipfs/${String(imageHash)}`,
                description: data.description,
                network: data.network,
                attributes: data.attributes,
            }
            const metadata_url = `${pinataConfig.root}/pinning/pinJSONToIPFS`;
            const metadata_response = await axios({
            method: 'post',
            url: metadata_url,
            data: obj,
            headers: pinataConfig.headers
            })
            return `https://gateway.pinata.cloud/ipfs/${metadata_response.data.IpfsHash}`;
        }
        catch(error){
            swal({text: error.message, icon: "error", className: "sweat-bg-color"});
            console.log("Error from IPFS ", error.message);
        }
    } 
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        let nfts = await getNFTs();
        
        let user_balance = await web3.eth.getBalance(accounts[0]);
        user_balance /= 10 ** 18;

        console.log(`mintFee = ${mintFee}, userBalance = ${user_balance}`)
     
        if(data.name === "" || data.description === "" || data.attributes.length === 0 || img_File === null || data.network === 0){
            swal({text: "Please Fill all the Fields", icon: "warning", className: "sweat-bg-color"});
        }
        else if(user_data.wallet_address !== accounts[0]){
            swal({text: "Please Connect with correct Wallet", icon: "warning", className: "sweat-bg-color"});
        }
        else if(user_balance < (mintFee / 10 ** 18)){
            swal({text: "Account Balance is not Enough for Creating NFT", icon: "warning", className: "sweat-bg-color"});
        }    
        else{
            const baseUri = await upload_ipfs_data();
            console.log(`base Uri = ${baseUri}`);
            
            try {  
                
                let nft_id = await contract.methods._tokenIds().call();
                nft_id++;
                const newTransaction = {
                    tokenUri: baseUri,
                    mintFee: mintFee
                }
                const transaction = await NFTMinting(contract, accounts, newTransaction);
                if(transaction.status == true){
                    user_data.nfts.push({id: nft_id ,name: data.name, image:`https://gateway.pinata.cloud/ipfs/${String(imageHash)}`, description: data.description, network: data.network ,attributes: data.attributes});
                    addOrEdit(user_data, "NFT Created");
                    
                    nfts.push({id: nft_id ,name: data.name, image:`https://gateway.pinata.cloud/ipfs/${String(imageHash)}`, description: data.description, network: data.network ,attributes: data.attributes, saleType: 1})
                    console.log("new nft added", nfts);
                    addNFTInDB(nfts, "NFT Added");
                    
                    const el = document.createElement('div');
                    if(network === 5){
                        el.innerHTML = `Transaction Link: <a href='https://goerli.etherscan.io/tx/${transaction.transactionHash}'>Check Transaction</a>`
                    }
                    else if(network === 97){
                        el.innerHTML = `Transaction Link: <a href='https://testnet.bscscan.com/tx/${transaction.transactionHash}'>Check Transaction</a>`
                    }
                    else if(network === 80001){
                        el.innerHTML = `Transaction Link: <a href='https://mumbai.polygonscan.com/tx/${transaction.transactionHash}'>Check Transaction</a>`
                    }
                    await swal({text: "NFT Created Successfully", icon: "success", content: el, className: "sweat-bg-color"});
                    window.location.href = '/'
                }
            }catch (error){
                console.log("error trax = ",error); 
                swal({text: error.message, icon: "error", className: "sweat-bg-color"});
            }
        }
    }

    const PUBLIC_KEY = "pk_test_51NeeX8ENXusa1nSFiigEMpAGYH73zdQiMRoUqLPe2RYdjFyVad0mEEVobDyEUG3ffDL47XkyXcnWBvnB7Y3ETVNI00CKqAkE7m";
    const stripeTestPromise = loadStripe(PUBLIC_KEY)

    return(
        // <div className="Theme_ui">
            <div className="Create-Collection-section row">
                <div className="collection-section-background row">
                    {/* <div className="nav-section-blur row"></div> */}
                    {/* <NavbarAfterLogin/> */}
                    <div className="Create-Collection-Container">
                    <Username/>
                        <center>
                            <div className="container">
                                <div className="Create-Collection-Title row"> 
                                    <h1 className="Create-collection-head">Create an NFT</h1> 
                                    {/* <p className="Create-collection-head"><b>Note: Fee For Creating NFT is {mintFee / 10 ** 18} ETH </b></p>  */}
                                </div>
                                <div className="Create-Collection-form row ">
                                    <div className="logo-image-field">
                                        <div className="text-div">
                                            <h4>Upload Image</h4>
                                            <p className="create-collection-desc">This image will also be used for navigation. 350 x 350 recommended.</p>
                                        </div>
                                        
                                        
                                          {
                                            displayImage == null ? 
                                            <div className="logo-image">
                                                <input type="file" id="image" style={{opacity:'0'}} onChange={imageFile}/>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" className="bi bi-images logo-bi-images" viewBox="0 0 16 16">
                                                    <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="#585858"/>
                                                    <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z" fill="#585858"/>
                                                </svg>
                                            </div>
                                            :
                                            <img src={displayImage} width="200px" style={{borderRadius: "50%"}}/>
                                          }  
                                            
                                
                                        
                                    </div>
                                    <div className="name-field">
                                        <label className="field-title">Name</label>
                                        <input type="text" className="input-collection-name" placeholder="Example: Treasure of the Sea" onChange={(e)=>setData({...data, name: e.target.value})}/>
                                    </div>
                                    <div className="nft-description-field">
                                        <label className="field-title">Description</label>
                                        <p className="create-collection-desc">Markdown syntax is supported. 0 of 1000 characters used.</p>
                                        <textarea  className="input-nft-description" onChange={(e)=>setData({...data, description: e.target.value})}></textarea>
                                    </div>
                                    <div className="category-field">
                                        <label className="field-title">Network</label>
                                        <p className="create-collection-desc">Select the Blockchain Network from Metamask.</p>
                                        <input type="text" readOnly className="input-collection-name" value={displayNetwork}/>
                                        {/* <select className="nft-category-btn form-select" style={{backgroundColor:"#120124"}} onChange={(e)=>changeNetwork(e.target.value)}>
                                            <option disabled>Select the Blockchain Network</option>
                                            <option value="5" disabled={network !== 5 ? true : false} selected={network === 5 ? true : false}>Ethereum (Goreli)</option>
                                            <option value="80001" disabled={network !== 80001 ? true : false} selected={network === 80001 ? true : false}>Polygon Mumbai</option>
                                            <option value="97" disabled={network !== 97 ? true : false} selected={network === 97 ? true : false}>Binance Smart Chain (Testnet)</option>
                                        </select> */}
                                    </div>
                                    <div className="category-field">
                                        <label className="field-title">Attributes</label>
                                        <p className="create-collection-desc">Enter Attributes of uploaded NFT<div className="intro-button"><button type="button" className="btn btn-primary" onClick={addAttribute}>Add+</button></div> </p>
                                            {
                                                data.attributes.length > 0 ?
                                                    data.attributes.map((obj, index) => (
                                                        <div className="row pl-5">
                                                            <div className="col-sm">
                                                                <label className="field-title">trait type</label>
                                                                <input type="text" id={index} className="input-collection-name" onChange={(e) => handleTraitsType(e, e.target.value)}/>
                                                            </div>
                                                            <div className="col-sm">
                                                                <label className="field-title">value</label>
                                                                <input type="text" id={index} className="input-collection-name" onChange={(e) => handleTraitsValue(e, e.target.value)}/>
                                                            </div>
                                                        </div>
                                                    ))
                                                    : null 
                                            }
                                    </div>
                                    <div className="nft-description-field">
                                        <label className="field-title">Payment Options</label>
                                            <div class="form-switch" style={{marginRight: '3%'}}>
                                                <label> Pay with Wallet</label>
                                                <span style={{marginLeft: '4%'}}>
                                                    <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault" onChange={()=> setPaymentOption(!paymentOption)}/>
                                                    <label class="form-check-label" for="flexSwitchCheckDefault" style={{marginLeft:'1%'}}> Pay with Card</label>
                                                </span>
                                            </div>
                                    </div>
                                    <div className="category-field">
                                        <br/>
                                        {
                                            !paymentOption ? 
                                            <>
                                            <p className="Create-collection-head"><b>Note: Fee For Creating NFT is {mintFee / 10 ** 18} ETH </b></p> 
                                            <div className="intro-button">
                                                <button type="button" className="btn btn-primary" onClick={(e)=>handleSubmit(e)}>Create an NFT</button>
                                            </div>
                                            </>
                                            :
                                            <>
                                            <p className="Create-collection-head"><b>Note: Fee For Creating NFT is 0.5 USD</b></p>
                                            <div className="intro-button">
                                                <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">Create an NFT</button>
                                            </div>
                                            </> 
                                        }
                                    </div>
                                </div>
                                
                                <div className="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title" id="exampleModalLabel">Pay With Card</h5>
                                                <button type="button" class="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <div className="modal-body">
                                                <div className="row">
                                                    <div className="col-md mx-auto">
                                                    <Elements stripe={stripeTestPromise}>
                                                        <StripeForm data={data} img_File={img_File}/>
                                                    </Elements>  
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <div className="modal-footer">
                                                <button type="button" className="btn custom-btn" onClick={(e) => generateArtWork(e)}>Generate ArtWork</button>
                                            </div> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </center>
                        
                    </div>
                    
                </div>
                {/* <h1>Hii</h1> */}
            </div>



        // </div>
    )
}

export default CreateNFT;
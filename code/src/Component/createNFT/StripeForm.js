import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js"
import axios from "axios"
import React, { useState } from 'react'
import { useStore } from "../../context/GlobalState";
import { NFTVERSE_POLYGON_ADDRESS } from "../../contract/NFTVERSE";
import swal from 'sweetalert';
import { getStripeNFTs, addStrpieNFTInDB } from "../../store/asyncActions";
import {pinataConfig} from '../../ipfs/ipfs'

const CARD_OPTIONS = {
	iconStyle: "solid",
	style: {
		base: {
			iconColor: "#c4f0ff",
			color: "#fff",
			fontWeight: 500,
			fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
			fontSize: "16px",
			fontSmoothing: "antialiased",
			":-webkit-autofill": { color: "#fce883" },
			"::placeholder": { color: "#87bbfd" }
		},
		invalid: {
			iconColor: "#ffc7ee",
			color: "#ffc7ee"
		}
	}
}

export default function StripeForm({data, img_File}) {
    let imageHash = null;
    
    const stripe = useStripe()
    const elements = useElements()

    const [{contract, mintFee, network}] = useStore();

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

    const buyWithCard = async (e) => {
        e.preventDefault()
        let stripe_nfts = await getStripeNFTs();
        
        if(data.name === "" || data.description === "" || data.attributes.length === 0 || img_File === null || data.network === 0){
            swal({text: "Please Fill all the Fields", icon: "warning", className: "sweat-bg-color"});
        }
        else{
            //stripe logic
            const {error, paymentMethod} = await stripe.createPaymentMethod({
                type: "card",
                card: elements.getElement(CardElement)
            });
            if(!error) {
                try {
                    const {id} = paymentMethod
                    const response = await axios.post("http://localhost:4000/payment", {
                        amount: 50,
                        id
                    })
                    if(response.data.success) {
                        let nft_id = await contract.methods._tokenIds().call();
                        nft_id += 1;
                        const baseUri = await upload_ipfs_data();
                        console.log(`base Uri = ${baseUri}`);
                        try {  
                            const trx_response = await axios.post("http://localhost:4000/mintThroughStripe", {
                                payment_id: id,
                                contract_address: NFTVERSE_POLYGON_ADDRESS,
                                baseUri: baseUri,
                                mintFee: mintFee / 10**18,
                            });
                            if(trx_response.data.success){
                                stripe_nfts.push({id: trx_response.data.nft_id, payment_id: trx_response.data.payment_id, name: data.name, image:`https://gateway.pinata.cloud/ipfs/${String(imageHash)}`, description: data.description, network: data.network ,attributes: data.attributes})
                                console.log("new nft added", stripe_nfts);
                                addStrpieNFTInDB(stripe_nfts, "NFT Created");
                                
                                const el = document.createElement('div');
                                if(network === 5){
                                    el.innerHTML = `
                                    <p>Note: Do not share this details publically... Save this details, You need to provide this info when you claim NFT.</p>
                                    <p>Payment ID: ${trx_response.data.payment_id} </p>
                                    <p>NFT ID: ${trx_response.data.nft_id} </p>
                                    Transaction Link: <a href='https://goerli.etherscan.io/tx/${trx_response.data.transactionHash}'>Check Transaction</a>`
                                }
                                else if(network === 97){
                                    el.innerHTML = `
                                    <p>Note: Do not share this details publically... Save this details, You need to provide this info when you claim NFT.</p>
                                    <p>Payment ID: ${trx_response.data.payment_id} </p>
                                    <p>NFT ID: ${trx_response.data.nft_id} </p>
                                    Transaction Link: <a href='https://testnet.bscscan.com/tx/${trx_response.data.transactionHash}'>Check Transaction</a>`
                                }
                                else if(network === 80001){
                                    el.innerHTML = `
                                    <p>Note: Do not share this details publically... Save this details, You need to provide this info when you claim NFT.</p>
                                    <p>Payment ID: ${trx_response.data.payment_id} </p>
                                    <p>NFT ID: ${trx_response.data.nft_id} </p>
                                    Transaction Link: <a href='https://mumbai.polygonscan.com/tx/${trx_response.data.transactionHash}'>Check Transaction</a>`
                                }
                                await swal({text: "NFT Created Successfully", icon: "success", content: el, className: "sweat-bg-color"});
                            }
                        }catch (error){
                            console.log("error trax = ",error); 
                            swal({text: error.message, icon: "error", className: "sweat-bg-color"});
                        }
                    }
        
                } catch (error) {
                    console.log("Error", error)
                }
            } else {
                console.log(error.message)
            } 
        }
    }

    return (
        <form onSubmit={buyWithCard}>
            <fieldset className="FormGroup">
                <div className="FormRow">
                    <CardElement options={CARD_OPTIONS}/>
                </div>
            </fieldset>
            <br/>
            <div className="intro-button">
                <button type="submit" className="btn btn-primary">Pay</button>
            </div>
        </form>
    )
}
import { useStore } from '../../context/GlobalState';
import { useEffect, useState } from 'react';
import { NFTVERSE_POLYGON_ADDRESS, NFTVERSE_BSC_ADDRESS, NFTVERSE_ETHEREUM_ADDRESS } from "../../contract/NFTVERSE";
import swal from 'sweetalert';
import { addNFTInDB, BuyNFT, PlaceBid, CancelBid ,getNFTs, getOwnerNFTs, addOrEdit, addOrEdit1 } from '../../store/asyncActions';

function ViewDetails(){

    const [{web3, contract, accounts, user_data, network}] = useStore();

    const params = new URLSearchParams(window.location.search);
    const nft = JSON.parse(params.get("details"));
    
    const [currentPrice, setCurrentPrice] = useState(0);
    const [owner, setOwner] = useState(""); 
    const [pruchase, setPurchase] = useState(false); 

    const[offers, setOffers] = useState([]);
    const [placeOffer, setPlaceOffer] = useState(false); 

    const[_cancelBid, _setCancelBid] = useState(false);

    useEffect(() => {
        (async() => {
            if(contract !== null){
                let price = await contract.methods.viewListing(nft.id).call();
                price /= 10**18;
                setCurrentPrice(price);

                const owner = await contract.methods.ownerOf(nft.id).call();
                setOwner(owner);

                const _offers = await contract.methods.getOffers(nft.id).call();
                console.log(_offers)
                setOffers(_offers);
            }
        })()
    },[contract, pruchase, placeOffer, _cancelBid]);


    const buyNFT = async(tokenId, price) => {

        let user_balance = await web3.eth.getBalance(accounts[0]);
        user_balance /= 10 ** 18;

        let nfts = await getNFTs();
        let objIndex = nfts.findIndex((obj => (obj.id === tokenId && obj.network === network)));
        nfts[objIndex].saleType = 0;
        console.log("NFTs Updated List", nfts);

        let {owner_data, UUID} = getOwnerNFTs(owner);
        console.log("owner_data", owner_data)

        const _nft = await contract.methods.getNFT_Details(tokenId).call();
        
        if(user_data.wallet_address !== accounts[0]){
            swal({text: "Please Connect with correct Wallet", icon: "warning", className: "sweat-bg-color"});
        }
        else if(_nft.listed === false){
            swal({text: "this NFT is not on Selling", icon: "warning", className: "sweat-bg-color"});
        } 
        else if((_nft.price / 10**18) !== price){
            swal({text: "Invalid Buying Price", icon: "warning", className: "sweat-bg-color"});
        } 
        else if(_nft.owner === accounts[0]){
            swal({text: "Owner cannot Buy NFT", icon: "warning", className: "sweat-bg-color"});
        } 
        else if(user_balance < price){
            swal({text: "Account Balance is not Enough for Buying NFT", icon: "warning", className: "sweat-bg-color"});
        }
        else{
            try {  
                const ethPrice = await web3.utils.toWei(String(price), "ether");
                const newTransaction = {
                    tokenID: tokenId,
                    price: ethPrice
                }
                const transaction = await BuyNFT(contract, accounts, newTransaction);
                if(transaction.status == true){
                    user_data.nfts.push({id: tokenId ,name: nft.name, image: nft.image, description: nft.description, network: nft.network ,attributes: nft.attributes});
                    console.log("added on new User", user_data.nfts);
                    addOrEdit(user_data, "NFT Added");

                    let index = owner_data.nfts.findIndex((obj => (obj.id === tokenId && obj.network === network)));
                    owner_data.nfts.splice(index, 1);
                    console.log("delete nft previsous user", owner_data);
                    addOrEdit1(UUID, owner_data, "NFT Deleted");

                    addNFTInDB(nfts, "NFT List Updated");

                    setPurchase(true);
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
                    await swal({text: "NFT Purchased Successfully", icon: "success", content: el, className: "sweat-bg-color"});
                    window.location.href = '/'
                }
            }catch (error){
                console.log("error trax = ",error); 
                swal({text: error.message, icon: "error", className: "sweat-bg-color"});
            }
        }
    }

    const [bidPrice, setBidPrice] = useState(0);
    const placeBid = async (e) => {
        e.preventDefault();

        const owner = await contract.methods.ownerOf(nft.id).call();
        let user_balance = await web3.eth.getBalance(accounts[0]);
        user_balance /= 10 ** 18;

        if(user_data.wallet_address !== accounts[0]){
            swal({text: "Please Connect with correct Wallet", icon: "warning", className: "sweat-bg-color"});
        }
        else if(owner === accounts[0]){
            swal({text: "Owner cannot Bid on NFT", icon: "warning", className: "sweat-bg-color"});
        }
        else if(bidPrice <= 0){
            swal({text: "Bidding Price must be greater than 0", icon: "warning", className: "sweat-bg-color"});
        }
        else if(user_balance < bidPrice){
            swal({text: "Account Balance is not Enough for placing Bid", icon: "warning", className: "sweat-bg-color"});
        }

        else{
            try {  
                const ethPrice = await web3.utils.toWei(String(bidPrice), "ether");
                const newTransaction = {
                    tokenID: nft.id,
                    price: ethPrice
                }
                console.log(newTransaction)
                const transaction = await PlaceBid(contract, accounts, newTransaction);
                if(transaction.status == true){
                    setPlaceOffer(true);
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
                    swal({text: "Bid Placed Successfully", icon: "success", content: el, className: "sweat-bg-color"});
                }
            }catch (error){
                console.log("error trax = ",error); 
                swal({text: error.message, icon: "error", className: "sweat-bg-color"});
            }
        }
    }

    const cancelBid = async (tokenId, index, bidder_address) => {
        const owner = await contract.methods.ownerOf(nft.id).call();

        if(user_data.wallet_address !== accounts[0]){
            swal({text: "Please Connect with correct Wallet", icon: "warning", className: "sweat-bg-color"});
        }
        else if(owner === accounts[0]){
            swal({text: "Owner cannot cancel Bid", icon: "warning", className: "sweat-bg-color"});
        }
        else if(bidder_address !== accounts[0]){
            swal({text: "You cannot cancel Bid", icon: "warning", className: "sweat-bg-color"});
        }
        else{
            try {  
                const newTransaction = {
                    tokenID: tokenId,
                    index: index
                }
                console.log(newTransaction)
                const transaction = await CancelBid(contract, accounts, newTransaction);
                if(transaction.status == true){
                    _setCancelBid(true);
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
                    swal({text: "Bid Canceled Successfully", icon: "success", content: el ,className: "sweat-bg-color"});
                }
            }catch (error){
                console.log("error trax = ",error); 
                swal({text: error.message, icon: "error", className: "sweat-bg-color"});
            }
        }
    }
    let counter = 0;
    
    async function copyText(){
        navigator.clipboard.writeText(owner);
        document.getElementById("text-visible").style.visibility = "visible";
        console.log("Copied owner Address: " + owner);
    }

    return(
        // <div className="Theme_ui">
            <div className="Create-Collection-section row">
                <div className="collection-section-background row">
                    {/* <div className="nav-section-blur row"></div> */}
                    {/* <NavbarAfterLogin/> */}
                    <div className="Create-Collection-Container">
                        <div className="container"> 
                            <div className="row">
                                <div className="p-3 col-md-6">
                                    <img className="my-assets-images" src={nft.image} alt=""/>
                                </div>
                                <div className="p-3 col-md-6">
                                    <a style={{color: "rgb(218,20,205)"}}>NFTVERSE</a>
                                    <h2>{nft.name}</h2>
                                    <span>Owned by</span><span style={{color: "rgb(218,20,205)", cursor:"pointer"}} onClick={() => copyText()}> {owner.slice(0,5)}...........{owner.slice(37,42)} <span id='text-visible' className='textCopied'>Owner Address Copied</span> <br/><br/></span>
                                    <div class="card">
                                        <div className="card-body" style={{backgroundColor:'#120124'}}>
                                            <h6 className="card-subtitle mb-2 text-muted">Current Price</h6>
                                            <h3 className="card-title"><b>{currentPrice} ETH</b></h3>
                                            <div className="intro-button">   
                                            <button type="button" className="btn btn-primary" style={{width:"48%"}} disabled={user_data.wallet_address === owner || currentPrice === 0 ? true : false} onClick={() => buyNFT(nft.id, currentPrice)}>Buy Now</button>
                                            <button type="button" className="btn btn-primary" style={{width:"48%"}} disabled={user_data.wallet_address === owner ? true : false} data-bs-toggle="modal" data-bs-target="#exampleModal">Place Bid</button>
                                            </div>
                                        </div>
                                    </div>   
                                     <br/><br/>
                                     <div class="card">
                                        <div class="card-header" style={{border:'1px solid white', backgroundColor:'#120124'}}>
                                            <b>Offers</b>
                                        </div>
                                        <div className="card-body" style={{ backgroundColor:'#120124', height:'165px', overflowY:'scroll', scrollbarColor: 'red yellow'}}>
                                        {
                                            offers.length > 0 ?
                                            <table className="table table-fixed table-hover table-dark">
                                                <thead>
                                                    <tr>
                                                    <th scope="col" style={{ backgroundColor:'#120124'}}>#</th>
                                                    <th scope="col" style={{ backgroundColor:'#120124'}}>Price</th>
                                                    <th scope="col" style={{ backgroundColor:'#120124'}}>From</th>
                                                    <th scope="col" style={{ backgroundColor:'#120124'}}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        offers.map((obj, index) => (
                                                            obj.bidder !== "0x0000000000000000000000000000000000000000" ?
                                                            <tr>
                                                                <td style={{ backgroundColor:'#120124'}}><b>{++counter}</b></td>
                                                                <td style={{ backgroundColor:'#120124'}}><b>{obj.bidPrice / (10 ** 18)} ETH</b></td>
                                                                <td style={{ backgroundColor:'#120124'}}>{obj.bidder.slice(0,5)+".................."+obj.bidder.slice(37,42)}</td>
                                                                {
                                                                    obj.bidder === user_data.wallet_address ? 
                                                                    <td style={{ backgroundColor:'#120124'}}>
                                                                        <div className="intro-button">
                                                                            <button type="submit" className="btn btn-primary" onClick={()=>cancelBid(nft.id, index, obj.bidder)}>Cancel</button>
                                                                        </div>
                                                                    </td>
                                                                    : null
                                                                }
                                                            </tr>
                                                            : null
                                                        )) 
                                                    }  
                                                </tbody>
                                            </table>
                                            : <div className="text-center"><b>No Offer yet !!!</b></div>
                                        }
                                        </div>
                                    </div>  
                                </div>
                                <div className="p-3 col-md-6">
                                    <div class="card">
                                        <div className="card-header" style={{border:'1px solid white', backgroundColor:'#120124'}}>
                                           <b>Description</b>
                                        </div>
                                        <div className="card-body" style={{backgroundColor:'#120124'}}>
                                            <p>{nft.description}</p>
                                        </div>
                                    </div> 
                                    <br/>
                                    <div class="card">
                                        <div className="card-header" style={{border:'1px solid white', backgroundColor:'#120124'}}>
                                           <b>Attributes</b>
                                        </div>
                                        <div className="card-body" style={{backgroundColor:'#120124'}}>
                                            <div className="row">
                                                {
                                                    nft.attributes.length > 0 ? 
                                                    nft.attributes.map(attr => (
                                                        <div className="col-md-2 d-flex flex-col bd-highlight mb-3">
                                                            <div className="p-2 bd-highlight" style={{border: "1px solid white", borderRadius: "10%"}}>
                                                                <h6 className="text-center">{attr.trait_type}</h6> 
                                                                <h6 className="text-center text-muted">{attr.value}</h6>
                                                            </div>
                                                        </div> 
                                                    )) : null
                                                }
                                            </div>
                                        </div>  
                                    </div>   
                                </div>
                                <div className="p-3 col-md-6">
                                    <div class="card">
                                        <div className="card-header" style={{border:'1px solid white', backgroundColor:'#120124'}}>
                                           <b>Details</b>
                                        </div>
                                        <div className="card-body" style={{backgroundColor:'#120124'}}>
                                            <p>
                                                Contract Address
                                                <span style={{float: 'right'}}>{
                                                    nft.network === 80001 ? 
                                                    NFTVERSE_POLYGON_ADDRESS.slice(0,5)+"..........."+NFTVERSE_POLYGON_ADDRESS.slice(37,42) : 
                                                    nft.network === 5 ? NFTVERSE_ETHEREUM_ADDRESS.slice(0,5)+"..........."+NFTVERSE_ETHEREUM_ADDRESS.slice(37,42) : 
                                                    NFTVERSE_BSC_ADDRESS.slice(0,5)+"..........."+NFTVERSE_BSC_ADDRESS.slice(37,42) 
                                                }</span>
                                            </p>
                                            <p>
                                                Token ID
                                                <span style={{float: 'right'}}>{nft.id}</span>
                                            </p>
                                            <p>
                                                Token Standard 
                                                <span style={{float: 'right'}}>ERC-721</span>
                                            </p>
                                            <p>
                                                Network 
                                                <span style={{float: 'right'}}>{
                                                    nft.network === 80001 ? "Polygon (Matic)" : nft.network === 5 ? "Ethereum (Goreli)" : "Binance Smart Chain (Testnet)"  
                                                }</span>
                                            </p>
                                            <p>
                                                Creator Fee 
                                                <span style={{float: 'right'}}>1%</span>
                                            </p>
                                        </div>
                                    </div> 
                                    <br/>
                                </div>
                            </div> 
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Place Bid</h5>
                                <button type="button" class="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md mx-auto">
                                        <form className="justify-content-center" onSubmit={placeBid}>
                                            <div className="form-group">
                                                <label className="lottery-form-titles">Bid Price:</label>
                                                <input type="number" className="input-text-lottery" placeholder="Enter Bid Price" step=".0000000001" onChange={(e) => setBidPrice(e.target.value)}/>
                                            </div>
                                            
                                            <div className="form-group text-center">
                                                <div className="staking-button">
                                                    <div className="intro-button">
                                                        <button type="submit" className="btn btn-primary field-title" style={{width:'40%'}}>Bid Now</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>   
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        // </div>
    )
}
export default ViewDetails;
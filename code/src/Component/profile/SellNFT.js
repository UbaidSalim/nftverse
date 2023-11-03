import { useEffect, useState } from "react";
import { useStore } from "../../context/GlobalState";
import { NFTVERSE_POLYGON_ADDRESS, NFTVERSE_BSC_ADDRESS, NFTVERSE_ETHEREUM_ADDRESS } from "../../contract/NFTVERSE";
import { ListNFT, CancelListing, AcceptOffer, addNFTInDB, addOrEdit, addOrEdit1, getNFTs, getOwnerNFTs } from "../../store/asyncActions";
import swal from 'sweetalert';

function SellNFT(){
    const params = new URLSearchParams(window.location.search);
    const nft = JSON.parse(params.get("details"));

    const [{web3, contract, accounts, user_data, network}] = useStore();
    const [sellPrice, setSellPrice] = useState(0);
    const [owner, setOwner] = useState("");

    const [listed, setListed] = useState(false);
    const [currentPrice, setCurrentPrice] = useState(0); 

    const[offers, setOffers] = useState([]);

    const[_acceptOffer, _setAcceptOffer] = useState(false);

    useEffect(() => {
        (async() => {
            if(contract !== null){
                const price = await contract.methods.viewListing(nft.id).call();
                setCurrentPrice(price);
                if(price > 0){
                    setListed(true);
                }

                const owner = await contract.methods.ownerOf(nft.id).call();
                setOwner(owner);

                const _offers = await contract.methods.getOffers(nft.id).call();
                setOffers(_offers);
            }
        })()
    },[contract, listed, _acceptOffer])


    const handleSubmit = async (e) => {
        e.preventDefault();

        let nfts = await getNFTs();
        let objIndex = nfts.findIndex((obj => (obj.id === nft.id && obj.network === network)));
        nfts[objIndex].saleType = 2;
        console.log(nfts);

        const owner = await contract.methods.ownerOf(nft.id).call();
        const isListed = await contract.methods.getNFT_Details(nft.id).call(); 

        if(user_data.wallet_address !== accounts[0]){
            swal({text: "Please Connect with correct Wallet", icon: "warning", className: "sweat-bg-color"});
        }
        else if(sellPrice <= 0){
            swal({text: "Selling Price must be greater than 0", icon: "warning", className: "sweat-bg-color"});
        }
        else if(owner !== accounts[0]){
            swal({text: "You are not an Owner of this NFT", icon: "warning", className: "sweat-bg-color"});
        } 
        else if(isListed.listed === true){
            swal({text: "this NFT is already on Selling", icon: "warning", className: "sweat-bg-color"});
        } 
        else{
            try {  
                const ethPrice = web3.utils.toWei(sellPrice, "ether");
                const newTransaction = {
                    tokenID: nft.id,
                    price: ethPrice
                }
                const transaction = await ListNFT(contract, accounts, newTransaction);
                if(transaction.status == true){
                    addNFTInDB(nfts, "NFT Updated");

                    setListed(true);
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
                    swal({text: "NFT Listed Successfully", icon: "success", content: el ,className: "sweat-bg-color"});
                }
            }catch (error){
                console.log("error trax = ",error); 
                swal({text: error.message, icon: "error", className: "sweat-bg-color"});
            }
        }
    }

    const cancelListing = async (e) => {
        e.preventDefault();

        let nfts = await getNFTs();
        let objIndex = nfts.findIndex((obj => (obj.id === nft.id && obj.network === network)));
        nfts[objIndex].saleType = 1;
        console.log(nfts);

        const owner = await contract.methods.ownerOf(nft.id).call();
        const isListed = await contract.methods.getNFT_Details(nft.id).call(); 

        if(user_data.wallet_address !== accounts[0]){
            swal({text: "Please Connect with correct Wallet", icon: "warning", className: "sweat-bg-color"});
        }
        else if(owner !== accounts[0]){
            swal({text: "You are not an Owner of this NFT", icon: "warning", className: "sweat-bg-color"});
        } 
        else if(isListed.listed === false){
            swal({text: "this NFT is not on Selling", icon: "warning", className: "sweat-bg-color"});
        }
        else{
            try {  
                const newTransaction = {
                    tokenID: nft.id,
                }
                const transaction = await CancelListing(contract, accounts, newTransaction);
                if(transaction.status == true){
                    addNFTInDB(nfts, "NFT Updated");

                    setListed(false);
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
                    swal({text: "NFT Listing cancel Successfully", icon: "success", content: el ,className: "sweat-bg-color"});
                }
            }catch (error){
                console.log("error trax = ",error); 
                swal({text: error.message, icon: "error", className: "sweat-bg-color"});
            }
        } 
    }

    const acceptOffer = async (tokenId, index, bidder_address) => {

        let nfts = await getNFTs();
        let objIndex = nfts.findIndex((obj => (obj.id === tokenId && obj.network === network)));
        nfts[objIndex].saleType = 0;
        console.log("NFTs Updated List", nfts);

        let {owner_data, UUID} = getOwnerNFTs(bidder_address);
        let bidder_data = owner_data;

        const owner = await contract.methods.ownerOf(tokenId).call();

        if(user_data.wallet_address !== accounts[0]){
            swal({text: "Please Connect with correct Wallet", icon: "warning", className: "sweat-bg-color"});
        }
        else if(owner !== accounts[0]){
            swal({text: "Only Owner can accept Offer", icon: "warning", className: "sweat-bg-color"});
        }
        else if(bidder_address === accounts[0]){
            swal({text: "Bidder address cannot accept Offer", icon: "warning", className: "sweat-bg-color"});
        }
        else{
            try {  
                const newTransaction = {
                    tokenID: tokenId,
                    index: index
                }
                console.log("newtrx", newTransaction)
                const transaction = await AcceptOffer(contract, accounts, newTransaction);
                if(transaction.status == true){

                    let _index = user_data.nfts.findIndex((obj => (obj.id === tokenId && obj.network === network)));
                    user_data.nfts.splice(_index, 1);
                    console.log("delete nft from owner", user_data.nfts);
                    addOrEdit(user_data, "NFT Deleted");

                    bidder_data.nfts.push({id: tokenId ,name: nft.name, image: nft.image, description: nft.description, network: nft.network ,attributes: nft.attributes});
                    console.log("added nft on bidder", bidder_data.nfts);
                    addOrEdit1(UUID, bidder_data, "NFT Added");

                    addNFTInDB(nfts, "NFT List Updated");

                    _setAcceptOffer(true);
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
                    await swal({text: "Offer Accepted Successfully", icon: "success", content: el ,className: "sweat-bg-color"});
                    window.location.href = '/'
                }
            }catch (error){
                console.log("error trax = ",error); 
                swal({text: error.message, icon: "error", className: "sweat-bg-color"});
            }
        }
    }

    let counter = 0;

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
                                    <img className="descrpition-assets-images" src={nft.image} alt=""/>
                                </div>
                                <div className="p-3 col-md-6">
                                    <a style={{color: "rgb(218,20,205)"}}>NFTVERSE</a>
                                    <h2>{nft.name}</h2>
                                    <span>Owned by</span><span style={{color: "rgb(218,20,205)"}}> {owner.slice(0,5)}...........{owner.slice(37,42)} <br/><br/></span>
                                    <div class="card">
                                        <div className="card-body" style={{backgroundColor:'#120124'}}>
                                            <h6 className="card-subtitle mb-2 text-muted">Current Price</h6>
                                            <h3 className="card-title"><b>{currentPrice / 10**18} ETH</b></h3>
                                            <div className="intro-button">
                                                {
                                                    currentPrice > 0 ? 
                                                    <button type="button" className="btn btn-primary" style={{width:"48%"}} onClick={cancelListing}>Cancel Listing</button> :
                                                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal" style={{width:"48%"}}>Sell NFT</button> 
                                                }
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
                                                                <td style={{ backgroundColor:'#120124'}}>
                                                                    <div className="intro-button">
                                                                        <button type="submit" className="btn btn-primary" onClick={()=>acceptOffer(nft.id, index, obj.bidder)}>Accept</button>
                                                                    </div>
                                                                </td>
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
                                <h5 className="modal-title" id="exampleModalLabel">Sell NFT</h5>
                                <button type="button" class="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md mx-auto">
                                        <form className="justify-content-center" onSubmit={handleSubmit}>
                                            <div className="form-group">
                                                <label className="lottery-form-titles">Selling Price:</label>
                                                <input type="number" className="input-text-lottery" placeholder="Enter Selling Price" step=".0000000001" onChange={(e) => setSellPrice(e.target.value)}/>
                                            </div>
                                            
                                            <div className="form-group text-center">
                                                <div className="staking-button">
                                                    <div className="intro-button">
                                                        <button type="submit" className="btn btn-primary field-title" style={{width:'40%'}}>Sell Now</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>   
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
    )
}
export default SellNFT;
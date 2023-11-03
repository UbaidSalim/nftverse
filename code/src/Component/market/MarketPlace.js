import React from "react";
import { NavLink } from "react-router-dom";
import Username from "../navbar/Username";
import { useStore } from "../../context/GlobalState";
import { useEffect, useState } from "react";
import { getNFTs } from "../../store/asyncActions";
import swal from 'sweetalert';


function MarketPlace(){
    const [{network, contract}] = useStore();
    const[displayNetwork, setNetwork] = useState("");

    const [nfts, setNFTs] = useState([]);
    const [saleType, setSaleType] = useState(0);
    const [price, setPrice] = useState({min: 0, max: 0});
    const [name, setName] = useState("")

    useEffect(() => {
        (async() => {
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

            let data = await getNFTs();
            data = data.filter(obj => (obj.network === network));
            console.log(data);
            setNFTs(data);
        })()
    },[network]);


    const onSaleType = async (saleType) => {
        setSaleType(saleType);
        let data = await getNFTs();
        if(saleType != 0){
            data = data.filter(obj => (obj.saleType === saleType && obj.network === network));
            setNFTs(data);
            console.log(data)
        }
        else{
            data = data.filter(obj => (obj.network === network));
            setNFTs(data);
        }
    }

    const onSalePrice = async (e) => {
        e.preventDefault();
        if(price.max === 0){
            swal({text: "Max price must be greater than 0", icon: "error", className: "sweat-bg-color"});
        }
        if(price.max < price.min){
            swal({text: "Max price must be greater than Min Price", icon: "error", className: "sweat-bg-color"});
        }
        
        let data = await getNFTs();
        let arr= [];
        await Promise.all(data.map(async obj => {    
            let sellPrice = await contract.methods.viewListing(obj.id).call();
            sellPrice = sellPrice / 10 ** 18;
            if(obj.network === network){
                if(sellPrice >= price.min && sellPrice <= price.max){
                    arr.push(obj);
                }
            }
        }));
        setNFTs(arr)
        console.log(arr)
    }

    const searchOnName = async (e) => {
        e.preventDefault();
        let data = await getNFTs();
        data = data.filter(obj => (obj.name === name && obj.network === network));
        setNFTs(data);
    } 
    
    return(
        // <div className="Theme_ui">
            <div className="Create-Collection-section row">
                <div className="collection-section-background row">
                    {/* <div className="nav-section-blur row"></div> */}
                    <div className="my-assets-container">
                        <div className="Container">
                            <div className="row">
                                <div className="myassets-Title row">
                                    <Username/>
                                    <h1 className="my-assets-head d-flex justify-content-center">MarketPlace</h1>
                                </div>

                                <div className="nftContainer">
                                    <div className="row">
                                        <div className="col-md-4">
                                            <form className="form-inline">
                                                <div className="row justify-content-center">
                                                    <div className="col-md-6 mx-sm-3 mb-2">
                                                        <label for="inputPassword2" className="sr-only">Select Network from Metamask</label>
                                                        <input type="text" readOnly value={displayNetwork} className="form-control" style={{width: "100%"}}/>
                                                    </div>                                
                                                </div>
                                            </form>
                                        </div>
                                      <div className="col-md-4">
                                            <form className="form-inline">
                                                <div className="row justify-content-center">
                                                    <div className="col-md-6 mx-sm-3 mb-2">
                                                    <label for="inputPassword2" className="sr-only">Select Type</label>
                                                    <select class="form-select" aria-label="Default select example" onChange={(e) => onSaleType(Number(e.target.value))}>
                                                        <option value="0">All</option>
                                                        <option value="1">Newly Created</option>
                                                        <option value="2">On Sale</option>
                                                    </select>
                                                    </div>
                                                    {/* <div className="col-md-2" style={{marginTop:"4.5%"}}>
                                                        <div className="intro-button">
                                                           <button type="submit" className="btn btn-primary mb-2">Confirm</button>
                                                        </div>
                                                    </div> */}
                                                    
                                                </div>
                                            </form>
                                      </div>
                                      { saleType === 2 ? 
                                            <div className="col-md-4">
                                                <form className="form-inline" onSubmit={onSalePrice}>
                                                    <div className="row justify-content-center">
                                                        <div className="form-group mx-sm-3 mb-2 col-md-2">
                                                            <label for="inputPassword2" className="sr-only">Min</label>
                                                            <input type="text" className="form-control" onChange={(e) => setPrice({...price, min: Number(e.target.value)})}/>
                                                        </div>
                                                        <div className="form-group mx-sm-3 mb-2 col-md-2">
                                                            <label for="inputPassword2" className="sr-only">Max</label>
                                                            <input type="text" className="form-control" onChange={(e) => setPrice({...price, max: Number(e.target.value)})}/>
                                                        </div>
                                                        <div className="col-md-2" style={{marginTop:"4.5%"}}>
                                                            <div className="intro-button">
                                                            <button type="submit" className="btn btn-primary mb-2">Confirm</button>
                                                            </div>
                                                        </div>
                                                        
                                                    </div>
                                                </form>
                                            </div> : null }
                                            <div className="col-md-12">
                                                <br/>
                                                <form className="form-inline" onSubmit={searchOnName}>
                                                    <div className="row justify-content-center">
                                                        <div className="col-md-9">
                                                            <div className="form-group mx-sm-4 mb-2">
                                                                <input type="text" className="form-control" id="inputPassword2" placeholder="Search by NFT Name" onChange={(e)=>{setName(e.target.value)}}/>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <div className="intro-button">
                                                               <button type="submit" className="btn btn-primary mb-2" style={{width:"85%"}}>Search</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                       </div>
                                    <div className="row">
                                        {
                                            nfts.length > 0 ?
                                            nfts.map(obj => (
                                                    <div className="col-sm-3">
                                                        <div className="my-assets-field">
                                                            <img className="my-assets-images" src={obj.image} alt ="" style={{marginLeft: "0%"}}/>
                                                            <div className="my-assets-Title">
                                                                <span>{obj.name}</span>
                                                                <div className="intro-button" style={{marginTop:"-6%"}}><button className="btn btn-sm float-end"><a className="nav-link" href={`/ViewDetails?details=${JSON.stringify(obj)}`}>Expand Item</a></button></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            : <div className="col-md-12 text-center" style={{marginTop: "5%"}}><h4> no NFT data available!!!</h4></div>
                                        }
                                        
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

export default MarketPlace;
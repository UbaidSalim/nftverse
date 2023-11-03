import React, {useState, useEffect} from "react";
import { useStore } from "../../context/GlobalState";
import Username from "../navbar/Username";
import { StakeNFT, UnstakeNFT, ClaimReward } from "../../store/asyncActions";
import swal from "sweetalert";

function Staking(){
    const [{user_data, accounts ,network, contract, staking_contract}] = useStore();
    const [unStackedNfts, setUnStackedNfts] = useState([]);
    const [stackedNfts, setStackedNfts] = useState([]);
    const [userStacked, setUserStacked] = useState(0);

    const [selected, setSelected] = useState({});

    const[state, setState] = useState(false);

    useEffect(() => {
        setSelected({});
        setUnStackedNfts([]);
        setStackedNfts([]);
        setUserStacked(0);
        if(JSON.stringify(user_data) !== '{}'){
            if(user_data.nfts.length > 0){
                const filteredData = user_data.nfts.filter(obj => (obj.network === network));
                let _unStackedNfts = [];
                let _stackedNfts = [];
                (async() => {
                    await Promise.all(
                        filteredData.map(async (obj) => {
                          const getStackDetail = await staking_contract.methods.getStakingData(user_data.wallet_address, obj.id).call();
                          if (getStackDetail.isStaked === false) {
                            _unStackedNfts.push(obj);
                          }
                          else if(getStackDetail.isStaked === true){
                            _stackedNfts.push({id: obj.id, name: obj.name, image: obj.image, stakeType: getStackDetail.stakeType, earn_reward: 0, stake_start: getStackDetail.stakeTime, stake_end: getStackDetail.stakeDuration})
                          }
                        })
                    );
                    setUnStackedNfts(_unStackedNfts)
                    setStackedNfts(_stackedNfts);
                    const _userStacked = await staking_contract.methods.userStakedNFTs(user_data.wallet_address).call();
                    setUserStacked(_userStacked);

                    if(_stackedNfts.length > 0){
                        const updatedStackedNfts = await Promise.all(_stackedNfts.map(async (obj) => {
                            let earn_reward = await staking_contract.methods.calculateReward(user_data.wallet_address, obj.id).call();
                            earn_reward /= 10**18;
                            return { ...obj, earn_reward: earn_reward === 0 ? earn_reward : earn_reward.toFixed(6) };
                        }));
                        setStackedNfts(updatedStackedNfts);
                    }
                })();
            }
        }
    },[user_data, network, state]);
    

    const stakeNFT = async (e) => {
        e.preventDefault();
        console.log(selected);

        const userNfts = await contract.methods.balanceOf(user_data.wallet_address).call();
        const owner = await contract.methods.ownerOf(selected.id).call();
        console.log(owner)
        const getStackDetail = await staking_contract.methods.getStakingData(user_data.wallet_address, selected.id).call();

        if(user_data.wallet_address !== accounts[0]){
            swal({text: "Please Connect with correct Wallet", icon: "warning", className: "sweat-bg-color"});
        }
        else if(owner !== user_data.wallet_address){
            swal({text: "You are not an owner of this NFT", icon: "warning", className: "sweat-bg-color"});
        }
        else if(userNfts <= 0){
            swal({text: "You have not any NFT for Staking", icon: "warning", className: "sweat-bg-color"});
        }
        else if(getStackDetail.isStaked === true){
            swal({text: "This NFT is already Stacked", icon: "warning", className: "sweat-bg-color"});
        }
        else{
            try {  
                const newTransaction = {
                    token_id: selected.id,
                    stakeType: selected.stakeType
                }
                const transaction = await StakeNFT( contract, staking_contract, accounts, newTransaction);
                if(transaction.status == true){
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
                    await swal({text: "NFT Stacked Successfully", icon: "success", content: el, className: "sweat-bg-color"});
                    setState(!state);
                }
            }catch (error){
                console.log("error trax = ",error); 
                swal({text: error.message, icon: "error", className: "sweat-bg-color"});
            }
        }
    }

    const unStakeNFT = async (token_id) => {
        console.log(token_id);

        const user_nfts = await staking_contract.methods.userStakedNFTs(user_data.wallet_address).call();
        const getStackDetail = await staking_contract.methods.getStakingData(user_data.wallet_address, token_id).call();

        if(user_data.wallet_address !== accounts[0]){
            swal({text: "Please Connect with correct Wallet", icon: "warning", className: "sweat-bg-color"});
        }
        else if(user_nfts <= 0){
            swal({text: "You have not stake any NFT", icon: "warning", className: "sweat-bg-color"});
        }
        else if(getStackDetail.isStaked === false){
            swal({text: "This NFT is not Stacked", icon: "warning", className: "sweat-bg-color"});
        }
        else{
            try {  
                const newTransaction = {
                    token_id: token_id,
                }
                const transaction = await UnstakeNFT(staking_contract, accounts, newTransaction);
                if(transaction.status == true){
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
                    await swal({text: "NFT Unstacked Successfully", icon: "success", content: el, className: "sweat-bg-color"});
                    setState(!state);
                }
            }catch (error){
                console.log("error trax = ",error); 
                swal({text: error.message, icon: "error", className: "sweat-bg-color"});
            }
        }
    }

    const claimReward = async (token_id) => {
        console.log(token_id);

        const user_nfts = await staking_contract.methods.userStakedNFTs(user_data.wallet_address).call();
        const getStackDetail = await staking_contract.methods.getStakingData(user_data.wallet_address, token_id).call();

        if(user_data.wallet_address !== accounts[0]){
            swal({text: "Please Connect with correct Wallet", icon: "warning", className: "sweat-bg-color"});
        }
        else if(Date.now() < (getStackDetail.stakeDuration * 1000)){
            swal({text: "Cannot claim Reward before time completion", icon: "warning", className: "sweat-bg-color"});   
        }
        else if(user_nfts <= 0){
            swal({text: "You have not stake any NFT", icon: "warning", className: "sweat-bg-color"});
        }
        else if(getStackDetail.isStaked === false){
            swal({text: "This NFT is not Stacked", icon: "warning", className: "sweat-bg-color"});
        }
        else{
            const aa = await contract.methods.ownerOf(token_id).call();
            console.log(aa)
            try {  
                const newTransaction = {
                    token_id: token_id,
                }
                const transaction = await ClaimReward(staking_contract, accounts, newTransaction);
                if(transaction.status == true){
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
                    await swal({text: "NFT Unstacked Successfully", icon: "success", content: el, className: "sweat-bg-color"});
                    setState(!state);
                }
            }catch (error){
                console.log("error trax = ",error); 
                swal({text: error.message, icon: "error", className: "sweat-bg-color"});
            }
        }
    }
   
    return(
        <div className="section-one row">
            <div className="staking-section-background row">
                <div className="row staking-head">
                    <Username/>
                    <div className="col-sm-8"><h1 className="staking-h1">Staking</h1></div>
                    <div className="col-sm-4">
                        <div className="staking-button d-flex justify-content-center">
                            <button type="submit" className="btn btn-primary staking-field-title"  data-bs-toggle="modal" data-bs-target="#exampleModal" >Stake Your NFT</button>
                        </div>
                    </div>
                </div> 
                <div className="row">
                    <div className="col-sm pl-6">
                        <h3>Your Staked NFT</h3>
                    </div>
                    <div className="stake-stats">
                        <table class="table table-striped table-dark">
                            <tbody>
                                <tr>
                                    <th scope="row"> Total Staked: {userStacked}</th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="stake-stats">
                        <table class="table table-striped table-dark">
                            <thead>
                                <tr>
                                    <th className="text-center" scope="col">NFTs </th>
                                    <th className="text-center" scope="col">Time Period</th>
                                    <th className="text-center" scope="col">Stake Start</th>
                                    <th className="text-center" scope="col">Stake End</th>
                                    <th className="text-center" scope="col">Reward Earn</th>
                                    <th className="text-center" scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    stackedNfts.map(obj => (
                                        <tr>
                                            <td className="text-center  pt-1h"><img src={obj.image} width="60" height="50"/> {obj.name}</td>
                                            <td className="text-center  pt-1h">{obj.stakeType === "1" ? "Weekly" : obj.stakeType === "2" ? "Monthly" : "Quarterly"}</td>
                                            <td className="text-center  pt-1h">{new Date(obj.stake_start * 1000).toLocaleString()}</td>
                                            <td className="text-center  pt-1h">{new Date(obj.stake_end * 1000).toLocaleString()}</td>
                                            <td className="text-center  pt-1h">{obj.earn_reward} ETH</td>
                                            <td className="text-center pt-1h"> 
                                                {
                                                    Date.now() >= (obj.stake_end * 1000) ?
                                                    <button type="submit" className="btn btn-primary stake-setting-btn"  data-bs-toggle="modal" data-bs-target="#exampleModal1" onClick={()=>claimReward(obj.id)}>Claim Reward</button> 
                                                    : <button type="submit" className="btn btn-primary stake-setting-btn"  data-bs-toggle="modal" data-bs-target="#exampleModal1" onClick={()=>unStakeNFT(obj.id)}>Unstake NFT</button> 
                                                     
                                                }
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div className="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Staking NFT</h5>
                            <button type="button" className="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-9 mx-auto">
                                    <form className="justify-content-center" onSubmit={stakeNFT}>
                                            <span>
                                                <h5 className="modal-title pt-5 pb-5 ">Select NFT</h5>
                                            </span>
                                            <div className="dropdown">
                                                    <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false" style={{width: '100%', background: 'rgba(218,20,205,1)' }}>
                                                        {
                                                            selected.name ? selected.name : "Select your NFT from menu"
                                                        }
                                                    </button>
                                                <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton2" style={{backgroundColor: 'black', width: '100%'}}>
                                                    {
                                                        unStackedNfts.map(obj => (
                                                            <li><a className="dropdown-item" href="javascript:void(0);" onClick={()=>setSelected({...selected, id: obj.id, name: obj.name})}><img src={obj.image} width="40px"/> {obj.name}</a></li>
                                                        ))
                                                    }
                                                </ul>
                                            </div>        
                                        <span>
                                            <h5 className="modal-title pt-5 pb-5 ">Time Period</h5>
                                        </span>
                                        <div className="row time-period">
                                            <div className="col-sm">
                                                <div className="form-check form-check-inline">
                                                    <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" onClick={()=>setSelected({...selected, stakeType: 1})}/>
                                                    <label className="form-check-label" for="inlineRadio1">Weekly</label>
                                                </div>
                                            </div>
                                            <div className="col-sm">
                                                <div className="form-check form-check-inline">
                                                    <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" onClick={()=>setSelected({...selected, stakeType: 2})}/>
                                                    <label className="form-check-label" for="inlineRadio1">Monthly</label>
                                                </div>
                                            </div>
                                            <div className="col-sm">
                                                <div className="form-check form-check-inline">
                                                    <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio3" onClick={()=>setSelected({...selected, stakeType: 3})}/>
                                                    <label className="form-check-label" for="inlineRadio1">Quarterly</label>
                                                </div>
                                            </div>
                                        </div>                                     
                                        <div className="form-group text-center">
                                            <br/>
                                            <div className="staking-button">
                                                <button type="submit" className="btn btn-primary field-title" style={{width:'40%'}}>Stake Now</button>
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
    )

}

export default Staking;
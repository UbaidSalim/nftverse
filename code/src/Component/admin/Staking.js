
import React,{useState, useEffect} from "react";
import Username from "./Username"
import { useStore } from "../../context/GlobalState";
import { NFTVERSE_STAKING_POLYGON_ADDRESS } from "../../contract/NFTVERSE_STAKING";
import { AddFundInStacking } from "../../store/asyncActions";
import { getNFTs } from "../../store/asyncActions";
import swal from "sweetalert";

export default function Staking(){

    const [{web3, staking_contract, nftverse_wallet, accounts, network}, dispatch] = useStore()
    
    const [totalStaked, setTotalStaked] = useState(0);
    const [contractBalance, setContractBalance] = useState(0);

    const[ethAmount, setEthAmount] = useState(0);
    const[fundAdded, setFundAdded] = useState(false);

    const [stackedNfts, setStackedNfts] = useState([]);

    useEffect(()=>{
        setTotalStaked(0);
        if(network === 5 || network === 80001 || network === 97){
            (async() => {
                const _totalStaked = await staking_contract.methods.totalStacked().call();
                setTotalStaked(_totalStaked);
                const _contractBalance = await web3.eth.getBalance(staking_contract.options.address);
                setContractBalance(_contractBalance);

                let _stackedNfts = [];
                let data = await getNFTs();
                await Promise.all(data.filter(obj => (obj.network === network)).map(async(obj) => {
                    const stackeWallet = await staking_contract.methods.stakeWallet(obj.id).call();
                    if(!(/^0x0+$/.test(stackeWallet))){
                        const stacking_details = await staking_contract.methods.getStakingData(stackeWallet, obj.id).call();
                        _stackedNfts.push({id: obj.id, name: obj.name, image: obj.image, stackeWallet: stackeWallet, stakeType: stacking_details.stakeType, earn_reward: 0, stake_start: stacking_details.stakeTime, stake_end: stacking_details.stakeDuration});      
                    }
                }));
                if(_stackedNfts.length > 0){
                    const updatedStackedNfts = await Promise.all(_stackedNfts.map(async (obj) => {
                        let earn_reward = await staking_contract.methods.calculateReward(obj.stackeWallet, obj.id).call();
                        earn_reward /= 10**18;
                        return { ...obj, earn_reward: earn_reward === 0 ? earn_reward : earn_reward.toFixed(6) };
                    }));
                    setStackedNfts(updatedStackedNfts);
                }
            })()
        }
    },[network, fundAdded])


    const addFund = async (e) => {
        e.preventDefault();
        
        let admin_balance = await web3.eth.getBalance(accounts[0]);
        admin_balance /= 10 ** 18;
        
        if(nftverse_wallet !== accounts[0]){
            swal({text: "Not Connected to NFTVERSE Wallet", icon: "warning", className: "sweat-bg-color"});
        }
        else if(admin_balance < ethAmount){
            swal({text: "Account Balance is not Enough for Adding Fund in Contract", icon: "warning", className: "sweat-bg-color"});
        }
        else if(Number(ethAmount) <= 0){
            swal({text: "Input Amount should be greater than 0", icon: "warning", className: "sweat-bg-color"});
        }
        else{
            try {  
                const newTransaction = {
                    ethAmount: ethAmount,
                }
                const transaction = await AddFundInStacking(accounts, NFTVERSE_STAKING_POLYGON_ADDRESS, newTransaction);
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
                    await swal({text: "Fund Add in Contract Successfully", icon: "success", content: el, className: "sweat-bg-color"});
                    setFundAdded(!fundAdded);
                }
            }catch (error){
                console.log("error trax = ",error); 
                swal({text: error.message, icon: "error", className: "sweat-bg-color"});
            }
        }   
    }
    
    return(
        // <div className="Theme_ui">
            <div className="section-one row">
                <div className="lottery-section-background row">
                    <br/><br/><br/><br/><br/>
                    <div className="row">
                        <Username/>
                        <h1 className="lottery-h1">Staking</h1>
                        {/* <span className="lottery-section-heading">
                            <h3>Overview</h3>
                        </span> */}
                        <div className="col-sm pl-6">
                            <h3>Overview</h3>
                        </div>
                        <div className="lottery-final-stats">
                            <table class="table table-striped table-dark">
                                <thead>
                                    <tr>
                                        <th className="text-center" scope="col">Total Stacked NFTs</th>
                                        <th className="text-center" scope="col">Contract Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="text-center">{totalStaked}</td>
                                        <td className="text-center">
                                            <span>{contractBalance / 10**18} ETH</span>
                                            &nbsp;&nbsp;
                                            <span className="intro-button"><button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">Add Fund</button></span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="row">
                    {/* <span className="lottery-section-heading">
                        <h3>Overview</h3>
                    </span> */}
                    <div className="col-sm pl-6">
                        <br/><br/>
                        <h3>Staked NFT</h3>
                    </div>
                    {/* <div className="col-sm text-center pr-6 pb-3">
                        <button type="submit" className="btn btn-primary lottery-modal-btn"  data-bs-toggle="modal" data-bs-target="#exampleModal" >Create Lottery</button>
                    </div> */}
                    <div className="stake-stats">
                        <table class="table table-striped table-dark">
                            <thead>
                                <tr>
                                    <th className="text-center" scope="col">NFTs </th>
                                    <th className="text-center" scope="col">Stake Wallet</th>
                                    <th className="text-center" scope="col">Time Period</th>
                                    <th className="text-center" scope="col">Stake Start</th>
                                    <th className="text-center" scope="col">Stake End</th>
                                    <th className="text-center" scope="col">Reward Earn</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    stackedNfts.map(obj => (
                                        <tr>
                                            <td className="text-center  pt-1h"><img src={obj.image} width="60" height="50"/> {obj.name}</td>
                                            <td className="text-center  pt-1h">{obj.stackeWallet.slice(0, 5)+".................."+obj.stackeWallet.slice(37, 42)}</td>
                                            <td className="text-center  pt-1h">{obj.stakeType === "1" ? "Weekly" : obj.stakeType === "2" ? "Monthly" : "Quarterly"}</td>
                                            <td className="text-center  pt-1h">{new Date(obj.stake_start * 1000).toLocaleString()}</td>
                                            <td className="text-center  pt-1h">{new Date(obj.stake_end * 1000).toLocaleString()}</td>
                                            <td className="text-center  pt-1h">{obj.earn_reward} ETH</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                    </div>
                </div>

                <div className="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Add Fund In Contract</h5>
                                <button type="button" class="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md mx-auto">
                                        <form className="justify-content-center" onSubmit={addFund}>
                                            <div className="form-group">
                                                <label className="lottery-form-titles">ETH Amount:</label>
                                                <input type="text" className="input-text-lottery" placeholder="Enter ETH Amount" required onChange={(e)=>setEthAmount(e.target.value)}/>
                                            </div>
                                            <div className="form-group text-center">
                                                <div className="staking-button">
                                                    <div className="intro-button">
                                                        <button type="submit" className="btn btn-primary field-title" style={{width:'40%'}}>Add Fund</button>
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
    )
}
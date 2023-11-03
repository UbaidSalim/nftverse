import React, { useEffect, useState } from "react";
import Username from "../navbar/Username";
import { useStore } from "../../context/GlobalState";
import { Participate } from "../../store/asyncActions";
import swal from "sweetalert";

function Lottery(){

    const [{web3, lottery_contract, contract, accounts, network, user_data}, dispatch] = useStore();
    
    const [runningLottery, setRunningLottery] = useState([]);
    const [completedLottery, setCompletedLottery] = useState([]);

    const [lotteryTabs, setLotteryTabs] = useState(1);

    const [participated, setParticipated] = useState(false);


    useEffect(()=>{
        setRunningLottery([]);
        setCompletedLottery([])
        if(network === 5 || network === 80001 || network === 97){
            (async() => {
                const _totalLottery = await lottery_contract.methods.lotteryID().call();
                
                for(let id=1; id<=_totalLottery; id++){
                    const _lotteryDetails = await lottery_contract.methods.lotteryDetails(id).call();
                    if(_lotteryDetails.status === "1"){
                        const registeredUser = await lottery_contract.methods.getParticipants(id).call();
                        const newItem = {id: id, title: _lotteryDetails.title, threshold: _lotteryDetails.threshold, winners: _lotteryDetails.numOfWinners, status: _lotteryDetails.status, registered_users: registeredUser.length, participants: registeredUser};
                        setRunningLottery((prevArray) => [...prevArray, newItem]);
                    }
                    else if(_lotteryDetails.status === "2"){
                        const winnerUser = await lottery_contract.methods.getWinners(id).call();
                        const newItem = {title: _lotteryDetails.title, threshold: _lotteryDetails.threshold, winners: _lotteryDetails.numOfWinners, status: _lotteryDetails.status, winner_address: winnerUser};
                        setCompletedLottery((prevArray) => [...prevArray, newItem]);
                    }
                }
            })()
        }
    },[network, participated])

    const participate = async (id) => {
        const _lotteryDetails = await lottery_contract.methods.lotteryDetails(id).call();
        const nftBalance = await contract.methods.balanceOf(user_data.wallet_address).call();
        const alreadyRegistered = await lottery_contract.methods.registeredParticipants(id, user_data.wallet_address).call();
        
        if(_lotteryDetails.status !== "1"){
            swal({text: "Lottery ID is not Initialized", icon: "warning", className: "sweat-bg-color"});
        }
        else if(user_data.wallet_address !== accounts[0]){
            swal({text: "Please Connect with correct Wallet", icon: "warning", className: "sweat-bg-color"});
        }
        else if(Number(nftBalance) <= 0){
            swal({text: "You have no NFTs to participate", icon: "warning", className: "sweat-bg-color"});
        }
        else if(alreadyRegistered === true){
            swal({text: "Wallet is already Registered in Lottery", icon: "warning", className: "sweat-bg-color"});
        }
        else{
            try {  
                const newTransaction = {
                    id: id,
                }
                const transaction = await Participate(lottery_contract, accounts, newTransaction);
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
                    await swal({text: "Lottery Created Successfully", icon: "success", content: el, className: "sweat-bg-color"});
                    setParticipated(!participated);
                }
            }catch (error){
                console.log("error trax = ",error); 
                swal({text: error.message, icon: "error", className: "sweat-bg-color"});
            }
        }
    }

    const [_displayCompletedUsers, _setDisplayCompletedUsers] = useState(null);
    const displayCompletedUsers = (data) => {
        _setDisplayCompletedUsers(data.map(values => values).join('\n'));
    }

    const checkParticpated = async (id, address) => {
        const aa = await lottery_contract.methods.registeredParticipants(id, address).call();
        return aa;
    }

    return(
        // <div className="Theme_ui">
            <div className="section-one row">
                <div className="lottery-section-background row">
                    <div className="row">
                        <div className="mt-15">
                            <Username/>
                        </div>
                    
                        <h1 className="lottery-h1">Lottery</h1>
                        {/* <span className="lottery-section-heading">
                            <h3>Overview</h3>
                        </span> */}
                        <div className="lottery-short-stats mt-6">
                            <div className="container">
                                <div className="row">
                                    <div className="col-sm d-flex justify-content-end">
                                        <button className="btn-stats-show" onClick={()=>setLotteryTabs(1)}>Running</button>
                                    </div>
                                    <div className="col-sm">
                                        <button className="btn-stats-show" onClick={()=>setLotteryTabs(2)}>Completed</button>
                                    </div>
                                </div>
                            </div>
                            <div className="row short-stats-table">
                                {
                                    lotteryTabs === 1 ? 
                                    runningLottery.length > 0 ?
                                    <table class="table table-striped table-dark">
                                        <thead>
                                            <tr>
                                                <th className="text-center" scope="col">Title</th>
                                                <th className="text-center" scope="col">Threshold</th>
                                                <th className="text-center" scope="col">Total Winners</th>
                                                <th className="text-center" scope="col">Registered Users</th>
                                                <th className="text-center" scope="col">Participate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                              runningLottery.map((data) => {
                                                const wallet = data.participants.includes(user_data.wallet_address);
                                                return <tr>    
                                                    <td className="text-center pt-1h">{data.title}</td>
                                                    <td className="text-center pt-1h">{data.threshold}</td>
                                                    <td className="text-center pt-1h">{data.winners}</td>
                                                    <td className="text-center pt-1h">{data.registered_users}</td>
                                                    {
                                                        wallet === true ? 
                                                        <td className="text-center pt-1h"><b style={{color: "rgba(218,20,205,1)"}}>Participated</b></td>
                                                         :
                                                        <td className="text-center pt-1h"> 
                                                        <button type="submit" className="btn btn-primary lottery-modal-btn" onClick={()=>participate(data.id)}>Participate</button> 
                                                        </td>
                                                    }
                                                </tr>   
                                                })   
                                            }
                                        </tbody>
                                    </table>
                                    : <h5 className="text-center"><b>No Lottery Running yet</b></h5>
                                    :
                                    completedLottery.length > 0 ?
                                    <table class="table table-striped table-dark">
                                        <thead>
                                            <tr>
                                                <th className="text-center" scope="col">Title</th>
                                                <th className="text-center" scope="col">Threshold</th>
                                                <th className="text-center" scope="col">Total Winners</th>
                                                <th className="text-center" scope="col">Show Winners</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                completedLottery.map(data => (
                                                    <tr>
                                                        <td className="text-center pt-1h">{data.title}</td>
                                                        <td className="text-center pt-1h">{data.threshold}</td>
                                                        <td className="text-center pt-1h">{data.winners}</td>
                                                        <td className="text-center pt-1h"> 
                                                            <button type="submit" className="btn btn-primary lottery-modal-btn"  data-bs-toggle="modal" data-bs-target="#exampleModal1" onClick={()=> displayCompletedUsers(data.winner_address)}>View Winners</button> 
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                    : <h5 className="text-center"><b>No Lottery Completed yet</b></h5>
                                }
                                
                            </div>
                        </div>
                    </div>
                    <div className="modal fade" id="exampleModal1" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLabel">Winners</h5>
                                    <button type="button" class="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md mx-auto">
                                            <textarea className="show-lottery-user" value={_displayCompletedUsers} disabled></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div> 
                    </div>
                </div>
                </div>
            </div>

    )}

export default Lottery;
import React, { useEffect, useState } from "react";
import { useStore } from "../../context/GlobalState";
import { CreateLottery } from "../../store/asyncActions";
import swal from "sweetalert";
import Username from "./Username";

function Lottery(){
    const [{web3, lottery_contract, nftverse_wallet, accounts, network}, dispatch] = useStore();

    const [totalLottery, setTotalLottery] = useState(0);
    const [totalRunning, setTotalRunning] = useState(0);
    const [totalCompleted, setTotalCompleted] = useState(0);
    
    const [runningLottery, setRunningLottery] = useState([]);
    const [completedLottery, setCompletedLottery] = useState([]);

    const [lotteryTabs, setLotteryTabs] = useState(1);

    const [initialValues, setInitialValues] = useState({title: "", threshold: 0, winners: 0})

    const [lotteryCreated, setLotteryCreated] = useState(false)
    
    useEffect(()=>{
        setTotalRunning(0)
        setTotalCompleted(0)
        setRunningLottery([])
        setCompletedLottery([])
        if(network === 5 || network === 80001 || network === 97){
            (async() => {
                const _totalLottery = await lottery_contract.methods.lotteryID().call();
                setTotalLottery(_totalLottery);

                for(let id=1; id<=_totalLottery; id++){
                    const _lotteryDetails = await lottery_contract.methods.lotteryDetails(id).call();
                    if(_lotteryDetails.status === "1"){
                        setTotalRunning((prevCount) => prevCount + 1);
                        const registeredUser = await lottery_contract.methods.getParticipants(id).call();
                        const newItem = {title: _lotteryDetails.title, threshold: _lotteryDetails.threshold, winners: _lotteryDetails.numOfWinners, status: _lotteryDetails.status, registered_users: registeredUser.length, participants: registeredUser};
                        setRunningLottery((prevArray) => [...prevArray, newItem]);
                    }
                    else if(_lotteryDetails.status === "2"){
                        setTotalCompleted((prevCount) => prevCount + 1);
                        const winnerUser = await lottery_contract.methods.getWinners(id).call();
                        const newItem = {title: _lotteryDetails.title, threshold: _lotteryDetails.threshold, winners: _lotteryDetails.numOfWinners, status: _lotteryDetails.status, winner_address: winnerUser};
                        setCompletedLottery((prevArray) => [...prevArray, newItem]);
                    }
                } 
            })()
        }
    },[network, lotteryCreated])

    const createLottery = async (e) => {
        e.preventDefault();
        
        let lottery_id = await lottery_contract.methods.lotteryID().call();
        lottery_id++;
        const lotteryDetails = await lottery_contract.methods.lotteryDetails(lottery_id).call();
        
        if(nftverse_wallet !== accounts[0]){
            swal({text: "Not Connected to NFTVERSE Wallet", icon: "warning", className: "sweat-bg-color"});
        }
        else if(lotteryDetails.status !== "0"){
            swal({text: "Lottery ID is already Initialized", icon: "warning", className: "sweat-bg-color"});
        }
        else{
            try {  
                const newTransaction = {
                    title: initialValues.title,
                    threshold: initialValues.threshold,
                    winners: initialValues.winners
                }
                const transaction = await CreateLottery(lottery_contract, accounts, newTransaction);
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
                    setLotteryCreated(!lotteryCreated)
                }
            }catch (error){
                console.log("error trax = ",error); 
                swal({text: error.message, icon: "error", className: "sweat-bg-color"});
            }
        }
    }

    const [_displayRegisterdUsers, _setDisplayRegisterdUsers] = useState(null);
    const displayRegisterdUsers = (data) => {
        _setDisplayRegisterdUsers(data.map(values => values).join('\n'));
    }

    const [_displayCompletedUsers, _setDisplayCompletedUsers] = useState(null);
    const displayCompletedUsers = (data) => {
        _setDisplayCompletedUsers(data.map(values => values).join('\n'));
    }

    return(
        // <div className="Theme_ui">
            <div className="section-one row">
                <div className="lottery-section-background row">
                    <br/><br/><br/><br/><br/>
                    <div className="row">
                        <Username/>
                        <h1 className="lottery-h1">Lottery</h1>
                        {/* <span className="lottery-section-heading">
                            <h3>Overview</h3>
                        </span> */}
                        <div className="col-sm pl-6">
                            <h3>Overview</h3>
                        </div>
                        <div className="col-sm text-center pr-6 pb-3">
                            <button type="submit" className="btn btn-primary lottery-modal-btn"  data-bs-toggle="modal" data-bs-target="#exampleModal" >Create Lottery</button>
                        </div>
                        <div className="lottery-final-stats">
                            <table class="table table-striped table-dark">
                                <thead>
                                    <tr>
                                        <th className="text-center" scope="col">Total Lottery</th>
                                        <th className="text-center" scope="col">Runing</th>
                                        <th className="text-center" scope="col">Completed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="text-center">{totalLottery}</td>
                                        <td className="text-center">{totalRunning}</td>
                                        <td className="text-center">{totalCompleted}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
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
                                                <th className="text-center" scope="col">Registered User</th>
                                                <th className="text-center" scope="col">Show Registered User</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                              runningLottery.map((data) => (
                                                <tr>    
                                                    <td className="text-center pt-1h">{data.title}</td>
                                                    <td className="text-center pt-1h">{data.threshold}</td>
                                                    <td className="text-center pt-1h">{data.winners}</td>
                                                    <td className="text-center pt-1h">{data.registered_users}</td>
                                                    <td className="text-center pt-1h"> 
                                                        <button type="submit" className="btn btn-primary lottery-modal-btn"  data-bs-toggle="modal" data-bs-target="#exampleModal1" onClick={()=>displayRegisterdUsers(data.participants)}>View Registered User</button> 
                                                    </td>
                                                </tr>   
                                              ))   
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
                                                            <button type="submit" className="btn btn-primary lottery-modal-btn"  data-bs-toggle="modal" data-bs-target="#exampleModal1" onClick={()=>displayCompletedUsers(data.winner_address)}>View Winners</button> 
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
                </div>

                <div className="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Create Lottery</h5>
                                <button type="button" class="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md mx-auto">
                                        <form className="justify-content-center" onSubmit={createLottery}>
                                            <div className="form-group">
                                                <label className="lottery-form-titles">Lottery Title:</label>
                                                <input type="text" className="input-text-lottery" placeholder="Enter Lottery Title" onChange={(e)=>setInitialValues({...initialValues, title: e.target.value})} required/>
                                            </div>
                                            <div className="form-group">
                                                <label className="lottery-form-titles">Threshold:</label>
                                                <input type="number" className="input-number-lottery" placeholder="Enter Threshold Amount" onChange={(e)=>setInitialValues({...initialValues, threshold: e.target.value})} required/>
                                            </div>
                                            <div className="form-group">
                                                <label className="lottery-form-titles">Total Winner:</label>
                                                <input type="number" className="input-number-lottery" placeholder="Enter Total Winner" onChange={(e)=>setInitialValues({...initialValues, winners: e.target.value})} required/>
                                            </div>
                                            <div className="form-group text-center">
                                                <br/>
                                                <div className="staking-button">
                                                    <div className="intro-button">
                                                        <button type="submit" className="btn btn-primary field-title" style={{width:'40%'}}>Create Lottery</button>
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


                <div className="modal fade" id="exampleModal1" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        {
                            lotteryTabs === 1 ? 
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLabel">Registered User</h5>
                                    <button type="button" class="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md mx-auto">
                                            <textarea className="show-lottery-user" value={_displayRegisterdUsers} disabled></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div> : 
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
                        }
                        
                    </div>
                </div>
            </div>

    )}

export default Lottery;
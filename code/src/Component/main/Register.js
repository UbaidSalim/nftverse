import firebaseDb from "../../firebase/config";
import Web3 from "web3";
import { useState, useEffect } from "react";
import { MD5 } from "crypto-js";
import { generateSecuriyCode } from "../../store/asyncActions";
import swal from 'sweetalert';


function Register() {

    const initialFieldValues = {
        wallet_address: '',
        username: '',
        email: '',
        password: '',
        nfts:[{id:'',name:'',image:'', description:'', network: '', attributes:[]}]
    }
    const [values, setValues] = useState(initialFieldValues);
    const [confirm_password, setConfirmPassword] = useState("");

    const securityCode = {
        code: '',
        confirmCode: '',
    }
    const [security, setSecurity] = useState(securityCode);


    function disableCopy(event) {
        event.preventDefault();
    }

    const [passwordVisible, setPasswordVisible] = useState({password: false, confirm_password: false});
    const togglePasswordVisibility = (value) => {
        if(value === 0){
            setPasswordVisible({...passwordVisible, password: !passwordVisible.password});
        }
        else{
            setPasswordVisible({...passwordVisible, confirm_password: !passwordVisible.confirm_password});
        }
    };

    useEffect(() => {
        let security_code = generateSecuriyCode();
        setSecurity({...security, code: security_code});
    },[])


    const addOrEdit = async (obj) => {   
        console.log('values ', obj);
        firebaseDb.child('users').push(
          obj,
          async err => {
            if (err){
                console.log(err)
            }
            else{
                await swal({text: "Registered Successfully", icon: "success"});
                window.location.href = '/Login'
            }      
        })
    }

    const connectWallet = async () => {
        const web3 = new Web3(Web3.givenProvider);
        await web3.givenProvider.enable();

        const accounts = await web3.eth.getAccounts();
        setValues({...values, wallet_address: accounts[0] })
    }


    const handleSubmit = (e) => {
        e.preventDefault();
    
        if(values.wallet_address === ""){
            swal({text: "Connect Your Wallet", icon: "warning"});
        }
        else if(values.password !== confirm_password){
            swal({text: "Password and Confirm Password does not matched", icon: "error"});
        }
        else if(security.code !== security.confirmCode){
            swal({text: "Incorrect Security Code", icon: "error", className: "sweat-bg-color"});
        }
        else{
            const encrypted = MD5(confirm_password).toString();
            console.log(`encrypted ${encrypted}`);
            values.password = encrypted;
            addOrEdit(values);
        }
    }

    return (
        // <div className="Theme_ui">
            <div className="Create-Collection-section row">
                <div className="collection-section-background row">
                    {/* <div className="nav-section-blur row"></div> */}
                    {/* <NavbarBeforeLogin/> */}
                    <div className="Registration-Container">
                            <div className="container">
                                <div className="Create-Collection-Title row text-center"> 
                                    <h1 className="Create-collection-head">Register Account</h1> 
                                </div>
                                    <div className="row">
                                        <div className="col-md-5 mx-auto">
                                        <form className="justify-content-center" onSubmit={e => handleSubmit(e)}>
                                            <div className="form-group">
                                                <div className="row">
                                                    <div className="col-sm-10">
                                                        <label className="field-title">Wallet Address</label>
                                                        <input type="text" className="input-register" placeholder="0x0000000000000000000000000000000000000" value={values.wallet_address} readOnly required/>
                                                    </div>
                                                    <div className="col-sm-2 register-connect-btn">
                                                        <div className="intro-button">
                                                            <button type="button" className="btn btn-primary" onClick={()=> connectWallet()}>Connect</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="field-title">UserName</label>
                                                <input type="text" className="input-register" placeholder="Enter UserName" onChange={(e)=> setValues({...values, username: e.target.value })} required/>
                                            </div>
                                            <div className="form-group">
                                                <label className="field-title">Email</label>
                                                <input type="email" className="input-register" placeholder="Enter Email Address" onChange={(e)=> setValues({...values, email: e.target.value })} required/>
                                            </div>
                                            <div className="form-group">
                                                <label className="field-title">Password</label>
                                                <div className="row field-password">
                                                    <div className="col-sm-11 w-90">
                                                        <input type={passwordVisible.password ? 'text' : 'password'} className="input-password" placeholder="Enter Password" onChange={(e)=> setValues({...values, password: e.target.value })} required/>
                                                    </div>
                                                    <div className="col-sm-1 w-10">
                                                        <button className="btn btn-outline-secondary" type="button" onClick={()=>togglePasswordVisibility(0)}> 
                                                            <i className={ passwordVisible.password ? "fa-sharp fa-regular fa-eye-slash" : "fa-sharp fa-regular fa-eye"}></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="field-title">Confirm Password</label>
                                                <div className="row field-password">
                                                    <div className="col-sm-11 w-90">
                                                        <input type={passwordVisible.confirm_password ? 'text' : 'password'} className="input-password" placeholder="Enter Confirm Password" onChange={(e)=> setConfirmPassword(e.target.value)} required/>
                                                    </div>
                                                    <div className="col-sm-1 w-10">
                                                        <button className="btn btn-outline-secondary" type="button" onClick={()=>togglePasswordVisibility(1)}>
                                                            <i className={ passwordVisible.confirm_password ? "fa-sharp fa-regular fa-eye-slash" : "fa-sharp fa-regular fa-eye"}></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <div className="row">
                                                    <label className="field-title">Captcha Code</label>
                                                    <div className="col-md-5" style={{marginRight:"8%"}}>
                                                    <input type="text" className="input-register" value={security.code} style={{fontFamily: "'Shadows Into Light', cursive", cursor: "not-allowed"}} readOnly onCopy={(e) => disableCopy(e)}/>
                                                    </div>
                                                    <div className="col-md-6">
                                                    <input type="text" className="input-register" placeholder="Enter Security Code" onChange={(e)=> setSecurity({...security, confirmCode: e.target.value })} required/>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group text-center">
                                                <br/>
                                                <div className="intro-button">
                                                    <button type="submit" className="btn btn-primary field-title" style={{width:'40%'}}>Register</button>
                                               </div>
                                            </div>
                                           
                                            
                                        </form>           
                                        </div>
                                    </div>
                                
                
                                
                            </div>
                        
                    </div>
                    
                </div>
            </div>
        // </div>
    )
}

export default Register;
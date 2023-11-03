import React from 'react';
import logo from '../../images/Group41.png';
import { useEffect, useState } from "react";
import { MD5 } from "crypto-js";
import { generateSecuriyCode } from "../../store/asyncActions";
import swal from 'sweetalert';

export default function Main(){
    // dotenv.config();

    const initialFieldValues = {
        username: '',
        password: '',
        securityCode: '',
        _securityCode: ''
    }
    const [values, setValues] = useState(initialFieldValues);

    const [passwordVisible, setPasswordVisible] = useState(false);
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };


    function disableCopy(event) {
        event.preventDefault();
    }

    useEffect(() => {
        let security_code = generateSecuriyCode();
        setValues({ ...values, securityCode: security_code });
    }, [])


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (values.securityCode !== values._securityCode) {
            swal({ text: "Incorrect Security Code", icon: "error", className: "sweat-bg-color" });
        }
        else {
            let success = false;
            const encrypted = MD5(values.password).toString(); 
            console.log(process.env.REACT_APP_ADMIN_PASSWORD)
            if(values.username === process.env.REACT_APP_ADMIN_USERNAME && encrypted === process.env.REACT_APP_ADMIN_PASSWORD){
                success = true;
                window.localStorage.setItem("admin_login_success", "true");
                await swal({ text: "Login Successfully", icon: "success", className: "sweat-bg-color" });
                window.location.href = '/admin';
            }
            
            if(success != true) {
                swal({ text: "Invalid Credentials", icon: "error" });
            }
        }
        
    }

    return (
        <div className="Theme_ui">
            <div className="nav-section row">
                <div className="nav-section-blur row"></div>
                <nav className="navbar navbar-expand-lg navbar-dark">
                    <div className="container-fluid">
                        <a className="navbar-brand" href="#"><img src={logo} width="250" height="50" /></a>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                    </div>
                </nav>
            </div>
            <div className="Create-Collection-section row">
                <div className="collection-section-background row">
                    <div className="Create-Collection-Container">
                        <div className="container">
                            <div className="Create-Collection-Title row text-center">
                                <h1 className="Create-collection-head">Admin Login</h1>
                            </div>
                            <div className="row">
                                <div className="col-md-5 mx-auto login-form">
                                    <form className="justify-content-center" onSubmit={(e) => handleSubmit(e)}>
                                        <div className="form-group">
                                            <label className="field-title">UserName</label>
                                            <input type="text" className="input-register" placeholder="Enter UserName or Email" onChange={(e) => setValues({ ...values, username: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="field-title">Password</label>
                                            <div className="row">
                                                <div className="row field-password">
                                                    <div className="col-sm-11 w-90">
                                                    <input type={passwordVisible ? 'text' : 'password'} className="input-password" placeholder="Enter Password" onChange={(e) => setValues({ ...values, password: e.target.value })} required />
                                                    </div>
                                                    <div className="col-sm-1 w-10">
                                                        <button className="btn btn-outline-secondary" type="button" onClick={togglePasswordVisibility}> 
                                                            <i className={ passwordVisible ? "fa-sharp fa-regular fa-eye-slash" : "fa-sharp fa-regular fa-eye"}></i>
                                                        </button>
                                                    </div>
                                                </div> 
                                                {/* <div className="col-md-1 eye-icon">
                                                    
                                                </div> */}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="row">
                                                <label className="field-title">Captcha Code</label>
                                                <div className="col-md-5" style={{ marginRight: "8%" }}>
                                                    <input type="text" className="input-register" value={values.securityCode} style={{ fontFamily: "'Shadows Into Light', cursive", cursor: "not-allowed" }} readOnly onCopy={(e) => disableCopy(e)} />
                                                </div>
                                                <div className="col-md-6">
                                                    <input type="text" className="input-register" placeholder="Enter Security Code" onChange={(e) => setValues({ ...values, _securityCode: e.target.value })} required />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group text-center">
                                            <br />
                                            <div className="intro-button">
                                                <button type="submit" className="btn btn-primary field-title" style={{ width: '40%' }}>Login</button>
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
import { useEffect, useState } from "react";
import firebaseDb from "../../firebase/config";
import { MD5 } from "crypto-js";
import { generateSecuriyCode } from "../../store/asyncActions";
import swal from 'sweetalert';


function Login() {

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


    const handleSubmit = (e) => {
        e.preventDefault();

        if (values.securityCode !== values._securityCode) {
            swal({ text: "Incorrect Security Code", icon: "error", className: "sweat-bg-color" });
        }
        else {
            firebaseDb.child('users').on('value', async snapshot => {
                if (snapshot.val() !== null) {
                    const users = snapshot.val();
                    console.log(users)
                    let success = false;
                    Object.keys(users).forEach(async (key) => {
                        if ((users[key].username === values.username || users[key].email === values.username)) {
                            const encrypted = MD5(values.password).toString();
                            if (users[key].password === encrypted) {
                                console.log(users)
                                success = true;
                                window.localStorage.setItem("login_success", "true");

                                window.localStorage.setItem("UUID", key);
                                await swal({ text: "Login Successfully", icon: "success", className: "sweat-bg-color" });
                                window.location.href = '/';
                            }
                        }
                    })
                    if (success != true) {
                        await swal({ text: "Invalid Credentials", icon: "error" });
                    }
                }
            })
        }

    }

    return (
        // <div className="Theme_ui">
        <div className="Create-Collection-section row">
            <div className="collection-section-background row">
                {/* <div className="nav-section-blur row"></div> */}
                {/* <NavbarBeforeLogin/> */}
                <div className="Create-Collection-Container">
                    <div className="container">
                        <div className="Create-Collection-Title row text-center">
                            <h1 className="Create-collection-head">Login Account</h1>
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
        // </div>
    )
}

export default Login;
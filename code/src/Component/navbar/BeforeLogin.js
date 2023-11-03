import logo from '../../images/Group41.png';
import Home from '../main/Home';
import Login from '../main/Login';
import Register from '../main/Register';
import { BrowserRouter as Router, Route, Routes, NavLink} from "react-router-dom";

export default function BeforeLogin(){
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
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">

                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item simple-link">
                                <a className="nav-link" href="/">Home</a>
                            </li>
                            
                            <li>
                                <a className="nav-link" href="/Login">Login </a>
                            </li>
                            <li>
                                <a className="nav-link" href="/Register">Register</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
        {
            
            <Routes>
                <Route path="/" element={<Home/>}></Route>
                <Route path="/Login" element={<Login/>}></Route>
                <Route path="/Register" element={<Register/>}></Route>
            </Routes>
            
        }
        </div>
        
    )
}
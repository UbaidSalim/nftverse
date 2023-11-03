import logo from '../../images/Group41.png';
import Lottery from './Lottery';
import Staking from './Staking';
import { BrowserRouter as Router, Route, Routes, NavLink} from "react-router-dom";


export default function AfterLogin(){

    const logout = () => {
        window.localStorage.removeItem('admin_login_success');
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
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">

                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li>
                                <a className="nav-link" href="/admin">Lottery </a>
                            </li>
                            <li>
                                <a className="nav-link" href="/admin/staking">Staking </a>
                            </li>
                            <li>
                                <a className="nav-link" href="/admin" onClick={logout}>Logout </a>
                            </li>        
                        </ul>

                    </div>
                </div>
            </nav>
        </div>
        {
            <Routes>
                <Route path="/" element={<Lottery/>}></Route>
                <Route path="/staking" element={<Staking/>}></Route>
            </Routes>
        }
        </div>
    )
}
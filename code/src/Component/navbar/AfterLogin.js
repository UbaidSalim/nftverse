import logo from '../../images/Group41.png';
import login from '../../images/Group3.png';
import MarketPlace from '../market/MarketPlace';
import MyProfile from '../profile/MyProfile';
import CreateNFT from '../createNFT/CreateNFT';
import BuyNFT from '../market/BuyNFT';
import SellNFT from '../profile/SellNFT';
import Lottery from '../lottery/Lottery';
import Stacking from '../stacking/Stacking';
import NftGenerator from '../artwork/NftGenerator';
import ClaimNFT from '../claimNFT/ClaimNFT';
import { BrowserRouter as Router, Route, Routes, NavLink} from "react-router-dom";


export default function AfterLogin(){

    const logout = () => {
        window.localStorage.removeItem('login_success');
        window.localStorage.removeItem('UUID');
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
                                <a className="nav-link" href="/MarketPlace">MarketPlace </a>
                            </li>
                            <li>
                                <a className="nav-link" href="/NftGenerator">NftGenerator </a>
                            </li>
                            <li>
                                <a className="nav-link" href="/ClaimNFT">Claim NFT </a>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <span className="icon-text">Utilities</span>
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <li><a className="dropdown-item" href="/Lottery">Lottery</a></li>
                                    <li><a className="dropdown-item" href="/Stacking">Staking</a></li>
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <img src={login} width="25" height="25" />
                                    <span className="icon-text">Profile</span>
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <li><a className="dropdown-item" href="/">My Profile</a></li>
                                    <li><a className="dropdown-item" href="/CreateNFT">Create NFT</a></li>
                                    <li><a className="dropdown-item" href="/" onClick={logout}>LogOut</a></li>
                                </ul>
                            </li>
                            
                            {/* <li className="nav-item icon-button">
                                <a className="nav-link" href="#"><img src={wallet} width="25" height="25" /><span className="icon-text">Connect</span></a>
                            </li> */}
                            
                        </ul>

                    </div>
                </div>
            </nav>
        </div>
        {
            <Routes>
                <Route path="/" element={<MyProfile/>}></Route>
                <Route path="/MarketPlace" element={<MarketPlace/>}></Route>
                <Route path="/CreateNFT" element={<CreateNFT/>}></Route>
                <Route path="/ClaimNFT" element={<ClaimNFT/>}></Route>
                <Route path="/ViewDetails" element={<BuyNFT/>}></Route>
                <Route path="/ViewProfileDetails" element={<SellNFT/>}></Route>
                <Route path="/Lottery" element={<Lottery/>}></Route>
                <Route path="/Stacking" element={<Stacking/>}></Route>
                <Route path="/NftGenerator" element={<NftGenerator/>}></Route>
            </Routes>
        }
        </div>
    )
}
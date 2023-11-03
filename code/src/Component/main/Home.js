import React from "react";
// import NavbarBeforeLogin from "./BeforeLogin";

function Home(){
    return(
        // <div className="Theme_ui">
        <div>
            <div className="section-one row">
                <div className="section-background row">
                    {/* <div className="nav-section-blur row"></div> */}
                        {/* <NavbarBeforeLogin/> */}
                        <div className="nftverse_concept col-lg-4">
                            <h1 className="intro-h1">Welcome To NFTVERSE</h1>
                            <div className="intro-text">The new way to become a millionaire, Your new asset is in the digital world-NFTs.</div>
                            {/* <div className="intro-button">
                                <button className="btn btn-md">BUY NFT</button>
                                <button className="btn btn-md">SEE NFT</button>
                            </div> */}
                        </div>
                    <div className="nftverse_concept_img col-md-12 mt-3 col-sm-12 col-lg-8">
                    </div>
                </div>
            </div>
            

            <div className="row stake-detail text-white">
                <div className="row mb-5" >
                    <h1 className="main-h1 text-center">We Provide Utility</h1>
                </div>
                    <hr/>
                        <h3 className="text-center main-sub-heading">Staking</h3>
                    <hr/>
                <div className="row why-stake">
                    <p>
                        <ul className=" font-style-1">
                            <li>Staking NFTs has become increasingly popular as it provides an opportunity for investors to earn rewards by holding onto their non-fungible tokens for a specified period. The concept of staking is based on the idea that by locking up a certain amount of tokens, investors can earn rewards for contributing to the network's security and stability.</li>
                            <li>Staking NFTs is particularly attractive for investors who believe in the long-term potential of a project and want to be actively involved in its growth. By staking NFTs, investors can demonstrate their commitment to a project and earn rewards in the form of additional tokens, unique experiences, or other benefits. These rewards can be used to reinvest in the project, trade on the open market, or simply hold onto as a long-term investment.</li>
                            <li>Furthermore, staking NFTs can provide a level of stability to the market by reducing volatility. Since staking requires investors to lock up their tokens for a certain period, it can discourage short-term trading and speculation, which can contribute to price fluctuations. This can lead to a more stable and sustainable market for NFTs, which benefits both investors and creators.</li>
                            <li>Overall, staking NFTs provides investors with an opportunity to contribute to the growth of a project and earn rewards for doing so. As the market for NFTs continues to evolve, staking is likely to become an increasingly important feature for investors seeking to maximize their returns and demonstrate their commitment to a project's success  </li>
                        </ul>
                    </p>
                </div>
                <div className="row Stake-reward-detail font-style-1">
                    <div className='col-sm reward-box'>
                        <div className='row'>
                            <h5 className='text-center font-size-22'>Weekly Stake</h5>
                        </div>
                        <div className='row mt-3'>
                            <h6 className='text-center font-size-22'>Reward: <b className="">0.001 ETH</b> </h6>
                        </div>
                    </div>
                    <div className='col-sm reward-box'>
                        <div className='row'>
                            <h5 className='text-center font-size-22'>Monthly Stake</h5>
                        </div>
                        <div className='row  mt-3'>
                            <h6 className='text-center font-size-22'>Reward: <b>0.01 ETH</b> </h6>
                        </div>
                    </div>
                    <div className='col-sm reward-box'>
                        <div className='row'>
                            <h5 className='text-center font-size-22'>Quartely Stake</h5>
                        </div>
                        <div className='row mt-3'>
                            <h6 className='text-center font-size-22'>Reward: <b>0.1 ETH</b> </h6>
                        </div>
                    </div>

                </div>
            </div>




            <div className="row lottery-detail text-white">
                    <hr/>
                        <h3 className="text-center main-sub-heading">Lottery</h3>
                    <hr/>
                <div className="row lottery-stake">
                    <p>
                        <ul className=" font-style-1">
                            <li>Lottery is a popular and valuable utility in NFT marketplaces that can provide an exciting way for investors and collectors to acquire rare and high-value NFTs, while also promoting community engagement and growth.</li>
                            <li>Lotteries can help build a sense of community among investors, as participants often share their excitement and anticipation for the drawing.</li>
                            <li>This can lead to increased engagement and participation in the marketplace, contributing to its overall growth and success.</li>
                            <li>Lotteries in NFT marketplaces can be a valuable tool for creators and investors alike.</li>
                            <li>For creators, it provides an opportunity to sell rare or high-value NFTs to a wider audience, increasing demand for their work.</li>
                            <li>For investors, it offers a chance to acquire unique and valuable NFTs that they may not have been able to obtain otherwise.</li>
                        </ul>
                    </p>
                </div>
                {/* <div className="row Stake-reward-detail font-style-1">
                    <div className='col-sm reward-box'>
                        <div className='row'>
                            <h5 className='text-center font-size-22'>Monthly Stake</h5>
                        </div>
                        <div className='row mt-3'>
                            <h6 className='text-center font-size-22'>Reward: <b className="">0.0001 ETH</b> </h6>
                        </div>
                    </div>
                    <div className='col-sm reward-box'>
                        <div className='row'>
                            <h5 className='text-center font-size-22'>Quaterly Stake</h5>
                        </div>
                        <div className='row  mt-3'>
                            <h6 className='text-center font-size-22'>Reward: <b>0.001 ETH</b> </h6>
                        </div>
                    </div>
                    <div className='col-sm reward-box'>
                        <div className='row'>
                            <h5 className='text-center font-size-22'>Yearly Stake</h5>
                        </div>
                        <div className='row mt-3'>
                            <h6 className='text-center font-size-22'>Reward: <b>0.01 ETH</b> </h6>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    )
}

export default Home;
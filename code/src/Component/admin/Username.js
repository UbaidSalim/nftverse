
import { useEffect } from "react";
import { useStore } from "../../context/GlobalState";

export default function Username(){
    const [{nftverse_wallet, network}] = useStore();
   
    return (
        <div>
            <div className="text-right" style={{marginRight:"1%", marginTop: "-3%"}}>
                <h5><b>Hello, Admin!!!</b></h5>
                <b>Wallet: {nftverse_wallet.slice(0,5)}...........{nftverse_wallet.slice(37,42)}</b>
            </div>
        <hr/>     
        </div>
    )
}
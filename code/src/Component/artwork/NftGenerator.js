import React, { useState } from "react";
import swal from 'sweetalert';
import Username from "../navbar/Username";

function NftGenerator(){

    const [file, setFile] = useState(null);
    const [images, setImages] = useState([{ key: 0, data: []}]);
    let newImages = [];
    let tempImages = [];

    async function previewImage(e, index) {
        e.preventDefault();
        setFile(e.target.files);
        newImages.push(e.target.files);
        console.log(newImages[0]);
		for(var i = 0; i < newImages[0].length; i++) {
            tempImages.push(URL.createObjectURL(newImages[0][i]));
        }
        setImages([...images, {key: index, data: tempImages }]);
	}

    const handleFiles = async (e, index) => {
        e.preventDefault();
        const formData = new FormData();
       
        for (let i = 0; i < file.length; i++) {
            formData.append('layers', file[i]);
        }
        console.log(formData.get('layers'));

         let res = await fetch(`http://localhost:4000/uploadMultipleImages/?dirName=${layers[index]}`, {
            method: "POST",
            body: formData
        });
        let resJson = await res.json();
        console.log(`API RESPONSE = ${JSON.stringify(resJson)}`);
        if(resJson.message === "success"){
            swal({text: `${layers[index]} Uploaded Successfully`, icon: "success", className: "sweat-bg-color"});
        }
    }

    const[text, setText] = useState("");
    const[layers, setLayers] = useState([]);
    const[layerIndex, setLayerIndex] = useState(0);

    
    const addLayer = () => {
        if(text !== ""){
            setLayers([...layers, text]);
            setText("");
        }
    }


    const[artworkNum, setArtworkNum] = useState(0);
    const generateArtWork = async(e) => {
        e.preventDefault();
        if(artworkNum<1 || artworkNum>10){
            swal({text: "value must be between 1 to 10", icon: "warning", className: "sweat-bg-color"});
        }
        else{
            let res = await fetch(`http://localhost:4000/generateArtWork/${artworkNum}`, {
                method: "POST",
            });
            let resJson = await res.json();
            console.log(`API RESPONSE = ${JSON.stringify(resJson)}`);
            if(resJson.message === "success"){
                swal({text: "Artwork Generated Successfully", icon: "success", className: "sweat-bg-color"});
            }
        }
    }

    return(
        <div>
            <div className="section-one row">
                <div className="nftGenerator-section-background row">
                        <div>    
                            <div className="mt-15">
                                <Username/>
                            </div>
                            <h1 className="nftGenerator-h1">Welcome To NFT Generator</h1>
                            
                            <div className="row nftGenerator-config">
                            <div className="col-sm-3 files-container">
                                <div className="row position-relative">
                                    <input type="text" className="input-text-nftGenerator" value={text} onChange={(e) => setText(e.target.value)}/>
                                    <button className="add-layer" onClick={() => addLayer()}>+ Add</button>
                                </div>
                                {
                                    layers.map((layer, key) => (
                                        <div className="row file-name" onClick={() => setLayerIndex(key)}>
                                            <span>{layer}</span>
                                        </div>
                                    ))
                                }
                                <hr/>
                                <button type="button" className="btn btn-md custom-btn modal-btn" data-bs-toggle="modal" data-bs-target="#exampleModal" style={{width: '100%'}}>
                                    Generate ArtWorks 
                                </button>
                            </div>
                            { 
                                layers.map((layer, key) => (
                                    key === layerIndex ? 
                                    <div className="col-sm-9 file-detail">
                                        <div className="row">
                                            <div className="col-sm"><p className="nftGenerator-background-p">{layer}</p></div>
                                            {/* <div className="col-sm"><button  className="nftGenerator-button">Manage</button></div> */}
                                            {/* <div className="col-sm"><button  className="nftGenerator-button">Add files</button></div> */}
                                        </div>
                                        <div className="row layer-config">
                                            <div className="col-sm add-assest-file">
                                                {/* <input type="file" className="add-file" name="myfile"/> */}
                                                <div class="box">
                                                    <form onSubmit={(e) => handleFiles(e, key)} method="POST" encType="multipart/form-data" action="uploadMultipleImages">
                                                        <input type="file" name="images" id="file-3" className="inputfile inputfile-3" onChange={(e) => previewImage(e, key)} multiple/>
                                                        <label for="file-3">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="57" viewBox="0 0 20 17" fill="purple">
                                                                <path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"></path>
                                                            </svg> 
                                                            <span className="ml-1">Choose files…</span>
                                                        </label>
                                                        <div className="intro-button"><button type="submit" className="btn btn-primary">Upload</button></div>
                                                    </form>
                                                </div>
                                            </div>
                                            {/* <div className="col-sm-3 add-custom-assest"></div> */}
                                        </div>
                                        <br/>
                                        <div className="row image-container">
                                            {
                                            images.length > 0 ? images.filter(url => 
                                                url.key === layerIndex).map(aa => (
                                                aa.data.map(d => (
                                                    <img src={d} alt="" className="preview"/>
                                                )) 
                                                )) : null
                                            }
                                        </div>
                                    </div>
                                    : null
                                ))
                                // <Visualizer layerName={layers}/>
                            } 
                            </div>
                        </div>    
                </div>
            </div>

            <div className="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">ArtWork Setting</h5>
                            <button type="button" class="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-9 mx-auto">
                                    <form className="justify-content-center">
                                        <div className="form-group">
                                            <label className="lottery-form-titles">No of ArtWorks:</label>
                                            <input type="number" className="input-text-lottery" placeholder="Enter no of ArtWorks to Generate" min="1" max="10" onChange={(e)=>setArtworkNum(e.target.value)}/>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn custom-btn" onClick={(e) => generateArtWork(e)}>Generate</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
export default NftGenerator;
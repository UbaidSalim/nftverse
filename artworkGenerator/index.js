const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
var bodyParser = require('body-parser')
const express = require('express');
const app = express();
const fs = require("fs");
const multer = require('multer');
const AdmZip = require('adm-zip');

const port = process.env.PORT || 4000;

const { startCreating, buildSetup, layersDir, buildDir } = require("./main.js");
const { dirname } = require('path');

// USE MIDDLEWARES
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(helmet());
app.use(cors());

app.listen(port, () => {
    console.log(`server is running on ${port}`)
})

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const path = `${layersDir}/${req.query.dirName}`;
        if(!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
        cb(null, path);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const uploadImage = multer({
    storage: fileStorage,
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(png|jpg)$/)) {
            return cb(new Error('Please upload an image file!'));
        }
        cb(undefined, true);
    }
});


app.get('/', (req, res) => {
    res.send("Welcome to Artwork Generator");
});


app.post('/uploadMultipleImages',uploadImage.array('layers'),(req, res) => {
    // res.status(200).send(req.files)
    res.status(200).send({message: "success"});
}, (error, req, res, next) => {
    res.status(400).send(error.message);
});


app.post('/generateArtWork/:noOfArtworks', async(req, res) => {
    
    async function layersOrder(dirPath) {
       let files = fs.readdirSync(dirPath)
       let arrayOfFiles = [];
      
        files.forEach(function(file) {
          if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
            arrayOfFiles.push({name: file})
          } 
        })
        return arrayOfFiles;
    }
    buildSetup();
    const layers = await layersOrder(layersDir);
    await startCreating(layers, req.params['noOfArtworks']);

    let uploadDir = fs.readdirSync(buildDir);
    
    const zip = new AdmZip(); 
    for(var i = 0; i < uploadDir.length;i++){
        zip.addLocalFile(buildDir+"/"+uploadDir[i]);
    }
    
    const downloadName = 'artworks.zip'; 
    const data = zip.toBuffer();
    zip.writeZip(__dirname+"/"+downloadName)

    res.set('Content-Type','application/octet-stream');
    res.set('Content-Disposition',`attachment; filename=${downloadName}`);
    res.set('Content-Length',data.length);
    res.status(200).send({message: "success"});
    
}); 
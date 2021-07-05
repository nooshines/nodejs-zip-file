const express = require("express");
const fs = require("fs");
const archiver = require('archiver');
const path =require("path")
const multer =require("multer")
const FileSaver = require('file-saver');
const JSZip = require("jszip");
const app = express()

app.get("/",(req,res)=>{
    res.sendFile(__dirname + "/index.html");
})

const dir = "public";
const subDir = "public/uploads"

app.use(express.static("public"))

if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    fs.mkdirSync(subDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

  const maxSize = 10 * 1024 * 1024;

  const compressfilesupload = multer({ storage: storage,limits:{fileSize:maxSize}});

app.post("/compressfiles",compressfilesupload.array("file",50),(req,res)=>{

    // *********************** JSZIP *********************** //

    // const zip = new JSZip();
// if(req.files){
//     req.files.forEach((file,i) => {
//         console.log("file.path",file.path)
//         zip.file(`file-${i}.jpg`, file.path);
//     })

//     zip.generateAsync({ type: "nodebuffer"}).then((zipFile) => {
//         const currentDate = new Date().getTime();
//         const fileName = `combined-${currentDate}.zip`;
//         return FileSaver.saveAs(zipFile, fileName);
//       });
//    }


  // *********************** Archiver *********************** //
  
const output = fs.createWriteStream(__dirname + '/public/example.zip');
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

archive.pipe(output);
archive.directory('public/uploads', false);
archive.finalize();
archive.pipe(res);

});


app.listen(4000,()=>{
    console.log("App is listening on port 4000")
})
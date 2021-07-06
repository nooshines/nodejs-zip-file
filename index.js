const express = require("express");
const fs = require("fs");
const archiver = require('archiver');
const path =require("path")
const multer =require("multer")
const FileSaver = require('file-saver');
const JSZip = require("jszip");
const admzip = require('adm-zip')
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

    const zip = new JSZip();
if(req.files){
    req.files.forEach((file,i) => {
        console.log("file.path",file.path)
        zip.file(`file-${i}.jpg`, file.path);
    })

    zip.generateAsync({ type: "nodebuffer"}).then((zipFile) => {
        const currentDate = new Date().getTime();
        const fileName = `combined-${currentDate}.zip`;
        return FileSaver.saveAs(zipFile, fileName);
      });
   }


  // *********************** Archiver *********************** //


//  create a file to stream archive data to.
const output = fs.createWriteStream(__dirname + '/public/example.zip');
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

//  pipe archive data to the file
archive.pipe(output);
// append files from a sub-directory, putting its contents at the root of archive
archive.directory('public/uploads', false);
//  finalize the archive
archive.finalize();
archive.pipe(res);


    // *********************** AdmZip *********************** //


    const zip = new admzip();
    const outputFilePath = Date.now() + "output.zip";
  if (req.files) {
    req.files.forEach((file) => {
      console.log(file.path)
    // add local file
      zip.addLocalFile(file.path)
    });
   // get everything as a buffer
    fs.writeFileSync(outputFilePath, zip.toBuffer());
    res.download(outputFilePath,(err) => {
        // delete files after download
      if(err){
        req.files.forEach((file) => {
          fs.unlinkSync(file.path)
        });
        fs.unlinkSync(outputFilePath) 
      }

      req.files.forEach((file) => {
        fs.unlinkSync(file.path)
      });

      fs.unlinkSync(outputFilePath)
    })
  }


});


app.listen(4000,()=>{
    console.log("App is listening on port 4000")
})
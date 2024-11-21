const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

//first we have to use diskstorage
//export upload variable


//* diskstorage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, (req, bytes) => {
      // console.log(bytes.toString("hex"));
      const fn = bytes.toString("hex") + path.extname(file.originalname);
      cb(null, fn);
    });
  },
});

//* export upload variable.
const upload = multer({ storage: storage });

module.exports = upload;
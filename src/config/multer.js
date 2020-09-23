const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const path = require('path');

module.exports = {
  dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
  storage: multerS3({
    s3: new aws.S3(),
    bucket: 'wherebotheatmaps',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (req, file, cb) => {
      const fileName = `${formatDate(Date.now())}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/gif',
    ];
    
    if(allowedMimes.includes(file.mimetype)){
      cb(null, true);
    } else{
      cb(new Error("Invalid file type"));
    }
  },
};

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}
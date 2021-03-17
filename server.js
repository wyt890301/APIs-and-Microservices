require('dotenv').config();
var express = require('express');
var app = express();
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var shortId = require('shortid');
var validUrl = require('valid-url');
var dns = require('dns');

// CORS:是一種使用額外 HTTP 標頭令目前瀏覽網站的使用者代理取得存取其他來源（網域）伺服器特定資源權限的機制
// so that your API is remotely testable by FCC 
var cors = require('cors');
const { isValid } = require('shortid');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// connect mongodb
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const Schema = mongoose.Schema;

//using body-parser
app.use(bodyParser.urlencoded({ extended: false, }));
app.use(bodyParser.json());

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.get("/", function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Timestamp Microservice(時間戳微服務)
app.get("/api/timestamp/", (req, res) => {
  res.json({ unix: new Date().getTime(), utc: new Date().toUTCString()  });
});
//正解
app.get("/api/timestamp/:date_string", (req, res) => {
  let dateString = req.params.date_string;

  if (/\d{5,}/.test(dateString)) {
    const dateInt = parseInt(dateString);
    res.json({ unix: dateInt, utc: new Date(dateInt).toUTCString() });
  } else {
    let dateObject = new Date(dateString);

    if (dateObject.toString() === "Invalid Date") {
      res.json({ error: "Invalid Date" });
    } else {
      res.json({ unix: dateObject.valueOf(), utc: dateObject.toUTCString() });
    }
  }
});

// 自己寫的
// let dateRespone = {};
// app.get("/api/timestamp/:date?", (req, res) => {
//   let date = req.params.date;

//   if (date.includes('-')) {
//     //DateString
//     dateRespone = { unix: new Date(date).getTime(), utc: new Date(date).toUTCString() };
//   }
//   else {
//     //timestamp
//     let dateInt = parseInt(date);
//     dateRespone = { unix: dateInt, utc: new Date(dateInt).toUTCString() };
//   }
//   if(dateRespone['utc'] === "Invalid Date") {
//     dateRespone = { error: "Invalid Date" };
//   }
//   res.json(dateRespone);
// });

//Request Header Parser Microservice(請求標題剖析微服務)
app.get("/api/whoami", function(req, res) {
  var ipaddress = '127.0.0.1';
  var language = req.header('Accept-Language');
  var software = req.header('User-Agent');
  res.json({ ipaddress, language, software });
});

//URL Shortener Microservice(網址短劑微服務)
const urlSchema = new Schema({
  original_url: String,
  short_url: String
})
const URL = mongoose.model("URL", urlSchema)

app.post('/api/shorturl/new', function (req, res) {
  //建立新的urlSchema
  let urlRespone = req.body.url;
  let shortUrl = shortId.generate();
  //測試是否為有效網址
  if(validUrl.isWebUri(urlRespone)){
    let responseUrl = new URL({ 
      original_url: urlRespone,
      short_url: shortUrl
    })
    responseUrl.save(function (err, data){
      if (err) return console.log(err);
      else{
        res.json({
          original_url: urlRespone,
          short_url: shortUrl
        });
      }
    });
  }
  else{
    res.json({error: 'invalid url'});
  }
});
// async function 非同步函式 
// 可以使用await，他會暫停async function的執行，直到promise的解析完畢
app.get('/api/shorturl/:short_url', async function(req, res){
  const urlParams = await URL.findOne({ 
    short_url : req.params.short_url
  });
  if (urlParams){
    console.log(urlParams);
    return res.redirect(urlParams.original_url);
  }
  else
    return res.status(404).json('No URL is found');
})

// listen for requests :)
app.listen(3000);
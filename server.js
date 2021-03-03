// server.js
// where your node app starts

// init project
require('dotenv').config();
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint... 
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

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

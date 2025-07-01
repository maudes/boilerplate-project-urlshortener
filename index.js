require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
// add
let mongoose = require('mongoose');  
const dbURI = process.env.MONGO_URI  
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true});
let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



// create the DB and schema
const shorturlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url:{
	  type: Number,
	  required: true
	}, 
  });
const c_surl = mongoose.model('c_surl', shorturlSchema);

// main function
app.post('/api/shorturl', function(req, res){
  const inputUrl = req.body.url;
  let shortUrl;

  const createShortUrl = (done) => {
      shortUrl = new c_surl({
      original_url: inputUrl,
      short_url: Math.floor(Math.random()*10000)+1,
    });
      shortUrl.save(function(err, data){   
      if (err) return console.error (err);
      done(null, data); 
    });
  };

  const findShortUrl = (shortUrl, done) => {
    c_surl.findOne({short_url: shortUrl}, function(err, data){
      if(err) return console.error(err);
      done(null, data);
    });
  };

  // if the input is NUMBER, potential short url
  if (!isNaN(inputUrl) && Number(inputUrl) > 0 && Number(inputUrl) <= 10000){
    findShortUrl(Number(inputUrl), (err, data) => {
      if (err || !data ) {
        return res.json({ error: "No short URL found for the given input" });
      } else {
        res.redirect(data.original_url);
      }
    });
  };

  // check if the input is valid url
  let parsedUrl;
  try {
    parsedUrl = new URL(inputUrl);
    createShortUrl(shortUrl), (err, data) =>{
      if (err) return res.json({error: "Invalid URL"});  
      res.json({ original_url : data.inputUrl, short_url : data.shortUrl});
    };
  } catch (err) {
    res.json({error: "Invalid URL"});
  }
}); 

  /*
  if (new URL(inputUrl)){
    const createShorturl = (done) => {
      shortUrl = new c_surl({
      original_url: inputUrl,
      short_url: Math.floor(Math.random()*10000)+1,
    })};
  
  }
  */



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
// add mongoose
let mongoose = require("mongoose");
/*const dbURI = process.env.MONGO_URI;
mongoose.connect(dbURI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true }); */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// add req.body Parser
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
// shorturl + original url DS
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
const createShortUrl = mongoose.model('createShortUrl', shorturlSchema);
// Counter DS
const counterSchema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  count: {type: Number, default:0},
});
const createCounter = mongoose.model('createCounter', counterSchema);

// function of counting
async function newCount(){
  const result = await createCounter.findOneAndUpdate(
    {name: 'short_url'}, // filter
    {$inc: {count: 1}}, // update
    {new: true, upsert: true} // options
  );
  return result.count;
}

// main function
app.post('/api/shorturl', async function(req, res){
  const inputUrl = req.body.url;

/*  const findShortUrl = (shortUrl, done) => {
    createShortUrl.findOne({short_url: shortUrl}, function(err, data){
      if(err) return console.error(err);
      done(null, data);
    });
  };*/

  // if the input is NUMBER, potential short url
  if (!isNaN(inputUrl) && Number(inputUrl) > 0){
    return createShortUrl.findOne({short_url: Number(inputUrl)}, (err, data) => {
      if (err || !data ) {
        return res.json({ error: "No short URL found for the given input" });
      } else {
        res.redirect(data.original_url);
      }
    });
  };

  // check if the input is valid url
  let parsedUrl
  try {
    parsedUrl = new URL(inputUrl);
  } catch (err) {
    res.json({error: "Invalid URL"});
  }
  // Create new shorturl and its counter
  let shortUrl = await newCount(); // 得出 Count 數
  const entry = new createShortUrl({   // 定義儲存資料
    original_url: parsedUrl.href,
    short_url: shortUrl,
  });

  const newEntry = await entry.save(function (err, data){  // 存入
    if (err) return console.error (err);
    done(null, data); 
  });

  res.json({original_url: parsedUrl, short_url: shortUrl});

}); 
// End of the app.post()


/*
    createShortUrl(shortUrl), (err, data) =>{
      if (err) return res.json({error: "Invalid URL"});  
      res.json({ original_url : data.inputUrl, short_url : data.shortUrl});

  const createShortUrl = (done) => {
      shortUrl = new createShortUrl({
      original_url: inputUrl,
      short_url: Math.floor(Math.random()*10000)+1,
    });
      shortUrl.save(function(err, data){   
      if (err) return console.error (err);
      done(null, data); 
    });
  };
*/
  /*
  if (new URL(inputUrl)){
    const createShorturl = (done) => {
      shortUrl = new createShortUrl({
      original_url: inputUrl,
      short_url: Math.floor(Math.random()*10000)+1,
    })};
  
  }
  */



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

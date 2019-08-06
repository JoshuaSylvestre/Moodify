require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const querystring = require('querystring');
const logger = require('morgan');
const fs = require('fs').promises;

var request = require('request');
var cors = require('cors');

var SpotifyWebApi = require('spotify-web-api-node');
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

// Express is limiting json size, so we expand it for images
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public'))).use(cookieParser());


var scopes = ['user-library-read','user-library-modify'];
var redirect_uri = process.env.REDIRECT_URI;
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var stateKey = 'spotify_auth_state';

var spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  redirectUri: redirect_uri,
  clientSecret: client_secret
});

app.post('/retEmote', function (req, res) {
  var img = (req.body.imageString).replace(/^data:image\/png;base64,/, "");
  saveToDisk(img).then(() => quickstart()).then((faces) => { res.send(faces);});
});

// Endpoint to generate access token
app.get('/', (req, res) => {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  
  // your application requests authorization
  var scope = 'user-read-private user-read-email user-library-read playlist-modify-public playlist-modify-private playlist-modify';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/callback', function (req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  
  // console.log('state: ' + state);
  // console.log('\nstored state: ' + storedState);
  // console.log('cookie: ' + req.cookies);

  if (state === null || state !== storedState) {
    res.redirect('http://localhost:3000/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          // console.log(body);
        });

        // // we can also pass the token to the browser to make requests from there
        res.redirect('http://localhost:3000/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('http://localhost:3000/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

async function quickstart(dataUri) {
  try{
    // Performs label detection on the image file
    const [result] = await client.faceDetection('input.png');
    return result.faceAnnotations;
  }
  catch(err)
  {
    console.log(err);
  }
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

async function saveToDisk(img) {
  require("fs").writeFile("input.png", img, 'base64', function (err) {
    console.log(err);
  });
}

var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};


module.exports = app;

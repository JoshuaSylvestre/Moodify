/* eslint-disable linebreak-style */
import React, { Component } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor() {
    super();
    const params = this.getHashParams();
    const token = params.access_token;

    if(token)
    {
      spotifyApi.setAccessToken(token);
    }

    this.state = { 
      loggedIn: token ? true: false,
      tracks: [],
      serverRoot: 'http://localhost:8888',
      emotion: {
        joy: 'VERY_UNLIKELY',
        sorrow: 'VERY_UNLIKELY',
        anger: 'VERY_UNLIKELY',
        blurred:'VERY_UNLIKELY'      
      }
    };

  }

  // Populates all the emotion fields after taking a photo
  onTakePhoto(dataUri) {
    fetch('/retEmote', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageString: dataUri
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      // console.log(responseJson);
      this.setState(prevState => {
        let emotion = Object.assign({}, prevState.emotion);
        emotion.joy = responseJson[0].joyLikelihood;
        emotion.sorrow = responseJson[0].sorrowLikelihood;
        emotion.anger = responseJson[0].angerLikelihood;
        emotion.blurred = responseJson[0].blurredLikelihood;
        return {emotion};
      })
    }).then(() => {
      let feelings = 'joy: ' + this.state.emotion.joy +
        '\nanger: ' + this.state.emotion.anger +
        '\nsorrow: ' + this.state.emotion.sorrow;

      alert('Here\'s how you\'re feeling!\n' 
      + feelings 
      + '\nMaking a playlist for you right now!');
    })
    .catch((error) => {
      console.log(error);
    });
  }

  getSavedTracks() {
    spotifyApi.getMySavedTracks({
      limit: 50
    })
    .then((response) => {
      this.setState({
        tracks: response.items
      });
      console.log(this.state.tracks);
    })
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  }

  componentDidMount() {
  }

  render() {
    return (
    <div className='App'>
        {
          !this.state.loggedIn &&
          <div>
            <a href={this.state.serverRoot}> Please Login to Spotify to start! </a>
          </div>
        }
        <div>
        {
        this.state.loggedIn &&
        <button onClick={() => this.getSavedTracks()}>
          Get a playlist recommendation!
          </button>
        }
      </div>
      <div>
      {
        this.state.loggedIn &&
        <Camera 
          onTakePhoto = {(dataUri) => {this.onTakePhoto(dataUri); }}
        />
          }
      </div>
    </div>
    );
  }
}

export default App;
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
    // console.log(params);
    const token = params.access_token;

    if(token)
    {
      spotifyApi.setAccessToken(token);
    }

    this.state = { 
      loggedIn: token ? true: false,
      albums: []
    };

  }

  onTakePhoto(dataUri) {
    console.log(dataUri);
  }

  getSavedAlbums() {
    spotifyApi.getMySavedAlbums()
    .then((response) => {
      this.setState({
        albums: response.items
      });
      console.log(this.state.albums);
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
        <div>
          <a href='http://localhost:8888'> Login to Spotify </a>
        </div>
        <div>
        {
        this.state.loggedIn &&
        <button onClick={() => this.getSavedAlbums()}>
          Get Saved Albums!
          </button>
        }
      </div>
      <div>
        <Camera 
          onTakePhoto = {(dataUri) => {this.onTakePhoto(dataUri); }}
        />
      </div>
    </div>
    );
  }
}

export default App;
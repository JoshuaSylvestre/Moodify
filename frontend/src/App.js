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
        joy: 1, // 0
        sorrow: 1, // 1
        anger: 1, // 2
      },
      dominantEmotion: 0,
      songs: [],
      songsReady: false
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

        emotion.joy = this.getEmotionScale(responseJson[0].joyLikelihood);
        emotion.sorrow = this.getEmotionScale(responseJson[0].sorrowLikelihood);
        emotion.anger = this.getEmotionScale(responseJson[0].angerLikelihood);

        return {emotion};
      })
    })
    .then(() => {
      if (this.state.emotion.joy > this.state.emotion.sorrow && this.state.emotion.joy > this.state.emotion.anger)
      {
        this.setState({ dominantEmotion: 0 });
      }
      else if (this.state.emotion.anger > this.state.emotion.joy && this.state.emotion.anger > this.state.emotion.sorrow)
      {
        this.setState({ dominantEmotion: 1 });
      }
      else
      {
        this.setState({ dominantEmotion: 2 });
      }
    }).then(() => {
      let feelings = 'joy: ' + this.state.emotion.joy +
        '\nanger: ' + this.state.emotion.anger +
        '\nsorrow: ' + this.state.emotion.sorrow;

      alert('Here\'s how you\'re feeling on a scale from 1 to 5!\n' 
      + feelings 
      + '\nMaking a playlist for you right now!');
    })
    .then(() => this.getSavedTracks(0, [], 2))
    .then(() => {
    })
    .catch((err) => {
      console.log(err);
    });
  }


  getSavedTracks(i, newArray, limit) {
    if(i * 50 >= limit)
    {
      this.setState({ songs: newArray, songsReady: true }, () => {
        console.log(this.state.songs);
      });
      return;
    }

    spotifyApi.getMySavedTracks({
      limit: 50,
      offset: i * 50
    })
      .then((response) => {
        // console.log(response.items);
        newArray.push(response.items);
        limit = response.total;
      }).then(() => this.getSavedTracks(i + 1, newArray, limit))
  }

  createPlayList()
  {
    spotifyApi.createPlaylist('Moodify Playlist', { 'public': false })
      .then(function (data) {
        console.log('Created playlist!');
      }, function (err) {
        console.log('Something went wrong!', err);
      });
  }

  getEmotionScale(emote) {
    switch (emote) {

      case 'VERY_UNLIKELY':
        return 1;

      case 'UNLIKELY':
        return 2;

      case 'POSSIBLE':
        return 3;

      case 'LIKELY':
        return 4;

      case 'VERY_LIKELY':
        return 5;

      default:
        return 1;
        break;
    }
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
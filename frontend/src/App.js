/* eslint-disable linebreak-style */
import React, { Component } from 'react';
import SpeechRecognition from 'react-speech-recognition';

class App extends Component {
  constructor() {
    super();
    this.state = { 
      users: []
    };
  }

  componentDidMount() {
  }

  render() {
    const { users } = this.state;
    return (
      <div className="App">
      <h1>Time to go sicko mode</h1>
      </div>
    );
  }
}

export default App;
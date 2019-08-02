/* eslint-disable linebreak-style */
import React, { Component } from 'react';
import SpeechRecognition from 'react-speech-recognition';
import translate from 'translate';

const options = {
  autoStart: true,
  continuous: true
}

class App extends Component {
  constructor() {
    super();
    this.state = { 
      users: []
    };
  }

  componentDidMount() {
    this.props.recognition.lang = 'en';
  }

  render() {
    const { users } = this.state;
    return (
      <div className="App">        
      <h1>Start speaking, your text will appear on the screen after your first pause:</h1>
        <h1>
          <span style={{color: 'black'}}>{this.props.finalTranscript}</span>
        </h1>
      </div>
    );
  }
}

export default SpeechRecognition(options)(App);
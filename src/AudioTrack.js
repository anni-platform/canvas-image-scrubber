import React, { Component } from 'react';
import throttle from 'lodash/throttle';

export default class AudioTrack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      currentTime: props.currentTime || 0,
      isReady: false,
      volume: props.volume || .5,
    }
  }
  componentDidMount() {
    this.pauseAudio();
    this.audio.addEventListener('canplaythrough', () => {
      this.setState({
        isReady: true,
      }, this.props.onReady);
    });
  }
  pauseAudio = () => this.audio.pause();
  componentWillReceiveProps({
    currentTime,
    playing,
    playAudio,
    volume,
  }) {
    if (!this.state.isReady) return;
    this.audio.muted = !playAudio || false;
    if (this.state.currentTime > currentTime) {
      this.audio.currentTime = currentTime;
    } else {

      throttle(() => {
        this.pauseAudio();
        this.audio.currentTime = currentTime;
        this.audio.play();
      }, 100);
    }
    this.setState({
      currentTime,
      volume,
    });
    if (playing && this.audio.paused) {
      this.audio.play();
    } else if (!playing) {
      this.pauseAudio();
    }

    if (volume !== this.state.volume) {
      this.audio.volume = volume;
    }
  }
  render() {
    const {
      src,
      showControls,
    } = this.props;
    return (
      <audio src={src} ref={audio => this.audio = audio} controls={showControls} />
    )
  }
}
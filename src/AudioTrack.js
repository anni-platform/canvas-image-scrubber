import React, { Component } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';

export default class AudioTrack extends Component {
  static propTypes = {
    currentTime: PropTypes.number,
    onReady: PropTypes.func,
    playing: PropTypes.bool,
    playAudio: PropTypes.bool,
    showControls: PropTypes.bool,
    src: PropTypes.string,
    trackProps: PropTypes.shape({
      label: PropTypes.string,
    }),
    volume: PropTypes.number,
  };

  static defaultProps = {
    currentTime: 0,
    playing: false,
    playAudio: false,
    onReady: () => null,
    showControls: false,
    src: '',
    trackProps: {},
    volume: 0.5,
  };

  constructor(props) {
    super(props);

    this.state = {
      currentTime: props.currentTime,
      isReady: false,
      volume: props.volume,
    };
  }

  componentDidMount() {
    this.pauseAudio();
    this.audio.addEventListener('canplaythrough', () => {
      this.setState({
        isReady: true,
      }, this.props.onReady);
    });
  }

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

  pauseAudio = () => { if (this.audio) this.audio.pause(); }
  registerAudio = (audio) => {
    this.audio = audio;
  }

  render() {
    const {
      src,
      showControls,
      trackProps,
    } = this.props;

    return (
      <audio
        controls={showControls}
        ref={this.registerAudio}
        src={src}
      >
        <track
          kind="captions"
          {...trackProps}
        />
      </audio>
    );
  }
}

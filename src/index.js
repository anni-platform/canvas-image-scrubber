import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AudioTrack from './AudioTrack';

const DEFAULT_FPS = 24;

const preloadImage = (src, callback) => {
  const img = new Image();
  img.onload = () => callback(img);
  img.src = src;
};

export default class Viewer extends Component {
  static propTypes = {
    audioSource: PropTypes.string,
    fps: PropTypes.number,
    frames: PropTypes.arrayOf(PropTypes.string).isRequired,
    render: PropTypes.func.isRequired,
  }

  static defaultProps = {
    audioSource: '',
    fps: DEFAULT_FPS,
  };

  constructor(props) {
    super(props);
    const { frames } = props;
    this.state = {
      audioReady: false,
      currentFrame: 0,
      fps: props.fps,
      loading: true,
      isPlaying: false,
      htmlImageElements: null,
      playAudio: true,
      volume: 0.5,
      loadingProgress: {
        loadingComplete: false,
        totalLoaded: 0,
        totalFramesToLoad: frames.length,
      },
    };
    window.onkeydown = this.handleKeydown;
  }

  componentDidMount() {
    const { frames } = this.props;

    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    const htmlImageElements = [];
    frames.forEach((frame, index) => {
      preloadImage(frame, (img) => {
        this.setState({
          loadingProgress: {
            ...this.state.loadingProgress,
            totalLoaded: htmlImageElements.length,
          },
        });

        if (index === 0) {
          this.framesSize = {
            width: img.width,
            height: img.height,
          };
        }

        // ensure order is correct
        htmlImageElements.splice(index, 0, img);
        if (htmlImageElements.length === frames.length) {
          this.setState({
            loading: false,
            htmlImageElements,
            loadingProgress: {
              ...this.state.loadingProgress,
              loadingComplete: true,
            },
          }, this.drawFrame);
        }
      });
    });
  }

  componentWillUnmount() {
    window.onkeydown = null;
  }

  onVolumeChange = (volume) => {
    this.setState({ volume });
  };

  onAudioReady = () => {
    this.setState({
      audioReady: true,
    });
  };

  get isLoading() {
    return !this.state.audioReady && this.state.loading;
  }

  get currentAudioPosition() {
    const { currentFrame, fps } = this.state;
    return currentFrame === 0 ? 0 : currentFrame / fps;
  }

  getNextFrame() {
    const { currentFrame } = this.state;
    const { frames } = this.props;
    if (currentFrame === frames.length - 1) return 0;
    return currentFrame + 1;
  }

  getPrevFrame() {
    const { currentFrame } = this.state;
    const { frames } = this.props;
    if (currentFrame === 0) return frames.length - 1;
    return currentFrame - 1;
  }

  getViewerControlsProps = () => {
    const {
      pause,
      togglePlay,
      toggleAudio,
      onVolumeChange,
    } = this;
    const {
      currentFrame,
      isPlaying,
      fps,
      playAudio,
      volume,
    } = this.state || {};

    return {
      fps,
      loading: this.isLoading,
      currentFrame,
      isPlaying,
      next: this.goToNextFrame,
      prev: this.goToPrevFrame,
      pause,
      playAudio,
      togglePlay,
      toggleAudio,
      volume,
      onVolumeChange,
      onFPSChange: fpsChange => this.setState({ fps: parseInt(fpsChange, 10) }),
    };
  }

  getViewerProgressProps = () => {
    const { currentFrame } = this.state || {};
    const { frames } = this.props;

    return {
      min: 0,
      max: frames.length - 1,
      value: currentFrame,
      onChange: this.goToFrame,
    };
  }

  goToFrame = (currentFrame) => {
    this.setState({ currentFrame }, this.drawFrame);
  };

  goToNextFrame = () => {
    this.setState({
      currentFrame: this.getNextFrame(),
    }, this.drawFrame);
  };

  goToPrevFrame = () => {
    this.setState({
      currentFrame: this.getPrevFrame(),
    }, this.drawFrame);
  };

  drawFrame = () => {
    const {
      currentFrame,
      htmlImageElements,
    } = this.state;

    if (!htmlImageElements) return;

    const img = htmlImageElements[currentFrame];

    if (this.canvas && this.ctx) {
      this.canvas.width = img.width;
      this.canvas.height = img.height;
      this.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
    }
  }

  pause = () => {
    this.setState({
      isPlaying: false,
    });
  };

  togglePlay = () => {
    this.setState({
      isPlaying: !this.state.isPlaying,
    }, () => {
      if (!this.state.isPlaying) return;

      this.play(this.renderNextFrame);
    });
  };

  toggleAudio = () => {
    this.setState({
      playAudio: !this.state.playAudio,
    });
  };

  play = (renderFrame) => {
    if (!this.state.isPlaying) return;

    let then = performance.now();
    let now;
    let delta;

    const nextFrame = () => {
      if (!this.state.isPlaying) return;

      now = performance.now();
      delta = now - then;
      const interval = Math.round(1000 / this.state.fps);

      if (delta > interval) {
        renderFrame();
        then = now;
      }
      requestAnimationFrame(nextFrame);
    };

    nextFrame();
  };

  handleKeydown = (e) => {
    const LEFT_ARROW_KEY = 37;
    const RIGHT_ARROW_KEY = 39;
    const SPACEBAR_KEY = 32;
    const key = e.which;

    switch (key) {
    case RIGHT_ARROW_KEY:
      e.preventDefault();
      this.goToNextFrame();
      break;
    case LEFT_ARROW_KEY:
      e.preventDefault();
      this.goToPrevFrame();
      break;
    case SPACEBAR_KEY:
      e.preventDefault();
      this.togglePlay();
      break;
    default:
    }
  }

  renderNextFrame = () => {
    if (!this.state.isPlaying) return;

    this.setState({
      currentFrame: this.getNextFrame(),
    }, this.drawFrame);
  }

  render() {
    const {
      currentAudioPosition,
    } = this;
    const {
      isPlaying,
      fps,
      playAudio,
      volume,
      loadingProgress,
    } = this.state || {};
    const {
      audioSource,
      frames,
      render,
    } = this.props;

    const renderAudio = playAudio && (
      <AudioTrack
        src={audioSource}
        playAudio={playAudio}
        onReady={this.onAudioReady}
        playing={isPlaying}
        maxTime={frames.length / fps}
        volume={volume}
        showControls
        currentTime={this.currentAudioPosition}
      />
    );

    const {
      getViewerProgressProps,
      getViewerControlsProps,
    } = this;

    const getCanvasRef = (el) => { this.canvas = el; };
    const renderViewer = <canvas ref={getCanvasRef} />;

    return render({
      ...this.state,
      getViewerProgressProps,
      getViewerControlsProps,
      loadingProgress,
      renderAudio,
      renderViewer,
      getCanvasRef,
      currentAudioPosition,
      isPlaying,
    });
  }
}

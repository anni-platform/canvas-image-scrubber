import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AudioTrack from './AudioTrack';

const FPS = 24;

const preloadImage = (src, callback) => {
  const img = new Image();
  img.onload = () => callback(img);
  img.src = src;
}

function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
  else
      byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type:mimeString});
}

export default class Viewer extends Component {
  static propTypes = {
    audioSource: PropTypes.string,
    frames: PropTypes.arrayOf(PropTypes.string).isRequired,
    render: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    const { frames } = props;
    this.state = {
      audioReady: false,
      currentFrame: 0,
      fps: props.fps || FPS,
      loading: true,
      isPlaying: false,
      htmlImageElements: null,
      playAudio: true,
      volume: .5,
      loadingProgress: {
        loadingComplete: false,
        totalLoaded: 0,
        totalFramesToLoad: frames.length,
      },
    };
    window.onkeydown = this.handleKeydown;
  }

  componentWillUnmount() {
    window.onkeydown = null;
  }

  componentDidMount() {
    const {
      frames,
    } = this.props;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
    
    if (this.spriteSheetCanvas) {
      this.spriteSheetCanvasCtx = this.spriteSheetCanvas.getContext('2d');
    }
    
    const sprite = this.props.sprite && localStorage.getItem('spriteImage');

    if (sprite) {
      this.spriteImage = new Image();
      this.spriteImage.src = sprite;
    }

    let htmlImageElements = [];
    frames.forEach((frame, index) => {
      preloadImage(frame, img => {
        this.setState({
          loadingProgress: {
            ...this.state.loadingProgress,
            totalLoaded: htmlImageElements.length,
          }
        });
        
        // this.imagePreloadCanvasCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
        if (index === 0) {
          this.framesSize = {
            width: img.width,
            height: img.height,
          };
          if (this.spriteSheetCanvas) {
            this.spriteSheetCanvas.width = img.width;
            this.spriteSheetCanvas.height = img.height * frames.length;
          }
        }
        const y = img.height * index;

        if (!sprite) {
          this.spriteSheetCanvasCtx.drawImage(img, 0, y);
          this.spriteImage = new Image();
          this.spriteImage.onload = () => {
            this.spriteSheetCanvas.width = this.framesSize.width;
            this.spriteSheetCanvas.height = this.framesSize.height;
            this.spriteSheetCanvasCtx.drawImage(this.spriteImage, 0, 0);
          }
        }
        
        // ensure order is correct
        htmlImageElements.splice(index, 0, img);
        if (index === frames.length - 1 || htmlImageElements.length === frames.length) {
          if (!sprite) {
            const spriteImage = this.spriteSheetCanvas.toDataURL('image/jpeg', 1.0);
            localStorage.setItem(this.props.spriteKey || 'spriteImage', spriteImage);
            this.spriteImage.src = spriteImage;
            if (this.props.spriteLoadCallback) {
              this.props.spriteLoadCallback(dataURItoBlob(spriteImage));
            }
          }
          this.setState({
            loading: false,
            htmlImageElements,
            loadingProgress: {
              ...this.state.loadingProgress,
              loadingComplete: true,
            }
          }, this.drawFrame);
        }
      })
    });
  }

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
    
    if (!this.spriteSheetCanvasCtx) return;
    const { height, width } = this.framesSize;
    this.spriteSheetCanvas.width = this.framesSize.width;
    this.spriteSheetCanvas.height = this.framesSize.height;
    this.spriteSheetCanvasCtx.clearRect(0, 0, width, height);
    const yPos = currentFrame === 0 ? 0 : -(currentFrame * height);
    this.spriteSheetCanvasCtx.drawImage(this.spriteImage, 0, yPos);
  }

  getNextFrame() {
    let {
      currentFrame,
    } = this.state;
    const {
      frames,
    } = this.props;
    if (currentFrame === frames.length - 1)
      return 0;
    return currentFrame + 1;
  }

  getPrevFrame() {
    let {
      currentFrame,
    } = this.state;
    const {
      frames,
    } = this.props;
    if (currentFrame === 0)
      return frames.length - 1;
    return currentFrame - 1;
  }

  goToFrame = currentFrame => {
    this.setState({
      currentFrame,
    }, this.drawFrame)
  };

  goToNextFrame = () => this.setState({
    currentFrame: this.getNextFrame()
  }, this.drawFrame);

  goToPrevFrame = () => this.setState({
    currentFrame: this.getPrevFrame()
  }, this.drawFrame);

  pause = () => this.setState({
    isPlaying: false,
  });

  togglePlay = () => this.setState({
    isPlaying: !this.state.isPlaying,
  }, () => {
    if (!this.state.isPlaying)
      return;

    (this.play(() => {
      if (!this.state.isPlaying)
        return;
      const currentFrame = this.getNextFrame();
      this.state.isPlaying && this.setState({
        currentFrame,
      }, this.drawFrame);
    })());
  });

  toggleAudio = () => this.setState({
    playAudio: !this.state.playAudio,
  });
  onVolumeChange = volume => this.setState({
    volume,
  });

  play = (callback) => {
    if (!this.state.isPlaying)
      return;

    let then = Date.now();
    let now;
    let delta;

    const animate = () => {
      if (!this.state.isPlaying)
        return;
      now = Date.now();
      delta = now - then;
      const interval = 1000 / this.state.fps;
      if (delta > interval) {
        callback();
        then = now - (delta % interval);
      }
      requestAnimationFrame(animate);
    }
    return animate;
  };

  onAudioReady = () => this.setState({
    audioReady: true,
  });

  get isLoading() {
    return !this.state.audioReady && this.state.loading;
  }

  handleKeydown = e => {
    const LEFT_ARROW_KEY = 37;
    const RIGHT_ARROW_KEY = 39;
    const SPACEBAR_KEY = 32;
    const key = e.which;
    if (key === RIGHT_ARROW_KEY) {
      e.preventDefault();
      this.goToNextFrame();
    }
    if (key === LEFT_ARROW_KEY) {
      e.preventDefault();
      this.goToPrevFrame();
    }
    if (key === SPACEBAR_KEY) {
      e.preventDefault();
      this.togglePlay();

    }
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
      onFPSChange: fps => this.setState({ fps }),
    }
  }
  getViewerProgressProps = () => {
    const { currentFrame } = this.state || {};
    const { frames } = this.props;
    return {
      min: 0,
      max: frames.length - 1,
      value: currentFrame,
      onChange: this.goToFrame,
    }
  }
  render() {
    const {
      currentFrame,
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
      sprite,
    } = this.props;
    const renderAudio = (
      <AudioTrack
        src={audioSource}
        playAudio={playAudio}
        onReady={this.onAudioReady}
        playing={isPlaying}
        maxTime={frames.length / fps}
        volume={volume}
        showControls
        currentTime={currentFrame === 0 ? 0 : currentFrame / fps}
      />
    );

    const renderViewer = sprite ? (
      <div
        className="Viewer"
        style={{ maxWidth: this.canvas && this.canvas.width }}>
        <canvas ref={canvas => this.spriteSheetCanvas = canvas}/>
        
      </div>
    ) : (
      <div
        className="Viewer"
        style={{ maxWidth: this.canvas && this.canvas.width }}>
        <canvas ref={canvas => this.canvas = canvas}/>
        
      </div>
    );

    const {
      getViewerProgressProps,
      getViewerControlsProps,
    } = this;

    if (!render) return 'Please provide render function prop';

    return render({
      ...this.state,
      getViewerProgressProps,
      getViewerControlsProps,
      loadingProgress,
      renderAudio,
      renderViewer,
    });
  }
}
import React, { Component } from 'react';
import { render } from 'react-dom';
import CanvasImageScrubber from '../../src';
import Controls from './Controls';
import ProgressBar from './ProgressBar';
import LoadingProgress from './LoadingProgress';


function getFrames() {
  let i = 1;
  const frames = [];
  while (i < 500) {
    frames.push(require(`./flock/Frame-${i}.jpg`)); // eslint-disable-line
    i += 1;
  }
  return frames;
}

const frames = getFrames();

class Demo extends Component {
  state = {
    audioSrc: '',
  };
  componentDidMount() {
    import('./gymnopedie.mp3').then((audioSrc) => {
      this.setState({ audioSrc, ready: true });
    });
  }
  render() {
    const { audioSrc, ready } = this.state;
    return ready ? (
      <div>
        <CanvasImageScrubber
          audioSource={audioSrc}
          frames={frames}
          render={({
            getViewerControlsProps,
            getViewerProgressProps,
            loadingProgress,
            getCanvasRef,
            renderAudio,
          }) => (
            <div>
              <LoadingProgress {...loadingProgress} />
              <Controls {...getViewerControlsProps()} />
              <div style={{ maxWidth: 274 }}>
                <canvas ref={getCanvasRef} />
                <ProgressBar {...getViewerProgressProps()} />
                {renderAudio}
              </div>
            </div>
          )}
        />
      </div>
    ) : 'loading...';
  }
}

render(<Demo />, document.querySelector('#demo'));

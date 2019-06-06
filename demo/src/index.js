import React, { Component } from 'react';
import { render } from 'react-dom';
import { Router, Link } from '@reach/router';
import CanvasImageScrubber, { useCanvasScrubber } from '../../src';
import Controls from './Controls';
import ProgressBar from './ProgressBar';
import LoadingProgress from './LoadingProgress';

function getFrames() {
  let i = 1;
  const frames = [];
  while (i < 120) {
    frames.push(require(`./frames/animation/animation_${i}.jpg`)); // eslint-disable-line
    i += 1;
  }
  return frames;
}

function CanvasContainer({ children }) {
  return <div style={{ position: 'relative', maxWidth: 800 }}>{children}</div>;
}

const canvasStyle = {
  maxWidth: '100%',
};

const frames = getFrames();

class Demo extends Component {
  state = {
    audioSrc: '',
  };
  componentDidMount() {
    import('./gymnopedie.mp3').then(({ default: audioSrc }) => {
      this.setState({ audioSrc, ready: true });
    });
  }
  render() {
    const { audioSrc, ready } = this.state;
    return ready ? (
      <CanvasContainer>
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
      </CanvasContainer>
    ) : (
      'loading...'
    );
  }
}

function DemoHooks() {
  const { canvasRef, togglePlay } = useCanvasScrubber({ frames });
  return (
    <CanvasContainer>
      <button onClick={togglePlay}>toggle</button>
      <canvas style={canvasStyle} ref={canvasRef} />
    </CanvasContainer>
  );
}

function App() {
  return (
    <div>
      <nav>
        <Link to="/">home</Link>
        <Link to="/demo">demo</Link>
      </nav>
      <Router>
        <Demo path="/" />
        <DemoHooks path="/demo" />
      </Router>
    </div>
  );
}

render(<App />, document.querySelector('#demo'));

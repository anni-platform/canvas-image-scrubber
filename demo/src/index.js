import React, {Component} from 'react'
import {render} from 'react-dom';
import CanvasImageScrubber from '../../src';
import Controls from './Controls';
import ProgressBar from './ProgressBar';
import LoadingProgress from './LoadingProgress';

export function getFrames() {
  let i = 1;
  const frames = [];
  while (i < 121) {
    frames.push(require(`./kaleidoscope/Frame-${i}.jpg`));
    i++;
  }
  return frames;
}

const frames = getFrames();

class Demo extends Component {
  render() {
    return <div>
      <CanvasImageScrubber
        frames={frames}
        render={({
          getViewerControlsProps,
          getViewerProgressProps,
          loadingProgress,
          getCanvasRef,
        }) => {
          return (
            <div>
              <LoadingProgress {...loadingProgress} />
              <Controls {...getViewerControlsProps()} />
              <div style={{ maxWidth: 274 }}>
                <canvas ref={getCanvasRef} />
                <ProgressBar {...getViewerProgressProps()} />
              </div>
            </div>
          )
        }}
      />
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))

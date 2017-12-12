import React, {Component} from 'react'
import {render} from 'react-dom';
import CanvasImageScrubber from '../../src';
import Controls from './Controls';
import ProgressBar from './ProgressBar';


export function getFrames() {
  let i = 1;
  const frames = [];
  while (i < 39) {
    frames.push(require(`./frames/Frame-${i}.jpg`));
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
          renderViewer,
        }) => {
          return (
            <div>
              <Controls {...getViewerControlsProps()} />
              <div style={{ maxWidth: 274 }}>
                {renderViewer}
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

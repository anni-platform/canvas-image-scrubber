import React, {Component} from 'react'
import {render} from 'react-dom';
import CanvasImageScrubber from '../../src';
import Controls from './Controls';
import ProgressBar from './ProgressBar';
import LoadingProgress from './LoadingProgress';

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
          loadingProgress,
          renderViewer,
        }) => {
          return (
            <div>
              <LoadingProgress {...loadingProgress} />
              <Controls {...getViewerControlsProps()} />
              <div style={{ maxWidth: 274 }}>
                {renderViewer}
                <ProgressBar {...getViewerProgressProps()} />
              </div>
            </div>
          )
        }}
        sprite
        spriteKey="huzzahSprite"
        spriteLoadCallback={img => {
          console.log('Upload file blob somewhere: ', img);
        }}
      />
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
import expect from 'expect'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'

import CanvasImageScrubber from 'src/';
let i = 1;
const frames = [];
while (i < 39) {
  frames.push(require(`../demo/src/frames/Frame-${i}.jpg`));
  i++;
}

const component = (
  <CanvasImageScrubber
    frames={frames}
    render={({
      renderViewer,
    }) => {
      return (
        <div>
          {renderViewer}
        </div>
      )
    }}
  />
);

describe('Component', () => {
  let node

  beforeEach(() => {
    node = document.createElement('div')
  })

  afterEach(() => {
    unmountComponentAtNode(node)
  })

  it('displays a canvas element', () => {
    render(component, node, () => {
      expect(node.innerHTML).toContain('canvas')
    })
  })
});
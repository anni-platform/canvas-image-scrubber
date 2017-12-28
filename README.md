# canvas-image-scrubber

[![npm version](https://badge.fury.io/js/canvas-image-scrubber.svg)](https://badge.fury.io/js/canvas-image-scrubber)

A react component to render video-like playback for image sequences 🎥.

[View Demo](https://anni-platform.github.io/canvas-image-scrubber/)

## Installation

Via NPM:

`npm install canvas-image-scrubber`

or Yarn:

`yarn add canvas-image-scrubber`

## Basic Usage with `webpack` and `file-loader`

`frames` is a required prop which must be an array of valid image paths to each frame of your image sequence.

`render` is also a required prop. It is a [render-prop](https://cdb.reacttraining.com/use-a-render-prop-50de598f11ce) which allows you to render the image sequence player, controls, playback progress bar, and audio controls however you wish. See below for basic usage, and `./demo/src/index.js` for more advanced usage with prop getters `getViewerControlsProps` and `getViewerProgressProps`.

More robust documentation will hopefully be coming soon.. 🤠

```js
import React from 'react';
import CanvasImageScrubber from 'canvas-image-scrubber';
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

function MyApp() {
  render() {
    <CanvasImageScrubber
      frames={frames}
      render={({ renderViewer }) => {
        return (
          <div>
            {renderViewer}
          </div>
        )
      }}
    />
  }
}
```

## Optionally Generate and Render a Sprite Image

Optionally add the boolean prop `sprite` to generate and render a sprite image to the canvas instead of individual images. This can potentially improve performance. Additionally you can provide a callback function `spriteLoadCallback` for when the sprite image is done creating so you can upload the file to host it somewhere. The callback function receives the file blob as its first argument. Either way the data uri of the generated sprite image is saved to localStorage with the key "spriteImage" unless you specify a `spriteKey` prop with a custom key. See usage below.

```js
function mySpriteImageCanvasScrubber() {
  return (
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
            ... see above demo for usage here ...
          </div>
        )
      }}
      sprite
      spriteKey="huzzahSprite"
      spriteLoadCallback={file => {
        console.log('Upload file blob somewhere: ', file);
      }}
    />
  )
}
```

[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.com/package/canvas-image-scrubber
import React from 'react';
import PropTypes from 'prop-types';

export default function Controls({
  fps,
  onFPSChange,
  pause,
  next,
  prev,
  isPlaying,
  togglePlay,
  currentFrame,
  loading,
}) {
  const eventSequence = sequence => sequence.forEach(event => event && event())
  const playbackButtonLabel = isPlaying
    ? 'Pause'
    : 'Play';

  return (
    <div style={{ padding: 20 }}>
      {loading
        ? 'loading...'
        : (
          <div>
            <span>frame:
              <strong>{currentFrame}</strong>
            </span>
            <button onClick={() => eventSequence([pause, prev])} title="Previous Frame">&larr;</button>
            <button onClick={togglePlay}>
              {playbackButtonLabel}
            </button>
            <button onClick={() => eventSequence([pause, next])} title="Next Frame">&rarr;</button>
            <label htmlFor="fps">Frames per second: ({fps})
              <input
                id="fps"
                min={1}
                max={120}
                value={fps}
                step={1}
                type="range"
                onChange={e => onFPSChange(e.target.value)}
                list="fpsList"
              />
            </label>

            <datalist id="fpsList">
              <option>24</option>
              <option>30</option>
              <option>60</option>
            </datalist>
          </div>
        )}
    </div>
  );
}

Controls.propTypes = {
  fps: PropTypes.number.isRequired,
  onFPSChange: PropTypes.func.isRequired,
  pause: PropTypes.func.isRequired,
  next: PropTypes.func.isRequired,
  prev: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  togglePlay: PropTypes.func.isRequired,
  currentFrame: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
};


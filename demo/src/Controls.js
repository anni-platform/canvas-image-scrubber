import React from 'react';

export default function Controls({
  audioControls,
  reverse,
  forwards,
  fps,
  onFPSChange,
  pause,
  play,
  next,
  prev,
  isPlaying,
  togglePlay,
  currentFrame,
  loading,
  playAudio,
  toggleAudio,
  volume,
  onVolumeChange,
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
            <label>frame:
              <strong>{currentFrame}</strong>
            </label>
            <button onClick={() => eventSequence([pause, prev])} title="Previous Frame">&larr;</button>
            <button onClick={togglePlay}>
              {playbackButtonLabel}
            </button>
            <button onClick={() => eventSequence([pause, next])} title="Next Frame">&rarr;</button>
            <label>Frames per second: ({fps})</label>
            <input
              min={1}
              max={120}
              value={fps}
              step={1}
              type="range"
              onChange={e => onFPSChange(e.target.value)}
              list="fpsList"
            />

            <datalist id="fpsList">
                <option>24</option>
                <option>30</option>
                <option>60</option>
            </datalist>
            
          </div>
        )}
    </div>
  )
}
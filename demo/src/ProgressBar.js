import React from 'react';
import PropTypes from 'prop-types';

export default function ProgressBar({
  min,
  max,
  value,
  onChange,
}) {
  return (
    <div>
      <input
        style={{ width: '100%' }}
        list="progress"
        step={1}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(parseInt(e.target.value, 10))}
      />
    </div>
  );
}

ProgressBar.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
}

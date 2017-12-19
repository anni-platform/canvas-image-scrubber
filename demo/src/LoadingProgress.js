import React from 'react';
import PropTypes from 'prop-types';

export default function LoadingProgress({
  loadingComplete,
  totalLoaded,
  totalFramesToLoad,
}) {
  return !loadingComplete ? (
    <div>{totalLoaded} of {totalFramesToLoad} frames loaded...</div>
  ) : null;
}

LoadingProgress.propTypes = {
  loadingComplete: PropTypes.bool.isRequired,
  totalLoaded: PropTypes.number.isRequired,
  totalFramesToLoad: PropTypes.number.isRequired,
};
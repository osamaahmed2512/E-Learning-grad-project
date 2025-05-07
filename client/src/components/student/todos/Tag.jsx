import React from 'react';
import PropTypes from 'prop-types';

const Tag = ({ tagName, selectTag, selected, readonly }) => {
  const baseClasses = "px-3 py-1 rounded-full text-sm font-medium transition-all duration-200";
  const activeClasses = selected
    ? "bg-cyan-100 text-cyan-800 border border-cyan-200"
    : "bg-white/80 backdrop-blur-sm border border-cyan-200 text-gray-700 hover:bg-cyan-50";
  const cursorClass = readonly ? "" : "cursor-pointer";

  return (
    <button
      type={readonly ? "button" : "button"}
      className={`${baseClasses} ${activeClasses} ${cursorClass}`}
      onClick={() => !readonly && selectTag(tagName)}
      disabled={readonly}
    >
      {tagName}
    </button>
  );
};

Tag.propTypes = {
  tagName: PropTypes.string.isRequired,
  selectTag: PropTypes.func,
  selected: PropTypes.bool,
  readonly: PropTypes.bool
};

Tag.defaultProps = {
  selected: false,
  readonly: false
};

export default Tag;
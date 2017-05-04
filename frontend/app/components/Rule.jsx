import React from 'react';
import PropTypes from 'prop-types';

const Rule = ({ number, text }) => {
  let cleanedNumber = number;
  // Sometimes, it's necessary to remove other characters.
  if (cleanedNumber.match(/[a-z]/i)) {
    cleanedNumber = cleanedNumber.slice(0, cleanedNumber.length - 1);
  }
  return (
    <div key={number} className="row">
      <div className="col-xs-3">
        <span className="glyphicon glyphicon glyphicon-list-alt" />
        <a target="_blank" rel="noreferrer noopener" href={`http://www.eki.ee/dict/qs/muuttyybid.html#${cleanedNumber}`}>
          <em>Rule {number}:</em>
        </a>
      </div>
      <div className="col-xs-9">
        {text}
      </div>
    </div>
  );
};

Rule.propTypes = {
  number: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default Rule;

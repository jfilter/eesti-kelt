import React from 'react';
import PropTypes from 'prop-types';

const Notes = ({ notes }) => (
  <div className="row">
    <div className="col-xs-3">
      <span className="glyphicon glyphicon-info-sign" />
      <em>Notes:</em>
    </div>
    <div className="col-xs-9">
      { notes }
    </div>
  </div>
);

Notes.propTypes = {
  notes: PropTypes.string.isRequired,
};

export default Notes;

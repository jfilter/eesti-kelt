import React from 'react';
import PropTypes from 'prop-types';

import Notes from './Notes';
import Rule from './Rule';

const Entry = ({ englTerm, estonianTermsAsList }) => {
  const termsNotesRules = estonianTermsAsList.map((estonianTerm, index) => {
    let notes;
    if (estonianTerm.notes) {
      notes = <Notes notes={estonianTerm.notes} />;
    }

    let rules;
    if (estonianTerm.rule) {
      rules = estonianTerm.rule.map(rule => (
        <Rule number={rule.number} text={rule.text} key={rule.number} />
      ));
    }

    const ordinalNumber = `${(index + 1)}. `;
    return (
      <div key={estonianTerm.estTerm}>
        <h4>
          {ordinalNumber + estonianTerm.estTerm}
        </h4>
        { notes }
        <div>
          { rules }
        </div>
      </div>
    );
  });

  return (
    <div className="entry">
      <h2>
        <span className="englTerm">
          {englTerm}
        </span>
      </h2>
      {termsNotesRules}
    </div>
  );
};

Entry.propTypes = {
  englTerm: PropTypes.string.isRequired,
  estonianTermsAsList: PropTypes.arrayOf(PropTypes.shape({
    estTerm: PropTypes.string.isRequired,
    notes: PropTypes.string,
    rules: PropTypes.arrayOf(PropTypes.shape({
      number: PropTypes.string,
      text: PropTypes.string,
    })),
  })).isRequired,
};

export default Entry;

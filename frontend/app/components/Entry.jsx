import React from 'react';
import PropTypes from 'prop-types';

const Entry = ({ englTerm, estonianTermsAsList }) => {
  return (
    <div className="entry">
      <h2>
        <span className="englTerm">
          {englTerm}
        </span>
      </h2>
      {estonianTermsAsList.map((estonianTerm, index) => {
        let notes = null;
        if (estonianTerm.notes) {
          notes = (
            <div className="row">
              <div className="col-xs-3">
                <span className="glyphicon glyphicon-info-sign" />
                <em>Notes:</em>
              </div>
              <div className="col-xs-9">
                { estonianTerm.notes }
              </div>
            </div>
          );
        }

        let rules = null;
        if (estonianTerm.rule) {
          rules = estonianTerm.rule.map((rule) => {
            let cleanedNumber = rule.number;
            // Sometimes, it's necessary to remove other characters.
            if (cleanedNumber.match(/[a-z]/i)) {
              cleanedNumber = cleanedNumber.slice(0, cleanedNumber.length - 1);
            }
            return (
              <div key={rule.number} className="row">
                <div className="col-xs-3">
                  <span className="glyphicon glyphicon glyphicon-list-alt" />
                  <a target="_blank" rel="noreferrer noopener" href={`http://www.eki.ee/dict/qs/muuttyybid.html#${cleanedNumber}`}>
                    <em>Rule {rule.number}:</em>
                  </a>
                </div>
                <div className="col-xs-9">
                  {rule.text}`
                </div>
              </div>);
          });
        }

        // Only show ordinals when there are more then one item.
        let ordinalNumber = '';
        // if (estonianTermsAsList.length > 1) {
          ordinalNumber = `${(index + 1)}. `;
        // }

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
      })}
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

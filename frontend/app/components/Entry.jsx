import React, { Component, PropTypes } from 'react';

class Entry extends Component {
  render() {
    const entryDetails = this.props.details;
    console.log("entryDetails", entryDetails);
    return (
      <div className="entry">
        <h2>
          {this.props.englTerm}
        </h2>
        {entryDetails.map((y, index) => {
          let notes = null;
          let rule = null;
          if (y && y.notes) {
            notes = (<div>
              <span className="glyphicon glyphicon-info-sign" />
              <span />
              { y.notes }
            </div>);
          }

          if (y && y.rule) {
            rule = y.rule.map((yy) => {
              let pureNumber = yy.number;
              if (pureNumber.match(/[a-z]/i)) {
                pureNumber = pureNumber.slice(0, pureNumber.length - 1);
              }
              return (
                <div>
                  <span className="glyphicon glyphicon glyphicon-list-alt" />
                  <a href={`http://www.eki.ee/dict/qs/muuttyybid.html#${pureNumber}`}>
                    {yy.number}
                  </a>
                  {`: ${yy.text}`}
                </div>);
            });
          }

          let optionalText = '';
          if (entryDetails.length > 1) {
            optionalText = `${(index + 1)}. `;
          }

          return (
            <div>
              <h3>
                {optionalText + y.estTerm}
              </h3>
              { notes }
              { rule }
            </div>
          );
        })}
      </div>
    );
  }
}

Entry.propTypes = {
  englTerm: PropTypes.string.isRequired,
  details: PropTypes.arrayOf(PropTypes.shape({
    estTerm: PropTypes.string.isRequired,
    notes: PropTypes.string,
    rules: PropTypes.arrayOf(PropTypes.shape({
      number: PropTypes.string,
      text: PropTypes.string,
    })),
  })).isRequired,
};

export default Entry;

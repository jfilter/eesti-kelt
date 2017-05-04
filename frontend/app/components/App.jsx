import React, { Component } from 'react';
import Entry from './Entry';

class App extends Component {
  constructor() {
    super();
    this.state = { userInput: null, data: null };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const newUserInput = event.target.value;
    if (newUserInput === '') {
      this.setState({ userInput: newUserInput, data: null, loading: false });
    } else {
      this.setState({ userInput: newUserInput, data: null, loading: true });
      const url = `https://one.vis.one/eestikelt?term=${newUserInput}`;
      // const url = 'http://localhost:8030/eestikelt?term=' + newUserInput;
      $.getJSON(url)
        .done((response) => {
          // only update results, if the user hasn't changed in between
          if (this.state.userInput === newUserInput) {
            this.setState({ data: response });
          }
        })
        .fail((jqXHR, textStatus, error) => console.log(error));
    }
  }

  render() {
    const input = (
      <input
        autoFocus
        placeholder="search for e.g.: car, woman or man"
        type="text"
        value={this.state.value}
        onChange={this.handleChange}
      />
    );

    if (this.state.data === null) {
      if (this.state.loading) {
        return (
          <div className="app">
            {input}
            <div className="loading">Loading...</div>
          </div>
        );
      }
      return (
        <div className="app">
          {input}
        </div>
      );
    }

    const results = this.state.data.map(x => (
      <Entry
        englTerm={x.englTerm}
        estonianTermsAsList={x.list}
        key={x.englTerm}
      />
    ));

    return (
      <div className="app">
        {input}
        {results}
      </div>
    );
  }
}

export default App;

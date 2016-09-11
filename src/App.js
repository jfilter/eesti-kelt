import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = { userInput: null, data: null};
  }

  handleChange(event) {
    const newUserInput = event.target.value;
    if(newUserInput === '') {
      this.setState({ userInput: newUserInput, data: null, loading: false })
    } else {
      this.setState({ userInput: newUserInput, data: null, loading: true });
      const url = 'http://vis.one/eestikelt?term=' + newUserInput;
      $.getJSON(url)
        .done((response) => {
          // only update results, if the user hasn't changed in between
          if(this.state.userInput === newUserInput) {
            this.setState({ data: response });
          }
        })
        .fail((jqXHR, textStatus, error) => console.log(error));
    }
  }


  render() {

    const input =
      <input
        autoFocus
        placeholder=""
        type="text"
        value={this.state.value}
        onChange={this.handleChange.bind(this)}
      />;

    if (this.state.data === null) {
      if (this.state.loading) {
        return (
            <div className="App">
              {input}
              <hr/>
              <div>Loading...</div>
            </div>
          );
      } else {
        return (
            <div className="App">
              {input}
              <hr/>
            </div>
          );
      }
    } else {
      const results = this.state.data.map(x => {
        return (
            <div className="EN">
              <h2><u>{x.englTerm}</u></h2>
              {x.list.map(y => {
                let notes = null;
                let rule = null;

                if (y && y.notes) {
                  notes = <div>
                    <span className="glyphicon glyphicon-info-sign"></span><span>   </span>
                    { y.notes }
                  </div>
                }

                if (y && y.rule) {
                  rule =
                    <div>
                      <span className="glyphicon glyphicon glyphicon-list-alt"></span>
                      <span>   </span>
                      { y.rule }
                    </div>
                }


                return (<div>
                  <h3>{y.estTerm}</h3>
                  { notes }
                  { rule }
                  </div>)

              })}
            </div>
          );
      });

      return (
          <div className="App">
            {input}
            <hr/>
            {results}
          </div>
        );
    }
  }
}

export default App;

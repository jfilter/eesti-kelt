import  React, {Component} from 'react';

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
      const url = 'https://one.vis.one/eestikelt?term=' + newUserInput;
      // const url = 'http://localhost:8030/eestikelt?term=' + newUserInput;
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
              <div>Loading...</div>
            </div>
          );
      } else {
        return (
            <div className="App">
              {input}
            </div>
          );
      }
    } else {
      const results = this.state.data.map(x => {
        return (
            <div className="EN">
              <h2><u>{x.englTerm}</u></h2>
              {x.list.map((y, index) => {
                let notes = null;
                let rule = null;

                if (y && y.notes) {
                  notes = <div>
                    <span className="glyphicon glyphicon-info-sign"></span><span>   </span>
                    { y.notes }
                  </div>
                }

                if (y && y.rule) {
                  rule = y.rule.map(yy => {
                    let pureNumber = yy.number;
                    if (pureNumber.match(/[a-z]/i)) {
                      pureNumber = pureNumber.slice(0, pureNumber.length -1);
                    }
                      return <div>
                        <span className="glyphicon glyphicon glyphicon-list-alt"></span>
                        <a href={"http://www.eki.ee/dict/qs/muuttyybid.html#" + pureNumber}>{yy.number}</a>
                        {': ' + yy.text}
                      </div>
                    })
                }

                let optionalText = '';
                if (x.list.length > 1) {
                  optionalText = index + 1 + '. ';
                }

                return (<div>
                  <h3>{optionalText + y.estTerm}</h3>
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
            {results}
          </div>
        );
    }
  }
}

export default App;

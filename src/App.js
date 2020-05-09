import React from 'react';
import logo from './logo.svg';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';

class getStock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stocks: [],
      vals: []
    };
  }

  componentDidMount() {
    axios
        .get('http://localhost:8000/api/stocks/AAPL')
        .then(res => {
            console.log(res.data);
            let keys = [];
            let values = [];
            for (let key in res.data) {
                keys.push(key);
                values.push(res.data[key]);
            }
            console.log(keys);
            console.log(values);
          this.setState({
              stocks: keys,
              vals: values
          });
        }).catch(err => {
          console.log(err);
        })
  }

  render() {
    return (
        <div>
          <h1>test</h1>
          <h1>{this.state.stocks}</h1>
          <h1>{this.state.vals}</h1>
        </div>
    )
  }
}


function App() {
  return (
    <Router>
      <div>
        <Route path="/" component={getStock} />
      </div>
    </Router>
  );
}

export default App;

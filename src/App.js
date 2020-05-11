import React, {useState} from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import logo from './logo.svg';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';



const style = { width: "80%", "maxWidth": "800px", margin: "0 auto" };

const SizeSlide = (props) => {
    const setValue = (val) => {
        props.onChange(props.id, val);
    }
    return <Slider min={-1} max={1} step={0.01} defaultValue={0} onChange={setValue}/>;
}
const RiskSlide = (props) => {
    const setValue = (val) => {
        props.onChange(props.id, val);
    }
    return <Slider min={-1} max={1} step={0.01} defaultValue={0} onChange={setValue}/>;
}
const DivSlide = (props) => {
    const setValue = (val) => {
        props.onChange(props.id, val);
    }
    return <Slider min={0} max={1} step={0.005} defaultValue={0.5} onChange={setValue}/>;
}
const EffSlide = (props) => {
    const setValue = (val) => {
        props.onChange(props.id, val);
    }
    return <Slider min={0} max={1} step={0.005} defaultValue={0.5} onChange={setValue}/>;
}
const ProfitSlide = (props) => {
    const setValue = (val) => {
        props.onChange(props.id, val);
    }
    return <Slider min={0} max={1} step={0.005} defaultValue={0.5} onChange={setValue}/>;
}
const GrowthSlide = (props) => {
    const setValue = (val) => {
        props.onChange(props.id, val);
    }
    return <Slider min={0} max={1} step={0.005} defaultValue={0.5} onChange={setValue}/>;
}
const ValSlide = (props) => {
    const setValue = (val) => {
        props.onChange(props.id, val);
    }
    return <Slider min={0} max={1} step={0.005} defaultValue={0.5} onChange={setValue}/>;
}

const GetStock = (props) => {
  const [values, setValues] = useState({
      vals: {
          size: 0,
          risk: 0,
          dividends: 0.5,
          efficiency: 0.5,
          profitability: 0.5,
          growth: 0.5,
          value: 0.5
      },
      results: []
  });

  const updateVals = (id, value) => {
      setValues({...values, vals: {...values.vals, [id]: value}});
  };

  const sendData = () => {
      axios
          .post('http://localhost:8000/', values.vals)
          .then ((result) => {
              setValues({...values, results: result.data});
              console.log(result)
          })
          .catch((err) => {
              console.log(err.message);
          });
  };

  return (
    <div style = {style}>
        <div style = {{height: "80px"}}>
            <p>Would you prefer a larger or smaller company?</p>
            <p style={{float: "left"}}> smaller </p>
            <p style={{float: "right"}}> larger </p>
            <SizeSlide id={"size"} onChange={updateVals}/>
        </div>
        <div style = {{height: "80px"}}>
            <p>Would you prefer a riskier or less risky company?</p>
            <p style={{float: "left"}}> less risky </p>
            <p style={{float: "right"}}> riskier </p>
            <RiskSlide id={"risk"} onChange={updateVals}/>
        </div>
        <div style = {{height: "80px"}}>
            <p>How important is it to you that a company offers dividends?</p>
            <p style={{float: "left"}}> less important </p>
            <p style={{float: "right"}}> more important </p>
            <DivSlide id={"dividends"} onChange={updateVals}/>
        </div>
        <div style = {{height: "80px"}}>
            <p>How important is it to you that a company handles its assets efficiently?</p>
            <p style={{float: "left"}}> less important </p>
            <p style={{float: "right"}}> more important </p>
            <EffSlide id={"efficiency"} onChange={updateVals}/>
        </div>
        <div style = {{height: "80px"}}>
            <p>How important is it to you that a company is profitable?</p>
            <p style={{float: "left"}}> less important </p>
            <p style={{float: "right"}}> more important </p>
            <ProfitSlide id={"profit"} onChange={updateVals}/>
        </div>
        <div style = {{height: "80px"}}>
            <p>How important is it to you that a company is growing quickly?</p>
            <p style={{float: "left"}}> less important </p>
            <p style={{float: "right"}}> more important </p>
            <GrowthSlide id={"growth"} onChange={updateVals}/>
        </div>
        <div style = {{height: "80px"}}>
            <p>How important is it to you that a stock is priced fairly or better based on underlying numbers?</p>
            <p style={{float: "left"}}> less important </p>
            <p style={{float: "right"}}> more important </p>
            <ValSlide id={"value"} onChange={updateVals}/>
        </div>
        <div>
            <button onClick={sendData}> Submit </button>
        </div>
        <div>
            <h4> Results </h4>
            <ol>
                {values.results.map(ticker => (
                    <li key={ticker}>{ticker}</li>
                ))}
            </ol>
        </div>
    </div>);
}



function App() {
  return (
    <Router>
      <div>
        <Route path="/" component={GetStock} />
      </div>
    </Router>
  );
}

export default App;

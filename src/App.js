import React, {useState} from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Button, Container, Row, Col, Table } from 'react-bootstrap';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';



const style = { width: "80%", margin: "0 auto", padding: "10px"};

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

function Result(props) {
    const clicked = props.clicked;
    if (clicked) {
        return (
            <div>
                <h4> Results </h4>
                <Table>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Ticker</th>
                        <th>Company</th>
                    </tr>
                    </thead>
                    <tbody>
                    {props.result}
                    </tbody>
                </Table>
            </div>
        )
    } else {
        return null;
    }
}

const RenderPage = (props) => {
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
      result: [],
      clicked: false
  });

  const updateVals = (id, value) => {
      setValues({...values, vals: {...values.vals, [id]: value}});
  };

  const sendData = () => {
      axios
          .post('http://localhost:8000/', values.vals)
          .then ((result) => {
              let resultTable = [];
              let counter = 1;
              for (let [ticker, company] of Object.entries(result.data)) {
                  resultTable.push(<tr>
                      <th>{counter}</th>
                      <td>{ticker}</td>
                      <td>{company}</td>
                  </tr>);
                  counter++;
              }
              setValues({...values, result: resultTable, clicked: true});
              console.log(resultTable);
          })
          .catch((err) => {
              console.log(err.message);
          });
  };

  return (
    <div>
        <Container fluid="lg" style = {style}>
            <div style={{textAlign: "center"}}>
                <div style={style}>
                    <h1>Stock Market Recommendation Machine</h1>
                </div>
            </div>
            <div style={{padding: "10px"}}>
                <Row>
                    Would you prefer a larger or smaller company?
                </Row>
                <Row>
                    <SizeSlide id={"size"} onChange={updateVals}/>
                </Row>
                <Row>
                    <Col> smaller </Col>
                    <Col style = {{textAlign: "right"}}> larger </Col>
                </Row>
            </div>
            <div style={{padding: "10px"}}>
                <Row>
                    Would you prefer a riskier or less risky company?
                </Row>
                <Row>
                    <RiskSlide id={"risk"} onChange={updateVals}/>
                </Row>
                <Row>
                    <Col> less risky </Col>
                    <Col style = {{textAlign: "right"}}> more risky </Col>
                </Row>
            </div>
            <div style={{padding: "10px"}}>
                <Row>
                    How important is it to you that a company offers dividends?
                </Row>
                <Row>
                    <DivSlide id={"dividends"} onChange={updateVals}/>
                </Row>
                <Row>
                    <Col> less important </Col>
                    <Col style = {{textAlign: "right"}}> more important </Col>
                </Row>
            </div>
            <div style={{padding: "10px"}}>
                <Row>
                    How important is it to you that a company handles its assets efficiently?
                </Row>
                <Row>
                    <EffSlide id={"efficiency"} onChange={updateVals}/>
                </Row>
                <Row>
                    <Col> less important </Col>
                    <Col style = {{textAlign: "right"}}> more important </Col>
                </Row>
            </div>
            <div style={{padding: "10px"}}>
                <Row>
                    How important is it to you that a company is profitable?
                </Row>
                <Row>
                    <ProfitSlide id={"profitability"} onChange={updateVals}/>
                </Row>
                <Row>
                    <Col> less important </Col>
                    <Col style = {{textAlign: "right"}}> more important </Col>
                </Row>
            </div>
            <div style={{padding: "10px"}}>
                <Row>
                    How important is it to you that a company is growing quickly?
                </Row>
                <Row>
                    <GrowthSlide id={"growth"} onChange={updateVals}/>
                </Row>
                <Row>
                    <Col> less important </Col>
                    <Col style = {{textAlign: "right"}}> more important </Col>
                </Row>
            </div>
            <div style={{padding: "10px"}}>
                <Row>
                    How important is it to you that a stock is priced fairly or better based on underlying numbers?
                </Row>
                <Row>
                    <ValSlide id={"value"} onChange={updateVals}/>
                </Row>
                <Row>
                    <Col> less important </Col>
                    <Col style = {{textAlign: "right"}}> more important </Col>
                </Row>
            </div>
            <div style={{textAlign: "center"}}>
                <div style={{display: "inline-block"}}>
                    <Button variant="primary" onClick={sendData}> Submit </Button>
                </div>
            </div>
            <Result result={values.result} clicked={values.clicked} />
        </Container>
    </div>);
}

function App() {
  return (
    <Router>
      <div>
        <Route path="/" component={RenderPage} />
      </div>
    </Router>
  );
}

export default App;

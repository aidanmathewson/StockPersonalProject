const express = require('express');
const connectDB = require('./config/db');
const axios = require('axios');
const cheerio = require('cheerio');
const csv = require("csv-parser");
const fs = require("fs");
const cors = require("cors");
const stocks = require('./routes/api/stocks');
const user = require('./routes/api/user');
const bodyParser = require('body-parser');
const server = express();
const Stock = require('./models/Stock');
connectDB();


let companies = parseAll();
let scores = {};
let finalScores = {}
const RETURN_NUMBER = 20;

server.use(cors({ origin: true, credentials: true }));
server.use('/api/stocks', stocks);
server.use('/api/user', user);
server.use(bodyParser.json());

server.get('/', (req, res) => res.json(parseAll()));
server.get('/scrape', (req, res) => {
    scrapeAll();
    res.json("scraping");
});
server.post('/', (req,res) => {
    handleRequest(req.body)
        .then((stocks) => {
            res.json(stocks);
        }).catch((err) => {
        res.status(400).json({ error: "unable to get score"})
    });
});

const port = process.env.PORT || 8000;

server.listen(port, () => console.log(`Server running on port ${port}`));

//size, risk, dividends, efficiency, profitability, growth, value

function handleRequest(userScore) {
    console.log(userScore);
    let companies = [];
    let scores = {};
    let companyScores = Stock.find()
        .then((stocks) => {
            for (let company of stocks) {
                companies.push(company["ticker"]);
                scores[company["ticker"]] = calcScore(userScore, company);
            }
            console.log(scores);
            return returnStocks(scores, companies);
        })
        .catch((err) => {
            return  { msg: "no stocks in db!" };
        });
    return companyScores;
}

function calcScore(userScore, stockScore) {
    let score = 0;
    for (let category in userScore) {
        score += userScore[category] * stockScore[category];
    }
    return score;
}

function marketCap(mCap) {
    if (mCap > 10000000000) {
        return 1;
    } else if (mCap > 2000000000) {
        return 0;
    } else {
        return -1;
    }
}

function  peRatio(pe) {
    return Math.max(Math.min(pe/40, 2), -1); //average pe is close to 20, giving an average company a score of 0.5
}

function profitMargin(margin) {
    return Math.max(Math.min(margin/0.3, 2), -1);
}

function operatingMargin(margin) {
    return Math.max(Math.min(margin/0.4, 2), -1);
}

function returnOnAssets(roa) {
    return Math.max(Math.min(roa/0.05, 2), -1);
}

function returnOnEquity(roe) {
    return Math.max(Math.min(roe/0.2, 2), -1);
}

function dividendYield(div) {
    return Math.max(Math.min(div/0.05, 2), -1);
}

function pegRatio(peg) {
    if(peg === 0) {
        return 0;
    } else {
        return Math.max(Math.min(1 / peg, 2), -1);
    }
}

function returnStocks(scores, companies) {
    companies.sort((a,b) => {
        return scores[b] - scores[a];
    });
    return companies.slice(0,RETURN_NUMBER);
}

function calcIndexes (data) {
    let result = {};
    result["size"] = marketCap(data["Market Cap (intraday)"]);
    result["risk"] = data["Beta (5Y Monthly)"];
    result["dividends"] = dividendYield(data["Forward Annual Dividend Yield"]);
    result["efficiency"] = returnOnAssets(data["Return on Assets (ttm)"]);
    result["profitability"] = (profitMargin(data["Profit Margin"]) +
                               operatingMargin(data["Operating Margin (ttm)"]) +
                               returnOnEquity(data["Return on Equity (ttm)"])) / 3;
    result["growth"] = peRatio(data["Forward P/E"]);
    result["value"] = pegRatio(data["PEG Ratio (5 yr expected)"]);
    return result;
}

function scrape(ticker) {
    return axios("https://ca.finance.yahoo.com/quote/" + ticker + "/key-statistics")
        .then((response) => {
            console.log(ticker);
            let $ = cheerio.load(response.data);
            let table = $('tbody');
            let vals = {};
            table.each(function() {
                for (let i = 0; i < this.childNodes.length; i++) {
                    let val = convertToNum($(this.childNodes[i].childNodes[1]).text());
                    vals[removeFootnotes($(this.childNodes[i].childNodes[0]).text().trim())] = val;
                }
            });
            return vals;
        })
        .catch(function (err) {
            console.log("error");
            throw err;
        });
}

function scrapeAll() {
    let data = {}
    for (let company in companies) {
        data[company] = scrape(company)
            .then((response) => {
                let temp = calcIndexes(response);
                temp["ticker"] = company;
                Stock.findOneAndUpdate({ticker: company}, temp, {upsert: true, new: true})
                    .then((result) => {
                        console.log(company + " posted");
                    })
                    .catch((err) => {
                        console.log("couldn't post " + company);
                        console.error(err.message);
                    });
            })
            .catch((err) => {
                console.log("couldn't find stock page");
            });
    }
    return data;
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

function removeFootnotes(data) {
    let nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    if (nums.includes(data.slice(-1))) {
        return data.slice(0,-2);
    } else {
        return data;
    }
}

function convertToNum(text) {
    text = text.replace(/,/g, "");
    let last = text[text.length - 1];
    switch(last) {
        case "T":
            text = Number(text.slice(0,-1)) * 1000000000000;
            break;
        case "B":
            text = Number(text.slice(0,-1)) * 1000000000;
            break;
        case "M":
            text = Number(text.slice(0,-1)) * 1000000;
            break;
        case "k":
            text = Number(text.slice(0,-1)) * 1000;
            break;
        case "%":
            text = Number(text.slice(0,-1)) / 100.0;
            break;
        case "A":
            text = 0;
            break;
        default:
            text = Number(text);
    }
    return text;
}


function parseAll() {
    let result = {};
    let tickers = fs.readFileSync('./data/russell3000.csv')
      .toString()
       .split('\r\n');
    for (let stock of tickers) {
       stock = stock.split(",");
       result[stock[0]] = stock[1];
    }
    return result;
}

module.exports = {handleRequest};
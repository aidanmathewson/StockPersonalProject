const express = require('express');
const connectDB = require('./config/db');
const axios = require('axios');
const cheerio = require('cheerio');
const csv = require("csv-parser");
const fs = require("fs");
const cors = require("cors");

const server = express();
connectDB();

let companies = [];
let scores = {};
let finalScores = {}
let user = {};
const RETURN_NUMBER = 20;

server.use(cors({ origin: true, credentials: true }));

server.get('/', (req, res) => res.json(parseAll()));
server.get('/scrape', (req, res) => {
    scrape("TSLA")
        .then((data) => {
            res.json(data);
        });
});
server.get('/testscore', (req, res) => {
    let companies = [];
    for (let company in parseAll()) {
        companies.push(company);
    }
    testPopulate(companies);
    for (let company of companies) {
        finalScores[company] = calcScore(user, scores[company]);
    }
    res.json(returnStocks(finalScores, companies));
});
server.get('/testscore2/:ticker', (req, res) => {
    scrape(req.params.ticker)
        .then((data) => {
            res.json(calcIndexes(data));
        });
});


let config = {
    headers: {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp, image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "Accept-Encoding": "gzip",
        "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36"
    }
}

const port = process.env.PORT || 8000;

server.listen(port, () => console.log(`Server running on port ${port}`));

function testPopulate(companies) {
    for (let company of companies) {
        scores[company] = {
            "size": Math.random()*20000000000,
            "risk": Math.random() * 2 - 1,
            "dividends": Math.random(),
            "efficiency": Math.random(),
            "profitability": Math.random(),
            "growth": Math.random(),
            "value": Math.random()
        };
    }
    user = {
        "size": 1,
        "risk": 1,
        "dividends": 0.25,
        "efficiency": 1,
        "profitability": 0.75,
        "growth": 1,
        "value": 0.2
    };
}

//size, risk, dividends, efficiency, profitability, growth, value

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
    return pe/40; //average pe is close to 20, giving an average company a score of 0.5
}

function profitMargin(margin) {
    return margin/0.3;
}

function operatingMargin(margin) {
    return margin/0.4;
}

function returnOnAssets(roa) {
    return roa/0.05;
}

function returnOnEquity(roe) {
    return roe/0.2;
}

function dividendYield(div) {
    return div/0.05;
}

function pegRatio(peg) {
    return 1/peg;
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
    return axios("https://ca.finance.yahoo.com/quote/" + ticker + "/key-statistics", config)
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
            return err;
        });
}

function scrapeAll() {
    let data = {}
    for (let company in companies) {
        data[company] = scrape(company)
            .then((response) => {
                return response;
            });
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
    let tickers = fs.readFileSync('./src/russell3000.csv')
      .toString()
       .split('\r\n');
    for (let stock of tickers) {
       stock = stock.split(",");
       result[stock[0]] = stock[1];
    }
    return result;
}
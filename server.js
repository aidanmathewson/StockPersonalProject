const express = require('express');
const connectDB = require('./config/db');
const axios = require('axios');
const cheerio = require('cheerio');
const csv = require("csv-parser");
const fs = require("fs");
const cors = require("cors");

const server = express();
connectDB();
server.use(cors({ origin: true, credentials: true }));

let tickers;

server.get('/', (req, res) => res.json(parseAll()));
server.get('/scrape', (req, res) => {
    scrape("AAPL")
        .then((data) => {
            res.json(data);
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

//size, risk, dividends, efficiency, profitability, growth, value, sum

function calcScore(userScore, stockScore) {
    let sum = userScore["sum"];
    let score = 0;
    for (let category in userScore) {
        userScore[category] = userScore[category]/sum;
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

function calcIndexes (data) {
    let result = {};
    result["size"] = marketCap(data["Market Cap (intraday) 5"]);
    result["risk"] = data["Beta (5Y Monthly)"];
    result["dividends"] = dividendYield(data["Forward Annual Dividend Yield 4"]);
    result["efficiency"] = returnOnAssets(data["Return on Assets (ttm)"]);
    result["profitability"] = (profitMargin(data["Profit Margin"]) +
                               operatingMargin(data["Operating Margin (ttm)"]) +
                               returnOnEquity(data["Return on Equity (ttm)"])) / 3;
    result["growth"] = peRatio(data["Trailing P/E"]);
    result["value"] = pegRatio(data["PEG Ratio (5 yr expected) 1"]);
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
                    if (val) {
                        vals[$(this.childNodes[i].childNodes[0]).text().trim()] = val;
                    }
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
    for (let company of parseAll()) {
        data[company] = scrape(company)
            .then((response) => {
                return response;
            });
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
   tickers = fs.readFileSync('./src/russell3000.csv')
      .toString()
       .split(',');
   console.log(tickers);
   return tickers;
}
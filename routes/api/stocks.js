const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const Stock = require('../../models/Stock');

router.get('/', (req,res) => {
    Stock.find()
        .then((stocks) => {
            res.json(stocks);
        }).catch((err) => {
        res.status(404).json({ nostockfound: "no stocks in database"})
    });
});

router.get('/:ticker', (req,res) => {
    console.log(req.params.ticker);
    Stock.findOne({ticker: req.params.ticker})
        .then((stock) => {
            res.json(stock);
        }).catch((err) => {
            res.status(404).json(err.message);
        });
});

router.put('/:ticker', (req,res) => {
    console.log(req.params.ticker);
    Stock.findOneAndUpdate({ticker: req.params.ticker}, req.body, {upsert: true, new: true})
        .then((stock) => {
            res.json({ msg: "added stock successfully" });
        }).catch((err) => {
        res.status(400).json({ error: "unable to add stock"})
    });
});

router.post('/:ticker', (req,res) => {
    console.log(req.body);
    Stock.create(req.body)
        .then((item) => {
            res.json({ msg: "added stock successfully" });
        }).catch((err) => {
        res.status(400).json({ error: "unable to add stock"})
    });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const server = require('../../server');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const User = require('../../models/User');


router.get('/', (req,res) => {
    console.log(req.params.ticker);
    User.findOne({ticker: req.params.ticker})
        .then((stock) => {
            res.json(JSON.parse(stock));
        }).catch((err) => {
        res.status(404).json({ nostockfound: "user does not exist in database"})
    });
});

router.put('/:id', (req,res) => {
    console.log(req.params.ticker);
    User.findByIdAndUpdate(req.body)
        .then((user) => {
            res.json({ msg: "unable to calculate score" });
        }).catch((err) => {
        res.status(400).json({ error: "unable to add stock"})
    });
});

router.post('/', (req,res) => {
    server.handleRequest(req.body)
        .then((stocks) => {
            res.json(stocks);
        }).catch((err) => {
        res.status(400).json({ error: "unable to get score"})
    });
});

module.exports = router;
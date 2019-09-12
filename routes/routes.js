const express = require('express');

const router = express.Router();

router.get('/', function(req, res){
  res.render('global/index', {title: 'Barbershop'});
});

module.exports = router;
const express = require('express');

const routes = require('./routes/routes');

const app = express();

app.listen(3000);

app.use(express.urlencoded({ extended: false }));
app.use('/', express.static('public'));
app.set('view engine', 'pug');
app.use(routes);
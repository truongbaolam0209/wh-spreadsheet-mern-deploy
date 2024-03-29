require('lt-utils');
require('./mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const cors = require('./modules/cors');
const errorHandler = require('./modules/error-handler');
const routes = require('./routes');

const app = express();


app.use(cors);

app.use(bodyParser.json({
    limit: '100mb'
}));

app.use(routes);

app.use(errorHandler);

const port = process.env.PORT || 8081;
app.listen(port, (err) => console.log(err || `Server listening on port : '${port}'!`));

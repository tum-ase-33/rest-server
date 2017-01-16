'use strict';

const path = require('path');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');

const middleware = require('./middleware');
const services = require('./services');
const auth = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');

const app = feathers();

app.configure(configuration(path.join(__dirname, '..')));

const whitelist = app.get('corsWhitelist');
const corsOptions = {
  origin(origin, callback){
    const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  }
};

app.use(compress())
  .options('*', cors(corsOptions))

  .use(cors(corsOptions))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(hooks())
  .configure(rest())
  .configure(services)
  .configure(middleware);

module.exports = app;

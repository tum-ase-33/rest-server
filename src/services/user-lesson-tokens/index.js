'use strict';

const service = require('feathers-mongoose');
const user-lesson-tokens = require('./user-lesson-tokens-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: user-lesson-tokens,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/user-lesson-tokens', service(options));

  // Get our initialize service to that we can bind hooks
  const user-lesson-tokensService = app.service('/user-lesson-tokens');

  // Set up our before hooks
  user-lesson-tokensService.before(hooks.before);

  // Set up our after hooks
  user-lesson-tokensService.after(hooks.after);
};

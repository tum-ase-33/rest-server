'use strict';

const service = require('feathers-mongoose');
const userLessonTokens = require('./UserLessonTokens-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: userLessonTokens,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/user-lesson-tokens', service(options));

  // Get our initialize service to that we can bind hooks
  const userLessonTokensService = app.service('/user-lesson-tokens');

  // Set up our before hooks
  userLessonTokensService.before(hooks.before);

  // Set up our after hooks
  userLessonTokensService.after(hooks.after);
};

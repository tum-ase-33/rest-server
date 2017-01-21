'use strict';

const service = require('feathers-mongoose');
const lessons = require('./lessons-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: lessons,
    lean: true,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/lessons', service(options));

  // Get our initialize service to that we can bind hooks
  const lessonsService = app.service('/lessons');

  // Set up our before hooks
  lessonsService.before(hooks.before);

  // Set up our after hooks
  lessonsService.after(hooks.after);
};

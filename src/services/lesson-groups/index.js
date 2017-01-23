'use strict';

const service = require('feathers-mongoose');
const lessonGroups = require('./lesson-groups-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: lessonGroups,
    lean: true,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/lesson-groups', service(options));

  // Get our initialize service to that we can bind hooks
  const lessonGroupsService = app.service('/lesson-groups');

  // Set up our before hooks
  lessonGroupsService.before(hooks.before);

  // Set up our after hooks
  lessonGroupsService.after(hooks.after);
};

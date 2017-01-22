'use strict';

const service = require('feathers-mongoose');
const userLessonAssignments = require('./user-lesson-assignments-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: userLessonAssignments,
    lean: true,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/user-lesson-assignments', service(options));

  // Get our initialize service to that we can bind hooks
  const userLessonAssignmentsService = app.service('/user-lesson-assignments');

  // Set up our before hooks
  userLessonAssignmentsService.before(hooks.before);

  // Set up our after hooks
  userLessonAssignmentsService.after(hooks.after);
};

'use strict';
const userLessonAssignments = require('./user-lesson-assignments');
const authentication = require('./authentication');
const user = require('./user');
const userLessonTokens = require('./user-lesson-tokens');
const lessons = require('./lessons');
const mongoose = require('mongoose');
module.exports = function() {
  const app = this;

  mongoose.connect(app.get('mongodb'));
  mongoose.Promise = global.Promise;

  app.use((req, res, next) => {
    req.feathers.headers = req.headers;
    next();
  });

  app.configure(authentication);
  app.configure(user);
  app.configure(lessons);
  app.configure(userLessonTokens);
  app.configure(userLessonAssignments);
};

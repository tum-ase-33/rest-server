'use strict';

// const userLessonTokens = require('./user-lesson-tokens');

// const lessons = require('./lessons');

const users = require('./users');

const mongoose = require('mongoose')

module.exports = function() {
  const app = this;

  mongoose.connect(app.get('mongodb'));
  mongoose.Promise = global.Promise;

  app.configure(users);
  // app.configure(lessons);
  // app.configure(userLessonTokens);
};

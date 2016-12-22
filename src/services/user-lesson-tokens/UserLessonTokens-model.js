'use strict';

// user-lesson-tokens-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TagSchema = new Schema({
  name: { type: String, required: true },
  data: { type: Schema.Types.Mixed }, // additional information if required
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
});

const UserLessonTokensSchema = new Schema({
  salt: { type: String, required: true }, // salt for generating unique and safe tokens of _id attr
  tags: [TagSchema], // tag information to this token, e.g. history
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
});

const UserLessonTokensModel = mongoose.model('user_lesson_tokens', UserLessonTokensSchema);

module.exports = UserLessonTokensModel;

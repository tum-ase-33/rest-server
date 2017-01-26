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
  token: { type: String, required: true, unique: true },
  tags: [TagSchema], // tag information to this token, e.g. history
  lessonGroupId: {
    type: Schema.ObjectId,
    ref: 'lesson_groups',
    required: true
  },
  userId: {
    type: Schema.ObjectId,
    ref: 'users',
    required: true
  },
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
});

const UserLessonTokensModel = mongoose.model('user_lesson_tokens', UserLessonTokensSchema);

module.exports = UserLessonTokensModel;

'use strict';

// user-lesson-assignments-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userLessonAssignmentSchema = new Schema({
  userId: {
    ref: 'user',
    type: Schema.ObjectId,
    required: true
  },
  lessonId: {
    ref: 'lesson',
    type: Schema.ObjectId,
    required: true
  },
  roles: [{
    type: String,
    enums: ['student', 'admin', 'tutor'],
    required: true,
  }],
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
});

userLessonAssignmentSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

const userLessonAssignmentModel = mongoose.model('user_lesson_assignments', userLessonAssignmentSchema);

module.exports = userLessonAssignmentModel;

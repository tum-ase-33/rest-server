'use strict';

// UserLessonRoles-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserLessonRolesSchema = new Schema({
  lessonId: { type: Schema.ObjectId, ref: 'lessons', required: true },
  userId: { type: Schema.ObjectId, ref: 'users', required: true },
  roles: [{
    type: String,
    enums: ['student', 'tutor', 'admin']
  }],
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
});

const UserLessonRolesModel = mongoose.model('user_lesson_roles', UserLessonRolesSchema);

module.exports = UserLessonRolesModel;

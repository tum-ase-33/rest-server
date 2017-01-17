'use strict';

// LessonGroups-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LessonGroupsSchema = new Schema({
  number: { type: Number, required: true },
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
});

const LessonGroupsModel = mongoose.model('LessonGroups', LessonGroupsSchema);

module.exports = LessonGroupsModel;

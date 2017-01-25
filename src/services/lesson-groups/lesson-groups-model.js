'use strict';

// lesson-groups-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lessonGroupsSchema = new Schema({
  name: { type: String, required: true },
  dates: [Date],
  lessonId: { type: Schema.ObjectId, ref: 'lessons', required: true },
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
});

lessonGroupsSchema.index({ name: 1, lessonId: 1 }, { unique: true });

const lessonGroupsModel = mongoose.model('lesson-groups', lessonGroupsSchema);

module.exports = lessonGroupsModel;

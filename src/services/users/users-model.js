'use strict';

// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
});

const usersModel = mongoose.model('users', usersSchema);

module.exports = usersModel;

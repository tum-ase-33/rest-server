'use strict';

// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
  matrikelNr: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now },
  email: {type:String, required: true, unique: true},
  password: {type:String, required:true},
  roles: [{type: String}]
});

const usersModel = mongoose.model('users', usersSchema);

module.exports = usersModel;

'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const errors = require('feathers-errors');

exports.before = {
  all: [
    (hook) => {
      if (hook.app.get('cronjob.token') === hook.params.headers['x-cronjob-token']) {
        throw new errors.Forbidden('You are not allowed to create tokens! ');
      }
    }
  ],
  find: [],
  get: [],
  create: [],
  update: [
    hooks.disable('external')
  ],
  patch: [
  ],
  remove: [
    hooks.disable('external')
  ]
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

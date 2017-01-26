'use strict';

const hooks = require('feathers-hooks');
const commonHooks = require('feathers-hooks-common');
const errors = require('feathers-errors');
const uuidV4 = require('uuid/v4');

exports.before = {
  all: [
    commonHooks.iff(
      (hook) => hook.params.provider === 'rest',
      (hook) => {
        if (hook.app.get('cronjob').token !== hook.params.headers['x-cronjob-token']) {
          throw new errors.Forbidden('You are not allowed to create tokens! ');
        }
      }
    )
  ],
  find: [],
  get: [],
  create: [
    hooks.remove('token'),
    (hook) => {
      hook.data.token = uuidV4();
    }
  ],
  update: [
    hooks.disable('external')
  ],
  patch: [
    hooks.remove('token', 'lessonGroupId', 'userId'),
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

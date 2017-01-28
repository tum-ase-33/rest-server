'use strict';

const hooks = require('feathers-hooks');
const commonHooks = require('feathers-hooks-common');
const auth = require('feathers-authentication').hooks;
const errors = require('feathers-errors');
const uuidV4 = require('uuid/v4');

const cronjobHook = commonHooks.iff(
  (hook) => hook.params.provider === 'rest',
  (hook) => {
    if (hook.app.get('cronjob').token !== hook.params.headers['x-cronjob-token']) {
      throw new errors.Forbidden('You are not allowed to create tokens! ');
    }
  }
);

exports.before = {
  all: [],
  find: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    function (hook) {
      if (hook.params.provider === 'rest') {
        const userId = hook.params.query.userId || hook.params.user._id;
        if (userId.toString() !== hook.params.user._id.toString()) {
          throw new errors.Forbidden('You are not allowed to access other users tokens!');
        }
      }
    },
    function (hook) {
      if (hook.params.provider === 'rest') {
        hook.params.query.userId = hook.params.user._id;
      }
    }
  ],
  get: [cronjobHook],
  create: [
    cronjobHook,
    hooks.remove('token'),
    (hook) => {
      hook.data.token = uuidV4();
    }
  ],
  update: [
    cronjobHook,
    hooks.disable('external')
  ],
  patch: [
    cronjobHook,
    hooks.remove('token', 'lessonGroupId', 'userId'),
  ],
  remove: [
    cronjobHook,
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

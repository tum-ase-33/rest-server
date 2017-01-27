'use strict';

const hooks = require('feathers-hooks');
const commonHooks = require('feathers-hooks-common');
const errors = require('feathers-errors');
const auth = require('feathers-authentication').hooks;
const populateLessonRoles = require('../../user-lesson-assignments/hooks/populateRoles');

exports.before = {
  all: [],
  find: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ],
  get: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),

    commonHooks.iff(
      (hook) => hook.params.provider === 'rest',
      populateLessonRoles(),
      (hook) => {
        if (hook.params.lessonRoles.indexOf('admin') === -1 && hook.params.lessonRoles.indexOf('tutor') === -1) {
          throw new errors.Forbidden('You are not allowed to access this area. You have to be a tutor or an admin.');
        }
      }
    )
  ],
  create: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToRoles({
      roles: ['admin'],
      ownerField: 'roles'
    }),
  ],
  update: [
    hooks.disable('external')
  ],
  patch: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),

    commonHooks.iff(
      (hook) => hook.params.provider === 'rest',
      populateLessonRoles(),
      (hook) => {
        if (hook.params.lessonRoles.indexOf('admin') === -1 && hook.params.lessonRoles.indexOf('tutor') === -1) {
          throw new errors.Forbidden('You are not allowed to access this area. You have to be a tutor or an admin.');
        }
      }
    )
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

'use strict';

const hooks = require('feathers-hooks');
const commonHooks = require('feathers-hooks-common');
const errors = require('feathers-errors');
const auth = require('feathers-authentication').hooks;
const populateRoles = require('../../user-lesson-assignments/hooks/populateRoles');


exports.before = {
  all: [],
  find: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    (hook) => {
      if (!hook.params.query.lessonId) {
        throw new errors.BadRequest('You have to specify a lessonId parameter');
      }
    }
  ],
  get: [
    hooks.disable('external')
  ],
  create: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    commonHooks.iff(
      (hook) => hook.params.provider === 'rest',
      (hook) => populateRoles({ query: { lessonId: hook.data.lessonId, userId: hook.params.user._id } })(hook),
      (hook) => {
        if (hook.params.lessonRoles.indexOf('admin') === -1 && hook.params.lessonRoles.indexOf('tutor') === -1) {
          throw new errors.Forbidden('You are not allowed to access this area. You have to be a tutor or an admin.');
        }
      }
    )
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
      (hook) =>
        hook.service.get(hook.id)
          .then(lessonGroup =>
            populateRoles({ query: { lessonId: lessonGroup.lessonId, userId: hook.params.user._id } })(hook)
          ),
      (hook) => {
        if (hook.params.lessonRoles.indexOf('admin') === -1 && hook.params.lessonRoles.indexOf('tutor') === -1) {
          throw new errors.Forbidden('You are not allowed to access this area. You have to be a tutor or an admin.');
        }
      }
    )
  ],
  remove: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    commonHooks.iff(
      (hook) => hook.params.provider === 'rest',
      (hook) =>
        hook.service.get(hook.id)
          .then(lessonGroup =>
            populateRoles({ query: { lessonId: lessonGroup.lessonId, userId: hook.params.user._id } })(hook)
          ),
      (hook) => {
        if (hook.params.lessonRoles.indexOf('admin') === -1 && hook.params.lessonRoles.indexOf('tutor') === -1) {
          throw new errors.Forbidden('You are not allowed to access this area. You have to be a tutor or an admin.');
        }
      }
    )
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

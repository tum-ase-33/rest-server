'use strict';

const globalHooks = require('../../../hooks');
const commonHooks = require('feathers-hooks-common');
const hooks = require('feathers-hooks');
const errors = require('feathers-errors');
const auth = require('feathers-authentication').hooks;
const populateRoles = require('./populateRoles');

exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ],
  find: [
    commonHooks.iff(
      (hook) => hook.params.provider === 'rest',
      populateRoles(),
      (hook) => {
        if (hook.params.lessonRoles.indexOf('admin') === -1 && hook.params.lessonRoles.indexOf('tutor') === -1) {
          throw new errors.Forbidden('You are not allowed to access this area. You have to be a tutor or an admin.');
        }
      }
    )
  ],
  get: [
    hooks.disable('external'),
  ],
  create: [
    populateRoles(),
    hooks.remove('roles'),
    (hook) => {
      // only admins are allowed to choose custom lesson roles!
      if (hook.params.lessonRoles.indexOf('admin') === -1) {
        hook.data.roles = ['student'];
      }
    }
  ],
  update: [
    hooks.disable('external'),
  ],
  patch: [
    hooks.disable('external'),
  ],
  remove: [
    (hook) => populateRoles({ query: { _id: hook.params.id } })(hook),
    function(hook) {
      if (hook.params.lessonRoles.indexOf('admin') === -1) {
        console.log('Check owner');
        console.log(hook.params.user);
        return auth.restrictToOwner({ ownerField: 'userId' }).call(this, hook);
      }
    }
  ]
};

exports.after = {
  all: [],
  find: [
    (hook) => {
      hook.params.provider = 'internal';
    },
    commonHooks.populate('user', {
      service: 'users',
      field: 'userId'
    })
  ],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

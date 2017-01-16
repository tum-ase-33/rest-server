'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks-common');
const authentication = require('feathers-authentication');
const permissions = require('feathers-permissions');

exports.before = {
  all: [
    authentication.hooks.authenticate('jwt'),
    permissions.hooks.checkPermissions({service: 'users', on: 'user', field: 'roles'}),
    permissions.hooks.isPermitted()
  ],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
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

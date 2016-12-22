'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('users service', function() {
  it('registered the users service', () => {
    assert.ok(app.service('users'));
  });

  describe('find()', () => {
    it('only lesson admins should be able to receive students', () => {

    });

    it('only users assigned to a lesson should be returned', () => {

    });

    it('only users of a specific lesson should be able to request', () => {

    });

    it('list should only contain a matrikelnumber (id)', () => {

    });
  });

  describe('get(id)', () => {
    it('owners should be able to receive their own profile', () => {

    });

    it('unauthorized persons should not be able to receive a single profile', () => {

    });
  });

  describe('post(data)', () => {
    it('should create new account', () => {

    });

    it('should not be possible to create a duplicate account', () => {

    });

    it('unauthorized requests should not be possible to create accounts', () => {

    });
  });

  describe('put(id, data)', () => {
    it('Replacing all data be disabled', () => {

    });
  });

  describe('patch(id, data)', () => {
    it('owners should be able to modify their own profile', () => {

    });

    it('account should only update information contained in the request', () => {

    });

    it('unauthorized persons should not be able to update a single profile', () => {

    });
  });

  describe('delete(id)', () => {
    it('Removing a user should be disabled', () => {

    });
  });
});

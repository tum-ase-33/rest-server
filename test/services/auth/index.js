'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('auth service', function() {
  it('should be able to authenticate with a token', () => {
    // TODO: send POST /auth/token
  });

  it('should restrict if no token is provided', () => {
    // TODO: send POST /auth/token without token parameter
  });

  it('should restrict with invalid token', () => {
    // TODO: send POST /auth/token with invalid token
  });
});

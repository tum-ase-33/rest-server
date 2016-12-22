'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('user-lesson-tokens service', function() {
  it('registered the user-lesson-tokens service', () => {
    assert.ok(app.service('user-lesson-tokens'));
  });
});

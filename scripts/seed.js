const app = require('../src/app');

// create initial superadmin user
const User = app.service('users');
const data = require('./superadmin');
User.create(data)
  .then(user => {
    return Promise.resolve();
  })
  .catch(console.error);

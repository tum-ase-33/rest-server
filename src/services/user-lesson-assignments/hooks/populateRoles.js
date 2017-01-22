const errors = require('feathers-errors');

module.exports = (options = {}) => (hook) => {
  if (!hook.params.user) {
    return Promise.reject(new errors.NotAuthenticated('User is not authenticated'));
  }

  let lessonId, query = options.query;
  if (!query) {
    const userId = hook.params.user._id;
    if (hook.params.query && hook.params.query.lessonId) {
      lessonId = hook.params.query.lessonId;
    } else if (hook.data && hook.data.lessonId) {
      lessonId = hook.data.lessonId;
    } else if (hook.params.id) {
      lessonId = hook.params.id;
    } else {
      return Promise.reject(new errors.BadRequest('Request has no param /:id or ?lessonId=:id'));
    }
    query = { userId, lessonId };
  }

  if (hook.params.provider !== 'rest') {
    // mock admin roles for all internal requests: Only external requests are protected, internal ones are not!
    hook.params.lessonRoles = ['admin'];
    return Promise.resolve(hook);
  }
  return hook.app.service('user-lesson-assignments').find(Object.assign({}, hook.params, {
    provider: 'internal',
    query
  }))
    .then(lessons => {
      let output;
      if (lessons.total > 0) {
        output = lessons.data[0].roles;
      } else {
        console.warn('User lesson relation does not exist');
        output = [];
      }
      return Promise.resolve(output);
    })
    .then(roles => {
      hook.params.lessonRoles = roles;
      return Promise.resolve(hook);
    });
};

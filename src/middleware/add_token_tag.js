'use strict';

const errors = require('feathers-errors');

module.exports = function(app) {
  return function(req, res, next) {
    if (req.headers['x-scanner-client-token'] !== app.get('scanner').token) {
      next(new errors.Forbidden('Invalid scanner token'));
    }

    const UserLessonTokenService = app.service('user-lesson-tokens');
    // TODO: check later also for correct group ids
    UserLessonTokenService.find({
      query: { token: req.params.token }
    })
      .then(tokens => {
        if (tokens.total > 0) {
          return Promise.resolve(tokens.data[0]);
        } else {
          return Promise.reject(new errors.NotFound('Token not found'));
        }
      })
      .then(token => {
        const now = new Date();
        const expiredInMs = new Date(token.createdAt.getTime() + app.get('userGroupSessionTokenExpiresInSec') * 1000).getTime();

        // created: 2 AM
        // expires: 4 AM
        //
        if (now.getTime() >= token.createdAt.getTime() && now.getTime() <= expiredInMs) {
          return Promise.resolve(token);
        } else {
          return Promise.reject(new errors.NotFound('Token expired'));
        }
      })
      .then(token => {
        // tag is not registered yet
        if (token.tags.filter(tag => tag.name === req.body.tag.name).length === 0) {
          return Promise.resolve(token);
        } else {
          return Promise.reject(new errors.Conflict('Tag was still registered'));
        }
      })
      .then(token => {
        return UserLessonTokenService.patch(token._id, {
          tags: token.tags.concat([req.body.tag])
        });
      })
      .then(createdLesson => {
        res.json(createdLesson);
      })
      .catch(error => {
        console.error(error);
        next(error);
      });
  };
};

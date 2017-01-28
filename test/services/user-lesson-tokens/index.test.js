'use strict';


const assert = require('assert');
const app = require('../../../src/app');
const User = app.service('users');
const Lesson = app.service('lessons');
const userLessonAssignments = app.service('user-lesson-assignments');
const chai = require('chai');
const chaiHttp = require('chai-http');
const bodyParser = require('body-parser');
const authentication = require('feathers-authentication/client');
let lessonId, lessonId2, token, token2, userId, userId2, user, user2;

//config for app to do authentication
app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(authentication());
//use http plugin
chai.use(chaiHttp);
//use should
const should = chai.should();

describe('user-lesson-tokens service', function () {
  it('registered the user-lesson-tokens service', () => {
    assert.ok(app.service('user-lesson-tokens'));
  });

  let userCounter = 0;
  const createUser = () => {
    userCounter += 1;
    const email = 'email' + userCounter + '@test.de';
    const password = 'igzSwi7*Creif4V$';
    return User.create({
      matrikelNr: 'mnr' + userCounter,
      email,
      password
    })
      .then((user) => new Promise((resolve) => {
        let userId = user._id;
        chai.request(app)
        //request to /auth/local
          .post('/auth/local')
          //set header
          .set('Accept', 'application/json')
          //send credentials
          .send({
            email,
            password
          })
          //when finished
          .end((err, res) => {
            //set token for auth in other requests
            let token = res.body.token;
            resolve([userId, token, user]);
          });
      }))
      .then((data) => {
        return Promise.resolve(data);
      });
  };

  before(() =>
    new Promise(resolve => {
      this.server = app.listen(3030);
      //once listening do the following
      this.server.once('listening', () => resolve());
    })
      .then(() => createUser())
      .then(([createdUserId, createdUserToken, createdUser]) => {
        token = createdUserToken;
        userId = createdUserId;
        user = createdUser;

        return createUser();
      })
      .then(([createdUserId, createdUserToken, createdUser]) => {
        token2 = createdUserToken;
        userId2 = createdUserId;
        user2 = createdUser;

        return Promise.resolve();
      })
  );

  after((done) => {
    User.remove(null, { user, token })
      .then(() => {
        this.server.close(done);
      });
  });

  describe('list()', () => {
    it('Should be only accessible for authenticated users', (done) => {
      chai.request(app)
        .get(`/user-lesson-tokens`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(401);
          done();
        });
    });

    it('Should not be only possible to access tokens of other users', (done) => {
      chai.request(app)
        .get(`/user-lesson-tokens?userId=${userId2}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(token))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(403);
          done();
        });
    });

    it('Should be possible to access own tokens', (done) => {
      chai.request(app)
        .get(`/user-lesson-tokens?userId=${userId}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(token))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(200);
          done();
        });
    });

    it('Should set own userid as default userId query parameter', (done) => {
      chai.request(app)
        .get(`/user-lesson-tokens`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(token))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(200);
          done();
        });
    });
  });

  describe('get()', () => {
    it('Should restrict without cronjob token', (done) => {
      chai.request(app)
        .get(`/user-lesson-tokens/1234`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(403);
          done();
        });
    });
  });

  describe('create()', () => {
    it('Should restrict without cronjob token', (done) => {
      chai.request(app)
        .post(`/user-lesson-tokens`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(403);
          done();
        });
    });
  });

  describe('put()', () => {
    it('Should restrict without cronjob token', (done) => {
      chai.request(app)
        .get(`/user-lesson-tokens/123456789`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(403);
          done();
        });
    });
  });

  describe('patch()', () => {
    it('Should restrict without cronjob token', (done) => {
      chai.request(app)
        .get(`/user-lesson-tokens/123456789`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(403);
          done();
        });
    });
  });

  describe('delete()', () => {
    it('Should restrict without cronjob token', (done) => {
      chai.request(app)
        .delete(`/user-lesson-tokens/123456789`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(403);
          done();
        });
    });
  });
});

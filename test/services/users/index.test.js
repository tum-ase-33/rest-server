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

describe('users service', function() {
  it('registered the users service', () => {
    assert.ok(app.service('users'));
  });

  describe('hotfixes', () => {
    after(() => User.remove(null));

    it('Create two users and second user causes conflict even if correct input', (done) => {
      // first
      chai.request(app)
        .post(`/users`)
        //set header
        .set('Accept', 'application/json')
        .send({
          email: 'tester@me.de',
          password: 'hehe',
          matrikelNr: '12345'
        })
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(201);

          chai.request(app)
            .post(`/users`)
            //set header
            .set('Accept', 'application/json')
            .send({
              email: 'tester_second@me.de',
              password: 'hehe_second',
              matrikelNr: '12345_second'
            })
            //when finished
            .end((err, res) => {
              res.statusCode.should.be.equal(201);
              done();
            });
        });
    });
  });
});

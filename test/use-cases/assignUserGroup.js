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

describe('use-cases: assignUserGroup', function () {
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

  before('prerequisite', () => {
    // #1 existing user
    return createUser()
      .then(([createdUserId, createdUserToken, createdUser]) => {
        token = createdUserToken;
        userId = createdUserId;
        user = createdUser;

        // #2 existing lesson
        return Lesson.create({
          name: 'ASE'
        });
      })
      .then((lesson) => {
        lessonId = lesson._id;

        return Promise.resolve();
      });
  });

  it('#1 fetch lessons', (done) => {
    chai.request(app)
      .get(`/user-lesson-tokens`)
      //set header
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer '.concat(token))
      //when finished
      .end((err, res) => {
        res.statusCode.should.be.equal(200);
        res.body.should.have.property('total', 1);
        res.body.should.have.property('limit');
        res.body.should.have.property('skip');
        res.body.should.have.property('data');
        res.body.data[0].should.have.property('_id', lessonId.toString());
        res.body.data[0].should.have.property('name', 'ASE');
        done();
      });
  });
});

'use strict';


const assert = require('assert');
const app = require('../../src/app');
const User = app.service('users');
const Lessons = app.service('lessons');
const LessonGroups = app.service('lesson-groups');
const userLessonAssignments = app.service('user-lesson-assignments');
const chai = require('chai');
const chaiHttp = require('chai-http');
const bodyParser = require('body-parser');
const authentication = require('feathers-authentication/client');
let lessonId, token, userId, user, lessonGroupId;

//config for app to do authentication
app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(authentication());
//use http plugin
chai.use(chaiHttp);
//use should
const should = chai.should();

describe('use-cases: modifyLesson: ', function () {
  let userCounter = 0;
  const createUser = (roles) => {
    userCounter += 1;
    const email = 'email' + userCounter + '@test.de';
    const password = 'igzSwi7*Creif4V$';
    return User.create({
      matrikelNr: 'mnr' + userCounter,
      email,
      password,
      roles
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
            resolve([userId, res.body.token, user]);
          });
      }))
      .then((data) => {
        return Promise.resolve(data);
      });
  };

  before('prerequisite', (done) => {
    // #1 existing user
    this.server = app.listen(3030);
    //once listening do the following
    this.server.once('listening', () => {

      // prerequisite #1: user has to exist
      createUser([])
        .then(([createdUserId, createdUserToken, createdUser]) => {
          token = createdUserToken;
          userId = createdUserId;
          user = createdUser;
          // prerequisite #2: lesson has to exist (we assume that user selected this lesson for change
          return Lessons.create({
            name: 'ASE'
          });
        })
        .then(lesson => {
          lessonId = lesson._id;

          // prerequisite #3: user has to be the lesson admin
          return userLessonAssignments.create({
            lessonId,
            userId,
            roles: ['admin']
          });
        })
        .then(() => done());
    });
  });

  after((done) => {
    Lessons.remove(null)
      .then(() => LessonGroups.remove(null))
      .then(() => userLessonAssignments.remove(null))
      .then(() => User.remove(null))
      .then(() => this.server.close(done));
  });

  it('#1 modify lesson', (done) => {
    chai.request(app)
      .patch(`/lessons/${lessonId}`)
      //set header
      .set('Accept', 'application/json')
      .send({ name: 'ASE in new Semester' })
      .set('Authorization', 'Bearer '.concat(token))
      //when finished
      .end((err, res) => {
        res.statusCode.should.be.equal(200);
        res.body.should.have.property('_id');
        res.body.should.have.property('name', 'ASE in new Semester');
        done();
      });
  });

});

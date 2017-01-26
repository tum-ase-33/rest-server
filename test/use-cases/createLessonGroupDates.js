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

describe('use-cases: createLessonGroupDates: ', function () {
  let userCounter = 0, data;
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
        userId = user._id;
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
            data = [userId, token, user];
            resolve();
          });
      }))
      .then(() => Lessons.create({
        name: 'ASE'
      }))
      .then(lesson => {
        lessonId = lesson._id;
        return userLessonAssignments.create({
          lessonId,
          userId,
          roles: ['tutor']
        });
      })
      .then(() => LessonGroups.create({
        name: 'ASE group #1',
        lessonId,
      }))
      .then(lessonGroup => {
        lessonGroupId = lessonGroup._id;
        return Promise.resolve(data);
      });
  };

  before('prerequisite', (done) => {
    // #1 existing user
    this.server = app.listen(3030);
    //once listening do the following
    this.server.once('listening', () => {
      createUser([])
        .then(([createdUserId, createdUserToken, createdUser]) => {
          token = createdUserToken;
          userId = createdUserId;
          user = createdUser;
          done();
        });
    });
  });

  after((done) => {
    Lessons.remove(null)
      .then(() => LessonGroups.remove(null))
      .then(() => User.remove(null))
      .then(() => this.server.close(done));
  });

  it('#1 update lesson group dates', (done) => {
    const dates = [new Date().getTime()];
    chai.request(app)
      .patch(`/lesson-groups/${lessonGroupId}`)
      //set header
      .set('Accept', 'application/json')
      .send({ name: 'ASE', dates})
      .set('Authorization', 'Bearer '.concat(token))
      //when finished
      .end((err, res) => {
        res.statusCode.should.be.equal(200);
        // dates successfully updated?
        res.body.should.have.property('dates');
        res.body.dates.should.have.length(1);
        res.body.dates[0].should.be.equal(dates[0]);
        done();
      });
  });

});

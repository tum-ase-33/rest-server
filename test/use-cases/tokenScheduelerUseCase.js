'use strict';


const assert = require('assert');
const app = require('../../src/app');
const User = app.service('users');
const Lesson = app.service('lessons');
const LessonGroup = app.service('lesson-groups');
const UserLessonAssignment = app.service('user-lesson-assignments');
const chai = require('chai');
const chaiHttp = require('chai-http');
const bodyParser = require('body-parser');
const authentication = require('feathers-authentication/client');

let lessonId, lessonGroupId, lessonGroupId2, token, userId;

//config for app to do authentication
app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(authentication());
//use http plugin
chai.use(chaiHttp);
//use should
const should = chai.should();

describe('use-cases: tokenScheduelerUseCase', function () {
  const email = 'email@test.de';
  const matrikelNr = '123445';
  const password = 'igzSwi7*Creif4V$';

  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
  const dayAfterTomorrow = new Date(tomorrow.getTime() + (24 * 60 * 60 * 1000));

  before('setup', (done) => {
    //start the server
    this.server = app.listen(3030);
    const lessonGroupDates = [tomorrow.getTime() + 120]; // lets assume that lesson group take place at 2 A.M.

    //once listening do the following
    this.server.once('listening', () => {
      // setup #1: create a user
      User.create({
        matrikelNr: '12345',
        email: 'dummy@me.de',
        password: '12345677'
      })
        .then(createdUser => {
          userId = createdUser._id;
          return new Promise(resolve => {

            chai.request(app)
            //request to /auth/local
              .post('/auth/local')
              //set header
              .set('Accept', 'application/json')
              //send credentials
              .send({
                email: 'dummy@me.de',
                password: '12345677'
              })
              //when finished
              .end((err, res) => {
                resolve(res.body.token);
              });
          });
        })
        .then(createdToken => {
          token = createdToken;

          // setup #2: create lesson
          return Lesson.create({
            name: 'ASE'
          });
        })
        .then(lesson => {
          lessonId = lesson._id;
          // setup #3 create lesson groups where the lesson takes place tomorrow
          return LessonGroup.create({
            name: 'ASE group #1',
            lessonId,
            dates: lessonGroupDates,
          });
        })
        .then(lesson => {
          lessonGroupId = lesson._id;
          return LessonGroup.create({
            name: 'ASE group #2',
            lessonId,
            dates: lessonGroupDates,
          });
        })
        .then(lessonGroup => {
          lessonGroupId2 = lessonGroup._id;

          // setup #3 assign user to lesson group as student
          return UserLessonAssignment.create({
            userId,
            lessonId,
            lessonGroupId
          });
        })
        .then(() => {
          // setup #3 assign user to lesson group as student
          return UserLessonAssignment.create({
            userId,
            lessonId,
            lessonGroupId: lessonGroupId2
          });
        })
        .then(() => done())
        .catch(done);
    });
  });

  after('clear', (done) => {
    User.remove(null)
      .then(() => UserLessonAssignment.remove(null))
      .then(() => Lesson.remove(null))
      .then(() => LessonGroup.remove(null))
      .then(() => {
        this.server.close(done);
      })
      .catch(done);
  });

  let foundLessonGroups;
  it('#1 get all lectures for tomorrow', () => {
    return new Promise((resolve) => {
      chai.request(app)
        .get(`/lesson-groups?lessonId=${lessonId}&dates[$gte]=${tomorrow.getTime()}&dates[$lt]=${dayAfterTomorrow.getTime()}`)
        .set('Authorization', 'Bearer '.concat(token))
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(200);
          // should find two lesson groups
          res.body.should.have.property('total', 2);
          foundLessonGroups = res.body.data;
          resolve();
        });
    });
  });

  it('#2 create lecture group token', () => {
    return new Promise((resolve) => {
      chai.request(app)
        .post(`/user-lesson-tokens`)
        .set('X-CronJob-Token', app.get('cronjob').token) // get token from config
        //set header
        .set('Accept', 'application/json')
        .send({
          userId,
          lessonGroupId
        })
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(201);
          res.body.should.have.property('token');
          // should find two lesson groups
          resolve();
        });
    });
  });
});

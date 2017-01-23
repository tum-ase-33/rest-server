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

describe('use-cases', function () {
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

  before('prerequisite', (done) => {
    // #1 existing user
    this.server = app.listen(3030);
    //once listening do the following
    this.server.once('listening', () => done());
  });

  after((done) => {
    this.server.close(done);
  });

  describe('assignUserGroup', () => {

    before('prerequisite', () => {
      // #1 existing user
      return createUser()
        .then(([createdUserId, createdUserToken, createdUser]) => {
          token = createdUserToken;
          userId = createdUserId;
          user = createdUser;

          // #2 existing lesson
          return Lessons.create({
            name: 'ASE'
          });
        })
        .then((lesson) => {
          lessonId = lesson._id.toString();

          return LessonGroups.create({
            name: 'ASE group #1',
            lessonId
          });
        })
        .then((lessonGroup) => {
          lessonGroupId = lessonGroup._id;
          return LessonGroups.create({
            name: 'ASE group #2',
            lessonId
          });
        });
    });

    after(() => {
      //delete contents of menu in mongodb
      return Lessons.remove(null)
        .then(() => LessonGroups.remove(null))
        .then(() => User.remove(null));
    });

    it('#1 fetch lessons', (done) => {
      chai.request(app)
        .get(`/lessons`)
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
          res.body.data[0].should.have.property('_id', lessonId);
          res.body.data[0].should.have.property('name', 'ASE');
          done();
        });
    });

    it('#2 fetch lesson groups', (done) => {
      // expect that user has chosen lesson with id: lessonId
      chai.request(app)
        .get(`/lesson-groups?lessonId=${lessonId}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(token))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(200);
          res.body.should.have.property('total', 2);
          res.body.should.have.property('limit');
          res.body.should.have.property('skip');
          res.body.should.have.property('data');
          res.body.data[0].should.have.property('_id');
          res.body.data[0].should.have.property('name');
          res.body.data[0].should.have.property('lessonId');
          done();
        });
    });

    it('#3 assign lesson group', (done) => {
      // expect that user has chosen lesson with id ${lessonId} and lesson group with id ${lessonGroupId}
      chai.request(app)
        .get(`/lesson-groups?lessonId=${lessonId}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(token))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(200);
          res.body.should.have.property('total', 2);
          res.body.should.have.property('limit');
          res.body.should.have.property('skip');
          res.body.should.have.property('data');
          res.body.data[0].should.have.property('_id');
          res.body.data[0].should.have.property('name');
          res.body.data[0].should.have.property('lessonId');
          done();
        });
    });

  });
});

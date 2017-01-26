'use strict';

const assert = require('assert');
const app = require('../../src/app');
const Users = app.service('users');
const Lesson = app.service('lessons');
const LessonGroup = app.service('lesson-groups');
const UserLessonTokens = app.service('user-lesson-tokens');
const chai = require('chai');
const chaiHttp = require('chai-http');
const bodyParser = require('body-parser');
const authentication = require('feathers-authentication/client');

//config for app to do authentication
app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(authentication());
//use http plugin
chai.use(chaiHttp);
//use should
const should = chai.should();

describe('middleware: add token tag', function () {
  const email = 'email@test.de';
  const matrikelNr = '123445';
  const password = 'igzSwi7*Creif4V$';

  let userId, lessonId, lessonGroupId, token, userSessionToken, outdatedUserSessionToken, scannerToken;

  const existingTag = {
    name: 'dummy',
    data: 'Just some content'
  };

  before('open server', (done) => {
    //start the server
    this.server = app.listen(3030);
    //once listening do the following
    this.server.once('listening', () => {
      scannerToken = app.get('scanner').token;
      Users.create({
        email,
        password,
        matrikelNr
      })
        .then(user => {
          userId = user._id;
          return Lesson.create({
            name: 'ASE'
          });
        })
        .then(lesson => {
          lessonId = lesson._id;
          return LessonGroup.create({
            name: 'ASE group #1',
            lessonId
          });
        })
        .then(lessonGroup => {
          lessonGroupId = lessonGroup._id;
          return UserLessonTokens.create({
            lessonGroupId,
            userId,
            tags: [existingTag]
          });
        })
        .then(userLessonToken => {
          userSessionToken = userLessonToken.token;
          return UserLessonTokens.create({
            lessonGroupId,
            userId,
            tags: [existingTag],
            createdAt: new Date(2000, 1, 1)
          });
        })
        .then(userLessonToken => {
          outdatedUserSessionToken = userLessonToken.token;
          done();
        })
        .catch((error) => {
          console.error(error);
          done(error);
        });
    });
  });

  after('clear', (done) => {
    Lesson.remove(null)
      .then(() => UserLessonTokens.remove(null))
      .then(() => LessonGroup.remove(null))
      .then(() => Users.remove(null))
      .then(() => this.server.close(done))
      .catch(done);
  });

  it('Should not be accessible with wrong token', (done) => {
    const wrongScannerToken = scannerToken.split('').reverse().join('');
    chai.request(app)
      .post(`/user-lesson-tokens/12345/tag`)
      //set header
      .set('X-Scanner-Client-Token', wrongScannerToken)
      .set('Accept', 'application/json')
      .send({
        tag: {}
      })
      //when finished
      .end((err, res) => {
        res.statusCode.should.be.equal(403);
        done();
      });
  });


  it('Should not be accessible if group session token is invalid', (done) => {
    const wrongUserSessionToken = userSessionToken.split('').reverse().join('');
    chai.request(app)
      .post(`/user-lesson-tokens/${wrongUserSessionToken}/tag`)
      //set header
      .set('X-Scanner-Client-Token', scannerToken)
      .set('Accept', 'application/json')
      .send({
        tag: {}
      })
      //when finished
      .end((err, res) => {
        res.statusCode.should.be.equal(404);
        done();
      });
  });

  it('Should not be accessible if token is outdated / older than 2 days', (done) => {
    chai.request(app)
      .post(`/user-lesson-tokens/${outdatedUserSessionToken}/tag`)
      //set header
      .set('X-Scanner-Client-Token', scannerToken)
      .set('Accept', 'application/json')
      .send({
        tag: {}
      })
      //when finished
      .end((err, res) => {
        res.statusCode.should.be.equal(404);
        done();
      });
  });


  it('Should store correctly with not existing tag', (done) => {
    chai.request(app)
      .post(`/user-lesson-tokens/${userSessionToken}/tag`)
      //set header
      .set('X-Scanner-Client-Token', scannerToken)
      .set('Accept', 'application/json')
      .send({
        tag: {
          name: 'attendance',
          data: {
            otherData: 1234,
            createdAt: new Date()
          }
        }
      })
      //when finished
      .end((err, res) => {
        res.statusCode.should.be.equal(200);
        done();
      });
  });
});

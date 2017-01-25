'use strict';

const assert = require('assert');
const app = require('../../../src/app');
const User = app.service('users');
const Lesson = app.service('lessons');
const LessonGroups = app.service('lesson-groups');
const LessonAssignment = app.service('user-lesson-assignments');
const chai = require('chai');
const chaiHttp = require('chai-http');
const bodyParser = require('body-parser');
const authentication = require('feathers-authentication/client');

let adminUserId, adminToken, studentUserId, studentToken;

//config for app to do authentication
app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(authentication());
//use http plugin
chai.use(chaiHttp);
//use should
const should = chai.should();

describe('lesson-groups service', function () {
  before('open server', (done) => {
    //start the server
    this.server = app.listen(3030);
    //once listening do the following
    this.server.once('listening', () => done());
  });

  after('clear', (done) => {
    this.server.close(done);
  });

  it('registered the lesson-groups service', () => {
    assert.ok(app.service('lesson-groups'));
  });

  describe('get()', () => {
    it('Should be disabled', (done) => {
      chai.request(app)
        .get(`/lesson-groups/123456`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(405);
          done();
        });
    });
  });

  let userCounter = 0;
  const createUser = (lessonId, roles) => {
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
      .then(data =>
        LessonAssignment.create({
          lessonId,
          userId: data[0],
          roles
        })
          .then(lessonAssignment => Promise.resolve(data))
      )
      .then((data) => {
        return Promise.resolve(data);
      });
  };

  describe('find()', () => {
    let lesson;
    before('create user and assign roles', () =>
      Lesson.create({
        name: 'ASE lesson-groups'
      })
        .then((createdLesson) => createUser(createdLesson._id, ['admin'])
          .then(([createdUserId, createdUserToken]) => {
            lesson = createdLesson;
            adminUserId = createdUserId;
            adminToken = createdUserToken;
            return createUser(createdLesson._id, ['student']);
          })
          .then(([createdUserId, createdUserToken]) => {
            studentUserId = createdUserId;
            studentToken = createdUserToken;
            return Promise.resolve();
          })
        )
        .then(() => LessonGroups.create({
          name: 'ASE group #1',
          lessonId: lesson._id
        }))
        .then(() => LessonGroups.create({
          name: 'ASE group #2',
          lessonId: lesson._id
        }))
    );

    after('clear all entries', () =>
      LessonGroups.remove(null)
        .then(() => LessonAssignment.remove(null))
        .then(() => Lesson.remove(null))
        .then(() => User.remove(null))
    );

    it('Should be only accessible if logged in', (done) => {
      chai.request(app)
        .get(`/lesson-groups`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(401);
          done();
        });
    });

    it('Should be only accessible if lessonId query parameter is provided', (done) => {
      chai.request(app)
        .get(`/lesson-groups`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(studentToken))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(400);
          done();
        });
    });

    it('Should return all lesson groups if logged in', (done) => {
      chai.request(app)
        .get(`/lesson-groups?lessonId=${lesson._id}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(studentToken))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(200);
          res.body.total.should.be.equal(2);
          done();
        });
    });
  });

  describe('create()', () => {
    let lesson;
    before('create user and assign roles', () =>
      Lesson.create({
        name: 'ASE lesson-groups'
      })
        .then((createdLesson) => createUser(createdLesson._id, ['admin'])
          .then(([createdUserId, createdUserToken]) => {
            lesson = createdLesson;
            adminUserId = createdUserId;
            adminToken = createdUserToken;
            return createUser(createdLesson._id, ['student']);
          })
          .then(([createdUserId, createdUserToken]) => {
            studentUserId = createdUserId;
            studentToken = createdUserToken;
            return Promise.resolve();
          })
        )
        .then(() => LessonGroups.create({
          name: 'ASE group #1',
          lessonId: lesson._id
        }))
        .then(() => LessonGroups.create({
          name: 'ASE group #2',
          lessonId: lesson._id
        }))
    );

    after('clear all entries', () =>
      LessonGroups.remove(null)
        .then(() => LessonAssignment.remove(null))
        .then(() => Lesson.remove(null))
        .then(() => User.remove(null))
    );

    it('Should be only accessible if logged in', (done) => {
      chai.request(app)
        .post(`/lesson-groups`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(401);
          done();
        });
    });

    it('Should not be accessible for non admins', (done) => {
      chai.request(app)
        .post(`/lesson-groups`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(studentToken))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(403);
          done();
        });
    });

    it('Should create a lesson group with an admin', (done) => {
      chai.request(app)
        .post(`/lesson-groups`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(adminToken))
        .send({ name: 'New ASE group', lessonId: lesson._id })
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(201);
          done();
        });
    });
  });

  describe('patch()', () => {
    let lesson, lessonGroupId, tutorUserId, tutorToken;
    before('create user and assign roles', () =>
      Lesson.create({
        name: 'ASE lesson-groups'
      })
        .then((createdLesson) => createUser(createdLesson._id, ['admin'])
          .then(([createdUserId, createdUserToken]) => {
            lesson = createdLesson;
            adminUserId = createdUserId;
            adminToken = createdUserToken;
            return createUser(createdLesson._id, ['tutor']);
          })
          .then(([createdUserId, createdUserToken]) => {
            tutorUserId = createdUserId;
            tutorToken = createdUserToken;
            return createUser(createdLesson._id, ['student']);
          })
          .then(([createdUserId, createdUserToken]) => {
            studentUserId = createdUserId;
            studentToken = createdUserToken;
            return Promise.resolve();
          })
        )
        .then(() => LessonGroups.create({
          name: 'ASE group #1',
          lessonId: lesson._id
        }))
        .then(() => LessonGroups.create({
          name: 'ASE group #2',
          lessonId: lesson._id
        }))
        .then(lessonGroup => {
          lessonGroupId = lessonGroup._id;
          return Promise.resolve();
        })
    );

    after('clear all entries', () =>
      LessonGroups.remove(null)
        .then(() => LessonAssignment.remove(null))
        .then(() => Lesson.remove(null))
        .then(() => User.remove(null))
    );

    it('Should be only accessible if logged in', (done) => {
      chai.request(app)
        .patch(`/lesson-groups/${lessonGroupId}`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(401);
          done();
        });
    });

    it('Should not be accessible for non admins and non tutors', (done) => {
      chai.request(app)
        .patch(`/lesson-groups/${lessonGroupId}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(studentToken))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(403);
          done();
        });
    });

    it('Should update a lesson group with an admin', (done) => {
      chai.request(app)
        .patch(`/lesson-groups/${lessonGroupId}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(adminToken))
        .send({ name: 'New ASE group' })
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(200);
          done();
        });
    });

    it('Should update a lesson group with an tutor', (done) => {
      chai.request(app)
        .patch(`/lesson-groups/${lessonGroupId}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(tutorToken))
        .send({ name: 'New ASE group' })
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(200);
          done();
        });
    });
  });

  describe('put()', () => {
    it('Should be disabled', (done) => {
      chai.request(app)
        .put(`/lesson-groups/123456`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(405);
          done();
        });
    });
  });

  describe('delete()', () => {
    let lesson, lessonGroupId;
    before('create user and assign roles', () =>
      Lesson.create({
        name: 'ASE lesson-groups'
      })
        .then((createdLesson) => createUser(createdLesson._id, ['admin'])
          .then(([createdUserId, createdUserToken]) => {
            lesson = createdLesson;
            adminUserId = createdUserId;
            adminToken = createdUserToken;
            return createUser(createdLesson._id, ['student']);
          })
          .then(([createdUserId, createdUserToken]) => {
            studentUserId = createdUserId;
            studentToken = createdUserToken;
            return Promise.resolve();
          })
        )
        .then(() => LessonGroups.create({
          name: 'ASE group #1',
          lessonId: lesson._id
        }))
        .then((lessonGroup) => {
          lessonGroupId = lessonGroup._id;
          return Promise.resolve();
        })
    );

    after('clear all entries', () => {
      return LessonGroups.remove(null)
        .then(() => LessonAssignment.remove(null))
        .then(() => Lesson.remove(null))
        .then(() => User.remove(null));
    });

    it('Should be only accessible if logged in', (done) => {
      chai.request(app)
        .delete(`/lesson-groups/${lessonGroupId}`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(401);
          done();
        });
    });

    it('Should not be accessible for non admins', (done) => {
      chai.request(app)
        .delete(`/lesson-groups/${lessonGroupId}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(studentToken))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(403);
          done();
        });
    });

    it('Should remove a lesson group with an admin', (done) => {
      chai.request(app)
        .delete(`/lesson-groups/${lessonGroupId}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(adminToken))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(200);
          done();
        });
    });
  });
});

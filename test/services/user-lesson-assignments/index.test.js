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

describe('user-lesson-assignments service', function () {
  before((done) => {
    this.server = app.listen(3030);
    //once listening do the following
    this.server.once('listening', () => done());
  });

  after((done) => {
    this.server.close(done);
  });

  it('registered the user-lesson-assignments service', () => {
    assert.ok(userLessonAssignments);
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

  describe('get()', () => {
    before(() => createUser()
      .then(([createdUserId, createdUserToken]) => {
        token = createdUserToken;
        userId = createdUserId;
        return Promise.resolve();
      }));
    after(() => User.remove(null));

    it('should be disabled', (done) => {
      chai.request(app)
        .get(`/user-lesson-assignments/1234567`)
        .set('Authorization', 'Bearer '.concat(token))
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(405);
          done();
        });
    });
  });

  describe('list()', () => {
    //setup
    before(() => {
      //create some mock lessons
      return Lesson.create({
        name: 'ASE user-lesson-assignments'
      })
        .then(lesson => {
          lessonId = lesson._id.toString();
          return Lesson.create({
            name: 'ASE_2 user-lesson-assignments'
          });
        })
        .then(lesson => {
          lessonId2 = lesson._id.toString();
          return createUser();
        })
        .then(([createdUserId, createdUserToken, createdUser]) => {
          userId = createdUserId;
          token = createdUserToken;
          user = createdUser;
          return Promise.resolve();
        })
        .then(() => userLessonAssignments.create({
          userId,
          lessonId,
          roles: ['admin']
        }, {
          token,
          user
        }))
        .then(() => createUser())
        .then(([createdUserId, createdUserToken, createdUser]) => {
          userId2 = createdUserId;
          token2 = createdUserToken;
          user2 = createdUser;
          return Promise.resolve();
        })
        .then(() => userLessonAssignments.create({
          userId: userId2,
          lessonId,
          roles: ['student']
        }, {
          token: token2,
          user: user2
        }));
    });
    //teardown after tests
    after(() => {
      //delete contents of menu in mongodb
      return Lesson.remove(null)
        .then(() => userLessonAssignments.remove(null))
        .then(() => User.remove(null));
    });

    it('should be disabled if query param lesson does not exist', (done) => {
      //setup a request
      chai.request(app)
        .get('/user-lesson-assignments')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(token))
        //when finished do the following
        .end((err, res) => {
          res.statusCode.should.be.equal(400);
          done();
        });
    });

    it('should return a populated list of all users', (done) => {
      //setup a request
      chai.request(app)
        .get('/user-lesson-assignments?lessonId=' + lessonId)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(token))
        //when finished do the following
        .end((err, res) => {
          res.statusCode.should.be.equal(200);
          res.body.total.should.be.equal(2);
          res.body.data[0].should.have.deep.property('user._id');
          done();
        });
    });

    it('should be disabled if user has no roles', (done) => {
      //setup a request
      chai.request(app)
        .get('/user-lesson-assignments?lessonId=' + lessonId)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(token2))
        //when finished do the following
        .end((err, res) => {
          res.statusCode.should.be.equal(403);
          done();
        });
    });

    it('should only be accessible if user is authenticated', (done) => {
      chai.request(app)
        .get('/user-lesson-assignments?lessonId=12345')
        .set('Accept', 'application/json')
        //when finished do the following
        .end((err, res) => {
          res.statusCode.should.be.equal(401);
          done();
        });
    });
  });

  describe('create', () => {
    //setup
    before((done) => {
      Lesson.create({
        name: 'ASE user-lesson-assignments'
      })
        .then(lesson => {
          lessonId = lesson._id.toString();
          return createUser();
        })
        .then(([createdUserId, createdUserToken]) => {
          userId = createdUserId;
          token = createdUserToken;
          return Promise.resolve();
        })
        .then(() => done());
    });
    //teardown after tests
    after((done) => {
      //delete contents of menu in mongodb
      Lesson.remove(null, () => {
        userLessonAssignments.remove(null, () => {
          User.remove(null, () => {
            done();
          });
        });
      });
    });

    it('should store assignment correctly', (done) => {
      chai.request(app)
        .post('/user-lesson-assignments')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(token))
        .send({
          userId,
          lessonId
        })
        //when finished do the following
        .end((err, res) => {
          res.statusCode.should.be.equal(201);
          res.body.lessonId.should.be.equal(lessonId.toString());
          res.body.userId.should.be.equal(userId.toString());
          res.body.roles.should.contain('student');

          userLessonAssignments.remove(null, { user, token }, done);
        });
    });

    it('should only be accessible if user is authenticated', (done) => {
      chai.request(app)
        .post('/user-lesson-assignments')
        .set('Accept', 'application/json')
        .send({
          lesson: lessonId
        })
        //when finished do the following
        .end((err, res) => {
          res.statusCode.should.be.equal(401);
          done();
        });
    });

    it('should not be possible to store an assignment twice', (done) => {
      chai.request(app)
        .post('/user-lesson-assignments')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(token))
        .send({
          lessonId,
          userId
        })
        //when finished do the following
        .end((err, res) => {
          res.statusCode.should.be.equal(201);

          chai.request(app)
            .post('/user-lesson-assignments')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .send({
              lessonId,
              userId
            })
            //when finished do the following
            .end((err, res) => {
              res.statusCode.should.be.equal(409);
              done();
            });
        });
    });
  });

  describe('patch()', () => {
    before(() => createUser()
      .then(([createdUserId, createdUserToken]) => {
        token = createdUserToken;
        userId = createdUserId;
        return Promise.resolve();
      }));
    after(() => User.remove(null));

    it('should be deactivated', (done) => {
      chai.request(app)
        .patch(`/user-lesson-assignments/1234567`)
        .set('Authorization', 'Bearer '.concat(token))
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(405);
          done();
        });
    });
  });

  describe('put()', () => {
    before(() => createUser()
      .then(([createdUserId, createdUserToken]) => {
        token = createdUserToken;
        userId = createdUserId;
        return Promise.resolve();
      }));
    after(() => User.remove(null));

    it('should be deactivated', (done) => {
      chai.request(app)
        .patch(`/user-lesson-assignments/1234567`)
        .set('Authorization', 'Bearer '.concat(token))
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
    let lessonId, userLessonId;
    before(() => createUser()
      .then(([createdUserId, createdUserToken, createdUser]) => {
        token = createdUserToken;
        userId = createdUserId;
        user = createdUser;
        return Promise.resolve();
      }));
    after(
      () =>
        userLessonAssignments.remove(null)
          .then(() => Lesson.remove(null))
          .then(() => User.remove(null))
    );

    afterEach((done) => {
      Lesson.remove(null, userLessonAssignments.remove(null, () => done()));
    });

    describe('Should not remove', () => {
      it('Only admins and owners are allowed to remove', (done) => {
        Lesson.create({
          name: 'ASE user-lesson-assignments'
        })
          .then((lesson) => {
            lessonId = lesson._id;
            return Promise.resolve();
          })
          .then(
            () => userLessonAssignments.create({
              lessonId,
              userId
            }, {
              user,
              token
            })
          )
          .then(userLesson => {
            userLessonId = userLesson._id;
            return createUser();
          })
          .then(([createdUserId, createdUserToken, createdUser]) => {
            token2 = createdUserToken;
            user2 = createdUser;
            return userLessonAssignments.create({
              lessonId,
              userId: createdUserId,
              roles: ['student']
            }, {
              user: user2,
              token: token2
            });
          })
          .then((userLesson) => {
            chai.request(app)
              .delete(`/user-lesson-assignments/${userLessonId}`)
              .set('Authorization', 'Bearer '.concat(token2))
              //set header
              .set('Accept', 'application/json')
              //when finished
              .end((err, res) => {
                res.statusCode.should.be.equal(403);
                done();
              });
          });
      });

      it('Should restrict for not authenticated users', (done) => {
        Lesson.create({
          name: 'ASE user-lesson-assignments'
        })
          .then((lesson) => {
            lessonId = lesson._id;
            return Promise.resolve();
          })
          .then(() => userLessonAssignments.create({
              lessonId,
              userId
            }, {
              user,
              token
            })
          )
          .then((userLesson) => {
            chai.request(app)
              .delete(`/user-lesson-assignments/${userLesson._id}`)
              //set header
              .set('Accept', 'application/json')
              //when finished
              .end((err, res) => {
                res.statusCode.should.be.equal(401);
                done();
              });
          });
      });
    });

    describe('Should delete relation', () => {
      it('Owners should be able to delete their lesson relations', (done) => {
        Lesson.create({
          name: 'ASE user-lesson-assignments'
        })
          .then((lesson) => {
            lessonId = lesson._id;
            return Promise.resolve();
          })
          .then(() => userLessonAssignments.create({
              lessonId,
              userId
            }, {
              user,
              token
            })
          )
          .then((userLesson) => {
            chai.request(app)
              .delete(`/user-lesson-assignments/${userLesson._id}`)
              .set('Authorization', 'Bearer '.concat(token))
              //set header
              .set('Accept', 'application/json')
              //when finished
              .end((err, res) => {
                res.statusCode.should.be.equal(200);
                done();
              });
          });
      });

      it('Admins should be able to delete lesson relations', (done) => {
        Lesson.create({
          name: 'ASE user-lesson-assignments'
        })
          .then((lesson) => {
            lessonId = lesson._id;
            return Promise.resolve();
          })
          .then(() => userLessonAssignments.create({
              lessonId,
              userId
            }, {
              user,
              token
            })
          )
          .then(userLesson => {
            userLessonId = userLesson._id;
            return createUser();
          })
          .then(([createdUserId, createdUserToken, createdUser]) => {
            token2 = createdUserToken;
            return userLessonAssignments.create({
              lessonId,
              userId: createdUserId,
              roles: ['admin']
            }, {
              user: createdUser,
              token: createdUserToken
            });
          })
          .then((userLesson) => {
            chai.request(app)
              .delete(`/user-lesson-assignments/${userLesson._id}`)
              .set('Authorization', 'Bearer '.concat(token2))
              //set header
              .set('Accept', 'application/json')
              //when finished
              .end((err, res) => {
                res.statusCode.should.be.equal(200);
                done();
              });
          });
      });
    });
  });
});

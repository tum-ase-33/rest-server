'use strict';

const assert = require('assert');
const app = require('../../../src/app');
const User = app.service('users');
const Lesson = app.service('lessons');
const chai = require('chai');
const chaiHttp = require('chai-http');
const bodyParser = require('body-parser');
const authentication = require('feathers-authentication/client');
let adminToken, tutorToken, lessonId, studentToken;

//config for app to do authentication
app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(authentication());
//use http plugin
chai.use(chaiHttp);
//use should
const should = chai.should();

describe('lessons service', function () {
  //setup
  before((done) => {
    //start the server
    this.server = app.listen(3030);
    //once listening do the following
    this.server.once('listening', () => {
      //create some mock lessons
      Lesson.create({
        name: 'ASE'
      })
        .then(lesson => {
          lessonId = lesson._id.toString();
          //create mock user
          return User.create({
            matrikelNr: '1234',
            email: 'dummy@in.tum.de',
            password: 'igzSwi7*Creif4V$',
            roles: ['tutor', 'admin']
          });
        })
        .then(user => new Promise(resolve => {
          //setup a request to get authentication token
          chai.request(app)
          //request to /auth/local
            .post('/auth/local')
            //set header
            .set('Accept', 'application/json')
            //send credentials
            .send({
              'email': 'dummy@in.tum.de',
              'password': 'igzSwi7*Creif4V$',
            })
            //when finished
            .end((err, res) => {
              //set token for auth in other requests
              tutorToken = res.body.token;
              resolve();
            });
        }))
        .then(() => User.create({
          matrikelNr: '4545445',
          email: 'dummy_admin@in.tum.de',
          password: 'igzSwi7*Creif4V$',
          roles: ['admin']
        }))
        .then(student => new Promise(resolve => {
          chai.request(app)
          //request to /auth/local
            .post('/auth/local')
            //set header
            .set('Accept', 'application/json')
            //send credentials
            .send({
              'email': 'dummy_admin@in.tum.de',
              'password': 'igzSwi7*Creif4V$',
            })
            //when finished
            .end((err, res) => {
              //set token for auth in other requests
              adminToken = res.body.token;
              resolve();
            });
        }))
        .then(() => User.create({
          matrikelNr: '12345',
          email: 'dummy_student@in.tum.de',
          password: 'igzSwi7*Creif4V$',
          roles: ['student']
        }))
        .then(student => new Promise(resolve => {
          chai.request(app)
          //request to /auth/local
            .post('/auth/local')
            //set header
            .set('Accept', 'application/json')
            //send credentials
            .send({
              'email': 'dummy_student@in.tum.de',
              'password': 'igzSwi7*Creif4V$',
            })
            //when finished
            .end((err, res) => {
              //set token for auth in other requests
              studentToken = res.body.token;
              resolve();
            });
        }))
        .then(() => done());
    });
  });
  //teardown after tests
  after((done) => {
    //delete contents of menu in mongodb
    Lesson.remove(null, () => {
      User.remove(null, () => {
        //stop the server
        this.server.close(done);
      });
    });

  });

  describe('list()', () => {
    it('registered the lessons service', () => {
      assert.ok(app.service('lessons'));
    });

    it('only registered users should access it', (done) => {
      //setup a request
      chai.request(app)
      //request to /menu
        .get('/lessons')
        .set('Accept', 'application/json')
        //when finished do the following
        .end((err, res) => {
          //ensure menu items have specific properties
          res.statusCode.should.be.equal(401);
          done();
        });
    });

    it('should get lessons', (done) => {
      //setup a request
      chai.request(app)
      //request to /menu
        .get('/lessons')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(tutorToken))
        //when finished do the following
        .end((err, res) => {
          //ensure menu items have specific properties
          res.body.data.should.be.a('array');
          res.body.data[0].should.have.property('name');
          res.body.data[0].name.should.equal('ASE');
          done();
        });
    });
  });

  describe('get', () => {
    it('should return (correct) lesson if available', (done) => {
      chai.request(app)
      //request to /auth/local
        .get(`/lessons/${lessonId}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(tutorToken))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(200);
          res.body.should.have.property('_id', lessonId);
          done();
        });
    });

    it('should return 404 status code if lesson is not available', (done) => {
      const reversedLessonId = lessonId.split('').reverse().join('');
      chai.request(app)
      //request to /auth/local
        .get(`/lessons/${reversedLessonId}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(tutorToken))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(404);
          done();
        });
    });

    it('Should be only accessible if logged in', (done) => {
      chai.request(app)
      //request to /auth/local
        .get(`/lessons/${lessonId}`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(401);
          done();
        });
    });

    it('Should be only accessible if has role "tutor"', (done) => {
      chai.request(app)
      //request to /auth/local
        .get(`/lessons/${lessonId}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(studentToken))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(403);
          done();
        });
    });
  });

  describe('create', () => {
    before(() => Lesson.remove(null));
    after(() => Lesson.remove(null));

    it('Should be only accessible for authenticated users', (done) => {
      chai.request(app)
      //request to /auth/local
        .post(`/lessons`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(401);
          done();
        });
    });

    it('Only admins should be allowed to create lessons', (done) => {
      chai.request(app)
      //request to /auth/local
        .post(`/lessons`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(studentToken))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(403);
          done();
        });
    });

    it('Should not be able to create a lesson with duplicated name', (done) => {
      const lessonData = {
        name: 'ASE'
      };
      chai.request(app)
      //request to /auth/local
        .post(`/lessons`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(adminToken))
        .send(lessonData)
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(201);

          chai.request(app)
          //request to /auth/local
            .post(`/lessons`)
            //set header
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(adminToken))
            .send(lessonData)
            //when finished
            .end((err, res) => {
              res.statusCode.should.be.equal(409);
              // clear all on success
              Lesson.remove(null, () => done());
            });
        });
    });

    it('Should store correctly with unique name and admin account', (done) => {
      chai.request(app)
      //request to /auth/local
        .post(`/lessons`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(adminToken))
        .send({ name: 'ASE_admin' })
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(201);
          res.body.should.have.property('_id');
          res.body.should.have.property('name', 'ASE_admin');

          Lesson.remove(null, () => done());
        });
    });
  });

  describe('put()', () => {
    it('should be disabled', (done) => {
      chai.request(app)
        .put(`/lessons/1234567`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(405);
          done();
        });
    });
  });

  describe('patch()', () => {
    let lessonId;
    before((done) => {
      Lesson.create({
        name: 'ASE'
      }).then(lesson => {
        lessonId = lesson._id;
        done();
      });
    });

    after(() => Lesson.remove(null));

    it('Should be only accessible for authenticated users', (done) => {
      chai.request(app)
      //request to /auth/local
        .patch(`/lessons/${lessonId}`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(401);
          done();
        });
    });

    it('Only tutors or admins should be allowed to create lessons', (done) => {
      chai.request(app)
      //request to /auth/local
        .patch(`/lessons/${lessonId}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(studentToken))
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(403);
          done();
        });
    });

    it('Should update correctly with unique name and tutor account', (done) => {
      chai.request(app)
      //request to /auth/local
        .patch(`/lessons/${lessonId}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(tutorToken))
        .send({ name: 'ASE_new_with_tutor' })
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(200);
          res.body.should.have.property('_id', lessonId.toString());
          res.body.should.have.property('name', 'ASE_new_with_tutor');

          done();
        });
    });

    it('Should update correctly with unique name and admin account', (done) => {
      chai.request(app)
      //request to /auth/local
        .patch(`/lessons/${lessonId}`)
        //set header
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer '.concat(adminToken))
        .send({ name: 'ASE_new_with_admin' })
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(200);
          res.body.should.have.property('_id');
          res.body.should.have.property('name', 'ASE_new_with_admin');

          done();
        });
    });
  });

  describe('delete()', () => {
    it('should be disabled', (done) => {
      chai.request(app)
        .delete(`/lessons/1234567`)
        //set header
        .set('Accept', 'application/json')
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(405);
          done();
        });
    });
  });
});

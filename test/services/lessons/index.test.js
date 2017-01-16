'use strict';

const assert = require('assert');
const app = require('../../../src/app');
const User = app.service('users');
const Lesson = app.service('lessons');
const chai = require('chai');
const chaiHttp = require('chai-http');
const bodyParser = require('body-parser');
const authentication = require('feathers-authentication/client');
let token;

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
        .then(() =>
          //create mock user
          User.create({
            matrikelNr: '1234',
            email: 'dummy@in.tum.de',
            password: 'igzSwi7*Creif4V$',
            roles: ['admin']
          }, () => {
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
                token = res.body.token;
                done();
              });
          })
        );
    });
  });
  //teardown after tests
  after((done) => {
    //delete contents of menu in mongodb
    Lesson.remove(null, () => {
      User.remove(null, () => {
        //stop the server
        this.server.close(function () {
        });
        done();
      });
    });

  });
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
      .set('Authorization', 'Bearer '.concat(token))
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

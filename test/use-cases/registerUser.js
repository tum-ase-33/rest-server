'use strict';


const assert = require('assert');
const app = require('../../../src/app');
const User = app.service('users');
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

describe('use-cases: registerUser', function () {
  const email = 'email@test.de';
  const matrikelNr = '123445';
  const password = 'igzSwi7*Creif4V$';

  before('open server', (done) => {
    //start the server
    this.server = app.listen(3030);
    //once listening do the following
    this.server.once('listening', () => done());
  });

  after('clear', () => User.remove(null).then(() => this.server.close()));

  it('process', () => {
    // #1 create new user
    return new Promise((resolve) => {
      chai.request(app)
        .post(`/users`)
        //set header
        .set('Accept', 'application/json')
        .send({
          matrikelNr,
          email,
          password
        })
        //when finished
        .end((err, res) => {
          res.statusCode.should.be.equal(201);
          res.body.should.have.property('_id');
          res.body.should.not.have.property('matrikelNr');
          res.body.should.have.property('email', email);
          resolve();
        });
    })
      .then(() => new Promise(resolve => {
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
            res.statusCode.should.be.equal(201);
            // authentication token!
            res.body.should.have.property('token');
            resolve();
          });
      }));
  });
});

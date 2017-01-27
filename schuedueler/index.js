var request = require('superagent');
var Promise = require('bluebird');

function authenticate() {
  return new Promise(function(resolve) {
    chai.request(app)
      .post('/auth/local')
      //set header
      .set('Accept', 'application/json')
      //send credentials
      .send(require('common/schuedueler'))
      //when finished
      .end((err, res) => {
        resolve(res.body.token);
      });
  });
}

function getLessons(token) {
  return new Promise(function(resolve) {
    chai.request(app)
      .get('/lessons')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer '.concat(token))
      .end((err, res) => {
        resolve(res.body.data);
      });
  });
}

function getLessonGroups(token, lessonId) {
  return new Promise(function(resolve) {
    chai.request(app)
      .get('/lesson-groups?lessonId=' + lessonId)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer '.concat(token))
      .end((err, res) => {
        resolve(res.body.data);
      });
  });
}

function sendLessonToken(token, lessonId) {
  return new Promise(function(resolve) {
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
}

const CRONJOB_TOKEN = 'TmSAEBKX3HDDtfkJQYaZUMgmJkgrLT8w6RVAhxpa6RDqX';

function getLessonAssignments(token, lessonId) {
  return new Promise(function(resolve) {
    chai.request(app)
      .get(`/user-lesson-assignments?lessonId=` + lessonId)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer '.concat(token))
      //when finished do the following
      .end((err, res) => {
        resolve(res.body.data);
      });
  });
}

function createLessonGroupToken(userId, lessonGroupId) {
  return new Promise(function(resolve) {
    chai.request(app)
      .post(`/user-lesson-tokens`)
      .set('X-CronJob-Token', CRONJOB_TOKEN) // get token from config
      //set header
      .set('Accept', 'application/json')
      .send({
        userId,
        lessonGroupId
      })
      //when finished
      .end((err, res) => {
        resolve(res.body);
      });
  });
}

var ses = require('node-ses');
var client = ses.createClient(require('./data/ses'));
var QRCode = require('node-qrcode');

function sendQRCode(email, token) {
  return new Promise(function(resolve) {
    QRCode.toDataURL(token, function(error, dataURL) {
      var rawMessage = {
        to: email,
        from: 'caprano@in.tum.de',
        subject: 'Your Attendance token for the new Lesson Group',
        message: 'Hello, <br /><br />This is your token: <br /><br /><img src="' + dataURL + '" /><br /><br />Cheers!'
      };

      client.sendRawEmail({
        from: 'caprano@in.tum.de',
        rawMessage: rawMessage
    }, function (err, data, res) {
        resolve();
      });
    });
  });
}

/**
 * Cloud Function.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} The callback function.
 */
exports.sendTokens = function sendTokens () {
  var token, lessons;
  var promises;
  authenticate()
    .then(function(_token) {
      token = _token;
      return getLessons(token);
    })
    .then(function(_lessons) {
      lessons = _lessons;

      promises = [];
      for (var i = 0; i < lessons.length; i += 1) {
        promises.push(getLessonAssignments(token, lessons[i]._id));
      }
      return Promise.all(promises);
    })
    .then(function(lessonAssignmentsList) {
      promises = [];
      for (var j = 0; j < lessonAssignmentsList.length; j++) {
        for (var k = 0; k < lessonAssignmentsList[j].length; k++) {
          promises.push(createLessonGroupToken(lessonAssignmentsList[j][k].userId, lessonAssignmentsList[j][k].lessonGroupId));
        }
      }
      return Promise.all(promises);
    })
    .then(function(lessonGroupTokens) {
      promises = [];
      for (var l = 0; l < lessonGroupTokens.length; l++) {
        for (var m = 0; m < lessonGroupTokens[l].length; m++) {
          promises.all(sendQRCode(lessonGroupTokens[l][m].user.email, lessonGroupTokens[l][m].token));
        }
      }
      return Promise.all(promises)
        .then(function() {
          return Promise.resolve(lessonGroupTokens);
        });
    })
    .then(function(lessonGroupTokens) {
      // lets see whats next
    });
};

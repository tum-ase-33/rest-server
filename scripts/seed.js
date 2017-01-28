const app = require('../src/app');

// create initial superadmin user
const User = app.service('users');
const Lesson = app.service('lessons');
const LessonGroup = app.service('lesson-groups');
const LessonGroupToken = app.service('user-lesson-tokens');
const UserAssignments = app.service('user-lesson-assignments');
const superadminData = require('../schuedueler/data/superadmin');
const schueduelerData = require('../schuedueler/data/schuedueler');
let superadminUserId, lessonGroupId, lessonId;
User.create(superadminData)
  .then(user => {
    console.log('Superadmin created');
    return User.create(schueduelerData);
  })
  .then(user => {
    superadminUserId = user._id;
    console.log('Schedueler created');
    // create first lesson
    return Lesson.create({
      name: 'Example lesson'
    });
  })
  .then(lesson => {
    console.log('Lesson created');
    lessonId = lesson._id;
    return LessonGroup.create({
      name: 'Example lesson group #1',
      dates: [new Date().getTime(), new Date(2000, 1, 1).getTime()],
      lessonId: superadminUserId
    });
  })
  .then(lessonGroup => {
    console.log('Lesson group created');
    lessonGroupId = lessonGroup._id;
    return LessonGroupToken.create({
      userId: superadminUserId,
      lessonGroupId: lessonGroup._id
    });
  })
  .then(groupToken => {
    console.log('Lesson group token created');
    return UserAssignments.create({
      userId: superadminUserId,
      lessonId,
      lessonGroupId,
      roles: ['admin']
    })
  })
  .then(() => {
    console.log('User assignment created');

    console.log('SUCCESS');
    process.exit(0);
  })
  .catch(console.error);

const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

const { protect, adminOnly, superAdminOnly } = require('../middleware/auth'); 


router.get('/my-courses', protect, enrollmentController.getMyCourses);
router.get('/course/:courseId', protect, enrollmentController.getCourseDetails);
router.get('/stats', protect, enrollmentController.getGPA);


router.get('/course/:courseId/students', protect, adminOnly, enrollmentController.getStudentsInCourse);
router.post('/grade', protect, adminOnly, enrollmentController.submitGrade);
router.post('/assign', protect, adminOnly, enrollmentController.assign);

router.get('/manage/all', protect, superAdminOnly, enrollmentController.getAllEnrollments);
router.delete('/manage/:id', protect, superAdminOnly, enrollmentController.unenroll);
module.exports = router;
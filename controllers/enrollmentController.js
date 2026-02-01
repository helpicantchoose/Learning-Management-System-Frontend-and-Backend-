const Enrollment = require('../models/Enrollment');
const mongoose = require('mongoose');

exports.getMyCourses = async (req, res) => {
    const data = await Enrollment.find({ student_id: req.user.id })
        .populate({ path: 'course_id', populate: { path: 'teacher_id', select: 'name' }});
    res.json(data);
};

exports.getCourseDetails = async (req, res) => {
    const enrollment = await Enrollment.findOne({ student_id: req.user.id, course_id: req.params.courseId });
    res.json(enrollment);
};

exports.getGPA = async (req, res) => {
    const stats = await Enrollment.aggregate([
        { $match: { student_id: new mongoose.Types.ObjectId(req.user.id) } },
        { $unwind: "$grades" },
        { $group: { _id: "$student_id", avg: { $avg: "$grades.score" } } }
    ]);
    res.json(stats);
};


exports.getStudentsInCourse = async (req, res) => {
    try {
        const students = await Enrollment.find({ course_id: req.params.courseId })
            .populate('student_id', 'name email');
        res.json(students);
    } catch (err) {
        res.status(500).json(err);
    }
};


exports.submitGrade = async (req, res) => {
    try {
        const { studentId, courseId, item, score, comment } = req.body;
        if (score < 0 || score > 100) {
            return res.status(400).json({ message: "Score must be between 0 and 100" });
        }

        const updated = await Enrollment.findOneAndUpdate(
            { 
                student_id: studentId, 
                course_id: courseId, 
                "grades.item": item 
            },
            { 
                $set: { 
                    "grades.$.score": Number(score), 
                    "grades.$.comment": comment,
                    "grades.$.date": Date.now()
                } 
            },
            { new: true }
        );

        if (!updated) {
            const pushed = await Enrollment.findOneAndUpdate(
                { student_id: studentId, course_id: courseId },
                { 
                    $push: { grades: { item, score: Number(score), comment } } 
                },
                { new: true }
            );
            return res.json(pushed);
        }

        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.assign = async (req, res) => {
    try {
        const { student_id, course_id } = req.body;
        const exists = await Enrollment.findOne({ student_id, course_id });
        if (exists) return res.status(400).json({ message: "Student already enrolled" });

        const enrollment = await Enrollment.create({ student_id, course_id });
        res.status(201).json(enrollment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate('student_id', 'name')
            .populate('course_id', 'title');
        res.json(enrollments);
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.unenroll = async (req, res) => {
    try {
        await Enrollment.findByIdAndDelete(req.params.id);
        res.json({ message: "Student unenrolled successfully" });
    } catch (err) {
        res.status(500).json(err);
    }
};
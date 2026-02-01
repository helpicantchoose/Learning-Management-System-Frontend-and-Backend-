const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    grades: [{ 
        item: String, 
        score: Number, 
        comment: String,
        date: { type: Date, default: Date.now } 
    }]
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
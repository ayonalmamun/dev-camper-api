const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc Get courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler(async (req, res, next) => { 
    let query;

    if(req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId });
    } else {
        query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description'
        });
    }

    // check if the bootcamp exist in db
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if(!bootcamp) return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.bootcampId}`, 404));

    const courses = await query;
   
    res.status(200).json({success: true, count: courses.length, data: courses});
});
    
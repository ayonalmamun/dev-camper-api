const advancedResults = (model, populate) => async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };
    // console.log(reqQuery);

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    // removeFields.forEach(param => console.log(reqQuery[param]));
    removeFields.forEach(param => delete reqQuery[param]);

    // console.log(reqQuery);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = model.find(JSON.parse(queryStr));

    // Select Fields
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        // console.log(fields);
        query = query.select(fields);
    }

    // Sort
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt'); // so data will be always sorted as created in descending order
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1; // default will be 1 if page is not given in query
    const limit = parseInt(req.query.limit, 10) || 25; // default will be 25 if limit is not given in query
    // const limit = parseInt(req.query.limit, 10) || 1; // for testing purpose
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if(populate) {
        query = query.populate(populate);
    }

    // Executing query
    const results = await query;

    // Pagination result
    const pagination = {};
    if(endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next();
}

module.exports = advancedResults;
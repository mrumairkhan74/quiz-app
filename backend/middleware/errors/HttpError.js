class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode
    }
}

// Not Found

class NotFoundError extends HttpError {
    constructor(message = "Not Found") {
        super(404, message)
    }
}
// bad request
class BadRequestError extends HttpError {
    constructor(message = "Bad Request") {
        super(400, message)
    }
}
class ForbiddenError extends HttpError {
    constructor(message = "Forbidden") {
        super(403, message)
    }
}

// user conflict

class ConflictError extends HttpError {
    constructor(message = "Conflict || Already Exists") {
        super(409, message)
    }
}


// internal Error

class InternalServerError extends Error {
    constructor(message = "Internal Server Error") {
        super(500, message)
    }
}



module.exports = {
    NotFoundError,
    ConflictError,
    InternalServerError,
    BadRequestError,
    HttpError,
    ForbiddenError
}
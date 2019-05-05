

/**
   * constructor to create an ErrorWrapper made for node/express server
   * @constructor
   * @param {String} message - Message describing the error
   * @param {String} [name] - Error name (ErrorWrapper by default)
   * @param {Number} [statusCode] - HTTP status code to send back to client 
   */
class ErrorWrapper extends Error {

  constructor(message, name = "ErrorWrapper", statusCode = 500) {
    super(message);
    this.name = name; // this.name part of original js Error class. Name defines error type https://javascript.info/custom-errors
    this.statusCode = statusCode;
  }

  /**
   * @returns {Number} - returns a status code to send back to the client in error eg. (500 Internal Server Error, 400 Bad Request, etc)
   */
  getStatusCode() {
    return this.statusCode;
  }
}

module.exports = ErrorWrapper;
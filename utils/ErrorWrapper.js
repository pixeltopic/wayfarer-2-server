const HttpStatus = require("http-status-codes");

/**
 * constructor to create an ErrorWrapper made for node/express server
 * @constructor
 * @param {String} message - Message describing the error
 * @param {String} [name] - Error name (ErrorWrapper by default)
 * @param {Number} [statusCode] - HTTP status code to send back to client
 */
class ErrorWrapperClass extends Error {
  constructor(
    message,
    name = "ErrorWrapper",
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR
  ) {
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

const ErrorWrapper = (
  message,
  name = "ErrorWrapper",
  statusCode = HttpStatus.INTERNAL_SERVER_ERROR
) => new ErrorWrapperClass(message, name, statusCode);

module.exports = ErrorWrapper;

class ErrorResponse extends Error {
  constructor(status, message, statusCode) {
    super(status);
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;

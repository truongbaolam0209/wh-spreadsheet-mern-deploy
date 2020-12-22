const DEFAULT_STATUS_CODE = 200;
const MESSAGES_MAP = {
   '200': 'OK',
   '201': 'Created',
   '400': 'Bad Request',
   '401': 'Unauthorized',
   '403': 'Forbidden',
   '404': 'Not Found',
   '500': 'Internal Server Error',
   'default': 'Something went wrong!'
};

class HTTP extends Error {
   constructor(statusCode, message) {
      let code = formalStatusCode(statusCode);
      let mess = message || mapMessage(code);
      super(mess);
      this.statusCode = code;
   };
};

function formalStatusCode(code) {
   code = parseInt(code);
   return isValidStatus(code) ? code : DEFAULT_STATUS_CODE;
};

function isValidStatus(code) {
   return 200 <= code && code < 600;
};

function mapMessage(code) {
   return MESSAGES_MAP[code] || MESSAGES_MAP.default;
};

module.exports = {
   HTTP
};
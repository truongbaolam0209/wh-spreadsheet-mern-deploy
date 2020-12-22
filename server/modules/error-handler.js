
module.exports = (err, req, res, next) => {
   let code = err.statusCode || 500;
   let message = err.message || 'Something went wrong!';
   let stack = err.stack || null;

   return res.status(code).json({ message, stack });
};

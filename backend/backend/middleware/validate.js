// middleware/validate.js
// Generic Zod validation middleware factory.
// Usage: validate(schema) — validates req.body, req.query, or req.params.
const { ZodError } = require('zod');

/**
 * Factory that returns an Express middleware validating req.body against `schema`.
 * Returns 400 with a clear, structured error message on validation failure.
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed; // replace with coerced/parsed values
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
      }
      next(err);
    }
  };
}

module.exports = { validate };

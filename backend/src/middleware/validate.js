const validate = (schema) => (req, res, next) => {
  // Simple custom validation middleware
  // In a real app you'd use joi or express-validator
  if (!schema) return next();
  
  const errors = [];
  
  Object.keys(schema).forEach(field => {
    const rules = schema[field];
    const value = req.body[field];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
    }

    if (value !== undefined) {
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
      }
      
      if (rules.min && typeof value === 'number' && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

module.exports = validate;

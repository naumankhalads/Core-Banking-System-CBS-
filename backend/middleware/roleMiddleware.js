// Middleware to check user roles
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.'
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}`
      });
    }

    next();
  };
};

// Specific middleware functions
const isAdmin = checkRole('admin');
const isCustomer = checkRole('customer');
const isAdminOrCustomer = checkRole('admin', 'customer');

module.exports = {
  checkRole,
  isAdmin,
  isCustomer,
  isAdminOrCustomer
};
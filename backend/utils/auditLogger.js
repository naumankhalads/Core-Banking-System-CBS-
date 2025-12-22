const { AuditLog } = require('../models');


const createAuditLog = async (logData) => {
  try {
    await AuditLog.create({
      operation: logData.operation,
      table_affected: logData.table_affected,
      record_id: logData.record_id?.toString(),
      user_email: logData.user_email,
      user_role: logData.user_role,
      description: logData.description,
      ip_address: logData.ip_address
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    
  }
};


const getClientIP = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         'unknown';
};


const auditMiddleware = (operation) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
  
      if (res.statusCode >= 200 && res.statusCode < 300) {
        createAuditLog({
          operation: operation || req.method,
          table_affected: req.baseUrl.split('/')[2] || 'unknown',
          record_id: req.params.id || null,
          user_email: req.user?.email || 'anonymous',
          user_role: req.user?.role || 'system',
          description: `${req.method} ${req.originalUrl}`,
          ip_address: getClientIP(req)
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  createAuditLog,
  getClientIP,
  auditMiddleware
};
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const { AuditLog } = require('../models');

router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { limit = 100, offset = 0, table, operation } = req.query;
    
    let whereClause = {};
    if (table) whereClause.table_affected = table;
    if (operation) whereClause.operation = operation;

    const logs = await AuditLog.findAndCountAll({
      where: whereClause,
      order: [['log_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        logs: logs.rows,
        total: logs.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message
    });
  }
});

module.exports = router;
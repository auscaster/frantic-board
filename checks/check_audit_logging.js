module.exports = async function(context) {
  const passed = context.auditLogging && context.auditLogging.enabled === true;
  return { passed, message: passed ? 'Audit logging is enabled' : 'Audit logging is disabled' };
};
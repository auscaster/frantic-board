module.exports = async function(context) {
  const passed = context.encryption && context.encryption.atRest && context.encryption.inTransit;
  return { passed, message: passed ? 'Encryption is properly configured' : 'Encryption is not fully enabled' };
};
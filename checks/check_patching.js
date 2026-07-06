module.exports = async function(context) {
  const passed = context.patching && context.patching.upToDate === true;
  return { passed, message: passed ? 'Systems are up-to-date with patches' : 'Systems require patching' };
};
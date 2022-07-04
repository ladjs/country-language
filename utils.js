exports.isFunction = function (fn) {
  const getType = {};
  return fn && getType.toString.call(fn) === '[object Function]';
};

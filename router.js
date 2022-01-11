function route(handle, pathname, params) {
  if (typeof handle[pathname] === 'function') {
    return handle[pathname](params);
  } else {
    return pathname + ' is not defined';
  }
}
exports.route = route; 

var http = require("http");
var url = require("url");
var querystring = require('querystring');// 引入 querystring 库，也是帮助解析用的
function start(route, handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    const query = url.parse(request.url).query;
    var params = querystring.parse(query);
    var html = route(handle, pathname, params);
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write(html);
    response.end();
  }

  http.createServer(onRequest).listen(8888);
}

exports.start = start; 

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./app");
var handle = {}

handle["/pixiv"] = requestHandlers.pixiv;

server.start(router.route, handle); 

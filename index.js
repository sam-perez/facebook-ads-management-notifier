const bodyParser = require('body-parser');
const co = require('co');
const express = require('express');
const express_wrap = require('co-express');
const http = require('http');

const facebookService = require('./facebook_service.js');

const router = express();
const server = http.createServer(router);

// parse application/json
router.use(bodyParser.json());

router.get(`/facebook_ad_targeting_categories`, express_wrap(function*(req, res) {
    const adTargetingCategories = yield facebookService.fetchFacebookAdTargetingCategories();
    res.send(adTargetingCategories);
}));

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
    const addr = server.address();
    console.log("server listening at", addr.address + ":" + addr.port);
});
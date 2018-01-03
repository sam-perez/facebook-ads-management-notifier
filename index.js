const bodyParser = require('body-parser');
const co = require('co');
const express = require('express');
const express_wrap = require('co-express');
const http = require('http');
const R = require('ramda');

const facebookService = require('./facebook_service.js');
const elasticsearchService = require('./elasticsearch_service.js').create(); 
const snapshotCompareService = require('./snapshot_compare_service.js').create(); 

const storeSnapshot = co.wrap(function*() {
    const adTargetingCategories = yield facebookService.fetchFacebookAdTargetingCategories();
    const snapshotInsertResult = 
        yield elasticsearchService.insertFacebookAdsTargetingSnapshot(adTargetingCategories);
        
    return {adTargetingCategories, snapshotInsertResult};
});

const compareSnapshots = co.wrap(function*() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - (60*60*24*7*1000));

    const [nowSnapshot, oneWeekAgoSnapshot] = yield [
        elasticsearchService.getClosestSnapshot(now),
        elasticsearchService.getClosestSnapshot(oneWeekAgo)
    ];
    
    const changes = snapshotCompareService.compareSnapshots(
        oneWeekAgoSnapshot.snapshot,
        nowSnapshot.snapshot
    );
    
    return {now, oneWeekAgo, nowSnapshot, oneWeekAgoSnapshot, changes}
});

exports.storeSnapshot = storeSnapshot;
exports.compareSnapshots = compareSnapshots;

if (require.main === module) {
    const router = express();
    const server = http.createServer(router);
    
    // parse application/json
    router.use(bodyParser.json());
    
    router.get(`/facebook_ad_targeting_categories`, express_wrap(function*(req, res) {
        const adTargetingCategories = yield facebookService.fetchFacebookAdTargetingCategories();
        res.send(adTargetingCategories);
    }));
    
    router.get(`/store_snapshot`, express_wrap(function*(req, res) {
        const {adTargetingCategories, snapshotInsertResult} = yield storeSnapshot();
        res.status(R.has('error', snapshotInsertResult) ? 400 : 200)
            .send({adTargetingCategories, snapshotInsertResult});
    }));

    router.get(`/get_snapshots`, express_wrap(function*(req, res) {
        const {now, oneWeekAgo, nowSnapshot, oneWeekAgoSnapshot, changes} = yield compareSnapshots();

        res.send({
            changes,
            now: {
                now,
                nowSnapshot
            },
            oneWeekAgo: {
                oneWeekAgo,
                oneWeekAgoSnapshot
            }
        });
    }));
    
    server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
        const addr = server.address();
        console.log("server listening at", addr.address + ":" + addr.port);
    });
}
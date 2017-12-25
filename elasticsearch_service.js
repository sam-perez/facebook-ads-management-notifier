const co = require('co');
const elasticsearch = require('elasticsearch');

const CONNECTION_URL = process.env.BONSAI_URL;
const FACEBOOK_ADS_TARGETING_SNAPSHOT_INDEX = 'fb_ads_snapshots';
const FACEBOOK_ADS_TARGETING_SNAPSHOT_TYPE = 'snapshot';

const createElasticSearchService = () => {
    
    return {
        insertFacebookAdsTargetingSnapshot: co.wrap(function*(snapshot) {
            try {
                const client = new elasticsearch.Client({host: CONNECTION_URL});
                const now = new Date();
                const id = now.getTime().toString();
                const timestamp = now.toISOString();
                const result = yield client.index({
                    index: FACEBOOK_ADS_TARGETING_SNAPSHOT_INDEX,
                    type: FACEBOOK_ADS_TARGETING_SNAPSHOT_TYPE,
                    id,
                    body: {
                        timestamp,
                        snapshot
                    }
                });
                
                return { result };
            } catch (error) {
                return { error }
            }
        })
    };
};

exports.create = createElasticSearchService;
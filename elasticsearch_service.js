const co = require('co');
const elasticsearch = require('elasticsearch');
const R = require('ramda');

const CONNECTION_URL = process.env.BONSAI_URL;
const FACEBOOK_ADS_TARGETING_SNAPSHOT_INDEX = 'fb_ads_snapshots';
const FACEBOOK_ADS_TARGETING_SNAPSHOT_TYPE = 'snapshot';

const CLOSEST_TIME_QUERY_TEMPLATE = (date) => {
    return {
        query: {
            function_score: {
                functions: [{
                    linear: {
                        timestamp: {
                            origin: date.toISOString(),
                            scale: '28d'
                        }
                    }
                }],
                score_mode: 'multiply',
                boost_mode: 'multiply',
                query: {
                    match_all: {}
                }
            }
        }
    };
};


const createElasticSearchService = () => {
    const client = new elasticsearch.Client({ host: CONNECTION_URL });

    return {
        insertFacebookAdsTargetingSnapshot: co.wrap(function*(snapshot) {
            try {
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
            }
            catch (error) {
                return { error }
            }
        }),
        getClosestSnapshot: co.wrap(function*(date) {
            try {
                const query = CLOSEST_TIME_QUERY_TEMPLATE(date);
                const result = yield client.search({
                    index: FACEBOOK_ADS_TARGETING_SNAPSHOT_INDEX,
                    type: FACEBOOK_ADS_TARGETING_SNAPSHOT_TYPE,
                    size: 1,
                    body: query
                });
            
                return R.path(['hits', 'hits', '0', '_source'], result);
            } catch (error) {
                return { error };
            }
        })
    };
};

exports.create = createElasticSearchService;

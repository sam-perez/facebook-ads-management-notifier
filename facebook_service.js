const axios = require('axios');
const co = require('co');

const FACEBOOK_ADS_MANAGEMENT_TOKEN = process.env['FACEBOOK_ADS_MANAGEMENT_TOKEN'];

const getFacebookAdTargetingCategoriesURL = (token) =>
    `https://graph.facebook.com/v2.11/search?access_token=${token}&type=adTargetingCategory`;
    
const fetchFacebookAdTargetingCategories = co.wrap(function*() {
    const response = yield axios.get(
        getFacebookAdTargetingCategoriesURL(FACEBOOK_ADS_MANAGEMENT_TOKEN)
    );
    
    return response.data.data;
});

exports.fetchFacebookAdTargetingCategories = fetchFacebookAdTargetingCategories;
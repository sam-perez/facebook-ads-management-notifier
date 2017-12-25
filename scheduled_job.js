const {storeSnapshot} = require('./index.js');

storeSnapshot().then(({adTargetingCategories, snapshotInsertResult}) => {
    // do something with these results
    console.log('I have finished storing a snapshot');
});
const {compareSnapshots, storeSnapshot} = require('./index.js');
const {sendStatusEmail} = require('./sendgrid_service.js');

storeSnapshot()
    .then(({adTargetingCategories, snapshotInsertResult}) => {
        console.log('I have finished storing a snapshot, time to compare...');
    
        return compareSnapshots();
    })
    .then(({changes}) => {
        const changesStr = [
            'Removed:',
            JSON.stringify(changes.removed, null, 4),
            'Added:',
            JSON.stringify(changes.added, null, 4),
            'Changed:',
            JSON.stringify(changes.changed, null, 4)
        ].join('\n\n\n');

        sendStatusEmail(changesStr);
    })
    .catch((err) => {
        console.log('ENCOUNTERED ERRORS DURING EXECUTION');
        console.log(err);
        process.exit(1);
    });

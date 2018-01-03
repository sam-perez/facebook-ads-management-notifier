const R = require('ramda');

const createSnapshotCompareService = () => {
    const buildMap = (snapshotBehaviors) => {
        return R.reduce(
            (acc, behavior) => {
                return R.assoc(behavior.id, behavior, acc);
            },
            {},
            snapshotBehaviors
        );
    };
    
    const findMissingBehaviors = (firstMap, secondMap) => {
        const keysToSearchFor = R.keys(firstMap);
        
        return R.reduce(
            (acc, behaviorKey) => {
                if (R.has(behaviorKey, secondMap)) {
                    return acc;
                }

                return R.append(firstMap[behaviorKey], acc);
            },
            [],
            keysToSearchFor
        );
    }
    
    const findChangedBehaviours = (firstMap, secondMap) => {
        const keysToSearchFor = R.keys(firstMap);
        
        return R.reduce(
            (acc, behaviorKey) => {
                const secondHasBehavior = R.has(behaviorKey, secondMap);

                const firstAudienceSize = R.path([behaviorKey, 'audience_size'], firstMap);
                const secondAudienceSize = R.path([behaviorKey, 'audience_size'], secondMap);
                const audienceSizeHasChanged = firstAudienceSize !== secondAudienceSize;

                if (secondHasBehavior && audienceSizeHasChanged) {
                    return R.append(
                        R.pipe(
                            R.dissoc('audience_size'),
                            R.merge({
                                previous_audience_size: firstAudienceSize,
                                current_audience_size: secondAudienceSize,
                                percent_change: 100 - (100 * firstAudienceSize / secondAudienceSize)
                            })
                        )(firstMap[behaviorKey]),
                        acc
                    );
                }

                return acc;
            },
            [],
            keysToSearchFor
        );
    }
    
    return {
        compareSnapshots: (firstSnapshot, secondSnapshot) => {
            const firstMap = buildMap(firstSnapshot);
            const secondMap = buildMap(secondSnapshot);
            
            const removed = findMissingBehaviors(firstMap, secondMap);
            const added = findMissingBehaviors(secondMap, firstMap);

            const comp = (a, b) => Math.abs(b.percent_change) - Math.abs(a.percent_change);
            const changed = R.sort(
                comp,
                findChangedBehaviours(firstMap, secondMap)
            );
            
            return {
                removed,
                added,
                changed
            };
        }
    };
};

exports.create = createSnapshotCompareService;

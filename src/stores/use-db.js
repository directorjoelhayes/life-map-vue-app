import { BrowserLevel } from "browser-level";
import { ulid } from "ulid";




export function useDb(name, params = {
    updates: {
        name: 'updates',

        //will clear hot db after this many puts
        //48 hours at 1 put per minute
        historySize: 100,
        currentIndex: 0,
        clearThreshold: {
            //history is limited to 100, but 20 more will remain
            //so we can clear 20 items as a batch operation
            //rather than 1 at a time once the history is full
            //this is a performance optimization and could help with snapshots also
            historySize: 100,
            increment: 120,
            clearNumber: 20,
        }
    }
} = {}) {

    const db = new BrowserLevel(name, {
        valueEncoding: "json",
    });

    const dbSubLevels = {
        updates: db.sublevel('updates', { valueEncoding: 'json' }),
        storage: db.sublevel('storage', { valueEncoding: 'json' }),
        metrics: db.sublevel('metrics', { valueEncoding: 'json' })
    }

    return {
        put: async ({ key = ulid(), value } = {}) => {
            try {

                await dbSubLevels.updates.put(key, {
                    put: {
                        ...value,
                        id: key
                    }
                });

                let puts = 1;

                try {
                    let metrics = await dbSubLevels.metrics.get('updates');

                    if (!metrics) {
                        metrics = {
                            puts: 0
                        }
                    }
                    puts = metrics.puts + 1;
                    await dbSubLevels.metrics.put('updates', {
                        ...metrics,
                        puts
                    });
                } catch {
                    await dbSubLevels.metrics.put('updates', {
                        puts
                    });
                }

                if (puts >= params.updates.clearThreshold.increment) {
                    await dbSubLevels.updates.clear();
                }

                if (params.updates.addThreshold.increment % puts === 0) {
                    await dbSubLevels.storage.put(key, value);
                }
            } catch (error) {
                console.error(error);
                return error
            }
        },
        get: async (key) => {
            try {
                
                return await dbSubLevels.updates.get(key);
            } catch (error) {
                try {
                    return await dbSubLevels.storage.get(key);
                } catch (error) {
                    console.error(error);
                    return error
                }
            }
        },
        iterator: async function* (options) {
            const yeilded = []
            const iterator = {
                [Symbol.asyncIterator]: async function* () {
                    // Yield all entries from hot storage first
                    for await (const entry of dbSubLevels.updates.iterator(options)) {
                        yield entry;
                    }
                    // Then yield all entries from cold storage
                    for await (const entry of dbSubLevels.storage.iterator(options)) {
                        yield entry;
                    }
                },
                // Method to collect all entries
                async all() {
                    const results = [];
                    for await (const entry of this) {
                        results.push(entry);
                    }
                    return results;
                }
            };

            return iterator;
        },
        batch: async (batch) => {
            try {
                // Count the number of puts in the batch
                const putOperations = batch.filter(op => op.type === 'put').length;

                // Get current metrics
                let currentPuts = 0;
                try {
                    const metrics = await dbSubLevels.metrics.get('updates');
                    currentPuts = metrics.puts;
                } catch {
                    // If no metrics exist, currentPuts remains 0
                }

                const totalPuts = currentPuts + putOperations;

                // Execute hot storage batch
                await dbSubLevels.updates.batch(batch);

                // Update metrics
                await dbSubLevels.metrics.put('updates', {
                    ...metrics,
                    puts: totalPuts
                });

                // Check if we need to clear hot storage
                if (totalPuts % params.hot.clearThreshold.increment === 0) {
                    await clear(dbSubLevels.updates, params.hot.clearThreshold.clearNumber);
                }

                // Check if we need to add to cold storage
                if (totalPuts >= params.cold.addThreshold.increment) {
                    // Filter operations that should go to cold storage based on their position
                    const coldBatch = batch.filter((op, index) => {
                        if (op.type !== 'put') return false;
                        // Calculate the absolute position of this operation
                        const absolutePosition = currentPuts + index + 1;
                        // Only include operations that fall on the increment boundary
                        return absolutePosition % params.cold.addThreshold.increment === 0;
                    });

                    if (coldBatch.length > 0) {
                        await dbSubLevels.storage.batch(coldBatch);
                    }
                }
            } catch (error) {
                console.error(error);
                return error;
            }
        },
        del: async (key) => {
            try {
                await dbSubLevels.updates.del(key);
            } catch (error) {
                try {
                    await dbSubLevels.storage.del(key);
                } catch (error) {
                    throw new Error('Key not found');
                }
            }
        },
        keys: async function* (options) {
            // Yield all hot keys first
            for await (const key of dbSubLevels.updates.keys(options)) {
                yield key;
            }
            // Then yield all cold keys
            for await (const key of dbSubLevels.storage.keys(options)) {
                yield key;
            }
        },
        clear: async (db, limit) => {
            try {
                for (const [key, value] of db.iterator({ limit })) {

                }
                for await (const key of db.keys({ limit })) {
                    await db.del(key);
                }
            } catch (error) {
                console.error(error);
            }
        },
    }
}


return {
    db,
};

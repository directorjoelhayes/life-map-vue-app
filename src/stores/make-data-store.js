import { defineStore } from "pinia";
import { ulid } from "ulid";
import { BrowserLevel } from "browser-level";

// console.log(BrowserLevel, "browser level");


export default function makeDataStore(name) {

    const persistentDb = new BrowserLevel(name, { valueEncoding: "json" });

    const subLevel = {
        updates: persistentDb.sublevel("updates", { valueEncoding: "json" }),
        meta: persistentDb.sublevel("meta", { valueEncoding: "json" }),
        db: persistentDb.sublevel("db", { valueEncoding: "json" }),
    }


    return defineStore(name, {
        state: () => ({
            updates: new Map(),
            db: new Map(),
            meta: {
                currentIndex: 0,
                historySize: 15,
                clearThreshold: {
                    increment: 20,
                    clearNumber: 5,
                },
                currentKey: "",
                updates: 0,
            }
        }),
        getters: {
            getAll: (state) => {
                //cloned db
                const clonedDb = new Map(state.db);

                const updatesArray = Array.from(state.updates.entries());

                // If no current key, just return the cloned db
                if (!state.meta.currentKey) {
                    return clonedDb;
                }

                const currentIndex = updatesArray.findIndex(
                    ([key]) => key === state.meta.currentKey
                );

                // If key not found, return the cloned db
                if (currentIndex === -1) {
                    return clonedDb;
                }

                //sliced updates
                const slicedUpdates = updatesArray.slice(0, currentIndex + 1);

                console.log(slicedUpdates, "slicedUpdates");
                console.log(currentIndex, "slicedUpdates");

                //apply updates to cloned db
                //apply updates to cloned db
                for (const [key, update] of slicedUpdates) {
                    if (update.type === "put") {
                        clonedDb.set(update.target, update.value);
                    }
                    if (update.type === "del") {
                        clonedDb.delete(update.target);
                    }
                    if (update.type === "multiPut") {

                        for (const [key, value] of update.updates) {
                            console.log(key, value, "key, value", "composed");
                            clonedDb.set(key, value);
                        }
                    }
                    if (update.type === "multiDel") {
                        for (const key of update.keys) {
                            console.log(key, "key", "composed");
                            clonedDb.delete(key);
                        }
                    }
                }
                return clonedDb;
            },
        },
        actions: {
            setItem(key, value) {
                this.db.set(key, value);
                return this.put(key, value);
            },
            deleteItem(key) {
                this.db.delete(key);
                return this.del(key);
            },
            async clearDb() {
                await subLevel.db.clear();
                await subLevel.updates.clear();
                await subLevel.meta.clear();
            },
            async loadDb() {
                const dbData = await subLevel.db.iterator().all();
                this.db = new Map(dbData);
                const updatesData = await subLevel.updates.iterator().all();
                console.log(updatesData, "updatesData");
                this.updates = new Map(updatesData);
                const metaData = await subLevel.meta.iterator().all();
                metaData.forEach(([key, value]) => {
                    this.meta[key] = value;
                });
            },
            async saveDb() {
                const dbData = Array.from(this.db.entries()).map(([key, value]) => ({
                    key,
                    value,
                    type: "put",
                }));

                const currentDbData = await subLevel.db.iterator().all();

                //look for deletes
                const deleteData = currentDbData.filter(([key, value]) => !this.db.has(key)).map(([key, value]) => ({
                    key,
                    value,
                    type: "del",
                }));

                const allData = [...dbData, ...deleteData];

                await subLevel.db.batch(allData);



                const updatesData = Array.from(this.updates.entries())
                    .map(([key, value]) => ({
                        key,
                        value,
                        type: "put",
                    }));

                // Get current updates data to check for deletes
                const currentUpdatesData = await subLevel.updates.iterator().all();

                // Look for deletes in updates
                const deleteUpdatesData = currentUpdatesData.filter(([key, value]) => !this.updates.has(key)).map(([key, value]) => ({
                    key,
                    value,
                    type: "del",
                }));

                const allUpdatesData = [...updatesData, ...deleteUpdatesData];

                await subLevel.updates.batch(allUpdatesData);

                const dbMeta = Object.entries(this.meta).map(([key, value]) => ({
                    key,
                    value,
                    type: "put",
                }));
                await subLevel.meta.batch(dbMeta);

                console.log("saved");
            },
            async treeCheck() {

                //check if updates is empty
                if (this.updates.size === 0) {
                    return;
                }

                const updatesArray = Array.from(this.updates.entries());
                const currentIndex = updatesArray.findIndex(
                    ([key]) => key === this.meta.currentKey
                );

                if (currentIndex === -1) {
                    return;
                }

                if (currentIndex < updatesArray.length - 1) {
                    //slice at current index
                    const slicedUpdates = updatesArray.slice(currentIndex + 1, updatesArray.length);

                    //delete all updates after current index
                    for (const [key, update] of slicedUpdates) {
                        this.updates.delete(key);
                    }

                    //update meta
                    this.meta.updates = currentIndex + 1;
                }


            },
            async put(key, value) {

                await this.treeCheck();

                const updateKey = `${ulid()}:${key}`;

                //get the last update
                const lastUpdate = this.updates.get(this.meta.currentKey);

                //format update
                const update = {
                    id: updateKey,
                    //helps keep chain of updates if distributed
                    last: lastUpdate,
                    target: key,
                    type: "put",
                    action: "Update user",
                    timestamp: Date.now(),
                    key,
                    value,
                };

                this.updates.set(updateKey, update);
                this.meta.currentKey = updateKey;
                this.meta.updates++;

                if (this.meta.updates === this.meta.clearThreshold.increment) {
                    await this.bulkUpdates(this.updates);
                    this.meta.updates = this.meta.historySize;
                }
            },
            async del(key, value) {

                console.log(key, "key");

                this.treeCheck();

                const lastUpdate = this.updates.get(this.meta.currentKey);


                const updateKey = `${ulid()}:${key}`;
                this.updates.set(updateKey, {
                    id: updateKey,
                    type: "del",
                    last: lastUpdate,
                    target: key,
                    value: { ...value },
                    action: "Delete user",
                    timestamp: Date.now(),
                });

                this.meta.currentKey = updateKey;
                this.meta.updates++;

                // await this.saveDb();
            },
            async multiPut(updates, action) {

                this.treeCheck();

                const updateKey = `${ulid()}:multiPut`;

                const lastUpdate = this.updates.get(this.meta.currentKey);
                this.updates.set(updateKey, {
                    type: "multiPut",
                    updates: updates,
                    action: action,
                    target: "multiPut",
                    last: lastUpdate,
                    timestamp: Date.now(),
                })

                this.meta.currentKey = updateKey;
                this.meta.updates++;
            },
            async multiDel(keys, action) {

                this.treeCheck();

                const updateKey = `${ulid()}:multiDel`;
                const lastUpdate = this.updates.get(this.meta.currentKey);
                this.updates.set(updateKey, {
                    type: "multiDel",
                    keys: keys,
                    action: action,
                    target: "multiDel",
                    last: lastUpdate,
                    timestamp: Date.now(),
                })

                this.meta.currentKey = updateKey;
                this.meta.updates++;

                // await this.saveDb();
            },
            async bulkUpdates(updates) {
                //select clear number of updates
                const clearNumber = this.meta.clearThreshold.clearNumber;
                // Maps don't have slice method - convert to array, slice, then process
                const updatesArray = Array.from(updates.entries());
                const clearUpdates = updatesArray.slice(0, clearNumber);

                for (const [key, update] of clearUpdates) {
                    if (update.type === "put") {
                        this.db.set(update.target, update.value); // Using this.db instead of db
                    }
                    if (update.type === "del") {
                        this.db.delete(update.target);
                    }
                    if (update.type === "multiPut") {
                        for (const [key, value] of update.updates) {
                            this.db.set(key, value);
                        }
                    }
                    if (update.type === "multiDel") {
                        for (const key of update.keys) {
                            this.db.delete(key);
                        }
                    }
                }

                //remove clear updates from updates
                clearUpdates.forEach(([key]) => {
                    updates.delete(key);
                });

            },
            get(id) {
                // Loop through all keys in a map
                for (const [key, update] of this.updates) {
                    if (key.split(":")[1] === id) {
                        if (update.type === "put") {
                            return update.value;
                        }
                        if (update.type === "del") {
                            return null;
                        }
                    }
                }

                return this.db.get(id); // Use this.db instead of db
            },
            undo() {
                const updatesArray = Array.from(this.updates.entries());

                if (updatesArray.length === 0) return; // No updates to undo

                if (!this.meta.currentKey && updatesArray.length > 0) {
                    // No current position, nothing to undo
                    return;
                }

                const currentIndex = updatesArray.findIndex(
                    ([key]) => key === this.meta.currentKey
                );

                // Only undo if we're not at the beginning
                if (currentIndex > 0) {
                    this.meta.currentKey = updatesArray[currentIndex - 1][0];
                    this.meta.updates--;
                }
            },
            redo() {
                const updatesArray = Array.from(this.updates.entries());

                if (updatesArray.length === 0) return; // No updates to redo

                if (!this.meta.currentKey) {
                    // No current position, start at the beginning
                    this.meta.currentKey = updatesArray[0][0];
                    this.meta.updates = 1;
                    return;
                }

                const currentIndex = updatesArray.findIndex(
                    ([key]) => key === this.meta.currentKey
                );

                // Only redo if we're not at the end
                if (currentIndex < updatesArray.length - 1) {
                    this.meta.currentKey = updatesArray[currentIndex + 1][0];
                    this.meta.updates++;
                }
            },
            clear() {
                this.updates.clear();
                this.db.clear();
                this.meta.currentKey = "";
                this.meta.updates = 0;
            },
            clearDb() {
                persistentDb.clear();
                this.updates.clear();
                this.db.clear();
                this.meta.currentKey = "";
                this.meta.updates = 0;
            },
            set(key, value) {
                this.db.set(key, value);
            }
        }
    })
}

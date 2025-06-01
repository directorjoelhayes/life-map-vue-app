export default function composeDataStore({
    store,
    data,
    runAfter
} = {}) {

    const composeData = (state) => {
        //cloned db
        const clonedDb = new Map(state.db);

        const updatesArray = Array.from(state.updates.entries());

        // If no current key, just return the cloned db
        if (!state.meta.currentKey) {
            console.log(clonedDb, "no current key", "tag");
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

        console.log(slicedUpdates, "slicedUpdates", "tag");

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
    }

    const unsubscribe = store.$onAction(
        ({
            name, // name of the action
            store, // store instance, same as `someStore`
            args, // array of parameters passed to the action
            after, // hook after the action returns or resolves
            onError, // hook if the action throws or rejects
        }) => {
            // a shared variable for this specific action call
            const startTime = Date.now()

            console.log(name, "name");
            // this will trigger before an action on `store` is executed
            if (![
                "put",
                "del",
                "undo",
                "redo",
                "multiPut",
                "multiDel",
                "bulkUpdates"
            ].includes(name))
                return;

            const beforeUpdate = new Map(store.updates);

            // this will trigger if the action succeeds and after it has fully run.
            // it waits for any returned promises to resolve
            after((result) => {
                //compose data
                const composedData = composeData(store);


                console.log(composedData, "composedData");

                let longerSet = store.updates;
                if (beforeUpdate.size > store.updates.size) {
                    longerSet = beforeUpdate;
                }

                // const updates = Array.from(longerSet.entries());

                const toUpdate = new Map();

                //only keep last update 
                for (const [key, update] of longerSet.entries()) {
                    if(update.type === "multiPut") {
                        for (const [key, value] of update.updates) {
                            toUpdate.set(key, {...value, target: key});
                        }
                    } else {
                        toUpdate.set(update.target, update);
                    }
                }


                const deletedItems = [];
                //apply updates
                for (const [key, update] of toUpdate.entries()) {

                    console.log(composedData.has(update.target), "has");
                    //was deleted
                    if (!composedData.has(update.target)) {
                        if(data.has(update.target)) {
                            deletedItems.push(update.target);
                            data.delete(update.target);
                        }
                    } else {
                        //update
                        if(!data.has(update.target)) {
                            //add back
                            const value = composedData.get(update.target);
                            data.set(update.target, {...value});
                        } else {
                            console.log("update", update.target);
                            const updatedValue = composedData.get(update.target);
                            const currentValue = data.get(update.target);
                            console.log(updatedValue, currentValue, "updatedValue");
                            Object.assign(currentValue, updatedValue);
                        }
                    }
                }

                if(runAfter) {
                    console.log(runAfter, "runAfter");
                    if(typeof runAfter === "function") {
                        runAfter({
                            data, name, deletedItems
                        });
                    }
                }
            })

            // this will trigger if the action throws or returns a promise that rejects
            onError((error) => {
                console.warn(
                    `Failed "${name}" after ${Date.now() - startTime}ms.\nError: ${error}.`
                )
            })
        }
    )

    // manually remove the listener
    return unsubscribe;
}
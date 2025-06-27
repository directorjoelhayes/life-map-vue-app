const stores = {};

export const useTableStore = (id) => {
    if (!stores[id]) {
        stores[id] = {
            visibleChunks: [],
            removeStore: () => {
                delete stores[id];
            }
        }
    }
    return stores[id];
}

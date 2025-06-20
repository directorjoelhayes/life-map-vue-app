const store = {};

export default function buildSelectedGroup(name, {
    selected,
}) {


    if (!store[name]) {
        store[name] = {
            selected,
        }
    }
}
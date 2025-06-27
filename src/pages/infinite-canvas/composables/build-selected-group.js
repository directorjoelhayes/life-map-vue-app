const store = {};

import { onUnmounted, ref } from "vue";

export default function buildSelectedGroup(name, {
    selected,
    padding = 10
}) {

    if (!store[name]) {
        store[name] = {
            selected,
            padding,
            groupBox: ref({
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            }),
            updateGroupBox(selected) {

                if (selected.length === 0) {
                    this.groupBox.value = {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0,
                    };
                    return;
                }

                const { x, y, width, height } = selected.reduce(
                    (acc, item) => {
                        acc.x = Math.min(acc.x, item.x);
                        acc.y = Math.min(acc.y, item.y);
                        acc.width = Math.max(acc.width, item.x + item.width);
                        acc.height = Math.max(acc.height, item.y + item.height);
                        return acc;
                    },
                    { x: Infinity, y: Infinity, width: 0, height: 0 }
                );
                this.groupBox.value = {
                    x: x - this.padding,
                    y: y - this.padding,
                    width: width + this.padding * 2,
                    height: height + this.padding * 2,
                };
            }
        }
    }

    onUnmounted(() => {
        delete store[name];
    });

    return store[name];
}
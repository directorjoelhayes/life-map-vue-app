const store = {

};

import dragSelectBox from "../block-features/drag-select-box.vue";

import { ref, onBeforeUnmount } from "vue";

//TODO implement shift key logic for multi-selection

export default function buildSelectBox(name, {
    selected,
    zoomFactor,
    container,
    items,
    keysPressed
}) {

const selectionBoxDefaults = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        hidden: true,
    }

    if (!store[name]) {
        store[name] = {
            event: false,
            selected,
            dragging: ref(false),
            selectionBox: ref({...selectionBoxDefaults}),
            zoomFactor,
            container,
            keysPressed,
            onPointerDown(event) {
                const rect = this.container.value.getBoundingClientRect();
                this.event = {
                    start: {
                        x: (event.clientX - rect.left) / this.zoomFactor.value,
                        y: (event.clientY - rect.top) / this.zoomFactor.value,
                    },
                    current: {
                        x: (event.clientX - rect.left) / this.zoomFactor.value,
                        y: (event.clientY - rect.top) / this.zoomFactor.value,
                    }
                };

                // Initialize selection box
                this.selectionBox.value = {
                    ...selectionBoxDefaults,
                    x: this.event.start.x,
                    y: this.event.start.y,
                    hidden: false,
                };

                // Clear any previous selection
                if (!this.keysPressed.map((a) => a.key).includes("Shift")) {
                    this.selected.value = [];
                }
            },
            onPointerMove(event) {
                // Get current position
                const rect = this.container.value.getBoundingClientRect();
                this.event.current = {
                    x: (event.clientX - rect.left) / this.zoomFactor.value,
                    y: (event.clientY - rect.top) / this.zoomFactor.value,
                };

                // Update selection box
                const startX = this.event.start.x;
                const startY = this.event.start.y;
                const currentX = this.event.current.x;
                const currentY = this.event.current.y;

                // Calculate the top-left corner and dimensions
                const x = Math.min(startX, currentX);
                const y = Math.min(startY, currentY);
                const width = Math.abs(currentX - startX);
                const height = Math.abs(currentY - startY);

                // Update the selection box
                this.selectionBox.value = {
                    x,
                    y,
                    width,
                    height,
                };
                // Find items within the selection box
                const box = this.selectionBox.value;
                const newSelectedItems = [];

                // Iterate through Map entries to check each item
                for (const item of items.value) {
                    // Check if item overlaps with selection box
                    if (
                        item.x < box.x + box.width &&
                        item.x + item.width > box.x &&
                        item.y < box.y + box.height &&
                        item.y + item.height > box.y
                    ) {
                        newSelectedItems.push(item.id);
                    }
                }

                this.selected.value = newSelectedItems
            },
            onPointerUp(event) {
                this.event = false;
                this.dragging.value = false;


                // immediately hide the selection box
                this.selectionBox.value = {
                    ...this.selectionBox.value,
                    hidden: true,
                };

                // allow the selection box dimensions to be accessable for 400ms
                // this is for the user to create items from the selection box shape
                // sometimes the user will create items after releasing the mouse button
                setTimeout(() => {
                    // reset the selection box dimensions
                    this.selectionBox.value = {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0,
                        hidden: true,
                    };
                }, 400);
            },
            dragSelectBox: dragSelectBox,
        }
    }

    onBeforeUnmount(() => {
        delete store[name];
    });

    return store[name];
}
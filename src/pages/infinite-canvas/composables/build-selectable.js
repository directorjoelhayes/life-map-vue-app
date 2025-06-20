import { ref, onBeforeUnmount } from "vue";

const store = {};

//name might be an id or a name depending on the size of application

export default function buildSelectable(name, {
    //array for storing selected item ids
    buildSelectionBox,
} = {}) {
    
    if (!store[name]) {
        store[name] = {
            selected: ref([]),
            onItemClick(id, { shiftKey }) {
        
                const newSelectedItems = [...this.selected.value];
                //if items exist and shift isn't being pressed
                if (
                    !shiftKey &&
                    //if the item is not already selected
                    newSelectedItems.some((val) => {
                        return val !== id;
                    })
                ) {
                    //if the item is not already selected, add it to the selected items
                    newSelectedItems.splice(0, newSelectedItems.length, id);
                    this.selected.value = newSelectedItems;
        
                    return;
                }
        
                
                if (newSelectedItems.includes(id)) {
                    //if the item is already selected, remove it from the selected items
                    newSelectedItems.splice(
                        0,
                        newSelectedItems.length,
                        ...newSelectedItems.filter((item) => item !== id)
                    );
                } else {
                    //else add it to the selected items
                    newSelectedItems.push(id);
                }
        
                this.selected.value = newSelectedItems;
            },
            onParentClick() {
                this.selected.value = [];
            },
            isSelected(id){ return this.selected.value.includes(id);},
            isOnlySelected(id){ return this.selected.value.length === 1 && this.selected.value[0] === id;},
        }
    }

    //optionally build a selection box
    if(buildSelectionBox) {
        store[name].buildSelectionBox = buildSelectionBox(store[name]);
    }

    onBeforeUnmount(() => {
        delete store[name];
    });

    return store[name];
}
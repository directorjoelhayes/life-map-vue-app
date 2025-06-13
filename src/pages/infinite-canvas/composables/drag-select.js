
import { ref, onMounted, onUnmounted } from 'vue'

// by convention, composable function names start with "use"
export default function useDragSelect({
    container,
    drawBox,
    isColliding,
    getQuadrant,
    stateController,
    state,
    normalizeDrawBox,
    dashboard,
    zoomF,
    buildRelativeUnits,
    action,
    clearSelected
} = {}) {

    onMounted(() => {
        // state encapsulated and managed by the composable

    })

    const ctx = {}

    function dragSelectStart(event, ctx) {
        ctx.startSelected = state.selected.map((item) => item);

        if (drawBox.delete) clearTimeout(drawBox.delete);

        const relative = buildRelativeUnits(dashboard.value, zoomF.value);
        const start = relative({
            x: ctx.start.x,
            y: ctx.start.y
        })

        drawBox.x = start.x;
        drawBox.y = start.y;
        drawBox.current.x = start.x;
        drawBox.current.y = start.y;
        
    }

    function dragSelectMove(event, ctx) {
        drawBox.active = true;

        if(!event.shiftKey) {
            clearSelected();
            ctx.startSelected = [];
        }

        const relative = buildRelativeUnits(dashboard.value, zoomF.value);
        const current = relative({
            x: event.clientX,
            y: event.clientY
        });
        //update current mouse position relative to dashboard    
        drawBox.current.x = current.x;
        drawBox.current.y = current.y;

        const width = current.x - drawBox.x;
        const height = current.y - drawBox.y;
        drawBox.width = Math.abs(width);
        drawBox.height = Math.abs(height);
        drawBox.quadrant = getQuadrant(width, height);

        //Add and remove Selected
        const normalized = normalizeDrawBox(drawBox);
        for (let i = 0; i < state.blocks.length; i++) {
            if (isColliding(normalized, state.blocks[i])) {
                //Select box collision
                if (!state.selected.map(a => a.id).includes(state.blocks[i].id)) {
                    //add state.blocks unless if they were selected before
                    if (!ctx.startSelected.map(a => a.id).includes(state.blocks[i].id)) {
                        state.selected.push({ id: state.blocks[i].id });
                    }
                } else if (event.shiftKey) {
                    //remove state.blocks that were selected before
                    if (ctx.startSelected.map(a => a.id).includes(state.blocks[i].id)) {
                        //remove state.blocks
                        const index = state.selected.findIndex((item) => item === state.blocks[i].id);
                        state.selected.splice(index, 1);
                    }
                }
            } else {
                //Select box not colliding
                if (!event.shiftKey) {
                    //shift not pressed so remove blocks that were selected
                    if (state.selected.map(a => a.id).includes(state.blocks[i].id)) {
                        const index = state.selected.findIndex((item) => item === state.blocks[i].id);
                        state.selected.splice(index, 1);
                    }
                } else if (!ctx.startSelected.map(a => a.id).includes(state.blocks[i].id)) {

                    //Shift is pressed so remove state.blocks that weren't originally selected
                    if (state.selected.map(a => a.id).includes(state.blocks[i].id)) {
                        const index = state.selected.findIndex((item) => item === state.blocks[i].id);
                        state.selected.splice(index, 1);
                    }
                } else if (ctx.startSelected.map(a => a.id).includes(state.blocks[i].id) && !state.selected.map(a => a.id).includes(state.blocks[i].id)) {
                    //Shift is pressed so add blocks back in that were originally state.selected
                    state.selected.push({ id: blocks[i].id });
                }
            }
        }
    }

    function dragSelectEnd(event, ctx) {   
        drawBox.delete = setTimeout(() => {
            drawBox.active = false;
            drawBox.width = 0;
            drawBox.height = 0;

            if (
                checkShallowEquivalence(ctx.startSelected, state.selected)
            ) {
                //selected has changed, save new state
                for (let selection of state.selected) {
                    stateController.add({ "selected": selection })
                }
                clearSelected();
                stateController.execute({name: "Selection"});
            }

            function checkShallowEquivalence(a, b) {
                if (a.length === 0 && b.length === 0) return false;
                else return a.reduce((acc, item) => {
                    if (!b.includes(item)) acc = false;
                    if (a.length === 0) acc = false;
                    return acc;
                }, true)
            }

        }, 200);

    }

    function dragSelectAbort(event, ctx) {
        drawBox.active = false;
        drawBox.width = 0;
        drawBox.height = 0;
    }

    return {
        dragSelectStart,
        dragSelectMove,
        dragSelectEnd,
        dragSelectAbort
    };

}
<template>
    <div class="dashboard-container grid" ref="container" :class="tool">
        <div class="dashboard contents" ref="dashboard" v-on:dragover.prevent="handleDragOver($event)"
            v-on:drop.prevent="handleDrop($event)" v-on:dragleave.prevent=""
            v-on:dragenter.prevent="handleDragEnter($event)">
            <DynamicBackground :matrix="matrix" />
            <component v-for="(block, index) in state.blocks" :is="getComponent(block.type)"
                :key="block.id + stateController.lastUndoRedo.value" :id="block.id + stateController.lastUndoRedo.value"
                :block="block" :selected="state.selected" :zoom="zoomF" :dashboardEl="dashboard"></component>
            <DrawLine v-if="drawLine.show" :drawLine="drawLine" />
            <div class="draw-box" v-show="drawBox.active && tool === 'select'" :style="{
                left: drawBox.x + 'px',
                top: drawBox.y + 'px'
            }">
                <div class="box" :style="{
                    width: drawBox.width + 'px',
                    height: drawBox.height + 'px'
                }" :class="'quadrant-' + drawBox.quadrant">
                </div>
            </div>
        </div>
        <BlockSearchModal :open="searchModalOpen" :parent="dashboardBlock.id" database="node-blocks" />
        <!-- <CircleMenu :open="openMenu" :parent="dashboardBlock.id" /> -->
        <div class="bottom-drawer" v-show="false">
            <HistoryTimeline :history="stateController.changes" :stateIndex="stateController.stateIndex" />
            <!-- {{ blocksHistory.map((item) => item.id) }} -->
        </div>
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { makeBlock } from '../../core-simple/use-cases/index'
import DynamicBackground from './DynamicBackground.vue'
import usePointerEvent from "../../composables/pointer-events"
import useMouseWheel from "../../composables/mouse-wheel"
import useZoomPan from "../../composables/zoom-pan"
import useDragSelect from "../../composables/drag-select"
import useKeysPressed from '../../composables/keys-pressed.js'
import DashboardBlock from './DashboardBlock.vue'
import CanvasBlock from './CanvasBlock.vue'
import Connection from './Connection.vue'
import DrawLine from './DrawLine.vue'
import { useStore } from '../../stores';
import isColliding from '../../utils/is-colliding.js'
import getQuadrant from '../../utils/get-quadrant.js'
import deepClone from '../../utils/deep-clone.js'
import buildRelativeUnits from '../../utils/build-relative-units.js'
import CircleMenu from './CircleMenu.vue'
import { v4 as uuid } from 'uuid';
import HistoryTimeline from './HistoryTimeline.vue'
import BlockSearchModal from './BlockSearchModal.vue'
import { Iterator } from './../NodeComponents/index.js'
import { connect } from 'socket.io-client'
export default {
    name: "Dashboard",
    components: {
        DashboardBlock,
        CanvasBlock,
        DrawLine,
        Connection,
        HistoryTimeline,
        DynamicBackground,
        CircleMenu,
        BlockSearchModal
    },
    setup() {

        function handleDragEnter(e) {
            console.log(e);
            const dataTypes = e.dataTransfer.types;
            console.log(dataTypes);
            if (dataTypes.includes('text/uri-list')) {

            }
        }
        function handleDragOver(e) {
            // console.log(e);
        }
        function handleDrop(e) {
            e.preventDefault()
            const dataTypes = e.dataTransfer.types;

            if (dataTypes.includes('text/uri-list')) {
                e.preventDefault();
                const draggedUrl = e.dataTransfer.getData("text/uri-list");
                console.log(draggedUrl);

                if (draggedUrl.includes("youtube.com/watch?v=")) {
                    if (!draggedUrl.split("v=")[1]);
                    const videoId = draggedUrl.split("v=")[1];
                    console.log(videoId);

                }

            }
        }

        const dashboardBlock = makeBlock({});
        const container = ref(null);
        const dashboard = ref(null);
        const openMenu = ref(true);
        const searchModalOpen = ref(false);

        //DATA
        const state = reactive({
            blocks: [],
            selected: [],
            stateIndex: 0
        })

        //STATE CONTROLLER / HISTORY / UNDO-REDO
        const stateController = createStateController(state);
        const globalIndex = stateController.stateIndex;
        let active = ref(true);

        //ZOOM AND PAN
        const zoomPan = useZoomPan(container, dashboard);
        const zoomF = zoomPan.zoomFactor;
        const matrix = zoomPan.matrix;
        const mouseWheel = useMouseWheel(container);
        mouseWheel.onWheelEvent((e) => {
            zoomPan.onWheel(e);
        })

        const down = ref(false);
        const xStart = ref(0);
        const yStart = ref(0);

        //TOOL MODES
        const tool = ref("select");
        const action = reactive({ value: false });

        //SELECT BOX
        const drawBox = reactive({
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            quadrant: 2,
            active: false,
            delete: null,
            current: {
                x: 0,
                y: 0
            }
        })

        const pointerEvent = usePointerEvent(container)

        function clearSelected() {
            state.selected.splice(0, state.selected.length);
        }

        //drag select
        const dragSelect = useDragSelect({
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
        })

        pointerEvent
            .onEventStart((event, ctx) => {
                event.stopPropagation();

                //save start position
                ctx.start = {
                    x: event.clientX,
                    y: event.clientY
                }
                //select box
                if (tool.value === "select" && event.which != 3) {
                    //save the context of selected
                    dragSelect.dragSelectStart(event)
                } else if (tool.value === "pan") {
                    ctx.action = "pan"
                    zoomPan.onMouseDown(event);
                }

            })
            .onEventMove((event, ctx) => {
                event.preventDefault();

                //determine if drag event or click event
                ctx.isDrag = isDrag(event, ctx);

                //trigger events based on tool
                if (tool.value === "select" && (ctx.isDrag || action.value === "select")) {
                    dragSelect.dragSelectMove(event);
                } else if (tool.value === "pan") {
                    zoomPan.onMouseMove(event);
                }

                //see if mouse has moved above a threshold from the start, then trigger drag event
                function isDrag(e, ctx) {
                    if (
                        Math.abs(ctx.start.x - e.clientX) > 20 ||
                        Math.abs(ctx.start.y - e.clientY) > 20
                    )
                        return true;
                    else return false;
                }

            })
            .onEventEnd((event, ctx) => {
                console.log(event.which);
                if (event.which === 3 && ctx.isDrag === false) {
                    //toggle tool
                    if (tool.value === "pan") tool.value = "select";
                    else if (tool.value === "select") tool.value = "pan";
                } else if (tool.value === "select" && action.value === "select") {
                    dragSelect.dragSelectEnd(event);
                } else {
                    if (tool.value === "pan") {
                        zoomPan.onMouseUp(event);
                    }
                    //clear selected
                    if (event.shiftKey === false && event.which !== 3) {
                        if (state.selected.length) {
                            stateController.removeById({ "selected": [...state.selected] }).execute({ name: "Unselected" })
                        }
                    }
                }
                //reset state
                action.value = false;
                ctx.isDrag = false;
            })

        onMounted(() => {

            const grid = document.querySelector('.grid');
            const mouseup = (event) => {
                //change tool

            };

            const preventContextMenu = (e) => {
                e.preventDefault();
                return false;
            }

            function handleKeyPress(e) {
                console.log(e.keyCode);
                if (e.keyCode === 32) {
                    if (action.value === "select") return;
                    openMenu.value = true;

                    //figure out if there is a context


                }
                if (e.keyCode === 46) {
                    //delete
                    const connections = state.blocks.filter((blk) => {
                        if (blk.type === "connection") {
                            const selected = state.selected.map((blk) => blk.id)
                            if (
                                selected.includes(blk.to) ||
                                selected.includes(blk.from)
                            ) {
                                return true;
                            }
                        }
                    });

                    //update ouputs of blocks that were connected to deleted elements
                    if (state.selected.map((blk) => blk.type).includes("connection")) {
                        //
                        for (let blk of state.selected) {
                            if (blk.to) console.log(blk.to)//state controller splice;
                            if (blk.from) {
                                const connectedTo = state.blocks.find((block) => block.id === blk.from)
                                if(!connectedTo) continue;
                                const outputIndex = connectedTo.outputs.findIndex((output) => output.id === blk.to);
                                connectedTo.outputs.splice(index, 1);
                                //patch state to save
                            }
                        }
                    }


                    const selected = state.selected.map((item) => { return { id: item.id } });
                    stateController
                        .removeById({ "blocks": [...selected, ...connections] })
                        .removeById({ "selected": [...selected] })
                        .execute();

                } else if (e.keyCode === 90) {
                    if (e.ctrlKey && e.shiftKey) {
                        stateController.redo();
                    }
                    else if (e.ctrlKey) {
                        stateController.undo();
                    }
                } else if (e.keyCode === 70) {

                    if (state.selected.length === 1) {
                        const target = state.blocks.find((blk) => blk.id === state.selected[0].id);
                        zoomPan.frame(target);
                    } else if (state.selected.length > 0) {
                        const selected = state.selected.map((item) => {
                            const block = state.blocks.find((blk) => item.id === blk.id)
                            return {
                                x: block.x,
                                y: block.y,
                                width: block.width,
                                height: block.height
                            }
                        })

                        const smallestX = Math.min(...selected.map((block) => block.x));
                        const smallestY = Math.min(...selected.map((block) => block.y));
                        const largestX = Math.max(...selected.map((block) => block.x + block.width));
                        const largestY = Math.max(...selected.map((block) => block.y + block.height));

                        const target = {
                            x: smallestX,
                            y: smallestY,
                            width: largestX - smallestX,
                            height: largestY - smallestY
                        }
                        zoomPan.frame(target);
                    }

                    // zoomPan.center(target);

                }
            }

            function handleKeyRelease(e) {
                if (e.keyCode === 32) {
                    openMenu.value = false;
                }
            }

            window.addEventListener('keydown', handleKeyPress)
            grid.addEventListener('mouseup', mouseup);
            window.addEventListener('keyup', handleKeyRelease)
            grid.addEventListener('contextmenu', preventContextMenu);

        })

        //history

        function setValueDeep(name, changes, context) {
            const names = name.split(".");
            const levels = name.split(".").length;
            if (levels > 1) {
                let variable = context;
                for (let i = 0; i < levels; i++) {
                    if (i + 1 === levels) {
                        variable[names[i]] = changes;
                    } else {
                        variable = variable[names[i]];
                    }
                }

            } else {
                context[name] = changes;
            }
        }

        //util

        function getValueDeep(name, context) {
            const names = name.split(".");
            const levels = name.split(".").length;

            let values;

            if (levels > 1) {
                let variable = context;
                for (let i = 0; i < levels; i++) {
                    if (i + 1 === levels) {
                        values = variable[names[i]];
                    } else {
                        variable = variable[names[i]];
                    }
                }

            } else {
                values = variable[names[i]];
            }
            return values;
        }

        function createStateController(state) {
            const cloneState = deepClone(state);
            const changes = reactive([]);
            const stateIndex = reactive({ value: 0 });
            const lastUndoRedo = reactive({ value: Date.now() });

            let batch = [];


            function getState() {
                if (stateIndex.value) {
                    return changes.slice(0, stateIndex.value).reduce((acc, actions) => {
                        for (let action of actions.commands) {
                            action.run(acc);
                        }
                        return acc;
                    }, deepClone(cloneState))
                } else {
                    return deepClone(cloneState);
                }
            }
            function add(obj) {
                const actionId = uuid();

                const run = (acc) => {
                    for (let key in obj) {
                        // console.log(obj[key], obj, "sdfjlksdfjklsdflkjsdfjkl")
                        // if(acc[key].map((a) => a.id).includes(obj[key].id)) return;
                        acc[key].push(
                            { ...obj[key] }
                        );
                    }
                    return acc;
                }

                batch.push({
                    event: "add",
                    id: actionId,
                    data: obj,
                    run
                })

                return this;
            }
            function patch(patch) {
                const actionId = uuid();

                const run = (acc) => {
                    for (let key in patch) {
                        setValueDeep(key, patch[key], acc);
                    }
                    return acc;
                }

                batch.push({
                    event: "patch",
                    id: actionId,
                    data: patch,
                    run
                })

                return this;
            }
            function removeOne(data) {
                if (stateIndex.value < changes.length) {
                    changes.splice(stateIndex.value, changes.length - stateIndex.value);
                }
                for (let key in data) {
                    const index = state[key].findIndex((item) => item.id === id);
                    state[key].splice(index, 1);
                    const actionId = uuid();
                    changes.push({
                        event: "removeOne",
                        data: { id },
                        id: actionId,
                        run: (acc) => {
                            const index = acc[key].findIndex((item) => item.id === id);
                            acc[key].splice(index, 1);
                            return acc;
                        }
                    });
                }

                stateIndex.value++;
            }
            function removeById(data) {

                const actionId = uuid();

                const run = (acc) => {
                    for (let key in data) {
                        for (let i = 0; i < data[key].length; i++) {
                            const index = acc[key].findIndex((item) => item.id === data[key][i].id);
                            acc[key].splice(index, 1);
                        }
                        return acc;
                    }
                }

                batch.push({
                    event: "removeById",
                    id: actionId,
                    data: data,
                    run
                });
                return this;
            }
            function removeByIndex(data) {
                const actionId = uuid();

                const run = (acc) => {
                    for (let key in data) {
                        for (let i = 0; i < data[key].length; i++) {
                            const index = data[key][i];
                            acc[key].splice(index, 1);
                        }
                        return acc;
                    }
                }

                batch.push({
                    event: "removeByIndex",
                    id: actionId,
                    data: data,
                    run
                });
                return this;
            }
            function execute({ name = "Unknown" } = {}) {
                if (stateIndex.value < changes.length) {
                    changes.splice(stateIndex.value, changes.length - stateIndex.value);
                }

                for (let command of batch) {
                    //run mutations
                    command.run(state);
                }
                const actionId = uuid();
                this.changes.push({ "action": { name }, "id": actionId, "commands": [...batch] });

                batch = [];
                this.stateIndex.value++;
            }
            function reverse(mutation, historyState) {
                if (mutation.event === "add") {
                    const removeData = {};
                    for (let key in mutation.data) {
                        removeData[key] = [
                            mutation.data[key].id
                        ]
                    }
                    removeById(removeData);
                }

                if (mutation.event === "removeById") {
                    //this is kind of sketch, I'm patching by index, and index might change
                    //I'm ensuring the index is correct here, but the indexes might change when data is saved
                    for (let key in mutation.data) {
                        const arr = [];
                        arr.length = mutation.data[key].length;
                        for (let blk of mutation.data[key]) {
                            const addData = {};

                            const index = historyState[key].findIndex((item) => item.id === blk.id);

                            addData[key] = historyState[key][index];
                            console.log(addData, "add data");
                            arr[index] = () => add(addData);
                        }
                        for (let run of arr) {
                            if (typeof run === "function") run();
                        }
                    }
                }

                if (mutation.event === "patch") {

                    const patchData = {

                    }
                    for (let key in mutation.data) {
                        patchData[key] = getValueDeep(key, historyState);

                    }

                    patch(patchData);

                }
            }
            function undo() {
                if (stateIndex.value < 1) return;

                //reverse the actions
                stateIndex.value--;
                const mutations = this.changes[stateIndex.value].commands;
                for (let mutation of mutations) {
                    reverse(mutation, getState())
                }
                for (let command of batch) {
                    command.run(state);
                }
                batch = [];

                // Object.assign(state, getState());
                // lastUndoRedo.value = Date.now();
            }
            function redo() {
                if (stateIndex.value === changes.length) return;

                const mutations = this.changes[stateIndex.value].commands;
                //reapply the actions
                for (let mutation of mutations) {
                    this[mutation.event](mutation.data);
                }
                for (let command of batch) {
                    command.run(state);
                }
                batch = [];
                stateIndex.value++;

                // Object.assign(state, getState());
                // lastUndoRedo.value = Date.now();
            }
            const ctx = {
                changes,
                stateIndex,
                lastUndoRedo
            }

            ctx.add = add.bind(ctx);
            ctx.removeById = removeById.bind(ctx);
            ctx.removeByIndex = removeByIndex.bind(ctx);
            ctx.getState = getState.bind(ctx);
            ctx.removeOne = removeOne.bind(ctx);
            ctx.undo = undo.bind(ctx);
            ctx.redo = redo.bind(ctx);
            ctx.patch = patch.bind(ctx);
            ctx.execute = execute.bind(ctx);
            // ctx.multiple = multiple.bind(ctx);

            return ctx;
        }

        const { keysPressed } = useKeysPressed({ active, down });

        //Messaging Inputs

        const inputs = useStore(dashboardBlock.id)();
        const unsubscribeInputs = inputs.$onAction(
            ({
                name, // name of the action
                store, // store instance, same as `someStore`
                args, // array of parameters passed to the action
                after, // hook after the action returns or resolves
                onError, // hook if the action throws or rejects
            }) => {
                // a shared variable for this specific action call
                const startTime = Date.now()
                // this will trigger before an action on `store` is executed
                // console.log(args, "args");
                // console.log(`Parent received "${name}" from ${args[0].id}.`)

                const data = args[0];

                console.warn(data.event);

                if (!data.event) return;

                const event = data.event;



                switch (event) {
                    case 'input-drop':
                        handleInputDrop(data.data);
                        break;
                    case 'drag-start':
                        handleDragStart(data.data);
                        break;
                    case 'drag-move':
                        handleDragMove(data.data);
                        break;
                    case 'drag-end':
                        handleDragEnd(data.data);
                        break;
                    case 'resize-start':
                        handleResizeStart(data.data);
                        break;
                    case 'resize-move':
                        handleResizeMove(data.data);
                        break;
                    case 'resize-end':
                        handleResizeEnd(data.data);
                        break;
                    case 'output-drag-start':
                        handleOutputDragStart(data.data);
                        break;
                    case 'output-drag-move':
                        handleOutputDragMove(data.data);
                        break;
                    case 'output-drag-end':
                        handleOutputDragEnd(data.data);
                        break;
                    case 'click':
                        handleBlockClick(data.data);
                        break;
                    case 'patch':
                        handlePatch(data.data);
                        break;
                    case 'circle-menu-action':
                        handleCircleMenuAction(data.data)
                    case 'close-modal':
                        handleCloseModal(data.data)
                    default:
                        console.log(`Event not handled`);
                }

                // this will trigger if the action succeeds and after it has fully run.
                // it waits for any returned promised
                after((result) => {
                    console.log(
                        `Finished "${name}" after ${Date.now() - startTime
                        }ms.\nResult: ${result}.`
                    )
                })

                // this will trigger if the action throws or returns a promise that rejects
                onError((error) => {
                    console.warn(
                        `Failed "${name}" after ${Date.now() - startTime}ms.\nError: ${error}.`
                    )
                })
            }
        )

        function handleCloseModal(data) {
            const block = state.blocks.find((block) => block.id === state.selected[0].id);
            console.log(block, "block");
            searchModalOpen.value = false;
            if(block != -1) block.component = data.component;
        }

        function handleCircleMenuAction(data) {
            const block = state.blocks.find((blk) => blk.id === state.selected[0].id);
            block.color = data.color;
        }

        function handlePatch(data) {
            const blockIndex = state.blocks.findIndex((blk) => blk.id === data.id);
            for (let change in data.changes) {
                setValueDeep(`blocks.${blockIndex}.${change}`, data.changes[change], state);
            }
        }

        function handlePatchAndSave(data) {
            const patch = {
            };

            patch[`blocks.${blockMovement.index}.x`] = state.blocks[blockMovement.index].x;
            patch[`blocks.${blockMovement.index}.y`] = state.blocks[blockMovement.index].y;

            //add dragged block
            stateController.patch(patch);
        }

        function handleBlockClick(data) {

            const block = state.blocks.find((blk) => blk.id === data.id);
            const selected = state.selected.map((item) => item.id);



            //do nothing if block is already selected
            if (!data.e.shiftKey && selected.includes(block.id)) return;

            if (data.e.shiftKey) {
                //remove item if shift key is pressed and block is already state.selected
                if (selected.includes(block.id)) {
                    stateController.removeById({ "selected": [{ id: block.id }] })
                } else {
                    stateController.add({ "selected": { "id": data.id } })
                }

                stateController.execute();
            } else {
                zoomPan.center(block);
                //shift key not pressed
                if (!selected.includes(data.id)) {
                    //add selected
                    stateController.add({ "selected": { "id": data.id } })
                }
                const remove = [];
                state.selected.map((item) => {
                    if (item.id != block.id) remove.push({ id: item.id });
                })
                stateController.removeById({ "selected": remove })
                stateController.execute();
            }


        }

        //block move events

        const initialblockMovementState = {
            index: null,
            start: {
                x: null,
                y: null,
            },
            block: {
                x: null,
                y: null
            },
            blocks: []
        }
        let blockMovement = {
            ...deepClone(initialblockMovementState)
        }
        function handleDragStart({ e, id }) {
            console.error(id, "start");
            const relative = buildRelativeUnits(dashboard.value, zoomF.value);

            const current = relative({
                x: e.clientX,
                y: e.clientY
            })

            blockMovement.start.x = current.x;
            blockMovement.start.y = current.y;

            blockMovement.index = state.blocks.findIndex((block) => block.id === id);
            blockMovement.block.x = state.blocks[blockMovement.index].x;
            blockMovement.block.y = state.blocks[blockMovement.index].y;
            if (!state.selected.length) return;

            if (!state.selected.map((blk) => blk.id).includes(id)) {
                //clear selected
                clearSelected();
                return;
            }

            for (let i = 0; i < state.selected.length; i++) {
                if (state.selected[i].id === state.blocks[blockMovement.index].id) continue;
                const index = state.blocks.findIndex((item) => item.id === state.selected[i].id);

                blockMovement.blocks.push({
                    id: state.selected[i].id,
                    x: state.blocks[index].x,
                    y: state.blocks[index].y
                })
            }

        }
        function handleDragMove({ e, id }) {
            const relative = buildRelativeUnits(dashboard.value, zoomF.value);

            const current = relative({
                x: e.clientX,
                y: e.clientY
            })

            // state.blocks[blockMovement.index].element.classList.add("drag");

            state.blocks[blockMovement.index].x = blockMovement.block.x + (current.x - blockMovement.start.x);
            state.blocks[blockMovement.index].y = blockMovement.block.y + (current.y - blockMovement.start.y);

            if (!state.selected.length) return;
            for (let i = 0; i < state.selected.length; i++) {
                if (state.selected[i].id === state.blocks[blockMovement.index].id) continue;
                const index = state.blocks.findIndex((item) => item.id === state.selected[i].id);
                const startIndex = blockMovement.blocks.findIndex((item) => item.id === state.selected[i].id);
                state.blocks[index].x = blockMovement.blocks[startIndex].x + (current.x - blockMovement.start.x);
                state.blocks[index].y = blockMovement.blocks[startIndex].y + (current.y - blockMovement.start.y);
                // state.blocks[index].trigger("drag-move");
            }

        }
        function handleDragEnd({ e, id }) {
            // alert("end");

            //splice moved
            const relative = buildRelativeUnits(dashboard.value, zoomF.value);

            const current = relative({
                x: e.clientX,
                y: e.clientY
            })


            state.blocks[blockMovement.index].element.classList.remove("drag");

            const patch = {
            };

            patch[`blocks.${blockMovement.index}.x`] = state.blocks[blockMovement.index].x;
            patch[`blocks.${blockMovement.index}.y`] = state.blocks[blockMovement.index].y;

            //add dragged block
            stateController.patch(patch);

            for (let i = 0; i < state.selected.length; i++) {
                if (state.selected[i].id === state.blocks[blockMovement.index].id) continue;
                const index = state.blocks.findIndex((item) => item.id === state.selected[i].id);
                const startIndex = blockMovement.blocks.findIndex((item) => item.id === state.selected[i].id);
                const patch = {}

                console.warn(current.x);

                patch[`blocks.${index}.x`] = blockMovement.blocks[startIndex].x + (current.x - blockMovement.start.x);
                patch[`blocks.${index}.y`] = blockMovement.blocks[startIndex].y + (current.y - blockMovement.start.y);
                stateController.patch(patch);
            }

            stateController.execute();

            //reset blockMovement
            blockMovement = { ...deepClone(initialblockMovementState) };
        }

        // node connection lines

        const lineInitial = {
            show: false,
            xStart: 0,
            yStart: 0,
            xCurrent: 0,
            yCurrent: 0
        }
        const drawLine = reactive(
            {
                ...lineInitial
            }
        );

        //block connector events
        const initialState = {
            outputBlock: null,
            outputNode: null,
            inputBlock: null,
            inputNode: null
        }    
        const outputDragState = {
            ...initialState
        }


        function handleOutputDragStart(data) {
            const relative = buildRelativeUnits(dashboard.value, zoomF.value);
            if (!drawLine.show) drawLine.show = true;
            console.warn(data, "start");

            outputDragState.outputBlock = state.blocks.find((block) => data.id === block.id);
            outputDragState.outputNode = data.outputNode;

            const relativePoints = relative(data.start);
            drawLine.xStart = relativePoints.x;
            drawLine.yStart = relativePoints.y;
            drawLine.xCurrent = relativePoints.x;
            drawLine.yCurrent = relativePoints.y;
        }
        function handleOutputDragMove(data) {
            const relative = buildRelativeUnits(dashboard.value, zoomF.value);
            const current = relative(data.current);
            //output drawline logic
            drawLine.xCurrent = current.x;
            drawLine.yCurrent = current.y;
        }

        function handleInputDragOver(data) {

        }
        function handleInputDrop(data) {
            const relative = buildRelativeUnits(dashboard.value, zoomF.value);
            const inputBlock = state.blocks.find((block) => block.id === data.id);
            const outputBlock = outputDragState.outputBlock;
            //add output to a 
            outputBlock.outputs.push({ id: inputBlock.id, outputNode: outputDragState.outputNode, inputNode: data.inputNode });
            //add input to b
            inputBlock.inputs.push({ id: outputBlock.id, inputNode: data.inputNode, inputNode: data.inputNode });

            console.error(data.inputNode, inputBlock.mounted);

            //get output position from a
            const outputEl = relative(outputBlock.mounted[outputDragState.outputNode].getBoundingClientRect());
            //get input position from b
            const inputEl = relative(inputBlock.mounted[data.inputNode].getBoundingClientRect());

            const connection = {
                type: "connection",
                parent: dashboardBlock.id,
                id: uuid(),
                x1: outputEl.x + outputEl.width / 2,
                y1: outputEl.y + outputEl.height / 2,
                x2: inputEl.x + inputEl.width / 2,
                y2: inputEl.y + inputEl.height / 2,
                //change this to reference id, not actual blocks
                from: outputBlock.id,
                to: inputBlock.id,
                fromNode: outputDragState.outputNode,
                toNode: data.inputNode
            }

            stateController.add({ "blocks": connection }).execute("connection");

        }

        function handleOutputDragEnd(data) {
            //reset line
            Object.assign(drawLine, lineInitial);
            Object.assign(outputDragState, initialState);
            // const relative = buildRelativeUnits(dashboard.value, zoomF.value);
            // const current = relative(data.current);
            // for (let i = 0; i < state.blocks.length; i++) {
            //     // console.log(data);
            //     //check if 
            //     if (state.blocks[i].id === data.id) continue;
            //     if (isColliding(current, state.blocks[i])) {
            //         //output block index
            //         const aIndex = state.blocks.findIndex((b) => b.id === data.id)

            //         //add output to a 
            //         state.blocks[aIndex].outputs.push({ id: state.blocks[i].id });
            //         //add input to b
            //         state.blocks[i].inputs.push({ id: state.blocks[aIndex].id });

            //         //get output position from a
            //         const outputEl = relative(state.blocks[aIndex].outputEl.getBoundingClientRect());
            //         //get input position from b
            //         const inputEl = relative(state.blocks[i].inputEl.getBoundingClientRect());

            //         const connection = {
            //             type: "connection",
            //             parent: dashboardBlock.id,
            //             id: uuid(),
            //             x1: outputEl.x + outputEl.width / 2,
            //             y1: outputEl.y + outputEl.height / 2,
            //             x2: inputEl.x + inputEl.width / 2,
            //             y2: inputEl.y + inputEl.height / 2,
            //             //change this to reference id, not actual blocks
            //             from: state.blocks[aIndex].id,
            //             to: state.blocks[i].id
            //         }

            //         stateController.add({ "blocks": connection }).execute("connection");
            //         //end event
            //         state.blocks[i].active = false;
            //     } else {
            //         if (state.blocks[i].active) state.blocks[i].active = "";
            //     }
            // }
        }

        //block resize events
        const initialBlockResizeState = {
            width: null,
            height: null,
            x: null,
            y: null,
            min: {
                width: 100,
                height: 100
            }
        }
        const blockResizeState = {
            ...initialBlockResizeState
        }

        // add group scale?
        function handleResizeStart({ e, resizeType, id }) {
            const block = state.blocks.find((block) => block.id === id);
            blockResizeState.resizeType = resizeType;
            blockResizeState.width = block.width;
            blockResizeState.height = block.height;
            blockResizeState.x = block.x;
            blockResizeState.y = block.y;


        }
        function handleResizeMove({ e, id }) {
            console.log(e, "e");
            // e.current.x = e.current.x / zoomF.value;
            // e.current.y = e.current.y / zoomF.value;
            const { width, height } = blockResizeState;
            const block = state.blocks.find((block) => block.id === id);
            switch (blockResizeState.resizeType) {
                case 'se-resize':
                    block.width = Math.max(width + ((e.current.x - e.start.x) / zoomF.value), blockResizeState.min.width);
                    block.height = Math.max(height + ((e.current.y - e.start.y) / zoomF.value), blockResizeState.min.height);
                    break;
                case 'ne-resize':
                    block.width = Math.max(width + (e.current.x - e.start.x) / zoomF.value, blockResizeState.min.width);
                    block.height = Math.max(height + ((e.current.y - e.start.y) / zoomF.value * -1), blockResizeState.min.width);
                    block.y = blockResizeState.y - ((e.current.y - e.start.y) / zoomF.value * -1);
                    break;
                case 'sw-resize':
                    block.width = Math.max(width + ((e.current.x - e.start.x) / zoomF.value * -1), blockResizeState.min.width);
                    block.x = blockResizeState.x - ((e.current.x - e.start.x) / zoomF.value * -1);
                    block.height = Math.max(height + (e.current.y - e.start.y) / zoomF.value, blockResizeState.min.height);
                    break;
                case 'nw-resize':
                    block.width = Math.max(width + ((e.current.x - e.start.x) / zoomF.value * -1), blockResizeState.min.width);
                    block.x = blockResizeState.x - ((e.current.x - e.start.x) / zoomF.value * -1);
                    block.height = Math.max(height + ((e.current.y - e.start.y) / zoomF.value * -1), blockResizeState.min.width);
                    block.y = blockResizeState.y - ((e.current.y - e.start.y) / zoomF.value * -1);
                    break;
                case 'e-resize':
                    block.width = Math.max(width + (e.current.x - e.start.x) / zoomF.value, blockResizeState.min.width);
                    break;
                case 'w-resize':
                    block.width = Math.max(width + ((e.current.x - e.start.x) / zoomF.value * -1), blockResizeState.min.width);
                    block.x = blockResizeState.x - ((e.current.x - e.start.x) / zoomF.value * -1);
                    break;
                case 'n-resize':
                    block.height = Math.max(height + ((e.current.y - e.start.y) / zoomF.value * -1), blockResizeState.min.width);
                    block.y = blockResizeState.y - ((e.current.y - e.start.y) / zoomF.value * -1);
                    break;
                case 's-resize':
                    block.height = Math.max(height + (e.current.y - e.start.y) / zoomF.value, blockResizeState.min.height);
            }


        }
        function handleResizeEnd({ e, id }) {
            //snap to grid maybe?


            console.log("event!!!", e);
            const { width, height } = blockResizeState;
            const block = state.blocks.find((block) => block.id === id);

            switch (blockResizeState.resizeType) {
                case 'se-resize':
                    block.width = Math.max(width + ((e.current.x - e.start.x) / zoomF.value), blockResizeState.min.width);
                    block.height = Math.max(height + ((e.current.y - e.start.y) / zoomF.value), blockResizeState.min.height);
                    break;
                case 'ne-resize':
                    block.width = Math.max(width + (e.current.x - e.start.x) / zoomF.value, blockResizeState.min.width);
                    block.height = Math.max(height + ((e.current.y - e.start.y) / zoomF.value * -1), blockResizeState.min.width);
                    block.y = blockResizeState.y - ((e.current.y - e.start.y) / zoomF.value * -1);
                    break;
                case 'sw-resize':
                    block.width = Math.max(width + ((e.current.x - e.start.x) / zoomF.value * -1), blockResizeState.min.width);
                    block.x = blockResizeState.x - ((e.current.x - e.start.x) / zoomF.value * -1);
                    block.height = Math.max(height + (e.current.y - e.start.y) / zoomF.value, blockResizeState.min.height);
                    break;
                case 'nw-resize':
                    block.width = Math.max(width + ((e.current.x - e.start.x) / zoomF.value * -1), blockResizeState.min.width);
                    block.x = blockResizeState.x - ((e.current.x - e.start.x) / zoomF.value * -1);
                    block.height = Math.max(height + ((e.current.y - e.start.y) / zoomF.value * -1), blockResizeState.min.width);
                    block.y = blockResizeState.y - ((e.current.y - e.start.y) / zoomF.value * -1);
                    break;
                case 'e-resize':
                    block.width = Math.max(width + (e.current.x - e.start.x) / zoomF.value, blockResizeState.min.width);
                    break;
                case 'w-resize':
                    block.width = Math.max(width + ((e.current.x - e.start.x) / zoomF.value * -1), blockResizeState.min.width);
                    block.x = blockResizeState.x - ((e.current.x - e.start.x) / zoomF.value * -1);
                    break;
                case 'n-resize':
                    block.height = Math.max(height + ((e.current.y - e.start.y) / zoomF.value * -1), blockResizeState.min.width);
                    block.y = blockResizeState.y - ((e.current.y - e.start.y) / zoomF.value * -1);
                    break;
                case 's-resize':
                    block.height = Math.max(height + (e.current.y - e.start.y) / zoomF.value, blockResizeState.min.height);
            }
            const index = state.blocks.findIndex((block) => block.id === id);
            const patch = {}
            patch["blocks." + index + ".width"] = block.width;
            patch["blocks." + index + ".height"] = block.height;
            patch["blocks." + index + ".y"] = block.y;
            patch["blocks." + index + ".x"] = block.x;
            stateController.patch(patch).execute({ name: "Resized Block" });
        }

        //Quadrant based placement to absolute
        function normalizeDrawBox(drawBox) {
            const width = drawBox.width;
            const height = drawBox.height;
            const quadrant = drawBox.quadrant;
            let x = 0;
            let y = 0;
            if (quadrant === 1) {
                x = drawBox.x;
                y = drawBox.current.y;
            } else if (quadrant === 2) {
                x = drawBox.x;
                y = drawBox.y;
            } else if (quadrant === 3) {
                x = drawBox.current.x;
                y = drawBox.y;
            } else {
                x = drawBox.current.x;
                y = drawBox.current.y;
            }
            return { x, y, width, height }
        }

        watch(keysPressed, (keys) => {
            if (keys.map((key) => key.keyCode).includes(32)) {
                if (drawBox.active && state.selected.length === 0) {
                    console.warn("I ran");
                    //drawBox from quadrant based placement to absolute
                    const { x, y, width, height } = normalizeDrawBox(drawBox)

                    //xStart, yStart
                    const blockData = {
                        type: "block",
                        parent: dashboardBlock.id,
                        active: false,
                        width: Math.max(width, 200),
                        height: Math.max(height, 200),
                        x,
                        y,
                        inputs: [],
                        outputs: []
                    }

                    const block = makeBlock(blockData);

                    searchModalOpen.value = true;

                    drawBox.active = false;
                    if (drawBox.delete) clearTimeout(drawBox.delete);
                    console.log(block, "block");
                    stateController.add({ "selected": { "id": block.id } })
                    stateController.add({ "blocks": block }).execute({ "name": "Created Block" });

                }
            }
        })

        //dynamic components
        function getComponent(type) {
            if (type === "block") return CanvasBlock;
            else return Connection;
        }

        return {
            openMenu,
            getComponent,
            keysPressed,
            xStart, yStart,
            down,
            drawLine,
            drawBox,
            container,
            dashboard,
            state,
            dashboardBlock,
            DashboardBlock,
            zoomPan,
            tool,
            zoomF,
            history,
            globalIndex,
            stateController,
            matrix,
            handleDragEnter,
            handleDragOver,
            handleDrop,
            searchModalOpen
        }
    }
}
</script>

<style>
.drag {
    pointer-events: none;
}
</style>

<style scoped>
.dashboard-container {
    overflow: hidden;
}

.dashboard {
    position: relative;
    width: 100%;
    height: 100vh;
    touch-action: none;
    transform-origin: 0 0;
}

.draw-box {
    position: absolute;
    width: 0px;
    height: 0px;
    overflow: visible;
}

.dashboard-container.pan {
    cursor: crosshair;
}


.top-header {
    position: fixed;
    z-index: 1;
    top: 0px;
    left: 0px;
    width: 100%;
    padding: 20px;
    color: var(--accent-one);
}

.bottom-drawer {
    position: fixed;
    bottom: 0px;
    background-color: #7d828e14;
    backdrop-filter: blur(10px);
    width: 100%;
    padding: 50px 0px;
    overflow: visible;
}


.box {
    position: absolute;
    border-style: solid;
    border-color: rgb(98, 98, 211);
    background-color: rgba(163, 195, 230, 0.075);
}

.box.quadrant-1 {
    bottom: 0px;
    left: 0x;
}

.box.quadrant-2 {
    top: 0px;
    left: 0px;
}

.box.quadrant-3 {
    right: 0px;
    top: 0px;
}

.box.quadrant-4 {
    right: 0px;
    bottom: 0px;
}
</style>
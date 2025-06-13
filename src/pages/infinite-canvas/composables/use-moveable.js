

const store = {}

export default function buildMoveable(name, {
    zoomFactor,
    selected
}) {

    if (!store[name]) {
        store[name] = {
            emit: undefined,
            props: undefined,
        }
    }

    const ctx = store[name];

    const onDragStart = (e, event) => {
        console.log("drag start", e, event);
        event.start.position = {
            x: props.x,
            y: props.y,
        }
        e.target.setPointerCapture(e.pointerId);
    }

    const onDragMove = (e, event) => {
        const deltaX = (e.clientX - event.start.x) / zoomFactor.value;
        const deltaY = (e.clientY - event.start.y) / zoomFactor.value;
        const { x, y } = event.start.position;
        ctx.emit("update:dragMove", {
            x: x + deltaX,
            y: y + deltaY,
        });
    }

    const onDragEnd = (e, event) => {
        console.log("drag end", e, event);
        ctx.emit("update:dragEnd");
        if (e.pointerId !== undefined) {
            e.target.releasePointerCapture(e.pointerId);
        }
    }

    const handleDragStart = (e, event) => {
        if (selected.value.length === 1) {
            onDragStart(e, event);
        }
    }

    const handleDragMove = (e, event) => {
        if (selected.value.length === 1) {
            onDragMove(e, event);
        }
    }

    const handleDragEnd = (e, event) => {
        if (selected.value.length === 1) {
            onDragEnd(e, event);
        }
    }

    ctx.setCtx = ({ emit, props }) => {
        ctx.emit = emit;
        ctx.props = props;
    }

    removeCtx = () => {
        delete store[name];
    }

    return {
        ctx,
        handleDragStart,
        handleDragMove,
        handleDragEnd,
        onDragStart,
        onDragMove,
        onDragEnd,
        removeCtx
    }

}
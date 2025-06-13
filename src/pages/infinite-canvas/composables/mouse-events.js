import { ref, onMounted, onUnmounted } from 'vue'

// by convention, composable function names start with "use"
export default function useMouseEvent( el ) {
    // state encapsulated and managed by the composable
    let active = false;

    const ctx = {
        start: {
            x: 0,
            y: 0
        },
        current: {
            x: 0,
            y: 0
        },
        end: {
            x: 0,
            y: 0
        },
        eventStart: false,
        eventMove: false,
        eventEnd: false,
        
    }

    ctx.onMouseDown = (fn) => {
        ctx.eventStart = fn
        return ctx;
    };
    ctx.onMouseMove = (fn) => {
        ctx.eventMove = fn;
        return ctx;
    }
    ctx.onMouseUp = (fn) => {
        ctx.eventEnd = fn;
        return ctx;
    }

    // a composable can update its managed state over time.
    function handleMouseDown(event) {
        active = true;
        
        ctx.start.x = event.clientX;
        ctx.start.y = event.clientY;

        if(ctx.eventStart) {
            ctx.eventStart(event, ctx);
        }
    }

    function handleMouseMove(event) {
        if (!active) return;
        
        ctx.current.x = event.clientX;
        ctx.current.y = event.clientY;

        if(ctx.eventMove) {
            ctx.eventMove(event, ctx);
        }
    }

    function handleMouseEnd(event) {
        active = false;
        ctx.end.x = event.clientX;
        ctx.end.y = event.clientY;

        if(ctx.eventEnd) {
            ctx.eventEnd(event, ctx);
        }
        
    }


    // a composable can also hook into its owner component's
    // lifecycle to setup and teardown side effects.
    onMounted(() => {
        if (!el.value) return;
        el.value.addEventListener('mousedown', handleMouseDown)
        el.value.addEventListener('mousemove', handleMouseMove)
        el.value.addEventListener('mouseup', handleMouseEnd)
    })
    onUnmounted(() => {
        if(!el.value) return;
        el.value.removeEventListener('mousedown', handleMouseDown)
        el.value.removeEventListener('mousemove', handleMouseMove)
        el.value.removeEventListener('mouseup', handleMouseEnd)
    })

    // expose managed state as return value
    return ctx;
}
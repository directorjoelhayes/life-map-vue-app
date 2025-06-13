import { ref, onMounted, onUnmounted } from 'vue'

// by convention, composable function names start with "use"
export default function useMouseWheel( el ) {
    // state encapsulated and managed by the composable
    const ctx = {
    
    }

    ctx.onWheelEvent = (fn) => {
        ctx.wheelEvent = fn
        return ctx;
    };

    // a composable can update its managed state over time.

    function handleWheel(event) {
        // ctx.end.x = event.clientX;
        // ctx.end.y = event.clientY;

        if(ctx.wheelEvent) {
            ctx.wheelEvent(event, ctx);
        }
        
    }

    // a composable can also hook into its owner component's
    // lifecycle to setup and teardown side effects.
    onMounted(() => {
        if (!el.value) return;
        el.value.addEventListener('wheel', handleWheel)
    })
    onUnmounted(() => {
        if(!el.value) return;
        el.value.removeEventListener('wheel', handleWheel)
    })

    // expose managed state as return value
    return ctx;
}
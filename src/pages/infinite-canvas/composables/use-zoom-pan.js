import { ref, onMounted, reactive, onUnmounted, watch } from 'vue'
import * as TWEEN from '@tweenjs/tween.js'
// by convention, composable function names start with "use"
export default function buildZoomPan(container, containerContents, {
    minScale = 0.1,
    maxScale = 3.5,
    zoomSpeed = 1000,
    invertZoom = false,
    keysPressed
} = {}) {

    let gridSize = undefined;
    let grid = undefined;
    let contents = undefined;
    let tween;

    watch(keysPressed, (newVal) => {
        if (newVal.map((a) => a.key).includes(" ")) {
            container.value.style.cursor = "grab";
        } else {
            container.value.style.cursor = "default";
        }
    })


    const eventData = {
        current: {
            mouseX: 0,
            mouseY: 0
        },
        start: {
            translateX: 0,
            translateY: 0
        },
        isPanning: false
    }
    const translate = reactive({ scale: 1, x: 0, y: 0 });
    const matrix = ref(`matrix(${translate.scale},0,0,${translate.scale},${translate.x},${translate.y})`);
    const zoomFactor = ref(1);

    onMounted(() => {
        // state encapsulated and managed by the composable
        grid = container.value;
        gridSize = grid.getBoundingClientRect();
        contents = containerContents.value;

    })

    window.addEventListener("resize", (e) => {
        grid = container.value;
        gridSize = grid.getBoundingClientRect();
        contents = containerContents.value;
    })

    const down = (event) => {

        eventData.start = {
            translateX: translate.x,
            translateY: translate.y,
            mouseX: event.clientX,
            mouseY: event.clientY
        }
        eventData.isPanning = true;
    };

    const move = (event) => {     
        eventData.current.mouseX = event.clientX;
        eventData.current.mouseY = event.clientY;
        if (eventData.isPanning) {
            container.value.style.cursor = "grabbing";
            const diffX = event.clientX - eventData.start.mouseX;
            const diffY = event.clientY - eventData.start.mouseY;
            translate.x = eventData.start.translateX + diffX;
            translate.y = eventData.start.translateY + diffY;
            console.log(matrix);
            matrix.value = `matrix(${translate.scale},0,0,${translate.scale},${translate.x},${translate.y})`;
        }
        update();
    };

    const up = (event) => {
        console.log("up", event);
        eventData.isPanning = false;
        if (!keysPressed.map((a) => a.key).includes(" ")) {
            container.value.style.cursor = "default";
        } else {
            container.value.style.cursor = "grab";
        }
    };

    const zoom = (event) => {
        event.preventDefault();
        if (!keysPressed.map((a) => a.key).includes("Control")) {
            return;
        }
        let invert = invertZoom ? 1 : -1;

        // limit scaling 
        if (translate.scale + ((event.deltaY * invert) / zoomSpeed) > maxScale ||
            translate.scale + ((event.deltaY * invert) / zoomSpeed) < minScale
        ) {
            return;
        }

        const oldScale = translate.scale;
        translate.scale += ((event.deltaY * invert) / zoomSpeed);
        zoomFactor.value = translate.scale;

        const mouseX = event.clientX - gridSize.x;
        const mouseY = event.clientY - gridSize.y;

        // Calculations
        const contentMouseX = (mouseX - translate.x);
        const contentMouseY = (mouseY - translate.y);
        translate.x = mouseX - (contentMouseX * (translate.scale / oldScale));
        translate.y = mouseY - (contentMouseY * (translate.scale / oldScale));

        console.log("zoom", translate.scale);

        matrix.value = `matrix(${translate.scale},0,0,${translate.scale},${translate.x},${translate.y})`;

    };

    const scroll = (event) => {
        event.preventDefault();
        if (keysPressed.map((a) => a.key).includes("Control")) {
            return;
        }
        let invert = invertZoom ? 1 : -1;
        translate.y += (event.deltaY * invert);
        update();
    }

    const update = () => {
        matrix.value = `matrix(${translate.scale},0,0,${translate.scale},${translate.x},${translate.y})`;
    };

    const moveTo = (value) => {

        const from = {
            x: translate.x,
            y: translate.y,
            scale: translate.scale
        }
        const to = {
            x: value.x,
            y: value.y,
            scale: value.scale
        }

        tween = new TWEEN.Tween(from, false) // Create a new tween that modifies 'coords'.
            .to(to, 600) // Move to (300, 200) in 1 second.
            .easing(TWEEN.Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
            .onUpdate(() => {
                translate.x = from.x,
                    translate.y = from.y,
                    translate.scale = from.scale
            })
            .start() // Start the tween immediately.

        // Setup the animation loop.
        function animate(time) {
            tween.update(time)
            requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)

    }

    const frame = (target) => {

        //figure out the scale

        //percentage difference

        //C = D * (A/B)
        //D = C * (B/A)
        grid = container.value;
        gridSize = grid.getBoundingClientRect();

        const widthRatio = gridSize.width / translate.scale / target.width;
        const heightRatio = gridSize.height / translate.scale / target.height;

        const smallerRatio = Math.min(widthRatio, heightRatio,);


        const from = {
            x: translate.translateX,
            y: translate.translateY,
            z: translate.scale
        }
        const to = {
            x: (gridSize.width / 2) - ((target.x + target.width / 2) * Math.min(translate.scale * smallerRatio, 1.5)),
            y: (gridSize.height / 2) - ((target.y + target.height / 2) * Math.min(translate.scale * smallerRatio, 1.5)),
            z: Math.min(translate.scale * smallerRatio, 1.5)
        }

        zoomFactor.value = Math.min(translate.scale * smallerRatio, 1.4);
        translate.scale = Math.min(translate.scale * smallerRatio, 1.4);

        translate.translateX = to.x;
        translate.translateY = to.y;
        matrix.value = `matrix(${zoomFactor.value},0,0,${zoomFactor.value},${to.x},${to.y})`;

        const tween = new TWEEN.Tween(from, false) // Create a new tween that modifies 'coords'.
            .to(to, 600) // Move to (300, 200) in 1 second.
            .easing(TWEEN.Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
            .onUpdate(() => {
                // Called after tween.js updates 'coords'.
                // Move 'box' to the position described by 'coords' with a CSS translation.
                // box.style.setProperty('transform', 'transleate(' + coords.x + 'px, ' + coords.y + 'px)')
                zoomFactor.value = from.z;
                translate.scale = from.z;
                translate.translateX = from.x;
                translate.translateY = from.y;

                contents.style.transform = `matrix(${from.z},0,0,${from.z},${from.x},${from.y})`;
            })
            .start() // Start the tween immediately.

        // Setup the animation loop.
        function animate(time) {
            tween.update(time)
            requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
    }

    const center = (target) => {
        grid = container.value;
        gridSize = grid.getBoundingClientRect();

        const from = {
            x: translate.translateX,
            y: translate.translateY,
            z: translate.scale
        }
        const to = {
            x: (gridSize.width / 2) - ((target.x + target.width / 2) * translate.scale),
            y: (gridSize.height / 2) - ((target.y + target.height / 2) * translate.scale),
            z: translate.scale
        }

        // zoomFactor.value = value.scale;
        // translate.scale = value.scale;

        translate.translateX = to.x;
        translate.translateY = to.y;
        matrix.value = `matrix(${zoomFactor.value},0,0,${zoomFactor.value},${to.x},${to.y})`;

        const tween = new TWEEN.Tween(from, false) // Create a new tween that modifies 'coords'.
            .to(to, 600) // Move to (300, 200) in 1 second.
            .easing(TWEEN.Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
            .onUpdate(() => {
                contents.style.transform = `matrix(${from.z},0,0,${from.z},${from.x},${from.y})`;
            })
            .start() // Start the tween immediately.

        // Setup the animation loop.
        function animate(time) {
            tween.update(time)
            requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)

    }
    const saveNavigation = async (saveFn) => {
        try {
            await saveFn(translate)
        } catch (err) {
            console.log(err)
        }
    }
    const setNavigation = ({ scale, x, y }) => {
        translate.x = x;
        translate.y = y;
        translate.scale = scale;
        zoomFactor.value = scale;
        update()
    }



    const ctx = {
        matrix,
        translate,
        zoom,
        scroll,
        down,
        up,
        move,
        moveTo,
        center,
        frame,
        setNavigation,
        saveNavigation,
        zoomFactor,
    }

    ctx.panEventRegistry = {
        data: {
            title: "pan",
            triggerEvent: "pointerdown",
            conditions: [
                "eventScope.tool === 'pan'",
                "&&",
                "eventScope.button === 0",
                "||",
                "eventScope.keysDown.map((a) => a.code).includes('Space')"
            ],
        },
        events(e) {

            down(e)

            return {
                "pointermove": (e) => {
                    move(e);
                },
                "pointerup": (e) => {
                    up(e);
                }
            }
        }
    }



    ctx.zoomEventRegistry = () => {
        return {
            data: {
                title: "zoom",
                triggerEvent: "wheel",
                conditions: [
                    "true"
                ],
            },
            events(e) {
                zoom(e)
            }
        }
    }


    return ctx;

}
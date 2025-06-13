<template>
    <canvas ref="patternCanvas" style="opacity: 0;"></canvas>
    <canvas ref="canvas"></canvas>
</template>

<script>

import { computed, watch, onMounted, ref, nextTick } from "vue"
import getQuadrant from "../../utils/get-quadrant"
// import { createCanvas } from 'vb-canvas';

// https://www.jgibson.id.au/blog/responsive-canvas/

export default {
    name: "DynamicBackground",
    props: ["translate", "container"],
    setup(props) {
        watch(props.translate, (value) => {
            nextTick(() => {
                const ctx = canvas.value.getContext("2d");
                if (value.scale <= .25) {
                    drawPattern(ctx, 200, 10);
                } else {
                    drawPattern(ctx);
                }
            })


        })
        const canvas = ref(null);
        const patternCanvas = ref(null);
        function drawPattern(ctx, cell = 40, stroke = 2) {
            const translate = props.translate;

            ctx.setTransform(1, 0, 0, 1, 0, 0);

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

            ctx.setTransform(translate.scale, 0, 0, translate.scale, translate.x, translate.y);
            const patternWidth = cell;  // Width of the pattern tile
            const patternHeight = cell; // Height of the pattern tile

            // Create a pattern using an off-screen canvas

            // Draw your pattern on the off-screen canvas
            ctx.fillStyle = 'gray'; // Fill color of the circles (replace with your desired color)

            // for (let x = 0; x < canvas.value.width + Math.abs(translate.x % patternWidth); x += patternWidth) {
            //     for (let y = 0; y < canvas.value.height + Math.abs(translate.y % patternWidth); y += patternWidth) {
            //         ctx.beginPath();
            //         ctx.arc(x + ( translate.x % patternWidth ), y + (translate.y % patternWidth), circleRadius, 0, Math.PI * 2);
            //         ctx.fill();
            //     }
            // }

            patternCanvas.value.width = patternWidth;
            patternCanvas.value.height = patternHeight;
            const patternCtx = patternCanvas.value.getContext('2d');

            const dotPattern = () => {
                const circleRadius = 1;
                // Draw your pattern on the off-screen canvas
                patternCtx.fillStyle = 'gray'; // Fill color of the circles (replace with your desired color)
                patternCtx.beginPath();
                // patternCtx.arc(0, 0, circleRadius, 0, Math.PI * 2);
                patternCtx.moveTo(0, 0);
                patternCtx.arc(0, 0, circleRadius, 0, Math.PI * 2);
                patternCtx.moveTo(cell, 0);
                patternCtx.arc(cell, 0, circleRadius, 0, Math.PI * 2);
                patternCtx.moveTo(cell, cell);
                patternCtx.arc(cell, cell, circleRadius, 0, Math.PI * 2);
                patternCtx.moveTo(0, cell);
                patternCtx.arc(0, cell, circleRadius, 0, Math.PI * 2);
                patternCtx.fill();
            }

            dotPattern();
            
            const gridPattern = () => {
                const strk = 0;
                patternCtx.strokeStyle = "#2c3240"
                patternCtx.lineWidth = stroke;
                patternCtx.moveTo(strk, strk);
                patternCtx.lineTo(cell - strk, 0 + strk);
                patternCtx.lineTo(cell - strk, cell - strk);
                patternCtx.lineTo(strk, cell - strk);
                patternCtx.lineTo(strk, strk);
                patternCtx.stroke();
            }
            // gridPattern();



            // You can draw any pattern you like here
            // Create a pattern using the off-screen canvas
            const pattern = ctx.createPattern(patternCanvas.value, 'repeat');
            // Use the pattern to fill the canvas
            ctx.fillStyle = pattern;

            // console.log(

            //     "maths"
            // )

            const nCols = Math.ceil(((canvas.value.width + Math.abs(translate.x)) / translate.scale) / canvas.value.width);
            const nRows = Math.ceil(((canvas.value.height + Math.abs(translate.y)) / translate.scale) / canvas.value.height)
            const fractionCols = ((canvas.value.width + Math.abs(translate.x)) * translate.scale) / canvas.value.width;
            // console.log(nCols, "maths");

            const startX = -Math.ceil((translate.x / translate.scale) / canvas.value.width);
            const startY = -Math.ceil((translate.y / translate.scale) / canvas.value.height);
            console.log(startX, startY, nCols, nRows, fractionCols, "maths");



            // for (let x = 0; x < nCols; x++) {
            //     for (let y = 0; y < nRows; y++) {
            //         ctx.fillRect(
            //             (x + startX) * canvas.value.width,
            //             (y + startY) * canvas.value.height,
            //             canvas.value.width,
            //             canvas.value.height
            //         );
            //     }
            // }

            // console.log("less than",canvas.value.width / translate.scale,"maths")

            let number = 0;

            console.log(-1 * (translate.x / translate.scale), "number");

            // ctx.fillRect(
            //     0,
            //     0,
            //     canvas.value.width,
            //     canvas.value.height
            // );


            for (let x = startX * canvas.value.width; x <= canvas.value.width / translate.scale + (-1 * (translate.x / translate.scale)); x += canvas.value.width) {

                for (let y = startY * canvas.value.height; y <= canvas.value.height / translate.scale + (-1 * (translate.y / translate.scale)); y += canvas.value.height) {
                    number++;
                    console.log(number, "number");

                    ctx.fillRect(
                        x,
                        y,
                        canvas.value.width,
                        canvas.value.height
                    );
                }
            }

            // for (let x = 0; x < 1; x += 1) {
            //     for (let y = 0; y < 1; y += 1) {
            //         ctx.fillRect(
            //             startX * canvas.value.width,
            //             startY * canvas.value.width,
            //             canvas.value.width,
            //             canvas.value.height
            //         );
            //     }
            // }






        }
        onMounted(() => {
            console.log(props);
            if (!props.container) return;

            const container = props.container.getBoundingClientRect()

            const canvasWidth = container.width;
            const canvasHeight = container.height;

            if (!canvas?.value) return;

            canvas.value.width = canvasWidth;
            canvas.value.height = canvasHeight;

            const ctx = canvas.value.getContext("2d");

            drawPattern(ctx);

            window.addEventListener("resize", () => {
                console.log("resize");
                nextTick(() => {
                    const container = props.container.getBoundingClientRect()
                    const canvasWidth = container.width;
                    const canvasHeight = container.height;
                    canvas.value.width = canvasWidth;
                    canvas.value.height = canvasHeight;
                    const ctx = canvas.value.getContext("2d");
                    drawPattern(ctx);
                })
            })

        })

        return {
            canvas,
            patternCanvas
        }
    }
}

</script>

<style scoped>
canvas {
    position: absolute;
    left: 0px;
}

canvas {
    position: absolute;

}

.background-container {
    position: absolute;
    width: 20000px;
    height: 20000px;
    left: calc(50% - 75px);
    top: calc(50% + 31px);
    transform: translate(-50%, -50%);
    pointer-events: none;
    background: var(--bg-color);
    background-image: radial-gradient(var(--point-color) 1px, transparent 0);
    background-size: 40px 40px;
    background-position: -19px -19px
}

.background-container canvas {
    width: 100%;
}
</style>

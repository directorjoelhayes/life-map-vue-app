export default function buildPointerEvents({
    stopPropagation = false,
    onPointerDown = () => {},
    onDragStart = () => {},
    onDragMove = () => {},
    onDragEnd = () => {},
    onClick = () => {}
 } = {}) {
    return {
        event: null,
        down(e) {
            if(stopPropagation) {
                e.stopPropagation();
            }
            onPointerDown(e, this.event);
            this.event = {
                isDragging: false,
                start: {
                    x: e.clientX,
                    y: e.clientY
                }
            }
        },
        move(e) {
            if(!this.event) return;
            if(stopPropagation) {
                e.stopPropagation();
            }
            this.event.current = {
                x: e.clientX,
                y: e.clientY
            }
            const start = this.event.start;
            const current = this.event.current;
            const diffX = current.x - start.x;
            const diffY = current.y - start.y;
            if(Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
                if(!this.event.isDragging) {
                    onDragStart(e, this.event)
                }
                onDragMove(e, this.event)
                this.event.isDragging = true;
            }
        },
        up(e) {
            if(stopPropagation) {
                e.stopPropagation();
            }
            if(this.event.isDragging) {
                onDragEnd(e, {...this.event})
            } else {
                onClick(e, {...this.event})
            }
            this.event = null;
        }
    }
}
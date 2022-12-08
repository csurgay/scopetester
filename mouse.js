function mouseInit(canvas) {
    canvas.addEventListener('wheel', function(event) {
        mouseWheel(event);
        event.preventDefault();
    }, false);
}

function mouseWheel(event) {
    for (var i=ui.length-1; i>=0; i--) {
        if (ui[i].hit(event)) {
            ui[i].turn(event);
            break;
        }
    }
    initChannels();
    draw();
}
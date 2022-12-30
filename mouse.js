function mouseInit(canvas) {
    canvas.addEventListener('wheel', function(event) {
        mouseWheel(event);
    }, false);
    canvas.addEventListener('click', function(event) {
        mouseClick(event);
    }, false);
}

function mouseWheel(event) {
    for (var i=ui.length-1; i>=0; i--) {
        if (ui[i].hit(event)) {
            event.preventDefault();
            ui[i].turn(event);
            break;
        }
    }
    initChannels();
    draw();
}

function mouseClick(event) {
    for (var i=ui.length-1; i>=0; i--) {
        if (ui[i].hit(event)) {
            ui[i].click(event);
            break;
        }
    }
    initChannels();
    draw();
}
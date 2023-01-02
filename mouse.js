function mouseInit(canvas) {
    canvas.addEventListener('wheel', function(event) {
        mouseWheel(event);
    }, false);
    // canvas.addEventListener('click', function(event) {
    //     mouseClick(event);
    // }, false);
    canvas.addEventListener('pointerdown', function(event) {
        touchStart(event);
    }, false);
    canvas.addEventListener('pointermove', function(event) {
        touchMove(event);
    }, false);
    canvas.addEventListener('pointerup', function(event) {
        touchEnd(event);
    }, false);
}

function mouseWheel(event) {
    if (!drawing) {
        for (var i=ui.length-1; i>=0; i--) {
            if (ui[i].hit(event)) {
                event.preventDefault();
                ui[i].turn(event,-Math.sign(event.deltaY));
                break;
            }
        }
        initChannels();
        draw(ctx);
    }
}

function mouseClick(event) {
    if (!drawing) {
        for (var i=ui.length-1; i>=0; i--) {
            if (ui[i].hit(event)) {
                ui[i].click(event);
                break;
            }
        }
        initChannels();
        draw(ctx);
    }
}

var touchedObj=null;
var touchedX, touchedY;

function touchStart(event) {
    touchedObj=null;
    if (!drawing) {
        for (var i=ui.length-1; i>=0; i--) {
            if (ui[i].hit(event)) {
                touchedObj=ui[i];
                touchedX=event.clientX;
                touchedY=event.clientY;
                break;
            }
        }
    }
}
function touchMove(event) {
    if (touchedObj!=null) {
        event.preventDefault();
        if (!drawing) {
            touchedObj.turn(event,touchedY-event.clientY);
            touchedY=event.clientY;
            initChannels();
            draw(ctx);
        }
    }
}
function touchEnd(event) {
    while (drawing);
    if (touchedX==event.clientX && touchedY==event.clientY) {
        touchedObj.click(event);
        initChannels();
        draw(ctx);
    }
    touchedObj=null;
}

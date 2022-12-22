class Button extends pObject {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(pX,pY,pW,pH);
        this.state=0;
        this.type=pType;
        ui.push(this);
        this.label=new Label(pX,pY,pLabel,15);
        this.setLabelXY(pType);
    }
    setLabelXY(pType) {
        var xpos={"power":0,"on":-40, "small":0};
        var ypos={"power":-10,"on":12,"small":-7};
        this.label.x=this.x+this.w/2+xpos[pType];
        this.label.y=this.y+ypos[pType];
    }
    click(event) {
        super.click();
        this.state=1-this.state;
    }
    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        var grd = ctx.createRadialGradient(this.x+this.w/2,this.y+this.h/2,
            2*this.w/5, this.x+this.w/2,this.y+this.h/2,
            2*this.w/3);
        grd.addColorStop(0, "rgb(10,30,30)");
        grd.addColorStop(1, bgcolor);
        ctx.fillStyle = grd;
        if (this.type=="power") 
            ctx.fillRect(this.x-dVfd,this.y-dVfd/2,this.w+2*dVfd,this.h+dVfd);
        else if (this.type=="on-nem") 
            ctx.fillRect(this.x-dVfd,this.y-dVfd/4,this.w+2*dVfd,this.h+dVfd/2);
        ctx.fill();
        var img=led_off; if (this.state==1) img=led_on;
        ctx.drawImage(img,0,0,225,216,this.x,this.y,this.w,this.h);
    }
}
class PowerButton extends Button {
    click(event) {
        if (this.state==0)
            b_dual.state=1;
        if (this.state==1) {
            for (var c=0; c<2; c++) {
                siggen[c].b_ch.state=0;
                siggen[c].b_inv.state=0;
            }
            for (var i=0; i<radio_mode.b.length; i++) {
                radio_mode.b[i].state=0;
            }
            b_find.state=0;
            k_monitor.callSwitchOff(event);
            b_mic.callSwitchOff(event);
            b_debug.callSwitchOff(event);
        }
        super.click(event);
    }
}
class ChOnButton extends Button {
    click(event) {
        if (b_power.state==1) super.click(event);
    }
}
class FindButton extends ChOnButton {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(pX,pY,pW,pH,pLabel,pType);
        findState="off";
    }
    click(event) {
        super.click(event);
        if (this.state==1) { findState="search"; findValue=1.0; setTimeout(setFind,10); }
        else if (this.state==0) findState="off";
        // findState: "search"/"found"/"off", y/findValue displayed
    }
}
function setFind() {
    if (findState=="search") {
        findValue*=1.2;
        scope.draw(ctx);
        setTimeout(setFind,10);
    }
}
class MicButton extends ChOnButton {
    click(event) {
        super.click(event);
        if (this.state==1) {
            recordAudio();
            setTimeout(function(){b_mic.callSwitchOff(event);},10000);
        }
        else if (this.state==0) this.switchOff();
    }
    callSwitchOff(event) {
        if (this.state==1) {
            super.click(event);
            this.switchOff();
            initChannels();
            draw();
        }
    }
    switchOff() {
        stopRecording();
    }
}
class DebugButton extends ChOnButton {
    click(event) {
        super.click(event);
        if (this.state==1) {
        }
        else if (this.state==0) this.switchOff();
    }
    callSwitchOff(event) {
        if (this.state==1) {
            super.click(event);
            this.switchOff();
            draw();
        }
    }
    switchOff() {
    }
}
class Radio extends pObject {
    constructor(pX,pY,pListButtons) {
        super(pX,pY,25,pListButtons.length*dButton);
        this.b=pListButtons;
        for (var i=0; i<pListButtons.length; i++) {
            pListButtons[i].y=pY+i*dButton;
            pListButtons[i].setLabelXY(pListButtons[i].type);
        }
        ui.push(this);
    }
    click(event) {
        for (var i=0; i<this.b.length; i++) {
            if (this.b[i].hit(event)) if (this.b[i].state==0) {
                for (var j=0; j<this.b.length; j++)
                    this.b[j].state=0;
                this.b[i].click(event);
            }
        }
    }
}

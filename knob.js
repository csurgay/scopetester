class Knob extends pObject {
    constructor(pLimit,pX,pY,pR,pTicks,pValue,pLabel,lpos) {
        const pos={"knob":-27,"double":-44,"sweep":78, 
            "delay":78, "func":-57, "range":-55, "volts":-55};
        var ret=super(pX-pR,pY-pR,2*pR,2*pR);
        this.limit=pLimit; // ticks/2: végállásos, -1: körbeforog
        this.r=pR;
        this.ticks=pTicks;
        this.defaultValue=pValue;
        this.value=pValue;
        this.l=pLabel;
        this.color="#EEEEEE";
        this.haircolor="gray";
        this.pointercolor="red";
        new Label(pX,pY+pos[lpos],pLabel,12);
        ui.push(this);
        return ret;
    }
    click(event) {
        this.value=this.defaultValue;
        super.click();
    }
    turn(event) {
        var pDelta=event.deltaY;
        if (this.limit!=-1) {
            if (this.value==this.limit && pDelta>0) return;
            if (this.value==this.limit+1 && pDelta<0) return;
        }
        this.value+=Math.sign(pDelta);
        if (this.value<0) this.value+=this.ticks;
        else if (this.value>this.ticks-1) this.value-=this.ticks;
        super.turn();
    }
    draw(ctx) {
        var x=this.x+this.r, y=this.y+this.r, r=this.r, n=this.ticks, k=this.value;
        ctx.beginPath();
        ctx.strokeStyle=this.haircolor;
        ctx.lineTo(x+r,y);
        ctx.fillStyle = this.color;
        ctx.arc(x,y,r,0,2*Math.PI);
        ctx.fill();
        for(var i=0; i<n; i++) {
            ctx.moveTo(x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n));
            ctx.lineTo(x+2*r/3*Math.sin(2*Math.PI*i/n),y-2*r/3*Math.cos(2*Math.PI*i/n));
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth=2;
        ctx.strokeStyle=this.pointercolor;
        ctx.moveTo(x+r*Math.sin(2*Math.PI*k/n),y-r*Math.cos(2*Math.PI*k/n));
        ctx.lineTo(x+3*r/5*Math.sin(2*Math.PI*k/n),y-3*r/5*Math.cos(2*Math.PI*k/n));
        ctx.stroke();
        ctx.lineWidth=1;
        super.draw(ctx);
    }
}

class DoubleKnob extends pObject {
    constructor(pX,pY,pTicks,pTicks_,pLabel,lpos,pR,pR_) {
        var ret=super(pX-pR,pY-pR,2*pR,2*pR);
        this.k=new Knob(-1,pX,pY,pR,pTicks,0,pLabel,lpos);
        this.k_=new Knob(-1,pX,pY,pR_,pTicks_,0,"",0);
        this.k_.hitPad=2; // so that hit rect is smaller for inner knob
        return ret;
    }
    setSwitchBufferNeeded() {
        super.setSwitchBufferNeeded();
        this.k.setSwitchBufferNeeded();
        this.k_.setSwitchBufferNeeded();
    }
    turn(event) {
        if (this.k_.hit(event)) this.k_.turn(event);
        else if (this.k.hit(event)) this.k.turn(event);
        super.turn();
    }
}

class DekorKnob extends DoubleKnob {
    constructor(pX,pY,vals,vals_,pLabel,posLabel,r,r_,rDekor) {
        var ret=super(pX,pY,vals.length,vals_.length,pLabel,posLabel,r,r_);
        this.rDekor=rDekor;
        this.k_.color="rgb(200,20,20)";
        this.k_.haircolor=this.k_.color;
        this.k_.pointercolor="#EEEEEE";
        this.iconCircle(ui,pX,pY+2,this.rDekor,vals);
        this.captionCircle(ui,pX,pY+3,this.rDekor);
        return ret;
    }
    iconCircle(ui,x,y,r,tb) {
    }
    captionCircle(ui,x,y,r) {
    }
}

class TimeDekorKnob extends DekorKnob {
    constructor(pX,pY,pLabel,pPosType,pR,pR_,rDekor) {
        var ret=super(pX,pY,tb,tb_,pLabel,pPosType,pR,pR_,rDekor);
        new UiTimeDekor(pX,pY,this.rDekor);
        return ret;
    }
    iconCircle(ui,x,y,r,tb) {
        var n=tb.length;
        for (var i=0; i<n; i++) {
            var kt=i; if (kt>this.k.ticks/2) kt-=this.k.ticks;
            var sv=tb[kt+8]; var su="ms"; // value and unit
            if (sv>=100) { sv/=1000; su="s"; }
            else if (sv<=0.05) { sv*=1000; su="us"; }
            var sl=""+sv; sl=sl.replace("0.",".");
            new Label(x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n),sl,12);
        }
    }
    captionCircle(ui,x,y,r) {
        new Label(x-r-4,y-r+12,"ms",12);
        new Label(x+r+1,y+r-7,"us",12);
        new Label(x-r-1,y+r-7,"sec",12);
    }
}

class TimeKnob extends TimeDekorKnob {
    constructor(pX,pY) {
        var ret=super(pX,pY,"Sweep Timebase","sweep",50,25,62);
        return ret;
    }
}

class DelaybaseKnob extends TimeDekorKnob {
    constructor(pX,pY) {
        var ret=super(pX,pY,"Delay Timebase","delay",40,20,52);
        return ret;
    }
}

class VoltsKnob extends DekorKnob {
    constructor(pX,pY) {
        var ret=super(pX,pY,vpd,vpd_,"Volts/Div","volts",30,15,40);
        this.k.limit=9;
        new UiVoltDekor(pX,pY,this.rDekor);
        return ret;
    }
    iconCircle(ui,x,y,r,vpd) {
        var n=vpd.length;
        for (var i=0; i<n; i++) {
            var kt=i; if (kt>this.k.ticks/2) kt-=this.k.ticks;
            var sv=vpd[kt+Math.round(this.k.ticks/2)-1]; 
            var su="V"; // value and unit
            if (sv>=100) { sv/=1000; su="kV"; }
            else if (sv<=0.05) { sv*=1000; su="mV"; }
            var sl=""+sv; sl=sl.replace("0.",".");
            new Label(x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n),sl);
        }
    }
    captionCircle(ui,x,y,r) {
        new Label(x,y+r+16,"mV",12);
    }
}

class UiTimeDekor extends pObject {
    constructor(pX,pY,pR) {
        var ret=super(pX,pY,0,0);
        this.r=pR;
        ui.push(this);
        return ret;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.lineWidth=16;
        ctx.strokeStyle=hl_green;
        ctx.arc(this.x,this.y,this.r,Math.PI*61/69,Math.PI*130/69);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle=hl_gray;
        ctx.arc(this.x,this.y,this.r,Math.PI*131/69,Math.PI*37/69);
        ctx.stroke();
        ctx.lineWidth=1;
    }
}

class UiVoltDekor extends pObject {
    constructor(pX,pY,pR) {
        var ret=super(pX,pY,0,0);
        this.r=pR;
        ui.push(this);
        return ret;
    }
    draw(ctx) {
        super.draw(ctx);
        ctx.beginPath();
        ctx.lineWidth=16;
        ctx.strokeStyle="rgba(100,100,100,0.35)";
        ctx.arc(this.x,this.y,this.r,Math.PI*-4/180,Math.PI*135/180);
        ctx.stroke();
        ctx.lineWidth=1;
    }
}

class FuncKnob extends DoubleKnob {
    constructor(pX,pY) {
        var ret=super(pX,pY,bufgen.length,33,"Func                         ","func",35,19);
        this.dutyLabel=new Label(pX+40,pY-55,"Duty",12);
        this.dutyLabel.bgcolor=hl_gray;
        this.k.value=0;
        this.k_.color="gray";
        this.k_.haircolor="#EEEEEE";
        this.iconCircle(pX-8,pY,50,bufgen);
        return ret;
    }
    iconCircle(x,y,r,bufgen) {
        var n=bufgen.length;
        for (var i=0; i<n; i++) {
            new Icon(x+r*Math.sin(2*Math.PI*i/n),
            y-r*Math.cos(2*Math.PI*i/n),20,6,bufgen[i].f,
            bufgen[i].halfIcon);
        }
    }
}

class ScaleKnob extends Knob {
    constructor(pX,pY) {
        var ret=super(-1,pX,pY,25,scale.length,0,"Range","range");
        this.iconCircle(pX,pY+4,40,scale);
        ui.push(this);
        return ret;
    }
    iconCircle(x,y,r,scale) {
        var n=scale.length;
        for (var i=0; i<n; i++) {
            var unit=""+scale[i]; 
            if (unit=="1") unit="1k"; 
            else if (unit=="10") unit="10k";
            else if (unit=="100") unit="100k";
            else if (unit=="1000") unit="1M";
            else if (unit==".01") unit="10";
            else if (unit==".1") unit="100";
            new Label(x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n),unit,12);
        }
    }
}

class MonitorKnob extends Knob {
    constructor(pX,pY) {
        var ret=super(-1,pX,pY,20,a_monitor.length,4,"none","none");
        this.iconCircle(pX,pY+5,32,a_monitor);
        ui.push(this);
        return ret;
    }
    iconCircle(x,y,r,a_monitor) {
        var n=a_monitor.length;
        for (var i=0; i<n; i++) {
            new Label(x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n),a_monitor[i],12);
        }
    }
    on() {
        return a_monitor[this.value]!="Off";
    }
    turn(event) {
        super.turn(event);
        if (this.on()) switchBuffer();
        else this.switchOff();
    }
    callSwitchOff(event) {
        this.value=this.defaultValue; // this have to be "Off"
        this.switchOff();
    }
    switchOff() {
        stopBuffer(aptr);
        astarted=false;
    }
}

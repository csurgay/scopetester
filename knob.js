class Knob extends pObject {
    constructor(pLimit,pX,pY,pR,pTicks,pValue,pLabel,lpos) {
        const pos={"knob":-25,"double":-42,"sweep":63};
        var ret=super(pX-pR,pY-pR,2*pR,2*pR);
        this.limit=pLimit; // ticks/2: végállásos, -1: körbeforog
        this.r=pR;
        this.ticks=pTicks;
        this.value=pValue;
        this.l=pLabel;
        this.color="#EEEEEE";
        this.haircolor="gray";
        this.pointercolor="red";
        new Label(pX,pY+pos[lpos],pLabel,12);
        ui.push(this);
        return ret;
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
        }
}

class DoubleKnob extends pObject {
    constructor(pX,pY,pTicks,pTicks_,pLabel,lpos,pR,pR_) {
        var ret=super(pX-pR,pY-pR,2*pR,2*pR);
        this.k=new Knob(-1,pX,pY,pR,pTicks,0,pLabel,lpos);
        this.k_=new Knob(-1,pX,pY,pR_,pTicks_,0,"",0);
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

class TimeKnob extends DoubleKnob {
    constructor(pX,pY) {
        var ret=super(pX,pY,tb.length,21,"","sweep",50,25);
        this.k_.color="rgb(200,20,20)";
        this.k_.haircolor=this.k_.color;
        this.k_.pointercolor="#EEEEEE";
        this.iconCircle(ui,pX,pY+5,62,tb);
        new Dekor(pX,pY);
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
            ui.push(new Label(x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n),sl));
        }
    }
}

class Dekor extends pObject {
    constructor(pX,pY) {
        var ret=super(pX,pY,0,0);
        ui.push(this);
        return ret;
    }
    draw(ctx) {
        super.draw(ctx);
        ctx.beginPath();
        ctx.lineWidth=16;
        ctx.strokeStyle="rgba(80,160,80,0.35)";
        ctx.arc(this.x,this.y,62,Math.PI*61/69,Math.PI*130/69);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle="rgba(120,120,120,0.35)";
        ctx.arc(this.x,this.y,62,Math.PI*131/69,Math.PI*37/69);
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth=1;
        ctx.fillText("ms",this.x-68,this.y-48);
        ctx.fillText("us",this.x+68,this.y+55);
        ctx.fillText("sec",this.x-65,this.y+55);
        ctx.fill();
        ctx.stroke();
    }
}

class FuncKnob extends DoubleKnob {
    constructor(pX,pY) {
        var ret=super(pX,pY,bufgen.length,33,"","none",35,17);
        this.k.value=0;
        this.iconCircle(pX-8,pY,50,bufgen);
        return ret;
    }
    iconCircle(x,y,r,bufgen) {
        var n=bufgen.length;
        for (var i=0; i<n; i++) {
            new Icon(x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n),20,6,bufgen[i].f);
        }
    }
}

class ScaleKnob extends Knob {
    constructor(pX,pY) {
        var ret=super(-1,pX,pY,30,scale.length,0,"none","none");
        this.iconCircle(pX,pY+4,43,scale);
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

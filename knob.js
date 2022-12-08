class Object {
    constructor(pX,pY,pW,pH) {
        this.x=pX;
        this.y=pY;
        this.w=pW;
        this.h=pH;
        return this;
    }
    turn(event) {
    }
    hit(event) {
        var pX=event.clientX-canvas.getBoundingClientRect().left;
        var pY=event.clientY-canvas.getBoundingClientRect().top
        var x=this.x, y=this.y, w=this.w, h=this.h;
        if (pX>x && pX<x+w && pY>y && pY<y+h) return true; 
        else return false;
    }
    draw(ctx) {
    }
}

class Icon extends Object {
    constructor(pX,pY,pFunc) {
        var ret=super(pX,pY,20,20);
        this.f=pFunc;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle="black";
        ctx.moveTo(this.x,this.y-6*this.f(0)/127);
        order=0;
        ampl=127;
        for (var x=0; x<20; x++) 
            ctx.lineTo(this.x+x,this.y-6*this.f(Math.floor(512*x/20))/ampl);
        ctx.stroke();
    }
}

class Label extends Object {
    constructor(pX,pY,pS) {
        var ret=super(pX,pY,20,20);
        this.s=pS;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle="black";
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.s,this.x,this.y)
        ctx.stroke();
    }
}

class Knob extends Object {
    constructor(pX,pY,pR,pTicks,pValue) {
        var ret=super(pX-pR,pY-pR,2*pR,2*pR);
        this.r=pR;
        this.ticks=pTicks;
        this.value=pValue;
        ui.push(this);
        return ret;
    }
    turn(event) {
        var pDelta=event.deltaY;
        this.value+=Math.sign(pDelta);
        if (this.value<0) this.value+=this.ticks;
        else if (this.value>this.ticks-1) this.value-=this.ticks;
    }
    draw(ctx) {
        var x=this.x+this.r, y=this.y+this.r, r=this.r, n=this.ticks, k=this.value;
        ctx.beginPath();
        ctx.strokeStyle="gray";
        ctx.lineTo(x+r,y);
        ctx.fillStyle = "#EEEEEE";
        ctx.arc(x,y,r,0,2*Math.PI);
        ctx.fill();
        for(var i=0; i<n; i++) {
            ctx.moveTo(x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n));
            ctx.lineTo(x+2*r/3*Math.sin(2*Math.PI*i/n),y-2*r/3*Math.cos(2*Math.PI*i/n));
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle="red";
        ctx.moveTo(x+r*Math.sin(2*Math.PI*k/n),y-r*Math.cos(2*Math.PI*k/n));
        ctx.lineTo(x+2*r/3*Math.sin(2*Math.PI*k/n),y-2*r/3*Math.cos(2*Math.PI*k/n));
        ctx.stroke();
        }
}

class DoubleKnob extends Object {
    constructor(pX,pY,pTicks,pTicks_,pLabel) {
        var ret=super(pX-35,pY-35,2*35,2*35);
        this.r=35;
        this.r_=20;
        ui.push(new Label(pX-30,pY-60,pLabel));
        this.k=new Knob(pX,pY,this.r,pTicks,0);
        this.k_=new Knob(pX,pY,this.r_,pTicks_,0);
        return ret;
    }
    turn(event) {
        if (this.k_.hit(event)) this.k_.turn(event);
        else if (this.k.hit(event)) this.k.turn(event);
    }
}

class FuncKnob extends DoubleKnob {
    constructor(pX,pY) {
        var ret=super(pX,pY,bufgen.length,33,"Func");
        this.iconCircle(ui,pX-8,pY,50,bufgen);
        return ret;
    }
    iconCircle(ui,x,y,r,bufgen) {
        var n=bufgen.length;
        for (var i=0; i<n; i++)
            ui.push(new Icon(x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n),bufgen[i].f));
    }
}

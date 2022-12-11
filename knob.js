class pObject {
    constructor(pX,pY,pW,pH) {
        this.x=pX;
        this.y=pY;
        this.w=pW;
        this.h=pH;
        return this;
    }
    turn(event) {
    }
    click(event) {
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

class Icon extends pObject {
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

class Label extends pObject {
    constructor(pX,pY,pS,pSize) {        
        var ret=super(pX,pY,getTextWidth(pS,pSize),pSize+1);
        this.s=pS;
        this.size=pSize;
        ui.push(this);
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle=bgcolor;
        ctx.fillRect(this.x-this.w/2-10,this.y-this.h,this.w+20,this.h+4);
//        ctx.rect(this.x-this.w/2-10,this.y-this.h,this.w+20,this.h+4);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle="black";
        ctx.font = this.size+'px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.s,this.x,this.y)
        ctx.stroke();
    }
}

function getTextWidth(pS,pSize) {
    ctx.font = pSize+'px Arial';
    return Math.floor(ctx.measureText(pS).width);
}

class Knob extends pObject {
    constructor(pX,pY,pR,pTicks,pValue,pLabel,lpos) {
        var ret=super(pX-pR,pY-pR,2*pR,2*pR);
        this.r=pR;
        this.ticks=pTicks;
        this.value=pValue;
        this.l=pLabel;
        new Label(pX,pY+[0,-25,63,-42][lpos],pLabel,12);
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

class DoubleKnob extends pObject {
    constructor(pX,pY,pTicks,pTicks_,pLabel,lpos,pR,pR_) {
        var ret=super(pX-pR,pY-pR,2*pR,2*pR);
        this.k=new Knob(pX,pY,pR,pTicks,0,pLabel,lpos);
        this.k_=new Knob(pX,pY,pR_,pTicks_,0,"",0);
        return ret;
    }
    turn(event) {
        if (this.k_.hit(event)) this.k_.turn(event);
        else if (this.k.hit(event)) this.k.turn(event);
    }
}

class TimeKnob extends DoubleKnob {
    constructor(pX,pY) {
        var ret=super(pX,pY,21,21,"Sweep",2,50,25);
        return ret;
    }
}

class FuncKnob extends DoubleKnob {
    constructor(pX,pY,pValue) {
        var ret=super(pX,pY,bufgen.length,33,"",0,35,17);
        this.k.value=pValue;
        this.iconCircle(ui,pX-8,pY,50,bufgen);
        return ret;
    }
    iconCircle(ui,x,y,r,bufgen) {
        var n=bufgen.length;
        for (var i=0; i<n; i++)
            ui.push(new Icon(x+r*Math.sin(2*Math.PI*i/n),y-r*Math.cos(2*Math.PI*i/n),bufgen[i].f));
    }
}

class Frame extends pObject {
    constructor(pX,pY,pW,pH,pLabel,pPos) {
        super(pX,pY,pW,pH);
        var x=pX+pW/2; if (pPos==1) x=pX+3*pW/4;
        ui.push(this);
        new Label(x,pY+4,pLabel,15);
    }
    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth=2;
        ctx.strokeStyle = "rgb(0, 25, 0)";
        ctx.roundRect(this.x, this.y, this.w, this.h, 20);
        ctx.stroke();
        ctx.restore();
    }
}
class Button extends pObject {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(pX,pY,pW,pH);
        this.state=0;
        this.type=pType;
        ui.push(this);
        new Label(pX+[0,15,0,0,-28][pType],pY+[0,-10,0,0,12][pType],pLabel,15);
    }
    click(event) {
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
        if (this.type==1) 
            ctx.fillRect(this.x-dVfd,this.y-dVfd/2,this.w+2*dVfd,this.h+dVfd);
        else if (this.type==4) 
            ctx.fillRect(this.x-dVfd,this.y-dVfd/4,this.w+2*dVfd,this.h+dVfd/2);
        ctx.fill();
        var img=led_off; if (this.state==1) img=led_on;
        ctx.drawImage(img,0,0,225,216,this.x,this.y,this.w,this.h);
    }
}
class PowerButton extends Button {
    click(event) {
        super.click(event);
        for (var c=0; c<2; c++) b_chon[c].state=this.state;
        if (this.state==0) for (var c=0; c<2; c++) b_ch[c].state=0;
    }
}
class ChOnButton extends Button {
    click(event) {
        if (b_power.state==1) super.click(event);
    }
}

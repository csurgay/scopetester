class pObject {
    constructor(pX,pY,pW,pH) {
        this.x=pX;
        this.y=pY;
        this.w=pW;
        this.h=pH;
        this.switchBufferNeeded=false;
        this.live=true;
        return this;
    }
    setSwitchBufferNeeded() {
        this.switchBufferNeeded=true;
    }
    turn(event) {
        if (this.live && b_monitor.state==1 && this.switchBufferNeeded) setTimeout(switchBuffer,1);
    }
    click(event) {
        if (this.live && b_monitor.state==1 && this.switchBufferNeeded) setTimeout(switchBuffer,1);
    }
    hit(event) {
        if (this.live) {
            var pX=event.clientX-canvas.getBoundingClientRect().left;
            var pY=event.clientY-canvas.getBoundingClientRect().top
            var x=this.x, y=this.y, w=this.w, h=this.h;
            if (pX>x && pX<x+w && pY>y && pY<y+h) return true; 
            else return false;
        }
    }
    draw(ctx) {
    }
}

class Icon extends pObject {
    constructor(pX,pY,pW,pH,pFunc) {
        var ret=super(pX,pY,pW,pH);
        this.f=pFunc;
        this.ChOnType=false;
        this.parent=null;
        ui.push(this);
    }
    draw(ctx) {
        if (!this.ChOnType || this.parent.b_ch.state==1) {
            ctx.beginPath();
            ctx.strokeStyle="black";
            ampl=127;
            ctx.moveTo(this.x,this.y-this.h*this.f(0)/127);
            order=0;
            for (var i=0; i<this.w; i++) 
                ctx.lineTo(this.x+i,this.y-this.h*this.f(Math.floor(L*i/this.w))/ampl);
            ctx.stroke();
        }
    }
}

class Label extends pObject {
    constructor(pX,pY,pS,pSize) {        
        var ret=super(pX,pY,getTextWidth(ctx,pS,pSize),pSize+1);
        this.live=false;
        this.s=pS;
        this.size=pSize;
        ui.push(this);
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle=bgcolor;
        ctx.fillRect(this.x-this.w/2-10,this.y-this.h,this.w+20,this.h+4);
//ctx.rect(this.x-this.w/2-10,this.y-this.h,this.w+20,this.h+4); // debug
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

function getTextWidth(ctx,pS,pSize) {
    ctx.font = pSize+'px Arial';
    return Math.floor(ctx.measureText(pS).width);
}

class Frame extends pObject {
    constructor(pX,pY,pW,pH,pLabel,pPos) {
        super(pX,pY,pW,pH);
        var x={"center":pX+pW/2,"rightish":pX+3*pW/4};
        ui.push(this);
        new Label(x[pPos],pY+4,pLabel,15);
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

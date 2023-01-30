class Vfd extends pObject {
    constructor(pX,pY,pDigits,pGetValueCallback,pOffCondCallback) {
        super(ctx,pX,pY-dVfd,pDigits*dVfd,2*dVfd);
        this.digits=pDigits;
        this.getValue=pGetValueCallback;
        this.getOffCond=pOffCondCallback;
        uipush(this);
        this.absValue;
        this.drawDigit=drawVfdDigit;
    }
    draw(ctx) {
        this.absValue=Math.abs(this.getValue());
        if (this.absValue<0.001) {
            this.draw2(ctx);
            return;
        }
        var dx=0;
        var s=""+this.absValue;
        if (s.indexOf('.')<0) s+='.'; var ss=s.split('.');
        if (ss[0].length<this.digits/2) ss[0]=("000000"+ss[0]).slice(-this.digits/2);
        ss[1]=(ss[1]+"000000").substring(0,this.digits/2+1);
        s=(ss[0]+"."+ss[1]).substring(0,this.digits+1);
        var l=s.length; if (s.indexOf('.')>=0) l++;
        if (this.getValue()<0) s='-'+s.slice(1);
        ctx.beginPath();
        grd = ctx.createRadialGradient(this.x+this.w/2,this.y+this.h/2,
            2*this.w/5, this.x+this.w/2,this.y+this.h/2,
            2*this.w/3);
        grd.addColorStop(0, "rgb(10,30,30)");
        grd.addColorStop(1, bgcolor);
        ctx.fillStyle = grd;
        ctx.fillRect(this.x-dVfd/2,this.y-dVfd/2,this.w+dVfd,this.h+dVfd);
        ctx.fill();
        if (this.getOffCond()) { 
            s="8.8.8.8.8.8.8.8.8.8.8.8.".substring(0,2*this.digits);
            l*=2;
        }
        for (let i=0; i<l; i++) {
            var digit = s[i];
            var decimal = " ";
            if (i<s.length-1) if (s[i+1]=='.') { decimal='.'; i++; }
            this.drawDigit(ctx,digit,decimal,this.x+(dx++)*dVfd,this.y,dVfd);
        }
        if (this.getOffCond()) {
            ctx.fillStyle="rgba(10,30,30,0.85)";
            ctx.fillRect(this.x,this.y,this.w,this.h);
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle="#dddddd";
        ctx.lineWidth=1;
        var d=4;
        ctx.rect(this.x-d,this.y-d,this.w+2*d,this.h+2*d);
        ctx.stroke();
        super.draw(ctx);
    }
    draw2(ctx) {
        var dx=0;
        var s=""+this.absValue;
        if (s.indexOf('.')<0) s+='.'; var ss=s.split('.');
        if (ss[0].length<this.digits/2+2) ss[0]=("000000"+ss[0]).slice(-this.digits/2+2);
        ss[1]=(ss[1]+"000000").substring(0,this.digits/2+2);
        s=(ss[0]+"."+ss[1]).substring(0,this.digits+1);
        var l=s.length; if (s.indexOf('.')>=0) l++;
        if (this.getValue()<0) s='-'+s.slice(1);
        ctx.beginPath();
        grd = ctx.createRadialGradient(this.x+this.w/2,this.y+this.h/2,
            2*this.w/5, this.x+this.w/2,this.y+this.h/2,
            2*this.w/3);
        grd.addColorStop(0, "rgb(10,30,30)");
        grd.addColorStop(1, bgcolor);
        ctx.fillStyle = grd;
        ctx.fillRect(this.x-dVfd/2,this.y-dVfd/2,this.w+dVfd,this.h+dVfd);
        ctx.fill();
        if (this.getOffCond()) { 
            s="8.8.8.8.8.8.8.8.8.8.8.8.".substring(0,2*this.digits);
            l*=2;
        }
        for (let i=0; i<l; i++) {
            var digit = s[i];
            var decimal = " ";
            if (i<s.length-1) if (s[i+1]=='.') { decimal='.'; i++; }
            this.drawDigit(ctx,digit,decimal,this.x+(dx++)*dVfd,this.y,dVfd);
        }
        if (this.getOffCond()) {
            ctx.fillStyle="rgba(10,30,30,0.85)";
            ctx.fillRect(this.x,this.y,this.w,this.h);
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle="#dddddd";
        ctx.lineWidth=1;
        var d=4;
        ctx.rect(this.x-d,this.y-d,this.w+2*d,this.h+2*d);
        ctx.stroke();
        super.draw(ctx);
    }
}

class Vfdred extends Vfd {
    constructor(pX,pY,pDigits,pGetValueCallback,pOffCondCallback) {
        super(pX,pY,pDigits,pGetValueCallback,pOffCondCallback);
        this.drawDigit=drawVfdredDigit;
    }   
}

function drawVfdDigit(ctx,digit,dec,pX,pY,pD) {
    if (digit=='-') {
        ctx.drawImage(vfd_, 3,4, 16,32, pX,pY, dVfd,dVfd*2);
    }
    else {
        var num=parseInt(digit);
        if (dec=='.') {
            ctx.drawImage(vfd, num*32+16,0, 16,32, pX,pY, dVfd,dVfd*2);
        } else {
            ctx.drawImage(vfd, num*32,0, 16,32, pX,pY, dVfd,dVfd*2);
        }
    }
}

function drawVfdredDigit(ctx,digit,dec,pX,pY,pD) {
    if (digit=='-') {
        ctx.drawImage(vfdred, 0,0, 15,30, pX,pY, dVfd,dVfd*2);
    }
    else {
        var num=parseInt(digit);
        if (dec=='.') {
            ctx.drawImage(vfdred, 15+num*30+15,0, 15,30, pX,pY, dVfd,dVfd*2);
        } else {
            ctx.drawImage(vfdred, 15+num*30,0, 15,30, pX,pY, dVfd,dVfd*2);
        }
    }
}

const dVfd=16;

class Vfd extends pObject {
    constructor(pX,pY,pDigits,pGetValueCallback,pOffCondCallback) {
        super(pX,pY-dVfd,pDigits*dVfd,2*dVfd);
        this.digits=pDigits;
        this.getValue=pGetValueCallback;
        this.getOffCond=pOffCondCallback;
        ui.push(this);
    }
    draw(ctx) {
        var dx=0;
        var s=""+this.getValue();
        if (s.indexOf('.')<0 && s.length<4) s+='.00';
        s=s.substring(0,this.digits);
        var l=s.length; if (s.indexOf('.')>=0) l--;
        s="000000000000".substring(0,this.digits-l)+s;
        l=s.length; if (s.indexOf('.')>=0) l++;
        ctx.save();
        ctx.beginPath();
        var grd = ctx.createRadialGradient(this.x+this.w/2,this.y+this.h/2,
            2*this.w/5, this.x+this.w/2,this.y+this.h/2,
            2*this.w/3);
        grd.addColorStop(0, "rgb(10,30,30)");
        grd.addColorStop(1, bgcolor);
        ctx.fillStyle = grd;
        ctx.fillRect(this.x-dVfd,this.y-dVfd/2,this.w+2*dVfd,this.h+dVfd);
        ctx.fill();
        if (this.getOffCond()) s="888888888888".substring(0,this.digits);
        for (var i=0; i<l; i++) {
            var digit = parseInt(s[i]);
            var decimal = " ";
            if (i<s.length-1) if (s[i+1]=='.') { decimal='.'; i++; }
            drawVfdDigit(ctx,digit,decimal,this.x+(dx++)*dVfd,this.y,dVfd);
        }
        if (this.getOffCond()) {
            ctx.fillStyle="rgba(10,30,30,0.7)";
            ctx.fillRect(this.x,this.y,this.w,this.h);
        }
        ctx.stroke();
        ctx.restore();
    }
}

function drawVfdDigit(ctx,i,dec,pX,pY,pD) {
    if (dec=='.') {
        ctx.drawImage(vfd, i*160+80,0, 80,160, pX,pY, dVfd,dVfd*2);
    } else {
        ctx.drawImage(vfd, i*160,0, 80,160, pX,pY, dVfd,dVfd*2);
    }
}

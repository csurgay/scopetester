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
        var s=""+Math.abs(this.getValue());
        if (s.indexOf('.')<0) s+='.'; var ss=s.split('.');
        if (ss[0].length<this.digits/2) ss[0]=("000000"+ss[0]).slice(-this.digits/2);
        ss[1]=(ss[1]+"000000").substring(0,this.digits/2);
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
        ctx.fillRect(this.x-dVfd,this.y-dVfd/2,this.w+2*dVfd,this.h+dVfd);
        ctx.fill();
        if (this.getOffCond()) s="888888888888".substring(0,this.digits);
        for (var i=0; i<l; i++) {
            var digit = s[i];
            var decimal = " ";
            if (i<s.length-1) if (s[i+1]=='.') { decimal='.'; i++; }
            drawVfdDigit(ctx,digit,decimal,this.x+(dx++)*dVfd,this.y,dVfd);
        }
        if (this.getOffCond()) {
            ctx.fillStyle="rgba(10,30,30,0.7)";
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

function drawVfdDigit(ctx,digit,dec,pX,pY,pD) {
    if (digit=='-') {
        ctx.drawImage(vfd_, 3,4, 16,32, pX,pY, dVfd,dVfd*2);
    }
    else {
        var num=parseInt(digit);
        if (dec=='.') {
//            ctx.drawImage(vfd, num*160+80,0, 80,160, pX,pY, dVfd,dVfd*2);
            ctx.drawImage(vfd, num*32+16,0, 16,32, pX,pY, dVfd,dVfd*2);
        } else {
//            ctx.drawImage(vfd, num*160,0, 80,160, pX,pY, dVfd,dVfd*2);
            ctx.drawImage(vfd, num*32,0, 16,32, pX,pY, dVfd,dVfd*2);
        }
    }
}

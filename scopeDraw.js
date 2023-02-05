Scope.prototype.drawFrame=function(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = "rgb(25, 50, 25)";
    ctx.lineWidth=10;
    roundRect(ctx, this.x-5, this.y-5, this.w+10, this.h+10, 20);
    ctx.stroke();
}
Scope.prototype.drawScreen=function(ctx,drawShadow="No-drawShadow") { // egyelőre nincs árnyék, mert slow sweep-nél eltűnik
    // draw screen
    if (drawShadow=="drawShadow") {
        ctx.beginPath();
        ctx.fillStyle = shadowcolor;
        roundRect(ctx, this.x+5, this.y+5, this.w+15, this.h+15, 20);
        ctx.fill();
    }
    this.drawFrame(ctx);
    ctx.beginPath();
    ctx.fillStyle = "rgba(50, 100, 50, 1)";
    roundRect(ctx, this.x, this.y, this.w, this.h, 20);
    ctx.stroke();
    ctx.fill();
}
Scope.prototype.drawGrid=function(ctx,illumgrid) {
    if (b_power.state==1 && illum>0) {
        var d1=50, d2=65;
        var ax=[this.x-d1,this.x-d1,this.x+this.w+d1,this.x+this.w+d1];
        var ay=[this.y+d2,this.y+this.h-d2,this.y+d2,this.y+this.h-d2];
        for (let i=0; i<4; i++) {
            var x=ax[i]; var y=ay[i];
            ctx.beginPath();
            var grd = ctx.createRadialGradient(x,y,d1,x,y,d2);
            grd.addColorStop(0,"rgba("+illum+", "+illum+", "+illum+",0.5)");
            grd.addColorStop(1, "rgba(50, 100, 50, 0)");
            ctx.arc(x,y,d2,0,2*Math.PI);
            ctx.fillStyle=grd;
            ctx.fill();
        }
    }
    ctx.beginPath();
    if (illumgrid=="grid") 
        ctx.strokeStyle = "rgba(0,25,0,1.0)";
    ctx.lineWidth=1;
    // draw grid
    d=this.d;
    dd=this.dd;
    illum=Math.floor(155*k_illum.getValue()/(k_illum.ticks-1));
    if (b_power.state==1 && illum>0) {
        illum=100+illum;
        ctx.strokeStyle = "rgba("+illum+", "+illum+", "+illum+",0.75)";
    }
    if (illumgrid=="grid" || illumgrid=="illum" && b_power.state==1 && illum>0) {
        for (let i=dd; i<=this.w-dd+1; i+=d) {
            ctx.moveTo(this.x+i,this.y+dd);
            ctx.lineTo(this.x+i,this.y+this.h-dd);
        }
        for (let i=dd; i<=this.h-dd+1; i+=d) {
            ctx.moveTo(this.x+dd,this.y+i);
            ctx.lineTo(this.x+this.w-dd,this.y+i);
        }
        // draw hair
        for (let i=dd; i<=this.w-dd+1; i+=d/5) {
            ctx.moveTo(this.x+i,this.y+this.h/2-dd/4);
            ctx.lineTo(this.x+i,this.y+this.h/2+dd/4);
        }
        for (let i=dd; i<=this.h-dd+1; i+=d/5) {
            ctx.moveTo(this.x+this.w/2-dd/4,this.y+i);
            ctx.lineTo(this.x+this.w/2+dd/4,this.y+i);
        }
        for (let i=dd; i<=this.w-dd+1; i+=d/5) {
            ctx.moveTo(this.x+i,this.y+dd+2*d-dd/8);
            ctx.lineTo(this.x+i,this.y+dd+2*d+dd/8);
        }
        for (let i=dd; i<=this.w-dd+1; i+=d/5) {
            ctx.moveTo(this.x+i,this.y+dd+6*d-dd/8);
            ctx.lineTo(this.x+i,this.y+dd+6*d+dd/8);
        }
        // draw dots
        for (let i=dd; i<=this.w-dd+1; i+=d/5) {
            ctx.moveTo(this.x+i,this.y+dd+6*d+d/2);
            ctx.lineTo(this.x+i,this.y+dd+6*d+d/2+1);
        }
        for (let i=dd; i<=this.w-dd+1; i+=d/5) {
            ctx.moveTo(this.x+i,this.y+dd+d+d/2);
            ctx.lineTo(this.x+i,this.y+dd+d+d/2+1);
        }
    }
    ctx.stroke();
}
function callDraw(ctx,drawShadow) {
    drawInTimeout=false;
    scope.draw(ctx,drawShadow);
}

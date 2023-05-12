function reset() {
    imprintState="idle";
    for (let i=0; i<uictx.length; i++) {
        if (!isNaN(uictx[i].ticks)) {
            uictx[i].reset();
        }
    }
    for (let i=0; i<uidebugctx.length; i++) {
        if (!isNaN(uidebugctx[i].ticks)) {
            uidebugctx[i].reset();
        }
    }
    if (scope.b_alt.state==0) scope.b_alt.clickXY(0,0);
    if (scope.b_a.state==0) scope.b_a.clickXY(0,0);
    if (scope.b_auto.state==0) scope.b_auto.clickXY(0,0);
    if (scope.b_readout.state==1) scope.b_readout.clickXY(0,0);
    if (scope.b_fft.state==1) scope.b_fft.clickXY(0,0);
    if (scope.b_storage.state==1) scope.b_storage.clickXY(0,0);
    for (let c=0; c<2; c++) {
        if (scope.ch[c].b_dc.state==0) scope.ch[c].b_dc.clickXY(0,0);
        if (siggen[c].b_ch.state==0) siggen[c].b_ch.clickXY(0,0);
        if (siggen[c].b_nhalf.state==1) siggen[c].b_nhalf.clickXY(0,0);
        if (siggen[c].b_phalf.state==1) siggen[c].b_phalf.clickXY(0,0);
        if (siggen[c].b_abs.state==1) siggen[c].b_abs.clickXY(0,0);
        if (siggen[c].b_inv.state==1) siggen[c].b_inv.clickXY(0,0);
    }
    presetManager.reset();
//    presetManager.add(1,"wheel",siggen[0].k_scale,0,-1);
    if (k_cursor.k.pulled) {
        presetManager.add(1,"mousedown",k_cursor.k_,0,0,350);
        presetManager.add(1,"mouseup",k_cursor.k_,0,0);
    }
    if (scope.k_xpos.k.pulled) {
        presetManager.add(1,"mousedown",scope.k_xpos.k_,0,0,350);
        presetManager.add(1,"mouseup",scope.k_xpos.k_,0,0);
    }
    if (scope.k_time.k.pulled) {
        presetManager.add(1,"mousedown",scope.k_time.k_,0,0,350);
        presetManager.add(1,"mouseup",scope.k_time.k_,0,0);
    }
    // scope.ch[0].k_ypos.k.value=10;
    // scope.ch[1].k_ypos.k.value=-10;
}
class PresetManager {
    constructor() {
        this.presetDelay=50;
        this.timeCursor;
    }
    reset() {
        epreset=[];
        this.timeCursor=Date.now();
    }
    add(pNo,pEvent,pObject,pX,pY,pDelay=-1) {
        for (let i=0; i<pNo; i++) {
            new EventPreset(pEvent,this.timeCursor,pObject,pX,pY);
            this.timeCursor+=pDelay==-1?this.presetDelay:pDelay;
        }
    }
}
function setImprintY() {
    if (scope.b_power.state==0 || imprintState=="idle") return;
    if (imprintY<=imprintEnd && imprintState=="running") {
        imprintState="completing";
    }
    if (imprintState=="running") {
        imprintY-=0.12;
    }
    scope.draw(ctx);
    imprintTimer=setTimeout(setImprintY,1);
}
class DebugButton extends PushButton {
    constructor(pX,pY,pW,pH,pLabel,pType) {
        super(debugctx,pX,pY,pW,pH,pLabel,pType);
    }
    clickXY(x,y) {
        if (this.name=="Calib") {
            super.clickXY(x,y);
            if (this.state==1) { 
                logWindow.removeAttribute("hidden"); 
                debugcanvas.removeAttribute("hidden"); 
            }
            else if (this.state==0) {
                logWindow.setAttribute("hidden","hidden");
                debugcanvas.setAttribute("hidden","hidden");
            }
        }
        else if (this.name=="Debug") {
            super.clickXY(x,y);
        }
        else if (this.name=="Frames") {
            super.clickXY(x,y);
        }
        else if (this.name=="Trace") {
            super.clickXY(x,y);
        }
        else if (this.name.substring(0,6)=="Preset") {
            if (true) { 
                var pri=parseInt(this.name.substring(6));
                presetManager.reset();
                reset();
                // switch off imprint timer and trigger
                clearTimeout(imprintTimer); 
                imprintState="idle";
                if (pri==0) { // imprint text scrolling
                    imprintState="running";
                    imprintHlPtr=0;
                    imprintY=imprintStart;
                    imprintTimer=setTimeout(setImprintY,50);
                }
                else if (pri==1) { // Morse (Range, Freq, AM, Monitor)
                    presetManager.add(5,"wheel",siggen[0].k_func.k,0,-1);
                    presetManager.add(4,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(3,"wheel",siggen[0].k_freq.k,0,-1);
                    presetManager.add(30,"wheel",siggen[1].k_freq.k,0,-1,7);
                    presetManager.add(1,"mousedown",scope.b_mod,0,0);
                    presetManager.add(1,"mouseup",scope.b_mod,0,0);
                    presetManager.add(5,"wheel",scope.k_time.k,0,-1,7);
                    initChannels();
                    presetManager.add(1,"wheel",scope.k_monitor,0,-1);
	                presetManager.add(100,"wheel",scope.k_delay.k_,0,1,7);
                }
                else if (pri==2) { // La Linea Menomano (XY, Rotate, Pos+, DC, Intensity)
                    presetManager.add(2,"wheel",siggen[0].k_func.k,0,-1);
                    presetManager.add(1,"wheel",siggen[1].k_func.k,0,-1);
                    presetManager.add(1,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(1,"wheel",siggen[1].k_scale,0,-1);
                    presetManager.add(1,"mousedown",scope.b_xy,0,0);
                    presetManager.add(1,"mouseup",scope.b_xy,0,0);
                    presetManager.add(15,"wheel",scope.k_rot,0,1,20);
                    presetManager.add(30,"wheel",scope.k_rot,0,-1,20);
                    presetManager.add(15,"wheel",scope.k_rot,0,1,20);
                    presetManager.add(1,"mousedown",siggen[1].b_phalf,0,0);
                    presetManager.add(1,"mouseup",siggen[1].b_phalf,0,0);
                    presetManager.add(16,"wheel",scope.ch[0].k_ypos.k,0,-1,0);
                    presetManager.add(16,"wheel",scope.ch[1].k_ypos.k,0,-1,0);
                    presetManager.add(10,"wheel",siggen[1].k_dc.k,0,-1);
                    presetManager.add(48,"wheel",siggen[1].k_dc.k,0,1,7);
                    presetManager.add(1,"mousedown",siggen[1].b_phalf,0,0);
                    presetManager.add(1,"mouseup",siggen[1].b_phalf,0,0);
		            presetManager.add(7,"wheel",scope.k_intensity,0,1,7);
		            presetManager.add(1,"wheel",scope.k_intensity,0,1,1000);
		            presetManager.add(7,"wheel",scope.k_time.k,0,-1);
                    presetManager.add(2,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(2,"wheel",siggen[1].k_scale,0,-1);
                }
                else if (pri==3) { // NTSC (Scale, CH1, Delaybase, Delay)
                    presetManager.add(1,"mousedown",scope.b_ch[0],0,0);
                    presetManager.add(1,"mouseup",scope.b_ch[0],0,0);
                    presetManager.add(6,"wheel",siggen[0].k_func.k,0,-1);
                    presetManager.add(1,"mousedown",scope.b_readout,0,0);
                    presetManager.add(1,"mouseup",scope.b_readout,0,0);
                    presetManager.add(1,"wheel",siggen[0].k_scale,0,1);
                    presetManager.add(7,"wheel",scope.k_time.k,0,1);
                    presetManager.add(1,"mousedown",scope.k_time.k_,0,0,350);
                    presetManager.add(1,"mouseup",scope.k_time.k_,0,0);
                    presetManager.add(5,"wheel",scope.k_time.k,0,1,7);
                    presetManager.add(1,"wheel",scope.ch[0].k_volts.k,0,1);
                    presetManager.add(5,"wheel",scope.ch[0].k_volts.k_,0,1);
		            presetManager.add(100,"wheel",scope.k_delay.k,0,1,7);
		            presetManager.add(100,"wheel",scope.k_delay.k_,0,1,7);
                }
                else if (pri==4) { // Lissajous (XY, Freq, Delaybase, Delay)
                    presetManager.add(20,"wheel",siggen[0].k_freq.k,0,1,1);
                    presetManager.add(70,"wheel",siggen[1].k_freq.k,0,1,1);
                    presetManager.add(3,"wheel",scope.k_time.k,0,1);
                    presetManager.add(2,"wheel",scope.ch[0].k_volts.k,0,1);
                    presetManager.add(2,"wheel",scope.ch[1].k_volts.k,0,1);
                    presetManager.add(2,"wheel",scope.ch[1].k_volts.k_,0,-1);
                    presetManager.add(1,"mousedown",scope.b_xy,0,0);
                    presetManager.add(1,"mouseup",scope.b_xy,0,0);
                    presetManager.add(135,"wheel",siggen[0].k_phase.k_,0,1,10);
		            presetManager.add(60,"wheel",siggen[1].k_phase.k_,0,-1,50);
                }
                else if (pri==5) { // Lissajous flowers (XY)
                    presetManager.add(9,"wheel",siggen[0].k_func.k,0,-1);
                    presetManager.add(9,"wheel",siggen[1].k_func.k,0,-1);
                    presetManager.add(1,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(1,"wheel",siggen[1].k_scale,0,-1);
                    presetManager.add(6,"wheel",siggen[1].k_phase.k,0,1);
                    presetManager.add(1,"wheel",scope.ch[0].k_volts.k,0,1);
                    presetManager.add(1,"wheel",scope.ch[1].k_volts.k,0,1);
                    presetManager.add(1,"mousedown",scope.b_xy,0,0);
                    presetManager.add(1,"mouseup",scope.b_xy,0,0);
                    presetManager.add(1,"wheel",scope.k_delay,0,1,500);
                    presetManager.add(2,"wheel",siggen[0].k_func.k_,0,1,100);
                    presetManager.add(2,"wheel",siggen[1].k_func.k_,0,1,100);
                    presetManager.add(1,"wheel",scope.k_delay,0,1,500);
                    presetManager.add(2,"wheel",siggen[0].k_func.k_,0,1,100);
                    presetManager.add(2,"wheel",siggen[1].k_func.k_,0,1,100);
                    presetManager.add(1,"wheel",scope.k_delay,0,1,500);
                    presetManager.add(2,"wheel",siggen[0].k_func.k_,0,-1,1);
                    presetManager.add(2,"wheel",siggen[1].k_func.k_,0,-1,1);
                    presetManager.add(15,"wheel",scope.k_rot,0,-1,30);
                    presetManager.add(8,"wheel",scope.k_focus,0,-1,30);
                    presetManager.add(30,"wheel",scope.k_rot,0,1,30);
                    presetManager.add(8,"wheel",scope.k_focus,0,1,30);
                    presetManager.add(7,"wheel",scope.k_intensity,0,1,30);
                    presetManager.add(1,"wheel",scope.k_intensity,0,1,1000);
                    presetManager.add(1,"wheel",siggen[0].k_func.k,0,1);
                    presetManager.add(1,"wheel",siggen[1].k_func.k,0,1,1000);
                    presetManager.add(3,"wheel",siggen[0].k_func.k_,0,-1);
                    presetManager.add(3,"wheel",siggen[1].k_func.k_,0,-1);
                    presetManager.add(8,"wheel",scope.k_intensity,0,-1);
                    presetManager.add(1,"wheel",scope.ch[0].k_volts.k,0,1);
                    presetManager.add(1,"wheel",scope.ch[1].k_volts.k,0,1,1000);
                    presetManager.add(1,"wheel",siggen[1].k_func.k,0,-1);
                    presetManager.add(6,"wheel",siggen[1].k_phase.k,0,-1);
                    presetManager.add(15,"wheel",scope.k_rot,0,-1);
                    presetManager.add(1,"wheel",siggen[0].k_func.k_,0,1);
                    presetManager.add(1,"wheel",siggen[1].k_func.k_,0,1);
                    presetManager.add(2,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(2,"wheel",siggen[1].k_scale,0,-1);
                    presetManager.add(6,"wheel",scope.k_time.k,0,-1);
                }
                else if (pri==6) { // Heart (XY) and Smiling face
                    presetManager.add(1,"wheel",siggen[0].k_func.k,0,1);
                    presetManager.add(6,"wheel",siggen[0].k_func.k_,0,1);
                    presetManager.add(1,"wheel",siggen[1].k_func.k_,0,-1);
                    presetManager.add(5,"wheel",siggen[1].k_freq.k,0,1);
                    presetManager.add(1,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(1,"wheel",siggen[1].k_scale,0,-1);
                    presetManager.add(1,"wheel",scope.ch[0].k_volts.k,0,1);
                    presetManager.add(1,"wheel",scope.ch[1].k_volts.k,0,1);
                    presetManager.add(1,"mousedown",scope.b_xy,0,0);
                    presetManager.add(1,"mouseup",scope.b_xy,0,0,1000);
                    presetManager.add(10,"wheel",siggen[0].k_func.k,0,-1);
                    presetManager.add(7,"wheel",siggen[0].k_func.k_,0,-1);
                    presetManager.add(7,"wheel",siggen[0].k_ampl.k,0,1);
                    presetManager.add(1,"wheel",siggen[1].k_func.k_,0,1);
                    presetManager.add(5,"wheel",siggen[1].k_freq.k,0,-1);
                    presetManager.add(6,"wheel",siggen[1].k_phase.k,0,1);
                    presetManager.add(1,"wheel",scope.ch[0].k_volts.k,0,-1);
                    presetManager.add(1,"wheel",scope.ch[1].k_volts.k,0,-1);
                    presetManager.add(7,"wheel",scope.ch[0].k_ypos.k,0,1);
                    presetManager.add(10,"wheel",scope.ch[1].k_ypos.k,0,-1);
                    //presetManager.add(5,"wheel",scope.k_astigm,0,1);
                    presetManager.add(4,"wheel",scope.k_intensity,0,1);
                    presetManager.add(1,"mousedown",scope.b_alt,0,0);
                    presetManager.add(1,"mouseup",scope.b_alt,0,0);
                }
                else if (pri==17) { // Wave (Sinc, Range, ADD, Trigger/Mode)
                    presetManager.add(8,"wheel",siggen[0].k_func.k,0,1);
                    presetManager.add(1,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(4,"wheel",siggen[1].k_func.k,0,1);
                    presetManager.add(1,"wheel",siggen[1].k_scale,0,1);
                    presetManager.add(16,"wheel",siggen[0].k_func.k_,0,1);
                    presetManager.add(1,"mousedown",scope.b_add,0,0);
                    presetManager.add(1,"mouseup",scope.b_add,0,0);
                    presetManager.add(15,"wheel",scope.ch[0].k_ypos.k,0,-1);
                    //presetManager.add(32,"wheel",siggen[0].k_func.k_,0,1);
                    presetManager.add(11,"wheel",scope.k_time.k_,0,1);
                    presetManager.add(1,"mousedown",scope.b_readout,0,0);
                    presetManager.add(1,"mouseup",scope.b_readout,0,0);
                    presetManager.add(1,"mousedown",scope.b_mode,0,0);
                    presetManager.add(1,"mouseup",scope.b_mode,0,0);
                    presetManager.add(24,"wheel",scope.k_trigger.k,0,1);
                    presetManager.add(1,"mousedown",k_cursor.k_,0,0,350);
                    presetManager.add(1,"mouseup",k_cursor.k_,0,0);
                    presetManager.add(10,"wheel",k_cursor.k,0,-1,);
                    presetManager.add(20,"wheel",k_cursor.k_,0,-1,);
                }
                else if (pri==7) { // Korosi
                    presetManager.add(4,"wheel",siggen[0].k_func.k,0,-1);
                    presetManager.add(3,"wheel",siggen[1].k_func.k,0,-1);
                    presetManager.add(2,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(2,"wheel",siggen[1].k_scale,0,-1);
                    presetManager.add(5,"wheel",scope.k_time.k,0,-1);
                    presetManager.add(1,"mousedown",scope.b_xy,0,0);
                    presetManager.add(1,"mouseup",scope.b_xy,0,0);
                }
                else if (pri==8) { // ECG slow sweep double in phaseshift
                    presetManager.add(1,"mousedown",scope.b_chop,0,0);
                    presetManager.add(1,"mouseup",scope.b_chop,0,0);
                    presetManager.add(7,"wheel",siggen[0].k_func.k,0,-1);
                    presetManager.add(7,"wheel",siggen[1].k_func.k,0,-1);
                    presetManager.add(3,"wheel",siggen[0].k_scale,0,-1);
                    presetManager.add(3,"wheel",siggen[1].k_scale,0,-1);
                    presetManager.add(7,"wheel",scope.k_time.k,0,-1);
                    presetManager.add(12,"wheel",siggen[1].k_phase.k,0,1);
                    presetManager.add(10,"wheel",scope.ch[0].k_ypos.k,0,1);
                    presetManager.add(10,"wheel",scope.ch[1].k_ypos.k,0,-1);
                    presetManager.add(1,"wheel",scope.ch[0].k_volts.k,0,1);
                    presetManager.add(1,"wheel",scope.ch[1].k_volts.k,0,1);
                }
                initChannels();
                draw(ctx);
            }
        }
    }
}

function initDebugIcons() {
    new DebugIcon(0,100,900,200,(x)=>{if (x==-17) return L; else return myArrayBuffer[aptr]==null?0:100*myArrayBuffer[aptr].getChannelData(0)[x];});
    new DebugIcon(0,300,900,200,(x)=>{if (x==-17) return L; else return myArrayBuffer[aptr]==null?0:100*myArrayBuffer[aptr].getChannelData(1)[x];});
    new DebugIcon(0,200,900,200,(x)=>{if (x==-17) return FFTN; else return 100*fftIn[x];});
    new DebugIcon(0,400,900,200,(x)=>{if (x==-17) return FFTN; else return 100*fftOut[x];});
}

const credit="LaLinea 2in1 Oscilloscope 2022-2023 Peter Csurgay Version 0.24";
var canvas, ctx, logWindow, traceString="", now, scope, siggen; // main ui objects
var no_images_to_load, vfd, vfd_, led_on_power, led_on, led_off_power, led_off, led_red; // canvas images
const L=2048, L2=L/2, L4=L/4, L8=L/8; // buffer length
const N=1; // sample channel buffers (sch) length = N*L
const DL=500; // Display length
const A = 127; // default amplitude (on integer scale, A -> 1.0)
const f=new FFT(2048); // buffer for FFT spectrum data
const out=f.createComplexArray();
const input=f.createComplexArray();
var timebase, q, delay; // not sure yet, q=timebase*L/512
const sqrt=1.0293022366; // ^24=2 (sqrt=1.07177347; // ^10=2)
const bgcolor="#bbbbbb";
const shadowcolor="rgba(70,70,70,0.3)";
const hl_green="rgba(80,160,80,0.35)"; // knob and label highlight
const hl_gray="rgba(100,100,100,0.35)";
var k_intensity, k_focus, k_astigm, k_illum, k_rot, k_xpos, b_xcal, b_ycal, k_vol, k_monitor;
var b_power;
var bufgen=[];
var ch=[new Array(L),new Array(L)]; // original channel buffer, will get rid of
var y=[new Array(N*L), new Array(N*L)]; // two y buffers for scope
var sch=[new Array(L),new Array(L)]; // signal channel buffer, no freq
var micch=[new Array(L),new Array(L)]; // mic channel buffer
var order, ampl, freq, ampls=[0,0], ampls_=[0,0], avgs=[0,0];
var sumdelta=[0,0,0]; // third for Mode(Add,AM) beam length
var scales=[0,0], freqs=[0,0], freqs_=[0,0], phases=[0,0], dcs=[0,0], dcs_=[0,0];
var ui=[]; // for hit, click, turn
var buttons=[]; // for switch off at power off
var b_chon, k_time, k_delay, k_delaybase, k_trig, k_hold, k_slope;
var radio_mode, b_ch1, b_ch2, b_dual, b_add, b_mod, b_xy;
var radio_trig, b_limit, b_auto, b_ch1tr, b_ch2tr, b_mode, b_chtr;
var b_find, b_resv, b_mic, b_debug;
const dVfd=16, dButton=20;
const tb=[ 500,200,100,50,20,10,5,2, 1, .5,.2,.1,.05,.02,.01,.005,.002,.001];
const tb_=[ 2,1.9,1.8,1.7,1.6,1.5,1.4,1.3,1.2,1.1, 1, 0.95,0.9,0.85,0.8,0.75,0.7,0.65,0.6,0.55,0.5];
const vpd=[ .002,.001,50,20,10,5,2, 1, .5,.2,.1,.05,.02,.01,.005];
const vpd_=[ 2,1.9,1.8,1.7,1.6,1.5,1.4,1.3,1.2,1.1, 1, 0.95,0.9,0.85,0.8,0.75,0.7,0.65,0.6,0.55,0.5];
const scale=["1","10","100","1000",".01",".1"];
var findState="off", findValue, powerState="off", powerValue;
const a_monitor=["Ch1","Ch2","Stereo","Disp","Off"];
var mmx=[], mmy=[]; // Menomano (LaLinea) buffer data
var menomano=[-325,434,-294,438,-268,436,-238,436,-211,434,-189,435,-167,435,-142,434,-117,434,-87,436,-62,436,-44,436,-15,436,8,436,21,390,24,352,27,323,26,291,25,253,15,221,3,192,-9,170,-28,139,-47,120,-72,93,-84,75,-108,56,-123,43,-144,22,-168,5,-188,-13,-204,-29,-227,-29,-247,-34,-262,-46,-281,-38,-288,-31,-295,-43,-292,-57,-276,-66,-260,-71,-241,-76,-226,-76,-213,-72,-202,-84,-185,-87,-167,-86,-158,-74,-160,-67,-169,-71,-181,-67,-174,-58,-180,-37,-151,-18,-134,-7,-119,6,-100,21,-83,33,-54,58,-69,35,-64,4,-48,-17,-29,-33,-5,-45,21,-52,48,-55,78,-51,100,-41,105,-30,104,-16,91,-4,72,1,38,1,63,9,74,17,70,20,47,21,20,17,6,13,-4,5,2,33,29,39,47,39,78,46,91,46,89,67,114,48,127,33,144,18,162,0,177,-14,197,-29,211,-44,219,-51,207,-60,210,-65,216,-73,199,-82,210,-94,227,-95,244,-86,254,-77,261,-85,287,-91,309,-83,323,-77,337,-63,338,-42,303,-55,280,-48,259,-43,245,-42,222,-16,200,9,180,30,162,51,140,70,117,95,140,137,144,165,148,195,151,232,152,270,150,302,147,334,140,374,135,412,131,435,166,433,203,435,233,434,262,437,295,434,323,433,346,434,368,433];
var ret, yResult; // for different return results
const morseText="hat hogy s mint vagytok otthon pistikam";
const morseTime=4; // ticks in buffer
var morse=[];

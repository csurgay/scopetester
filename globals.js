const credit="LaLinea 2in1 Oscilloscope 2022-2023 Peter Csurgay Version 0.29";
var canvas, ctx, debugcanvas, debugctx, logWindow, traceString="", now;
var scope, siggen, presetManager; // global objects
var no_images_to_load, vfd, vfd_, led_on_powers, led_on, led_off_powers, led_off, led_red; // canvas images
const L=2048, L2=L/2, L4=L/4, L8=L/8; // buffer length
const DL=500; // Display length
const A = 127; // default amplitude (on integer scale, A -> 1.0)
const FFTN=2048;
const f=new FFT(FFTN); // buffer for FFT spectrum data
var fftIn=new Array(FFTN).fill(0), fftOut=new Array(FFTN).fill(0);
var timebase, delaybase, q, delay, volts=[0,0]; // not sure yet, q=timebase*L/512
const bgcolor="#bbbbbb";
const shadowcolor="rgba(70,70,70,0.3)";
const hl_green="rgba(80,160,80,0.35)"; // knob and label highlight
const hl_gray="rgba(100,100,100,0.35)";
var k_intensity, k_focus, k_astigm, k_illum, k_rot, k_xpos, b_xcal, b_ycal, k_vol, k_monitor;
var b_power;
var bufgen=[];
var sch=[new Array(L),new Array(L)]; // signal sample channel buffer, no freq
var schlen=[0,0]; // length of signal buffer data for lower frequencies
var gench=[new Array(L),new Array(L)]; // generated signal channel buffer
var micch=[new Array(L),new Array(L)]; // mic channel buffer
var dispch=[new Array(L), new Array(L)]; // display channel buffer
var order, ampl, freq, ampls=[0,0], ampls_=[0,0], avgs=[0,0];
var sumdelta=[0,0,0]; // third for Mode(Add,AM) beam length
var scales=[0,0], freqs=[0,0], freqs_=[0,0], phases=[0,0], dcs=[0,0], dcs_=[0,0];
var uictx=[], uidebugctx=[]; // for hit, click, turn
var buttons=[]; // for switch off at power off
var b_chon, k_time, k_delay, k_delaybase, k_trig, k_hold, k_slope;
var radio_mode, b_ch1, b_ch2, b_dual, b_add, b_mod, b_xy;
var radio_trig, b_limit, b_auto, b_ch1tr, b_ch2tr, b_mode, b_chtr;
var b_find, b_preset, b_mic;
const dVfd=16, dButton=20;
const tb=[ 5000,2000,1000,500,200,100,50,20,10,5,2, 1, .5,.2,.1,.05,.02,.01,.005,.002,.001,.0005,.0002,.0001];
const tb_=[ 2,1.9,1.8,1.7,1.6,1.5,1.4,1.3,1.2,1.1, 1, 0.95,0.9,0.85,0.8,0.75,0.7,0.65,0.6,0.55,0.5];
const vpd=[ .002,.001,50,20,10,5,2, 1, .5,.2,.1,.05,.02,.01,.005];
const vpd_=[ 2,1.9,1.8,1.7,1.6,1.5,1.4,1.3,1.2,1.1, 1, 0.95,0.9,0.85,0.8,0.75,0.7,0.65,0.6,0.55,0.5];
const scale=["1","10","100","1000",".0001",".001",".01",".1"];
var findState="off", findValue, powerState="off", powerValue;
const a_monitor=["CH1","CH2","1-2","Mode","Off"];
var mmx=[], mmy=[]; // Menomano (LaLinea) buffer data
var menomano=[-325,434,-294,438,-268,436,-238,436,-211,434,-189,435,-167,435,-142,434,-117,434,-87,436,-62,436,-44,436,-15,436,8,436,21,390,24,352,27,323,26,291,25,253,15,221,3,192,-9,170,-28,139,-47,120,-72,93,-84,75,-108,56,-123,43,-144,22,-168,5,-188,-13,-204,-29,-227,-29,-247,-34,-262,-46,-281,-38,-288,-31,-295,-43,-292,-57,-276,-66,-260,-71,-241,-76,-226,-76,-213,-72,-202,-84,-185,-87,-167,-86,-158,-74,-160,-67,-169,-71,-181,-67,-174,-58,-180,-37,-151,-18,-134,-7,-119,6,-100,21,-83,33,-54,58,-69,35,-64,4,-48,-17,-29,-33,-5,-45,21,-52,48,-55,78,-51,100,-41,105,-30,104,-16,91,-4,72,1,38,1,63,9,74,17,70,20,47,21,20,17,6,13,-4,5,2,33,29,39,47,39,78,46,91,46,89,67,114,48,127,33,144,18,162,0,177,-14,197,-29,211,-44,219,-51,207,-60,210,-65,216,-73,199,-82,210,-94,227,-95,244,-86,254,-77,261,-85,287,-91,309,-83,323,-77,337,-63,338,-42,303,-55,280,-48,259,-43,245,-42,222,-16,200,9,180,30,162,51,140,70,117,95,140,137,144,165,148,195,151,232,152,270,150,302,147,334,140,374,135,412,131,435,166,433,203,435,233,434,262,437,295,434,323,433,346,434,368,433];
var ret, yResult; // for different return results
const morseText="la linea scopetester rulez";
const morseTime=7; // ticks in buffer
var morse=[];
var k_mode, a_mode=[];
var b_fft, k_fftx, k_ffty;
var mq=[0,0], mqi=[0,0]; // monitor q and qi for channels
var b_readout;
const ROXSIG=100, ROXVOLTS=300, ROYSIG=[20,436], ROXTB=400, ROYTB=436;
const ROXDB=500, ROYDB=436, ROXDLY=400, ROYDLY=20;
var NaNerror; // jump loops if NaN error happens for easier testing
var b_debug, b_reset, b_presets=[];
var b_cursor, k_cursor, xCur;

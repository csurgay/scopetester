const credit="2in1 OSCILLOSCOPE   CSURGAY@GMAIL.COM   Ver.0.44";
const dB="t, 04, 2027";
const bgcolor="#bbbbbb";
const shadowcolor="rgba(70,70,70,0.3)";
const hl_green="rgba(80,160,80,0.35)"; // knob and label highlight
const hl_gray="rgba(100,100,100,0.35)";
const hl_white="rgba(255,255,255,0.35)";
const hl_plastic="rgba(110,110,70,0.45)";var canvas, ctx, debugcanvas, debugctx, logWindow, traceString="", now;
const dA="Oc";
var scope, siggen, presetManager; // global objects
var no_images_to_load, vfdred, vfd, vfd_, led_on_powers, led_on, led_off_powers, led_off, led_red; // canvas images
const L=2048, L2=L/2, L4=L/4, L8=L/8; // buffer length
const DL=500; // Display length
var DL1, DL2; // from-to at slow sweep
const A = 127; // default amplitude (on integer scale, A -> 1.0)
const FFTN=2048;
const f=new FFT(FFTN); // buffer for FFT spectrum data
var fftIn=new Array(FFTN).fill(0), fftOut=new Array(FFTN).fill(0);
var q, volts=[0,0]; // not sure yet, q=timebase*L/512
var buttons=[]; // all buttons for switch off at poweroff (except PushButtons)

var bufgen=[]; // for BufferGenerators

var sch=[new Array(L),new Array(L)]; // signal sample channel buffer, no freq
var schlen=[0,0]; // length of signal buffer data for lower frequencies
var schdisc=[0,0]; // signal buffer discontinuity threshold
var gench=[new Array(L),new Array(L)]; // generated signal channel buffer
var micch=[new Array(L),new Array(L)]; // mic channel buffer
var dispch=[new Array(L), new Array(L)]; // display channel buffer
var pixelch=[[new Array(L), new Array(L)],[new Array(L), new Array(L)]]; // actual pixel channel buffer x,y

var order, ampl, freq, ampls=[0,0], ampls_=[0,0], avgs=[0,0];
var scales=[0,0], freqs=[0,0], freqs_=[0,0], phases=[0,0], dcs=[0,0], dcs_=[0,0];
var uictx=[], uidebugctx=[]; // for hit, click, turn

var lastPreset=0;
const dVfd=16, dButton=20;
const tb=[ 5000,2000,1000,500,200,100,50,20,10,5,2, 1, .5,.2,.1,.05,.02,.01,.005,.002,.001,.0005,.0002,.0001];
const tb_=[ 2,1.9,1.8,1.7,1.6,1.5,1.4,1.3,1.2,1.1, 1, 0.95,0.9,0.85,0.8,0.75,0.7,0.65,0.6,0.55,0.5];
const vpd=[ .002,.001,50,20,10,5,2, 1, .5,.2,.1,.05,.02,.01,.005];
const vpd_=[ 2,1.9,1.8,1.7,1.6,1.5,1.4,1.3,1.2,1.1, 1, 0.95,0.9,0.85,0.8,0.75,0.7,0.65,0.6,0.55,0.5];
const scale=["1","10","100","1000",".0001",".001",".01",".1"];
var findState="off", findValue, powerState="off", powerValue;
const a_monitor=["CH1","CH2","1-2","Math","Off"];
var mmx=[], mmy=[]; // Menomano (LaLinea) buffer data
var menomano=[-325,434,-294,438,-268,436,-238,436,-211,434,-189,435,-167,435,-142,434,-117,434,-87,436,-62,436,-44,436,-15,436,8,436,21,390,24,352,27,323,26,291,25,253,15,221,3,192,-9,170,-28,139,-47,120,-72,93,-84,75,-108,56,-123,43,-144,22,-168,5,-188,-13,-204,-29,-227,-29,-247,-34,-262,-46,-281,-38,-288,-31,-295,-43,-292,-57,-276,-66,-260,-71,-241,-76,-226,-76,-213,-72,-202,-84,-185,-87,-167,-86,-158,-74,-160,-67,-169,-71,-181,-67,-174,-58,-180,-37,-151,-18,-134,-7,-119,6,-100,21,-83,33,-54,58,-69,35,-64,4,-48,-17,-29,-33,-5,-45,21,-52,48,-55,78,-51,100,-41,105,-30,104,-16,91,-4,72,1,38,1,63,9,74,17,70,20,47,21,20,17,6,13,-4,5,2,33,29,39,47,39,78,46,91,46,89,67,114,48,127,33,144,18,162,0,177,-14,197,-29,211,-44,219,-51,207,-60,210,-65,216,-73,199,-82,210,-94,227,-95,244,-86,254,-77,261,-85,287,-91,309,-83,323,-77,337,-63,338,-42,303,-55,280,-48,259,-43,245,-42,222,-16,200,9,180,30,162,51,140,70,117,95,140,137,144,165,148,195,151,232,152,270,150,302,147,334,140,374,135,412,131,435,166,433,203,435,233,434,262,437,295,434,323,433,346,434,368,433];
var kbx=[], kby=[]; // Korosi Borze (Korosi) buffer data
var korosi=[90, 62, 88, 138, 90, 98, 123, 66, 90, 101, 127, 133, 147, 134, 137, 100, 147, 66, 176, 67, 182, 99, 177, 133, 148, 134, 138, 102, 148, 67, 156, 67, 150, 57, 159, 56, 156, 67, 168, 67, 163, 58, 172, 58, 169, 66, 176, 70, 182, 100, 176, 133, 203, 133, 199, 67, 227, 68, 235, 84, 229, 97, 202, 101, 218, 101, 237, 131, 259, 130, 248, 98, 257, 68, 265, 68, 260, 59, 268, 59, 266, 68, 277, 69, 274, 61, 281, 60, 278, 70, 285, 69, 291, 97, 285, 129, 260, 130, 287, 129, 329, 127, 339, 108, 329, 96, 307, 97, 301, 82, 309, 68, 332, 68, 356, 69, 352, 63, 361, 63, 357, 69, 360, 127, 358, 70, 310, 67, 301, 83, 308, 98, 330, 97, 340, 110, 330, 129, 239, 131, 218, 101, 202, 102, 204, 132, 129, 134, 92, 102, 91, 63];
var ret, yResult; // for different return results
var mq=[0,0], mqi=[0,0]; // monitor q and qi for channels
const ROXSIG=100, ROXVOLTS=300, ROYSIG=[15,431], ROXTB=400, ROYTB=431;
const ROXDB=500, ROYDB=431, ROXDLY=400, ROYDLY=15;
var NaNerror; // jump loops if NaN error happens for easier testing
var b_debug, b_reset, b_calib, b_frames, b_autotest, b_presets=[];
var k_cursor, xCur;
var k_skew, b_traceFastBeam;
var grd; // aux variable for grad on Canvas, multiple use
var b_sch, b_gench, b_micch, b_dispch, b_pixelch, debug_channel; 

const letters={ " ":[], 
	",":[2,10,2,8, 3,10,3,8, 4,10,4,8, 3,10,1,12,4,10,1,13], 
	".":[2,10,2,8, 3,10,3,8, 4,10,4,8], "'":[3,0,3,2],
	"<":[4,0,1,4,1,4,4,8], ">":[1,0,5,4,5,4,1,8], 
	"(":[4,0,1,4,1,4,4,8], ")":[1,0,5,4,5,4,1,8], 
	":":[2,10,2,9,3,10,3,9,2,4,2,3,3,4,3,3], "+":[1,5,5,5,3,3,3,7],
	"/":[5,2,0,7], "-":[1,5,5,5], "|":[3,0,3,12], "!":[3,0,3,7, 3,9,3,10],
	"%":[1,2,0,3,0,3,1,4,1,4,2,3,2,3,1,2,5,8,4,9,4,9,5,10,5,10,6,9,6,9,5,8,0,9,6,3],
	"c":[6,5,5,4,5,4,1,4,1,4,0,5,0,5,0,9,0,9,1,10,1,10,5,10,5,10,6,9],
	"e":[2,7,6,7,6,7,6,5,6,5,5,4,5,4,1,4,1,4,0,5,0,5,0,9,0,9,1,10,1,10,5,10],
	"k":[0,0,0,10,6,4,0,8,2,7,6,10],
	"m":[0,10,0,4,0,5,1,4,1,4,2,4,2,4,3,5,3,5,3,10,3,5,4,4,4,4,5,4,5,4,6,5,6,5,6,10],
	"n":[0,10,0,4,0,6,2,4,2,4,5,4,5,4,6,5,6,5,6,10],
	"s":[6,4,1,4,1,4,0,5,0,5,0,6,0,6,1,7,1,7,5,7,5,7,6,8,6,8,6,9,6,9,5,10,5,10,0,10],
	"u":[0,12,2,10,1,4,1,9,1,9,2,10,2,10,4,10,4,10,5,9,5,9,5,4,5,9,6,10],
	"z":[0,4,6,4,6,4,0,10,0,10,6,10],
	"0":[0,1,1,0,1,0,5,0,5,0,6,1,6,1,6,9,6,9,5,10,5,10,1,10,1,10,0,9,0,9,0,1,5,1,0,8],
	"1":[2,2,4,0,4,0,4,10,2,10,6,10,], 
	"2":[0,2,2,0,2,0,4,0,4,0,6,2,6,2,6,4,6,4,0,8,0,8,0,10,0,10,6,10,], 
	"3":[0,2,0,1,0,1,1,0,1,0,5,0,5,0,6,1,6,1,6,4,6,4,5,5,5,5,3,5,5,5,6,6,6,6,6,9,6,9,5,10,5,10,1,10,1,10,0,9,0,9,0,8],
	"4":[6,10,6,0,6,0,0,6,0,6,0,8,0,8,6,8],
	"5":[6,0,0,0,0,0,0,4,0,4,5,4,5,4,6,5,6,5,6,8,6,8,4,10,4,10,1,10,1,10,0,9],
	"6":[5,0,3,0,3,0,0,3,0,4,5,4,5,4,6,5,6,5,6,8,6,8,4,10,4,10,2,10,2,10,0,8,0,8,0,3],
	"7":[0,0,6,0,6,0,6,2,6,2,2,6,2,6,2,10],
	"8":[0,1,1,0,1,0,5,0,5,0,6,1,6,1,6,3,6,3,5,4,5,4,1,4,1,4,0,3,0,3,0,1,5,4,6,6,6,6,6,9,6,9,5,10,5,10,1,10,1,10,0,9,0,9,0,6,0,6,1,4],
	"9":[0,2,2,0,2,0,5,0,5,0,6,1,6,1,6,7,6,7,3,10,3,10,0,10,0,2,0,3,0,3,1,4,1,4,6,4],
	"A":[0,10,0,2,0,2,2,0,2,0,4,0,4,0,6,2,6,2,6,10,0,6,6,6,], 
	"B":[0,10,0,0,0,0,4,0,4,0,6,2,6,2,4,4,4,4,0,4,4,4,6,6,6,6,6,8,6,8,4,10,4,10,0,10,], 
	"C":[6,2,4,0,4,0,2,0,2,0,0,2,0,2,0,8,0,8,2,10,2,10,4,10,4,10,6,8,], 
	"D":[0,10,0,0,0,0,4,0,4,0,6,2,6,2,6,8,6,8,4,10,4,10,2,10,], 
	"E":[6,0,0,0,0,0,0,10,0,10,6,10,0,4,4,4,], 
	"F":[6,0,0,0,0,0,0,10,0,4,4,4,], 
	"G":[6,2,4,0,4,0,2,0,2,0,0,2,0,2,0,8,0,8,2,10,2,10,4,10,4,10,6,8,6,8,6,6,6,6,4,6,], 
	"H":[0,0,0,10,6,0,6,10,0,4,6,4,], 
	"I":[0,0,4,0,2,0,2,10,0,10,4,10,], 
	"J":[6,0,6,8,6,8,4,10,4,10,2,10,2,10,0,8,0,8,0,6,], 
	"K":[0,0,0,10,6,0,0,6,0,4,6,10,], 
	"L":[0,0,0,10,0,10,6,10,], 
	"M":[0,10,0,0,0,0,3,4,3,4,6,0,6,0,6,10,], 
	"N":[0,10,0,0,0,2,6,8,6,10,6,0,], 
	"O":[0,2,2,0,2,0,4,0,4,0,6,2,6,2,6,8,6,8,4,10,4,10,2,10,2,10,0,8,0,8,0,2,], 
	"P":[0,10,0,0,0,0,4,0,4,0,6,2,6,2,4,4,4,4,0,4,], 
	"Q":[0,2,2,0,2,0,4,0,4,0,6,2,6,2,6,8,6,8,4,10,4,10,2,10,2,10,0,8,0,8,0,2,4,8,6,10,], 
	"R":[0,10,0,0,0,0,4,0,4,0,6,2,6,2,4,4,4,4,0,4,0,4,6,10,], 
	"S":[6,1,4,0,4,0,2,0,2,0,0,1,0,1,0,3,0,3,6,5,6,5,6,8,6,8,4,10,4,10,2,10,2,10,0,8], 
	"T":[0,0,6,0,3,0,3,10,], 
	"U":[0,0,0,8,0,8,2,10,2,10,4,10,4,10,6,8,6,8,6,0,], 
	"V":[0,0,0,6,0,6,3,10,3,10,6,6,6,6,6,0,], 
	"W":[0,0,0,6,0,6,2,10,2,10,4,6,4,6,6,10,6,10,8,6,8,6,8,0,], 
	"X":[0,0,0,2,0,2,6,8,6,8,6,10,6,0,6,2,6,2,0,8,0,8,0,10,], 
	"Y":[0,0,0,2,0,2,3,6,3,6,6,2,6,2,6,0,3,6,3,10,], 
	"Z":[0,0,6,0,6,0,6,2,6,2,0,8,0,8,0,10,0,10,6,10,],  
};
const imprint=`
2IN1 OSZCILLOSZKOP ES JELGENERATOR, SZKOPTESZTER
--------------------------------------------------
OSZCILLOSZKOP KEZELESENEK GYAKORLASA
PERIODIKUS JELEK GENERALASA
HANGFREKVENCIAS ALAP ES MODULALT JELEK MEGHALLGATASA
IGAZI SZKOP TESZTELESE A GENERALT ABRAKKAL
HALADO SZKOPFUNKCIOK MEGISMERESE
MIKROFON BEMENET MEGJELENITESE
DEMO JELEK: PRESET GOMB
--------------------------------------------------
CHROME, FIREFOX, ANDROID, OPERA, EDGE, IOS
--------------------------------------------------
TEKEROK: EGER GORGO VAGY KLIKK+DRAG(FEL/LE)
DUPLA TEKEROK: KET RESZ KULON
SZIMPLA KLIKK: TEKERO ALAPHELYZETBE
HOSSZU KLIKK: PULL
--------------------------------------------------
MIKROFON BEMENET, KETCSATORNAS JELGENERATOR
16 PARAMETERES FUGGVENY: GAUSS, PULSE, SINC, ECG, NTSC, MORSE
MODULACIO, SZTEREO KIMENET, AMIVEL IGAZI SCOPE IS TESZTELHETO!
ALT/CHOP MODE, XY LISSAJOUS, FFT SPECTRUM ANALYZER
TRIGGER, DELAY, READOUT, CURSOR
ANIMATED PRESETS, VFD DISPLAYS, AND MANY MORE...
`;
var imprintState="idle"; // running, completing, scanning, idle
var imprintY; // scrolling imprint position
const imprintStart=400, imprintEnd=20; // imprint start end positions
var imprintTimer; // timer handler
var imprintHlPtr; // imprint highlight pointer

var _datab = new ArrayBuffer(0x10000 * 20);
var memory = new Uint8Array(_datab, 0, 0x10000 * 20);
var memorys = new Int8Array(_datab, 0, 0x10000 * 20);

//var _video = new Uint8Array(0x12000);

var _stackb = new ArrayBuffer(0x100 * 2);
var _stack = new Uint16Array(_stackb, 0, 0x100);
var _stacks = new Int16Array(_stackb, 0, 0x100);

var r0 = new ArrayBuffer(16);
var r16 = new Uint16Array(r0, 0, 8);
var r16s = new Int16Array(r0, 0, 8);
var r8 = new Uint8Array(r0, 0, 16);
var r8s = new Int8Array(r0, 0, 16);


flags = { carry: 0, direction: 0, zero: 0 };
var _seg000 = 0x1000 - 0x1000;
var _seg001 = 0x1f29 - 0x1000;
var _seg002 = 0x24b9 - 0x1000;
var _seg003 = 0x2565 - 0x1000;
var _dseg = 0x2853 - 0x1000;
var _seg005 = 0x3824 - 0x1000;
var _seg006 = 0x447b - 0x1000;
var _seg007 = 0x449b - 0x1000;
var _seg008 = 0x5489 - 0x1000;
var _seg009 = 0x63d0 - 0x1000;
var _seg010 = 0x7218 - 0x1000;

var dseg = _dseg;
var _ss = _seg006;

var data = Module['xenon2.data'];
for (var i = 0; i < data.length; i++)
  memory[0x1000 * 0 + i] = data[i];
ds = _seg001;
EGA.init();


var can = document.getElementById("canvas");
var ctx = can.getContext('2d');
can.width = 320;
can.height = 200;
var data = ctx.createImageData(can.width, can.height);

var inShop = false;
var isInvincible = false;
let query = new URLSearchParams(window.location.search);
if (query.has("i")) {
  isInvincible = true;
}

function display() {
  var p = 0;
  var pixels = data.data;
  for (var y = 0; y < 200; y++)
    for (var x = 0; x < 320; x++) {

      var c = EGA.getPixel(x, y);
      /*
                var _video = 0x2000*16;
                var mask = 0x80 >> (x % 8);

                var off = 0x800;
                var shift = y  + Math.floor(x / 8)*180;
                var b = 0;
                if ( memory[_video + shift + off*0] & mask ) b |= 1;
                if ( memory[_video +shift + off*1] & mask ) b |= 2;
                if ( memory[_video +shift + off*2] & mask ) b |= 4;
                if ( memory[_video +shift + off*3] & mask ) b |= 8;

                //mSdl.SetPixel(x+320, y, mVideo.palette[b]);
                var c = EGA.palette[b];
      */

      pixels[p++] = c >> 16;
      pixels[p++] = (c >> 8) & 0xff;
      pixels[p++] = c & 0xff;
      pixels[p++] = 255;
    }
  ctx.putImageData(data, 0, 0);
}

var _iter = 0;

function* _sync(k) {
  yield 0;
}

var sequence = start();
//sequence.next();
//function run()

{
  setInterval(() => {
    if (mousePos) {
      var shx = memory16get(_dseg * 16 + 40704 + 18); // 0x9f12
      var shy = memory16get(_dseg * 16 + 40704 + 22) + 15; // 0x9f16
      if (inShop) {
        if (mousePos.x >= can.width / 4 && mousePos.x <= 3 * can.width / 4 && mousePos.y <= can.height / 4) {
          memory[_dseg * 16 + 0x8f59] |= 1; // up
        } else if (mousePos.x >= can.width / 4 && mousePos.x <= 3 * can.width / 4 && mousePos.y >= 3 * can.height / 4) {
          memory[_dseg * 16 + 0x8f59] |= 2; // down
        }
        if (mousePos.y >= can.height / 4 && mousePos.y <= 3 * can.height / 4 && mousePos.x <= can.width / 4) {
          memory[_dseg * 16 + 0x8f59] |= 4; // left
        } else if (mousePos.y >= can.height / 4 && mousePos.y <= 3 * can.height / 4 && mousePos.x >= 3 * can.width / 4) {
          memory[_dseg * 16 + 0x8f59] |= 8; // right
        } else if (mousePos.x >= can.width / 4 && mousePos.x <= 3 * can.width &&
          mousePos.y >= can.height / 4 && mousePos.y <= 3 * can.height / 4) {
          space(); // space
        }
        mousePos = null;
      } else {
        if (shx !== 0 || shy !== 0) {
          if (mousePos.x < shx - 10)
            memory[_dseg * 16 + 0x8f59] |= 4; // left
          else if (mousePos.x > shx + 10)
            memory[_dseg * 16 + 0x8f59] |= 8; // right
          else
            memory[_dseg * 16 + 0x8f59] &= ~(4 | 8);

          if (mousePos.y < shy - 10)
            memory[_dseg * 16 + 0x8f59] |= 1; // up
          else if (mousePos.y > shy + 10)
            memory[_dseg * 16 + 0x8f59] |= 2; // down
          else
            memory[_dseg * 16 + 0x8f59] &= ~(1 | 2);
        }
      }
    }
    sequence.next();
    display();
  }, 50);

  setInterval(() => {
    if (mousePos && !inShop) {
      space(); // auto fire on touch/mobile
    }
  }, 200);
}

var _k = 0;
var mousePos = null;

function space() {
  if (!(memory[_dseg * 16 + 0x8f59] & 0x80)) {
    memory[_dseg * 16 + 0x8F5B] = 0xff;
  }
}

window.onPress = (p) => {
  mousePos = p;
  if (!inShop) {
    space();
  }
}

window.onRelease = (p) => {
  mousePos = null;
  memory[_dseg * 16 + 0x8f59] = 0;
}

window.onMove = (p) => {
  if (mousePos)
    mousePos = p;
}
//{
// display();
//  if (_iter++ > 1)
//    throw new Error("Something went badly wrong!");
//}

function assert(x) {
  if (!x) {
    console.log("STOP: Assertion failed");
  }
}

document.onkeydown = function (evt) {
  evt = evt || window.event;
  switch (evt.keyCode) {
    case 65:
      memory[_dseg * 16 + 0x9191] -= 0x1;
      break;
    case 38:
      _k |= 1;
      break; // up
    case 40:
      _k |= 2;
      break; // down
    case 37:
      _k |= 4;
      break; // left
    case 39:
      _k |= 8;
      break;// right
    case 32:
      _k |= 0x80;
      space();
      break; // space
  }
  memory[_dseg * 16 + 0x8f59] = _k;
}
document.onkeyup = function (evt) {
  evt = evt || window.event;
  switch (evt.keyCode) {
    case 38:
      _k &= ~1;
      break; // up
    case 40:
      _k &= ~2;
      break; // down
    case 37:
      _k &= ~4;
      break; // left
    case 39:
      _k &= ~8;
      break; // right
    case 32:
      _k &= ~0x80;
      break; // space
  }
  memory[_dseg * 16 + 0x8f59] = _k;
}


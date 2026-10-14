# After Effects expressions

Paste these into a property's expression field (Alt/Option-click the stopwatch). They use the JavaScript expression engine, the default since AE 16. Every value comes from `motion.json`.

## Brand easing without keyframes

Paste the function once at the top of the expression, then use it. It solves the CSS cubic-bezier exactly.

```js
function cb(x1, y1, x2, y2, x) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  var lo = 0, hi = 1, t = x;
  for (var i = 0; i < 24; i++) {
    t = (lo + hi) / 2;
    var cx = 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t;
    if (cx < x) lo = t; else hi = t;
  }
  return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t;
}
// Curves: ease-out-strong cb(0.23,1,0.32,1,p)  ease-reveal cb(0.16,1,0.3,1,p)
//         ease-in-out-strong cb(0.77,0,0.175,1,p)  ease-soft-out cb(0.25,0.46,0.45,0.94,p)
```

### Rise and settle (Position)

Starts at the layer's in-point. Stagger a stack of layers with `index` and they cascade 80ms apart.

```js
function cb(x1,y1,x2,y2,x){if(x<=0)return 0;if(x>=1)return 1;var lo=0,hi=1,t=x;for(var i=0;i<24;i++){t=(lo+hi)/2;var cx=3*x1*t*(1-t)*(1-t)+3*x2*t*t*(1-t)+t*t*t;if(cx<x)lo=t;else hi=t}return 3*y1*t*(1-t)*(1-t)+3*y2*t*t*(1-t)+t*t*t}
dist = 40;        // px of travel. The site uses 24px; 40px reads the same on a 1080 post
dur = 1.1;        // seconds (1.3 for a headline block or final call to action)
stagger = 0.08;   // seconds between layers
delay = (index - 1) * stagger;
p = cb(0.16, 1, 0.3, 1, (time - inPoint - delay) / dur);
value + [0, dist * (1 - p)];
```

### Fade to match (Opacity)

```js
function cb(x1,y1,x2,y2,x){if(x<=0)return 0;if(x>=1)return 1;var lo=0,hi=1,t=x;for(var i=0;i<24;i++){t=(lo+hi)/2;var cx=3*x1*t*(1-t)*(1-t)+3*x2*t*t*(1-t)+t*t*t;if(cx<x)lo=t;else hi=t}return 3*y1*t*(1-t)*(1-t)+3*y2*t*t*(1-t)+t*t*t}
dur = 1.1; stagger = 0.08;
delay = (index - 1) * stagger;
value * cb(0.16, 1, 0.3, 1, (time - inPoint - delay) / dur);
```

### Image settle (Scale), for imagery inside a mask or track matte

```js
function cb(x1,y1,x2,y2,x){if(x<=0)return 0;if(x>=1)return 1;var lo=0,hi=1,t=x;for(var i=0;i<24;i++){t=(lo+hi)/2;var cx=3*x1*t*(1-t)*(1-t)+3*x2*t*t*(1-t)+t*t*t;if(cx<x)lo=t;else hi=t}return 3*y1*t*(1-t)*(1-t)+3*y2*t*t*(1-t)+t*t*t}
p = cb(0.16, 1, 0.3, 1, (time - inPoint) / 1.8);
s = 114 - 14 * p;
[value[0] * s / 100, value[1] * s / 100];
```

## Count-up (Source Text)

The site's counter is an overdamped spring: it never overshoots and lands at about 2.1 s. Put this on a text layer; it starts at the layer's in-point.

```js
target = 40;      // final number
prefix = "+";     // e.g. "$" or ""
suffix = "%";     // e.g. "x", "%" or ""
decimals = 0;
t = Math.max(0, time - inPoint);
r1 = -1.435; r2 = -43.565;   // spring: mass 1, stiffness 62.5, damping 45
p = 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
n = (target * p).toFixed(decimals);
n = n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
prefix + n + suffix;
```

## Coin

### Float (Position) on a still or an unfloated sequence

Skip this if you rendered the PNG sequence with Float on.

```js
loop = 6;                          // seconds per loop (one float per loop)
radius = thisLayer.width * thisLayer.scale[0] / 100 * 0.36;  // the coin fills 72% of the frame
value - [0, Math.sin(time / loop * 2 * Math.PI) * radius * 0.052];
```

### Turn a 3D coin layer (Y Rotation), for Element 3D, Cinema 4D or a card flip

```js
time / 6 * 360;    // one linear turn every 6 seconds
```

### Loop a PNG sequence turn (Time Remap)

Enable Time Remapping on the sequence layer, then:

```js
loopOut("cycle");
```

## Shine sweep

Build it as: the accent line in navy, a copy above it in sky, and a soft white band (a rectangle rotated 110 degrees, feather about 40% of its width) used as the copy's Alpha Matte. Put this on the band's Position:

```js
pass = 2.8;   // seconds to cross
rest = 4.0;   // seconds between passes
startX = -300; endX = thisComp.width + 300;   // fully outside the text on both sides
t = (time - inPoint) % (pass + rest);
x = linear(t, 0, pass, startX, endX);
[x, value[1]];
```

## Counter roll (01 / 07)

Each number is its own layer, masked to its line. On the incoming number's Position (ease-out-strong, 420ms):

```js
function cb(x1,y1,x2,y2,x){if(x<=0)return 0;if(x>=1)return 1;var lo=0,hi=1,t=x;for(var i=0;i<24;i++){t=(lo+hi)/2;var cx=3*x1*t*(1-t)*(1-t)+3*x2*t*t*(1-t)+t*t*t;if(cx<x)lo=t;else hi=t}return 3*y1*t*(1-t)*(1-t)+3*y2*t*t*(1-t)+t*t*t}
h = 24;  // line height in px
value + [0, h * (1 - cb(0.23, 1, 0.32, 1, (time - inPoint) / 0.42))];
```

## Slow drift for glass imagery and textures (Scale)

```js
s = linear(time, inPoint, outPoint, 100, 104);
[s, s];
```

## Keyframe values instead of expressions

If you prefer keyframes, select both keyframes, open Keyframe Velocity (Cmd/Ctrl+Shift+K) and type the values below. Speed = factor × (change ÷ duration). For example, a 40px rise over 1.1 s with ease-reveal: 6.25 × 40 ÷ 1.1 = 227 px/s.

| Curve | First keyframe, outgoing | Last keyframe, incoming |
| --- | --- | --- |
| ease-out-strong (0.23, 1, 0.32, 1) | influence 23%, speed 4.35 × avg | influence 68%, speed 0 |
| ease-reveal (0.16, 1, 0.3, 1) | influence 16%, speed 6.25 × avg | influence 70%, speed 0 |
| ease-in-out-strong (0.77, 0, 0.175, 1) | influence 77%, speed 0 | influence 82.5%, speed 0 |
| ease-soft-out (0.25, 0.46, 0.45, 0.94) | influence 25%, speed 1.84 × avg | influence 55%, speed 0.11 × avg |
| smoothstep (1/3, 0, 2/3, 1) | influence 33.3%, speed 0 | influence 33.3%, speed 0 |

Plugins such as Flow, Ease Copy and Motion Tools Pro take the bezier numbers directly.

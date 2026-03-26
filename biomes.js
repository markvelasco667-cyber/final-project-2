// =============================================================
// CRAFTRIGHT — biomes.js  v3  (Enhanced Pixel-Art Scenes)
// 12 detailed Minecraft biomes with characters + atmosphere
// =============================================================
(function () {

  let canvas, ctx, animFrame, activeScene = null, startTime = null;
  const PIXEL = 3;

  function init() {
    canvas = document.getElementById("biome-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "biome-canvas";
      canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;image-rendering:pixelated";
      document.body.prepend(canvas);
    }
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
  }

  function resize() {
    if (!canvas) return;
    canvas.width  = Math.ceil(window.innerWidth  / PIXEL) * PIXEL;
    canvas.height = Math.ceil(window.innerHeight / PIXEL) * PIXEL;
  }

  const W = () => Math.floor(canvas.width  / PIXEL);
  const H = () => Math.floor(canvas.height / PIXEL);

  function px(x, y, c) {
    ctx.fillStyle = c;
    ctx.fillRect(~~x * PIXEL, ~~y * PIXEL, PIXEL, PIXEL);
  }
  function rect(x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(~~x * PIXEL, ~~y * PIXEL, ~~w * PIXEL, ~~h * PIXEL);
  }
  function radial(cx, cy, r, c1, c2) {
    const g = ctx.createRadialGradient(cx*PIXEL, cy*PIXEL, 0, cx*PIXEL, cy*PIXEL, r*PIXEL);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  function gradV(stops) {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    stops.forEach(([s, c]) => g.addColorStop(s, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  function rnd(seed, max) {
    return Math.floor((Math.abs(Math.sin(seed + 1) * 43758.5453)) % 1 * max);
  }
  function pax(t, s, r) { return Math.sin(t * s) * r; }

  // ── Shared drawing helpers ───────────────────────────────────
  function stars(t, count, alpha) {
    const cw = W(), ch = H();
    for (let i = 0; i < count; i++) {
      const sx = rnd(i*31+7, cw), sy = rnd(i*17+3, Math.floor(ch*0.55));
      const tw = (0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i * 2.1))) * alpha;
      px(sx, sy, `rgba(255,255,220,${tw.toFixed(2)})`);
    }
  }

  function moon(x, y, sz, col) {
    for (let dy = -sz; dy <= sz; dy++)
      for (let dx = -sz; dx <= sz; dx++)
        if (dx*dx + dy*dy <= sz*sz) px(x+dx, y+dy, col);
    px(x+2, y-1, "rgba(0,0,0,0.15)"); px(x-2, y+2, "rgba(0,0,0,0.1)");
  }

  function sun(x, y, sz, t) {
    const p = sz + Math.sin(t * 0.6) * 0.4;
    for (let dy = -Math.ceil(p); dy <= Math.ceil(p); dy++)
      for (let dx = -Math.ceil(p); dx <= Math.ceil(p); dx++)
        if (dx*dx+dy*dy <= p*p) px(x+dx, y+dy, "#FFD700");
    ctx.save();
    const g = ctx.createRadialGradient(x*PIXEL,y*PIXEL,p*PIXEL,x*PIXEL,y*PIXEL,(p+8)*PIXEL);
    g.addColorStop(0,"rgba(255,220,80,0.25)"); g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
  }

  function campfire(cx, cy, t) {
    const f1 = Math.sin(t*9)*0.5+0.5, f2 = Math.sin(t*13+1)*0.5+0.5;
    rect(cx-3, cy+1, 6, 2, "#5D4037"); rect(cx-2, cy+2, 4, 1, "#4E342E");
    ctx.save();
    const eg = ctx.createRadialGradient(cx*PIXEL,(cy+1)*PIXEL,0,cx*PIXEL,(cy+1)*PIXEL,9*PIXEL);
    eg.addColorStop(0,`rgba(255,140,0,${0.3+f1*0.18})`); eg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=eg; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
    const FC=["#FF4500","#FF6F00","#FF8F00","#FFA000","#FFB300","#FFCA28","#FFF176"];
    for (let l=0;l<3;l++) {
      const fh=4+l+~~(f1*2), fw=3-l, col=FC[l*2+~~f2];
      for (let dy=0;dy<fh;dy++) {
        const w=Math.max(1,fw-~~(dy*0.5));
        for (let dx=-w;dx<=w;dx++) px(cx+dx+(l-1),cy-dy,col);
      }
    }
    for (let i=0;i<5;i++) {
      const age=(t*1.5+i*1.4)%3;
      if (age<2) px(cx+~~(Math.sin(t*3+i*2)*3),cy-6-~~(age*4),"#FFCA28");
    }
  }

  function fireLight(cx, cy, r, t) {
    ctx.save();
    const g = ctx.createRadialGradient(cx*PIXEL,cy*PIXEL,0,cx*PIXEL,cy*PIXEL,r*PIXEL);
    const f = 0.16+Math.sin(t*7)*0.05;
    g.addColorStop(0,`rgba(255,160,30,${f})`);
    g.addColorStop(0.4,`rgba(255,100,0,${f*0.4})`);
    g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
  }

  function vignette(str) {
    ctx.save();
    const g = ctx.createRadialGradient(canvas.width*.5,canvas.height*.6,0,canvas.width*.5,canvas.height*.55,canvas.width*.75);
    g.addColorStop(0,"rgba(0,0,0,0)"); g.addColorStop(1,`rgba(0,0,10,${str})`);
    ctx.fillStyle=g; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
  }

  function hills(ox, gy, col, amp, freq) {
    const cw=W(); ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(0,canvas.height);
    for (let x=0;x<=cw;x++) {
      const y=gy+Math.sin((x+ox)*freq)*amp+Math.sin((x+ox)*freq*1.9)*amp*0.3;
      ctx.lineTo(x*PIXEL, y*PIXEL);
    }
    ctx.lineTo(canvas.width,canvas.height); ctx.closePath(); ctx.fill();
  }

  function oak(x, gy, s, dk, lt, tr) {
    rect(x-s,gy-s*4,s*2,s*4,tr||"#5D4037");
    rect(x-s*3,gy-s*7,s*6,s*4,dk); rect(x-s*2,gy-s*9,s*4,s*3,lt);
    rect(x-s,gy-s*10,s*2,s*2,lt);
  }

  function pine(x, gy, s, c1, c2) {
    rect(x-1,gy-s*2,2,s*2,"#5D4037");
    for (let i=0;i<4;i++) { const w=(4-i)*s; rect(x-w,gy-s*(3+i*2),w*2,s*2,i%2===0?c1:c2); }
  }

  // ── Minecraft Characters ─────────────────────────────────────

  function drawSteve(x, y, t) {
    const bob = Math.sin(t*0.8)*0.5;
    rect(x-2,y+4,2,4,"#5B8FD0"); rect(x,y+4,2,4,"#4A7CC0");
    rect(x-3,y+~~bob,6,5,"#6B8CFF");
    rect(x-5,y+1+~~bob,2,4,"#C68642"); rect(x+3,y+1+~~bob,2,4,"#C68642");
    rect(x-3,y-4+~~bob,6,5,"#C68642");
    px(x-2,y-3+~~bob,"#3a2a1a"); px(x+1,y-3+~~bob,"#3a2a1a");
    rect(x-3,y-4+~~bob,6,1,"#5C3D1E");
  }

  function drawAlex(x, y, t) {
    const bob = Math.sin(t*0.9+1)*0.5;
    rect(x-2,y+4,2,4,"#5B8FD0"); rect(x,y+4,2,4,"#4A7CC0");
    rect(x-3,y+~~bob,6,5,"#5C9E5C");
    rect(x-5,y+1+~~bob,2,4,"#C68642"); rect(x+3,y+1+~~bob,2,4,"#C68642");
    rect(x-3,y-4+~~bob,6,5,"#C68642");
    px(x-2,y-3+~~bob,"#3a2a1a"); px(x+1,y-3+~~bob,"#3a2a1a");
    rect(x-3,y-4+~~bob,6,1,"#8B4513");
    rect(x+2,y-3+~~bob,1,3,"#8B4513");
  }

  function drawZombie(x, y, t) {
    const walk = Math.sin(t*2)*2;
    rect(x-2,y+4,2,4,"#5B8FD0"); rect(x,y+4,2,4,"#4A7CC0");
    rect(x-3,y,6,5,"#4CAF50");
    rect(x-7,y-1+~~(Math.sin(t)*1),4,2,"#4CAF50");
    rect(x+3,y-1+~~(Math.sin(t+0.5)*1),4,2,"#4CAF50");
    rect(x-3,y-5,6,5,"#2E7D32");
    px(x-2,y-4,"#FF0000"); px(x+1,y-4,"#FF0000");
    rect(x-3,y-5,6,1,"#1B5E20");
  }

  function drawCreeper(x, y, t) {
    const pulse = Math.sin(t*1.5)*0.3+0.7;
    rect(x-2,y+2,2,5,"#388E3C"); rect(x,y+2,2,5,"#388E3C");
    rect(x-3,y-3,6,6,`rgba(56,142,60,${pulse})`);
    rect(x-3,y-8,6,6,"#388E3C");
    rect(x-2,y-7,2,2,"#1B5E20"); rect(x,y-7,2,2,"#1B5E20");
    rect(x-1,y-5,2,1,"#1B5E20");
    rect(x-2,y-4,1,2,"#1B5E20"); rect(x+1,y-4,1,2,"#1B5E20");
  }

  function drawSkeleton(x, y, t) {
    const sway = Math.sin(t*0.7)*1;
    rect(x-2,y+4,2,4,"#e0e0e0"); rect(x,y+4,2,4,"#e0e0e0");
    rect(x-2,y,4,4,"#e0e0e0");
    rect(x+2,y+~~sway,1,4,"#e0e0e0");
    rect(x-3,y+~~sway,1,4,"#e0e0e0");
    rect(x-2,y-4,4,4,"#e0e0e0");
    px(x-1,y-3,"#1a1a1a"); px(x+1,y-3,"#1a1a1a");
    rect(x+3,y-2+~~sway,1,5,"#8B6914");
  }

  function drawVillager(x, y, t) {
    const bob = Math.sin(t*0.6)*0.4;
    rect(x-2,y+4,2,4,"#8B6914"); rect(x,y+4,2,4,"#7A5C10");
    rect(x-3,y+~~bob,6,5,"#5C7A3E");
    rect(x-4,y+1+~~bob,1,4,"#C68642"); rect(x+3,y+1+~~bob,1,4,"#C68642");
    rect(x-3,y-4+~~bob,6,5,"#C68642");
    px(x,y-2+~~bob,"#A0522D");
    px(x-2,y-3+~~bob,"#2a1a0a"); px(x+1,y-3+~~bob,"#2a1a0a");
    rect(x-3,y-5+~~bob,6,1,"#4a4a4a"); rect(x-2,y-8+~~bob,4,4,"#4a4a4a");
  }

  function drawEnderman(x, y, t) {
    const sway = Math.sin(t*0.4)*1;
    rect(x-1,y+6,1,6,"#1a1a2a"); rect(x,y+6,1,6,"#1a1a2a");
    rect(x-2,y,4,7,"#1a1a2a");
    rect(x-1,y-1,1,5,"#1a1a2a"); rect(x+2,y-1,1,5,"#1a1a2a");
    rect(x-2,y-5+~~sway,5,5,"#1a1a2a");
    px(x-1,y-4+~~sway,"#AA00FF"); px(x+2,y-4+~~sway,"#AA00FF");
    if (Math.sin(t*3+1)>0.5) px(x+rnd(~~t,4)-2,y-rnd(~~t*3,8),"#7B1FA2");
  }

  function drawSheep(x, y, t) {
    const graze = Math.abs(Math.sin(t*0.5));
    rect(x-4,y+2,8,5,"#e8e8e8");
    rect(x-2,y+7,2,3,"#bbb"); rect(x+1,y+7,2,3,"#bbb");
    rect(x-3,y+1,2,3,"#bbb");
    rect(x-3,y-1+~~(graze*2),4,3,"#bbb");
    px(x-2,y+~~(graze*2),"#222"); px(x-1,y+~~(graze*2),"#222");
  }

  function drawCow(x, y, t) {
    const moo = Math.sin(t*0.4)*0.3;
    rect(x-5,y,10,6,"#e8e8e8");
    rect(x-3,y+1,2,3,"rgba(80,40,0,0.8)"); rect(x+2,y+2,2,2,"rgba(80,40,0,0.8)");
    rect(x-4,y+6,2,4,"#888"); rect(x-2,y+6,2,4,"#888");
    rect(x+1,y+6,2,4,"#888"); rect(x+3,y+6,2,4,"#888");
    rect(x-3,y-3+~~moo,4,4,"#e8e8e8");
    px(x-2,y-2+~~moo,"#222"); px(x,y-2+~~moo,"#222");
    px(x-2,y-4+~~moo,"#8B6914"); px(x+1,y-4+~~moo,"#8B6914");
    rect(x-2,y+5,4,2,"#ffb3ba");
  }

  function drawPig(x, y, t) {
    const oink = Math.sin(t*0.7)*0.4;
    rect(x-4,y,8,5,"#F4A5A5");
    rect(x-3,y+5,2,3,"#E89090"); rect(x+1,y+5,2,3,"#E89090");
    rect(x-4,y-2+~~oink,5,3,"#F4A5A5");
    rect(x-3,y-1+~~oink,3,2,"#F08080");
    px(x-2,y-1+~~oink,"#8B2020"); px(x-1,y-1+~~oink,"#8B2020");
    px(x-3,y-2+~~oink,"#222"); px(x,y-2+~~oink,"#222");
  }

  function drawFox(x, y, t) {
    const tail = Math.sin(t*1.2)*2;
    rect(x-3,y+2,6,5,"#E07820");
    rect(x-2,y+7,2,3,"#cc6600"); rect(x+1,y+7,2,3,"#cc6600");
    rect(x+3,y+4+~~tail,3,4,"#E07820"); rect(x+5,y+6+~~tail,2,2,"#fff");
    rect(x-3,y-3,5,5,"#E07820");
    rect(x-3,y-2,2,2,"#fff"); rect(x+1,y-2,1,2,"#fff");
    px(x-2,y-1,"#333"); px(x+1,y-1,"#333");
    px(x-1,y,"#222");
    rect(x-3,y-5,2,3,"#E07820"); rect(x+1,y-5,2,3,"#E07820");
  }

  function drawWolf(x, y, t) {
    const tail = Math.sin(t*2)*3;
    rect(x-4,y+1,8,5,"#9E9E9E");
    rect(x-3,y+6,2,4,"#8a8a8a"); rect(x-1,y+6,2,4,"#8a8a8a");
    rect(x+1,y+6,2,4,"#8a8a8a"); rect(x+2,y+6,2,4,"#8a8a8a");
    rect(x-5,y+3+~~tail,4,2,"#9E9E9E");
    rect(x-5,y+1+~~tail,2,4,"#bbb");
    rect(x-4,y-4,6,5,"#9E9E9E");
    rect(x-4,y-3,2,2,"#ddd"); rect(x+1,y-3,2,2,"#ddd");
    px(x-3,y-2,"#222"); px(x+2,y-2,"#222");
    rect(x-3,y-6,2,3,"#9E9E9E"); rect(x+1,y-6,2,3,"#9E9E9E");
  }

  function drawPolarBear(x, y, t) {
    const bob = Math.sin(t*0.5)*0.5;
    rect(x-5,y,10,7,"#e8f4ff");
    rect(x-4,y+7,3,4,"#d0e8f8"); rect(x+2,y+7,3,4,"#d0e8f8");
    rect(x-4,y-4+~~bob,7,5,"#e8f4ff");
    px(x-2,y-3+~~bob,"#222"); px(x+2,y-3+~~bob,"#222");
    px(x,y-2+~~bob,"#555");
    rect(x-3,y-6+~~bob,2,2,"#e8f4ff"); rect(x+2,y-6+~~bob,2,2,"#e8f4ff");
  }

  function drawRabbit(x, y, t) {
    const hop = Math.abs(Math.sin(t*1.5))*2;
    rect(x-2,y+2-~~hop,4,4,"#e0e0e0");
    rect(x-2,y+6-~~hop,2,3,"#ccc"); rect(x+1,y+6-~~hop,2,3,"#ccc");
    rect(x-2,y-2-~~hop,4,5,"#e0e0e0");
    rect(x-1,y-6-~~hop,1,4,"#e0e0e0"); rect(x+1,y-6-~~hop,1,4,"#e0e0e0");
    px(x-1,y-5-~~hop,"#FFB6C1"); px(x+1,y-5-~~hop,"#FFB6C1");
    px(x-1,y-1-~~hop,"#FFB6C1");
    px(x-2,y-2-~~hop,"#222"); px(x+1,y-2-~~hop,"#222");
  }

  function drawMooshroom(x, y, t) {
    const bob = Math.sin(t*0.5)*0.3;
    rect(x-5,y,10,6,"#cc2020");
    rect(x-3,y+1,2,3,"rgba(255,255,255,0.6)");
    rect(x-4,y+6,2,4,"#aa1a1a"); rect(x-2,y+6,2,4,"#aa1a1a");
    rect(x+1,y+6,2,4,"#aa1a1a"); rect(x+3,y+6,2,4,"#aa1a1a");
    rect(x-3,y-3+~~bob,4,4,"#cc2020");
    px(x-2,y-2+~~bob,"#222"); px(x,y-2+~~bob,"#222");
    px(x-2,y-4+~~bob,"#8B6914"); px(x+1,y-4+~~bob,"#8B6914");
    rect(x-2,y-2,3,1,"#cc2020"); px(x-2,y-3,"#fff"); px(x,y-3,"#fff");
  }

  function drawParrot(x, y, t) {
    const bob = Math.sin(t*1.5)*1;
    rect(x-2,y+~~bob,4,5,"#33A000");
    rect(x-3,y+1+~~bob,2,3,"#33A000");
    rect(x-2,y+5+~~bob,2,3,"#B8860B");
    rect(x-2,y-3+~~bob,4,4,"#33A000");
    rect(x+1,y-1+~~bob,2,1,"#FF0000");
    px(x-1,y-2+~~bob,"#fff"); px(x-1,y-2+~~bob,"#222");
    rect(x-2,y-4+~~bob,1,2,"#33A000");
    rect(x-4,y+2+~~bob,2,4,"#2E8B00");
    px(x-4,y+5+~~bob,"#1565C0"); px(x-3,y+5+~~bob,"#FFC107");
  }

  function drawOcelot(x, y, t) {
    const tail = Math.sin(t*1.5)*3;
    rect(x-3,y+2,6,4,"#C8A850");
    rect(x-1,y-1,2,2,"#333"); rect(x+2,y-1,2,2,"#333");
    rect(x-2,y+6,2,3,"#B8983C"); rect(x+1,y+6,2,3,"#B8983C");
    rect(x+2,y+4+~~tail,2,4,"#C8A850");
    rect(x+3,y+2+~~tail,1,4,"#C8A850");
    rect(x-3,y-3,5,4,"#C8A850");
    px(x-2,y-2,"#222"); px(x+1,y-2,"#222");
    rect(x-2,y-5,2,3,"#C8A850"); rect(x+1,y-5,2,3,"#C8A850");
    px(x-1,y+3,"#8B6914"); px(x+1,y+3,"#8B6914");
  }

  function drawGhast(x, y, t) {
    const bob = Math.sin(t*0.5)*3;
    const tear = Math.sin(t*0.3)>0.6;
    rect(x-5,y+~~bob,10,9,"rgba(255,255,255,0.9)");
    px(x-3,y+2+~~bob,"#333"); px(x-1,y+2+~~bob,"#333"); px(x+2,y+2+~~bob,"#333");
    rect(x-2,y+4+~~bob,4,2,"#333");
    if (tear) px(x-1,y+6+~~bob,"rgba(100,150,255,0.7)");
    for (let i=0;i<6;i++) {
      const tx=x-4+i*2, tlen=3+~~(Math.sin(t+i)*1.5);
      rect(tx,y+8+~~bob,1,tlen,"rgba(255,255,255,0.8)");
    }
    ctx.save();
    const gg=ctx.createRadialGradient(x*PIXEL,(y+~~bob+4)*PIXEL,0,x*PIXEL,(y+~~bob+4)*PIXEL,15*PIXEL);
    gg.addColorStop(0,"rgba(255,200,200,0.15)"); gg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=gg; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
  }

  function drawBlaze(x, y, t) {
    const bob=Math.sin(t*1.5)*2;
    rect(x-2,y+~~bob,4,4,"#FFD54F");
    px(x-1,y+1+~~bob,"#333"); px(x+1,y+1+~~bob,"#333");
    rect(x-1,y+3+~~bob,2,1,"#333");
    for (let i=0;i<4;i++) {
      const a=t*2+i*1.57;
      const fx=x+~~(Math.cos(a)*4), fy=y+2+~~bob+~~(Math.sin(a)*2);
      rect(fx,fy,3,1,"#FF6F00");
    }
    ctx.save();
    const bg=ctx.createRadialGradient(x*PIXEL,(y+~~bob)*PIXEL,0,x*PIXEL,(y+~~bob)*PIXEL,10*PIXEL);
    bg.addColorStop(0,"rgba(255,180,0,0.2)"); bg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=bg; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
  }

  function drawDragon(x, y, t) {
    const wingFlap = Math.sin(t*1.5)*4;
    const bob = Math.sin(t*0.4)*3;
    rect(x-8,y+~~bob,16,5,"#1a0a2a");
    rect(x+7,y-1+~~bob,5,3,"#1a0a2a");
    px(x+10,y-2+~~bob,"#FF3300");
    rect(x-20,y-2+~~bob+~~wingFlap,12,4,"#1a0a2a");
    rect(x+8,y-2+~~bob-~~wingFlap,12,4,"#1a0a2a");
    rect(x-8,y+4+~~bob,5,8,"#1a0a2a");
    for(let i=0;i<3;i++) {
      px(x-18+i*3,y+1+~~bob+~~wingFlap,"#2d1a3a");
      px(x+10+i*3,y+1+~~bob-~~wingFlap,"#2d1a3a");
    }
  }

  function drawCrystal(x, y, t) {
    const glow = Math.sin(t*2)*0.5+0.5;
    const spin = ~~(Math.sin(t*1.5)*2);
    rect(x-1,y+4,3,4,"#1a0a1a");
    rect(x-2+spin,y,4,5,"rgba(180,50,255,0.8)");
    rect(x-1+spin,y-2,2,3,"rgba(200,100,255,0.9)");
    ctx.save();
    const cg=ctx.createRadialGradient(x*PIXEL,y*PIXEL,0,x*PIXEL,y*PIXEL,10*PIXEL);
    cg.addColorStop(0,`rgba(150,50,255,${glow*0.4})`); cg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=cg; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
    for(let i=0;i<6;i++) px(x,y-i*2-2,`rgba(255,100,255,${0.6-i*0.08})`);
  }

  function drawMagmaCube(x, y, t) {
    const bounce = Math.abs(Math.sin(t*2))*3;
    const sq = 5-~~bounce;
    rect(x-sq,y+~~bounce,sq*2,sq,"#B71C1C");
    rect(x-sq+1,y+~~bounce+1,sq*2-2,sq-2,"#FF4500");
    px(x-1,y+~~bounce+1,"#FFD54F"); px(x+2,y+~~bounce+2,"#FFD54F");
    px(x-2,y-2+~~bounce,"#333"); px(x+1,y-2+~~bounce,"#333");
    ctx.save();
    const mg=ctx.createRadialGradient(x*PIXEL,(y+~~bounce+sq/2)*PIXEL,0,x*PIXEL,(y+~~bounce+sq/2)*PIXEL,8*PIXEL);
    mg.addColorStop(0,"rgba(255,80,0,0.2)"); mg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=mg; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
  }

  function drawSlime(x, y, t) {
    const bounce = Math.abs(Math.sin(t*1.8))*4;
    const squash = ~~bounce;
    rect(x-4,y+squash,8,6-squash,"rgba(80,200,60,0.85)");
    rect(x-3,y+1+squash,6,4-squash,"rgba(120,230,80,0.6)");
    px(x-2,y+2+squash,"#1a3a0a"); px(x+1,y+2+squash,"#1a3a0a");
    rect(x-2,y+4+squash,4,1,"#1a3a0a");
    ctx.save();
    const sg=ctx.createRadialGradient(x*PIXEL,(y+3)*PIXEL,0,x*PIXEL,(y+3)*PIXEL,8*PIXEL);
    sg.addColorStop(0,"rgba(80,200,60,0.15)"); sg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=sg; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
  }

  function drawDolphin(x, y, t) {
    const wave = Math.sin(t*1.5+x*0.1)*3;
    rect(x-6,y+~~wave,12,4,"#5E8FA0");
    rect(x+5,y+1+~~wave,4,3,"#5E8FA0");
    rect(x+8,y+~~wave,2,2,"#4A7A8A"); rect(x+8,y+2+~~wave,2,2,"#4A7A8A");
    rect(x-1,y-2+~~wave,2,3,"#5E8FA0");
    rect(x-7,y+1+~~wave,3,2,"#7AAABB");
    px(x-4,y+1+~~wave,"#222");
  }

  function drawSquid(x, y, t) {
    const bob = Math.sin(t*0.7)*2, pulse=Math.sin(t*1.5)*0.5+0.5;
    rect(x-4,y+~~bob,8,6,`rgba(30,80,130,${0.8+pulse*0.2})`);
    rect(x-3,y+1+~~bob,6,4,"rgba(40,100,160,0.7)");
    for(let i=0;i<8;i++) {
      const tx=x-4+i, tlen=3+~~(Math.sin(t+i*0.8)*1.5);
      rect(tx,y+6+~~bob,1,tlen,"rgba(30,80,130,0.7)");
    }
    px(x-2,y+2+~~bob,"rgba(200,220,255,0.6)"); px(x+1,y+2+~~bob,"rgba(200,220,255,0.6)");
  }

  function drawTurtle(x, y, t) {
    const walk = Math.sin(t*1)*1;
    rect(x-5,y,10,5,"#3A7D44");
    rect(x-4,y+1,8,3,"#2D6535");
    px(x-1,y+1,"#1a4a20"); px(x+1,y+1,"#1a4a20"); px(x,y+2,"#1a4a20");
    rect(x-5,y+5,3,3,"#5C9E5C"); rect(x+3,y+5,3,3,"#5C9E5C");
    rect(x-3,y-2,5,3,"#5C9E5C");
    px(x-1,y-1,"#222"); px(x+1,y-1,"#222");
    rect(x-6,y+1+~~walk,2,3,"#5C9E5C"); rect(x+5,y+1-~~walk,2,3,"#5C9E5C");
  }

  function drawWitch(x, y, t) {
    const bob = Math.sin(t*0.6)*0.5;
    rect(x-2,y+4,2,5,"#4a1a7a"); rect(x,y+4,2,5,"#4a1a7a");
    rect(x-3,y+~~bob,6,5,"#4a1a7a");
    rect(x-4,y+1+~~bob,1,4,"#6a3a8a"); rect(x+3,y+1+~~bob,1,4,"#6a3a8a");
    rect(x-3,y-4+~~bob,5,5,"#5C9A44");
    px(x-1,y-3+~~bob,"#222"); px(x+1,y-3+~~bob,"#222");
    px(x,y-2+~~bob,"#cc2244");
    rect(x-3,y-5+~~bob,6,1,"#222"); rect(x-2,y-9+~~bob,4,5,"#222");
    rect(x+3,y+2+~~bob,2,3,"rgba(200,0,0,0.8)");
  }


  // ═══════════════════════════════════════════════════════════
  // UNDERGROUND CAVE SYSTEM
  // ═══════════════════════════════════════════════════════════

  function drawCave(t, biome) {
    const cw = W(), ch = H();
    const gnd = Math.floor(ch * 0.68);
    const caveTop = gnd + 2;
    const caveH   = ch - caveTop;

    function stalactite(x, len, col1, col2) {
      for (let i = 0; i < len; i++) {
        const w = Math.max(1, Math.round((len - i) / len * 3));
        rect(x - w, caveTop + i, w * 2, 1, i < 2 ? col1 : col2);
      }
    }
    function stalagmite(x, len, col1, col2) {
      for (let i = 0; i < len; i++) {
        const w = Math.max(1, Math.round(i / len * 3));
        rect(x - w, ch - len + i, w * 2, 1, i > len - 3 ? col1 : col2);
      }
    }

    function caveGlow(cx, cy, r, color) {
      ctx.save();
      const g = ctx.createRadialGradient(cx*PIXEL,cy*PIXEL,0,cx*PIXEL,cy*PIXEL,r*PIXEL);
      g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.restore();
    }

    if (biome === 'Plains') {
      rect(0, caveTop, cw, caveH, '#2a2a2a');
      rect(0, caveTop,     cw, 3, '#555');
      rect(0, caveTop + 3, cw, 4, '#444');
      for (let i = 0; i < 18; i++) rect(rnd(i*17,cw-4), caveTop+rnd(i*7,8), 4+rnd(i,4), 2, '#3a3a3a');
      for (let i = 0; i < 12; i++) {
        const bx = rnd(i*23,cw-8), by = caveTop+4+rnd(i*11,caveH-12);
        rect(bx,by,8,6,'#383838'); rect(bx+1,by+1,6,4,'#404040');
      }
      for (let i = 0; i < 10; i++) stalactite(rnd(i*31,cw), 4+rnd(i*7,6), '#8B6914','#5a4010');
      for (let i = 0; i < 8; i++) stalagmite(rnd(i*23+5,cw), 5+rnd(i*11,8), '#666','#444');
      [[0.15],[0.45],[0.75]].forEach(([f],i) => {
        const tx = Math.floor(f*cw), ty = caveTop + 6;
        rect(tx,ty,2,5,'#8B6914');
        const flicker = Math.sin(t*8+i)*0.5+0.5;
        rect(tx-1,ty-3,4,4,`rgba(255,${140+Math.round(flicker*30)},0,1)`);
        caveGlow(tx+1,ty-1,10,`rgba(255,140,0,${0.12+flicker*0.05})`);
      });
      for (let i = 0; i < 8; i++) px(rnd(i*17+3,cw-2), caveTop+6+rnd(i*13,caveH-10), '#1a1a1a');
      for (let i = 0; i < 5; i++) {
        const ox=rnd(i*29,cw-4), oy=caveTop+10+rnd(i*17,caveH-14);
        rect(ox,oy,3,2,'#c8a878'); rect(ox+1,oy+1,2,1,'#d4b88a');
      }
      // One zombie in cave
      const zx = ~~(cw*0.3) + ~~(Math.sin(t*0.5)*8), zy = ch-8;
      rect(zx-2,zy,4,7,'#4CAF50'); rect(zx-2,zy-5,4,5,'#2E7D32');
      px(zx-1,zy-4,'#FF0000'); px(zx+1,zy-4,'#FF0000');
      rect(zx-5,zy-3,3,2,'#4CAF50'); rect(zx+2,zy-3,3,2,'#4CAF50');
      // One bat
      const bx = ~~(cw*0.65)+~~(Math.sin(t*1.2)*15), by = caveTop+10+~~(Math.sin(t*0.8)*5);
      const wing = Math.sin(t*5)*2;
      rect(bx-4,by+~~wing,4,2,'#333'); rect(bx,by-~~wing,4,2,'#333'); rect(bx-1,by,2,3,'#555');

    } else if (biome === 'Forest') {
      rect(0, caveTop, cw, caveH, '#1a1a0a');
      rect(0, caveTop, cw, 3, '#2a3a1a');
      for (let i = 0; i < 14; i++) rect(rnd(i*17,cw-4), caveTop+rnd(i*7,6), 5+rnd(i,5), 2, '#1a2a10');
      for (let i = 0; i < 12; i++) {
        const mx=rnd(i*23,cw-3), my=caveTop+rnd(i*11,caveH/2);
        rect(mx,my,3,2,'#1a5510'); rect(mx+1,my-1,1,1,'#228B22');
      }
      for (let i = 0; i < 8; i++) {
        const vx=rnd(i*19+3,cw), vlen=5+rnd(i*7,10);
        for (let vy=0;vy<vlen;vy++) px(vx,caveTop+vy,'#1a5510');
      }
      stalactite(~~(cw*0.2),8,'#2a3a1a','#1a2a10');
      stalactite(~~(cw*0.5),6,'#2a3a1a','#1a2a10');
      stalactite(~~(cw*0.8),9,'#2a3a1a','#1a2a10');
      [[0.25],[0.55],[0.8]].forEach(([f],i) => {
        const gx=~~(f*cw), gy=ch-8;
        rect(gx,gy,1,4,'#d0b090'); rect(gx-2,gy-2,5,3,'#88CC00');
        caveGlow(gx,gy-2,8,`rgba(100,200,0,${0.15+Math.sin(t*0.8+i)*0.06})`);
      });
      // One skeleton
      const sx2=~~(cw*0.6), sy2=ch-9;
      rect(sx2-1,sy2,3,8,'#e0e0e0'); rect(sx2-2,sy2-5,4,5,'#e0e0e0');
      px(sx2-1,sy2-4,'#222'); px(sx2+1,sy2-4,'#222');
      // One bat
      const bx2=~~(cw*0.3)+~~(Math.sin(t*1.5)*10);
      const by2=caveTop+8+~~(Math.sin(t)*4);
      const wf=Math.sin(t*4)*2;
      rect(bx2-3,by2+~~wf,3,2,'#2a2a1a'); rect(bx2,by2-~~wf,3,2,'#2a2a1a');

    } else if (biome === 'Desert') {
      rect(0, caveTop, cw, caveH, '#3a2a0a');
      rect(0, caveTop, cw, 3, '#c8a84b');
      for (let i=0;i<10;i++) rect(rnd(i*17,cw),caveTop+rnd(i*7,8),6+rnd(i,5),3,'#b8983a');
      for (let i=0;i<10;i++) {
        const bx=rnd(i*23,cw-10),by=caveTop+4+rnd(i*13,caveH-10);
        rect(bx,by,10,6,'#c8a84b'); rect(bx+1,by+1,8,4,'#d4b458');
      }
      for (let i=0;i<6;i++) {
        const fx=rnd(i*31,cw-8), fy=caveTop+8+rnd(i*17,caveH-14);
        rect(fx,fy,8,2,'#e8d090'); rect(fx+2,fy-1,2,4,'#e0c880');
      }
      stalactite(~~(cw*0.25),7,'#c8a84b','#8B6914');
      stalactite(~~(cw*0.6),5,'#c8a84b','#8B6914');
      stalactite(~~(cw*0.85),8,'#c8a84b','#8B6914');
      for (let i=0;i<6;i++) {
        const gox=rnd(i*19,cw-3), goy=caveTop+10+rnd(i*13,caveH-14);
        rect(gox,goy,3,2,'#FFD700'); px(gox+1,goy,'#FFA000');
      }
      // One husk
      const hx=~~(cw*0.4), hy=ch-9;
      rect(hx-2,hy,4,8,'#C8A850'); rect(hx-2,hy-5,4,5,'#B8983A');
      px(hx-1,hy-4,'#8B0000'); px(hx+1,hy-4,'#8B0000');
      rect(hx-5,hy-3,3,2,'#C8A850'); rect(hx+2,hy-3,3,2,'#C8A850');

    } else if (biome === 'Taiga') {
      rect(0, caveTop, cw, caveH, '#0a1a2a');
      rect(0, caveTop, cw, 3, '#1e3d14');
      for (let i=0;i<10;i++) {
        const ix=rnd(i*23,cw-8), iy=caveTop+rnd(i*11,caveH/2);
        rect(ix,iy,8,5,'rgba(160,200,230,0.5)');
      }
      for (let i=0;i<8;i++) {
        const px2=rnd(i*19,cw-6), py2=caveTop+4+rnd(i*13,caveH-10);
        rect(px2,py2,6,5,'#90CAF9'); rect(px2+1,py2+1,4,3,'#B3E5FC');
      }
      stalactite(~~(cw*0.2),10,'#90CAF9','#64B5F6');
      stalactite(~~(cw*0.55),8,'#90CAF9','#64B5F6');
      stalactite(~~(cw*0.8),12,'#90CAF9','#64B5F6');
      for (let i=0;i<6;i++) stalagmite(rnd(i*23+5,cw),6+rnd(i*11,8),'#B3E5FC','#90CAF9');
      [[0.2],[0.5],[0.78]].forEach(([f],i) => {
        const cx2=~~(f*cw), cy2=caveTop+12+rnd(i*7,10);
        rect(cx2-2,cy2,4,6,'#B3E5FC'); rect(cx2-1,cy2-2,2,3,'#E3F2FD');
        caveGlow(cx2,cy2,8,`rgba(100,180,255,${0.15+Math.sin(t*1.2+i)*0.07})`);
      });
      // One stray
      const stx=~~(cw*0.65), sty=ch-9;
      rect(stx-1,sty,3,8,'#ddd'); rect(stx-2,sty-5,4,5,'#ddd');
      px(stx-1,sty-4,'#5bc8ff'); px(stx+1,sty-4,'#5bc8ff');
      rect(0,ch-4,cw,4,'#c8ddc0');

    } else if (biome === 'Snowy Tundra') {
      rect(0, caveTop, cw, caveH, '#050a14');
      rect(0, caveTop, cw, 3, '#c0d8ec');
      for (let i=0;i<12;i++) {
        const bx=rnd(i*23,cw-8), by=caveTop+rnd(i*13,caveH/2);
        rect(bx,by,8,5,'#4FC3F7'); rect(bx+1,by+1,6,3,'#81D4FA');
      }
      stalactite(~~(cw*0.15),14,'#81D4FA','#4FC3F7');
      stalactite(~~(cw*0.45),10,'#81D4FA','#4FC3F7');
      stalactite(~~(cw*0.72),12,'#81D4FA','#4FC3F7');
      caveGlow(~~(cw*0.5),caveTop+15,15,'rgba(80,180,255,0.08)');
      // One frozen zombie
      const fzx=~~(cw*0.5), fzy=ch-9;
      rect(fzx-2,fzy,4,8,'#5B9BD5'); rect(fzx-2,fzy-5,4,5,'#3a7ab0');
      px(fzx-1,fzy-4,'#ff5555'); px(fzx+1,fzy-4,'#ff5555');
      rect(0,ch-5,cw,5,'#e8f4ff');

    } else if (biome === 'Savanna') {
      rect(0, caveTop, cw, caveH, '#2a1800');
      rect(0, caveTop, cw, 3, '#8B6914');
      for (let i=0;i<12;i++) {
        const bx=rnd(i*23,cw-8), by=caveTop+rnd(i*11,caveH/2);
        rect(bx,by,8,5,'#8B5E3C'); rect(bx+1,by+1,6,3,'#A0714A');
      }
      stalactite(~~(cw*0.22),6,'#8B6914','#5D4010');
      stalactite(~~(cw*0.55),8,'#8B6914','#5D4010');
      stalactite(~~(cw*0.82),7,'#8B6914','#5D4010');
      for (let i=0;i<8;i++) {
        const gx=rnd(i*19,cw-4), gy=caveTop+8+rnd(i*13,caveH-12);
        rect(gx,gy,4,3,'#FFD700'); px(gx+1,gy+1,'#FFA000');
        caveGlow(gx+2,gy+1,5,`rgba(255,200,0,0.1)`);
      }
      [[0.2],[0.6]].forEach(([f],i) => {
        const tx=~~(f*cw), ty=caveTop+7;
        rect(tx,ty,2,5,'#8B6914');
        const fl=Math.sin(t*8+i)*0.5+0.5;
        rect(tx-1,ty-3,4,4,`rgba(255,${140+~~(fl*30)},0,1)`);
        caveGlow(tx+1,ty-1,8,`rgba(255,140,0,${0.12+fl*0.05})`);
      });
      // One zombie
      const hvx=~~(cw*0.7), hvy=ch-9;
      rect(hvx-2,hvy,4,8,'#8B6914'); rect(hvx-2,hvy-5,4,5,'#5D4010');
      px(hvx-1,hvy-4,'#FF0000'); px(hvx+1,hvy-4,'#FF0000');

    } else if (biome === 'Jungle') {
      rect(0, caveTop, cw, caveH, '#051505');
      rect(0, caveTop, cw, 3, '#052a02');
      for (let i=0;i<12;i++) {
        const bx=rnd(i*23,cw-6), by=caveTop+rnd(i*11,caveH/2);
        rect(bx,by,6,4,'#0d3a08'); rect(bx+1,by+1,4,2,'#1a5510');
      }
      for (let i=0;i<8;i++) {
        const vx=rnd(i*19+3,cw), vlen=8+rnd(i*7,12);
        const hasBerry=i%2===0;
        for (let vy=0;vy<vlen;vy++) px(vx,caveTop+vy,'#1a5510');
        if(hasBerry) {
          const by2=caveTop+vlen;
          rect(vx-1,by2,3,3,'#FF6600');
          caveGlow(vx,by2+1,6,`rgba(255,100,0,${0.2+Math.sin(t+i)*0.08})`);
        }
      }
      stalactite(~~(cw*0.3),8,'#0d3a08','#1a5510');
      stalactite(~~(cw*0.65),10,'#0d3a08','#1a5510');
      [[0.2],[0.55],[0.82]].forEach(([f],i) => {
        const sx3=~~(f*cw), sy3=caveTop+4;
        rect(sx3-3,sy3,6,3,'#AA4499'); rect(sx3-2,sy3+3,4,2,'#CC66BB');
        for(let p=0;p<3;p++) {
          const py3=(t*20+i*15+p*8)%20;
          px(sx3+(p-1),sy3+4+~~py3,'rgba(200,100,200,0.6)');
        }
      });
      // One axolotl
      const ax=~~(cw*0.45), ay=ch-7;
      rect(ax-3,ay,6,3,'#F4A0C0'); rect(ax-4,ay+1,2,2,'#F4A0C0');
      rect(ax+2,ay+1,2,2,'#F4A0C0'); px(ax-1,ay,'#FF1493'); px(ax+1,ay,'#FF1493');
      rect(ax-3,ay-1,2,3,'#F4A0C0'); rect(ax+1,ay-1,2,3,'#F4A0C0');
      rect(0,ch-5,cw,5,'rgba(0,100,180,0.4)');

    } else if (biome === 'Swamp') {
      rect(0, caveTop, cw, caveH, '#050e05');
      rect(0, caveTop, cw, 3, '#0d2208');
      for (let i=0;i<10;i++) {
        const bx=rnd(i*23,cw-6), by=caveTop+rnd(i*11,caveH/2);
        rect(bx,by,6,4,'#1a2e0a');
      }
      for (let i=0;i<8;i++) {
        const dx=rnd(i*23,cw), dlen=(t*15+i*12)%20;
        for (let dy=0;dy<~~dlen;dy++) px(dx,caveTop+dy,'rgba(50,120,30,0.7)');
        if(dlen>18) rect(dx-1,caveTop+~~dlen,3,2,'rgba(50,150,30,0.5)');
      }
      stalactite(~~(cw*0.2),9,'#1a2e0a','#0d1a06');
      stalactite(~~(cw*0.5),7,'#1a2e0a','#0d1a06');
      stalactite(~~(cw*0.78),11,'#1a2e0a','#0d1a06');
      for (let i=0;i<4;i++) {
        const wx=rnd(i*31,cw), wy=caveTop+10+rnd(i*13,caveH-20)+~~(Math.sin(t+i*1.5)*4);
        caveGlow(wx,wy,8,`rgba(80,255,120,${(Math.sin(t*1.5+i*2)*0.5+0.5)*0.2})`);
      }
      // One drowned
      const dx2=~~(cw*0.55), dy2=ch-9;
      rect(dx2-2,dy2,4,8,'#4a8a7a'); rect(dx2-2,dy2-5,4,5,'#2a5a4a');
      px(dx2-1,dy2-4,'#4fc3f7'); px(dx2+1,dy2-4,'#4fc3f7');
      rect(dx2-5,dy2-3,3,2,'#4a8a7a'); rect(dx2+2,dy2-3,3,2,'#4a8a7a');
      rect(0,ch-6,cw,6,'rgba(20,60,20,0.7)');

    } else if (biome === 'Ocean') {
      rect(0, caveTop, cw, caveH, '#001428');
      rect(0, caveTop, cw, 3, '#002855');
      for (let i=0;i<12;i++) {
        const bx=rnd(i*23,cw-8), by=caveTop+rnd(i*11,caveH/2);
        const pulse=Math.sin(t*2+i)*0.2+0.8;
        rect(bx,by,8,5,`rgba(50,${~~(180*pulse)},${~~(160*pulse)},0.9)`);
      }
      [[0.2],[0.5],[0.8]].forEach(([f],i) => {
        const lx=~~(f*cw), ly=caveTop+8;
        const pulse=0.7+Math.sin(t*2+i)*0.3;
        rect(lx-3,ly,6,5,`rgba(200,240,200,${pulse})`);
        caveGlow(lx,ly+2,12,`rgba(150,255,150,${0.15*pulse})`);
      });
      stalactite(~~(cw*0.25),8,'#1565C0','#0d47a1');
      stalactite(~~(cw*0.6),6,'#1565C0','#0d47a1');
      for (let i=0;i<8;i++) {
        const bx=rnd(i*23,cw), by=ch-((t*20+i*15)%caveH);
        ctx.fillStyle='rgba(100,180,255,0.4)';
        ctx.beginPath(); ctx.arc(bx*PIXEL,by*PIXEL,2*PIXEL,0,Math.PI*2); ctx.fill();
      }
      // One guardian
      const gux=~~(cw*0.65), guy=ch-10;
      rect(gux-4,guy,8,7,'#2E7D32'); rect(gux-3,guy+1,6,5,'#388E3C');
      px(gux-1,guy+2,'#FF6F00'); px(gux+1,guy+2,'#FF6F00');
      rect(0,ch-6,cw,6,'rgba(0,50,120,0.5)');

    } else if (biome === 'Nether') {
      rect(0, caveTop, cw, caveH, '#100000');
      rect(0, caveTop, cw, 3, '#3a0a0a');
      for (let i=0;i<8;i++) {
        const bx=rnd(i*23,cw-4), bh=6+rnd(i*11,12);
        rect(bx,caveTop,4,bh,'#1a1a1a'); rect(bx+1,caveTop,2,bh,'#2a2a2a');
      }
      [[0.15],[0.45],[0.75]].forEach(([f],i) => {
        const sfx=~~(f*cw), sfy=ch-8;
        const fl=Math.sin(t*6+i)*0.5+0.5;
        for (let ly=0;ly<4;ly++) {
          const fw=Math.max(1,3-ly);
          for (let dx=-fw;dx<=fw;dx++) px(sfx+dx,sfy-ly,['#0055FF','#0088FF','#00CCFF'][ly<3?ly:2]);
        }
        caveGlow(sfx,sfy,10,`rgba(0,100,255,${0.15+fl*0.08})`);
      });
      rect(0,ch-5,cw,5,'rgba(180,30,0,0.8)');
      for (let i=0;i<12;i++) {
        const ml=Math.sin(t*4+i*1.5)*0.5+0.5;
        px(rnd(i*17,cw), ch-3, `rgba(255,${~~(100+ml*80)},0,0.9)`);
      }
      stalactite(~~(cw*0.25),10,'#3a0a0a','#200505');
      stalactite(~~(cw*0.6),8,'#3a0a0a','#200505');
      // One wither skeleton
      const wsx=~~(cw*0.5), wsy=ch-12;
      rect(wsx-1,wsy,3,10,'#1a1a1a'); rect(wsx-2,wsy-6,5,6,'#1a1a1a');
      px(wsx-1,wsy-5,'#FF0000'); px(wsx+1,wsy-5,'#FF0000');
      rect(wsx-4,wsy-3,3,2,'#1a1a1a'); rect(wsx+2,wsy-3,3,2,'#1a1a1a');
      rect(wsx+4,wsy-2,2,6,'#8B6914');
      for (let i=0;i<10;i++) {
        const bfx=rnd(i*23,cw-4);
        rect(bfx,ch-5,4,2,'#e8d090');
      }

    } else if (biome === 'The End') {
      rect(0, caveTop, cw, caveH, '#000008');
      rect(0, caveTop, cw, 3, '#d4c87e');
      for (let i=0;i<10;i++) {
        const bx=rnd(i*23,cw-8), by=caveTop+rnd(i*11,caveH/3);
        rect(bx,by,8,5,'#d4c87e'); rect(bx+1,by+1,6,3,'#c8b870');
      }
      for (let i=0;i<6;i++) {
        const px2=rnd(i*23,cw-4), ph2=8+rnd(i*11,10);
        rect(px2,caveTop,4,ph2,'#7B5EA7'); rect(px2+1,caveTop,2,ph2,'#9575CD');
      }
      stalactite(~~(cw*0.2),10,'#d4c87e','#bba858');
      stalactite(~~(cw*0.55),8,'#d4c87e','#bba858');
      stalactite(~~(cw*0.85),12,'#d4c87e','#bba858');
      [[0.25],[0.6]].forEach(([f],i) => {
        const ex=~~(f*cw), ey=ch-10;
        const spin=~~(Math.sin(t*1.5+i)*2);
        rect(ex-2+spin,ey,4,5,'rgba(180,50,255,0.8)');
        caveGlow(ex,ey,10,`rgba(150,50,255,${0.15+Math.sin(t*2+i)*0.07})`);
        for(let b=0;b<4;b++) px(ex,ey-b*2-4,`rgba(255,100,255,${0.5-b*0.1})`);
      });
      // One endermite
      const emx=~~(cw*0.45), emy=ch-6;
      rect(emx-2,emy,5,3,'#1a1a2a');
      px(emx,emy,'#AA00FF'); px(emx+2,emy,'#AA00FF');

    } else if (biome === 'Mushroom Fields') {
      rect(0, caveTop, cw, caveH, '#1a0520');
      rect(0, caveTop, cw, 3, '#4a1450');
      for (let i=0;i<10;i++) {
        const bx=rnd(i*23,cw-8), by=caveTop+rnd(i*11,caveH/2);
        rect(bx,by,8,5,'#3a0d42');
      }
      for (let i=0;i<10;i++) {
        const mx=rnd(i*17,cw-4), my=ch-6-rnd(i*7,8);
        const isR=i%2===0;
        rect(mx,my,1,4,'#c8a870'); rect(mx-1,my-1,3,2,isR?'#cc2020':'#cc66cc');
        caveGlow(mx,my-1,5,`rgba(${isR?200:180},${isR?50:100},${isR?50:200},${0.1+Math.sin(t+i)*0.05})`);
      }
      stalactite(~~(cw*0.2),8,'#4a1450','#2a0a30');
      stalactite(~~(cw*0.5),6,'#4a1450','#2a0a30');
      stalactite(~~(cw*0.78),9,'#4a1450','#2a0a30');
      for (let i=0;i<5;i++) {
        const gx=rnd(i*23,cw-4), gy=caveTop+8+rnd(i*17,caveH/2);
        const glow=0.1+Math.sin(t*0.8+i)*0.06;
        rect(gx,gy,4,2,`rgba(180,80,220,0.4)`);
        caveGlow(gx+2,gy+1,7,`rgba(200,80,255,${glow})`);
      }
      // One baby mooshroom
      const mmx=~~(cw*0.55), mmy=ch-9;
      rect(mmx-3,mmy,6,4,'#cc2020'); rect(mmx-3,mmy+1,2,2,'rgba(255,255,255,0.5)');
      rect(mmx-2,mmy+4,2,3,'#aa1818'); rect(mmx+1,mmy+4,2,3,'#aa1818');
      rect(mmx-2,mmy-2,3,3,'#cc2020'); px(mmx-1,mmy-1,'#222'); px(mmx+1,mmy-1,'#222');
      rect(0,ch-4,cw,4,'#3a0d42');
    }
  }


  // ═══════════════════════════════════════════════════════════
  // ANIMATED MOBS
  // ═══════════════════════════════════════════════════════════

  function walkX(t, slot, speed, width) {
    return ((t * speed + slot * (width/3)) % (width + 80)) - 40;
  }

  function mobChicken(x, y, t, dir) {
    const leg = Math.sin(t * 5) * 2;
    const d = dir || 1;
    ctx.save(); if(d < 0) { ctx.translate(x*PIXEL*2, 0); ctx.scale(-1,1); }
    rect(x-2,y,5,4,"#F5F5F5");
    rect(x-3,y+1,2,3,"#ddd");
    rect(x+2,y-2,4,3,"#F5F5F5"); rect(x+4,y-1,3,2,"#DAA520");
    rect(x+3,y+1,2,3,"#CC0000");
    px(x+5,y-2,"#333");
    rect(x,y+4,2,3+~~leg,"#DAA520"); rect(x+2,y+4,2,3-~~leg,"#DAA520");
    ctx.restore();
  }

  function mobSheep(x, y, t, col) {
    const leg = Math.sin(t*4)*1.5;
    rect(x-4,y,9,5,col||"#e8e8e8");
    rect(x-3,y-2,2,3,col||"#e8e8e8"); rect(x+1,y-2,3,3,"#bbb");
    px(x-2,y-1,"#333"); px(x,y-1,"#333");
    rect(x-3,y+5,2,3+~~leg,"#aaa"); rect(x,y+5,2,3-~~leg,"#aaa");
    rect(x+2,y+5,2,3+~~leg,"#aaa"); rect(x-1,y+5,2,3-~~leg,"#aaa");
  }

  function mobCow(x, y, t) {
    const leg = Math.sin(t*3)*2;
    rect(x-5,y,11,6,"#e8e8e8");
    rect(x-3,y+1,2,3,"rgba(80,40,0,0.8)"); rect(x+2,y+2,2,2,"rgba(80,40,0,0.8)");
    rect(x-4,y-3,5,4,"#e8e8e8"); px(x-3,y-2,"#222"); px(x-1,y-2,"#222");
    px(x-3,y-4,"#8B6914"); px(x,y-4,"#8B6914");
    rect(x-4,y+6,2,3+~~leg,"#888"); rect(x-1,y+6,2,3-~~leg,"#888");
    rect(x+2,y+6,2,3+~~leg,"#888"); rect(x+4,y+6,2,3-~~leg,"#888");
  }

  function mobRabbit(x, y, t, phase) {
    const hop = Math.abs(Math.sin(t*3+phase))*5;
    const hy = y - ~~hop;
    rect(x-2,hy+2,5,4,"#e0e0e0"); rect(x-2,hy-2,4,5,"#e0e0e0");
    rect(x-1,hy-6,1,4,"#e0e0e0"); rect(x+1,hy-6,1,4,"#e0e0e0");
    px(x-1,hy-5,"#FFB6C1"); px(x+1,hy-5,"#FFB6C1");
    px(x-1,hy-1,"#333"); px(x+1,hy-1,"#333"); px(x,hy,"#FFB6C1");
    rect(x-2,hy+6,2,2+~~hop/2,"#ccc"); rect(x+1,hy+6,2,2+~~hop/2,"#ccc");
  }

  function mobFox(x, y, t, phase) {
    const leg = Math.sin(t*4+phase)*2;
    const tail = Math.sin(t*2+phase)*3;
    rect(x-3,y,7,5,"#E07820");
    rect(x+3,y+3+~~tail,3,4,"#E07820"); rect(x+5,y+5+~~tail,2,2,"#fff");
    rect(x-4,y-3,5,5,"#E07820");
    rect(x-4,y-2,2,2,"#fff"); rect(x,y-2,2,2,"#fff");
    px(x-3,y-1,"#333"); px(x+1,y-1,"#333");
    rect(x-2,y+5,2,2+~~leg,"#cc6600"); rect(x+1,y+5,2,2-~~leg,"#cc6600");
  }

  function mobBird(x, y, col) {
    const wing = Math.sin(Date.now()*0.008)*3;
    rect(x-1,y,3,3,col||"#33A000");
    rect(x-4,y+~~wing,3,2,col||"#2E8B00");
    rect(x+2,y-~~wing,3,2,col||"#2E8B00");
    px(x+1,y-2,"#FF0000"); px(x+2,y-1,"#DAA520");
  }

  function mobOcelot(x, y, t, phase) {
    const leg = Math.sin(t*4+phase)*1.5;
    const tail = Math.sin(t*1.5+phase)*4;
    rect(x-3,y,7,4,"#C8A850");
    px(x-1,y+1,"#8B6914"); px(x+2,y+2,"#8B6914");
    rect(x+3,y+2+~~tail,2,5,"#C8A850"); rect(x+4,y+1+~~tail,1,3,"#C8A850");
    rect(x-3,y-3,5,4,"#C8A850");
    rect(x-3,y-5,2,3,"#C8A850"); rect(x+1,y-5,2,3,"#C8A850");
    px(x-2,y-2,"#222"); px(x+1,y-2,"#222");
    rect(x-2,y+4,2,2+~~leg,"#B89030"); rect(x+1,y+4,2,2-~~leg,"#B89030");
  }

  function mobDolphin(x, y, t, phase) {
    const arc = -Math.abs(Math.sin(t*1.8+phase))*20;
    const angle = Math.sin(t*1.8+phase) * 0.6;
    const dy = y + ~~arc;
    ctx.save();
    ctx.translate(x*PIXEL, dy*PIXEL);
    ctx.rotate(angle);
    ctx.fillStyle="#5E8FA0"; ctx.fillRect(-8*PIXEL,-3*PIXEL,16*PIXEL,5*PIXEL);
    ctx.fillRect(6*PIXEL,-1*PIXEL,5*PIXEL,4*PIXEL);
    ctx.fillRect(8*PIXEL,2*PIXEL,3*PIXEL,2*PIXEL);
    ctx.fillRect(-1*PIXEL,-5*PIXEL,2*PIXEL,3*PIXEL);
    ctx.fillStyle="#222"; ctx.fillRect(-5*PIXEL,-1*PIXEL,2*PIXEL,2*PIXEL);
    ctx.restore();
  }

  function mobGhast(x, y, t, phase) {
    const bob = Math.sin(t*0.4+phase)*5;
    const dy = ~~bob;
    rect(x-5,y+dy,10,8,"rgba(255,255,255,0.88)");
    px(x-3,y+2+dy,"#555"); px(x-1,y+2+dy,"#555"); px(x+2,y+2+dy,"#555");
    rect(x-2,y+4+dy,4,1,"#555");
    for(let i=0;i<5;i++) rect(x-4+i*2,y+8+dy,1,3+rnd(i*7,3),"rgba(255,255,255,0.75)");
    ctx.save();
    const gg=ctx.createRadialGradient(x*PIXEL,(y+4+dy)*PIXEL,0,x*PIXEL,(y+4+dy)*PIXEL,12*PIXEL);
    gg.addColorStop(0,"rgba(255,200,200,0.12)"); gg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=gg; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.restore();
  }

  function mobZombie(x, y, t, phase) {
    const leg = Math.sin(t*2.5+phase)*2;
    rect(x-2,y,4,7,"#4CAF50");
    rect(x-2,y-5,4,5,"#2E7D32");
    px(x-1,y-4,"#FF0000"); px(x+1,y-4,"#FF0000");
    rect(x-5,y-2+~~leg,3,2,"#4CAF50");
    rect(x+2,y-2-~~leg,3,2,"#4CAF50");
    rect(x-1,y+7,2,3+~~leg,"#1B5E20"); rect(x+1,y+7,2,3-~~leg,"#1B5E20");
  }

  function mobBlaze(x, y, t, phase) {
    const bob=Math.sin(t*1.5+phase)*3;
    rect(x-2,y+~~bob,4,4,"#FFD54F");
    px(x-1,y+1+~~bob,"#333"); px(x+1,y+1+~~bob,"#333");
    rect(x-1,y+3+~~bob,2,1,"#333");
    for(let i=0;i<4;i++) {
      const a=t*2+phase+i*1.57;
      rect(x+~~(Math.cos(a)*5),y+2+~~bob+~~(Math.sin(a)*2),3,1,"#FF6F00");
    }
    ctx.save();
    const bg=ctx.createRadialGradient(x*PIXEL,(y+~~bob)*PIXEL,0,x*PIXEL,(y+~~bob)*PIXEL,8*PIXEL);
    bg.addColorStop(0,"rgba(255,160,0,0.2)"); bg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=bg; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.restore();
  }

  function mobEnderman(x, y, t, phase) {
    const visible = Math.sin(t*0.5+phase) > -0.3;
    const sway=Math.sin(t*0.3+phase)*1;
    if(!visible) return;
    rect(x-1,y+5,1,6,"#1a1a2a"); rect(x,y+5,1,6,"#1a1a2a");
    rect(x-2,y,4,6,"#1a1a2a");
    rect(x-1,y-4+~~sway,3,5,"#1a1a2a");
    px(x-1,y-3+~~sway,"#AA00FF"); px(x+1,y-3+~~sway,"#AA00FF");
    if(Math.sin(t*3+phase)>0.5) {
      ctx.save();
      const eg=ctx.createRadialGradient(x*PIXEL,(y-1)*PIXEL,0,x*PIXEL,(y-1)*PIXEL,7*PIXEL);
      eg.addColorStop(0,"rgba(150,0,255,0.25)"); eg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=eg; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.restore();
    }
  }

  function mobMooshroom(x, y, t, phase) {
    const graze=Math.abs(Math.sin(t*0.4+phase));
    rect(x-5,y,10,6,"#cc2020");
    rect(x-3,y+1,2,3,"rgba(255,255,255,0.5)");
    rect(x-4,y+6,2,4,"#aa1818"); rect(x-1,y+6,2,4,"#aa1818");
    rect(x+2,y+6,2,4,"#aa1818"); rect(x+3,y+6,2,4,"#aa1818");
    rect(x-3,y-3+~~(graze*2),4,4,"#cc2020");
    px(x-2,y-2+~~(graze*2),"#222"); px(x,y-2+~~(graze*2),"#222");
    rect(x-2,y-2,3,1,"#cc2020"); px(x-2,y-3,"#fff"); px(x,y-3,"#fff");
  }

  function mobWolf(x, y, t, phase) {
    const leg=Math.sin(t*4+phase)*2, tail=Math.sin(t*3+phase)*3;
    rect(x-4,y,9,5,"#9E9E9E");
    rect(x-5,y+2+~~tail,4,2,"#bbb");
    rect(x-4,y-4,6,5,"#9E9E9E");
    rect(x-4,y-6,2,3,"#9E9E9E"); rect(x+1,y-6,2,3,"#9E9E9E");
    px(x-3,y-3,"#222"); px(x+1,y-3,"#222");
    rect(x-3,y+5,2,3+~~leg,"#888"); rect(x,y+5,2,3-~~leg,"#888");
    rect(x+2,y+5,2,3+~~leg,"#888"); rect(x+3,y+5,2,3-~~leg,"#888");
  }

  function mobPolarBear(x, y, t, phase) {
    const leg=Math.sin(t*2.5+phase)*2;
    rect(x-5,y,11,7,"#e8f4ff");
    rect(x-4,y-4,7,5,"#e8f4ff");
    px(x-2,y-3,"#222"); px(x+2,y-3,"#222"); px(x,y-2,"#555");
    rect(x-3,y-6,2,2,"#e8f4ff"); rect(x+2,y-6,2,2,"#e8f4ff");
    rect(x-4,y+7,3,3+~~leg,"#d0e8f8"); rect(x+2,y+7,3,3-~~leg,"#d0e8f8");
  }

  function mobBat(x, y, t, phase) {
    const wing=Math.sin(t*6+phase)*4;
    rect(x-1,y,3,3,"#2a2a2a");
    rect(x-6,y+~~wing,5,2,"#333"); rect(x+2,y-~~wing,5,2,"#333");
    px(x,y-2,"#FF0000"); px(x+1,y-2,"#FF0000");
  }

  function mobSkeleton(x, y, t, phase) {
    const leg=Math.sin(t*3+phase)*2, arm=Math.sin(t*3+phase+1)*2;
    rect(x-2,y,4,7,"#e0e0e0");
    rect(x-6,y-1+~~arm,4,2,"#e0e0e0"); rect(x+2,y-1-~~arm,4,2,"#e0e0e0");
    rect(x-2,y-5,4,5,"#e0e0e0");
    px(x-1,y-4,"#1a1a1a"); px(x+1,y-4,"#1a1a1a");
    rect(x-1,y+7,2,3+~~leg,"#ccc"); rect(x+1,y+7,2,3-~~leg,"#ccc");
  }

  function mobHorse(x, y, t, phase) {
    const leg=Math.sin(t*5+phase)*4, neck=Math.sin(t*5+phase)*2;
    rect(x-6,y,12,7,"#C8A050");
    rect(x-3,y+7,3,4+~~leg,"#b89040"); rect(x+1,y+7,3,4-~~leg,"#b89040");
    rect(x-6,y+7,3,4-~~leg,"#b89040"); rect(x+4,y+7,3,4+~~leg,"#b89040");
    rect(x-1,y-5+~~neck,4,6,"#C8A050");
    rect(x+2,y-8+~~neck,3,4,"#C8A050");
    px(x+3,y-7+~~neck,"#333"); px(x+2,y-5+~~neck,"#DAA520");
    rect(x-1,y-5+~~neck,1,5,"#8B4513");
  }

  function mobSquid(x, y, t, phase) {
    const bob=Math.sin(t*0.8+phase)*3, pulse=Math.sin(t*1.5+phase)*0.4+0.6;
    rect(x-4,y+~~bob,8,6,`rgba(30,80,130,${0.8+pulse*0.15})`);
    for(let i=0;i<7;i++) {
      const tlen=2+~~(Math.sin(t+i*0.9)*1.5);
      rect(x-3+i,y+6+~~bob,1,tlen,"rgba(30,80,130,0.7)");
    }
    px(x-2,y+2+~~bob,"rgba(200,220,255,0.7)"); px(x+1,y+2+~~bob,"rgba(200,220,255,0.7)");
  }

  function mobWitherSkel(x, y, t, phase) {
    const leg=Math.sin(t*2.5+phase)*2;
    rect(x-1,y,3,10,"#1a1a1a"); rect(x-2,y-6,5,6,"#1a1a1a");
    px(x-1,y-5,"#FF0000"); px(x+1,y-5,"#FF0000");
    rect(x-5,y-3+~~leg,3,2,"#1a1a1a"); rect(x+2,y-3-~~leg,3,2,"#1a1a1a");
    rect(x+2,y-1,2,7,"#8B6914");
    rect(x-1,y+10,2,3+~~leg,"#111"); rect(x+1,y+10,2,3-~~leg,"#111");
  }

  function mobMagmaCube(x, y, t, phase) {
    const bounce=Math.abs(Math.sin(t*2.5+phase))*5;
    const sq=5-~~(bounce*0.4);
    rect(x-sq,y+~~bounce,sq*2,sq,"#B71C1C");
    rect(x-sq+1,y+~~bounce+1,sq*2-2,sq-2,"#FF4500");
    px(x-1,y+~~bounce+1,"#FFD54F"); px(x+2,y+~~bounce+2,"#FFD54F");
    px(x-2,y-2+~~bounce,"#333"); px(x+1,y-2+~~bounce,"#333");
  }

  function mobWitch(x, y, t, phase) {
    const bob=Math.sin(t*0.7+phase)*3;
    rect(x-3,y+~~bob,6,5,"#4a1a7a");
    rect(x-3,y-4+~~bob,5,5,"#5C9A44");
    px(x-1,y-3+~~bob,"#222"); px(x+1,y-3+~~bob,"#222");
    px(x,y-2+~~bob,"#cc2244");
    rect(x-3,y-5+~~bob,6,1,"#222"); rect(x-2,y-9+~~bob,4,5,"#222");
    rect(x-8,y+3+~~bob,14,1,"#8B6914");
    rect(x+5,y+2+~~bob,2,4,"#5D4037");
  }

  function mobTurtle(x, y, t, phase) {
    const walk=Math.sin(t*1+phase)*1;
    rect(x-5,y,10,5,"#3A7D44");
    rect(x-4,y+1,8,3,"#2D6535");
    px(x-1,y+1,"#1a4a20"); px(x+1,y+1,"#1a4a20"); px(x,y+2,"#1a4a20");
    rect(x-5,y+5,3,3,"#5C9E5C"); rect(x+3,y+5,3,3,"#5C9E5C");
    rect(x-3,y-2,5,3,"#5C9E5C");
    px(x-1,y-1,"#222"); px(x+1,y-1,"#222");
    rect(x-6,y+1+~~walk,2,3,"#5C9E5C"); rect(x+5,y+1-~~walk,2,3,"#5C9E5C");
  }

  function mobSlimeBounce(x, y, t, phase) {
    const b=Math.abs(Math.sin(t*2+phase))*4;
    rect(x-3,y+~~b,7,5,"rgba(80,200,60,0.85)");
    rect(x-2,y+1+~~b,5,3,"rgba(120,230,80,0.6)");
    px(x-1,y+2+~~b,"#1a3a0a"); px(x+2,y+2+~~b,"#1a3a0a");
    rect(x-2,y+4+~~b,4,1,"#1a3a0a");
  }

  function mobCrow(x, y, t, phase) {
    const wing=Math.sin(t*7+phase)*4;
    rect(x-1,y,3,3,"#1a1a1a");
    rect(x-5,y+~~wing,4,2,"#2a2a2a"); rect(x+2,y-~~wing,4,2,"#2a2a2a");
    px(x+1,y-2,"#FFD700");
    px(x-1,y-1,"#333");
  }

  function mobPuffer(x, y, t, phase) {
    const puff=Math.sin(t*1.2+phase)*2+3, bob=Math.sin(t*0.6+phase)*4;
    rect(x-~~puff,y+~~bob,~~puff*2,~~puff,"#e8c840");
    px(x-~~puff+1,y+~~bob+1,"#333"); px(x+~~puff-2,y+~~bob+1,"#333");
    if(puff>3) {
      px(x,y-1+~~bob,"#e8c840"); px(x-~~puff,y+~~puff/2+~~bob,"#e8c840");
      px(x+~~puff,y+~~puff/2+~~bob,"#e8c840"); px(x,y+~~puff+~~bob,"#e8c840");
    }
  }

  // ══════════════════════════════════════════════
  // HEROBRINE — The legend of the Nether
  // ══════════════════════════════════════════════
  function drawHerobrine(x, y, t) {
    const appear = Math.sin(t * 0.15) * 0.5 + 0.5;
    const flicker = Math.sin(t * 3.7) * 0.1 + 0.9;
    const sway = Math.sin(t * 0.2) * 1.5;
    const alpha = (appear * flicker).toFixed(2);
    if (appear < 0.05) return;

    ctx.save();
    const outerG = ctx.createRadialGradient(
      x*PIXEL, y*PIXEL, 0,
      x*PIXEL, y*PIXEL, 55*PIXEL
    );
    outerG.addColorStop(0, `rgba(200,220,255,${(appear*0.12).toFixed(3)})`);
    outerG.addColorStop(0.4, `rgba(150,180,255,${(appear*0.08).toFixed(3)})`);
    outerG.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = outerG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const innerG = ctx.createRadialGradient(
      x*PIXEL, (y-8)*PIXEL, 0,
      x*PIXEL, (y-8)*PIXEL, 20*PIXEL
    );
    innerG.addColorStop(0, `rgba(255,255,255,${(appear*0.25).toFixed(3)})`);
    innerG.addColorStop(0.5, `rgba(180,200,255,${(appear*0.1).toFixed(3)})`);
    innerG.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = innerG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    for(let i=0;i<8;i++) {
      const fx2 = x - 10 + i*3;
      const fy2 = y + 8;
      ctx.fillStyle = `rgba(200,230,255,${(appear*0.15).toFixed(3)})`;
      ctx.fillRect(fx2*PIXEL, fy2*PIXEL, (2+rnd(i*7,3))*PIXEL, PIXEL);
    }

    ctx.save();
    ctx.globalAlpha = parseFloat(alpha);

    rect(x-2+~~sway, y+4, 4, 9, "#5B8FD0");
    rect(x+2+~~sway, y+4, 4, 9, "#4A7CC0");
    rect(x-4+~~sway, y-3, 8, 8, "#6B8CFF");
    rect(x-8+~~sway, y-4, 4, 9, "#C68642");
    rect(x+4+~~sway, y-4, 4, 9, "#C68642");
    rect(x-4+~~sway, y-10, 8, 8, "#C68642");
    rect(x-4+~~sway, y-10, 8, 2, "#3a2010");
    rect(x-3+~~sway, y-8, 2, 2, "#FFFFFF");
    rect(x+1+~~sway, y-8, 2, 2, "#FFFFFF");
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = parseFloat((appear*0.6).toFixed(2));
    const eyeGlow = ctx.createRadialGradient(
      (x-2+~~sway)*PIXEL, (y-7)*PIXEL, 0,
      (x-2+~~sway)*PIXEL, (y-7)*PIXEL, 8*PIXEL
    );
    eyeGlow.addColorStop(0,"rgba(255,255,255,0.9)");
    eyeGlow.addColorStop(0.3,"rgba(200,220,255,0.5)");
    eyeGlow.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=eyeGlow;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    const eyeGlow2 = ctx.createRadialGradient(
      (x+2+~~sway)*PIXEL, (y-7)*PIXEL, 0,
      (x+2+~~sway)*PIXEL, (y-7)*PIXEL, 8*PIXEL
    );
    eyeGlow2.addColorStop(0,"rgba(255,255,255,0.9)");
    eyeGlow2.addColorStop(0.3,"rgba(200,220,255,0.5)");
    eyeGlow2.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=eyeGlow2;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.restore();

    for(let i=0;i<6;i++) {
      const px2 = x + Math.sin(t*0.8+i*1.05)*18;
      const py2 = y - 5 + Math.cos(t*0.6+i*0.9)*10;
      const pa = (appear * (Math.sin(t+i)*0.4+0.6)).toFixed(2);
      ctx.fillStyle = `rgba(200,220,255,${pa})`;
      ctx.fillRect(~~px2*PIXEL, ~~py2*PIXEL, 2*PIXEL, 2*PIXEL);
    }

    ctx.save();
    ctx.globalAlpha = (appear * 0.3).toFixed(2);
    ctx.fillStyle="rgba(100,120,180,0.2)";
    ctx.fillRect((x-12)*PIXEL, (y-14)*PIXEL, 24*PIXEL, 28*PIXEL);
    ctx.restore();
  }

  // ── SCENES ───────────────────────────────────────────────────
  const SCENES = {};

  // ── 1. PLAINS ────────────────────────────────────────────────
  SCENES["Plains"] = function(t) {
    const cw=W(),ch=H(),gnd=~~(ch*0.68);
    gradV([[0,"#FF9A3C"],[0.35,"#FFB347"],[0.65,"#87CEEB"],[1,"#7ec850"]]);
    sun(~~(cw*0.78),~~(ch*0.18),5,t);

    for(let i=0;i<5;i++) {
      const cx=((rnd(i*13,cw)+t*(6+i*2))%(cw+20))-10, cy=rnd(i*7+1,~~(ch*0.3))+5;
      const cw2=12+rnd(i*3,10);
      rect(cx,cy,cw2,4,"rgba(255,255,255,0.88)"); rect(cx+2,cy-2,cw2-4,3,"rgba(255,255,255,0.75)");
    }

    hills(pax(t,0.02,3),gnd-10,"#5aab2a",7,0.04);
    hills(pax(t,0.035,5),gnd-5,"#6abf38",5,0.06);
    rect(0,gnd,cw,ch-gnd,"#7ec850"); rect(0,gnd,cw,2,"#5a9e28"); rect(0,gnd+2,cw,5,"#8B6914");

    for(let i=0;i<22;i++) {
      const gx=((rnd(i*11,cw)+~~(pax(t,0.02,3)))%cw), gy=gnd-1;
      px(gx,gy-1,"#3a8a10"); px(gx+1,gy-2,"#4aaa18"); px(gx+2,gy-1,"#3a8a10");
    }
    for(let i=0;i<10;i++) {
      const fx=rnd(i*23+5,cw), fy=gnd-2;
      const cols=["#FF5252","#FF80AB","#FFFF00","#FFFFFF","#FF6D00"];
      px(fx,fy-1,cols[i%5]); px(fx,fy,"#5a9e28");
    }

    [0.1,0.28,0.65,0.85].forEach((f,i) => {
      const off=pax(t,0.025,3)*(i%2===0?1:-1);
      oak(~~(f*cw)+~~off,gnd,2,"#2d6a12","#3d8a1a","#5D4037");
    });

    const bigTree=~~(cw*0.5);
    oak(bigTree,gnd,3,"#2d6a12","#4a9a20","#5D4037");

    rect(~~(cw*0.72),gnd-4,8,4,"#C8A020"); rect(~~(cw*0.72),gnd-4,8,1,"#D4B030");

    // Campfire scene — Steve + Alex only
    const fx=~~(cw*0.38), fy=gnd-2;
    campfire(fx,fy,t); fireLight(fx,fy,25,t);
    drawSteve(fx-12,gnd-8,t);
    drawAlex(fx+14,gnd-8,t+1);

    // A few animals — not all at once
    drawSheep(~~(cw*0.18),gnd-7,t);
    drawCow(~~(cw*0.8),gnd-10,t+0.5);
    drawVillager(~~(cw*0.9),gnd-8,t+0.7);

    // Walking mobs — reduced to 2-3
    mobSheep(walkX(t,0,12,cw), gnd-12, t, "#e8e8e8");
    mobCow(walkX(t,1,10,cw), gnd-14, t);
    mobChicken(walkX(t,2,7,cw), gnd-8, t, 1);
    mobHorse(walkX(t,3,14,cw), gnd-12, t, 0.5);
    // One bird overhead
    mobBird(~~(cw*0.35)+~~(Math.sin(t*0.7)*40), gnd-45+~~(Math.sin(t*1.1)*12), "#FFFFFF");

    drawCave(t,'Plains');
    vignette(0.28);
  };

  // ── 2. FOREST ────────────────────────────────────────────────
  SCENES["Forest"] = function(t) {
    const cw=W(),ch=H(),gnd=~~(ch*0.70);
    gradV([[0,"#050a10"],[0.5,"#0d1525"],[1,"#0d200a"]]);
    stars(t,70,0.95);
    moon(~~(cw*0.78),~~(ch*0.11),6,"#E8E8D0");

    const off1=pax(t,0.02,4);
    for(let i=0;i<14;i++) {
      const tx=((rnd(i*17+5,cw+20)+off1)%(cw+20))-10;
      pine(tx,gnd-2,2,"#0d2e08","#1a4a10");
    }
    rect(0,gnd,cw,ch-gnd,"#0d2208"); rect(0,gnd,cw,2,"#0a1a06");
    for(let i=0;i<10;i++) rect(rnd(i*17,cw),gnd,3+rnd(i*3,4),1,"#1a3a10");

    const off2=pax(t,0.035,5);
    [0.04,0.18,0.42,0.65,0.82,0.95].forEach((f,i) => {
      const tx=~~(f*cw)+~~(off2*(i%2===0?1:-1));
      oak(tx,gnd,3+(i%2),"#0d3a08","#1a5510","#2E1810");
      for(let v=0;v<3;v++) {
        const vx=tx-2+v*2, vlen=4+rnd(v*7+i,6);
        const vsway=Math.sin(t*0.4+i+v);
        for(let vy=0;vy<vlen;vy++) px(~~(vx+vsway*(vy/vlen)),vy+2,"#1a5510");
      }
    });

    // Fireflies
    for(let i=0;i<18;i++) {
      const glow=Math.sin(t*2+i*1.8)>0.3;
      if(glow) {
        const ffx=rnd(i*23+1,cw), ffy=gnd-5-rnd(i*7,25);
        px(ffx,ffy,"#CCFF44");
        ctx.save();
        const gl=ctx.createRadialGradient(ffx*PIXEL,ffy*PIXEL,0,ffx*PIXEL,ffy*PIXEL,5*PIXEL);
        gl.addColorStop(0,"rgba(180,255,50,0.5)"); gl.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=gl; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
      }
    }

    // Campfire — Steve + Wolf
    const fx=~~(cw*0.45), fy=gnd-2;
    campfire(fx,fy,t); fireLight(fx,fy,30,t);
    drawSteve(fx-14,gnd-8,t);
    drawWolf(fx+16,gnd-10,t+0.5);
    drawOcelot(~~(cw*0.75),gnd-7,t+0.3);

    // Mushrooms
    for(let i=0;i<6;i++) {
      const mx=rnd(i*19+3,cw), my=gnd-3;
      rect(mx,my,1,3,"#d0b090"); rect(mx-1,my-1,3,2,"#cc2020");
    }

    // Reduced mobs — wolf, fox, one bat
    mobWolf(walkX(t,0,10,cw), gnd-10, t, 0.8);
    mobFox(walkX(t,1,14,cw), gnd-9, t, 0.5);
    mobBat(~~(cw*0.4)+~~(Math.sin(t*1.3)*60), gnd-30+~~(Math.sin(t*2.1)*15), t, 0);
    mobCrow(~~(cw*0.6)+~~(Math.sin(t*0.5)*35), gnd-48+~~(Math.sin(t*1.0)*12), t, 1.5);

    drawCave(t,'Forest');
    vignette(0.6);
  };

  // ── 3. DESERT ────────────────────────────────────────────────
  SCENES["Desert"] = function(t) {
    const cw=W(),ch=H(),gnd=~~(ch*0.65);
    gradV([[0,"#FF6B00"],[0.35,"#FF8C2A"],[0.65,"#FFD580"],[1,"#e8c46a"]]);
    sun(~~(cw*0.85),~~(ch*0.1),7,t);

    for(let i=0;i<6;i++) {
      const hy=gnd-3-i, wave=Math.sin(t*3+i*1.5)*2;
      ctx.fillStyle=`rgba(255,180,80,${0.06-i*0.008})`;
      ctx.fillRect(0,(hy+wave)*PIXEL,canvas.width,PIXEL);
    }

    hills(pax(t,0.015,5),gnd-8,"#c8a84b",9,0.035);
    hills(pax(t,0.025,7),gnd-3,"#d4b45a",6,0.055);
    rect(0,gnd,cw,ch-gnd,"#d4b45a"); rect(0,gnd,cw,2,"#b8963a");

    // Temple
    const tx=~~(cw*0.7);
    rect(tx,gnd-18,12,18,"#C8A84B"); rect(tx+1,gnd-18,10,16,"#D4B45A");
    rect(tx,gnd-20,4,3,"#C8A84B"); rect(tx+8,gnd-20,4,3,"#C8A84B");
    rect(tx+3,gnd-13,3,8,"#8B6914");
    for(let i=0;i<3;i++) { px(tx+1,gnd-16+i*3,"#8B6914"); px(tx+2,gnd-15+i*3,"#8B6914"); }

    [[0.18,0],[0.52,2],[0.82,-1]].forEach(([f,yo]) => {
      const cx2=~~(f*cw), cy=gnd+yo;
      rect(cx2-1,cy-12,2,12,"#2e7d32");
      rect(cx2-4,cy-8,3,2,"#2e7d32"); rect(cx2-4,cy-10,2,3,"#2e7d32");
      rect(cx2+2,cy-7,3,2,"#2e7d32"); rect(cx2+3,cy-9,2,3,"#2e7d32");
    });

    for(let i=0;i<5;i++) rect(rnd(i*19+3,cw),gnd-1,4+rnd(i,3),1,"#E8D090");

    // Steve + one skeleton
    const ffx=~~(cw*0.38), ffy=gnd-2;
    campfire(ffx,ffy,t); fireLight(ffx,ffy,22,t);
    drawSteve(ffx-12,gnd-8,t);
    drawSkeleton(~~(cw*0.22),gnd-10,t+0.5);
    drawCreeper(~~(cw*0.88),gnd-11,t+1);

    // Reduced mobs — one skeleton, one zombie, one bird
    mobSkeleton(walkX(t,0,9,cw), gnd-12, t, 0);
    mobZombie(walkX(t,1,7,cw), gnd-10, t, 0.3);
    mobBird(~~(cw*0.5)+~~(Math.sin(t*0.4)*60), gnd-70+~~(Math.sin(t*0.6)*20), "#8B7355");

    drawCave(t,'Desert');
    vignette(0.18);
  };

  // ── 4. TAIGA ─────────────────────────────────────────────────
  SCENES["Taiga"] = function(t) {
    const cw=W(),ch=H(),gnd=~~(ch*0.68);
    gradV([[0,"#0a0f1e"],[0.4,"#1a2040"],[0.7,"#4a3070"],[1,"#1a3010"]]);
    stars(t,45,0.75);
    moon(~~(cw*0.22),~~(ch*0.14),7,"#D0E8E0");

    // Aurora
    for(let i=0;i<5;i++) {
      const ay=~~(ch*0.08)+i*5, wave=Math.sin(t*0.4+i*0.9)*10;
      const alpha=0.08+Math.sin(t*0.6+i)*0.05;
      ctx.fillStyle=`rgba(${i%2===0?40:20},${180+i*10},${100+i*25},${alpha})`;
      ctx.fillRect(0,(ay+wave)*PIXEL,canvas.width,4*PIXEL);
    }

    hills(pax(t,0.02,4),gnd-6,"#1e3d14",6,0.045);
    rect(0,gnd,cw,ch-gnd,"#1e3d14"); rect(0,gnd,cw,3,"#b8d8b0");
    for(let i=0;i<10;i++) rect(rnd(i*13,cw),gnd,4+rnd(i*3,6),1,"rgba(220,240,220,0.6)");

    const off2=pax(t,0.035,5);
    [0.06,0.18,0.34,0.52,0.66,0.80,0.93].forEach((f,i) => {
      const tx=~~(f*cw)+~~(off2*(i%2===0?1:-1));
      pine(tx,gnd,2+(i%2),"#0d2e0a","#1a4a12");
      rect(tx-1,gnd-13,4,2,"#c8ddc0");
    });

    // Snowflakes
    for(let i=0;i<30;i++) {
      const sx=(rnd(i*13,cw)+~~(t*(2+i%3)))%cw;
      const sy=(rnd(i*7+2,ch)+~~(t*(3+i%4)))%ch;
      px(sx,sy,`rgba(220,240,255,${0.6+Math.sin(t+i)*0.3})`);
    }

    // Steve + Alex at campfire, wolf nearby
    const fx=~~(cw*0.5), fy=gnd-2;
    campfire(fx,fy,t); fireLight(fx,fy,28,t);
    drawSteve(fx-14,gnd-8,t);
    drawAlex(fx+12,gnd-8,t+0.8);
    drawFox(~~(cw*0.88),gnd-8,t+0.6);

    // Reduced mobs — wolf, polar bear, fox
    mobWolf(walkX(t,0,9,cw), gnd-10, t, 0);
    mobPolarBear(walkX(t,1,6,cw), gnd-12, t, 1.0);
    mobFox(walkX(t,2,8,cw), gnd-9, t, 0.3);

    drawCave(t,'Taiga');
    vignette(0.52);
  };

  // ── 5. SNOWY TUNDRA ──────────────────────────────────────────
  SCENES["Snowy Tundra"] = function(t) {
    const cw=W(),ch=H(),gnd=~~(ch*0.65);
    gradV([[0,"#050a12"],[0.5,"#101830"],[1,"#1a2a40"]]);
    stars(t,30,0.55);

    // Blizzard
    for(let i=0;i<20;i++) {
      const wy=rnd(i*11,ch), wl=5+rnd(i*3,10);
      const wx=(rnd(i*17,cw)+~~(t*(20+i%6)*3))%(cw+20)-10;
      ctx.fillStyle=`rgba(200,220,255,${0.25+0.15*(i%3)})`;
      ctx.fillRect(wx*PIXEL,wy*PIXEL,wl*PIXEL,PIXEL);
    }

    rect(0,gnd,cw,ch-gnd,"#c0d8ec"); rect(0,gnd,cw,3,"#e8f4ff");
    hills(pax(t,0.01,3),gnd-4,"#d0e8f8",4,0.04);

    [[0.12,12],[0.28,8],[0.55,15],[0.72,10],[0.88,13]].forEach(([f,h]) => {
      const ix=~~(f*cw);
      for(let y=0;y<h;y++) {
        const w=Math.max(1,~~((h-y)/h*3+0.5));
        rect(ix-w,gnd-y,w*2,1,"#a0c8e0");
      }
    });

    [0.12,0.45,0.78].forEach(f => {
      const tx=~~(f*cw);
      rect(tx,gnd-12,2,12,"#4a5560");
      rect(tx-4,gnd-9,4,1,"#4a5560"); rect(tx+2,gnd-7,4,1,"#4a5560");
    });

    // Steve + two polar bears, one rabbit
    const fx=~~(cw*0.45), fy=gnd-2;
    campfire(fx,fy,t*1.3); fireLight(fx,fy,20,t);
    drawSteve(fx-12,gnd-8,t);
    drawPolarBear(~~(cw*0.25),gnd-10,t+0.4);
    drawRabbit(~~(cw*0.6),gnd-9,t+0.7);

    // Minimal walking mobs
    mobPolarBear(walkX(t,0,5,cw), gnd-12, t, 0);
    mobRabbit(walkX(t,1,16,cw), gnd-10, t, 0.3);

    drawCave(t,'Snowy Tundra');
    vignette(0.68);
  };

  // ── 6. SAVANNA ───────────────────────────────────────────────
  SCENES["Savanna"] = function(t) {
    const cw=W(),ch=H(),gnd=~~(ch*0.67);
    gradV([[0,"#CC3300"],[0.28,"#FF5500"],[0.55,"#FF8C00"],[0.75,"#FFB347"],[1,"#8B6914"]]);
    sun(~~(cw*0.12),~~(ch*0.52),6,t);

    hills(pax(t,0.015,3),gnd-8,"#1a0e00",6,0.035);
    rect(0,gnd,cw,ch-gnd,"#8B6914"); rect(0,gnd,cw,2,"#a07d1a");

    for(let i=0;i<28;i++) {
      const gx=rnd(i*13,cw), swing=Math.sin(t*1.2+i)*1.2;
      for(let h=0;h<4;h++) {
        const col=h<2?"#c8a020":"#d4aa28";
        px(~~(gx+swing*(h/3)),gnd-1-h,col);
      }
    }
    for(let i=0;i<8;i++) rect(rnd(i*19,cw),gnd-2,3+rnd(i,3),2,"#8B7355");

    [[0.15,0],[0.48,1],[0.72,-1],[0.9,0]].forEach(([f,yo],i) => {
      const tx=~~(f*cw);
      rect(tx+(i%2)*2,gnd+yo-10,2,10,"#5D3A00");
      rect(tx+1+(i%2)*2,gnd+yo-12,2,4,"#5D3A00");
      rect(tx-7,gnd+yo-15,16,4,"#1a4a00"); rect(tx-6,gnd+yo-17,14,3,"#256600");
    });

    // Steve + Alex, ocelot
    const ffx=~~(cw*0.35), ffy=gnd-2;
    campfire(ffx,ffy,t); fireLight(ffx,ffy,25,t);
    drawSteve(ffx-13,gnd-8,t);
    drawAlex(ffx+12,gnd-8,t+0.9);
    drawOcelot(~~(cw*0.65),gnd-7,t+0.6);

    // Reduced mobs — horse, one cow, one bird
    mobHorse(walkX(t,0,12,cw), gnd-12, t, 0);
    mobCow(walkX(t,1,7,cw), gnd-14, t);
    mobBird(~~(cw*0.5)+~~(Math.cos(t*0.4)*80), ~~(ch*0.2)+~~(Math.sin(t*0.4)*15), "#8B7355");

    drawCave(t,'Savanna');
    vignette(0.3);
  };

  // ── 7. JUNGLE ────────────────────────────────────────────────
  SCENES["Jungle"] = function(t) {
    const cw=W(),ch=H(),gnd=~~(ch*0.72);

    gradV([[0,"#0a2010"],[0.35,"#0d3015"],[0.65,"#1a4a20"],[1,"#1a3a10"]]);
    stars(t,10,0.25);

    ctx.save();
    const ambG = ctx.createLinearGradient(0,0,0,canvas.height);
    ambG.addColorStop(0,"rgba(0,0,0,0)");
    ambG.addColorStop(0.5,"rgba(20,80,20,0.18)");
    ambG.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=ambG; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.restore();

    const off1=pax(t,0.015,3);
    for(let i=0;i<10;i++) {
      const tx=(rnd(i*11,cw)+off1)%cw;
      oak(tx,gnd-6,4+(i%2),"#1a6614","#2a8820","#2E1A0E");
    }

    rect(0,gnd,cw,ch-gnd,"#1a4a10"); rect(0,gnd,cw,2,"#2a6a18");
    for(let i=0;i<15;i++) rect(rnd(i*17,cw),gnd,2+rnd(i*3,4),1,"#3a8822");

    [0.05,0.28,0.58,0.83].forEach((f,i) => {
      const tx=~~(f*cw), s=3+(i%2);
      oak(tx,gnd,s,"#1a6614","#2a8820","#3E2010");
      rect(tx-s*2,gnd-s,s,s,"#2E1A0E"); rect(tx+s,gnd-s,s,s,"#2E1A0E");
    });

    for(let i=0;i<8;i++) {
      const vx=rnd(i*23+3,cw), vlen=8+rnd(i*7,14);
      const vsway=Math.sin(t*0.4+i*1.3)*1.5;
      for(let vy=0;vy<vlen;vy++) {
        px(~~(vx+vsway*(vy/vlen)),vy+2,"#2a7a18");
        if(vy%3===0) px(~~(vx+vsway*(vy/vlen))+1,vy+3,"#1a5510");
      }
    }

    for(let i=0;i<16;i++) {
      const lx=rnd(i*17,cw), sway=Math.sin(t*0.6+i)*2;
      rect(~~(lx+sway),gnd-5,6,3,"#2a8822");
    }

    // Fireflies
    for(let i=0;i<18;i++) {
      if(Math.sin(t*2.5+i*1.4)>0.3) {
        const ffx=rnd(i*19,cw), ffy=gnd-4-rnd(i*11,22);
        px(ffx,ffy,"#AAFF44"); px(ffx+1,ffy,"#AAFF44");
        ctx.save();
        const gl=ctx.createRadialGradient(ffx*PIXEL,ffy*PIXEL,0,ffx*PIXEL,ffy*PIXEL,6*PIXEL);
        gl.addColorStop(0,"rgba(160,255,60,0.55)"); gl.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=gl; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
      }
    }

    // Campfire — Steve + parrot
    const fx=~~(cw*0.42), fy=gnd-2;
    campfire(fx,fy,t);
    fireLight(fx,fy,35,t);
    ctx.save();
    const spotG=ctx.createRadialGradient(fx*PIXEL,(fy-2)*PIXEL,0,fx*PIXEL,(fy-2)*PIXEL,28*PIXEL);
    spotG.addColorStop(0,"rgba(255,200,80,0.18)");
    spotG.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=spotG; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.restore();

    drawSteve(fx-14,gnd-8,t);
    drawParrot(fx-14,gnd-28,t+0.5);

    // Cat chasing creeper
    const chaseSpeed = t * 28;
    const creepX = ~~(cw*0.1) + (~~chaseSpeed % (cw + 60));
    const catX   = creepX - 20;
    const runLeg = Math.sin(t*8)*3;
    rect(creepX-3,gnd-12,6,6,"#388E3C");
    rect(creepX-3,gnd-6,3,6+~~runLeg,"#2E7D32"); rect(creepX,gnd-6,3,6-~~runLeg,"#2E7D32");
    rect(creepX-3,gnd-17,6,6,"#388E3C");
    rect(creepX-2,gnd-16,2,2,"#1B5E20"); rect(creepX+1,gnd-16,2,2,"#1B5E20");
    rect(creepX-1,gnd-13,1,2,"#1B5E20"); rect(creepX+1,gnd-13,1,2,"#1B5E20");
    for(let i=1;i<4;i++) {
      ctx.fillStyle=`rgba(255,255,255,${0.3-i*0.08})`;
      ctx.fillRect((creepX-6-i*4)*PIXEL,(gnd-14+i)*PIXEL,4*PIXEL,PIXEL);
    }

    if(catX > -20 && catX < cw+20) {
      const catRun=Math.sin(t*10)*3;
      rect(catX-3,gnd-8,7,4,"#C8A850");
      px(catX-1,gnd-7,"#8B6914"); px(catX+2,gnd-6,"#8B6914");
      rect(catX-2,gnd-4,2,4+~~catRun,"#B89030"); rect(catX+1,gnd-4,2,4-~~catRun,"#B89030");
      rect(catX+4,gnd-12+~~(Math.sin(t*5)*2),1,8,"#C8A850");
      rect(catX-4,gnd-10,5,5,"#C8A850");
      rect(catX-4,gnd-12,2,3,"#C8A850"); rect(catX-1,gnd-12,2,3,"#C8A850");
      px(catX-3,gnd-9,"#222"); px(catX-1,gnd-9,"#222");
    }

    // Just one rabbit and a frog — no extra mobs
    mobRabbit(walkX(t,0,19,cw), gnd-10, t, 0.8);
    const frx=~~(cw*0.2)+~~(Math.sin(t*0.7)*20), fry=gnd-4;
    const fhop=Math.abs(Math.sin(t*2.5))*5;
    rect(frx-2,fry-~~fhop,5,3,"#228B22"); rect(frx-4,fry+1-~~fhop,3,2,"#1a7a14");
    rect(frx+2,fry+1-~~fhop,3,2,"#1a7a14"); px(frx-1,fry-1-~~fhop,"#DAA520"); px(frx+1,fry-1-~~fhop,"#DAA520");

    drawCave(t,'Jungle');
    vignette(0.55);
  };

  // ── 8. SWAMP ─────────────────────────────────────────────────
  SCENES["Swamp"] = function(t) {
    const cw=W(),ch=H(),gnd=~~(ch*0.63);
    gradV([[0,"#050e05"],[0.5,"#0a1a0a"],[1,"#122010"]]);
    stars(t,20,0.25);

    for(let i=0;i<5;i++) {
      const fy2=gnd-10+i*4, wave=Math.sin(t*0.25+i*0.8)*6;
      ctx.fillStyle=`rgba(50,70,30,${0.12+i*0.04})`;
      ctx.fillRect(0,(fy2+wave)*PIXEL,canvas.width,7*PIXEL);
    }

    rect(0,gnd,cw,ch-gnd,"#0d2e0d"); rect(0,gnd,cw,2,"#1a4a14");

    for(let i=0;i<7;i++) {
      const rx=rnd(i*17,cw-12), ry=gnd+2+rnd(i*7,6), rw=5+rnd(i*3,8);
      ctx.fillStyle=`rgba(80,130,60,${0.25+Math.sin(t*2+i)*0.12})`;
      ctx.fillRect(rx*PIXEL,ry*PIXEL,rw*PIXEL,PIXEL);
    }

    for(let i=0;i<5;i++) {
      const lx=rnd(i*23+7,cw-8), ly=gnd+3+rnd(i*11,5);
      rect(lx,ly,6+rnd(i,3),2,"#1a6614");
      if(i%2===0) px(lx+3,ly-1,"#FFD700");
    }

    [0.08,0.3,0.62,0.85].forEach((f,i) => {
      const tx=~~(f*cw);
      rect(tx,gnd-15,2,15,"#1a2a1a");
      rect(tx-5,gnd-12,10,5,"#0d1e0d");
      for(let m=0;m<4;m++) {
        const mx=tx-3+m*2, mlen=3+rnd(m*7+i,5), msway=Math.sin(t*0.3+i+m)*1.2;
        for(let my=0;my<mlen;my++) px(~~(mx+msway),gnd-10+my,"#1e4a14");
      }
    });

    for(let i=0;i<6;i++) {
      const wx=rnd(i*31,cw), boby=gnd-10-rnd(i*9,15)+Math.sin(t+i*1.8)*3;
      const glow=Math.sin(t*1.3+i*2)*0.5+0.5;
      if(glow>0.25) {
        ctx.save();
        const wg=ctx.createRadialGradient(wx*PIXEL,boby*PIXEL,0,wx*PIXEL,boby*PIXEL,6*PIXEL);
        wg.addColorStop(0,`rgba(80,255,120,${glow*0.7})`); wg.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=wg; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
        px(wx,~~boby,"#AAFFBB");
      }
    }

    // Witch + Steve at campfire, two slimes
    const fx=~~(cw*0.5), fy=gnd-2;
    campfire(fx,fy,t); fireLight(fx,fy,22,t);
    drawWitch(fx-14,gnd-10,t);
    drawSteve(fx+13,gnd-8,t+0.5);
    drawSlime(~~(cw*0.25),gnd-8,t+0.3);

    // Reduced mobs — witch on broom, one zombie, two bats
    mobWitch(~~(cw*0.25)+~~(Math.sin(t*0.4)*40), gnd-40+~~(Math.sin(t*0.6)*12), t, 0);
    mobZombie(walkX(t,0,6,cw), gnd-10, t, 1.2);
    mobBat(~~(cw*0.4)+~~(Math.sin(t*1.8)*25), gnd-30+~~(Math.sin(t*1.3)*10), t, 0);
    mobBat(~~(cw*0.7)+~~(Math.sin(t*1.5)*20), gnd-22+~~(Math.sin(t*1.7)*8),  t, 1.2);

    drawCave(t,'Swamp');
    vignette(0.78);
  };

  // ── 9. OCEAN ─────────────────────────────────────────────────
  SCENES["Ocean"] = function(t) {
    const cw=W(),ch=H(),wl=~~(ch*0.42);
    gradV([[0,"#000408"],[0.38,"#000d1e"],[0.52,"#001635"],[1,"#002855"]]);
    stars(t,90,1.0);
    moon(~~(cw*0.72),~~(ch*0.11),7,"#FFFDE0");

    const mrx=~~(cw*0.72);
    for(let i=0;i<10;i++) {
      const ry=wl+3+i*2, rw=7-i, wave=Math.sin(t*2+i)*3;
      if(rw>0) rect(mrx-rw+~~wave,ry,rw*2,1,`rgba(255,255,200,${0.3-i*0.025})`);
    }

    for(let layer=0;layer<6;layer++) {
      const speed=0.7+layer*0.35;
      for(let x=0;x<cw;x++) {
        const wy=wl+layer*3+~~(Math.sin(x*0.07+t*speed)*(2+layer))+~~(Math.sin(x*0.12+t*speed*0.8)*1.5);
        ctx.fillStyle=`rgba(${10+layer*4},${40+layer*14},${90+layer*22},${0.14+layer*0.07})`;
        ctx.fillRect(x*PIXEL,wy*PIXEL,PIXEL,(3+layer)*PIXEL);
      }
    }
    rect(0,wl,cw,ch-wl,"#001635");

    ctx.save();
    const ug=ctx.createLinearGradient(0,wl*PIXEL,0,canvas.height);
    ug.addColorStop(0,"rgba(0,50,120,0.3)"); ug.addColorStop(1,"rgba(0,20,60,0.6)");
    ctx.fillStyle=ug; ctx.fillRect(0,wl*PIXEL,canvas.width,canvas.height-wl*PIXEL); ctx.restore();

    const shore=~~(ch*0.62);
    hills(pax(t,0.01,2),shore,"#2a2a3a",5,0.03);
    rect(0,shore,cw,ch-shore,"#2a2a3a");

    // Lighthouse
    const lhx=~~(cw*0.82);
    rect(lhx-2,shore-20,4,20,"#e8e0d0");
    for(let i=0;i<5;i++) rect(lhx-2,shore-4-i*4,4,1,"#cc2020");
    rect(lhx-3,shore-22,6,4,"#888");
    const beamAlpha=0.15+Math.sin(t*2)*0.1;
    ctx.save();
    const beam=ctx.createRadialGradient(lhx*PIXEL,(shore-20)*PIXEL,0,lhx*PIXEL,(shore-20)*PIXEL,30*PIXEL);
    beam.addColorStop(0,`rgba(255,255,180,${beamAlpha})`); beam.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=beam; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();

    // Steve fishing, two dolphins, squid, turtle
    drawSteve(~~(cw*0.3),shore-8,t);
    const rodx=~~(cw*0.3)+3, rody=shore-10;
    for(let i=0;i<12;i++) px(rodx+i,rody+i*2,"rgba(200,200,200,0.6)");
    px(rodx+12,rody+24,"#f00");
    fireLight(~~(cw*0.3),shore-2,18,t);
    drawDolphin(~~(cw*0.28),wl+4,t);
    drawDolphin(~~(cw*0.48),wl+6,t+1.2);
    drawSquid(~~(cw*0.35),wl+8,t+0.5);
    drawTurtle(~~(cw*0.55),shore-4,t+0.8);

    // Reduced mobs — two dolphins, one squid, one seagull
    mobDolphin(~~(cw*0.25), ~~(ch*0.38), t, 0);
    mobDolphin(~~(cw*0.6),  ~~(ch*0.36), t, 1.2);
    mobSquid(walkX(t,0,5,cw), ~~(ch*0.44), t, 0);
    mobBird(~~(cw*0.4)+~~(Math.sin(t*0.6)*50), ~~(ch*0.3)+~~(Math.sin(t*0.9)*15), "#FFFFFF");

    drawCave(t,'Ocean');
    vignette(0.52);
  };

  // ── 10. NETHER ───────────────────────────────────────────────
  SCENES["Nether"] = function(t) {
    const cw=W(),ch=H(),gnd=~~(ch*0.68);
    gradV([[0,"#0e0000"],[0.4,"#2a0000"],[0.7,"#500000"],[1,"#7a0000"]]);

    for(let i=0;i<8;i++) {
      const cx2=rnd(i*23,cw), clen=10+rnd(i*7,15);
      ctx.fillStyle=`rgba(255,${60+i*10},0,${0.35+Math.sin(t*3+i)*0.18})`;
      ctx.fillRect(cx2*PIXEL,0,clen*PIXEL,PIXEL*3);
    }

    [0.08,0.22,0.45,0.65,0.8,0.94].forEach((f,i) => {
      const px2=~~(f*cw), ph=10+rnd(i*11,12);
      rect(px2-3,gnd-ph,6,ph,"#3a0a0a"); rect(px2-2,gnd-ph-1,4,2,"#2a0505");
      px(px2-1,gnd-ph+3,`rgba(255,60,0,0.4)`);
    });

    [[0.05,10],[0.32,14],[0.6,10],[0.82,16]].forEach(([f,w],i) => {
      const lx=~~(f*cw), lf=Math.sin(t*4+i*2)*0.5+0.5;
      rect(lx,gnd+1,w,4,`rgba(255,${60+~~(lf*40)},0,1)`);
      rect(lx+1,gnd+1,w-2,1,`rgba(255,${150+~~(lf*50)},0,0.9)`);
      if(Math.sin(t*3+i*1.5)>0.7) px(lx+~~(w/2),gnd,`rgba(255,200,0,0.8)`);
    });

    rect(0,gnd,cw,ch-gnd,"#3a0a0a"); rect(0,gnd,cw,2,"#500f0f");
    for(let i=0;i<12;i++) px(rnd(i*19,cw),gnd+rnd(i*7,3),`rgba(255,40,0,0.3)`);

    ctx.save();
    const lg=ctx.createLinearGradient(0,gnd*PIXEL,0,canvas.height);
    lg.addColorStop(0,`rgba(255,50,0,${0.18+Math.sin(t*1.5)*0.04})`); lg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=lg; ctx.fillRect(0,gnd*PIXEL,canvas.width,canvas.height-gnd*PIXEL); ctx.restore();

    for(let i=0;i<25;i++) {
      const ax=(rnd(i*13,cw)+~~(t*(1+i%3)))%cw;
      const ay=(rnd(i*7,ch)+~~(t*(2+i%4)*2))%ch;
      px(ax,ay,"rgba(60,15,0,0.55)");
    }

    // Soul fire
    const sfx=~~(cw*0.45), sfy=gnd-2;
    rect(sfx-3,sfy+2,6,2,"#2a0505");
    for(let layer=0;layer<3;layer++) {
      const flick=Math.sin(t*8+layer)*0.5+0.5, fh=3+layer+~~(flick*2);
      for(let dy=0;dy<fh;dy++) {
        const fw=Math.max(1,3-layer-~~(dy*0.5));
        for(let dx=-fw;dx<=fw;dx++)
          px(sfx+dx,sfy-dy,["#0055FF","#0088FF","#00CCFF"][layer]);
      }
    }
    fireLight(sfx,sfy,32,t);

    // Characters — Steve, Ghast, Blaze, Magma Cube
    drawSteve(~~(cw*0.32),gnd-8,t);
    drawGhast(~~(cw*0.7),~~(ch*0.25),t);
    drawBlaze(~~(cw*0.15),gnd-18,t+0.5);
    drawMagmaCube(~~(cw*0.6),gnd-8,t+0.3);

    ctx.save();
    const ng=ctx.createRadialGradient(canvas.width*.5,canvas.height,0,canvas.width*.5,canvas.height,canvas.width*.65);
    ng.addColorStop(0,`rgba(255,30,0,${0.14+Math.sin(t*1.2)*0.04})`); ng.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=ng; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();

    // Reduced mobs — one ghast, one blaze, one wither skel, one magma cube
    mobGhast(~~(cw*0.25), ~~(H()*0.2), t, 0.0);
    mobBlaze(~~(cw*0.55)+~~(Math.sin(t*0.4)*20), ~~(H()*0.55), t, 0.5);
    mobWitherSkel(walkX(t,0,7,cw), gnd-14, t, 0);
    mobMagmaCube(walkX(t,1,6,cw), gnd-9, t, 0);

    // ── HEROBRINE — single instance, lurking in the distance ──
    const hbX = ~~(cw * 0.78);
    const hbY = ~~(H() * 0.62) - 14;
    drawHerobrine(hbX, hbY, t);

    // Eerie screen-wide chill when Herobrine is visible
    const hbAppear = Math.sin(t*0.15)*0.5+0.5;
    if(hbAppear > 0.5) {
      ctx.save();
      ctx.globalAlpha = ((hbAppear-0.5)*0.12).toFixed(3);
      ctx.fillStyle = "rgba(150,180,255,1)";
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.restore();
    }

    drawCave(t,'Nether');
    vignette(0.42);
  };

  // ── 11. THE END ──────────────────────────────────────────────
  SCENES["The End"] = function(t) {
    const cw=W(),ch=H(),gnd=~~(ch*0.68);
    gradV([[0,"#000003"],[0.5,"#04000c"],[1,"#080018"]]);

    for(let i=0;i<140;i++) {
      const sx=rnd(i*31+7,cw), sy=rnd(i*17+3,~~(ch*0.85));
      const tw=0.25+0.75*Math.abs(Math.sin(t*1.1+i*1.9));
      const cols=["rgba(255,255,220","rgba(220,180,255","rgba(180,220,255","rgba(255,200,255"];
      px(sx,sy,`${cols[i%4]},${tw.toFixed(2)})`);
    }

    // End portal
    const epx=~~(cw*0.72), epy=~~(ch*0.28);
    for(let i=0;i<6;i++) {
      const pr=5+i*3, pa=0.04+Math.sin(t*0.7+i)*0.025;
      ctx.save();
      const pg=ctx.createRadialGradient(epx*PIXEL,epy*PIXEL,0,epx*PIXEL,epy*PIXEL,pr*PIXEL);
      pg.addColorStop(0,`rgba(80,0,200,${pa*4})`); pg.addColorStop(0.5,`rgba(40,0,100,${pa})`); pg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=pg; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
    }

    rect(0,gnd,cw,ch-gnd,"#d4c87e"); rect(0,gnd,cw,2,"#c8b870");
    for(let i=0;i<20;i++) rect(rnd(i*13,cw-3),gnd+rnd(i*7,5),2+rnd(i*3,3),1,"#bba858");

    [0.1,0.28,0.5,0.72,0.9].forEach((f,i) => {
      const ox=~~(f*cw), oh=14+i*3;
      rect(ox-2,gnd-oh,5,oh,"#0d0018"); rect(ox-1,gnd-oh-1,3,1,"#180a2a");
      rect(ox-1,gnd-oh-3,3,3,"#888");
      drawCrystal(ox,gnd-oh-6,t+i*0.4);
    });

    // Dragon overhead
    drawDragon(~~(cw*0.5)+~~(Math.sin(t*0.25)*30),~~(ch*0.2)+~~(Math.sin(t*0.4)*6),t);

    // Steve + two Endermen
    drawSteve(~~(cw*0.3),gnd-8,t);
    drawEnderman(~~(cw*0.6),gnd-14,t+0.4);
    drawEnderman(~~(cw*0.82),gnd-14,t+1.1);

    [[0.15,8],[0.42,10],[0.65,7],[0.88,9]].forEach(([f,h]) => {
      const px2=~~(f*cw);
      rect(px2-1,gnd-h,2,h,"#7B5EA7");
      rect(px2-2,gnd-h-2,2,3,"#7B5EA7"); rect(px2+1,gnd-h-2,2,3,"#7B5EA7");
      rect(px2-1,gnd-h-4,2,2,"#9370BB");
    });

    // Dragon second pass (swooping)
    const dsx=~~(cw*0.5)+~~(Math.sin(t*0.22)*cw*0.35);
    const dsy=~~(H()*0.35)+~~(Math.sin(t*0.38)*H()*0.12);
    drawDragon(dsx,dsy,t);

    // Reduced mobs — two endermen, one bat
    mobEnderman(walkX(t,0,4,cw), gnd-14, t, 0);
    mobEnderman(walkX(t,1,3,cw), gnd-14, t, 1.5);
    mobBat(~~(cw*0.4)+~~(Math.sin(t*0.8)*40), gnd-45+~~(Math.sin(t*1.2)*15), t, 0);

    drawCave(t,'The End');
    vignette(0.62);
  };

  // ── 12. MUSHROOM FIELDS ──────────────────────────────────────
  SCENES["Mushroom Fields"] = function(t) {
    const cw=W(),ch=H(),gnd=~~(ch*0.67);
    gradV([[0,"#0e0518"],[0.4,"#1a0a30"],[0.7,"#2d1450"],[1,"#160a28"]]);
    stars(t,55,0.85);
    moon(~~(cw*0.82),~~(ch*0.11),6,"#FFE8F0");

    rect(0,gnd,cw,ch-gnd,"#4a1450"); rect(0,gnd,cw,2,"#6a2070");
    for(let i=0;i<20;i++) rect(rnd(i*17,cw),gnd+rnd(i*7,5),2+rnd(i,3),1,"rgba(120,50,130,0.4)");

    hills(pax(t,0.015,3),gnd-7,"#320d42",5,0.04);

    // Giant mushrooms
    [[0.08,16,true],[0.22,11,false],[0.42,18,true],[0.6,12,false],[0.75,15,true],[0.92,10,false]].forEach(([f,h,isRed],i) => {
      const mx=~~(f*cw)+~~(pax(t,0.015,2)*(i%2===0?1:-1));
      const my=gnd;
      rect(mx-1,my-h,3,h,"#e0c8b0");
      rect(mx-6,my-h-7,13,5,isRed?"#aa1818":"#c080d0");
      rect(mx-5,my-h-10,11,4,isRed?"#cc2020":"#d890e0");
      rect(mx-4,my-h-12,9,3,isRed?"#ee3535":"#eab0f0");
      if(isRed) {
        px(mx-3,my-h-9,"#fff"); px(mx,my-h-10,"#fff"); px(mx+2,my-h-8,"#fff");
      }
      const glow=0.13+Math.sin(t*0.7+i*1.2)*0.07;
      ctx.save();
      const mg=ctx.createRadialGradient(mx*PIXEL,(my-h-5)*PIXEL,0,mx*PIXEL,(my-h-5)*PIXEL,12*PIXEL);
      mg.addColorStop(0,`rgba(${isRed?220:200},${isRed?40:80},${isRed?40:220},${glow})`);
      mg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=mg; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
    });

    for(let i=0;i<14;i++) {
      const sx=rnd(i*17,cw), isR=i%3!==0;
      rect(sx,gnd-4,1,4,"#d0b090"); rect(sx-1,gnd-5,3,2,isR?"#cc2020":"#cc60cc");
    }

    for(let i=0;i<20;i++) {
      const sx=(rnd(i*13,cw)+~~(t*(0.8+i%3)))%cw;
      const sy=(rnd(i*7+2,gnd)+~~(t*(0.3+i%2)))%gnd;
      const glow2=Math.sin(t*2+i)*0.5+0.5;
      px(sx,sy,`rgba(220,180,255,${(glow2*0.7).toFixed(2)})`);
    }

    // Steve + two mooshrooms, slime
    const fx=~~(cw*0.5), fy=gnd-2;
    campfire(fx,fy,t); fireLight(fx,fy,24,t);
    drawSteve(fx-13,gnd-8,t);
    drawMooshroom(~~(cw*0.2),gnd-11,t+0.4);
    drawMooshroom(~~(cw*0.78),gnd-11,t+1.0);
    drawSlime(~~(cw*0.35),gnd-8,t+1.3);

    // Reduced mobs — two mooshrooms, one rabbit, one slime, one bird
    mobMooshroom(walkX(t,0,5,cw), gnd-12, t, 0);
    mobMooshroom(walkX(t,1,4,cw), gnd-12, t, 1.5);
    mobRabbit(walkX(t,2,10,cw), gnd-9, t, 0.8);
    mobSlimeBounce(walkX(t,3,7,cw), gnd-8, t, 0);
    mobBird(~~(cw*0.4)+~~(Math.sin(t*0.7)*35), gnd-42+~~(Math.sin(t*1.0)*14), "#FF80AB");

    drawCave(t,'Mushroom Fields');
    vignette(0.52);
  };

  // ── Animation loop ───────────────────────────────────────────
  function loop(ts) {
    if (!startTime) startTime = ts;
    const t = (ts - startTime) / 1000;
    if (!canvas || !ctx || !activeScene) { animFrame = requestAnimationFrame(loop); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const fn = SCENES[activeScene];
    if (fn) fn(t);
    animFrame = requestAnimationFrame(loop);
  }

  // ── Public API ───────────────────────────────────────────────
  window.setBiome = function(name) {
    if (!name) {
      activeScene = null;
      if (canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.body.style.background = "linear-gradient(180deg,#6fb0d8 0%,#7ec850 60%)";
      return;
    }
    activeScene = name;
    document.body.style.background = "transparent";
    startTime = null;
  };

  document.addEventListener("DOMContentLoaded", () => {
    init();
    animFrame = requestAnimationFrame(loop);
  });

})();
// Design-kit layout families for the slide template. Each takes the slide's copy and returns inner HTML;
// the template adds the header (counter or topic tag) and footer (Swipe or Link in bio).
const two = (t, inv) => { const [a, b] = String(t).split('|'); return b === undefined ? esc(a) : inv ? `<span class="m">${esc(a)}</span> ${esc(b)}` : `${esc(a)} <span class="m">${esc(b)}</span>`; };
const pill = p => p ? `<div class="ch pill"><div class="in"><span class="dot"></span>${esc(p)}</div></div>` : '';
const eb = e => e ? `<div class="eyebrow">[ ${esc(e)} ]</div>` : '';
const imgSrc = k => ART[k] || k;

const KIT = {
  // Giant type, nothing else
  manifesto: (s) => `<div class="kabs" style="left:80px;right:70px;top:${s.pill || s.eyebrow ? 200 : 230}px;display:flex;flex-direction:column;gap:30px">${pill(s.pill)}${eb(s.eyebrow)}
      <div class="kh" data-maxh="${s.body ? 720 : 820}" style="font-size:${s.size || 132}px;line-height:.9;letter-spacing:-.035em">${two(s.t)}</div></div>
    ${s.body ? `<p class="kabs body" style="left:80px;right:220px;bottom:170px;font-size:29px">${rich(s.body)}</p>` : ''}`,

  // Headline block on top, glass photography below
  split: (s) => `<div class="kabs" style="left:0;right:0;bottom:0;height:540px"><img class="kfill" src="${imgSrc(s.img || 'hero')}" style="object-position:${s.pos || '50% 50%'}"></div>
    <div class="kabs" style="left:0;right:0;bottom:540px;height:4px;background:var(--sky)"></div>
    <div class="kabs" style="left:0;right:0;bottom:0;height:220px;background:linear-gradient(to top,rgba(14,50,69,.82),rgba(14,50,69,0))"></div>
    <div class="kabs" style="left:80px;right:80px;top:196px;display:flex;flex-direction:column;gap:26px">${pill(s.pill)}${eb(s.eyebrow)}
      <div class="kh" data-maxh="${s.body ? 330 : 420}" style="font-size:${s.size || 92}px">${two(s.t)}</div>${s.body ? `<p class="body" style="font-size:28px">${rich(s.body)}</p>` : ''}</div>`,

  // One big sculpture, one line
  object: (s) => `<div class="kabs kobj" style="left:${s.img === 'coins' ? 0 : 240}px;top:${s.img === 'coins' ? 0 : 165}px;width:${s.img === 'coins' ? 1080 : 600}px;height:${s.img === 'coins' ? 900 : 600}px;z-index:2"><img class="kfill ${s.img === 'coins' ? 'kfadeb' : 'kfade'}" src="${imgSrc(s.img || 'g3')}"></div>
    <div class="kabs" style="left:80px;right:80px;bottom:170px;display:flex;justify-content:space-between;align-items:flex-end;gap:40px">
      <div style="display:flex;flex-direction:column;gap:22px;min-width:0">${pill(s.pill)}<div class="kh" data-maxh="330" style="font-size:${s.size || 74}px">${two(s.t)}</div>${s.body ? `<p class="body" style="font-size:27px">${rich(s.body)}</p>` : ''}</div>
      ${s.side ? `<div class="kside">${s.side.map(esc).join('<br>')}</div>` : ''}</div>`,

  // Big number on a measured scale
  ruler: (s) => `<div class="kabs" style="left:80px;right:80px;top:240px"><div class="eyebrow" style="color:#bfeafc">${esc(s.eyebrow)}</div>
      <div class="grad kbig" style="font-size:320px">${esc(s.big)}</div>
      <div style="font-size:58px;font-weight:400;letter-spacing:-.02em;line-height:1.1;color:#fff;margin-top:10px">${esc(s.t)}</div></div>
    <div class="kabs kruler" style="left:110px;right:130px;top:1000px"><div class="base"></div><div class="fillbar" style="width:${(s.value || 40) * 2}%"></div>
      ${[0, 10, 20, 30, 40].map(v => `<i style="left:${v * 2}%"></i><span style="left:${v * 2}%">${v === 0 ? 'Base' : '+' + v + '%'}</span>`).join('')}
      ${[5, 15, 25, 35, 45].map(v => `<i class="s" style="left:${v * 2}%"></i>`).join('')}
      <div class="pin" style="left:${(s.value || 40) * 2}%">${esc(s.pin || 'Avg. partner')}</div></div>`,

  // Headline left, phone with notifications right
  phone: (s) => `<div class="kabs" style="left:80px;top:${s.eyebrow ? 200 : 220}px;width:440px;display:flex;flex-direction:column;gap:28px">${eb(s.eyebrow)}
      <div class="kh" data-maxh="470" style="font-size:${s.size || 72}px">${two(s.t)}</div>
      ${s.body ? `<p class="body" style="font-size:26px">${rich(s.body)}</p>` : ''}
      ${s.checks ? `<div class="checks" style="justify-content:flex-start">${s.checks.map(c => `<span>${CHECK(16)}${esc(c)}</span>`).join('')}</div>` : ''}</div>
    <div class="kphone" style="right:-40px;top:200px"><div class="scr"><div class="island"></div><div class="date">Tuesday</div><div class="time">14:32</div>
      ${s.notifs.map((n, i) => `<div class="knotif" style="top:${330 + i * 160}px;opacity:${1 - i * .15}"><div class="ic">${MARK}</div><div class="tx"><b>${esc(n[0])}</b><span>${esc(n[1])}</span></div><span class="when">${esc(n[2])}</span></div>`).join('')}
      <div style="position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:16px;letter-spacing:.2em;text-transform:uppercase;color:#557080">Example notifications</div></div></div>`,

  // Myth crossed out on navy, fact on white below
  mythfact2: (s) => `<div class="kabs" style="left:0;right:0;top:0;height:620px;background:radial-gradient(110% 80% at 85% 0%,#1f5f7d 0%,#154359 50%,#0e3245 100%)"></div>
    <div class="kabs" style="left:80px;right:80px;top:230px"><div class="kmlab" style="color:#ff8f86">${esc(s.eyebrow || 'Myth')}</div>
      <div class="kmyth" data-maxh="330">${esc(s.myth)}</div></div>
    <div class="kabs" style="left:80px;right:80px;top:690px"><div class="kmlab" style="color:var(--teal)">Fact</div>
      <div class="kfact" data-maxh="330">${rich(s.fact)}</div></div>
    <div class="kabs" style="right:30px;bottom:150px;width:330px;height:330px;z-index:2"><img class="kfill kfade" src="${imgSrc(s.img || 'g5')}"></div>`,

  // Headline with repeating offer bands
  ticker: (s) => { const band = (top, color, bg) => `<div class="kband" style="top:${top}px;color:${color};background:${bg}">${esc(s.band).repeat(4)}</div>`;
    return band(230, 'rgba(143,176,189,.5)', 'transparent') + band(1010, '#0e3245', 'var(--sky)') + band(1110, 'rgba(143,176,189,.42)', 'transparent') +
    `<div class="kabs" style="left:80px;right:80px;top:410px"><div class="kh" data-maxh="460" style="font-size:${s.size || 112}px">${two(s.t)}</div>${s.body ? `<p class="body" style="margin-top:28px">${rich(s.body)}</p>` : ''}</div>`; },

  // Question and answer
  qa: (s) => `<div class="kabs" style="left:80px;right:80px;top:210px;display:flex;flex-direction:column;gap:30px">${eb(s.eyebrow)}
      <div class="kh" data-maxh="360" style="font-size:${s.size || 96}px">${esc(s.t)}</div></div>
    <div class="kabs kcut kans" style="left:80px;right:80px;top:640px">${rich(s.body)}</div>
    <div class="kabs" style="right:80px;bottom:170px;font-size:300px;font-weight:700;line-height:.8;letter-spacing:-.05em;color:var(--ink);opacity:.06">?</div>`,

  // Two-bar comparison
  chart: (s) => `<div class="kabs" style="left:80px;right:80px;top:200px">${s.eyebrow ? `<div class="eyebrow">${esc(s.eyebrow)}</div>` : ''}<div class="kh" style="font-size:${s.size || 80}px;margin-top:22px">${two(s.t)}</div></div>
    <div class="kchart" style="top:560px;height:580px">${s.bars.map(b => `<div class="col"><span class="v ${b.g ? 'grad' : ''}" style="${b.g ? '' : 'color:var(--ink3)'};${b.ext ? 'margin-bottom:' + b.ext + 'px' : ''}">${esc(b.v)}</span><div class="bar ${b.g ? 'g' : ''}" style="height:${b.h}px">${b.ext ? `<div class="ext" style="height:${b.ext}px"></div>` : ''}</div><span class="l">${esc(b.l)}</span></div>`).join('')}</div>`,

  // Headline, copy and the partner broker logos from the site
  brokers: (s) => `<div class="kabs" style="left:80px;right:80px;top:210px;display:flex;flex-direction:column;gap:34px">${eb(s.eyebrow)}
      <div class="kh" data-maxh="420" style="font-size:${s.size || 100}px">${two(s.t)}</div>${s.body ? `<p class="body">${rich(s.body)}</p>` : ''}</div>
    <div class="kabs" style="left:80px;right:80px;top:880px;padding-top:34px;border-top:2px solid var(--rule)"><div class="eyebrow" style="font-size:17px;margin-bottom:30px">Live deals with</div>
      <div class="klogos"><div><img src="art/broker-pu-prime.png" alt="">PU Prime</div><div><img src="art/broker-marketsvox.png" alt="">MarketsVox</div><div><img src="art/broker-stg.png" alt="">STG Trader</div></div></div>`,
};

// Round 2 families
const BADGE_TXT = 'NO FEES • OFFER WITHIN 1 HOUR • KEEP YOUR BROKER • ';
const badge = (coin = 'coin-a') => `<div class="kabs kcoin"><img src="art/${coin}.png" alt=""></div>`;
const bodyP = (s, st = '') => s.body ? `<p class="body" style="${st}">${rich(s.body)}</p>` : '';
Object.assign(KIT, {
  // Full-bleed macro glass with a frosted card
  macro: (s) => `<div class="kabs" style="inset:0;z-index:1"><img class="kfill" src="${imgSrc(s.img || 't4')}" style="object-position:${s.pos || '50% 50%'}"></div>
    <div class="kabs" style="inset:0;z-index:2;background:linear-gradient(180deg,rgba(14,50,69,.6) 0%,rgba(14,50,69,0) 20%,rgba(14,50,69,0) 48%,rgba(14,50,69,.5) 100%)"></div>
    <div class="kabs kglass" style="left:80px;right:80px;bottom:150px">${pill(s.pill)}${eb(s.eyebrow)}<div class="kh" data-maxh="${s.body ? 330 : 420}" style="font-size:${s.size || 82}px">${two(s.t)}</div>${bodyP(s, 'font-size:27px')}</div>`,

  // Brand-colour gradient ground with big type and the rotating badge
  aurora: (s) => `<div class="kabs" style="inset:0;z-index:0"><img class="kfill" src="${imgSrc(s.img || 'a1')}"></div>
    <div class="kabs" style="left:80px;right:70px;top:${s.pill || s.eyebrow ? 200 : 230}px;display:flex;flex-direction:column;gap:30px">${pill(s.pill)}${eb(s.eyebrow)}
      <div class="kh" data-maxh="680" style="font-size:${s.size || 120}px;line-height:.92;letter-spacing:-.03em">${two(s.t)}</div></div>
    ${s.body ? `<p class="kabs body" style="left:80px;right:360px;bottom:170px;font-size:29px">${rich(s.body)}</p>` : ''}${s.badge === false ? '' : badge(s.coin)}`,

  // Site ribbon photography with type in the light sky
  ribbon: (s) => `<div class="kabs" style="inset:0;z-index:0"><img class="kfill" src="${imgSrc(s.img || 't1')}" style="object-position:${s.pos || '50% 50%'};${s.flip ? 'transform:scaleX(-1)' : ''}"></div>
    <div class="kabs" style="inset:0;z-index:1;background:linear-gradient(180deg,rgba(240,245,247,.96) 0%,rgba(240,245,247,.9) 42%,rgba(240,245,247,0) 68%)"></div>
    <div class="kabs" style="left:0;right:0;bottom:0;height:260px;z-index:1;background:linear-gradient(to top,rgba(14,50,69,.72),rgba(14,50,69,0))"></div>
    <div class="kabs" style="left:80px;right:80px;top:200px;display:flex;flex-direction:column;gap:26px">${pill(s.pill)}${eb(s.eyebrow)}<div class="kh" data-maxh="${s.body ? 330 : 420}" style="font-size:${s.size || 88}px">${two(s.t)}</div>${bodyP(s, 'font-size:28px;max-width:820px')}</div>`,

  // Arched window onto glass
  arch: (s) => { const h = s.h || 560, top = 180 + h + 46, room = 1350 - 168 - top - (s.pill ? 74 : 0) - (s.eyebrow ? 52 : 0) - (s.body ? 96 : 0);
    return `<div class="kabs karch" style="left:80px;right:80px;top:180px;height:${h}px"><img class="kfill" src="${imgSrc(s.img || 't4')}" style="object-position:${s.pos || '50% 50%'}"></div>
    <div class="kabs" style="left:80px;right:80px;top:${top}px;display:flex;flex-direction:column;gap:20px">${pill(s.pill)}${eb(s.eyebrow)}<div class="kh" data-maxh="${room}" style="font-size:${s.size || 76}px">${two(s.t)}</div>${bodyP(s, 'font-size:26px')}</div>`; },

  // Numbered list with large outline numerals
  index: (s) => { const b = (s.blocks || [])[0] || { items: [] }, st = b.start || 1;
    return `<div class="kabs" data-gaphead style="left:80px;right:80px;top:200px;display:flex;flex-direction:column;gap:24px">${eb(s.eyebrow)}<div class="kh" data-maxh="250" style="font-size:${s.size || 80}px">${two(s.t)}</div>${bodyP(s, 'font-size:26px')}</div>
    <div class="kabs kgapimg" data-gapfill><img class="kfill kfade" src="${imgSrc(s.img || 'g9')}"></div>
    <div class="kabs kindex ${b.items.length > 3 ? 'four' : ''}" data-gaptail style="left:80px;right:80px;bottom:168px">${b.items.map((x, i) => `<div class="r"><span class="n">${String(st + i).padStart(2, '0')}</span><div class="tx"><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div></div>`).join('')}</div>`; },

  // Deal summary sheet
  deal: (s) => `<div class="kabs" data-gaphead style="left:80px;right:80px;top:200px;display:flex;flex-direction:column;gap:24px">${pill(s.pill)}${eb(s.eyebrow)}<div class="kh" data-maxh="${s.pill || s.eyebrow ? 250 : 300}" style="font-size:${s.size || 80}px">${two(s.t, s.invert)}</div>${bodyP(s, 'font-size:26px')}</div>
    <div class="kabs kgapimg" data-gapfill><img class="kfill kfade" src="${imgSrc(s.img || 'g7')}"></div>
    <div class="kabs kdeal kcut" data-gaptail style="left:80px;right:80px;bottom:168px"><div class="top">${MARK}<span>${esc(s.sheet || 'Your partner deal')}</span><span class="chip">${esc(s.chip || 'Summary')}</span></div>
      ${s.rows.map((r, i) => `<div class="r"><span>${esc(r[0])}</span><b class="${i === (s.hi ?? 0) ? 'grad' : ''}">${esc(r[1])}</b></div>`).join('')}</div>`,

  // Direct-message mock: the IB's question, the partner manager's answer
  chat: (s) => `<div class="kabs" style="left:80px;right:80px;top:200px">${eb(s.eyebrow)}</div>
    <div class="kabs kchat" style="left:80px;right:80px;top:270px;bottom:168px">
      <div class="who"><div class="av">${MARK}</div><div class="nm"><b>10X Affiliation</b><span>Partner manager</span></div><span class="ex">Example conversation</span></div>
      <div class="thread"><div class="msg out" data-maxh="330">${esc(s.q || s.t)}</div><div class="msg in" data-maxh="420">${rich(s.a || s.body)}</div><div class="typing"><i></i><i></i><i></i></div></div></div>`,
});

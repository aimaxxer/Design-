// 10X Affiliation: creates the brand comps in After Effects.
// Run it with File > Scripts > Run Script File... and keep it inside the brand kit's motion/ folder,
// so it can find ../templates/safe-zones and the coin stills.
// Each comp gets a navy ground, the safe-zone overlay as a guide layer (it never renders),
// a headline and eyebrow set in the post styles, and the hero coin on the square and story comps.
(function () {
  var kit = File($.fileName).parent.parent;
  var FPS = 30, DUR = 10;
  var NAVY = "#154359", SKY = "#4bbdf0", INK2 = "#c6d7df";

  function rgb(h) {
    return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255];
  }
  function importFile(path, folder) {
    var f = new File(kit.fsName + "/" + path);
    if (!f.exists) return null;
    var item = app.project.importFile(new ImportOptions(f));
    item.parentFolder = folder;
    return item;
  }
  // Point text in a post style. Sizes are for a 1080-wide canvas; tracking is in 1/1000 em.
  function addText(comp, name, str, font, size, tracking, leading, color, caps, x, y) {
    var layer = comp.layers.addText(str);
    layer.name = name;
    var prop = layer.property("Source Text");
    var td = prop.value;
    try { td.font = font; } catch (e) {}
    td.fontSize = size;
    td.fillColor = rgb(color);
    td.applyFill = true;
    td.applyStroke = false;
    td.tracking = tracking;
    td.justification = ParagraphJustification.LEFT_JUSTIFY;
    try { td.autoLeading = false; td.leading = leading; } catch (e) {}
    try { td.allCaps = caps; } catch (e) {}
    prop.setValue(td);
    layer.property("Position").setValue([x, y]);
    return layer;
  }

  var formats = [
    { name: "10X Post 4x5", w: 1080, h: 1350, safe: "safe-1080x1350.png", top: 196, coin: false },
    { name: "10X Square", w: 1080, h: 1080, safe: "safe-1080x1080.png", top: 160, coin: true },
    { name: "10X Story 9x16", w: 1080, h: 1920, safe: "safe-1080x1920.png", top: 330, coin: true },
    { name: "10X Landscape 16x9", w: 1920, h: 1080, safe: "safe-1920x1080.png", top: 160, coin: true }
  ];

  app.beginUndoGroup("10X Affiliation brand comps");
  var folder = app.project.items.addFolder("10X Affiliation");
  var assets = app.project.items.addFolder("10X assets");
  assets.parentFolder = folder;
  var coin = importFile("coin/stills/coin-hero.png", assets);

  for (var i = 0; i < formats.length; i++) {
    var f = formats[i];
    var comp = app.project.items.addComp(f.name, f.w, f.h, 1, DUR, FPS);
    comp.parentFolder = folder;
    comp.bgColor = rgb(NAVY);

    var ground = comp.layers.addSolid(rgb(NAVY), "Ground navy", f.w, f.h, 1, DUR);
    ground.locked = true;

    if (f.coin && coin) {
      var c = comp.layers.add(coin);
      c.name = "Coin";
      var side = Math.min(f.w, f.h) * (f.w > f.h ? 0.62 : 0.58);
      var s = side / coin.width * 100;
      c.property("Scale").setValue([s, s]);
      c.property("Position").setValue(f.w > f.h ? [f.w * 0.72, f.h * 0.52] : [f.w / 2, f.h * (f.h > 1500 ? 0.6 : 0.62)]);
      c.property("Position").expression =
        "loop = 6; r = thisLayer.width * thisLayer.scale[0] / 100 * 0.43;\nvalue - [0, Math.sin(time / loop * 2 * Math.PI) * r * 0.052];";
    }

    addText(comp, "Eyebrow", "10X AFFILIATION", "Inter-Medium", 20, 300, 28, INK2, true, 80, f.top);
    // Headlines are typed in capitals with All Caps off, so the lowercase s in IB's survives.
    addText(comp, "Headline", "THE PARTNER INFRASTRUCTURE\rBEHIND TOP IB\u2019s", "Inter-Bold", 84, -22, 82, "#ffffff", false, 80, f.top + 100);

    var safe = importFile("templates/safe-zones/" + f.safe, assets);
    if (safe) {
      var g = comp.layers.add(safe);
      g.name = "Safe zones (guide, not rendered)";
      g.guideLayer = true;
      g.locked = true;
    }
  }
  app.endUndoGroup();
  alert("10X Affiliation: 4 comps are in the 10X Affiliation folder.\n\nInstall the Inter fonts from the kit's fonts/ folder if the text shows in a fallback font.\n\nType headlines in capitals instead of using All Caps, so IB\u2019s keeps its lowercase s.");
})();

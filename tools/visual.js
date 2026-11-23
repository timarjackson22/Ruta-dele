  /* ==VISUAL== Library › Picture dictionary (#visual, #visual/<topic>) — v262, redrawn v268, premium finish v269 (vdLux). One card per topic: an original SVG drawing with
     each thing labelled (callouts for scenes, laid out by vdLay; a labelled grid for things), grouped on the hub (VD_GRP). Tap a label: hear it;
     «Hear them all» says each word in English once and in Spanish three times. Every word is also in Flashcards (built-in deck «visual») and in
     Quick drill › Pictures (`__vd.pool`, `__vd.pic`). Words follow the learner's Spanish variety (es / lat). Source of truth:
     tools/visual.js + tools/visual.css, embedded by `python3 tools/patch_visual.py index.html`. */
  // drawing helpers (scene drawings sit in x 100–300 of a 400×340 frame; the labels go in the margins)
  const VD_SKIN = 'fill="#f3c9a6" stroke="#b9805e" stroke-width="2"';
  const vR = (x, y, w, h, f, s, rx, sw) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (rx ? ' rx="' + rx + '"' : "") + ' fill="' + f + '"' + (s ? ' stroke="' + s + '" stroke-width="' + (sw || 2) + '"' : "") + "/>";
  const vC = (x, y, r, f, s, sw) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (s ? ' stroke="' + s + '" stroke-width="' + (sw || 2) + '"' : "") + "/>";
  const vE = (x, y, rx, ry, f, s, sw) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + (s ? ' stroke="' + s + '" stroke-width="' + (sw || 2) + '"' : "") + "/>";
  const vP = (d, f, s, sw) => '<path d="' + d + '" fill="' + (f || "none") + '"' + (s ? ' stroke="' + s + '" stroke-width="' + (sw || 2) + '" stroke-linecap="round" stroke-linejoin="round"' : "") + "/>";
  const vS = (d) => '<path d="' + d + '" ' + VD_SKIN + ' stroke-linejoin="round"/>';
  const vLimb = (pts, w) => vP("M" + pts.join("L"), "", "#b9805e", w + 3) + vP("M" + pts.join("L"), "", "#f3c9a6", w);
  // v278 grid-icon helpers: a wheel (tyre, rim, hub), tinted glass, one object moved (for pairs of things)
  const vWh = (x, y, r) => vC(x, y, r, "#262a30") + vC(x, y, (r * 0.56).toFixed(1), "#d5dce3", "#8d99a6", 1) + vC(x, y, (r * 0.2).toFixed(1), "#7d8a98");
  const vGl = (d) => vP(d, "#bfe2f6", "#4f6f88", 1.1);
  const vHi = (x, y, rx, ry, a) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '"' + (a ? ' transform="rotate(' + a + " " + x + " " + y + ')"' : "") + ' fill="white" opacity=".42"/>';
  const vLeaf = (x, y, a, l, c) => '<path d="M0 0q' + l / 2 + " " + (-l / 3) + " " + l + " 0q" + (-l / 2) + " " + l / 3 + " " + (-l) + ' 0z" transform="translate(' + x + " " + y + ") rotate(" + a + ')" fill="' + (c || "#5fae4f") + '" stroke="#3e7a3b" stroke-width="1"/><path d="M0 0h' + l * 0.9 + '" transform="translate(' + x + " " + y + ") rotate(" + a + ')" stroke="#3e7a3b" stroke-width=".8" opacity=".6"/>';
  const vBumpy = (cx, cy, r, n, d) => { let s = ""; for (let k = 0; k <= n * 2; k++) { const a = k * Math.PI / n, rr = k % 2 ? r : r - d; s += (k ? "L" : "M") + (cx + rr * Math.cos(a)).toFixed(1) + " " + (cy + rr * Math.sin(a)).toFixed(1); } return s + "Z"; };
  const vMv = (dx, dy, svg, k) => '<g transform="translate(' + dx + " " + dy + ")" + (k ? " scale(" + k + ")" : "") + '">' + svg + "</g>";
  // scene item: [es (Spain), en, x, y, label side "l"|"r", (unused), lat (Latin America, optional)] — labels are laid out automatically (vdLay)
  const VDT = [
    { id: "cara", grp: "body", bg: "#f4efe8", es: "La cara", en: "The face", lvl: "a1", kind: "scene",
      svg: '<defs><radialGradient id="vdfSkin" cx=".46" cy=".36" r=".72"><stop offset="0" stop-color="#fbe2cc"/><stop offset=".62" stop-color="#f1c4a1"/><stop offset="1" stop-color="#dfa47c"/></radialGradient>' +
        '<radialGradient id="vdfIris" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#9a7246"/><stop offset=".7" stop-color="#5e3d22"/><stop offset="1" stop-color="#3b2614"/></radialGradient>' +
        '<linearGradient id="vdfBeard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3d2b"/><stop offset="1" stop-color="#36241a"/></linearGradient></defs>' +
        vR(0, 0, 400, 340, "#f4efe8") + vP("M110 340q6-46 72-52h36q66 6 72 52z", "#4f7fc9", "#3a62a3") + vP("M176 292q24 18 48 0", "", "#3a62a3", 3) +
        '<rect x="180" y="232" width="40" height="66" fill="url(#vdfSkin)"/><path d="M180 244q20 26 40 0v18q-20 14-40 0z" fill="#c98a63" opacity=".45"/>' +
        '<ellipse cx="131" cy="166" rx="12" ry="20" fill="url(#vdfSkin)" stroke="#c48b66" stroke-width="1.4"/><ellipse cx="269" cy="166" rx="12" ry="20" fill="url(#vdfSkin)" stroke="#c48b66" stroke-width="1.4"/>' +
        '<path d="M127 158q-6 9 2 18M273 158q6 9-2 18" fill="none" stroke="#c48b66" stroke-width="1.6" stroke-linecap="round"/>' +
        '<path d="M130 150C130 96 162 70 200 70C238 70 270 96 270 150C270 196 258 228 236 250C222 263 212 268 200 268C188 268 178 263 164 250C142 228 130 196 130 150Z" fill="url(#vdfSkin)" stroke="#c48b66" stroke-width="1.4" stroke-opacity=".7"/>' +
        '<path d="M128 150C120 88 156 58 200 58C246 58 282 88 272 150C268 120 258 104 244 96C226 108 178 112 156 100C142 112 134 128 128 150Z" fill="url(#vdfBeard)"/><path d="M166 72q34-14 68 0M150 92q10-14 24-20" fill="none" stroke="#8a6248" stroke-width="4" stroke-linecap="round" opacity=".55"/>' +
        '<path d="M156 134q16-11 35-3q-17-1-35 6z" fill="#3e2a1d"/><path d="M244 134q-16-11-35-3q17-1 35 6z" fill="#3e2a1d"/>' +
        [175, 225].map((x) => '<path d="M' + (x - 14) + ' 157q14-12 28 0q-14 9-28 0z" fill="#fff" stroke="#8a6a58" stroke-width=".8"/><circle cx="' + x + '" cy="156" r="6.2" fill="url(#vdfIris)"/><circle cx="' + x + '" cy="156" r="2.8" fill="#140c06"/><circle cx="' + (x + 2.2) + '" cy="153.8" r="1.6" fill="#fff"/>' +
          '<path d="M' + (x - 15) + ' 156q15-14 30 0" fill="none" stroke="#4a2f1f" stroke-width="2.2" stroke-linecap="round"/><path d="M' + (x - 11) + ' 147q11-6 22 0" fill="none" stroke="#d9a07a" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>' +
          '<path d="M' + (x - 11) + ' 151l-3-4M' + (x - 6) + ' 148.5l-1.5-4.5M' + x + ' 147.6v-4.6M' + (x + 6) + ' 148.5l1.5-4.5M' + (x + 11) + ' 151l3-4" stroke="#24160e" stroke-width="1.4" stroke-linecap="round"/>').join("") +
        '<path d="M200 156c-1 14-5 22-9 28" fill="none" stroke="#c48b66" stroke-width="2" stroke-linecap="round" opacity=".75"/><ellipse cx="200" cy="187" rx="10" ry="5.5" fill="#e3a982" opacity=".5"/>' +
        '<path d="M189 190q-5-7 2-10M211 190q5-7-2-10" fill="none" stroke="#b97c58" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="195" cy="191" rx="2.6" ry="1.5" fill="#8e5a3e"/><ellipse cx="205" cy="191" rx="2.6" ry="1.5" fill="#8e5a3e"/>' +
        '<circle cx="160" cy="188" r="13" fill="#ee9c86" opacity=".3"/><circle cx="240" cy="188" r="13" fill="#ee9c86" opacity=".3"/>' +
        '<path d="M140 196C146 228 168 262 200 270C232 262 254 228 260 196C252 214 240 226 226 230C220 240 210 245 200 245C190 245 180 240 174 230C160 226 148 214 140 196Z" fill="url(#vdfBeard)"/>' +
        '<path d="M150 216l3 4M158 230l3 4M168 242l3 3M180 252l2 4M192 258l1 4M208 258l-1 4M220 252l-2 4M232 242l-3 3M242 230l-3 4M250 216l-3 4M200 262v4" stroke="#7a5640" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>' +
        '<path d="M184 216q8-5 16-2q8-3 16 2q-16 4-32 0z" fill="#b25c57"/><path d="M186 217q14 3 28 0l-2 4.6q-12 2-24 0z" fill="#fff"/><path d="M186 222q14 2 28 0q-4 9-14 9t-14-9z" fill="#c9736b"/><path d="M193 225q7 2 14 0" fill="none" stroke="#e6a19a" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>' +
        '<path d="M176 211C184 202 195 203 200 207C205 203 216 202 224 211C216 213 207 212 200 210C193 212 184 213 176 211Z" fill="url(#vdfBeard)"/>',
      items: [["el pelo", "hair", 176, 70, "l"], ["la frente", "forehead", 200, 118, "l"], ["la ceja", "eyebrow", 172, 132, "l"], ["el ojo", "eye", 175, 156, "l"], ["la mejilla", "cheek", 160, 186, "l"], ["la boca", "mouth", 186, 221, "l"], ["la barba", "beard", 152, 222, "l"], ["la barbilla", "chin", 200, 258, "l"], ["el cuello", "neck", 190, 286, "l"],
        ["las pestañas", "eyelashes", 226, 145, "r"], ["la oreja", "ear", 280, 166, "r"], ["la nariz", "nose", 204, 186, "r"], ["el bigote", "moustache", 214, 207, "r"], ["los dientes", "teeth", 202, 219, "r"], ["los labios", "lips", 208, 228, "r"]] },

    { id: "cuerpo", grp: "body", bg: "#f2f7fd", es: "El cuerpo", en: "The body", lvl: "a1", kind: "scene",
      // v277: a clean, shaded figure in a T-shirt (crew neck, short sleeves, folds) and shorts; arms come out of the sleeves
      svg: '<defs><linearGradient id="bdSkin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e4ab85"/><stop offset=".45" stop-color="#f8d6b8"/><stop offset="1" stop-color="#e8b18c"/></linearGradient>' +
        '<radialGradient id="bdFace" cx=".45" cy=".38" r=".7"><stop offset="0" stop-color="#fbe0c8"/><stop offset=".7" stop-color="#f1c4a1"/><stop offset="1" stop-color="#e0a67e"/></radialGradient>' +
        '<linearGradient id="bdShirt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3c6fd3"/><stop offset=".42" stop-color="#6b9ef6"/><stop offset="1" stop-color="#3a69c8"/></linearGradient>' +
        '<linearGradient id="bdShorts" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#232b40"/><stop offset=".45" stop-color="#3a4766"/><stop offset="1" stop-color="#202839"/></linearGradient>' +
        '<linearGradient id="bdHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3d2b"/><stop offset="1" stop-color="#2e1f15"/></linearGradient></defs>' +
        vR(0, 0, 400, 340, "#f2f7fd") + '<ellipse cx="200" cy="322" rx="58" ry="5" fill="#1b2338" opacity=".08"/>' +
        // legs and feet (behind the shorts)
        '<path d="M170 222L192 222L190 262L187 304L175 304L172 262Z" fill="url(#bdSkin)" stroke="#c48b66" stroke-width="1.2" stroke-opacity=".7"/><path d="M230 222L208 222L210 262L213 304L225 304L228 262Z" fill="url(#bdSkin)" stroke="#c48b66" stroke-width="1.2" stroke-opacity=".7"/>' +
        '<path d="M175 262q6 4 12 0M213 262q6 4 12 0" fill="none" stroke="#c48b66" stroke-width="1.3" opacity=".6"/>' +
        '<path d="M176 300h12l1 12q0 6-6 6h-22q-6 0-4-6q2-6 12-7z" fill="url(#bdSkin)" stroke="#c48b66" stroke-width="1.2" stroke-opacity=".7"/><path d="M224 300h-12l-1 12q0 6 6 6h22q6 0 4-6q-2-6-12-7z" fill="url(#bdSkin)" stroke="#c48b66" stroke-width="1.2" stroke-opacity=".7"/>' +
        // arms and hands (behind the sleeves)
        '<path d="M144 116L162 122L157 160L153 196L139 196L138 160Z" fill="url(#bdSkin)" stroke="#c48b66" stroke-width="1.2" stroke-opacity=".7"/><path d="M256 116L238 122L243 160L247 196L261 196L262 160Z" fill="url(#bdSkin)" stroke="#c48b66" stroke-width="1.2" stroke-opacity=".7"/>' +
        '<path d="M141 160q6 3 12 0M247 160q6 3 12 0" fill="none" stroke="#c48b66" stroke-width="1.2" opacity=".55"/>' +
        '<path d="M138 195h16q2 8 0 15q-1 6-8 8q-7-2-8-8q-2-7 0-15z" fill="url(#bdSkin)" stroke="#c48b66" stroke-width="1.2" stroke-opacity=".7"/><path d="M246 195h16q2 8 0 15q-1 6-8 8q-7-2-8-8q-2-7 0-15z" fill="url(#bdSkin)" stroke="#c48b66" stroke-width="1.2" stroke-opacity=".7"/>' +
        '<path d="M142 209v6M146 210v7M150 209v6M250 209v6M254 210v7M258 209v6" stroke="#c48b66" stroke-width="1.1" stroke-linecap="round" opacity=".8"/>' +
        // neck and head
        '<rect x="191" y="62" width="18" height="30" fill="url(#bdSkin)"/><path d="M191 74q9 6 18 0" fill="none" stroke="#c48b66" stroke-width="1" opacity=".5"/>' +
        '<ellipse cx="179" cy="48" rx="4" ry="6" fill="url(#bdSkin)" stroke="#c48b66" stroke-width="1"/><ellipse cx="221" cy="48" rx="4" ry="6" fill="url(#bdSkin)" stroke="#c48b66" stroke-width="1"/>' +
        '<ellipse cx="200" cy="46" rx="21" ry="25" fill="url(#bdFace)" stroke="#c48b66" stroke-width="1.2" stroke-opacity=".7"/>' +
        '<path d="M179 44q-2-25 21-26q23 1 21 26q-4-11-12-13q-10 5-22 2q-6 3-8 11z" fill="url(#bdHair)"/>' +
        '<path d="M188 40q5-3 9 0M203 40q5-3 9 0" fill="none" stroke="#3e2a1d" stroke-width="1.8" stroke-linecap="round"/><circle cx="192.5" cy="46" r="2" fill="#2a1d15"/><circle cx="207.5" cy="46" r="2" fill="#2a1d15"/><circle cx="193.2" cy="45.3" r=".6" fill="#fff"/><circle cx="208.2" cy="45.3" r=".6" fill="#fff"/>' +
        '<path d="M200 48q-1 5-3 7q2 1 4 0" fill="none" stroke="#c48b66" stroke-width="1.2" stroke-linecap="round"/><path d="M193 60q7 5 14 0" fill="none" stroke="#a5534b" stroke-width="1.8" stroke-linecap="round"/><circle cx="187" cy="55" r="3.5" fill="#ee9c86" opacity=".3"/><circle cx="213" cy="55" r="3.5" fill="#ee9c86" opacity=".3"/>' +
        // T-shirt: crew neck, short sleeves with hems, side shading and folds
        '<path d="M187 80Q200 94 213 80L234 86Q246 90 250 100L258 124L240 130L234 112L234 176Q200 182 166 176L166 112L160 130L142 124L150 100Q154 90 166 86Z" fill="url(#bdShirt)" stroke="#2c5bb8" stroke-width="1.2"/>' +
        '<path d="M187 81Q200 95 213 81" fill="none" stroke="#2c5bb8" stroke-width="3.2" stroke-linecap="round"/><path d="M143 121L160 127M257 121L240 127" stroke="#2c5bb8" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M176 136q6 9 2 22M224 136q-6 9-2 22M186 160q14 6 28 0" fill="none" stroke="#24499a" stroke-width="1.3" stroke-linecap="round" opacity=".35"/><path d="M168 96q4-6 12-8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".35"/>' +
        // shorts: waistband, fly, pockets, hems
        '<path d="M166 168L234 168L240 228L205 228L200 200L195 228L160 228Z" fill="url(#bdShorts)" stroke="#151b2a" stroke-width="1.2"/><rect x="166" y="168" width="68" height="9" rx="2" fill="#1a2133"/>' +
        '<path d="M200 177v20M172 179q6 10 13 11M228 179q-6 10-13 11M161 222h33M206 222h33" fill="none" stroke="#5d6b8f" stroke-width="1.1" stroke-linecap="round" opacity=".7"/>',
      items: [["la cabeza", "head", 192, 30, "l"], ["el hombro", "shoulder", 170, 88, "l"], ["el brazo", "arm", 150, 142, "l"], ["el codo", "elbow", 147, 161, "l"], ["la muñeca", "wrist", 146, 195, "l"], ["la mano", "hand", 146, 206, "l"], ["la pierna", "leg", 181, 242, "l"], ["la rodilla", "knee", 181, 263, "l"], ["el pie", "foot", 166, 312, "l"],
        ["el cuello", "neck", 205, 72, "r"], ["el pecho", "chest", 214, 106, "r"], ["el estómago", "stomach", 206, 148, "r"], ["la cintura", "waist", 230, 172, "r"], ["la cadera", "hip", 237, 198, "r"], ["los dedos", "fingers", 256, 215, "r"], ["el tobillo", "ankle", 219, 302, "r"]] },

    { id: "mano", grp: "body", bg: "#fdf6ec", es: "La mano", en: "The hand", lvl: "a2", kind: "scene",
      // v278: a shaded left hand, palm view (thumb nail turned towards us), finger creases, palm lines, shirt cuff
      svg: '<defs><radialGradient id="hdSkin" cx=".52" cy=".55" r=".75"><stop offset="0" stop-color="#fbe0c9"/><stop offset=".6" stop-color="#f3c7a4"/><stop offset="1" stop-color="#dea27b"/></radialGradient>' +
        '<linearGradient id="hdCuff" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3c6fd3"/><stop offset=".45" stop-color="#6b9ef6"/><stop offset="1" stop-color="#3a69c8"/></linearGradient>' +
        '<linearGradient id="hdNail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3ee"/><stop offset="1" stop-color="#f2c6b8"/></linearGradient></defs>' +
        vR(0, 0, 400, 340, "#fdf6ec") + '<ellipse cx="206" cy="336" rx="70" ry="6" fill="black" opacity=".06"/>' +
        '<path d="M182 304L180 272Q172 262 160 252Q136 232 122 206Q113 190 114 180Q117 168 129 172Q139 176 147 192Q155 206 165 210L163 168Q160 130 160 96Q160 80 170 80Q181 80 181 96L183 150Q184.5 156 186 150L185 78Q185 60 196 60Q207 60 207 78L208 150Q209.5 156 211 150L211 90Q211 74 222 74Q233 74 233 90L234 152Q235.5 158 237 154L238 118Q238 104 247 104Q256 104 256 118L257 168Q265 196 261 230Q257 256 240 270L238 304Z" fill="url(#hdSkin)" stroke="#c48b66" stroke-width="1.5" stroke-linejoin="round"/>' +
        // thumb mound and the heel of the hand
        '<path d="M166 214Q150 222 160 246Q172 264 190 262Q178 240 166 214Z" fill="#d99772" opacity=".13"/><path d="M240 214Q258 230 248 256Q240 262 232 258Q244 236 240 214Z" fill="#d99772" opacity=".11"/>' +
        // finger pads and joint creases
        [[170, 90, 116, 136, 150], [196, 72, 98, 124, 148], [222, 86, 106, 130, 151], [247, 116, 128, 146, 160]].map(([x, p, c1, c2, c3]) => '<ellipse cx="' + x + '" cy="' + p + '" rx="6.5" ry="8" fill="#fff" opacity=".22"/>' +
          [c1, c2, c3].map((y, k) => '<path d="M' + (x - 8) + " " + y + "q8 " + (k === 1 ? 4 : 2.5) + " 16 0" + '" fill="none" stroke="#c48b66" stroke-width="' + (k === 1 ? 1.5 : 1.1) + '" stroke-linecap="round" opacity=".7"/>').join("")).join("") +
        '<path d="M135 194q6 3 9 9M150 216q8 2 12 8" fill="none" stroke="#c48b66" stroke-width="1.2" stroke-linecap="round" opacity=".65"/>' +
        // palm lines: heart, head, life
        '<path d="M256 178Q232 168 214 178Q200 186 188 182" fill="none" stroke="#b97c58" stroke-width="1.8" stroke-linecap="round" opacity=".75"/><path d="M166 206Q200 198 242 214" fill="none" stroke="#b97c58" stroke-width="1.7" stroke-linecap="round" opacity=".7"/>' +
        '<path d="M168 210Q186 230 192 262" fill="none" stroke="#b97c58" stroke-width="1.8" stroke-linecap="round" opacity=".7"/><path d="M216 236q2 14-2 28M226 226q8 6 10 16" fill="none" stroke="#b97c58" stroke-width="1" stroke-linecap="round" opacity=".4"/>' +
        // thumb nail
        '<path d="M115.5 182Q114 173 120.5 171Q127 170 128.5 176Q127 182 121 184Q117 185 115.5 182Z" fill="url(#hdNail)" stroke="#c48b66" stroke-width="1.1"/><path d="M117.6 175.6q3-2.4 7-1.8" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".9"/>' +
        // wrist creases and cuff
        '<path d="M186 278q24 5 48 0M187 285q22 4 46 0" fill="none" stroke="#c48b66" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>' +
        '<path d="M170 296H250Q254 296 254 300V340H166V300Q166 296 170 296Z" fill="url(#hdCuff)" stroke="#2c5bb8" stroke-width="1.3"/><path d="M166 306H254" stroke="#2c5bb8" stroke-width="1.2" opacity=".6"/><circle cx="238" cy="320" r="3.6" fill="#f4f6fb" stroke="#9aa7b4" stroke-width="1"/><path d="M236.6 320h2.8" stroke="#9aa7b4" stroke-width=".8"/>',
      items: [["el pulgar", "thumb", 134, 200, "l"], ["la uña", "fingernail", 121, 177, "l"], ["el índice", "index finger", 170, 104, "l"], ["el dedo corazón", "middle finger", 196, 84, "l", 0, "el dedo medio"],
        ["el anular", "ring finger", 222, 96, "r"], ["el meñique", "little finger", 247, 126, "r"], ["la palma", "palm", 214, 222, "r"], ["la muñeca", "wrist", 210, 282, "r"]] },

    { id: "cocina", grp: "home", bg: "#fdf3e3", es: "La cocina", en: "The kitchen", lvl: "a1", kind: "scene",
      // v278: steel fridge-freezer, wall cupboards, tiled splash-back, a window with a herb pot, an over-the-cooker microwave,
      // a cooker (hob, knobs, oven with glass door), sink and tap in the worktop, drawers, tiled floor in perspective
      svg: '<defs><linearGradient id="ckSteel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9d2dc"/><stop offset=".35" stop-color="#f4f7fa"/><stop offset=".7" stop-color="#dde3ea"/><stop offset="1" stop-color="#b8c2cd"/></linearGradient>' +
        '<linearGradient id="ckWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb8ab"/><stop offset="1" stop-color="#5f9a8d"/></linearGradient>' +
        '<linearGradient id="ckSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd0f5"/><stop offset="1" stop-color="#e3f3fd"/></linearGradient>' +
        '<linearGradient id="ckGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3f4a"/><stop offset=".5" stop-color="#1a1d24"/><stop offset="1" stop-color="#2a2e36"/></linearGradient>' +
        '<linearGradient id="ckTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1ece4"/><stop offset="1" stop-color="#cfc6b8"/></linearGradient></defs>' +
        vR(0, 0, 400, 340, "#fdf3e3") +
        // floor tiles in perspective
        vR(-120, 288, 640, 52, "#e9dcc8") + vP("M-120 288h640M-120 300h640M-120 316h640M-120 336h640M120 288l-20 52M160 288l-8 52M200 288v52M240 288l8 52M280 288l20 52M320 288l32 52M80 288l-32 52M40 288l-44 52M360 288l44 52", "", "#d3c2a6", 1.2) +
        // splash-back tiles
        vR(150, 140, 150, 58, "#f6f8fa") + vP("M150 150h150M150 160h150M150 170h150M150 180h150M150 190h150", "", "#dfe5ea", 1) + vP("M165 140v10M185 140v10M205 140v10M225 140v10M175 150v10M195 150v10M215 150v10M165 160v10M185 160v10M205 160v10M225 160v10M175 170v10M195 170v10M215 170v10M165 180v10M185 180v10M205 180v10M225 180v10M175 190v8M195 190v8M215 190v8", "", "#dfe5ea", 1) +
        // wall cupboards (three doors, handles, a shadow underneath)
        vR(150, 20, 150, 4, "#4c8577") + '<rect x="152" y="24" width="146" height="50" rx="2" fill="url(#ckWood)" stroke="#4c8577" stroke-width="1.4"/>' + vP("M200.7 24v50M249.3 24v50", "", "#4c8577", 1.4) +
        [158, 206, 255].map((x) => vR(x, 30, 38, 38, "none", "#9fcfc3", 2, 1)).join("") + vP("M194 60v8M207 60v8M291 60v8", "", "#e8eef2", 3) + '<rect x="152" y="74" width="146" height="5" fill="black" opacity=".07"/>' +
        // window with a herb pot on the sill
        '<rect x="158" y="86" width="50" height="46" fill="url(#ckSky)"/>' + vP("M164 120q10-10 22-6q10 3 22-4V132H164z", "#bfe3b0") + vR(156, 84, 54, 50, "none", "#fff", 2, 4) + vP("M183 86v46M158 109h50", "", "#fff", 3) + vR(152, 132, 62, 5, "#e8ddd0", "#cbbba5", 1, 1) +
        vP("M194 132l2-10h12l2 10z", "#d9774f", "#a9552f", 1) + vP("M199 122q-4-8 2-12M202 122q0-9 5-11M205 122q5-6 8-4", "", "#4f9a4a", 2.2) +
        // fridge-freezer (v279: real proportions, about 0.4 wide to tall, like a 70 × 180 cm fridge)
        '<ellipse cx="111" cy="289" rx="40" ry="3" fill="black" opacity=".12"/>' + '<rect x="72" y="76" width="76" height="212" rx="7" fill="url(#ckSteel)" stroke="#8d99a6" stroke-width="1.5"/>' + vP("M73 144h74", "", "#8d99a6", 1.6) +
        vR(136, 92, 4.4, 40, "#7d8a98", "", 2.2) + vR(136, 156, 4.4, 70, "#7d8a98", "", 2.2) + vP("M80 84v54M80 150v130", "", "#fff", 2.4) + vR(78, 285, 8, 3, "#555") + vR(134, 285, 8, 3, "#555") +
        vR(90, 104, 22, 13, "#e9eef3", "#a9b4bf", 2.4, 1) + vP("M94 110.5h14", "", "#4f8cff", 1.8) +
        // microwave over the cooker
        '<rect x="226" y="92" width="70" height="36" rx="3" fill="url(#ckSteel)" stroke="#8d99a6" stroke-width="1.4"/><rect x="231" y="97" width="44" height="26" rx="2" fill="url(#ckGlass)"/>' + vP("M235 101l10 18M243 101l7 12", "", "#fff", 1.2) + vR(279, 98, 13, 6, "#1d2129", "", 1) + vP("M281 108h9M281 112h9M281 116h9M281 120h9", "", "#9aa7b4", 1.6) + '<rect x="226" y="128" width="70" height="4" fill="black" opacity=".08"/>' +
        // worktop, sink and tap
        '<rect x="148" y="196" width="78" height="10" rx="1.5" fill="url(#ckTop)" stroke="#b8ad9c" stroke-width="1"/>' + vR(160, 196, 40, 4, "#8a96a3") + vP("M162 197h36", "", "#c9d2dc", 1) +
        vP("M184 196v-4", "", "#7d8a98", 5) + vP("M184 192V176q0-9 9-9q9 0 9 9v6", "", "#a9b4bf", 3.4) + vP("M184 192V176q0-9 9-9q9 0 9 9v6", "", "#e9eef3", 1.2) + vP("M178 190l6-2", "", "#7d8a98", 2.6) + vC(202, 183, 1.6, "#7d8a98") +
        // base units: three drawers and a cupboard under the sink
        vR(150, 206, 74, 76, "#f4ecdf", "#c8b89c", 0, 1.4) + vP("M150 230h36M150 256h36M186 206v76", "", "#c8b89c", 1.4) + vP("M162 218h14M162 243h14M162 269h14M212 220v14", "", "#9a8466", 3.2) + vR(150, 282, 74, 6, "#d8cbb5") +
        // cooker: hob, pot, knobs, oven
        '<rect x="226" y="196" width="72" height="92" rx="2" fill="url(#ckSteel)" stroke="#8d99a6" stroke-width="1.4"/>' + vR(224, 192, 76, 6, "#2a2e36", "", 2) +
        vE(242, 192, 12, 2.4, "#555") + vE(242, 192, 6, 1.2, "#e9633c") + vE(282, 192, 12, 2.4, "#555") +
        '<path d="M266 168h30v20q0 5-5 5h-20q-5 0-5-5z" fill="url(#ckSteel)" stroke="#7d8a98" stroke-width="1.2"/>' + vP("M266 172h30", "", "#7d8a98", 1) + vR(262, 172, 5, 3, "#3b3f47", "", 1) + vR(295, 172, 5, 3, "#3b3f47", "", 1) + vP("M266 168q15-6 30 0", "#d0d8e0", "#7d8a98", 1.2) + vC(281, 164, 2.4, "#3b3f47") +
        vP("M274 156q-4-6 0-12t0-12M284 152q-4-6 0-12", "", "#c9d2dc", 2) +
        vR(228, 200, 68, 14, "#e9eef3", "", 1) + [236, 248, 260, 272].map((x) => vC(x, 207, 3.8, "#3b3f47") + vP("M" + x + " 204v3", "", "#e9eef3", 1.2)).join("") + vR(282, 203, 10, 8, "#1d2129", "", 1.5) + vP("M284 207h6", "", "#7fe08a", 1.4) +
        vR(234, 218, 56, 6, "#9aa7b4", "#7d8a98", 3, 1) + '<rect x="234" y="230" width="56" height="44" rx="3" fill="url(#ckGlass)" stroke="#5b6470" stroke-width="1.2"/>' + vP("M240 236l14 30M250 236l9 20", "", "#fff", 1.2) + vP("M236 268h52", "", "#e9633c", 1.2) + vR(226, 280, 72, 8, "#c9d2dc", "#8d99a6", 0, 1),
      items: [["los armarios", "cupboards", 220, 50, "l", 0, "los gabinetes"], ["el congelador", "freezer", 118, 126, "l"], ["la ventana", "window", 172, 98, "l"], ["el grifo", "tap", 193, 168, "l", 0, "la llave del agua"], ["la nevera", "fridge", 118, 220, "l", 0, "el refrigerador"], ["el fregadero", "sink", 172, 198, "l"], ["los cajones", "drawers", 168, 243, "l"], ["el suelo", "floor", 130, 322, "l", 0, "el piso"],
        ["el microondas", "microwave", 254, 110, "r"], ["la olla", "pot", 286, 182, "r"], ["el fuego", "burner", 242, 192, "r", 0, "el quemador"], ["la encimera", "worktop", 214, 200, "r", 0, "el mesón"], ["los mandos", "knobs", 260, 207, "r", 0, "las perillas"], ["el horno", "oven", 262, 252, "r"], ["la cocina", "stove", 294, 284, "r", 0, "la estufa"]] },

    { id: "sala", grp: "home", bg: "#eef3ea", es: "El salón", en: "The living room", lvl: "a1", kind: "scene",
      // v278: ceiling with a fan and a pendant, a split air conditioner, a window with curtains on a rail, a framed picture, a clock,
      // a switch and a socket, a sofa with cushions, a floor lamp, a wall-mounted TV over a media unit (soundbar, console), a plant,
      // a coffee table (book, remote) on a rug, wooden floor
      svg: '<defs><linearGradient id="slSofa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d9be0"/><stop offset="1" stop-color="#3f6fb8"/></linearGradient>' +
        '<linearGradient id="slSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd0f5"/><stop offset="1" stop-color="#e6f5fd"/></linearGradient>' +
        '<linearGradient id="slTV" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f4f7a"/><stop offset=".55" stop-color="#16243a"/><stop offset="1" stop-color="#0d1522"/></linearGradient>' +
        '<linearGradient id="slFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8b88e"/><stop offset="1" stop-color="#c39d6f"/></linearGradient>' +
        '<radialGradient id="slGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff4c4" stop-opacity=".9"/><stop offset="1" stop-color="#fff4c4" stop-opacity="0"/></radialGradient></defs>' +
        vR(0, 0, 400, 340, "#eef3ea") +
        // ceiling and cornice, wooden floor, skirting
        vR(-120, 0, 640, 22, "#f7f4ee") + vR(-120, 22, 640, 4, "#e2dccf") + '<rect x="-120" y="262" width="640" height="78" fill="url(#slFloor)"/>' + vP("M-120 278h640M-120 298h640M-120 322h640M30 262l-6 16M150 278l-4 20M262 262l2 16M90 298l-6 24M330 298l6 24M210 322l-2 18", "", "#b48c5e", 1.1) + vR(-120, 256, 640, 6, "#fbfaf7", "#ddd6c8", 0, 1) +
        // ceiling fan
        vP("M150 26v10", "", "#6b7480", 2.4) + vE(150, 39, 9, 4.5, "#8a6b4a", "#6b4f33", 1) + '<path d="M141 39Q120 34 100 38Q118 44 141 41Z" fill="#a37a52" stroke="#7a5a3c" stroke-width="1"/><path d="M159 39Q180 34 200 38Q182 44 159 41Z" fill="#a37a52" stroke="#7a5a3c" stroke-width="1"/>' + vP("M144 43q6 6 12 0", "#fff5d6", "#d8c9a6", 1) +
        // pendant light
        vP("M214 26v14", "", "#6b7480", 1.4) + vP("M204 50q0-10 10-10t10 10z", "#2f6f5e", "#1f4f42", 1) + vE(214, 50, 6, 2, "#fff1a8") + '<ellipse cx="214" cy="58" rx="16" ry="9" fill="url(#slGlow)"/>' +
        // split air conditioner
        '<rect x="238" y="32" width="58" height="20" rx="6" fill="#fbfcfd" stroke="#b7c0ca" stroke-width="1.2"/>' + vP("M242 46h50", "", "#d6dde4", 1.2) + vP("M243 49h48", "", "#c4ccd5", 1.4) + vC(288, 39, 1.4, "#4caf50") + '<path d="M242 52q25 4 50 0" fill="none" stroke="#c4ccd5" stroke-width="1"/>' +
        // window with curtains on a rail
        '<rect x="118" y="62" width="46" height="80" fill="url(#slSky)"/>' + vP("M124 128q10-14 20-8q8 4 20-6v28h-40z", "#bfe3b0") + vR(116, 60, 50, 84, "none", "#fff", 2, 4) + vP("M141 62v80M118 100h46", "", "#fff", 3) + vR(112, 142, 58, 4, "#ece4d6", "#cdbfa8", 1, 1) +
        vP("M100 54h82", "", "#7a5a3c", 3) + vC(100, 54, 3, "#7a5a3c") + vC(182, 54, 3, "#7a5a3c") +
        '<path d="M104 56h18q-2 40 4 66q-2 22-4 34h-18q2-50 0-100z" fill="#d86a5b" stroke="#b04d40" stroke-width="1.2"/><path d="M178 56h-18q2 40-4 66q2 22 4 34h18q-2-50 0-100z" fill="#d86a5b" stroke="#b04d40" stroke-width="1.2"/>' +
        vP("M110 58q-1 40 2 96M116 58q1 40 4 96M172 58q1 40-2 96M166 58q-1 40-4 96", "", "#b04d40", 1, ) + vP("M104 118q10 4 20 2M178 118q-10 4-20 2", "", "#f2c94c", 2.4) +
        // framed picture and clock
        vR(186, 66, 42, 32, "#fffdf6", "#7a5a3c", 1, 3.4) + vR(191, 71, 32, 22, "#cfe8f6") + vP("M191 93l10-11 7 6 6-5 9 10z", "#5f9e58") + vC(216, 77, 3.4, "#f2c94c") +
        vC(266, 88, 12, "#fff", "#4a4f5a", 2.4) + vP("M266 80v8l5 4", "", "#333", 1.8) + vC(266, 88, 1.4, "#e05a47") +
        // switch and socket
        vR(184, 134, 9, 13, "#fff", "#aab3bd", 1.5, 1) + vR(186.6, 137, 3.8, 6, "#e9eef3", "#aab3bd", .8, .6) + vR(212, 238, 10, 10, "#fff", "#aab3bd", 1.5, 1) + vC(215, 243, .9, "#555") + vC(219, 243, .9, "#555") +
        // TV on the wall, media unit with soundbar and console, plant
        '<rect x="226" y="118" width="64" height="40" rx="2" fill="url(#slTV)" stroke="#1a1d24" stroke-width="2.4"/>' + vP("M232 124l14 28M244 124l8 16", "", "#fff", 1, ) + '<rect x="226" y="158" width="64" height="2" fill="black" opacity=".12"/>' +
        vR(236, 196, 46, 6, "#2d2f36", "", 3) + vP("M240 199h38", "", "#4a4f5a", 1) +
        vR(224, 202, 72, 50, "#a37a52", "#7a5a3c", 3, 1.4) + vP("M260 206v42", "", "#7a5a3c", 1.4) + vR(228, 206, 28, 42, "#7a5a3c") + vR(231, 224, 22, 8, "#f4f6fb", "#9aa7b4", 2, 1) + vC(235, 228, 1, "#4f8cff") + vP("M276 220v10", "", "#e6d3b8", 2.6) + vP("M230 252v6M290 252v6", "", "#5b4430", 3) +
        vR(282, 184, 12, 12, "#e9eef3", "#aab3bd", 2, 1) + vP("M288 184q-10-8-6-22M288 184q2-16 10-22M288 184q-2-12-14-14M288 184q6-8 14-6", "", "#3e8a4a", 2.6) + vE(281, 166, 3, 5, "#4f9a4a") + vE(296, 164, 3, 5, "#4f9a4a") + vE(276, 172, 4, 2.4, "#4f9a4a") +
        // floor lamp beside the sofa
        vP("M104 256V176", "", "#4a4f5a", 2.4) + vE(104, 257, 9, 2.4, "#4a4f5a") + '<path d="M93 176l4-18h14l4 18z" fill="#f6e7bf" stroke="#d1b47a" stroke-width="1.2"/><ellipse cx="104" cy="180" rx="16" ry="10" fill="url(#slGlow)"/>' +
        // sofa
        '<ellipse cx="164" cy="262" rx="58" ry="4" fill="black" opacity=".12"/>' + '<rect x="122" y="178" width="88" height="42" rx="10" fill="url(#slSofa)" stroke="#345f99" stroke-width="1.2"/>' + vP("M166 182v34", "", "#345f99", 1.2) +
        '<rect x="122" y="214" width="88" height="30" rx="6" fill="url(#slSofa)" stroke="#345f99" stroke-width="1.2"/>' + vP("M166 216v26", "", "#345f99", 1) + vR(114, 196, 16, 52, "#5584cc", "#345f99", 7, 1.2) + vR(202, 196, 16, 52, "#5584cc", "#345f99", 7, 1.2) +
        vP("M134 190q-2 12 4 22l22-2q-2-12-6-22z", "#f2c94c", "#c9a227", 1.2) + vP("M180 188q-4 12 2 22l22-4q-2-12-8-20z", "#ef8f6b", "#c4623f", 1.2) + vP("M126 248v8M206 248v8", "", "#5b4430", 3.4) +
        // rug, coffee table, book and remote
        vE(176, 310, 78, 18, "#c0563f", "#9c4130", 1.2) + vE(176, 310, 66, 13, "none", "#e8a07a", 1.6) +
        '<ellipse cx="176" cy="304" rx="44" ry="3" fill="black" opacity=".14"/>' + vR(130, 274, 92, 7, "#8a6b4a", "#6b4f33", 2, 1) + vP("M138 281v22M214 281v22", "", "#6b4f33", 4) + vP("M136 290h80", "", "#6b4f33", 2) +
        vR(140, 267, 26, 7, "#4f8cff", "#2f5fd0", 1, 1) + vP("M142 270h22", "", "#fff", 1.2) + vR(186, 269, 20, 5, "#2d2f36", "", 2.4) + vC(202, 271.5, 1.2, "#e05a47"),
      items: [["el techo", "ceiling", 120, 12, "l"], ["el ventilador de techo", "ceiling fan", 122, 38, "l"], ["las cortinas", "curtains", 112, 100, "l"], ["la ventana", "window", 132, 84, "l"], ["el cuadro", "picture", 206, 80, "l"], ["el interruptor", "light switch", 188, 140, "l"], ["la lámpara de pie", "floor lamp", 104, 168, "l"], ["los cojines", "cushions", 146, 200, "l"], ["el sofá", "sofa", 150, 232, "l"], ["el libro", "book", 152, 270, "l"], ["la mesa de centro", "coffee table", 176, 277, "l"], ["la alfombra", "rug", 136, 318, "l", 0, "el tapete"],
        ["la lámpara de techo", "ceiling light", 214, 46, "r"], ["el aire acondicionado", "air conditioner", 266, 42, "r"], ["el reloj", "clock", 266, 92, "r"], ["la pared", "wall", 206, 160, "r"], ["la tele", "TV", 258, 140, "r", 0, "el televisor"], ["la planta", "plant", 288, 172, "r"], ["la barra de sonido", "soundbar", 262, 199, "r"], ["el enchufe", "socket", 217, 243, "r", 0, "el tomacorriente"], ["la consola", "games console", 242, 228, "r"], ["el mueble de la tele", "TV stand", 278, 240, "r"], ["el mando a distancia", "remote control", 196, 271, "r", 0, "el control remoto"]] },

    { id: "dormitorio", grp: "home", bg: "#f3eefb", es: "El dormitorio", en: "The bedroom", lvl: "a1", kind: "scene",
      // v278: a wardrobe (mirror door), a hanger on a hook, a window with a blind, an upholstered headboard, a made bed (pillows,
      // turned-down sheet, quilted duvet), a bedside table with a drawer, a lamp and an alarm clock, a rug on a wooden floor
      svg: '<defs><linearGradient id="drWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b98d63"/><stop offset=".5" stop-color="#d4ab80"/><stop offset="1" stop-color="#b48760"/></linearGradient>' +
        '<linearGradient id="drMirror" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef7fd"/><stop offset=".5" stop-color="#c9e2f3"/><stop offset="1" stop-color="#e5f2fb"/></linearGradient>' +
        '<linearGradient id="drDuvet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb6e6"/><stop offset="1" stop-color="#5d8cc8"/></linearGradient>' +
        '<linearGradient id="drHead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a77a9c"/><stop offset="1" stop-color="#7f5677"/></linearGradient>' +
        '<linearGradient id="drSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3e72"/><stop offset="1" stop-color="#7b8fc6"/></linearGradient>' +
        '<radialGradient id="drGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2bf" stop-opacity=".95"/><stop offset="1" stop-color="#fff2bf" stop-opacity="0"/></radialGradient></defs>' +
        vR(0, 0, 400, 340, "#f3eefb") +
        // floor and skirting
        vR(-120, 268, 640, 72, "#d9bf9c") + vP("M-120 284h640M-120 304h640M-120 328h640M40 268l-4 16M170 284l-3 20M300 268l3 16M110 304l-4 24M250 304l4 24", "", "#c0a27a", 1.1) + vR(-120, 262, 640, 6, "#fbfaf7", "#ddd6c8", 0, 1) +
        // window: night sky, moon, blind half down
        '<rect x="198" y="36" width="68" height="58" fill="url(#drSky)"/>' + vC(250, 74, 7, "#fff6d0") + vC(253, 72, 6, "#4a5c94") + vC(214, 80, 1, "#fff") + vC(230, 70, 1, "#fff") + vC(240, 86, 1, "#fff") +
        vR(198, 36, 68, 22, "#f6efe2", "#d8ccb6", 0, 1) + vP("M198 44h68M198 51h68", "", "#e3d8c4", 1) + vP("M232 58v6", "", "#a99a80", 1.2) + vC(232, 66, 2, "#a99a80") +
        vR(196, 34, 72, 62, "none", "#fff", 2, 4) + vP("M232 58v36", "", "#fff", 3) + vR(192, 94, 80, 5, "#ece4d6", "#cdbfa8", 1, 1) +
        // hook and hanger
        vC(168, 56, 2.4, "#7d8a98") + vP("M168 58v4q0 4-4 4", "", "#7d8a98", 1.8) + '<path d="M168 66v6M152 84L168 72L184 84Z" fill="none" stroke="#a37a52" stroke-width="2.6" stroke-linejoin="round"/>' +
        // wardrobe
        '<ellipse cx="128" cy="268" rx="30" ry="3" fill="black" opacity=".12"/>' + '<rect x="102" y="60" width="52" height="202" rx="3" fill="url(#drWood)" stroke="#8a6b4a" stroke-width="1.4"/>' + vR(99, 56, 58, 6, "#a37a52", "#8a6b4a", 1, 1) + vP("M128 62v198", "", "#8a6b4a", 1.4) +
        '<rect x="106" y="70" width="18" height="122" rx="2" fill="url(#drMirror)" stroke="#a9b4bf" stroke-width="1"/>' + vP("M109 90l12-10M109 104l12-12M109 150l10-9", "", "#fff", 1.6) + vR(132, 70, 18, 122, "none", "#b8916a", 2, 1) +
        vP("M124 196v20M132 196v20", "", "#6b4f33", 3) + vR(102, 226, 52, 30, "none", "#8a6b4a", 0, 1.2) + vP("M120 241h16", "", "#6b4f33", 3) + vP("M106 262v4M150 262v4", "", "#6b4f33", 3) +
        // bed: headboard, frame, pillows, sheet, duvet
        '<path d="M164 196V150Q164 136 178 136H246Q260 136 260 150V196Z" fill="url(#drHead)" stroke="#6b4763" stroke-width="1.4"/>' + [184, 204, 224, 244].map((x) => vC(x, 152, 1.6, "#5f3d58") + vC(x, 170, 1.6, "#5f3d58")).join("") + vC(194, 161, 1.6, "#5f3d58") + vC(214, 161, 1.6, "#5f3d58") + vC(234, 161, 1.6, "#5f3d58") +
        '<ellipse cx="212" cy="268" rx="58" ry="3.4" fill="black" opacity=".12"/>' +
        vP("M170 192q0-12 12-12h22q8 0 8 8v4q0 6-6 6h-30q-6 0-6-6z", "#fff", "#cfd6e0", 1.2) + vP("M212 192q0-12 12-12h22q8 0 8 8v4q0 6-6 6h-30q-6 0-6-6z", "#fff", "#cfd6e0", 1.2) + vP("M178 186q10-3 20 0M220 186q10-3 20 0", "", "#e6ebf2", 1.4) +
        vR(158, 196, 108, 14, "#fbfcfe", "#cfd6e0", 2, 1.2) + vP("M160 204h104", "", "#e3e8f0", 1) +
        '<path d="M156 208H268L270 252Q212 258 154 252Z" fill="url(#drDuvet)" stroke="#4f7cac" stroke-width="1.2"/>' + vP("M174 210l-2 44M193 210l-1 46M212 210v46M231 210l1 46M250 210l2 44M157 230h112", "", "#4f7cac", .9) +
        vR(158, 252, 108, 8, "#8a6b4a", "#6b4f33", 1, 1) + vP("M164 260v6M260 260v6", "", "#5b3a29", 4) +
        // bedside table, lamp, alarm clock
        '<ellipse cx="285" cy="268" rx="18" ry="2.4" fill="black" opacity=".12"/>' + '<rect x="272" y="212" width="28" height="50" rx="2" fill="url(#drWood)" stroke="#8a6b4a" stroke-width="1.3"/>' + vR(270, 209, 32, 4, "#a37a52", "#8a6b4a", 1, 1) + vP("M272 234h28", "", "#8a6b4a", 1.2) + vR(280, 221, 12, 3, "#6b4f33", "", 1.5) + vR(280, 245, 12, 3, "#6b4f33", "", 1.5) + vP("M275 262v5M297 262v5", "", "#6b4f33", 3) +
        vP("M292 209v-16", "", "#8a6b4a", 2.4) + vE(292, 209, 6, 1.6, "#8a6b4a") + '<path d="M282 193l4-17h12l4 17z" fill="#f6e7bf" stroke="#d1b47a" stroke-width="1.2"/><ellipse cx="292" cy="190" rx="18" ry="12" fill="url(#drGlow)"/>' +
        vR(274, 199, 13, 10, "#e05a47", "#a8392b", 3, 1) + vC(280.5, 204, 3.4, "#fff") + vP("M280.5 202v2h1.8", "", "#333", .8) + vC(276, 198, 2, "#e05a47") + vC(285, 198, 2, "#e05a47") +
        // rug
        vE(212, 304, 50, 13, "#a98fd6", "#8a6fc0", 1.2) + vE(212, 304, 40, 9, "none", "#cbb9ec", 1.6),
      items: [["el espejo", "mirror", 115, 130, "l"], ["la percha", "hanger", 168, 80, "l", 0, "el gancho"], ["la cabecera", "headboard", 214, 146, "l"], ["el armario", "wardrobe", 141, 216, "l", 0, "el clóset"], ["la cama", "bed", 176, 256, "l"], ["la alfombra", "rug", 196, 304, "l", 0, "el tapete"],
        ["la ventana", "window", 216, 72, "r"], ["la almohada", "pillow", 236, 188, "r"], ["la sábana", "sheet", 248, 203, "r"], ["el edredón", "duvet", 232, 236, "r", 0, "la cobija"], ["la lámpara", "lamp", 292, 184, "r"], ["el despertador", "alarm clock", 280, 204, "r"], ["el cajón", "drawer", 290, 228, "r"], ["la mesita de noche", "bedside table", 292, 252, "r", 0, "la mesa de noche"]] },

    { id: "bano", grp: "home", bg: "#eaf6f8", es: "El baño", en: "The bathroom", lvl: "a1", kind: "scene",
      // v278: tiled walls, a shower head over a bath with a curtain on a rail, a toilet with its cistern and a paper holder,
      // a basin on a pedestal (tap, soap, toothbrush in a glass), a mirror cabinet, a towel on a rail, a bath mat
      svg: '<defs><linearGradient id="bnCurt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f6b9c9"/><stop offset=".5" stop-color="#fbd3dd"/><stop offset="1" stop-color="#e999ae"/></linearGradient>' +
        '<linearGradient id="bnPor" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dfe5ea"/><stop offset=".4" stop-color="#ffffff"/><stop offset="1" stop-color="#d3dbe2"/></linearGradient>' +
        '<linearGradient id="bnChrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d99a6"/><stop offset=".5" stop-color="#eef2f6"/><stop offset="1" stop-color="#8d99a6"/></linearGradient>' +
        '<linearGradient id="bnMirror" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2f9fd"/><stop offset=".5" stop-color="#c7e2f2"/><stop offset="1" stop-color="#e7f3fa"/></linearGradient></defs>' +
        vR(0, 0, 400, 340, "#eaf6f8") +
        // tiles on the lower wall, floor tiles
        vR(-120, 150, 640, 136, "#f7fbfc") + vP("M-120 150h640M-120 172h640M-120 194h640M-120 216h640M-120 238h640M-120 260h640", "", "#d5e6ea", 1) + vP("M100 150v136M122 150v136M144 150v136M166 150v136M188 150v136M210 150v136M232 150v136M254 150v136M276 150v136M298 150v136", "", "#d5e6ea", 1) +
        vR(-120, 148, 640, 3, "#cfe0e5") + vR(-120, 286, 640, 54, "#c7d4d8") + vP("M-120 286h640M-120 302h640M-120 322h640M80 286l-14 54M140 286l-6 54M200 286v54M260 286l6 54M320 286l14 54", "", "#adbfc4", 1.1) +
        // shower: pipe, head, water, curtain rail and curtain
        vP("M112 236V62Q112 56 118 56H134", "", "#9aa7b4", 3.4) + vP("M126 56h12l4 10h-20z", "#c9d2dc", "#8d99a6", 1.2) + vP("M126 72v8M132 72v12M138 72v8M129 88v6M135 88v6", "", "#7cc0e8", 1.6) + vR(108, 180, 8, 10, "#c9d2dc", "#8d99a6", 2, 1) +
        vP("M102 48h76", "", "#8d99a6", 3) + vC(102, 48, 2.6, "#8d99a6") + vC(178, 48, 2.6, "#8d99a6") + [150, 156, 162, 168, 174].map((x) => vC(x, 52, 2.4, "none", "#8d99a6", 1)).join("") +
        '<path d="M148 54h28q-2 60 2 120q-4 30 0 60h-28q-3-30 0-60q4-60-2-120z" fill="url(#bnCurt)" stroke="#d07a93" stroke-width="1.2"/>' + vP("M155 56q2 60-1 178M162 56q-2 60 1 178M169 56q2 60-1 178", "", "#d07a93", 1, ) +
        // bathtub
        '<ellipse cx="138" cy="290" rx="40" ry="3" fill="black" opacity=".1"/>' + '<path d="M100 230H178V256Q178 284 150 284H128Q100 284 100 256Z" fill="url(#bnPor)" stroke="#a9b4bf" stroke-width="1.4"/>' + vR(98, 226, 82, 7, "#fff", "#a9b4bf", 3, 1.2) + vP("M108 284l-2 6M170 284l2 6", "", "#a9b4bf", 3) +
        // toilet: cistern, bowl, seat, flush, paper
        '<rect x="186" y="188" width="32" height="40" rx="4" fill="url(#bnPor)" stroke="#a9b4bf" stroke-width="1.3"/>' + vR(184, 185, 36, 6, "#fff", "#a9b4bf", 3, 1.2) + vC(210, 198, 3, "#c9d2dc", "#8d99a6", 1) +
        vR(180, 228, 44, 6, "#fff", "#a9b4bf", 3, 1.2) + '<path d="M182 234H222Q222 258 202 262Q182 258 182 234Z" fill="url(#bnPor)" stroke="#a9b4bf" stroke-width="1.3"/>' + '<path d="M192 260h20l3 26h-26z" fill="url(#bnPor)" stroke="#a9b4bf" stroke-width="1.3"/>' + '<ellipse cx="202" cy="288" rx="16" ry="2.4" fill="black" opacity=".1"/>' +
        vP("M228 208v-6h8", "", "#8d99a6", 2.4) + vC(232, 216, 8, "#fff", "#c9d2dc", 1.2) + vC(232, 216, 3, "#dfe5ea") + vP("M232 224v10", "", "#fff", 7) + vP("M228 224v10", "", "#e6ebef", 1, ) +
        // towel rail and towel
        vP("M220 112h26", "", "url(#bnChrome)", 3) + vC(220, 112, 2.4, "#8d99a6") + vC(246, 112, 2.4, "#8d99a6") + vP("M222 112h22v48q-11 4-22 0z", "#f4a742", "#c97f1d", 1.2) + vP("M222 150q11 4 22 0M222 154q11 4 22 0", "", "#fff", 1.6) +
        // mirror cabinet
        '<rect x="252" y="80" width="40" height="66" rx="4" fill="#fbfcfd" stroke="#a9b4bf" stroke-width="1.4"/><rect x="256" y="84" width="32" height="58" rx="2" fill="url(#bnMirror)"/>' + vP("M262 100l12-10M262 114l18-16", "", "#fff", 2) + '<rect x="252" y="146" width="40" height="3" fill="black" opacity=".08"/>' +
        // basin on a pedestal, tap, soap, toothbrush in a glass
        '<path d="M246 202h52q0 14-12 18h-28q-12-4-12-18z" fill="url(#bnPor)" stroke="#a9b4bf" stroke-width="1.4"/>' + vR(244, 198, 56, 6, "#fff", "#a9b4bf", 3, 1.2) + '<path d="M264 220h16l-2 66h-12z" fill="url(#bnPor)" stroke="#a9b4bf" stroke-width="1.3"/>' + '<ellipse cx="272" cy="288" rx="14" ry="2.2" fill="black" opacity=".1"/>' +
        vP("M272 198v-10h8", "", "url(#bnChrome)", 3.4) + vR(268, 184, 8, 4, "#c9d2dc", "#8d99a6", 1.5, 1) + vE(254, 196, 6, 2.6, "#f2c94c", "#c9a227", 1) +
        '<path d="M287 182h8l-1 16h-6z" fill="#cfe9f7" stroke="#7fa6c4" stroke-width="1" opacity=".95"/>' + vP("M289 182l-2-14M293 182l1-12", "", "#4f8cff", 2) + vR(285.6, 165, 3, 5, "#fff", "#a9b4bf", 1, .6) + vR(292.6, 167, 3, 5, "#fff", "#a9b4bf", 1, .6) +
        // bath mat
        vR(112, 300, 62, 14, "#7fb3d6", "#5b8fb8", 4, 1.2) + vP("M116 300v-3M122 300v-3M128 300v-3M134 300v-3M140 300v-3M146 300v-3M152 300v-3M158 300v-3M164 300v-3M170 300v-3", "", "#5b8fb8", 1),
      items: [["la ducha", "shower", 132, 64, "l"], ["la cortina de baño", "shower curtain", 162, 130, "l", 0, "la cortina de la ducha"], ["la cisterna", "cistern", 196, 206, "l", 0, "el tanque"], ["la bañera", "bathtub", 130, 258, "l", 0, "la tina"], ["el inodoro", "toilet", 202, 248, "l"], ["la alfombrilla", "bath mat", 142, 307, "l", 0, "el tapete de baño"],
        ["la toalla", "towel", 233, 134, "r"], ["el espejo", "mirror", 272, 112, "r"], ["el cepillo de dientes", "toothbrush", 291, 174, "r"], ["el grifo", "tap", 276, 188, "r", 0, "la llave"], ["el jabón", "soap", 254, 196, "r"], ["el lavabo", "washbasin", 272, 210, "r", 0, "el lavamanos"], ["el papel higiénico", "toilet paper", 232, 216, "r"]] },

    { id: "comedor", grp: "home", bg: "#fbf1e6", es: "El comedor", en: "The dining room", lvl: "a1", kind: "scene",
      // v278: wainscoted wall, a pendant over the table, a sideboard with a vase of flowers, two chairs, a table with a cloth,
      // two place settings (plate, fork, knife, spoon, glass, napkin), a jug and a fruit bowl, wooden floor
      svg: '<defs><linearGradient id="cmWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c79c6f"/><stop offset="1" stop-color="#a27650"/></linearGradient>' +
        '<linearGradient id="cmCloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6ebf3"/></linearGradient>' +
        '<linearGradient id="cmGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d7eefb" stop-opacity=".95"/><stop offset=".4" stop-color="#ffffff" stop-opacity=".9"/><stop offset="1" stop-color="#b9dcf1" stop-opacity=".95"/></linearGradient>' +
        '<radialGradient id="cmGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2bf" stop-opacity=".9"/><stop offset="1" stop-color="#fff2bf" stop-opacity="0"/></radialGradient></defs>' +
        vR(0, 0, 400, 340, "#fbf1e6") +
        // wainscoting, floor
        vR(-120, 178, 640, 96, "#f3e2cd") + vR(-120, 176, 640, 4, "#e0c8a8") + vP("M-30 186v80M30 186v80M90 186v80M150 186v80M210 186v80M270 186v80M330 186v80M390 186v80", "", "#e6d2b6", 2) +
        vR(-120, 274, 640, 66, "#c8a77e") + vP("M-120 290h640M-120 310h640M-120 332h640M60 274l-4 16M190 290l-3 20M320 274l3 16M120 310l-4 22M270 310l4 22", "", "#a8875e", 1.1) + vR(-120, 268, 640, 6, "#fbfaf7", "#ddd6c8", 0, 1) +
        // pendant light
        vP("M200 0v36", "", "#555", 1.6) + '<path d="M176 60q2-24 24-24t24 24z" fill="#2f6f5e" stroke="#1f4f42" stroke-width="1.2"/>' + vE(200, 60, 18, 3, "#1f4f42") + vE(200, 61, 8, 3, "#fff1a8") + '<ellipse cx="200" cy="72" rx="30" ry="14" fill="url(#cmGlow)"/>' +
        // sideboard with vase
        '<ellipse cx="200" cy="152" rx="60" ry="2.4" fill="black" opacity=".1"/>' + '<rect x="144" y="100" width="112" height="48" rx="3" fill="url(#cmWood)" stroke="#7a5a3c" stroke-width="1.4"/>' + vR(140, 96, 120, 6, "#8a6542", "#6b4f33", 2, 1) +
        vP("M181 102v46M219 102v46", "", "#7a5a3c", 1.4) + vR(149, 106, 28, 36, "none", "#dcb98f", 2, 1) + vR(186, 106, 28, 36, "none", "#dcb98f", 2, 1) + vR(224, 106, 28, 36, "none", "#dcb98f", 2, 1) + vC(174, 124, 1.8, "#5b3a29") + vC(189, 124, 1.8, "#5b3a29") + vC(226, 124, 1.8, "#5b3a29") + vP("M150 148v6M250 148v6", "", "#5b3a29", 3) +
        '<path d="M170 96q-6-8-2-14h12q4 6-2 14z" fill="#7fc4e8" stroke="#4f8cc4" stroke-width="1"/>' + vP("M174 82q-8-10-4-22M176 82q2-14 8-20M175 82q-2-8-10-10", "", "#3e8a4a", 1.8) + vC(169, 59, 3.6, "#e45b8f") + vC(184, 61, 3.4, "#f2c94c") + vC(165, 71, 3, "#ff8a6b") + vC(178, 56, 2.6, "#fff") +
        // chairs behind the table (backs)
        '<path d="M110 268V140q0-6 6-6h12q6 0 6 6v58" fill="none" stroke="#8a5a3c" stroke-width="5"/>' + vP("M114 152h16M114 170h16M114 188h16", "", "#8a5a3c", 4) + vP("M106 222h40M110 222v46M142 222v40", "", "#6b4430", 5) +
        '<path d="M290 268V140q0-6-6-6h-12q-6 0-6 6v58" fill="none" stroke="#8a5a3c" stroke-width="5"/>' + vP("M286 152h-16M286 170h-16M286 188h-16", "", "#8a5a3c", 4) + vP("M294 222h-40M290 222v46M258 222v40", "", "#6b4430", 5) +
        // table with cloth
        '<ellipse cx="200" cy="276" rx="80" ry="4" fill="black" opacity=".12"/>' + vP("M124 236v38M276 236v38", "", "#6b4430", 7) +
        '<path d="M126 182H274L290 206H110Z" fill="url(#cmCloth)" stroke="#c9cfdb" stroke-width="1.2"/><path d="M110 206H290L286 238Q258 242 234 238Q212 244 200 238Q182 244 162 238Q138 242 114 238Z" fill="url(#cmCloth)" stroke="#c9cfdb" stroke-width="1.2"/>' + vP("M150 207l-2 30M200 207v30M250 207l2 30", "", "#dde3ec", 1.2) +
        // place settings
        [154, 246].map((x) => '<ellipse cx="' + x + '" cy="197" rx="20" ry="6.4" fill="black" opacity=".07"/>' + vE(x, 195, 19, 6.2, "#fff", "#9aa7b4", 1.2) + vE(x, 195, 11, 3.4, "#f1f4f8", "#cfd6e0", 1)).join("") +
        vP("M128 186l-3 16", "", "#8d99a6", 2) + vP("M125.4 186l.4 4M128.4 186l-.2 4M131 186.6l-.6 4", "", "#8d99a6", 1.2) +
        vP("M180 186l3 15", "", "#8d99a6", 2.6) + vP("M180 186q-2 4 1 7", "", "#8d99a6", 1.4) +
        '<path d="M214 186l12 0-7 12h-10z" fill="#e07a6b" stroke="#b5534a" stroke-width="1"/>' +
        vP("M270 186l3 15", "", "#8d99a6", 2.6) + vP("M276 187.5l2 13", "", "#8d99a6", 2) + vE(275.6, 187, 2.6, 3.6, "#9aa7b4") +
        '<path d="M157 164h11l-1.4 20h-8.2z" fill="url(#cmGlass)" stroke="#7fa6c4" stroke-width="1.1"/><path d="M158.6 176h8" stroke="#bfe0f5" stroke-width="5" opacity=".6"/>' +
        '<path d="M232 164h11l-1.4 20h-8.2z" fill="url(#cmGlass)" stroke="#7fa6c4" stroke-width="1.1"/><path d="M233.6 176h8" stroke="#bfe0f5" stroke-width="5" opacity=".6"/>' +
        // jug and fruit bowl
        '<path d="M192 158h16v4q5 5 5 12v10h-26v-10q0-7 5-12z" fill="url(#cmGlass)" stroke="#7fa6c4" stroke-width="1.2"/>' + vP("M188 172h24v12h-24z", "#ffd58a", "", 0) + vP("M213 166q7 0 7 7t-7 7", "", "#7fa6c4", 1.8) + vP("M192 158l-3-2", "", "#7fa6c4", 1.6) +
        vC(213, 174, 5, "#e05a47") + vC(222, 171, 5.2, "#f2c94c") + vC(231, 174, 4.8, "#7fb37a") + vP("M218 167q2-4 6-4", "", "#5b8f3a", 1.4) + '<path d="M206 176h32l-4 8h-24z" fill="#c9a27a" stroke="#8a6b4a" stroke-width="1.2"/>',
      items: [["la lámpara de techo", "ceiling light", 200, 48, "l"], ["el jarrón", "vase", 175, 88, "l", 0, "el florero"], ["las sillas", "chairs", 120, 160, "l"], ["el vaso", "glass", 162, 176, "l"], ["el tenedor", "fork", 127, 194, "l"], ["el plato", "plate", 150, 196, "l"], ["el mantel", "tablecloth", 160, 222, "l"], ["la mesa", "table", 124, 258, "l"],
        ["el aparador", "sideboard", 238, 132, "r"], ["la jarra", "jug", 198, 168, "r"], ["el frutero", "fruit bowl", 228, 180, "r"], ["la servilleta", "napkin", 219, 191, "r"], ["el cuchillo", "knife", 271, 193, "r"], ["la cuchara", "spoon", 277, 196, "r"]] },

    { id: "casa", grp: "home", bg: "#dff0fb", es: "La casa por fuera", en: "Outside the house", lvl: "a2", kind: "scene",
      // v278: sky with sun and clouds, a tiled roof with a chimney (smoke), a rendered house with framed windows and shutters,
      // a balcony with railings, a panelled front door with a step, a doorbell, a garage, a tree, a fence, a letterbox, a path and a garden
      svg: '<defs><linearGradient id="csSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc9f2"/><stop offset="1" stop-color="#e2f3fd"/></linearGradient>' +
        '<linearGradient id="csRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8664c"/><stop offset="1" stop-color="#a9432f"/></linearGradient>' +
        '<linearGradient id="csWall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fbeed6"/><stop offset="1" stop-color="#efdcb8"/></linearGradient>' +
        '<linearGradient id="csGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd486"/><stop offset="1" stop-color="#6fae5c"/></linearGradient>' +
        '<linearGradient id="csWin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9f6ff"/><stop offset=".5" stop-color="#b6dcf4"/><stop offset="1" stop-color="#d7ecfa"/></linearGradient>' +
        '<radialGradient id="csSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3b0"/><stop offset=".45" stop-color="#ffd86b" stop-opacity=".9"/><stop offset="1" stop-color="#ffd86b" stop-opacity="0"/></radialGradient></defs>' +
        vR(0, 0, 400, 340, "#dff0fb") + '<rect x="-120" y="0" width="640" height="272" fill="url(#csSky)"/>' + '<circle cx="122" cy="34" r="26" fill="url(#csSun)"/>' + vC(122, 34, 11, "#ffd45a") +
        vP("M268 34q4-10 14-8q6-8 16-2q10 0 10 10H268z", "#fff") + vP("M158 58q3-7 10-6q5-6 12-1q8 0 8 7H158z", "#fff") +
        // chimney and smoke
        vR(232, 56, 18, 42, "#b4573f", "#83392a", 1, 1.2) + vR(229, 52, 24, 6, "#8f4432", "", 1) + vP("M236 50q-6-8 0-14q6-6 0-12M246 46q-5-7 0-12", "", "#c9d2dc", 2.4) +
        // house body, roof, eaves shadow
        '<rect x="112" y="120" width="150" height="152" fill="url(#csWall)" stroke="#c9a86a" stroke-width="1.2"/>' + '<rect x="112" y="120" width="150" height="6" fill="black" opacity=".08"/>' +
        '<path d="M98 126L187 60L276 126Z" fill="url(#csRoof)" stroke="#83392a" stroke-width="1.4" stroke-linejoin="round"/>' + vP("M128 104h118M146 90h82M164 77h46M115 116h144", "", "#9b3d2a", 1.1) + vP("M96 127h182", "", "#7a3324", 3) +
        vC(187, 96, 8, "#e9f6ff", "#83392a", 2) + vP("M187 88v16M179 96h16", "", "#83392a", 1.4) +
        // windows with shutters
        '<rect x="126" y="140" width="32" height="30" fill="url(#csWin)" stroke="#fff" stroke-width="3"/>' + vP("M142 140v30M126 155h32", "", "#fff", 2) + vR(116, 139, 9, 32, "#5f9e8f", "#467c70", 1, 1) + vR(159, 139, 9, 32, "#5f9e8f", "#467c70", 1, 1) + vR(122, 170, 40, 4, "#e8d6b4", "#c9a86a", 1, 1) +
        '<rect x="126" y="200" width="32" height="32" fill="url(#csWin)" stroke="#fff" stroke-width="3"/>' + vP("M142 200v32M126 216h32", "", "#fff", 2) + vR(116, 199, 9, 34, "#5f9e8f", "#467c70", 1, 1) + vR(159, 199, 9, 34, "#5f9e8f", "#467c70", 1, 1) + vR(122, 232, 40, 4, "#e8d6b4", "#c9a86a", 1, 1) + vP("M128 230q4-6 8 0q4-6 8 0q4-6 8 0q4-6 8 0", "#e45b8f", "#a8325f", .8) +
        // balcony
        '<rect x="210" y="130" width="30" height="40" fill="url(#csWin)" stroke="#fff" stroke-width="3"/>' + vP("M225 130v40", "", "#fff", 2) + vR(200, 168, 50, 5, "#6b4f33") + vP("M202 150h46", "", "#6b4f33", 2.6) + vP("M205 151v17M211 151v17M217 151v17M223 151v17M229 151v17M235 151v17M241 151v17M247 151v17", "", "#6b4f33", 1.6) + '<rect x="200" y="173" width="50" height="3" fill="black" opacity=".1"/>' +
        // door, step, lamp and doorbell
        '<path d="M174 272V214q0-14 15-14t15 14v58z" fill="#8a5a3c" stroke="#5b3a29" stroke-width="1.4"/>' + vR(179, 220, 9, 18, "none", "#6b4430", 1, 1.2) + vR(190, 220, 9, 18, "none", "#6b4430", 1, 1.2) + vR(179, 244, 20, 22, "none", "#6b4430", 1, 1.2) + vC(198, 246, 2.2, "#f2c94c") + vR(168, 272, 42, 5, "#cfc6b8", "#a9a090", 1, 1) +
        vR(209, 226, 8, 10, "#fff", "#7d8a98", 2, 1) + vC(213, 231, 2.4, "#f2c94c", "#c9a227", .8) +
        // garage
        vR(262, 192, 38, 80, "#e5e1d8", "#b9b2a4", 0, 1.2) + vP("M262 192l19-10l19 10", "#c45d45", "#83392a", 1.2) + vR(266, 202, 30, 70, "#f3f1ec", "#b9b2a4", 1, 1) + vP("M266 212h30M266 222h30M266 232h30M266 242h30M266 252h30M266 262h30", "", "#cfc8b9", 1.6) + vR(278, 264, 6, 2, "#7d8a98") +
        // tree
        vP("M106 272v-36", "", "#6b4f33", 6) + vP("M106 250l-8-8M106 244l7-7", "", "#6b4f33", 2.4) + vC(100, 226, 17, "#5c9c58") + vC(114, 214, 13, "#6fae6a") + vC(96, 208, 11, "#78b773") + vC(112, 232, 11, "#5c9c58") + vC(104, 218, 4, "#e05a47") + vC(116, 226, 3.4, "#e05a47") +
        // garden, path, fence, letterbox
        '<rect x="-120" y="272" width="640" height="68" fill="url(#csGrass)"/>' + vP("M176 272h26l26 68h-78z", "#e8d7b1") + vP("M172 288h34M168 304h42M163 322h52", "", "#d3be92", 1.4) +
        [[100, 160], [222, 300]].map(([a, b]) => { let s = ""; for (let x = a + 4; x <= b - 4; x += 12) s += '<path d="M' + x + ' 300v-20l3-4 3 4v20z" fill="#fff" stroke="#c9cfd6" stroke-width="1"/>'; return s + vP("M" + a + " 284H" + b + "M" + a + " 296H" + b, "", "#fff", 2.6); }).join("") +
        vP("M136 316v-24", "", "#6b4f33", 3) + '<path d="M124 282h22v10h-22z" fill="#e05a47" stroke="#a8392b" stroke-width="1.2"/><path d="M124 282q11-8 22 0" fill="#e86d5b" stroke="#a8392b" stroke-width="1.2"/>' + vP("M146 284v-7h4", "", "#a8392b", 2) +
        vC(110, 318, 2.6, "#f2c94c") + vC(118, 324, 2.6, "#e45b8f") + vC(240, 320, 2.6, "#f2c94c") + vC(252, 314, 2.6, "#e45b8f") + vC(264, 324, 2.6, "#fff"),
      items: [["el tejado", "roof", 150, 104, "l", 0, "el techo"], ["la ventana", "window", 134, 222, "l"], ["el árbol", "tree", 100, 222, "l"], ["la puerta", "door", 189, 254, "l"], ["el buzón", "letterbox", 134, 288, "l"], ["el jardín", "garden", 112, 330, "l"],
        ["la chimenea", "chimney", 241, 78, "r"], ["el balcón", "balcony", 226, 160, "r"], ["la pared", "wall", 246, 200, "r"], ["el timbre", "doorbell", 213, 231, "r"], ["el garaje", "garage", 282, 238, "r"], ["la valla", "fence", 270, 290, "r", 0, "la cerca"], ["el camino", "path", 196, 314, "r", 0, "el caminito"]] },
    { id: "bici", grp: "move", bg: "#eef6ee", es: "La bicicleta", en: "Parts of a bicycle", lvl: "a2", kind: "scene",
      // v278: a town bike facing right: tyres with tread, silver rims, 18 spokes, hubs; a frame with real geometry (top, down and
      // seat tubes, stays, head tube, raked fork), saddle on a seat post, stem and swept-back bars with grips, brake lever, bell and
      // lamp, a rack and mudguards, chainring with teeth, crank, pedal, chain and rear sprocket
      svg: '<defs><linearGradient id="bkFrame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fc0a0"/><stop offset="1" stop-color="#1f8a6c"/></linearGradient>' +
        '<linearGradient id="bkChrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f4f7"/><stop offset="1" stop-color="#9aa5b1"/></linearGradient></defs>' +
        vR(0, 0, 400, 340, "#eef6ee") + vR(-120, 280, 640, 60, "#d3dcc8") + vP("M-120 280h640", "", "#b9c4ac", 1.4) + '<ellipse cx="200" cy="282" rx="104" ry="5" fill="black" opacity=".12"/>' +
        // wheels
        [142, 258].map((x) => { let sp = ""; for (let k = 0; k < 18; k++) { const a = k * Math.PI / 9, b = a + 0.5; sp += "M" + (x + 4 * Math.cos(a)).toFixed(1) + " " + (240 + 4 * Math.sin(a)).toFixed(1) + "L" + (x + 33 * Math.cos(b)).toFixed(1) + " " + (240 + 33 * Math.sin(b)).toFixed(1); }
          return vC(x, 240, 39, "none", "#262a30", 7) + vC(x, 240, 41.5, "none", "#3b4048", 1.4) + '<circle cx="' + x + '" cy="240" r="34.5" fill="none" stroke="url(#bkChrome)" stroke-width="3"/>' + vP(sp, "", "#b8c1cb", .9) + vC(x, 240, 5, "#c9d2dc", "#7d8a98", 1.2) + vC(x, 240, 1.6, "#7d8a98") + vR(x - 1.4, 204.5, 2.8, 5, "#7d8a98", "", .6); }).join("") +
        // mudguards
        vP("M100 222A44 44 0 0 1 166 202", "", "#2d6f5b", 3.4) + vP("M234 202A44 44 0 0 1 300 228", "", "#2d6f5b", 3.4) +
        // rack over the back wheel
        vP("M108 196h56M114 196l18 44M152 196l-10 44M110 200h50", "", "#4a4f5a", 2.4) + vP("M164 196l18-8", "", "#4a4f5a", 2) + vR(100, 194, 6, 8, "#e05a47", "#a8392b", 1, 1) +
        // chain and rear sprocket
        vC(142, 240, 7, "#7d8a98", "#4a4f5a", 1.4) + vP("M142 233L194 231M142 247L194 257", "", "#3b3f47", 2.2) + vP("M142 233L194 231M142 247L194 257", "", "#9aa5b1", .8, ) +
        // frame
        '<path d="M142 240L194 244L180 176M142 240L182 182M180 176L242 172M194 244L245 190" fill="none" stroke="url(#bkFrame)" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M240 168L246 196" stroke="url(#bkFrame)" stroke-width="8" stroke-linecap="round"/><path d="M246 196Q252 222 258 240" fill="none" stroke="#3a4048" stroke-width="5" stroke-linecap="round"/>' +
        vP("M150 236L190 240M186 184L242 180", "", "#fff", 1.2) +
        // seat post and saddle
        vP("M180 176L177 164", "", "url(#bkChrome)", 4) + '<path d="M160 160Q170 154 192 157Q196 160 192 163Q180 166 166 166Q158 165 160 160Z" fill="#2b2b2b" stroke="#111" stroke-width="1"/><path d="M166 159q12-3 22-1" stroke="#555" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
        // stem, bars, grip, brake lever, bell, lamp
        vP("M240 168L242 156L232 152", "", "#4a4f5a", 3.4) + vP("M232 152Q222 150 218 156", "", "#4a4f5a", 3) + '<path d="M214 154l10-2 2 7-10 2z" fill="#2b2b2b"/>' + vP("M228 158q-4 6-12 8", "", "#2b2b2b", 2.2) +
        vC(236, 148, 4, "#f2c94c", "#c9a227", 1) + vP("M236 152v2", "", "#4a4f5a", 1.4) +
        '<path d="M248 176h10q4 0 4 4v2q0 4-4 4h-10z" fill="#e9eef3" stroke="#7d8a98" stroke-width="1.2"/><ellipse cx="261" cy="181" rx="2.4" ry="4" fill="#fff6a8"/>' + vP("M244 180h4", "", "#4a4f5a", 2) +
        // chainring, crank, pedal
        (() => { let t = ""; for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12; t += "M" + (194 + 13 * Math.cos(a)).toFixed(1) + " " + (244 + 13 * Math.sin(a)).toFixed(1) + "L" + (194 + 15.4 * Math.cos(a)).toFixed(1) + " " + (244 + 15.4 * Math.sin(a)).toFixed(1); } return vP(t, "", "#7d8a98", 2.2); })() +
        vC(194, 244, 13.4, "#c9d2dc", "#7d8a98", 1.4) + vC(194, 244, 8, "none", "#9aa5b1", 1.2) + vC(194, 244, 3, "#4a4f5a") + vP("M194 244L211 263", "", "#4a4f5a", 4.4) + vR(203, 262, 18, 6, "#2b2b2b", "#111", 1.4, 1) + vP("M206 265h12", "", "#666", 1),
      items: [["el sillín", "saddle", 176, 160, "l", 0, "el asiento"], ["el portabultos", "rack", 128, 196, "l", 0, "la parrilla"], ["el guardabarros", "mudguard", 112, 207, "l", 0, "el guardafango"], ["el piñón", "rear sprocket", 142, 240, "l"], ["el neumático", "tyre", 103, 252, "l", 0, "la llanta"], ["los radios", "spokes", 156, 262, "l", 0, "los rayos"], ["la rueda", "wheel", 142, 279, "l"], ["la cadena", "chain", 170, 252, "l"],
        ["el timbre", "bell", 236, 148, "r"], ["el manillar", "handlebars", 226, 152, "r", 0, "el manubrio"], ["el freno", "brake lever", 222, 162, "r"], ["la luz", "light", 258, 181, "r"], ["el cuadro", "frame", 214, 222, "r", 0, "el marco"], ["la horquilla", "fork", 252, 218, "r", 0, "la horquilla"], ["el plato", "chainring", 202, 236, "r"], ["el pedal", "pedal", 212, 265, "r"]] },

    { id: "coche", grp: "move", bg: "#eef2f8", es: "El coche", en: "Parts of a car", lvl: "a2", kind: "scene",
      // v278 (two views as v273/v274): side view facing right — boot and tail light at the back (left), long bonnet and headlight at the
      // front (right), tinted glass, door seams, handles, mirror, alloy wheels; front view — windscreen and wipers, bonnet, grille,
      // headlights, indicators, plate, bumper, mirrors, tyres. Soft shadows on the road.
      svg: '<defs><linearGradient id="caBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f27a66"/><stop offset=".55" stop-color="#d9493a"/><stop offset="1" stop-color="#a5302a"/></linearGradient>' +
        '<linearGradient id="caGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f2fb"/><stop offset=".5" stop-color="#9cc4de"/><stop offset="1" stop-color="#5f86a3"/></linearGradient>' +
        '<radialGradient id="caRim" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#f4f7fa"/><stop offset="1" stop-color="#9aa5b1"/></radialGradient></defs>' +
        vR(0, 0, 400, 340, "#eef2f8") + vR(-120, 150, 640, 12, "#c9d0d8") + vR(-120, 302, 640, 38, "#c9d0d8") + '<ellipse cx="200" cy="151" rx="108" ry="4" fill="black" opacity=".16"/><ellipse cx="200" cy="303" rx="88" ry="4" fill="black" opacity=".16"/>' +
        // SIDE VIEW
        '<path d="M100 128L100 104Q100 94 108 92L130 90Q142 70 160 62Q172 58 196 58Q214 58 226 66L246 88Q276 92 292 98Q302 102 302 112L302 128Q302 132 298 132L284 132A22 22 0 0 0 240 132L158 132A22 22 0 0 0 114 132L104 132Q100 132 100 128Z" fill="url(#caBody)" stroke="#8f2a22" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<path d="M136 89Q146 72 160 66Q166 64 186 63V89Z" fill="url(#caGlass)" stroke="#7a2a20" stroke-width="1.2"/><path d="M192 63H206Q216 63 222 69L239 89H192Z" fill="url(#caGlass)" stroke="#7a2a20" stroke-width="1.2"/>' + vP("M150 84l12-16M198 86l14-20", "", "#fff", 2) +
        vP("M134 92V128M189 62V128M244 90V128M130 92Q190 88 246 90", "", "#8f2a22", 1.3) + vP("M104 110Q200 104 300 112", "", "#ffd2c8", 1.2) +
        vR(172, 98, 13, 3.4, "#7a2a20", "", 1.7) + vR(226, 98, 13, 3.4, "#7a2a20", "", 1.7) + '<path d="M236 86l10-4v8h-8z" fill="#2b2b2b"/>' +
        '<path d="M100 96h7v14h-7z" fill="#c81e1e" stroke="#8f1414" stroke-width="1"/>' + vC(122, 104, 4.4, "#c4483a", "#7a2a20", 1.2) + '<path d="M290 100L302 106V112L292 110Z" fill="#fff6c4" stroke="#c9a227" stroke-width="1"/>' +
        vR(98, 120, 14, 10, "#3b3f47", "", 3) + vR(288, 120, 15, 10, "#3b3f47", "", 3) + vP("M101 132h-9", "", "#6b7480", 4) +
        [136, 262].map((x) => vC(x, 132, 19, "#23262c") + '<circle cx="' + x + '" cy="132" r="11.5" fill="url(#caRim)" stroke="#7d8a98" stroke-width="1"/>' + vP([0, 72, 144, 216, 288].map((a) => { const r = a * Math.PI / 180; return "M" + x + " 132L" + (x + 10 * Math.cos(r)).toFixed(1) + " " + (132 + 10 * Math.sin(r)).toFixed(1); }).join(""), "", "#7d8a98", 2.4) + vC(x, 132, 3, "#4a4f5a")).join("") +
        // FRONT VIEW
        vR(128, 282, 24, 21, "#23262c", "", 4) + vR(248, 282, 24, 21, "#23262c", "", 4) +
        '<path d="M120 286V262Q120 250 132 246L152 240L164 208Q168 198 180 198H220Q232 198 236 208L248 240L268 246Q280 250 280 262V286Z" fill="url(#caBody)" stroke="#8f2a22" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<path d="M170 206Q172 203 180 203H220Q228 203 230 206L242 236H158Z" fill="url(#caGlass)" stroke="#7a2a20" stroke-width="1.2"/>' + vP("M176 230l18-22M204 222l10-14", "", "#fff", 2) +
        vP("M168 234l26-8M206 234l26-8", "", "#2b2b2b", 2.2) + vP("M152 240Q200 236 248 240", "", "#8f2a22", 1.2) + vP("M188 244q12 3 24 0", "", "#f8a092", 1.4) +
        '<path d="M120 236h12l2 10h-14z" fill="#2b2b2b"/><path d="M280 236h-12l-2 10h14z" fill="#2b2b2b"/>' +
        '<path d="M128 252q14-4 28 0v8q-14 4-28 0z" fill="#fff6c4" stroke="#c9a227" stroke-width="1"/><path d="M244 252q14-4 28 0v8q-14 4-28 0z" fill="#fff6c4" stroke="#c9a227" stroke-width="1"/>' + vC(142, 256, 3.4, "#fff") + vC(258, 256, 3.4, "#fff") +
        vR(122, 254, 6, 6, "#f59a2c", "", 1.5) + vR(272, 254, 6, 6, "#f59a2c", "", 1.5) +
        vR(170, 250, 60, 16, "#2d3038", "#1a1d22", 5, 1.2) + vP("M174 255h52M174 260h52", "", "#6b7480", 1.2) + vC(200, 258, 3.4, "#c9d2dc") +
        vR(122, 268, 156, 18, "#c9d0d8", "#7d8a98", 6, 1.2) + vR(181, 271, 38, 12, "#fff", "#6b7480", 2, 1.2) + vR(181, 271, 6, 12, "#2f5fd0", "", 1) + vP("M190 277h26", "", "#3b3f47", 2) + vR(134, 274, 12, 5, "#eef2f6", "#9aa5b1", 2, .8) + vR(254, 274, 12, 5, "#eef2f6", "#9aa5b1", 2, .8),
      items: [["el maletero", "boot", 114, 95, "l", 0, "la cajuela"], ["la luz trasera", "rear light", 103, 103, "l"], ["el tapón de gasolina", "fuel cap", 122, 104, "l", 0, "la tapa de gasolina"], ["el tubo de escape", "exhaust pipe", 94, 132, "l", 0, "el escape"], ["la ventanilla", "side window", 168, 76, "l"], ["la puerta", "door", 160, 116, "l"], ["la rueda", "wheel", 136, 140, "l"],
        ["el capó", "bonnet", 200, 243, "l", 0, "el cofre"], ["la rejilla", "grille", 186, 258, "l", 0, "la parrilla"], ["la matrícula", "number plate", 204, 277, "l", 0, "la placa"], ["el parachoques", "bumper", 140, 280, "l", 0, "la defensa"],
        ["el techo", "roof", 200, 59, "r"], ["la manija", "door handle", 232, 100, "r"], ["el retrovisor", "wing mirror", 276, 240, "r", 0, "el espejo lateral"], ["el parabrisas", "windscreen", 214, 216, "r"], ["el limpiaparabrisas", "wiper", 220, 230, "r"], ["el intermitente", "indicator", 275, 257, "r", 0, "la direccional"], ["el faro", "headlight", 258, 256, "r"], ["el neumático", "tyre", 262, 296, "r", 0, "la llanta"]] },
    { id: "ropa", grp: "clothes", es: "La ropa", en: "Clothes", lvl: "a1", kind: "grid",
      // v278: redrawn — real cuts (collars, cuffs, ribbing, seams, pockets, stitching), pairs drawn as pairs
      items: [["la camisa", "shirt", vP("M30 13L18 18Q12 20 11 27L8 58h10l4-23v37h36V35l4 23h10l-3-31q-1-7-7-9L50 13Z", "#dbe9fa", "#4f7cac", 1.8) + vP("M8.7 52h9.6M61.7 52h9.6", "", "#4f7cac", 1.4) + vP("M40 22v50", "", "#4f7cac", 1.3) +
          [30, 40, 50, 60].map((y) => vC(42.6, y, 1.4, "#4f7cac")).join("") + vR(47, 30, 8, 9, "none", "#4f7cac", 1, 1.2) + vP("M30 13l10 9-5 8-7-14z", "#f4f9ff", "#4f7cac", 1.6) + vP("M50 13l-10 9 5 8 7-14z", "#f4f9ff", "#4f7cac", 1.6)],
        ["la camiseta", "T-shirt", vP("M30 14Q40 22 50 14L63 19Q66 20 68 23L74 34L63 40L58 34V70Q40 73 22 70V34L17 40L6 34L12 23Q14 20 17 19Z", "#ff8a6b", "#c4502f", 1.8) + vP("M30 14Q40 23 50 14", "", "#c4502f", 3) + vP("M8 31l10 5.4M72 31l-10 5.4M22 66q18 3 36 0", "", "#c4502f", 1.3) + vP("M28 40q4 12 1 24M52 40q-4 12-1 24", "", "#e07052", 1.2)],
        ["el jersey", "jumper", vP("M30 13Q40 20 50 13L62 17Q68 19 69 27L72 60H62L58 34V62H22V34L18 60H8L11 27Q12 19 18 17Z", "#7fb37a", "#3e7a3b", 1.8) + vR(22, 62, 36, 8, "#6aa365", "#3e7a3b", 2, 1.6) + vR(7.5, 60, 11, 7, "#6aa365", "#3e7a3b", 2, 1.4) + vR(61.5, 60, 11, 7, "#6aa365", "#3e7a3b", 2, 1.4) +
          vP("M26 64v4M30 64v4M34 64v4M38 64v4M42 64v4M46 64v4M50 64v4M54 64v4", "", "#3e7a3b", 1) + vP("M30 13Q40 21 50 13", "", "#3e7a3b", 3.4) + vP("M34 26l3 4-3 4 3 4-3 4 3 4-3 4 3 4M46 26l-3 4 3 4-3 4 3 4-3 4 3 4-3 4", "", "#b5dfb0", 1.4), "el suéter"],
        ["la chaqueta", "jacket", vP("M29 12L18 17Q12 19 11 26L8 60h10l4-24v34h36V36l4 24h10l-3-34q-1-7-7-9L51 12L40 18Z", "#a0714a", "#6b4430", 1.8) + vP("M29 12L40 18L36 30L26 20Z", "#8a5f3c", "#6b4430", 1.4) + vP("M51 12L40 18L44 30L54 20Z", "#8a5f3c", "#6b4430", 1.4) +
          vP("M40 18V70", "", "#4a2f20", 1.6) + vR(38.4, 34, 3.2, 6, "#e3e3e3", "#888888", 1, .8) + vP("M26 50l8-2M54 50l-8-2", "", "#6b4430", 2) + vP("M8.7 55h9.6M61.7 55h9.6M22 66h36", "", "#6b4430", 1.4)],
        ["el abrigo", "coat", vP("M29 9L18 14Q12 16 11 23L8 60h9l4-26v42h38V34l4 26h9l-3-37q-1-7-7-9L51 9L40 16Z", "#4a5568", "#2d3748", 1.8) + vP("M29 9L40 16L33 34L25 18Z", "#5d6a80", "#2d3748", 1.4) + vP("M51 9L40 16L47 34L55 18Z", "#5d6a80", "#2d3748", 1.4) +
          vP("M40 16V76", "", "#2d3748", 1.2) + vR(21, 46, 38, 5, "#3a4354", "#2d3748", 1, 1) + vR(37, 44.6, 6, 7.8, "none", "#d1b97f", 1, 1.4) + [35, 45].map((x) => vC(x, 40, 1.8, "#e2e8f0") + vC(x, 58, 1.8, "#e2e8f0") + vC(x, 67, 1.8, "#e2e8f0")).join("") + vP("M8.8 54h8.6M62.6 54h8.6", "", "#2d3748", 1.4)],
        ["el vestido", "dress", vP("M30 38h20l16 32q-26 6-52 0z", "#e45b8f", "#a8325f", 1.8) + vP("M32 9h2.4l5.6 9 5.6-9H48l2 13q-1.6 8 0 14H30q1.6-6 0-14z", "#e45b8f", "#a8325f", 1.8) + vR(29, 34, 22, 4.4, "#c23f75", "#a8325f", 1, 1) +
          vP("M34 40l-8 30M40 40v32M46 40l8 30", "", "#c23f75", 1.2) + vC(40, 36.2, 2, "#ffd1e3") + [[24, 56], [52, 50], [44, 62], [32, 48], [58, 64], [20, 66]].map(([x, y]) => vC(x, y, 1.4, "#ffd1e3")).join("")],
        ["la falda", "skirt", vP("M24 23h32l13 43q-29 7-58 0z", "#9b6bff", "#5a35b8", 1.8) + vR(23, 16, 34, 7, "#7a4fe0", "#5a35b8", 2, 1.6) + vP("M32 24l-7 44M40 24v46M48 24l7 44", "", "#7a4fe0", 1.4) + vR(37, 17, 6, 5, "#ece6ff", "#5a35b8", 1, .8)],
        ["los pantalones", "trousers", vP("M24 9h32l4 63H46L40 30l-6 42H20z", "#2f3a56", "#1d253a", 1.8) + vR(24, 9, 32, 6, "#27304a", "#1d253a", 1, 1.4) + vP("M30 9v6M50 9v6M40 15v14", "", "#1d253a", 1.4) + vP("M26 15q2 8 9 8M54 15q-2 8-9 8", "", "#55658c", 1.4) + vP("M30 30l-4 40M50 30l4 40", "", "#55658c", 1) + vR(37.6, 10.4, 4.8, 3.2, "#d1b97f", "", .6)],
        ["los vaqueros", "jeans", vP("M24 9h32l4 63H46L40 30l-6 42H20z", "#5b8fd1", "#2f5fa0", 1.8) + vR(24, 9, 32, 6, "#4f80c2", "#2f5fa0", 1, 1.4) + vR(20, 65, 14, 7, "#7aa8e0", "#2f5fa0", 1, 1.2) + vR(46, 65, 14, 7, "#7aa8e0", "#2f5fa0", 1, 1.2) +
          '<path d="M26 15q2 8 9 8M54 15q-2 8-9 8M40 15v14M30 9v6M50 9v6" fill="none" stroke="#f2a93b" stroke-width="1.1" stroke-dasharray="2 1.6"/>' + vC(35, 22.6, 1.2, "#e8c26a") + vC(45, 22.6, 1.2, "#e8c26a") + vC(40, 12, 1.6, "#e8c26a"), "los jeans"],
        ["los pantalones cortos", "shorts", vP("M20 18h40l4 38H46l-6-17-6 17H16z", "#f2c94c", "#b8901e", 1.8) + vR(20, 18, 40, 6, "#e6b93a", "#b8901e", 1, 1.4) + vP("M38 24l-2.6 9M42 24l2.6 9", "", "#fff", 1.4) + vP("M17 51h17M46 51h17", "", "#b8901e", 1.2) + vP("M24 24q2 7 8 8M56 24q-2 7-8 8", "", "#b8901e", 1.2), "el short"],
        ["los calcetines", "socks", [36, 12].map((x) => vP("M" + x + " 10h14v28q0 3 2.6 5.6l9.4 9.4q4.6 4.6 0 9.2t-9.2 0L" + (x + 2.4) + " 52q-2.4-2.4-2.4-6z", "#fbfbfd", "#c9cfd6", 1.6) + vR(x, 10, 14, 8, "#e05a47", "#a8392b", 1.5, 1) +
          vP("M" + x + " 21h14M" + x + " 25h14", "", "#e05a47", 1.8) + vP("M" + (x + 25) + " 50.6q6 4.4 3 11", "", "#e05a47", 3.4) + vP("M" + (x + .6) + " 44q2 6 6 8", "", "#e05a47", 3)).join(""), "las medias"],
        ["los zapatos", "shoes", [[8, -14], [0, 0]].map(([dx, dy]) => vMv(dx, dy, vP("M8 58V49q0-4 4-6l5-11q2-4 6-3l9 3q6 6 15 8l14 3q9 2 9 10v5z", dy ? "#5b3a29" : "#7a4f33", "#3a2a1d", 1.6) + vR(8, 57, 62, 5, "#2b1d14", "", 2) + vR(8, 54, 12, 8, "#2b1d14", "", 2) +
          vP("M28 34l6 4M31 32l6 4M34 30.6l5.4 3.6", "", "#e9dcc8", 1.3) + '<path d="M50 46q9 1 13 5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".45"/>')).join("")],
        ["las zapatillas de deporte", "trainers", vP("M8 54q0-8 6-10l7-12q2-4 6-3l8 4q8 6 18 7l12 2q9 2 9 10v2z", "#fbfbfd", "#9aa7b4", 1.6) + vP("M7 54h64q1 0 1 2v3q0 3-3 3H11q-4 0-4-4z", "#e9eef3", "#9aa7b4", 1.4) + vP("M8 58.6h62", "", "#4f8cff", 1.8) +
          vP("M20 49q16 2 32-9q-6 11-30 13z", "#4f8cff", "#2f5fd0", 1) + vP("M28 35l5 4M31 33l5 4M34 31.4l5 3.6", "", "#7d8a98", 1.4) + vP("M14 45l-3.4-6", "", "#4f8cff", 3.4) + vP("M60 44q5 1 8 4", "", "#cfd6e0", 2), "los tenis"],
        ["las botas", "boots", [[12, -6], [0, 0]].map(([dx, dy]) => vMv(dx, dy, vP("M14 10h18v38q4 2 14 4l12 3q8 2 8 9v4H14z", dy ? "#6f4630" : "#8a5a3c", "#5b3a29", 1.8) + vR(14, 66, 52, 5, "#3a2a1d", "", 2) + vR(14, 62, 13, 9, "#3a2a1d", "", 1.5) +
          vP("M24 13q-1 18 8 32", "", "#5b3a29", 1.3) + vP("M26 10l3-5h5l-1.4 5", "#6b4430", "#5b3a29", 1.2) + vP("M18 14v40", "", "#b98760", 1.8))).join("")],
        ["el pijama", "pyjamas", vP("M24 44h32l3 30H46l-6-20-6 20H21z", "#bfe0f5", "#4f7cac", 1.6) + vP("M30 8L19 12Q14 14 13 20L10 42h9l3-17v23h36V25l3 17h9l-3-22q-1-6-6-8L50 8L40 14Z", "#cfe8f8", "#4f7cac", 1.6) +
          vP("M40 14v34", "", "#4f7cac", 1.2) + vP("M30 8l10 6-4 6-7-10zM50 8l-10 6 4 6 7-10z", "#eaf5fd", "#4f7cac", 1.2) + vP("M10.6 38h8.6M60.8 38h8.6M22 46h36", "", "#4f7cac", 1.2) +
          [[28, 26], [50, 32], [34, 38], [52, 22], [30, 58], [50, 62], [27, 68]].map(([x, y]) => vC(x, y, 1.6, "#f2c94c")).join("")],
        ["el bañador", "swimsuit", vP("M27 10h5l8 16 8-16h5l-1 18q9 8 5 22l-8 18H31l-8-18q-4-14 5-22z", "#2bb3a3", "#0f7f86", 1.8) + vP("M25.4 45q14.6 7 29.2 0", "", "#ffd166", 3.6) + vP("M31 68q9-8 18 0", "", "#0f7f86", 1.4) + vP("M30 30q2 10 0 16", "", "#7fd9cf", 1.6), "el traje de baño"]] },

    { id: "accesorios", grp: "clothes", es: "Los accesorios", en: "Accessories", lvl: "a2", kind: "grid",
      // v278: redrawn — panels and buttons on the cap, a banded hat, glasses with temples, a striped knitted scarf, pairs of gloves
      // and earrings, a coiled belt with holes, a watch with hands, bags with straps and clasps, a gem ring, a striped tie
      items: [["la gorra", "cap", vP("M14 48q0-30 26-30q22 0 26 24l2 6z", "#e05a47", "#a8392b", 1.8) + vP("M60 46q12 0 16 4q-2 4-16 4H56z", "#c4473a", "#a8392b", 1.6) + vP("M40 18q-6 14-4 30M40 18q10 12 16 28", "", "#a8392b", 1.2) +
          vE(40, 18.4, 4, 2, "#a8392b") + vP("M14 48h52", "", "#a8392b", 2) + vC(30, 30, 1.2, "#7a2a20") + vC(50, 30, 1.2, "#7a2a20")],
        ["el sombrero", "hat", vE(40, 52, 34, 9, "#d9b26f", "#a07c3c", 1.6) + vP("M22 50q-2-18 6-26q6-4 12-1q6-3 12 1q8 8 6 26q-18 5-36 0z", "#e6c588", "#a07c3c", 1.6) + vP("M22.6 43q17.4 5 34.8 0v6q-17.4 5-34.8 0z", "#5b4430") + vP("M40 24v8", "", "#a07c3c", 1.4) + vP("M10 50q30 8 60 0", "", "#f3dca8", 1.4)],
        ["las gafas", "glasses", vP("M10 38l-6-8M70 38l6-8", "", "#1d253a", 2.6) + vR(10, 32, 26, 20, "#e9f5ff", "#1d253a", 8, 3) + vR(44, 32, 26, 20, "#e9f5ff", "#1d253a", 8, 3) + vP("M36 38q4-4 8 0", "", "#1d253a", 3) + vP("M15 37.4l6-3M49 37.4l6-3", "", "#fff", 2), "los lentes"],
        ["las gafas de sol", "sunglasses", vP("M10 33l-6-6M70 33l6-6", "", "#c9a227", 2) + vP("M10 32h26q2 0 1 4q-2 14-13 14T9 36q-1-4 1-4z", "#2d3748", "#111111", 1.8) + vP("M44 32h26q2 0 1 4q-2 14-13 14T43 36q-1-4 1-4z", "#2d3748", "#111111", 1.8) +
          vP("M37 33q3-3 6 0M36 31h8", "", "#c9a227", 1.6) + vP("M14 37q4-2 8-1M48 37q4-2 8-1", "", "#8aa0c0", 2), "los lentes de sol"],
        ["la bufanda", "scarf", vP("M30 28l-6 38h12l4-36z", "#e45b8f", "#a8325f", 1.6) + vP("M42 30l2 38h12l-4-38z", "#d9447c", "#a8325f", 1.6) + vP("M18 22q22-14 44 0q4 6-2 10q-20-10-40 0q-6-4-2-10z", "#e45b8f", "#a8325f", 1.6) +
          vP("M25.4 56h11.6M24.6 61h11.6M44.6 56h11.4M44.8 61h11.6M24 20q16-8 32 0", "", "#fff", 2.2) + vP("M25 66v6M28 66v6M31 66v6M34 66v6M45 68v6M48 68v6M51 68v6M54 68v6", "", "#a8325f", 1.4)],
        ["los guantes", "gloves", [[1, "#5e9b59"], [0, "#7fb37a"]].map(([m, c]) => '<g' + (m ? ' transform="translate(82 2) scale(-1 1)"' : "") + ">" + vP("M14 66V40l-5-9q-1-4 3-5q3-1 5 3l4 7V16q0-4 4-4t4 4v14V12q0-4 4-4t4 4v18V15q0-4 4-4t4 4v16V22q0-4 4-4t4 4v24q0 10-6 14v8z", c, "#3e7a3b", 1.6) +
          vR(14, 60, 27, 10, "#4f8a4a", "#3e7a3b", 2, 1.2) + vP("M18 62v6M22 62v6M26 62v6M30 62v6M34 62v6M38 62v6", "", "#3e7a3b", .9) + "</g>").join("")],
        ["el cinturón", "belt", '<g transform="rotate(-14 40 40)">' + vR(4, 34, 72, 12, "#7a4a2a", "#4e2e1a", 3, 1.4) + '<path d="M6 36.6h68M6 43.4h68" fill="none" stroke="#c99a6a" stroke-width=".9" stroke-dasharray="2 1.6"/>' +
          vC(54, 40, 1.4, "#3a2214") + vC(61, 40, 1.4, "#3a2214") + vC(68, 40, 1.4, "#3a2214") + vR(32, 33, 4, 14, "#5e3820", "", 1) + vR(13, 30, 16, 20, "none", "#c9a227", 3, 3.6) + vP("M21 40h9", "", "#e0c25a", 2.2) + "</g>"],
        ["el reloj", "watch", vR(31, 4, 18, 24, "#3b3f47", "#23262c", 3, 1.2) + vR(31, 52, 18, 24, "#3b3f47", "#23262c", 3, 1.2) + vC(40, 66, 1.2, "#7d8a98") + vC(40, 71, 1.2, "#7d8a98") +
          vC(40, 40, 16, "#c9d2dc", "#7d8a98", 1.6) + vC(40, 40, 12.5, "#fdfdfd", "#d0d6dc", 1) + vP("M40 29v2.4M51 40h-2.4M40 51v-2.4M29 40h2.4", "", "#7d8a98", 1.4) + vP("M40 40V31.6M40 40l6.4 4", "", "#23262c", 1.8) + vP("M40 40l-5 6", "", "#e05a47", .9) + vC(40, 40, 1.4, "#23262c") + vR(56, 37.6, 3.4, 4.8, "#9aa5b1", "", 1)],
        ["el bolso", "handbag", vP("M28 30q0-17 12-17t12 17", "", "#a8392b", 3.4) + vP("M14 30h52l-4 38q0 4-4 4H22q-4 0-4-4z", "#e05a47", "#a8392b", 1.8) + vP("M14 30h52v8q-26 10-52 0z", "#c4473a", "#a8392b", 1.4) + vR(36, 38, 8, 6, "#f2c94c", "#c9a227", 1.5, 1) +
          '<path d="M20 50l2.6 16M60 50l-2.6 16" fill="none" stroke="#f3a194" stroke-width="1" stroke-dasharray="2 1.6"/>', "la cartera"],
        ["la mochila", "backpack", vP("M18 34h-4v26h4M62 34h4v26h-4", "", "#2f5fd0", 2.4) + vP("M33 18q0-8 7-8t7 8", "", "#2f5fd0", 3) + vR(18, 18, 44, 54, "#4f8cff", "#2f5fd0", 12, 1.8) + vR(24, 44, 32, 22, "#3f78e6", "#2f5fd0", 7, 1.4) +
          vP("M24 50h32M22 30q18-6 36 0", "", "#1d3f9a", 1.2) + vR(46, 48, 3, 6, "#f2c94c", "", 1) + vR(30, 26, 3, 6, "#f2c94c", "", 1) + vP("M24 36q16-3 32 0", "", "#7fb0ff", 1.4)],
        ["la cartera", "wallet", vR(22, 20, 36, 22, "#4f8cff", "#2f5fd0", 3, 1) + vP("M26 28h14", "", "#cfe0ff", 2) + vR(12, 30, 56, 36, "#6b4430", "#3a2a1d", 5, 1.8) + '<rect x="15.5" y="33.5" width="49" height="29" rx="3" fill="none" stroke="#c99a6a" stroke-width=".9" stroke-dasharray="2 1.6"/>' +
          vP("M68 40h-16q-4 0-4 4v4q0 4 4 4h16z", "#5b3a29", "#3a2a1d", 1.4) + vC(56, 46, 2.4, "#d4a72c"), "la billetera"],
        ["el collar", "necklace", vP("M14 14q4 34 26 39q22-5 26-39", "", "#c9a227", 2.2) + [[17, 26], [21, 35], [26, 42], [32, 48], [48, 48], [54, 42], [59, 35], [63, 26]].map(([x, y]) => vC(x, y, 2, "#f6f1e7", "#c9a227", .8)).join("") +
          vC(40, 54, 2.2, "none", "#c9a227", 1.4) + vP("M40 56l8 7-8 10-8-10z", "#e05a8a", "#a8325f", 1.4) + vP("M37 61l3-2", "", "#ffd1e3", 1.4)],
        ["los pendientes", "earrings", [26, 54].map((x) => vP("M" + x + " 19q-6 0-6-6t6-5", "", "#c9a227", 1.8) + vC(x, 22, 3, "none", "#c9a227", 1.6) + vP("M" + x + " 26q-9 14 0 28q9-14 0-28z", "#5bc0eb", "#2b8fbf", 1.4) + vP("M" + (x - 2.4) + " 36q-1 5 .6 9", "", "#e6f7fe", 1.6)).join(""), "los aretes"],
        ["el anillo", "ring", vE(40, 52, 18, 14, "none", "#a07c1e", 6.4) + vE(40, 52, 18, 14, "none", "#f2c94c", 3.4) + vP("M30 46q10-4 20 0", "", "#fff3c2", 1.4) + vP("M34 38l6-6 6 6", "", "#c9a227", 2) +
          vP("M30 28l5-7h10l5 7-10 12z", "#e6f6ff", "#7fb3d6", 1.4) + vP("M30 28h20M35 21l2 7 3 12M45 21l-2 7-3 12", "", "#9fcde8", .9)],
        ["la corbata", "tie", '<defs><clipPath id="vdTie"><path d="M36 20h8l8 40-12 12-12-12z"/></clipPath></defs>' + vP("M36 20h8l8 40-12 12-12-12z", "#e05a47", "#8f2a22", 1.6) +
          '<g clip-path="url(#vdTie)">' + vP("M30 32l22-10M28 44l26-12M26 56l28-13M26 68l28-13", "", "#f2c94c", 2.4) + "</g>" + vP("M34 9h12l-2 11h-8z", "#c4473a", "#8f2a22", 1.4) + vP("M28 10l6-1M52 10l-6-1", "", "#c9d2dc", 2.4)],
        ["el paraguas", "umbrella", vP("M8 40q2-26 32-28q30 2 32 28q-5-5-10.6-5T50.8 40q-4.4-5-10.8-5t-10.8 5q-5-5-10.6-5T8 40z", "#4f8cff", "#2f5fd0", 1.8) + vP("M40 12q-11 10-10.8 28q-7-11-21.2 0q4-20 32-28z", "#7fb0ff") +
          vP("M40 12q-8 10-10.8 28M40 12q8 10 10.8 28", "", "#2f5fd0", 1.2) + vP("M40 12V6", "", "#3b3f47", 2) + vP("M40 40v24q0 6-5 6t-5-6", "", "#3b3f47", 3), "la sombrilla"]] },
    { id: "frutas", grp: "food", es: "Las frutas", en: "Fruit", lvl: "a1", kind: "grid",
      // v278: redrawn — stems and leaves, seeds, cut faces, a highlight on each skin
      items: [["la manzana", "apple", vP("M40 24q-6-6-16-4q-12 4-12 20q0 22 16 30q6 3 12-1q6 4 12 1q16-8 16-30q0-16-12-20q-10-2-16 4z", "#e5383b", "#a5262a", 1.4) + vP("M40 25q0-9 4-13", "", "#6b4430", 2.4) + vLeaf(44, 16, -25, 16) + vHi(25, 36, 3.6, 7, 20)],
        ["el plátano", "banana", vP("M18 24q10 28 36 30q10 0 16-6q-4 0-8 1q-26 2-38-26z", "#ffe066", "#c9a227", 1.2) + vP("M12 28q4 30 32 36q16 2 26-8q-4 0-10 2q-22 4-36-28z", "#f5d142", "#c9a227", 1.4) + vP("M12 28l-1-7h6l1 5z", "#6b5a2a") + vC(69.6, 56.4, 1.6, "#6b5a2a") + vP("M20 34q8 20 26 26", "", "#fff3a8", 1.6), "la banana"],
        ["la naranja", "orange", vC(40, 45, 24, "#f59a2c", "#c46d12", 1.4) + [[30, 36], [48, 32], [54, 50], [36, 58], [26, 48], [44, 46]].map(([x, y]) => vC(x, y, .9, "#d9781a")).join("") + vP("M40 21v-4", "", "#6b4430", 2) + vLeaf(41, 18, -20, 16) + vHi(30, 34, 5, 7, 30)],
        ["el limón", "lemon", vP("M10 44q4-18 30-18t30 18q-4 18-30 18T10 44z", "#f7e04a", "#c9b01e", 1.4) + vP("M10 44l-4-1.4v2.8zM70 44l4-1.4v2.8z", "#e3c62a", "#c9b01e", 1) + vLeaf(48, 27, -30, 16) + vHi(28, 37, 8, 3.4, -8) + [[24, 46], [36, 52], [50, 48], [58, 40]].map(([x, y]) => vC(x, y, .8, "#d9bf1e")).join("")],
        ["la fresa", "strawberry", vP("M18 30q22-10 44 0q2 22-22 40q-24-18-22-40z", "#e5383b", "#a5262a", 1.4) + [[28, 36], [40, 34], [52, 36], [24, 46], [34, 44], [46, 44], [56, 46], [30, 54], [42, 54], [52, 54], [36, 62], [44, 62]].map(([x, y]) => vE(x, y, 1, 1.6, "#f7e04a")).join("") +
          vP("M22 29l6-9 5 6 7-9 7 9 5-6 6 9q-18 7-36 0z", "#5fae4f", "#3e7a3b", 1) + vP("M40 18v-7", "", "#3e7a3b", 2.4) + vHi(26, 38, 3, 6, 25)],
        ["las uvas", "grapes", vP("M40 16q0-6 6-8", "", "#6b4430", 2.4) + vLeaf(42, 14, -10, 18) + [[32, 24], [46, 24], [25, 35], [39, 35], [53, 35], [32, 46], [46, 46], [39, 57], [39, 68]].map(([x, y]) => vC(x, y, 7.4, "#8e5cc8", "#5e3a94", 1.1) + vHi(x - 2.4, y - 3, 1.8, 2.6, 30)).join("")],
        ["la sandía", "watermelon", vP("M8 30h64q0 32-32 32T8 30z", "#5fae4f", "#2e7d32", 1.4) + vP("M11 30h58q0 28-29 28T11 30z", "#eef7df") + vP("M15 30h50q0 24-25 24T15 30z", "#ef5b5b") + vP("M8 30h64", "", "#e04848", 1.4) +
          [[26, 38], [36, 44], [44, 44], [54, 38], [40, 36], [30, 47], [50, 47]].map(([x, y]) => vE(x, y, 1.3, 2.2, "#2b2b2b")).join("") + vP("M14 44q4 8 10 12M66 44q-4 8-10 12", "", "#2e7d32", 1.2)],
        ["el melón", "melon", vE(40, 46, 28, 22, "#d7e6a0", "#8aa64a", 1.4) + vP("M40 24q-14 22 0 44M40 24q14 22 0 44M26 28q-10 18 0 36M54 28q10 18 0 36M14 40q26-8 52 0M14 52q26 8 52 0", "", "#a8bd6a", 1) + vP("M40 24v-5", "", "#6b4430", 2.4) + vHi(28, 36, 6, 9, 30)],
        ["la piña", "pineapple", vP("M40 34l-10-20 8 8 2-14 4 14 8-8-8 20zM40 34l-16-8 10 2M40 34l16-8-10 2", "#5fae4f", "#3e7a3b", 1.2) + vE(40, 52, 16, 20, "#f2b53c", "#b8861e", 1.4) +
          vP("M26 42l28 22M26 54l20 16M30 34l26 20M54 42L26 64M54 54L34 70M50 34L24 54", "", "#c48a1e", 1.1) + [[34, 44], [46, 44], [40, 52], [32, 58], [48, 58], [40, 64]].map(([x, y]) => vC(x, y, 1, "#7a5a1e")).join("")],
        ["el mango", "mango", vP("M20 50q-4-24 20-30q24-4 28 14q4 20-22 28q-22 4-26-12z", "#f5b335", "#c47d12", 1.4) + vP("M48 22q18 4 20 14q2 12-10 20q8-16-10-34z", "#e5583b") + vP("M44 21q2-6 6-8", "", "#6b4430", 2.4) + vLeaf(50, 13, -15, 16) + vHi(30, 34, 4, 8, 40)],
        ["la pera", "pear", vP("M40 18q6 0 7 10q1 8 8 16q8 10 2 20q-6 8-17 8t-17-8q-6-10 2-20q7-8 8-16q1-10 7-10z", "#b5d24f", "#7a9a2a", 1.4) + vP("M40 19q0-8 3-11", "", "#6b4430", 2.4) + vLeaf(42, 11, -20, 14) + vHi(32, 48, 4, 8, 15) + [[46, 50], [50, 60], [38, 64], [44, 40]].map(([x, y]) => vC(x, y, .8, "#8aa83a")).join("")],
        ["el melocotón", "peach", vC(40, 46, 22, "#ffae7a", "#d9744a", 1.4) + vP("M40 46m-22 0a22 22 0 0 0 22 22q-12-10-2-36q-10-6-20 14z", "#f07a5a") + vP("M42 24q-8 20 0 44", "", "#d9744a", 1.2) + vP("M41 24q0-6 3-9", "", "#6b4430", 2.2) + vLeaf(44, 16, -20, 16) + vHi(50, 36, 4, 7, -20), "el durazno"],
        ["la cereza", "cherries", vP("M28 48q4-22 18-34M52 50q-2-20-6-36", "", "#5b7a2a", 2) + vLeaf(46, 14, -40, 16) + vC(28, 56, 11, "#c81e3a", "#8f1428", 1.3) + vC(52, 58, 11, "#c81e3a", "#8f1428", 1.3) + vHi(24, 52, 2.4, 4, 30) + vHi(48, 54, 2.4, 4, 30)],
        ["el kiwi", "kiwi", vE(52, 38, 18, 22, "#8a6a3a", "#5e4524", 1.4) + vP("M42 24l2 3M50 20l1 3M60 26l-1 3M62 40l-2 2M56 52l-1 3", "", "#b0905a", 1) + vC(32, 46, 21, "#8a6a3a", "#5e4524", 1.4) + vC(32, 46, 18, "#8bc34a") + vC(32, 46, 11, "#b5dc6a") + vC(32, 46, 5.4, "#f4f6d8") +
          [...Array(14)].map((_, k) => { const a = k * Math.PI / 7; return vE((32 + 8.4 * Math.cos(a)).toFixed(1), (46 + 8.4 * Math.sin(a)).toFixed(1), 1, 1.8, "#2b2b2b"); }).join("")],
        ["el coco", "coconut", vC(54, 38, 19, "#7a5230", "#4e3420", 1.4) + vP("M44 24q4 10 2 24M54 20q4 14 0 32M62 24q2 12-4 26", "", "#a07850", 1.1) + vC(50, 32, 1.6, "#3a2414") + vC(56, 30, 1.6, "#3a2414") + vC(53, 36, 1.6, "#3a2414") +
          vP("M8 50q0 22 22 22t22-22z", "#7a5230", "#4e3420", 1.4) + vE(30, 50, 22, 7, "#fbf8f0", "#4e3420", 1.4) + vE(30, 50, 16, 4.4, "#e9eef0") + vP("M12 58q4 6 8 8M20 62q4 4 8 5", "", "#a07850", 1)],
        ["la papaya", "papaya", vE(40, 44, 32, 19, "#7fbf5a", "#4f8a3a", 1.4) + vE(40, 44, 29, 16, "#f5a623") + vE(40, 44, 25, 13, "#ff8a4a") + vE(42, 44, 14, 6.4, "#f9c38a") +
          [[32, 44], [36, 41], [36, 47], [41, 44], [45, 41], [45, 47], [50, 44], [40, 40], [40, 48]].map(([x, y]) => vC(x, y, 1.6, "#2b2b2b")).join("") + vHi(22, 38, 6, 2.4, -20)]] },

    { id: "verduras", grp: "food", es: "Las verduras", en: "Vegetables", lvl: "a1", kind: "grid",
      // v278: redrawn — calyx and stems, papery skins and roots, florets, kernels, open pods, a cut avocado
      items: [["el tomate", "tomato", vP("M40 26q-22 0-26 18q-2 20 26 22q28-2 26-22q-4-18-26-18z", "#e5383b", "#a5262a", 1.4) + vP("M30 30q-6 8-4 18M50 30q6 8 4 18", "", "#c4262a", 1) + vP("M40 23l-10 4 6 2-8 6 10-2 2 8 2-8 10 2-8-6 6-2z", "#5fae4f", "#3e7a3b", 1) + vP("M40 25v-8", "", "#3e7a3b", 2.4) + vHi(26, 38, 3.4, 6, 30)],
        ["la zanahoria", "carrot", vP("M56 18q4-12 10-14M60 22q10-6 16-4M58 20q8-10 6-18M54 20q-2-10-8-14", "", "#4f9a4a", 2.6) + vP("M58 16q8 6 2 14L22 70q-4 2-4-2L48 18q4-6 10-2z", "#f5841f", "#c45a12", 1.4) + vP("M48 30l6 3M40 40l6 3M34 50l5 2.6M28 59l4 2", "", "#c45a12", 1.2) + vP("M48 22L26 62", "", "#ffb065", 1.6)],
        ["la patata", "potato", vP("M14 44q0-18 22-20q22-4 30 10q8 16-8 24q-14 8-30 4q-14-4-14-18z", "#d8b06a", "#a07c3c", 1.4) + vP("M28 36q2 2 0 4M46 32q2 2 0 4M56 46q2 2 0 4M30 54q2 2 0 4", "", "#8a6a30", 1.4) + [[38, 44], [22, 46], [48, 54], [60, 38]].map(([x, y]) => vC(x, y, .9, "#b08a48")).join("") + vHi(26, 34, 6, 3, -15), "la papa"],
        ["la cebolla", "onion", vP("M40 14q2 10 14 18q14 10 10 24q-4 14-24 14t-24-14q-4-14 10-24q12-8 14-18z", "#c9874a", "#8a5428", 1.4) + vP("M40 18q-14 20-12 50M40 18q14 20 12 50M40 18v52M40 18q-22 20-20 44M40 18q22 20 20 44", "", "#a86a34", 1) + vP("M40 14v-6M38 14l-3-6M42 14l3-6", "", "#7fbf5a", 1.8) + vP("M34 70l-2 4M38 70v5M42 70v5M46 70l2 4", "", "#a07c5a", 1.2) + vHi(28, 40, 3, 8, 15)],
        ["el ajo", "garlic", vP("M40 14q2 10 12 18q12 10 8 24q-4 12-20 12t-20-12q-4-14 8-24q10-8 12-18z", "#f6efe6", "#b8a99a", 1.4) + vP("M40 20q-12 18-10 46M40 20q12 18 10 46M40 20v48M40 20q-20 18-18 40M40 20q20 18 18 40", "", "#d8ccc0", 1.1) + vP("M44 40q4 12 2 24", "", "#c9a3c9", 2) + vP("M40 14v-6", "", "#c9bba8", 2.4) + vP("M32 68l-2 5M36 68v6M40 68v6M44 68v6M48 68l2 5", "", "#b8a99a", 1.2)],
        ["la lechuga", "lettuce", '<path d="' + vBumpy(40, 44, 27, 16, 3.4) + '" fill="#6fbe50" stroke="#3e8a3a" stroke-width="1.2" stroke-linejoin="round"/>' + '<path d="' + vBumpy(40, 46, 19, 12, 3) + '" fill="#8fd26a" stroke="#4f9a3a" stroke-width="1"/>' + vC(40, 48, 10, "#c5e8a0", "#7fbf5a", 1) +
          vP("M40 48L20 30M40 48L60 30M40 48L16 50M40 48L64 50M40 48L28 68M40 48L52 68", "", "#b8e294", 1)],
        ["el pepino", "cucumber", '<g transform="rotate(-30 40 40)">' + vR(6, 30, 68, 20, "#3f8f3a", "#2a6a28", 10, 1.4) + vP("M12 36h56M10 42h60", "", "#6fbe50", 1.4) + [[18, 34], [30, 46], [42, 34], [54, 46], [62, 36], [24, 40], [48, 40]].map(([x, y]) => vC(x, y, 1, "#d6ecb0")).join("") + vR(2, 37, 6, 6, "#7a9a4a", "", 2) + "</g>"],
        ["el pimiento", "pepper", vP("M40 22q-6-4-14 0q-12 6-10 24q2 20 14 24q6 2 10-2q4 4 10 2q12-4 14-24q2-18-10-24q-8-4-14 0z", "#e5383b", "#a5262a", 1.4) + vP("M40 24q-4 24 0 44M28 26q-8 20 2 42M52 26q8 20-2 42", "", "#c4262a", 1.1) +
          vP("M32 22q8-6 16 0q-8 4-16 0z", "#5fae4f", "#3e7a3b", 1) + vP("M40 22q0-8 6-11", "", "#3e7a3b", 3.4) + vHi(26, 40, 3, 9, 10), "el pimentón"],
        ["el brócoli", "broccoli", vP("M34 72l2-26h8l2 26z", "#9ccc65", "#6b9a3a", 1.2) + vP("M38 50l-10-10M42 50l10-10", "", "#9ccc65", 4) + [[24, 34, 11], [40, 26, 13], [56, 34, 11], [32, 42, 10], [48, 42, 10]].map(([x, y, r]) => '<path d="' + vBumpy(x, y, r, 9, 1.6) + '" fill="#4f9a4a" stroke="#2e6e2e" stroke-width="1"/>').join("") +
          [[22, 32], [28, 36], [38, 22], [44, 28], [36, 30], [54, 32], [58, 38], [30, 44], [48, 44], [46, 22]].map(([x, y]) => vC(x, y, 1.4, "#2e6e2e")).join("")],
        ["el maíz", "corn", vE(40, 40, 12, 28, "#f7d74a", "#c9a227", 1.4) + vP("M30 22h20M28 30h24M28 38h24M28 46h24M29 54h22M32 62h16M36 14v52M44 14v52M32 18v44M48 18v44", "", "#e0b528", 1) +
          vP("M30 72q-14-22 0-44q4 22 10 44z", "#7fbf5a", "#4f8a3a", 1.2) + vP("M50 72q14-22 0-44q-4 22-10 44z", "#6fb04a", "#4f8a3a", 1.2) + vP("M40 12q-2-6 2-8M42 12q2-5 6-6", "", "#c9a56a", 1.2)],
        ["la berenjena", "aubergine", vP("M58 18q10 8 4 22q-6 18-24 26q-18 6-24-6q-4-12 12-20q14-8 20-18q4-8 12-4z", "#6a3d8f", "#45235f", 1.4) + vP("M50 14q8-4 14 2q2 8-4 10q-4-8-10-12z", "#5fae4f", "#3e7a3b", 1) + vP("M60 14l4-8", "", "#3e7a3b", 3) + vHi(26, 52, 4, 9, 50)],
        ["el calabacín", "courgette", '<g transform="rotate(-25 40 40)">' + vR(8, 30, 62, 18, "#5c9c3a", "#3e7a2a", 9, 1.4) + vP("M14 35h52M14 39h54M14 43h52", "", "#8cc66a", 1) + vR(68, 35, 8, 8, "#c9b06a", "#8a7a3a", 2, 1) + vC(10, 39, 2.4, "#e8d27a") + "</g>", "la calabacita"],
        ["la calabaza", "pumpkin", vE(26, 48, 15, 20, "#e8781f", "#b5560f", 1.3) + vE(54, 48, 15, 20, "#e8781f", "#b5560f", 1.3) + vE(40, 48, 15, 22, "#f5891f", "#b5560f", 1.3) + vP("M40 27q-4-10 2-16", "", "#5b7a2a", 4) + vLeaf(42, 22, -10, 16) + vHi(36, 38, 2.6, 8, 0)],
        ["los guisantes", "peas", vP("M6 46q34-28 68-8q-34 30-68 8z", "#7fbf5a", "#4f8a3a", 1.4) + vP("M10 46q30-18 60-6q-30 18-60 6z", "#a8d97a") + [18, 28, 38, 48, 58].map((x, k) => vC(x, 45 - k * .6, 5.4, "#7fcf4a", "#4f8a3a", 1) + vHi(x - 1.6, 43 - k * .6, 1.4, 1.8, 0)).join("") + vP("M74 38l4-4", "", "#4f8a3a", 2), "las arvejas"],
        ["las judías verdes", "green beans", [[0, 0], [8, 10], [16, 20]].map(([dx, dy]) => vMv(dx, dy, vP("M8 18q20 32 50 42", "", "#3e7a3b", 7.4) + vP("M8 18q20 32 50 42", "", "#7fbf5a", 5) + vP("M10 20q18 28 44 38", "", "#b5e08a", 1.2))).join(""), "las habichuelas"],
        ["la seta", "mushroom", vP("M32 40q-2 20-4 28q12 4 24 0q-2-8-4-28z", "#f6efe6", "#b8a99a", 1.4) + vP("M10 42q0-28 30-28t30 28q-30 6-60 0z", "#c9874a", "#8a5428", 1.4) + vE(40, 42, 28, 3.4, "#f0dfc4") + vHi(28, 24, 8, 4, -20) + vP("M30 52q10 3 20 0", "", "#d8ccc0", 1), "el champiñón"],
        ["el aguacate", "avocado", vP("M40 8q12 0 14 16q2 10 8 20q8 18-8 26q-14 6-28 0q-16-8-8-26q6-10 8-20q2-16 14-16z", "#3f6b2a", "#2a4a1a", 1.4) + vP("M40 12q9 0 11 14q2 10 7 19q6 15-6 22q-12 5-24 0q-12-7-6-22q5-9 7-19q2-14 11-14z", "#d6e68a") +
          vP("M40 12q9 0 11 14q2 10 7 19q6 15-6 22q-12 5-24 0q-12-7-6-22q5-9 7-19q2-14 11-14z", "none", "#9ccc65", 3) + vC(40, 50, 10, "#8a5428", "#5e3418", 1.2) + vHi(37, 46, 2.6, 4, 20)]] },

    { id: "menaje", grp: "food", es: "El menaje de cocina", en: "Cookware & kitchen tools", lvl: "a2", kind: "grid",
      // v278: redrawn — brushed steel, non-stick insides, wooden handles, grater holes, a colander's holes, small appliances with detail
      items: [["la sartén", "frying pan", vP("M54 42l22-9", "", "#23262c", 5.4) + vC(72, 34.6, 1.4, "#9aa5b1") + vE(32, 46, 25, 16, "#3b3f47", "#23262c", 1.4) + vE(32, 45, 20, 12.4, "#5b6470") + vE(32, 45, 13, 7.4, "#4a525d") + vP("M18 40q6-5 14-5", "", "#8a94a0", 1.6)],
        ["la olla", "saucepan", vR(4, 38, 9, 5, "#3b3f47", "", 2) + vR(67, 38, 9, 5, "#3b3f47", "", 2) + vP("M12 34h56v26q0 8-8 8H20q-8 0-8-8z", "#c9d2dc", "#7d8a98", 1.4) + vP("M16 40v24", "", "#eef2f6", 2.4) +
          vP("M10 34q30-12 60 0z", "#b8c2cd", "#7d8a98", 1.4) + vE(40, 25, 5.4, 3, "#3b3f47") + vP("M38 25v-3h4v3", "", "#3b3f47", 2), "la olla"],
        ["el cazo", "small pan", vP("M48 40l26-7", "", "#23262c", 5) + vP("M10 36h40v20q0 8-8 8H18q-8 0-8-8z", "#c9d2dc", "#7d8a98", 1.4) + vE(30, 36, 20, 4.4, "#eef2f6", "#7d8a98", 1.2) + vE(30, 36, 16, 2.8, "#8a94a0") + vP("M10 35l-3-2", "", "#7d8a98", 2) + vP("M14 42v16", "", "#eef2f6", 2), "la cacerola"],
        ["la tapa", "lid", vP("M8 52q32-30 64 0z", "#c9d2dc", "#7d8a98", 1.4) + vE(40, 52, 32, 4.4, "#b8c2cd", "#7d8a98", 1.2) + vP("M34 30h12l-1-6h-10z", "#3b3f47", "#23262c", 1) + vR(30, 22, 20, 4, "#3b3f47", "", 2) + vP("M20 44q8-10 18-12", "", "#fff", 2) + vC(48, 40, 1.4, "#7d8a98")],
        ["la espátula", "spatula", vR(37, 42, 6, 32, "#a0714a", "#6b4430", 3, 1.2) + vC(40, 69, 1.4, "#3a2a1d") + vP("M38 30h4l1 12h-6z", "#9aa5b1", "#5d6670", 1) + vR(28, 6, 24, 26, "#3b3f47", "#23262c", 5, 1.4) + vP("M34 11v16M40 11v16M46 11v16", "", "#5b6470", 2.4)],
        ["el cucharón", "ladle", vP("M48 56q4-10 8-46", "", "#7d8a98", 3.6) + vP("M56 10q4-4 8 0", "", "#7d8a98", 3) + vP("M20 54q0 16 15 16t15-16z", "#c9d2dc", "#7d8a98", 1.4) + vE(35, 54, 15, 3.6, "#eef2f6", "#7d8a98", 1.2) + vP("M24 58q2 6 8 8", "", "#fff", 1.8)],
        ["la tabla de cortar", "chopping board", vR(8, 22, 58, 40, "#d8b06a", "#a07c3c", 8, 1.4) + vR(64, 36, 10, 12, "#d8b06a", "#a07c3c", 4, 1.4) + vC(69, 42, 2.4, "#a07c3c") + vP("M14 32q20-3 46 0M14 44q24 3 46 0M14 54q20-2 46 0", "", "#c49a52", 1) +
          vC(26, 40, 6, "#e5383b", "#a5262a", 1) + vC(26, 40, 3.4, "#f58a8a") + vC(38, 46, 5, "#f5841f", "#c45a12", 1) + vC(38, 46, 2.4, "#ffb065")],
        ["el cuchillo de cocina", "kitchen knife", vP("M6 50q22-18 48-16v12H8z", "#e9eef3", "#7d8a98", 1.4) + vP("M10 48q20-12 42-12", "", "#fff", 1.6) + vR(54, 33, 22, 12, "#2b2b2b", "#111111", 4, 1) + vC(60, 39, 1.4, "#c9d2dc") + vC(67, 39, 1.4, "#c9d2dc") + vR(52, 32, 3, 14, "#9aa5b1", "", 1)],
        ["el pelador", "peeler", vR(35, 40, 10, 32, "#e05a47", "#a8392b", 5, 1.2) + vR(38, 46, 4, 18, "#c4473a", "", 2) + vP("M40 42L28 18M40 42L52 18", "", "#7d8a98", 3.4) + vR(26, 12, 28, 7, "#c9d2dc", "#7d8a98", 2, 1.2) + vP("M30 15.4h20", "", "#5d6670", 1.2)],
        ["el rallador", "grater", vP("M30 20q0-10 10-10t10 10", "", "#3b3f47", 4) + vP("M56 20l6 50H56l-4-50z", "#a9b4bf", "#7d8a98", 1) + vP("M24 20h32l6 50H18z", "#c9d2dc", "#7d8a98", 1.4) +
          [28, 36, 44, 52, 60].map((y, r) => [-10, -4, 2, 8].map((dx) => vE(40 + dx * (1 + r * .08), y, 1.8, 1.1, "#5d6670")).join("")).join("") + vP("M24 22l-4 46", "", "#eef2f6", 1.6)],
        ["el colador", "colander", vR(4, 34, 10, 4, "#c4473a", "", 2) + vR(66, 34, 10, 4, "#c4473a", "", 2) + vP("M10 36h60q-2 26-30 30q-28-4-30-30z", "#e05a47", "#a8392b", 1.4) + vE(40, 36, 30, 5, "#f37a68", "#a8392b", 1.2) + vE(40, 36, 26, 3, "#c4473a") +
          [[24, 44], [32, 46], [40, 47], [48, 46], [56, 44], [28, 53], [36, 55], [44, 55], [52, 53], [34, 61], [46, 61]].map(([x, y]) => vC(x, y, 1.5, "#fff")).join("") + vP("M30 66h20", "", "#a8392b", 3)],
        ["las varillas", "whisk", vP("M40 46q-15-20 0-40q15 20 0 40M40 46q-8-20 0-40q8 20 0 40M40 46V6M40 46q-20-22 0-40q20 18 0 40", "", "#9aa5b1", 1.5) + vR(36, 44, 8, 30, "#3b3f47", "#23262c", 4, 1) + vR(35, 44, 10, 4, "#9aa5b1", "", 1.5) + vC(40, 70, 1.4, "#9aa5b1"), "el batidor"],
        ["el abrelatas", "can opener", vP("M34 36L18 72M44 38L42 74", "", "#a8392b", 7.4) + vP("M34 36L18 72M44 38L42 74", "", "#e05a47", 5) + vC(40, 28, 11, "#c9d2dc", "#7d8a98", 1.4) + vC(40, 28, 4, "#9aa5b1", "#5d6670", 1) +
          vP("M50 24h12", "", "#7d8a98", 4) + vR(60, 16, 9, 16, "#c9d2dc", "#7d8a98", 3, 1.2) + vP("M30 22l-4-2M30 34l-4 2M34 18l-2-4", "", "#7d8a98", 2)],
        ["el rodillo", "rolling pin", vR(4, 36, 15, 8, "#c99a5a", "#8a6542", 4, 1.2) + vR(61, 36, 15, 8, "#c99a5a", "#8a6542", 4, 1.2) + vR(16, 30, 48, 20, "#e8c58a", "#a07c3c", 10, 1.4) + vP("M22 35h36", "", "#fbe6c0", 2) + vP("M28 46h24", "", "#d1aa6a", 1.2) + vC(24, 60, 1, "#fff") + vC(40, 62, 1.2, "#fff") + vC(54, 58, 1, "#fff")],
        ["la bandeja de horno", "baking tray", vP("M6 50l10-16h48l10 16z", "#9aa5b1", "#5d6670", 1.4) + vP("M6 50h68v5H6z", "#7d8a98", "#5d6670", 1) + [[22, 42], [36, 40], [50, 40], [30, 47], [46, 47], [58, 45]].map(([x, y]) => vE(x, y, 5.4, 2.8, "#e0a24a", "#a86f22", .8) + vC(x - 1, y - .6, .8, "#5b3a1a") + vC(x + 1.6, y + .4, .7, "#5b3a1a")).join("")],
        ["la manopla", "oven glove", vP("M22 70V30q0-16 14-16q8 0 10 10l2 10 6-8q4-4 8 0q3 3 0 8L52 50v20z", "#e5383b", "#a5262a", 1.4) + vR(20, 62, 34, 10, "#f4efe4", "#c9bfae", 3, 1.2) +
          '<path d="M26 26l20 20M26 38l22 22M28 50l16 12M36 18l14 14M24 34l12-12M24 48l22-22M30 58l20-20" fill="none" stroke="#c4262a" stroke-width=".9" opacity=".7"/>' + vP("M36 72q-4 4 0 6", "", "#c9bfae", 1.6)],
        ["la tostadora", "toaster", vR(22, 16, 12, 16, "#e0b26a", "#a8762a", 3, 1) + vR(44, 14, 12, 18, "#e0b26a", "#a8762a", 3, 1) + vR(12, 28, 56, 38, "#c9d2dc", "#7d8a98", 12, 1.4) + vR(20, 26, 16, 5, "#3b3f47", "", 2) + vR(42, 26, 16, 5, "#3b3f47", "", 2) +
          vP("M18 36v22", "", "#eef2f6", 2.4) + vR(64, 40, 6, 4, "#3b3f47", "", 1.5) + vC(56, 54, 3.4, "#3b3f47") + vR(18, 66, 6, 3, "#3b3f47") + vR(56, 66, 6, 3, "#3b3f47")],
        ["la cafetera", "coffee maker", vR(16, 8, 44, 14, "#3b3f47", "#23262c", 4, 1.2) + vR(50, 20, 10, 46, "#3b3f47", "#23262c", 2, 1) + vR(14, 64, 48, 8, "#3b3f47", "#23262c", 3, 1) + vC(55, 30, 1.6, "#ff5a4a") +
          vP("M20 32h24l-2 30q0 2-2 2H24q-2 0-2-2z", "#e3f2fb", "#7fa6c4", 1.2) + vP("M21 44h22l-1.2 18q0 2-2 2H24.2q-2 0-2-2z", "#6b3a1a") + vP("M44 38q6 0 6 8t-6 8", "", "#3b3f47", 2.4) + vR(26, 22, 12, 6, "#2b2b2b", "", 1)],
        ["el hervidor", "kettle", vP("M56 28q14 2 12 18q-2 12-10 14", "", "#23262c", 4.4) + vP("M24 34l-14-8v6l12 8z", "#3f78e6", "#2f5fd0", 1.2) + vP("M20 66l4-40q1-6 8-6h16q7 0 8 6l4 40z", "#4f8cff", "#2f5fd0", 1.4) + vR(16, 64, 48, 7, "#2b2b2b", "", 2) +
          vR(30, 30, 4, 28, "#bfe2f6", "#2f5fd0", 2, .8) + vE(40, 20, 6, 2.4, "#23262c") + vP("M28 28q-2 18-3 34", "", "#9fc2ff", 2), "la tetera eléctrica"],
        ["la batidora", "blender", vR(22, 54, 36, 18, "#3b3f47", "#23262c", 5, 1.2) + vC(32, 64, 2.4, "#ff5a4a") + vC(40, 64, 2.4, "#c9d2dc") + vC(48, 64, 2.4, "#c9d2dc") + vP("M22 18h36l-4 36H26z", "#e3f2fb", "#7fa6c4", 1.4) + vP("M23.4 34h33.2l-2.2 20H25.6z", "#f48fb1") +
          vR(20, 12, 40, 7, "#2b2b2b", "", 3) + vP("M34 50l12-3M34 47l12 3", "", "#9aa5b1", 2) + vP("M58 22h6v24h-8", "", "#7fa6c4", 2) + vP("M28 22l-2 28", "", "#fff", 1.6), "la licuadora"]] },

    { id: "vajilla", grp: "food", es: "La vajilla y los cubiertos", en: "Tableware", lvl: "a1", kind: "grid",
      // v278: redrawn — porcelain with a blue rim, glass with liquid, polished cutlery, a striped straw, a flowered teapot
      items: [["el plato", "plate", vE(40, 44, 33, 15, "#fbfcfd", "#9aa7b4", 1.4) + vE(40, 44, 28, 12, "none", "#4f8cff", 1.2) + vE(40, 45, 19, 7.4, "#f1f4f8", "#cfd6e0", 1) + vP("M18 40q8-5 18-6", "", "#fff", 1.6)],
        ["el plato hondo", "soup plate", vE(40, 44, 33, 15, "#fbfcfd", "#9aa7b4", 1.4) + vE(40, 44, 28, 12, "none", "#4f8cff", 1.2) + vE(40, 45, 20, 8, "#e5e9ef", "#cfd6e0", 1) + vE(40, 46, 17, 6, "#f2a93b") + vC(34, 45, 1.6, "#5fae4f") + vC(44, 47, 1.4, "#5fae4f") + vC(40, 44, 1.4, "#e5383b")],
        ["el cuenco", "bowl", vR(30, 62, 20, 5, "#e3e8ee", "#9aa7b4", 2, 1) + vP("M10 34h60q-2 30-30 30T10 34z", "#fbfcfd", "#9aa7b4", 1.4) + vP("M14 44q26 8 52 0", "", "#4f8cff", 2.4) + vE(40, 34, 30, 6, "#eef2f6", "#9aa7b4", 1.2) + vE(40, 34, 26, 4, "#f5d38a") +
          vC(32, 33, 2, "#e0a24a") + vC(40, 35, 2, "#e0a24a") + vC(48, 33, 2, "#e0a24a") + vC(36, 32, 1.6, "#e5383b"), "el tazón"],
        ["la taza", "cup", vP("M56 36q12 0 12 9t-12 9", "", "#9aa7b4", 4) + vP("M14 30h42v20q0 14-14 14H28q-14 0-14-14z", "#fbfcfd", "#9aa7b4", 1.4) + vE(35, 30, 21, 4, "#eef2f6", "#9aa7b4", 1) + vE(35, 30, 18, 2.8, "#7a4a2a") + vP("M18 36v12", "", "#fff", 2) +
          vP("M28 22q-4-6 0-12M38 22q-4-6 0-12", "", "#c9d2dc", 2)],
        ["el platillo", "saucer", vE(40, 50, 34, 11, "#fbfcfd", "#9aa7b4", 1.4) + vE(40, 50, 30, 9, "none", "#4f8cff", 1) + vE(40, 50, 13, 4, "#eef2f6", "#cfd6e0", 1) + vP("M14 46q10-5 22-5", "", "#fff", 1.6)],
        ["el vaso", "glass", vP("M22 12h36l-4 58H26z", "#e8f5fc", "#7fa6c4", 1.4) + vP("M23.6 34h32.8l-2.5 36H26.1z", "#9fd0f5") + vE(40, 34, 16.4, 2, "#c4e4f8") + vP("M27 16l3 50", "", "#fff", 2.4) + vE(40, 12, 18, 2.4, "#f4fbff", "#7fa6c4", 1)],
        ["la copa", "wine glass", vP("M24 10h32q2 26-16 32q-18-6-16-32z", "#eef8fd", "#7fa6c4", 1.4) + vP("M25 24h30q-2 16-15 18q-13-2-15-18z", "#9b1d3a") + vE(40, 24, 15, 2, "#b8304e") + vP("M40 42v22", "", "#7fa6c4", 2.6) + vE(40, 66, 14, 3.4, "#eef8fd", "#7fa6c4", 1.2) + vP("M29 14q-1 10 3 18", "", "#fff", 2)],
        ["la jarra", "jug", vP("M52 28q12 0 12 12t-12 14", "", "#7fa6c4", 3.4) + vP("M24 16h28l-2 6q6 6 6 16v26q0 6-6 6H26q-6 0-6-6V38q0-10 6-16z", "#eef8fd", "#7fa6c4", 1.4) + vP("M21 40h34v24q0 5-5 5H26q-5 0-5-5z", "#f8b84a") + vP("M24 16l-4-3", "", "#7fa6c4", 2) + vP("M26 28q-2 14 0 34", "", "#fff", 2)],
        ["el tenedor", "fork", vP("M37 40h6l2 30q0 4-5 4t-5-4z", "#c9d2dc", "#7d8a98", 1.2) + vP("M31 8v16q0 10 6 14h6q6-4 6-14V8h-2.6v15h-2V8h-2.6v15h-2V8h-2.6v15h-2V8z", "#c9d2dc", "#7d8a98", 1.1) + vP("M39 44l1 24", "", "#fff", 1.4)],
        ["el cuchillo", "knife", vP("M36 8q9 0 9 14v20h-9z", "#e9eef3", "#7d8a98", 1.2) + vP("M38 12v28", "", "#fff", 1.4) + vP("M35 42h10l1 28q0 4-6 4t-6-4z", "#c9d2dc", "#7d8a98", 1.2) + vP("M39 46l.4 22", "", "#fff", 1.4)],
        ["la cuchara", "spoon", vE(40, 20, 10, 14, "#c9d2dc", "#7d8a98", 1.2) + vE(40, 21, 7, 10, "#eef2f6") + vP("M37.6 34h4.8l2 36q0 4-4.4 4t-4.4-4z", "#c9d2dc", "#7d8a98", 1.2) + vHi(37, 17, 2, 4, 0)],
        ["la cucharilla", "teaspoon", vE(40, 28, 7, 10, "#c9d2dc", "#7d8a98", 1.2) + vE(40, 29, 4.8, 7, "#eef2f6") + vP("M38.2 38h3.6l1.4 28q0 3-3.2 3t-3.2-3z", "#c9d2dc", "#7d8a98", 1.1) + vHi(38, 26, 1.4, 3, 0), "la cucharita"],
        ["la servilleta", "napkin", vP("M10 22h60L40 68z", "#f7b7c8", "#d07a93", 1.4) + vP("M10 22l30 20 30-20", "", "#e999ae", 1.2) + '<path d="M16 26h48L40 62z" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="2 1.8"/>' + vC(40, 32, 2.4, "#fff")],
        ["el salero", "salt shaker", vP("M28 30h24l-2 40H30z", "#eef8fd", "#7fa6c4", 1.3) + vP("M29 44h22l-1.4 26H30.4z", "#fbfbfb") + [[34, 50], [42, 54], [38, 60], [46, 62]].map(([x, y]) => vC(x, y, .7, "#d8dee6")).join("") + vP("M28 30q0-14 12-14t12 14z", "#c9d2dc", "#7d8a98", 1.2) +
          vC(36, 22, 1.2, "#5d6670") + vC(40, 20, 1.2, "#5d6670") + vC(44, 22, 1.2, "#5d6670") + vP("M31 34l1 32", "", "#fff", 1.6)],
        ["el pimentero", "pepper pot", vP("M28 30h24l-2 40H30z", "#eef8fd", "#7fa6c4", 1.3) + vP("M29 44h22l-1.4 26H30.4z", "#3b3f47") + [[34, 50], [42, 54], [38, 60], [46, 62]].map(([x, y]) => vC(x, y, .8, "#6b7480")).join("") + vP("M28 30q0-14 12-14t12 14z", "#3b3f47", "#23262c", 1.2) +
          vC(38, 22, 1.2, "#c9d2dc") + vC(42, 22, 1.2, "#c9d2dc") + vP("M31 34l1 8", "", "#fff", 1.6)],
        ["la botella", "bottle", vR(34, 4, 12, 6, "#c9a227", "", 1.5) + vP("M34 10h12v12q10 6 10 18v30q0 4-4 4H28q-4 0-4-4V40q0-12 10-18z", "#3f8f5a", "#2a6a40", 1.4) + vR(24, 42, 32, 18, "#f4efe4", "#c9bfae", 1, 1) + vP("M30 48h20M33 53h14", "", "#9b1d3a", 1.6) + vP("M28 34q-2 6-1 34", "", "#8fd0a8", 2)],
        ["la pajita", "straw", '<defs><clipPath id="vdStraw"><path d="M44 4h6v40l-14 18h-6z"/></clipPath></defs>' + vP("M24 34h32l-4 38H28z", "#eef8fd", "#7fa6c4", 1.2) + vP("M25 42h30l-3.4 30H28.4z", "#f59a2c") +
          vP("M44 4h6v40l-14 18h-6z", "#fbfbfb", "#e05a47", 1) + '<g clip-path="url(#vdStraw)">' + vP("M30 20l26-14M30 30l26-14M30 40l26-14M26 52l26-14M22 64l26-14", "", "#e05a47", 3) + "</g>" + vP("M28 38l2 30", "", "#fff", 1.6), "el sorbete"],
        ["la tetera", "teapot", vP("M60 34q14 4 10 18q-2 6-10 8", "", "#9aa7b4", 4) + vP("M20 42l-12-12q-2 2 0 4l10 16z", "#fbfcfd", "#9aa7b4", 1.2) + vP("M18 40q0-18 22-18t22 18q0 22-22 24q-22-2-22-24z", "#fbfcfd", "#9aa7b4", 1.4) + vP("M26 24q14-8 28 0z", "#eef2f6", "#9aa7b4", 1.2) + vC(40, 18, 3.4, "#4f8cff") +
          vC(40, 44, 5, "#e45b8f") + vC(40, 44, 2, "#f2c94c") + vLeaf(45, 46, 20, 9) + vLeaf(35, 46, 160, 9) + vR(26, 62, 28, 4, "#e3e8ee", "#9aa7b4", 2, 1)],
        ["el termo", "flask", vR(26, 6, 28, 13, "#3b3f47", "#23262c", 3, 1.2) + vR(28, 18, 24, 54, "#4f8cff", "#2f5fd0", 6, 1.4) + vR(28, 26, 24, 4, "#2f5fd0") + vP("M33 34v32", "", "#9fc2ff", 2.4) + vR(28, 64, 24, 6, "#2f5fd0", "", 3)]] },

    { id: "lavadero", grp: "home", es: "El lavadero", en: "The laundry room", lvl: "a2", kind: "grid",
      // v278: redrawn — machines with doors, dials and drawers, an iron with steam holes, wicker and pegs, labelled bottles, mop and broom
      items: [["la lavadora", "washing machine", vR(14, 8, 52, 64, "#fbfcfd", "#9aa7b4", 6, 1.4) + vP("M14 22h52", "", "#d6dde4", 1.4) + vR(18, 12, 14, 7, "#e3e8ee", "#b7c0ca", 1.5, 1) + vC(56, 15, 3.4, "#c9d2dc", "#7d8a98", 1) + vC(47, 15, 1.4, "#4caf50") +
          vC(40, 46, 18, "#c9d2dc", "#8d99a6", 1.4) + vC(40, 46, 13.4, "#bfe2f6", "#5d7f99", 1) + vP("M30 50q6-10 14-4q6 4 8-2", "", "#e05a47", 3) + vP("M30 46q10 6 18-2", "", "#4f8cff", 3) + vP("M32 38q4-4 10-4", "", "#fff", 2) + vR(18, 70, 6, 3, "#7d8a98") + vR(56, 70, 6, 3, "#7d8a98")],
        ["la secadora", "tumble dryer", vR(14, 8, 52, 64, "#fbfcfd", "#9aa7b4", 6, 1.4) + vP("M14 22h52", "", "#d6dde4", 1.4) + vC(22, 15, 3.4, "#c9d2dc", "#7d8a98", 1) + vR(32, 12, 26, 7, "#1d2129", "", 1.5) + vP("M36 15.4h6", "", "#7fe08a", 1.4) +
          vC(40, 46, 18, "#c9d2dc", "#8d99a6", 1.4) + vC(40, 46, 13.4, "#3b4250", "#23262c", 1) + vP("M30 46q4-8 10-4t10-2", "", "#f2c94c", 3) + vP("M32 52q8 2 16-2", "", "#e45b8f", 3) + vP("M33 38q4-3 9-3", "", "#9aa5b1", 2) + vR(18, 70, 6, 3, "#7d8a98") + vR(56, 70, 6, 3, "#7d8a98")],
        ["la plancha", "iron", vP("M30 32q0-12 12-12h20q8 0 8 8v4", "", "#23262c", 4.4) + vP("M8 58q2-20 22-26h30q12 0 14 8l2 18z", "#4f8cff", "#2f5fd0", 1.4) + vP("M8 58h68v5H10z", "#c9d2dc", "#7d8a98", 1.2) +
          vC(44, 44, 4.4, "#eef2f6", "#7d8a98", 1) + vP("M44 41v3", "", "#e05a47", 1.4) + vP("M20 48q10-10 24-12", "", "#9fc2ff", 2) + vP("M70 28q6 0 6 10", "", "#9aa5b1", 1.6)],
        ["la tabla de planchar", "ironing board", vP("M24 36l30 34M54 36L24 70", "", "#7d8a98", 3) + vR(20, 68, 10, 3, "#3b3f47", "", 1.5) + vR(50, 68, 10, 3, "#3b3f47", "", 1.5) + vP("M4 30q0-6 8-6h52l12 6-12 6H12q-8 0-8-6z", "#cfe2f8", "#4f7cac", 1.4) +
          [14, 24, 34, 44, 54, 64].map((x) => vC(x, 30, 1.6, "#4f8cff")).join("") + vR(62, 18, 10, 6, "#4f8cff", "#2f5fd0", 2, 1)],
        ["el cesto de la ropa", "laundry basket", vP("M26 30q-4-12 8-14q8 0 10 10M44 30q4-10 14-8", "", "#e45b8f", 4) + vP("M30 28q10-8 22-4", "", "#4f8cff", 4) + vP("M14 30h52l-6 40H20z", "#d8b06a", "#a07c3c", 1.4) + vR(12, 26, 56, 6, "#c99a5a", "#a07c3c", 3, 1.2) +
          vP("M16 40h48M17 50h46M18 60h44M24 32v36M32 32v36M40 32v36M48 32v36M56 32v36", "", "#a07c3c", 1) + vR(34, 36, 12, 5, "#a07c3c", "", 2.4), "el canasto de la ropa"],
        ["las pinzas", "clothes pegs", [[22, "#4f8cff", -12], [42, "#e45b8f", 4], [60, "#f2c94c", 14]].map(([x, c, a]) => '<g transform="rotate(' + a + " " + x + ' 40)">' + vR(x - 6, 12, 5.4, 54, c, "#3b3f47", 2.4, 1) + vR(x + .6, 12, 5.4, 54, c, "#3b3f47", 2.4, 1) + vC(x, 36, 4.4, "none", "#9aa5b1", 2) + "</g>").join(""), "los ganchos de ropa"],
        ["el tendedero", "clothes horse", vP("M16 70L30 14M64 70L50 14M30 14h20M22 42h36M19 56h42M25 28h30", "", "#9aa5b1", 2.6) + vP("M26 28h12v18H26z", "#4f8cff", "#2f5fd0", 1) + vP("M44 28h8v12l-4 4-4-4z", "#e45b8f", "#a8325f", 1) + vP("M30 42h18v10H30z", "#f2c94c", "#c9a227", 1) + vP("M22 56h8v8h-8zM50 56h6v10h-6z", "#7fbf5a", "#4f8a3a", 1)],
        ["la percha", "coat hanger", vP("M40 26v-6q0-8 7-8t7 6", "", "#9aa5b1", 2.6) + vP("M12 54L40 28L68 54H12", "", "#8a6542", 6.4) + vP("M12 54L40 28L68 54H12", "", "#d8ad73", 3.4) + vC(40, 28, 2.6, "#9aa5b1"), "el gancho"],
        ["el detergente", "washing powder", vR(16, 16, 46, 56, "#e9633c", "#b5452a", 4, 1.4) + vP("M16 16l6-8h46l-6 8z", "#f08a5c", "#b5452a", 1.2) + vP("M62 16l6-8v56l-6 8z", "#c4502f", "#b5452a", 1.2) + vC(39, 42, 14, "#fbfcfd", "#4f8cff", 2) + vP("M30 42q4-8 9-2q5 6 9-2", "", "#4f8cff", 2.4) + vC(30, 28, 3, "#d6ecfb") + vC(50, 58, 2.4, "#d6ecfb") + vR(22, 62, 34, 4, "#fbfcfd", "", 2)],
        ["el suavizante", "fabric softener", vP("M46 18h10q8 0 8 10v14", "", "#7a4fb0", 4) + vP("M22 22q0-6 6-6h20q8 0 8 8v42q0 4-4 4H26q-4 0-4-4z", "#a57bdc", "#7a4fb0", 1.4) + vR(30, 8, 12, 9, "#f4f6fa", "#9aa7b4", 2, 1) + vR(26, 34, 26, 24, "#fbfcfd", "#d8ccef", 4, 1) +
          vC(39, 46, 6, "#f7b7c8") + vC(39, 46, 2.4, "#f2c94c") + vLeaf(43, 50, 30, 8) + vP("M26 24v40", "", "#c9b0ef", 2)],
        ["la lejía", "bleach", vP("M48 20h8q8 0 8 10v10", "", "#d6dde4", 4) + vP("M20 24q0-6 6-6h20q8 0 8 8v42q0 4-4 4H24q-4 0-4-4z", "#fbfcfd", "#9aa7b4", 1.4) + vR(28, 8, 14, 11, "#4f8cff", "#2f5fd0", 2, 1) + vR(24, 34, 26, 26, "#d6ecfb", "#9fc2ff", 3, 1) +
          vP("M37 38l8 8-8 8-8-8z", "#fbfcfd", "#e5383b", 1.6) + vP("M37 42v5M37 49.6v.8", "", "#2b2b2b", 1.6), "el cloro"],
        ["el cubo", "bucket", vP("M14 30q26-26 52 0", "", "#7d8a98", 2.4) + vP("M14 30h52l-6 40H20z", "#4f8cff", "#2f5fd0", 1.4) + vE(40, 30, 26, 5, "#3f78e6", "#2f5fd0", 1.2) + vE(40, 31, 22, 3.4, "#9fd0f5") + vP("M17 40h46", "", "#3f78e6", 1.4) + vP("M20 36l3 30", "", "#9fc2ff", 2.4) + vC(14, 31, 2, "#7d8a98") + vC(66, 31, 2, "#7d8a98"), "el balde"],
        ["la fregona", "mop", vP("M60 6L38 52", "", "#4f8cff", 3.4) + vR(56, 4, 8, 8, "#2f5fd0", "", 2) + vP("M30 50h16l4 6H26z", "#3b3f47") + vP("M28 56l-12 16M32 56l-8 18M36 56l-2 18M40 56l3 18M44 56l8 17M48 56l12 14M30 56l-14 10M46 56l14 8", "", "#e9eef3", 3.4) + vP("M28 56l-12 16M36 56l-2 18M44 56l8 17", "", "#c9d2dc", 1.4), "el trapeador"],
        ["la escoba", "broom", vP("M58 4L40 44", "", "#a0714a", 3.6) + vP("M34 42l14 6-2 6-14-6z", "#e05a47", "#a8392b", 1) + vP("M32 48l14 6-10 22q-14-2-22-12z", "#e8c66a", "#b8961e", 1.2) + vP("M30 52l-12 16M34 54l-10 18M38 56l-8 18M42 58l-6 16", "", "#b8961e", 1.2) + vP("M30 50l14 6", "", "#a8392b", 2)],
        ["el recogedor", "dustpan", vP("M50 28L74 14", "", "#3b3f47", 4.4) + vP("M8 62l10-30h32l4 30z", "#e05a47", "#a8392b", 1.4) + vP("M8 62h46", "", "#3b3f47", 3) + vP("M18 32l-6 26M30 32l-2 26M42 32l2 26", "", "#c4473a", 1.2) + vC(20, 56, 1.2, "#9aa5b1") + vC(30, 58, 1.4, "#9aa5b1") + vC(40, 55, 1, "#9aa5b1")],
        ["la aspiradora", "vacuum cleaner", vP("M30 46q-4-24 20-32l10-6", "", "#3b3f47", 3.4) + vP("M60 8l4 28", "", "#9aa5b1", 3) + vP("M56 36h14l4 6H52z", "#3b3f47") + vE(28, 54, 20, 14, "#e5383b", "#a5262a", 1.4) + vE(28, 50, 12, 6, "#f26b6b") +
          vC(18, 66, 5, "#3b3f47") + vC(18, 66, 2, "#9aa5b1") + vC(40, 66, 5, "#3b3f47") + vC(40, 66, 2, "#9aa5b1") + vC(14, 50, 2.4, "#fbfcfd")],
        ["el trapo", "cloth", vP("M10 30l40-14 22 20-40 16z", "#f2c94c", "#c9a227", 1.4) + vP("M10 30l2 30 40-14-20-6z", "#e6b83a", "#c9a227", 1.2) + vP("M20 26l22 20M30 22l22 20M16 38l40-14M22 44l38-14", "", "#e05a47", 1.2)]] },

    { id: "herramientas", grp: "things", es: "Las herramientas", en: "Tools", lvl: "a2", kind: "grid",
      // v278: redrawn — forged heads, rubber grips, threads, teeth, a tape case with a marked blade, a stepladder, a torch beam
      items: [["el martillo", "hammer", vR(31, 24, 9, 48, "#a0714a", "#6b4430", 3, 1.2) + vR(30.4, 50, 10.2, 22, "#e05a47", "#a8392b", 3.4, 1) + vP("M33 54v14M37 54v14", "", "#c4473a", 1) +
          vP("M14 12h30v13H14q-6 0-6-6.5t6-6.5z", "#9aa5b1", "#5d6670", 1.4) + vP("M44 12q14 0 22 10l-4 3q-8-6-18-5z", "#9aa5b1", "#5d6670", 1.4) + vP("M12 15h28", "", "#d5dce3", 1.6)],
        ["el destornillador", "screwdriver", vR(32, 6, 16, 30, "#f2c94c", "#c9a227", 7, 1.4) + vP("M36 10v22M40 9v24M44 10v22", "", "#c9a227", 1.2) + vR(34, 34, 12, 4, "#3b3f47", "", 1.5) + vR(38, 38, 4, 26, "#c9d2dc", "#7d8a98", 1, 1) + vP("M37.4 64h5.2l-.8 10h-3.6z", "#9aa5b1", "#5d6670", 1)],
        ["la llave inglesa", "spanner", '<g transform="rotate(-40 40 40)">' + vR(35, 32, 10, 42, "#c9d2dc", "#7d8a98", 5, 1.4) + vC(40, 68, 3, "#eef2f6", "#7d8a98", 1) + vP("M30 8h20v26H30z", "#c9d2dc", "#7d8a98", 1.4) + vR(35, 6, 10, 12, "#eef2f6", "#7d8a98", 1, 1) +
          vR(31, 22, 18, 7, "#9aa5b1", "#5d6670", 2, 1) + vP("M33 25.4h14", "", "#5d6670", 1, ) + vP("M37 38v24", "", "#fff", 1.4) + "</g>"],
        ["los alicates", "pliers", vP("M36 40L26 74M44 40l10 34", "", "#a8392b", 7.6) + vP("M36 40L26 74M44 40l10 34", "", "#e05a47", 5.4) + vP("M34 42L35 8h4l2 34zM46 42L45 8h-4l-2 34z", "#9aa5b1", "#5d6670", 1.2) + vC(40, 40, 4, "#c9d2dc", "#5d6670", 1.2) + vP("M37 12h6M37 18h6", "", "#5d6670", 1), "el alicate"],
        ["la sierra", "saw", vP("M6 30h46v20L6 38z", "#d5dce3", "#7d8a98", 1.4) + vP("M6 38l3 2 3-1 3 3 3-1 3 3 3-1 3 3 3-1 3 3 3-1 3 3 3-1 3 2 3-1 3 3", "", "#7d8a98", 1.2) + vP("M10 33h38", "", "#fff", 1.4) +
          vP("M50 24h12q12 0 12 14v6q0 14-12 14H50z", "#a0714a", "#6b4430", 1.4) + vP("M56 32h8q4 0 4 4v4q0 4-4 4h-8z", "#f4f6fa", "#6b4430", 1.2) + vC(53, 30, 1.4, "#c9d2dc") + vC(53, 52, 1.4, "#c9d2dc")],
        ["el taladro", "drill", vP("M66 32h12", "", "#9aa5b1", 2.4) + vP("M70 30l2 4M74 30l2 4", "", "#5d6670", 1) + vR(56, 26, 10, 12, "#3b3f47", "#23262c", 2, 1) + vP("M14 20h38q6 0 6 6v12q0 6-6 6H40l-4 22H22l4-22h-10q-4 0-4-4V24q0-4 4-4z", "#f2b53c", "#b8861e", 1.4) +
          vR(18, 64, 24, 10, "#3b3f47", "#23262c", 3, 1) + vR(34, 44, 5, 8, "#23262c", "", 1.5) + vP("M18 24h12", "", "#ffd77a", 2) + vP("M44 26v12M48 26v12", "", "#b8861e", 1.2)],
        ["los clavos", "nails", [[24, -8], [40, 0], [56, 10]].map(([x, a]) => '<g transform="rotate(' + a + " " + x + ' 40)">' + vR(x - 6, 10, 12, 3.4, "#9aa5b1", "#5d6670", 1, 1) + vP("M" + (x - 1.8) + " 13.4h3.6v46l-1.8 6-1.8-6z", "#c9d2dc", "#7d8a98", 1) + vP("M" + (x - .6) + " 16v40", "", "#fff", .8) + "</g>").join("")],
        ["los tornillos", "screws", [[26, -10], [52, 8]].map(([x, a]) => '<g transform="rotate(' + a + " " + x + ' 40)">' + vP("M" + (x - 8) + " 16q0-6 8-6t8 6z", "#c9d2dc", "#7d8a98", 1.2) + vP("M" + (x - 4) + " 12h8", "", "#5d6670", 1.6) + vP("M" + (x - 3.4) + " 16h6.8v40l-3.4 10-3.4-10z", "#c9d2dc", "#7d8a98", 1) +
          vP("M" + (x - 4) + " 22l8-3M" + (x - 4) + " 29l8-3M" + (x - 4) + " 36l8-3M" + (x - 4) + " 43l8-3M" + (x - 4) + " 50l8-3M" + (x - 3) + " 57l6-2.4", "", "#7d8a98", 1.1) + "</g>").join("")],
        ["la cinta métrica", "tape measure", vP("M46 54h28v8H42z", "#ffe066", "#c9a227", 1) + vP("M50 54v3M54 54v4M58 54v3M62 54v4M66 54v3M70 54v4", "", "#2b2b2b", 1) + vR(72, 52, 3, 12, "#7d8a98", "", 1) +
          vC(32, 42, 22, "#f2c94c", "#c9a227", 1.4) + vC(32, 42, 15, "#e6b93a") + vC(32, 42, 7, "#3b3f47") + vR(40, 54, 14, 10, "#3b3f47", "", 3) + vHi(24, 30, 6, 3, -30), "el metro"],
        ["el nivel", "spirit level", vR(6, 32, 68, 16, "#f2c94c", "#c9a227", 3, 1.4) + vR(6, 32, 8, 16, "#3b3f47", "", 3) + vR(66, 32, 8, 16, "#3b3f47", "", 3) + vR(31, 35, 18, 10, "#c8f0b8", "#5d9a4a", 5, 1.2) + vE(40, 40, 3.4, 2.4, "#fbfff4") + vP("M36 35v10M44 35v10", "", "#2b2b2b", .9) + vP("M16 36h12M52 36h12", "", "#fff1b0", 1.4)],
        ["la escalera", "ladder", vP("M22 72L32 8M50 72L40 8M32 8h8", "", "#9aa5b1", 3.4) + vP("M30 20h12M28 32h16M26 44h20M24 56h24", "", "#c9d2dc", 3.4) + vP("M40 8L60 70", "", "#7d8a98", 3) + vP("M44 30l9 4", "", "#7d8a98", 2) + vR(30, 4, 12, 5, "#e05a47", "", 1.5)],
        ["la brocha", "paintbrush", vR(35, 4, 10, 30, "#a0714a", "#6b4430", 5, 1.2) + vC(40, 9, 1.8, "#3a2a1d") + vR(30, 34, 20, 10, "#c9d2dc", "#7d8a98", 1, 1.2) + vP("M30 36h20", "", "#eef2f6", 1.2) + vP("M30 44h20l-2 22H32z", "#3b3f47", "#23262c", 1) + vP("M32 58h16l-.6 8H32.6z", "#4f8cff")],
        ["el rodillo de pintura", "paint roller", vP("M60 21h8v18H40v12", "", "#9aa5b1", 2.6) + vR(36, 50, 8, 24, "#e05a47", "#a8392b", 4, 1.2) + vR(12, 12, 48, 18, "#4f8cff", "#2f5fd0", 9, 1.4) + vP("M18 16q18-2 36 0", "", "#9fc2ff", 2) + vP("M16 30q4 4 8 0q4 4 8 0", "", "#4f8cff", 2)],
        ["la caja de herramientas", "toolbox", vP("M28 30v-8q0-4 4-4h16q4 0 4 4v8", "", "#3b3f47", 3.4) + vR(56, 14, 4, 18, "#e05a47", "", 1) + vR(18, 18, 6, 14, "#9aa5b1", "", 1) + vR(8, 30, 64, 36, "#e5383b", "#a5262a", 4, 1.4) + vR(8, 30, 64, 10, "#f05454", "#a5262a", 4, 1.2) +
          vR(36, 38, 8, 6, "#c9d2dc", "#7d8a98", 1, 1) + vP("M12 52h56", "", "#c4262a", 1.2)],
        ["la linterna", "torch", '<path d="M64 26l14-10v48l-14-10z" fill="#fff3a0" opacity=".6"/>' + vR(8, 32, 42, 16, "#3b3f47", "#23262c", 4, 1.4) + vP("M50 30h8l6-6v32l-6-6h-8z", "#4a4f5a", "#23262c", 1.2) + vR(62, 25, 4, 30, "#fff6c4", "#c9a227", 2, 1) +
          vR(26, 28, 10, 5, "#e05a47", "", 2) + vP("M12 36h34M12 44h34", "", "#5b6470", 1), "la linterna"],
        ["la cinta adhesiva", "sticky tape", vP("M56 52l18 8-2 4-18-8z", "#e6d9b8", "#b8a77a", 1) + vC(40, 40, 22, "#e9dcb8", "#b8a77a", 1.4) + vC(40, 40, 18, "#f2e8cc") + vC(40, 40, 12, "#c9a56a", "#8a6a30", 1.2) + vC(40, 40, 9, "#fbfaf7") + vHi(32, 28, 6, 2.4, -30)],
        ["las tijeras", "scissors", vP("M36 44L58 8l4 2-20 38zM44 44L22 8l-4 2 20 38z", "#c9d2dc", "#7d8a98", 1.2) + vC(40, 44, 2.4, "#5d6670") + vC(30, 60, 9, "none", "#f59a2c", 4.4) + vC(50, 60, 9, "none", "#f59a2c", 4.4) + vP("M36 48l-2 4M44 48l2 4", "", "#f59a2c", 4)],
        ["la pala", "shovel", vP("M32 8h16", "", "#3b3f47", 4) + vP("M34 8v6h12V8", "", "#3b3f47", 2.4) + vR(37, 12, 6, 40, "#a0714a", "#6b4430", 2, 1.2) + vR(35, 48, 10, 6, "#7d8a98", "", 1) + vP("M26 52h28v6q0 14-14 18q-14-4-14-18z", "#9aa5b1", "#5d6670", 1.4) + vP("M30 56v4q0 8 6 12", "", "#d5dce3", 1.6)]] },

    { id: "aparatos", grp: "things", es: "Los aparatos", en: "Electronics & appliances", lvl: "a2", kind: "grid",
      // v278: redrawn — screens with pictures and glare, buttons and ports, a speaker's cones, a camera lens, a glowing bulb
      items: [["la tele", "TV", vP("M30 56l-4 12h28l-4-12", "#3b3f47") + vR(22, 66, 36, 4, "#3b3f47", "", 2) + vR(6, 10, 68, 46, "#2b2b2b", "#111111", 3, 1.4) + vR(9, 13, 62, 40, "#3f82d6") + vP("M9 46l14-12 10 8 14-16 24 20v7H9z", "#5fae4f") + vC(58, 22, 4, "#ffe066") + vP("M12 16l20 34", "", "#fff", 2.4), "el televisor"],
        ["el mando a distancia", "remote control", vR(28, 6, 24, 68, "#3b3f47", "#23262c", 9, 1.4) + vC(40, 14, 3, "#e5383b") + vC(40, 28, 7, "#5b6470", "#23262c", 1) + vC(40, 28, 2.6, "#3b3f47") +
          [[34, 42], [40, 42], [46, 42], [34, 49], [40, 49], [46, 49], [34, 56], [40, 56], [46, 56]].map(([x, y]) => vR(x - 2.4, y - 2, 4.8, 4, "#c9d2dc", "", 1.2)).join("") + vR(34, 62, 4, 3, "#e5383b", "", 1) + vR(38, 62, 4, 3, "#5fae4f", "", 1) + vR(42, 62, 4, 3, "#f2c94c", "", 1), "el control remoto"],
        ["el móvil", "mobile phone", vR(23, 5, 34, 70, "#23262c", "#111111", 9, 1.4) + vR(26, 10, 28, 60, "#4f8cff", "", 5) + vR(36, 8, 8, 2.4, "#111111", "", 1.2) +
          [[30, 18, "#ff8a6b"], [37, 18, "#5fae4f"], [44, 18, "#f2c94c"], [30, 26, "#e45b8f"], [37, 26, "#fff"], [44, 26, "#9b6bff"], [30, 34, "#2bb3a3"], [37, 34, "#ff5a4a"], [44, 34, "#7fc4e8"]].map(([x, y, c]) => vR(x - 2, y - 2, 6, 6, c, "", 1.6)).join("") + vP("M28 64h24", "", "#c9dcff", 1.4) + vP("M28 12l10 24", "", "#fff", 1.6), "el celular"],
        ["el portátil", "laptop", vR(14, 12, 52, 36, "#3b3f47", "#23262c", 3, 1.4) + vR(17, 15, 46, 30, "#7fc4e8") + vP("M17 38l10-8 8 6 10-10 18 14v5H17z", "#5fae4f") + vP("M6 50h68l-4 8H10z", "#c9d2dc", "#7d8a98", 1.2) + vR(10, 48, 60, 3, "#9aa5b1") + vP("M34 54h12", "", "#7d8a98", 1.6), "la laptop"],
        ["la tableta", "tablet", vR(14, 8, 52, 64, "#23262c", "#111111", 7, 1.4) + vR(18, 12, 44, 54, "#9b6bff") + vC(30, 26, 6, "#f2c94c") + vP("M18 54l12-12 10 8 10-10 12 12v14H18z", "#e45b8f") + vC(40, 69, 1.4, "#5b6470") + vP("M20 14l18 40", "", "#fff", 1.6)],
        ["el cargador", "charger", vP("M40 42q0 18 16 20q14 2 14 10", "", "#d0d6dc", 3.2) + vR(64, 68, 10, 6, "#fbfcfd", "#9aa7b4", 1.5, 1) + vR(32, 6, 5, 10, "#c9d2dc", "#7d8a98", 1, 1) + vR(43, 6, 5, 10, "#c9d2dc", "#7d8a98", 1, 1) + vR(24, 14, 32, 30, "#fbfcfd", "#9aa7b4", 6, 1.4) + vC(40, 30, 3, "#5fae4f") + vP("M30 18v20", "", "#fff", 2)],
        ["los auriculares", "headphones", vP("M14 46q0-36 26-36t26 36", "", "#3b3f47", 5) + vP("M17 40q1-24 23-26", "", "#6b7480", 1.4) + vR(8, 40, 15, 26, "#e05a47", "#a8392b", 7, 1.4) + vR(57, 40, 15, 26, "#e05a47", "#a8392b", 7, 1.4) + vR(19, 44, 5, 18, "#3b3f47", "", 2.4) + vR(56, 44, 5, 18, "#3b3f47", "", 2.4) + vHi(13, 48, 1.6, 5, 0) + vHi(62, 48, 1.6, 5, 0), "los audífonos"],
        ["el altavoz", "speaker", vR(20, 6, 40, 68, "#3b3f47", "#23262c", 6, 1.4) + vC(40, 22, 8, "#23262c") + vC(40, 22, 4, "#5b6470") + vC(40, 50, 15, "#23262c") + vC(40, 50, 10, "#4a525d") + vC(40, 50, 4, "#6b7480") + vC(40, 69, 1.4, "#7fe08a") + vP("M24 10v60", "", "#5b6470", 1.4), "el parlante"],
        ["el router", "router", vP("M18 42V14M62 42V14", "", "#3b3f47", 3) + vR(10, 40, 60, 20, "#fbfcfd", "#9aa7b4", 6, 1.4) + [22, 30, 38, 46].map((x) => vC(x, 50, 1.8, "#4caf50")).join("") + vR(54, 48, 10, 4, "#d6dde4", "", 1) +
          vP("M34 24q6-6 12 0M30 20q10-10 20 0M26 16q14-14 28 0", "", "#4f8cff", 2) + vC(40, 28, 1.8, "#4f8cff") + vR(16, 60, 6, 3, "#9aa7b4") + vR(58, 60, 6, 3, "#9aa7b4"), "el enrutador"],
        ["la impresora", "printer", vP("M22 32V8h36v24", "#fbfcfd", "#9aa7b4", 1.2) + vR(10, 28, 60, 30, "#e3e8ee", "#9aa7b4", 6, 1.4) + vR(14, 32, 52, 4, "#3b3f47", "", 2) + vC(60, 44, 2, "#4caf50") + vR(48, 42, 8, 4, "#c9d2dc", "", 1) +
          vR(20, 52, 40, 20, "#fbfcfd", "#9aa7b4", 1, 1.2) + vP("M25 58h26M25 63h30M25 68h20", "", "#9aa7b4", 1.4)],
        ["la cámara", "camera", vP("M26 24l4-8h20l4 8z", "#3b3f47", "#23262c", 1.2) + vR(8, 22, 64, 42, "#3b3f47", "#23262c", 7, 1.4) + vR(8, 34, 64, 18, "#2b2b2b") + vC(40, 44, 16, "#5b6470", "#23262c", 1.4) + vC(40, 44, 11, "#23262c") + vC(40, 44, 7, "#2f5fd0") + vC(37, 41, 2.4, "#cfe0ff") +
          vR(58, 26, 9, 5, "#fff6c4", "", 1) + vR(12, 18, 10, 5, "#3b3f47", "", 1.5)],
        ["la radio", "radio", vP("M58 26L70 6", "", "#9aa5b1", 2) + vC(70, 6, 1.6, "#9aa5b1") + vP("M22 26q0-8 18-8t18 8", "", "#3b3f47", 3) + vR(8, 26, 64, 40, "#e05a47", "#a8392b", 7, 1.4) + vC(26, 46, 13, "#3b3f47") +
          [[-6, -6], [0, -6], [6, -6], [-6, 0], [0, 0], [6, 0], [-6, 6], [0, 6], [6, 6]].map(([dx, dy]) => vC(26 + dx, 46 + dy, 1.4, "#6b7480")).join("") + vR(44, 32, 22, 12, "#f4efe4", "#c9bfae", 2, 1) + vP("M47 38h16M54 34v8", "", "#e05a47", 1) + vC(50, 54, 4, "#f4efe4", "#c9bfae", 1) + vC(62, 54, 4, "#f4efe4", "#c9bfae", 1)],
        ["el ventilador", "fan", vE(40, 70, 16, 4, "#9aa7b4", "#7d8a98", 1.2) + vR(38, 54, 4, 16, "#c9d2dc", "#7d8a98", 1, 1) + vC(40, 32, 24, "#f4f8fb", "#9aa7b4", 1.6) +
          [0, 120, 240].map((a) => '<path d="M40 32q-4-14 4-18q8 2 4 18z" transform="rotate(' + a + ' 40 32)" fill="#4f8cff" stroke="#2f5fd0" stroke-width="1"/>').join("") + vC(40, 32, 4.4, "#3b3f47") + vP("M16 32h48M40 8v48M23 15l34 34M57 15L23 49", "", "#c9d2dc", .8)],
        ["el aire acondicionado", "air conditioner", vR(6, 20, 68, 26, "#fbfcfd", "#b7c0ca", 9, 1.4) + vP("M10 38h60", "", "#d6dde4", 1.4) + vP("M12 42h56", "", "#c4ccd5", 2) + vR(54, 26, 12, 5, "#1d2129", "", 1.5) + vP("M56 28.6h6", "", "#7fe8ff", 1.2) + vC(14, 28, 1.6, "#4caf50") +
          vP("M22 52q4 6 0 12M34 52q4 6 0 12M46 52q4 6 0 12M58 52q4 6 0 12", "", "#7fc4e8", 2)],
        ["la lámpara de mesa", "table lamp", '<ellipse cx="40" cy="44" rx="26" ry="10" fill="#fff3b0" opacity=".55"/>' + vE(40, 70, 16, 4, "#a0714a", "#6b4430", 1.2) + vR(38, 36, 4, 34, "#c9a227", "", 1) + vP("M24 14h32l8 24H16z", "#f6e7bf", "#d1b47a", 1.4) + vP("M28 16l-6 20", "", "#fff8e0", 2) + vP("M48 46v8", "", "#c9a227", 1.2)],
        ["la bombilla", "light bulb", '<circle cx="40" cy="28" r="26" fill="#fff3b0" opacity=".5"/>' + vP("M40 8q18 0 18 18q0 10-8 18v8H30v-8q-8-8-8-18q0-18 18-18z", "#fff6b8", "#c9a227", 1.4) + vP("M34 42l2-14 4 6 4-6 2 14", "", "#e0a020", 1.4) +
          vR(30, 52, 20, 14, "#c9d2dc", "#7d8a98", 2, 1.2) + vP("M30 56h20M30 60h20", "", "#7d8a98", 1.2) + vP("M34 66h12l-3 5h-6z", "#3b3f47") + vHi(31, 20, 3, 6, 20), "el foco"],
        ["la regleta", "extension lead", vP("M68 44q8 0 8 10t-12 14", "", "#d0d6dc", 3) + vR(4, 34, 66, 18, "#fbfcfd", "#9aa7b4", 6, 1.4) + [16, 30, 44].map((x) => vC(x, 43, 5.4, "#e9eef3", "#b7c0ca", 1) + vC(x - 2, 43, 1, "#3b3f47") + vC(x + 2, 43, 1, "#3b3f47")).join("") + vR(56, 38, 9, 10, "#e5383b", "#a5262a", 2, 1), "la extensión"],
        ["las pilas", "batteries", [[22, -8], [46, 6]].map(([x, a]) => '<g transform="rotate(' + a + " " + x + ' 40)">' + vR(x - 2.6, 12, 5.2, 4, "#c9d2dc", "#7d8a98", 1, .8) + vR(x - 9, 16, 18, 52, "#2b2b2b", "#111111", 3, 1.2) + vR(x - 9, 16, 18, 16, "#e08a2a", "", 3) + vP("M" + (x - 3) + " 24h6M" + x + " 21v6", "", "#fff", 1.6) + vP("M" + (x - 5) + " 34v30", "", "#5b6470", 1.6) + "</g>").join(""), "las baterías"]] },

    { id: "vehiculos", grp: "move", es: "Los vehículos", en: "Vehicles", lvl: "a1", kind: "grid",
      // v278: redrawn side views facing right: tinted windows with glare, door seams, lights, wheels with rims and hubs, rails and water
      items: [["el coche", "car", vP("M4 52V45q0-5 5-6l10-3 10-11q2-2 5-2h15q3 0 5 2l9 10 9 2q5 1 5 7v8q0 3-3 3H66a8 8 0 0 0-16 0H28a8 8 0 0 0-16 0H7q-3 0-3-3z", "#e05a47", "#a8392b", 1.6) + vGl("M30 27q1-1.5 3-1.5h8V36H23z") + vGl("M44 25.5h6q2 0 3.5 1.5L61 36H44z") +
          vP("M42.5 36v16M8 44h66", "", "#a8392b", 1) + vR(47, 39, 5, 1.6, "#7a2a20", "", .8) + vP("M73 40l4 2v3l-5-1z", "#fff6c4", "#c9a227", .8) + vR(4, 42, 3, 5, "#c81e1e") + vP("M27 34l5-6M47 34l5-6", "", "#fff", 1.4) + vWh(20, 55, 7) + vWh(58, 55, 7), "el carro"],
        ["la moto", "motorbike", vP("M18 54L30 38M18 54L34 50", "", "#4a4f5a", 2.4) + vP("M28 50h-15", "", "#b8c1cb", 3) + vWh(18, 54, 11) + vWh(62, 54, 11) + vP("M50 44a13 13 0 0 1 24 4", "", "#c4473a", 3) +
          vP("M54 30L62 54", "", "#4a4f5a", 3) + vR(30, 40, 16, 10, "#9aa5b1", "#4a4f5a", 2, 1) + vP("M30 34q8-6 20-4l4 8H32z", "#e05a47", "#a8392b", 1.4) + vP("M18 34q6-3 13-2l2 4H17z", "#2b2b2b") + vP("M52 30l4-6h6", "", "#3b3f47", 2.4) + vC(60, 33, 3, "#fff6c4", "#c9a227", 1)],
        ["la bicicleta", "bicycle", [18, 62].map((x) => vC(x, 52, 13, "none", "#262a30", 3.4) + vC(x, 52, 10.6, "none", "#c9d2dc", 1.2) + vP("M" + x + " 42v20M" + (x - 10) + " 52h20M" + (x - 7) + " 45l14 14M" + (x + 7) + " 45l-14 14", "", "#c9d2dc", .7) + vC(x, 52, 1.8, "#7d8a98")).join("") +
          vP("M18 52L36 53L30 30M18 52L31 33M30 30H56M36 53L57 34", "", "#1f8a6c", 3) + vP("M56 28L62 52", "", "#3a4048", 2.4) + vP("M56 28l-1-6-6-1", "", "#3b3f47", 2) + vP("M23 27h11", "", "#2b2b2b", 3.4) + vP("M30 30l-1-3", "", "#9aa5b1", 2) + vC(36, 53, 4.4, "none", "#7d8a98", 1.6) + vP("M36 53l4 6", "", "#3b3f47", 2)],
        ["el autobús", "bus", vP("M4 58V22q0-6 6-6h56q6 0 8 6l3 10v26q0 3-3 3h-5a7 7 0 0 0-14 0H24a7 7 0 0 0-14 0H7q-3 0-3-3z", "#f2b53c", "#b8861e", 1.6) + [8, 20, 32].map((x) => vGl("M" + x + " 22h10v12H" + x + "z")).join("") +
          vGl("M44 22h10v32H44z") + vP("M49 22v32", "", "#4f6f88", 1) + vGl("M58 22h8q4 0 5 4l3 8H58z") + vP("M4 40h40M54 40h22", "", "#fff", 2.4) + vR(72, 46, 4, 4, "#fff6c4", "", 1) + vR(4, 46, 3, 5, "#c81e1e") + vWh(17, 58, 7) + vWh(61, 58, 7), "el bus"],
        ["el camión", "lorry", vR(3, 14, 48, 38, "#f4f6fa", "#9aa7b4", 2, 1.6) + vP("M3 40h48", "", "#4f8cff", 4) + vP("M15 14v38M27 14v38M39 14v38", "", "#e2e6ec", 1) + vP("M52 24h12q4 0 6 4l6 10v14H52z", "#4f8cff", "#2f5fd0", 1.6) + vGl("M56 28h8q2 0 3 2l4 8H56z") +
          vR(3, 52, 74, 4, "#3b3f47") + vR(73, 44, 4, 4, "#fff6c4", "", 1) + vWh(14, 58, 6) + vWh(29, 58, 6) + vWh(64, 58, 6), "el camión"],
        ["la furgoneta", "van", vP("M4 56V24q0-6 6-6h40q4 0 7 3l11 13 7 3q4 2 4 6v13q0 3-3 3H69a7 7 0 0 0-14 0H24a7 7 0 0 0-14 0H7q-3 0-3-3z", "#fbfcfd", "#9aa7b4", 1.6) + vGl("M51 22h3q2 0 3 1l9 11H51z") + vGl("M26 24h20v10H26z") +
          vP("M4 44h74", "", "#4f8cff", 3) + vP("M48 22v32", "", "#9aa7b4", 1.2) + vR(74, 40, 4, 4, "#fff6c4", "", 1) + vWh(17, 58, 7) + vWh(62, 58, 7), "la camioneta"],
        ["el taxi", "taxi", vP("M4 52V45q0-5 5-6l10-3 10-11q2-2 5-2h15q3 0 5 2l9 10 9 2q5 1 5 7v8q0 3-3 3H66a8 8 0 0 0-16 0H28a8 8 0 0 0-16 0H7q-3 0-3-3z", "#f5d142", "#b8981e", 1.6) + vGl("M30 27q1-1.5 3-1.5h8V36H23z") + vGl("M44 25.5h6q2 0 3.5 1.5L61 36H44z") +
          vR(34, 17, 14, 6, "#2b2b2b", "", 1.6) + vR(36, 18.6, 10, 2.8, "#fff3a0", "", 1) + '<path d="M6 46h70" stroke="#2b2b2b" stroke-width="3" stroke-dasharray="3 3"/>' + vP("M42.5 36v16", "", "#b8981e", 1) + vP("M73 40l4 2v3l-5-1z", "#fff6c4", "#c9a227", .8) + vWh(20, 55, 7) + vWh(58, 55, 7)],
        ["el tren", "train", vP("M4 54V28q0-6 6-6h40q16 0 25 20l2 6v6q0 2-2 2H6q-2 0-2-2z", "#f4f6fa", "#9aa7b4", 1.6) + vGl("M54 24q10 2 16 14H58q-4 0-4-4z") + [10, 22, 34].map((x) => vGl("M" + x + " 28h8v8H" + x + "z")).join("") + vR(46, 28, 4, 20, "#d8dee6", "#9aa7b4", 1, 1) +
          vP("M4 44h72", "", "#e5383b", 3.4) + vC(74, 50, 1.8, "#fff6c4") + [14, 24, 56, 66].map((x) => vC(x, 59, 3.6, "#3b3f47")).join("") + vP("M0 64h80", "", "#6b7480", 2.4) + vP("M6 64v3M18 64v3M30 64v3M42 64v3M54 64v3M66 64v3M78 64v3", "", "#8a6b4a", 2)],
        ["el metro", "underground", vR(4, 16, 72, 40, "#e9eef3", "#9aa7b4", 8, 1.6) + vGl("M8 22h12v12H8z") + vGl("M60 22h12v12H60z") + vR(24, 22, 16, 30, "#bfe2f6", "#4f6f88", 1, 1.1) + vR(42, 22, 16, 30, "#bfe2f6", "#4f6f88", 1, 1.1) + vP("M32 22v30M50 22v30", "", "#4f6f88", 1) +
          vP("M4 44h20M58 44h18", "", "#4f8cff", 4) + vP("M4 50h20M58 50h18", "", "#e5383b", 2) + [14, 24, 56, 66].map((x) => vC(x, 59, 3.4, "#3b3f47")).join("") + vP("M0 64h80", "", "#6b7480", 2.4)],
        ["el tranvía", "tram", vP("M6 8h68", "", "#3b3f47", 1) + vP("M40 17l-8-9h16l-8 9", "", "#3b3f47", 1.6) + vR(4, 17, 72, 39, "#e05a47", "#a8392b", 8, 1.6) + [9, 25, 41, 57].map((x) => vGl("M" + x + " 23h12v14H" + x + "z")).join("") + vP("M4 44h72", "", "#fff1d6", 4) +
          vP("M26 37v19M38 37v19", "", "#a8392b", 1) + [16, 26, 54, 64].map((x) => vC(x, 59, 3.4, "#3b3f47")).join("") + vP("M0 64h80", "", "#6b7480", 2.4)],
        ["el avión", "plane", vP("M34 36l10-14h6l-4 14z", "#b8c1cb", "#9aa7b4", 1) + vP("M8 36l-2-18h8l12 18z", "#4f8cff", "#2f5fd0", 1.4) + vP("M6 42q0-7 10-7h46q10 0 15 7q-5 7-15 7H16q-10 0-10-7z", "#fbfcfd", "#9aa7b4", 1.6) +
          vGl("M63 37q6 1 9.4 4H63z") + [22, 27, 32, 37, 42, 47, 52, 57].map((x) => vC(x, 40, 1.3, "#5d7f99")).join("") + vP("M10 45h56", "", "#4f8cff", 1.6) + vP("M30 44l16 22h8l-6-22z", "#d5dce3", "#9aa7b4", 1.4) + vR(38, 50, 12, 6, "#9aa7b4", "#7d8a98", 3, 1)],
        ["el helicóptero", "helicopter", vP("M6 16h68", "", "#3b3f47", 2.4) + vP("M40 16v8", "", "#3b3f47", 2.4) + vP("M24 36H6", "", "#c9a227", 5) + vP("M6 36l-2-8h4l2 8z", "#c9a227") + vC(5, 29, 5, "none", "#3b3f47", 1.4) +
          vP("M24 38q0-14 16-14h6q14 0 16 14q0 12-16 12H34q-10 0-10-12z", "#f2c94c", "#c9a227", 1.6) + vGl("M44 27q13 2 15.6 11H44z") + vGl("M30 30h10v8H30z") + vP("M24 60h36M30 50v10M50 50v10", "", "#3b3f47", 2.4)],
        ["el barco", "ship", vP("M46 22l2-10h8l-2 10z", "#e5383b", "#a5262a", 1.2) + vR(22, 22, 36, 10, "#fbfcfd", "#9aa7b4", 2, 1.4) + vR(14, 32, 52, 14, "#fbfcfd", "#9aa7b4", 2, 1.4) + vP("M4 46h72l-8 18H14z", "#2f5fd0", "#1d3f9a", 1.6) +
          vP("M8 56h64", "", "#e5383b", 2) + [26, 32, 38, 44, 50].map((x) => vR(x, 25, 4, 4, "#bfe2f6", "", 1)).join("") + [20, 28, 36, 44, 52, 60].map((x) => vC(x, 39, 1.8, "#bfe2f6", "#4f6f88", .8)).join("") + vP("M2 70q8-4 16 0t16 0 16 0 16 0 12 0", "", "#4f8cff", 2)],
        ["la barca", "rowing boat", vP("M18 40l48 26", "", "#8a5a3c", 2.4) + vE(66, 66, 6, 2.6, "#a37a52", "#7a5a3c", 1) + vP("M6 46h68q-6 18-26 18H32Q12 64 6 46z", "#b98a5c", "#7a5a3c", 1.6) + vP("M10 52h60M14 58h52", "", "#8a6542", 1.2) + vP("M6 46h68", "", "#7a5a3c", 3) +
          vP("M62 40L14 66", "", "#8a5a3c", 2.4) + vE(14, 66, 6, 2.6, "#a37a52", "#7a5a3c", 1) + vP("M2 70q8-4 16 0t16 0 16 0 16 0 12 0", "", "#4f8cff", 2), "el bote"],
        ["el velero", "sailing boat", vP("M38 54V8", "", "#6b7480", 2.4) + vP("M40 10q16 20 22 40H40z", "#f4f6fa", "#9aa7b4", 1.2) + vP("M36 14L14 50h22z", "#e5383b", "#a5262a", 1.2) + vP("M38 8l8 3-8 3", "#f2c94c") +
          vP("M8 54h64q-6 12-22 12H30q-16 0-22-12z", "#fbfcfd", "#9aa7b4", 1.6) + vP("M10 58h60", "", "#4f8cff", 2) + vP("M2 72q8-4 16 0t16 0 16 0 16 0 12 0", "", "#4f8cff", 2)],
        ["la ambulancia", "ambulance", vR(14, 13, 10, 5, "#4f8cff", "", 2) + vP("M4 56V24q0-6 6-6h40q4 0 7 3l11 13 7 3q4 2 4 6v13q0 3-3 3H69a7 7 0 0 0-14 0H24a7 7 0 0 0-14 0H7q-3 0-3-3z", "#fbfcfd", "#9aa7b4", 1.6) + vGl("M51 22h3q2 0 3 1l9 11H51z") +
          vP("M26 26v14M19 33h14", "", "#e5383b", 4.4) + vP("M4 46h74", "", "#e5383b", 3) + vP("M48 22v32", "", "#9aa7b4", 1.2) + vR(74, 40, 4, 4, "#fff6c4", "", 1) + vWh(17, 58, 7) + vWh(62, 58, 7)],
        ["el camión de bomberos", "fire engine", vR(6, 14, 46, 6, "none", "#c9d2dc", 1, 1.8) + vP("M12 14v6M18 14v6M24 14v6M30 14v6M36 14v6M42 14v6M48 14v6", "", "#c9d2dc", 1.6) + vR(4, 22, 50, 32, "#e5383b", "#a5262a", 3, 1.6) + vP("M54 26h12q4 0 6 4l6 10v14H54z", "#e5383b", "#a5262a", 1.6) +
          vGl("M58 30h8q2 0 3 2l4 8H58z") + vP("M16 26v24M28 26v24M40 26v24", "", "#c4262a", 1) + vP("M4 44h74", "", "#fff", 2) + vR(58, 22, 6, 4, "#4f8cff", "", 1.5) + vR(3, 54, 74, 4, "#3b3f47") + vWh(16, 58, 6) + vWh(32, 58, 6) + vWh(66, 58, 6)],
        ["el coche de policía", "police car", vR(33, 17, 7, 5, "#e5383b", "", 1.4) + vR(40, 17, 7, 5, "#4f8cff", "", 1.4) + vP("M4 52V45q0-5 5-6l10-3 10-11q2-2 5-2h15q3 0 5 2l9 10 9 2q5 1 5 7v8q0 3-3 3H66a8 8 0 0 0-16 0H28a8 8 0 0 0-16 0H7q-3 0-3-3z", "#fbfcfd", "#3b3f47", 1.6) +
          vGl("M30 27q1-1.5 3-1.5h8V36H23z") + vGl("M44 25.5h6q2 0 3.5 1.5L61 36H44z") + vP("M5 46h72", "", "#2f5fd0", 4.4) + vP("M42.5 36v16", "", "#3b3f47", 1) + vP("M73 40l4 2v3l-5-1z", "#fff6c4", "#c9a227", .8) + vWh(20, 55, 7) + vWh(58, 55, 7), "la patrulla"],
        ["el tractor", "tractor", vP("M20 36V22", "", "#3b3f47", 3) + vR(36, 16, 26, 4, "#2e7d32", "", 1) + vP("M38 20h22v24H38z", "#4caf50", "#2e7d32", 1.4) + vGl("M42 23h14v14H42z") + vR(8, 36, 32, 15, "#4caf50", "#2e7d32", 3, 1.4) + vP("M12 40v8M16 40v8M20 40v8", "", "#2e7d32", 1.2) +
          vC(52, 52, 16, "#262a30") + vP("M52 36v-0M36 52h0", "", "#262a30", 1) + vC(52, 52, 8.4, "#f2c94c", "#c9a227", 1) + vC(52, 52, 3, "#c9a227") + vC(16, 58, 9, "#262a30") + vC(16, 58, 4.6, "#f2c94c", "#c9a227", 1) + vP("M34 46a18 18 0 0 1 36 0", "", "#2e7d32", 3)],
        ["el patinete", "scooter", vP("M8 58q6-6 12 0", "", "#3b3f47", 2) + vR(14, 55, 40, 5, "#4f8cff", "#2f5fd0", 2.5, 1.2) + vP("M52 58L60 14", "", "#3b3f47", 3.4) + vP("M52 14h16", "", "#3b3f47", 3.4) + vR(48, 12, 6, 4, "#2b2b2b", "", 1.5) + vR(66, 12, 6, 4, "#2b2b2b", "", 1.5) +
          vC(14, 63, 6, "#262a30") + vC(14, 63, 2.4, "#c9d2dc") + vC(60, 63, 6, "#262a30") + vC(60, 63, 2.4, "#c9d2dc"), "el scooter"]] },
  ];
  // premium finish (v269): each flat colour becomes a soft top-lit gradient (lighter above, deeper below), outlines go quiet,
  // things in a grid sit on a gentle shadow. Colours given as url(#…) (hand-made gradients, e.g. the face) are kept as drawn.
  const vdHex = (c) => { c = c.slice(1); if (c.length === 3) c = c.split("").map((x) => x + x).join(""); return [0, 2, 4].map((i) => parseInt(c.substr(i, 2), 16)); };
  const vdMix = (c, to, k) => "#" + vdHex(c).map((v, i) => Math.round(v + (to[i] - v) * k).toString(16).padStart(2, "0")).join("");
  let VDN = 0; const VDM = new Map();
  function vdLux(svg, shadow) {
    const key = (shadow ? "s" : "f") + svg; if (VDM.has(key)) return VDM.get(key);
    const n = ++VDN, used = new Map();
    const body = svg.replace(/<(rect|circle|ellipse|path)\b([^>]*?)\/>/g, (m, tag, at) => {
      const f = at.match(/ fill="(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6})"/), s = at.match(/ stroke="(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6})"/);
      if (f && / height="340"/.test(at)) return m; // the wall/background stays flat, so the picture and its margins match
      if (f) { const id = "vg" + n + "_" + f[1].slice(1).toLowerCase(); used.set(id, f[1]); at = at.replace(f[0], ' fill="url(#' + id + ')"'); }
      if (f && s) at = at.replace(s[0], ' stroke="' + vdMix(s[1], [0, 0, 0], 0.06) + '" stroke-opacity=".6"');
      let hi = ""; // a soft highlight on round things in the grids (fruit, wheels' hubs, lamps…)
      if (shadow && f && (tag === "circle" || tag === "ellipse")) { const g = (k) => +((at.match(new RegExp(" " + k + '="([\\d.]+)"')) || [])[1] || 0), rx = tag === "circle" ? g("r") : g("rx"), ry = tag === "circle" ? g("r") : g("ry"), [r0, g0, b0] = vdHex(f[1]), sat = Math.max(r0, g0, b0) - Math.min(r0, g0, b0);
        if (rx >= 9 && ry >= 9 && sat > 40) hi = '<ellipse cx="' + (g("cx") - rx * 0.32).toFixed(1) + '" cy="' + (g("cy") - ry * 0.42).toFixed(1) + '" rx="' + (rx * 0.38).toFixed(1) + '" ry="' + (ry * 0.22).toFixed(1) + '" fill="#fff" opacity=".38"/>'; }
      return "<" + tag + at + "/>" + hi; });
    const defs = "<defs>" + [...used].map(([id, c]) => '<linearGradient id="' + id + '" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="' + vdMix(c, [255, 255, 255], 0.24) + '"/><stop offset=".55" stop-color="' + c + '"/><stop offset="1" stop-color="' + vdMix(c, [16, 22, 40], 0.16) + '"/></linearGradient>').join("") +
      (shadow ? '<filter id="vs' + n + '" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.6" flood-color="#1b2338" flood-opacity=".2"/></filter>' : "") + "</defs>";
    const out = defs + (shadow ? '<g filter="url(#vs' + n + ')">' + body + "</g>" : body); VDM.set(key, out); return out;
  }
  const vdIcon = (svg) => '<svg viewBox="0 0 80 80" aria-hidden="true">' + vdLux(svg, 1) + "</svg>";
  const VD_GRP = [["body", "The body"], ["home", "At home"], ["food", "Food & the kitchen"], ["clothes", "Clothes"], ["things", "Things we use"], ["move", "Getting around"]];
  VDT.sort((a, b) => VD_GRP.findIndex((g) => g[0] === a.grp) - VD_GRP.findIndex((g) => g[0] === b.grp));
  const vdLat = () => (typeof S !== "undefined" && S.region === "latam");
  const vdWord = (it, i) => (vdLat() && it[i] ? it[i] : it[0]); // scene items: lat at [6]; grid items: lat at [3]
  const vdW = (t, it) => vdWord(it, t.kind === "grid" ? 3 : 6);
  const vdN = () => VDT.reduce((n, t) => n + t.items.length, 0);
  function vdHub() {
    app.innerHTML = '<div class="ui-page vd">' + uiTitle("Picture dictionary", "Things you see every day, drawn and labelled. Tap a word to hear it. " + vdN() + ' words, all in Flashcards (deck «Diccionario visual») and in Quick drill › Pictures.', "", "Diccionario visual") +
      VD_GRP.map(([g, gn]) => { const L = VDT.filter((t) => t.grp === g); return L.length ? '<h2 class="vd-h">' + esc(gn) + '</h2><div class="vd-grid">' + L.map((t) => '<a class="vd-card" href="#visual/' + t.id + '"><span class="vd-thumb" aria-hidden="true">' + vdThumb(t) + "</span><b>" + esc(t.es) + "</b><small>" + esc(t.en) + " · " + t.items.length + " words</small></a>").join("") + "</div>" : ""; }).join("") +
      '<div class="row vd-hubrow"><a class="btn" href="#repaso-visual">🃏 Flashcards</a><a class="btn" href="#drill" data-act="vd-drill">⚡ Quick drill</a></div></div>';
  }
  function vdThumb(t) {
    if (t.kind === "grid") return '<svg viewBox="0 0 160 160">' + t.items.slice(0, 4).map((it, k) => '<g transform="translate(' + (k % 2) * 80 + "," + Math.floor(k / 2) * 80 + ')">' + vdLux(it[2], 1) + "</g>").join("") + "</svg>";
    return '<svg viewBox="70 0 260 220" preserveAspectRatio="xMidYMid slice">' + vdLux(t.svg) + "</svg>";
  }
  // labels: each side sorted by the point it names, then spread so no two labels touch (lines never cross on one side)
  function vdLay(t) {
    const Y = new Array(t.items.length), sp = 22, top = 14, bot = 330;
    ["l", "r"].forEach((sd) => { const ix = t.items.map((_, i) => i).filter((i) => t.items[i][4] === sd).sort((a, b) => t.items[a][3] - t.items[b][3] || t.items[a][2] - t.items[b][2]);
      // labels that would touch form a group, centred on the points it names (the least sliding, so the fewest sloping lines)
      let G = ix.map((i) => ({ d: [t.items[i][3]], y: 0 }));
      const place = (g) => { const n = g.d.length, m = g.d.reduce((a, b) => a + b, 0) / n; g.y = Math.max(top, Math.min(bot - (n - 1) * sp, m - ((n - 1) * sp) / 2)); };
      G.forEach(place);
      for (let k = 0; k < G.length - 1; ) { const a = G[k], b = G[k + 1]; if (a.y + a.d.length * sp > b.y) { a.d = a.d.concat(b.d); place(a); G.splice(k + 1, 1); k = Math.max(0, k - 1); } else k++; }
      let k = 0; const ys = []; G.forEach((g) => g.d.forEach((_, j) => ys.push(g.y + j * sp)));
      // untangle: swap neighbouring labels whose lines cross
      const ax = sd === "l" ? 106 : 294, ord = ix.slice(), d = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
      const cross = (i, j, yi, yj) => { const A = [ax, yi], B = [t.items[i][2], t.items[i][3]], C = [ax, yj], D = [t.items[j][2], t.items[j][3]]; return d(A, B, C) * d(A, B, D) < 0 && d(C, D, A) * d(C, D, B) < 0; };
      for (let pass = 0; pass < ord.length * 2; pass++) { let sw = 0; for (let m = 0; m < ord.length - 1; m++) if (cross(ord[m], ord[m + 1], ys[m], ys[m + 1])) { const q = ord[m]; ord[m] = ord[m + 1]; ord[m + 1] = q; sw = 1; } if (!sw) break; }
      ord.forEach((i) => (Y[i] = ys[k++])); });
    return Y;
  }
  // v272 the frame hugs the labels: measured label widths decide how much margin each side needs, so the drawing fills more of the
  // screen width (natural proportions: the picture simply gets taller) and the labels come out bigger
  let VDC = null; const VD_FONT = '650 14px -apple-system, "SF Pro Text", "Inter", system-ui, sans-serif';
  const vdTW = (s) => { try { VDC = VDC || document.createElement("canvas").getContext("2d"); VDC.font = VD_FONT; return VDC.measureText(s).width; } catch (e) { return s.length * 7.6; } };
  function vdFrame(t) {
    let L = 0, R = 0; t.items.forEach((it) => { const w = vdTW(vdW(t, it)) * 1.06 + 6; if (it[4] === "l") L = Math.max(L, w); else R = Math.max(R, w); });
    const x = Math.floor(Math.min(84, 96 - L - 6)), r = Math.ceil(Math.max(316, 304 + R + 6)); return { x, w: r - x };
  }
  // one item as a picture on its own (drills): grid icons as they are, scene items zoomed in with a ring round the point
  function vdPic(t, i) {
    const it = t.items[i]; if (t.kind === "grid") return vdIcon(it[2]);
    const w = 120, h = 102, x = Math.max(0, Math.min(400 - w, it[2] - w / 2)), y = Math.max(0, Math.min(340 - h, it[3] - h / 2));
    return '<svg viewBox="' + x + " " + y + " " + w + " " + h + '" aria-hidden="true">' + vdLux(t.svg) + '<circle cx="' + it[2] + '" cy="' + it[3] + '" r="9" fill="none" stroke="#e0592e" stroke-width="3"/><circle cx="' + it[2] + '" cy="' + it[3] + '" r="2.6" fill="#e0592e"/></svg>';
  }
  function vdView(id) {
    const t = VDT.find((x) => x.id === id); if (!t) { vdHub(); return; }
    const k = VDT.indexOf(t), prev = VDT[k - 1], next = VDT[k + 1];
    let pic;
    if (t.kind === "grid") pic = '<div class="vd-items">' + t.items.map((it, i) => '<button type="button" class="vd-it" data-act="vd-say" data-i="' + i + '">' + vdIcon(it[2]) + '<b lang="es">' + esc(vdW(t, it)) + "</b><small>" + esc(it[1]) + "</small></button>").join("") + "</div>";
    else { const Y = vdLay(t), F = vdFrame(t), bg = t.bg || "#fffdf8";
      pic = '<div class="vd-pic"><svg viewBox="' + F.x + " 0 " + F.w + ' 340" role="img" aria-label="' + esc(t.en) + '">' + vdLux((F.x < 0 ? '<rect x="' + F.x + '" y="0" width="' + -F.x + '" height="340" fill="' + bg + '"/>' : "") + (F.x + F.w > 400 ? '<rect x="400" y="0" width="' + (F.x + F.w - 400) + '" height="340" fill="' + bg + '"/>' : "") + t.svg) +
        t.items.map((it, i) => { const L = it[4] === "l", lx = L ? 98 : 302, w = vdW(t, it), ly = Y[i];
          return '<g class="vd-lab" data-act="vd-say" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(w + ", " + it[1]) + '"><path d="M' + lx + " " + ly + "L" + (L ? lx + 8 : lx - 8) + " " + ly + "L" + it[2] + " " + it[3] + '" class="vd-line"/><circle cx="' + it[2] + '" cy="' + it[3] + '" r="3.2" class="vd-dot"/>' +
            '<text x="' + (L ? lx - 2 : lx + 2) + '" y="' + (ly + 4) + '" text-anchor="' + (L ? "end" : "start") + '" class="vd-t">' + esc(w) + "</text></g>"; }).join("") + "</svg></div>" +
        '<ol class="vd-list">' + t.items.map((it, i) => '<li><button type="button" data-act="vd-say" data-i="' + i + '"><b lang="es">' + esc(vdW(t, it)) + "</b><small>" + esc(it[1]) + "</small></button></li>").join("") + "</ol>"; }
    app.innerHTML = '<div class="stack vd"><p class="crumbs"><a href="#visual">Picture dictionary</a><span aria-hidden="true">›</span><span>' + esc(t.en) + '</span></p><div><p class="eyebrow">' + esc(t.en) + " · " + t.lvl.toUpperCase() + " · " + t.items.length + " words</p><h1>" + esc(t.es) + '</h1><p class="lead2">Tap any label to hear it. ' + (vdLat() ? "Words as they are said in Latin America." : "Words as they are said in Spain.") + " Change this in Settings › Spanish variety.</p></div>" +
      '<div class="row vd-top"><button class="btn primary" data-act="vd-all">🔊 Hear them all</button><button class="btn" data-act="vd-deck">＋ Add to my deck</button></div><p class="small vd-how">«Hear them all»: each word in English once, then in Spanish three times.</p>' +
      '<section class="block vd-card2" data-vd="' + t.id + '">' + pic + '<p class="vd-en" id="vd-en" aria-live="polite"></p></section>' +
      '<div class="row vd-more"><a class="btn" href="#drill" data-act="vd-drill">⚡ Quick drill</a><a class="btn" href="#repaso-visual">🃏 Flashcards</a></div>' +
      '<div class="player vd-player" id="vd-player" role="group" aria-label="Word player" hidden><button class="pbtn" data-act="vd-prev" aria-label="Previous word">' + PREV + '</button><button class="pbtn main" id="vd-play" data-act="vd-play" aria-label="Pause">' + PAUSE + '</button><button class="pbtn" data-act="vd-next" aria-label="Next word">' + NEXT + '</button>' +
        '<span class="ppos" id="vd-pos">1 / ' + t.items.length + '</span><button class="pbtn vd-rate" data-act="vd-rate" id="vd-rate" aria-label="Speed">1×</button><button class="pbtn vd-x" data-act="vd-close" aria-label="Close the player">✕</button></div>' +
      '<div class="unav">' + (prev ? '<a class="btn" href="#visual/' + prev.id + '">‹ ' + esc(prev.es) + "</a>" : '<a class="btn" href="#visual">‹ All topics</a>') + (next ? '<a class="btn" href="#visual/' + next.id + '">' + esc(next.es) + " ›</a>" : "") + "</div></div>";
  }
  const vdItems = () => { const c = document.querySelector("[data-vd]"), t = c && VDT.find((x) => x.id === c.dataset.vd); return t ? t.items.map((it) => [vdW(t, it), it[1]]) : []; };
  function vdLight(i) { document.querySelectorAll(".vd .on").forEach((x) => x.classList.remove("on")); document.querySelectorAll('.vd [data-i="' + i + '"]').forEach((x) => x.classList.add("on")); const w = vdItems()[i], e = document.getElementById("vd-en"); if (e && w) e.innerHTML = "<b lang=\"es\">" + esc(w[0]) + "</b> · " + esc(w[1]); }
  // «Hear them all» (v271): a listening mode — the picture pinned at the top, edge to edge, the word list moving up under it,
  // the reading player at the bottom (previous · play/pause · next · speed · close). Each word: English once, then Spanish three times.
  const VDP = { gen: 0, on: 0, i: 0, paused: 0, rate: 1 }, VD_RATES = [0.75, 1, 1.25];
  function vdAllBtn(on) { const b = document.querySelector('[data-act="vd-all"]'); if (b) b.textContent = on ? "⏹ Stop" : "🔊 Hear them all"; VDP.on = on ? 1 : 0; }
  function vdSay(txt, lang, g, done) {
    if (g !== VDP.gen || !document.querySelector(".vd")) return;
    let fin = 0; const next = () => { if (fin) return; fin = 1; if (g === VDP.gen) setTimeout(() => g === VDP.gen && done(), (lang === "en" ? 380 : 520) / VDP.rate); };
    try { const u = utter(txt, lang, (lang === "es" ? 0.85 : 0.95) * VDP.rate); u.onend = next; u.onerror = next; speechSynthesis.speak(u); setTimeout(next, (900 + txt.length * 160) / VDP.rate); } catch (x) { next(); }
  }
  function vdBar() { const L = vdItems(), b = document.getElementById("vd-play"), pos = document.getElementById("vd-pos"), r = document.getElementById("vd-rate");
    if (b) { b.innerHTML = VDP.paused ? PLAY : PAUSE; b.setAttribute("aria-label", VDP.paused ? "Play" : "Pause"); } if (pos) pos.textContent = Math.min(L.length, VDP.i + 1) + " / " + L.length; if (r) r.textContent = String(VDP.rate).replace(/^0/, "") + "×"; }
  // keep the word being said in view: the list moves up a row at a time, under the pinned picture and above the player
  function vdKeep(i) {
    const el = document.querySelector('.vd-list [data-i="' + i + '"]') || document.querySelector('.vd-it[data-i="' + i + '"]'); if (!el) return;
    const pin = document.querySelector(".vdplay .vd-pic"), top = pin ? pin.getBoundingClientRect().bottom + 6 : (document.querySelector("header.top") || { getBoundingClientRect: () => ({ bottom: 56 }) }).getBoundingClientRect().bottom + 8;
    const bar = document.getElementById("vd-player"), bot = (bar && !bar.hidden ? bar.getBoundingClientRect().top : innerHeight) - 8, r = el.getBoundingClientRect();
    const row = r.height + 8; // finished rows move up: the word being said sits on the second visible row (the row just done stays above it)
    if (r.bottom > bot || r.top < top || r.top > top + row * 1.3) scrollTo({ top: Math.max(0, scrollY + r.top - top - (r.top - row < top ? 0 : row)), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); else if (0) scrollTo({ top: Math.max(0, scrollY + r.top - top), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  function vdStep(g) {
    if (g !== VDP.gen || VDP.paused) return; const L = vdItems();
    if (VDP.i >= L.length) { VDP.paused = 1; VDP.i = Math.max(0, L.length - 1); vdBar(); vdAllBtn(false); return; }
    const w = L[VDP.i]; vdLight(VDP.i); vdKeep(VDP.i); vdBar();
    const say = (x, l, d) => { window.__vdSeq.push(l + ":" + x); vdSay(x, l, g, d); };
    say(w[1], "en", () => say(w[0], "es", () => say(w[0], "es", () => say(w[0], "es", () => { VDP.i++; setTimeout(() => vdStep(g), 500 / VDP.rate); }))));
  }
  function vdGo(i) { const g = ++VDP.gen; try { speechSynthesis.cancel(); } catch (x) {} VDP.i = Math.max(0, Math.min(vdItems().length - 1, i)); if (VDP.paused) { vdLight(VDP.i); vdKeep(VDP.i); vdBar(); } else vdStep(g); }
  function vdMode(on) {
    const page = document.querySelector(".stack.vd"), bar = document.getElementById("vd-player"); if (!page) return;
    page.classList.toggle("vdplay", on); document.body.classList.toggle("vd-on", on); if (bar) bar.hidden = !on;
    const h = document.querySelector("header.top"); document.documentElement.style.setProperty("--hdrH", Math.round(h ? h.getBoundingClientRect().height : 52) + "px");
    if (on) { const pic = document.querySelector(".vd-pic") || document.querySelector(".vd-card2"); if (pic) scrollTo({ top: Math.max(0, pic.getBoundingClientRect().top + scrollY - (h ? h.getBoundingClientRect().height : 52)), behavior: "auto" }); }
  }
  function vdStop() { VDP.gen++; VDP.paused = 1; try { speechSynthesis.cancel(); } catch (x) {} vdAllBtn(false); vdMode(false); }
  addEventListener("hashchange", () => { if (VDP.on || document.body.classList.contains("vd-on")) { VDP.gen++; VDP.on = 0; try { speechSynthesis.cancel(); } catch (x) {} document.body.classList.remove("vd-on"); } });
  window.__vdSeq = [];
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-act^='vd-']"); if (!b || !document.querySelector(".vd")) return; const a = b.dataset.act;
    if (a === "vd-say") { const i = +b.dataset.i, w = vdItems()[i]; if (VDP.on) { VDP.paused = 0; vdGo(i); return; } VDP.gen++; vdLight(i); try { speechSynthesis.cancel(); speechSynthesis.speak(utter(w[0], "es", 0.85)); } catch (x) {} }
    else if (a === "vd-all") { if (VDP.on) { vdStop(); return; } window.__vdSeq = []; VDP.i = 0; VDP.paused = 0; vdAllBtn(true); vdMode(true); vdGo(0); }
    else if (a === "vd-play") { if (!VDP.on) { vdAllBtn(true); vdMode(true); } VDP.paused = VDP.paused ? 0 : 1; if (VDP.paused) { VDP.gen++; try { speechSynthesis.cancel(); } catch (x) {} vdBar(); } else vdGo(VDP.i); }
    else if (a === "vd-prev") vdGo(VDP.i - 1);
    else if (a === "vd-next") vdGo(VDP.i + 1);
    else if (a === "vd-rate") { VDP.rate = VD_RATES[(VD_RATES.indexOf(VDP.rate) + 1) % VD_RATES.length]; vdBar(); if (!VDP.paused) vdGo(VDP.i); }
    else if (a === "vd-close") vdStop();
    else if (a === "vd-deck") { const c = document.querySelector("[data-vd]"), tp = c && VDT.find((x) => x.id === c.dataset.vd); if (!tp) return; const name = "🖼 " + tp.es; let D = SRD.decks.find((d) => d.name === name); if (!D) { D = dkNew(name); D.ic = "🖼"; }
      let n = 0; vdItems().forEach((w) => { if (dkAdd(D.id, w[0], w[1], "Picture dictionary · " + tp.es)) n++; }); srSave(); dkToast(n ? "Added " + n + " words to «" + esc(name) + "» · <a href=\"#repaso\">Flashcards</a>" : "These words are already in «" + esc(name) + "»"); }
    else if (a === "vd-drill") { try { S.qdF = "pic"; save(); } catch (x) {} }
  });
  document.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("vd-lab")) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); } });
  // Flashcards: the whole picture dictionary as one built-in deck, a theme per topic (words follow the Spanish variety)
  try { const d = { id: "visual", t: "Diccionario visual", en: "Picture dictionary · " + vdN() + " words" }; Object.defineProperty(d, "themes", { enumerable: true, get: () => VDT.map((t) => ({ t: t.es, en: t.en, w: t.items.map((it) => [vdW(t, it), it[1]]) })) }); VPRO.push(d); } catch (e) {}
  // Quick drill › Pictures: words with their pictures, up to the chosen level (A1 → A1 topics; A2 and up → every topic)
  const vdPool = (lv) => { const out = []; VDT.forEach((t) => { if (lv === "a1" && t.lvl !== "a1") return; t.items.forEach((it, i) => out.push({ t: t.id, i, es: vdW(t, it), en: it[1] })); }); return out; };
  window.__vd = { topics: () => VDT.map((t) => ({ id: t.id, n: t.items.length, kind: t.kind, grp: t.grp, en: t.en })), deck: (re) => { const d = SRD.decks.find((x) => new RegExp(re).test(x.name)); return d ? d.w.length : 0; }, lat: () => vdLat(),
    pool: vdPool, pic: (tid, i) => { const t = VDT.find((x) => x.id === tid); return t ? vdPic(t, i) : ""; }, lay: (tid) => { const t = VDT.find((x) => x.id === tid); return t ? vdLay(t) : []; }, n: vdN, seq: () => window.__vdSeq, st: () => ({ on: VDP.on, i: VDP.i, paused: VDP.paused, rate: VDP.rate }) };
  /* ==/VISUAL== */

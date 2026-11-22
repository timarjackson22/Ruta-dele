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
      svg: vR(0, 0, 400, 340, "#f2f7fd") + vE(200, 326, 64, 6, "#dfe7f1") + vR(193, 56, 14, 18, "#f3c9a6", "#b9805e") + vC(200, 40, 20, "#f3c9a6", "#b9805e") + vP("M180 38q-2-24 20-24t20 24q-6-12-20-12t-20 12z", "#3b2a20") + vC(193, 41, 1.8, "#333") + vC(207, 41, 1.8, "#333") + vP("M194 50q6 4 12 0", "", "#9b5a46", 1.5) +
        vLimb(["164 84", "152 142", "148 196"], 14) + vLimb(["236 84", "248 142", "252 196"], 14) + vE(147, 206, 8, 11, "#f3c9a6", "#b9805e") + vP("M246 210v10M250 211v12M254 211v12M258 210v10", "", "#b9805e", 5.4) + vP("M246 210v10M250 211v12M254 211v12M258 210v10", "", "#f3c9a6", 3) + vE(252, 204, 8.5, 9, "#f3c9a6", "#b9805e") +
        vLimb(["181 216", "179 262", "179 308"], 16) + vLimb(["219 216", "221 262", "221 308"], 16) + vP("M173 263q6 4 12 0M215 263q6 4 12 0", "", "#b9805e", 1.4) +
        vS("M187 304v12h-26q-7 0-5-6q2-6 15-6z") + vS("M213 304v12h26q7 0 5-6q-2-6-15-6z") + vP("M164 312v4M169 311v5M231 311v5M236 312v4", "", "#b9805e", 1.2) +
        vP("M166 166L234 166L240 224L206 224L200 198L194 224L160 224Z", "#2f3a56", "#1d253a") + vP("M166 173h68", "", "#1d253a", 2) +
        vP("M166 76Q200 66 234 76L256 110L240 118L234 106L234 170L166 170L166 106L160 118L144 110Z", "#4f8cff", "#2f5fd0") + vP("M190 72q10 10 20 0", "", "#2f5fd0", 2),
      items: [["la cabeza", "head", 190, 28, "l"], ["el hombro", "shoulder", 168, 80, "l"], ["el brazo", "arm", 155, 128, "l"], ["el codo", "elbow", 152, 142, "l"], ["la mano", "hand", 147, 208, "l"], ["la pierna", "leg", 180, 240, "l"], ["la rodilla", "knee", 179, 262, "l"], ["el pie", "foot", 168, 312, "l"],
        ["el cuello", "neck", 205, 66, "r"], ["el pecho", "chest", 214, 98, "r"], ["el estómago", "stomach", 204, 142, "r"], ["la cintura", "waist", 234, 170, "r"], ["la muñeca", "wrist", 149, 192, "l"], ["la cadera", "hip", 238, 194, "r"], ["los dedos", "fingers", 254, 220, "r"], ["el tobillo", "ankle", 221, 302, "r"]] },

    { id: "mano", grp: "body", bg: "#fdf6ec", es: "La mano", en: "The hand", lvl: "a2", kind: "scene",
      svg: vR(0, 0, 400, 340, "#fdf6ec") + vR(178, 246, 62, 94, "#f3c9a6", "#b9805e") + vR(170, 302, 78, 38, "#5b8def", "#3d6cc4") +
        vR(158, 76, 22, 110, "#f3c9a6", "#b9805e", 11) + vR(184, 58, 23, 128, "#f3c9a6", "#b9805e", 11.5) + vR(211, 70, 22, 116, "#f3c9a6", "#b9805e", 11) + vR(237, 100, 19, 88, "#f3c9a6", "#b9805e", 9.5) +
        vLimb(["178 238", "142 206", "126 180"], 24) +
        vS("M156 162Q156 150 168 150H246Q258 150 258 162V230Q258 262 236 268H182Q156 262 156 232Z") +
        vP("M160 112h18M160 140h18M186 92h19M186 124h19M213 104h18M213 134h18M239 126h15M239 152h15", "", "#c79373", 1.5) +
        vP("M168 196q30-10 82-4M166 218q34 0 60 20M196 262q-8-40 30-70M166 168q40 6 86 2", "", "#c79373", 1.6) +
        '<rect x="113" y="170" width="15" height="11" rx="4" fill="#fbe3d6" stroke="#b9805e" stroke-width="1.3" transform="rotate(-40 120.5 175.5)"/>',
      items: [["el pulgar", "thumb", 142, 207, "l"], ["la uña", "fingernail", 120, 175, "l"], ["el índice", "index finger", 169, 100, "l"], ["el dedo corazón", "middle finger", 195, 80, "l", 0, "el dedo medio"],
        ["el anular", "ring finger", 222, 92, "r"], ["el meñique", "little finger", 246, 120, "r"], ["la palma", "palm", 214, 214, "r"], ["la muñeca", "wrist", 208, 286, "r"]] },

    { id: "cocina", grp: "home", bg: "#fdf3e3", es: "La cocina", en: "The kitchen", lvl: "a1", kind: "scene",
      svg: vR(0, 0, 400, 340, "#fdf3e3") + vR(0, 290, 400, 50, "#e8d3b5") + vP("M0 290h400", "", "#cdb48e", 2) +
        vR(152, 28, 144, 48, "#8fc1b5", "#5e968a", 4) + vP("M200 28v48M248 28v48", "", "#5e968a", 2) + vC(192, 64, 2.6, "#355") + vC(208, 64, 2.6, "#355") + vC(256, 64, 2.6, "#355") +
        vR(104, 70, 44, 220, "#e9eef3", "#9aa7b4", 6) + vP("M104 132h44", "", "#9aa7b4", 2) + vP("M140 86v30M140 146v50", "", "#7d8a98", 3.4) +
        vR(160, 92, 46, 46, "#cfe8fb", "#8a6b4a", 3) + vP("M183 92v46M160 115h46", "", "#8a6b4a", 2) +
        vR(234, 86, 60, 32, "#4a4f5a", "", 4) + vR(239, 91, 38, 22, "#1d2129", "", 2) + vC(286, 98, 2, "#bbb") + vC(286, 107, 2, "#bbb") +
        vR(150, 198, 148, 10, "#c9b79c", "#a48f72", 0, 1.5) + vR(160, 199, 40, 6, "#9aa3ad") + vP("M182 199V180q0-9 9-9q9 0 9 9v5", "", "#8d97a3", 3.4) + vP("M176 199h12", "", "#8d97a3", 3) +
        vE(238, 197, 13, 3, "#333") + vE(272, 197, 13, 3, "#333") + vR(256, 176, 32, 20, "#9aa1ab", "#6b7480", 3) + vP("M252 180h4M288 180h4", "", "#6b7480", 3.4) + vR(266, 172, 12, 4, "#6b7480", "", 2) +
        vR(150, 208, 62, 82, "#f5e6c8", "#b49a6c") + vP("M150 235h62M150 262h62", "", "#b49a6c", 2) + vP("M172 221h18M172 248h18M172 276h18", "", "#8a6b4a", 3.4) +
        vR(214, 208, 84, 82, "#3e434d", "#2a2e35") + vC(228, 216, 2.6, "#ddd") + vC(240, 216, 2.6, "#ddd") + vC(252, 216, 2.6, "#ddd") + vC(286, 216, 3.4, "#ddd") + vR(222, 228, 68, 52, "#1d2129", "#666", 3) + vP("M226 236h60", "", "#bbb", 3),
      items: [["los armarios", "cupboards", 166, 52, "l", 0, "los gabinetes"], ["el congelador", "freezer", 124, 100, "l"], ["la ventana", "window", 172, 104, "l"], ["el grifo", "tap", 190, 174, "l", 0, "la llave del agua"], ["la nevera", "fridge", 124, 214, "l", 0, "el refrigerador"], ["el fregadero", "sink", 170, 202, "l"], ["los cajones", "drawers", 181, 248, "l"], ["el suelo", "floor", 130, 318, "l", 0, "el piso"],
        ["el microondas", "microwave", 258, 102, "r"], ["la olla", "pot", 272, 186, "r"], ["el fuego", "burner", 236, 197, "r", 0, "el quemador"], ["la encimera", "worktop", 207, 203, "r", 0, "el mesón"], ["los mandos", "knobs", 286, 216, "r", 0, "las perillas"], ["el horno", "oven", 256, 256, "r"], ["la cocina", "stove", 294, 250, "r", 0, "la estufa"]] },

    { id: "sala", grp: "home", bg: "#eef3ea", es: "El salón", en: "The living room", lvl: "a1", kind: "scene",
      svg: vR(0, 0, 400, 340, "#eef3ea") + vR(0, 0, 400, 24, "#e3ddd0") + vP("M0 24h400", "", "#c9c0ae", 2) + vR(0, 262, 400, 78, "#d9c3a0") + vP("M0 262h400", "", "#b9a37c", 2) +
        vP("M150 24v10", "", "#666", 2) + vE(150, 37, 7, 4, "#8a6b4a") + vP("M110 38q20-6 38 0M152 38q20-6 38 0", "", "#a07c5a", 5) + vC(150, 41, 3, "#ffd36b") +
        vP("M252 24v12", "", "#666", 2) + vP("M238 48q2-12 14-12t14 12z", "#2f6f5e", "#1f4f42", 1.5) + vE(252, 49, 5, 2.6, "#ffe38a") +
        vR(234, 40, 60, 22, "#fbfcfd", "#a9b4bf", 4) + vP("M240 54h48M240 58h48", "", "#c4ccd5", 1.4) + vC(286, 46, 1.6, "#4caf50") +
        vR(116, 60, 50, 86, "#d6ecfb", "#fff", 0, 4) + vP("M141 60v86", "", "#fff", 3) + vP("M104 52h72", "", "#7a5a3c", 4) + vP("M106 54q-2 50 4 98h10q-4-50-2-98zM176 54q2 50-4 98h-10q4-50 2-98z", "#d86a5b", "#b04d40", 1.5) +
        vR(180, 66, 46, 34, "#fff8e6", "#8a6b4a", 0, 4) + vP("M184 96l12-14 8 8 6-6 12 12z", "#78b06a") + vC(214, 76, 4, "#f2c94c") +
        vC(262, 96, 12, "#fff", "#555", 2) + vP("M262 88v8l6 4", "", "#333", 1.8) +
        vR(174, 134, 8, 12, "#fff", "#9aa1ab", 1.5, 1.2) + vR(196, 246, 10, 8, "#fff", "#9aa1ab", 1.5, 1.2) + vC(199, 250, 0.9, "#555") + vC(203, 250, 0.9, "#555") +
        vR(104, 184, 98, 40, "#4f7fbf", "#345f99", 8) + vR(104, 216, 98, 34, "#5b8fd1", "#345f99", 4) + vR(100, 200, 14, 54, "#4f7fbf", "#345f99", 5) + vR(192, 200, 14, 54, "#4f7fbf", "#345f99", 5) + vR(118, 192, 26, 20, "#f2c94c", "#c9a227", 5) + vR(162, 192, 26, 20, "#ef8f6b", "#c4623f", 5) + vP("M108 254v8M198 254v8", "", "#5b4430", 4) +
        vR(222, 128, 70, 46, "#1d2129", "#3b3f47", 3, 3) + vP("M228 166l18-16 10 8 14-14 16 22", "", "#4a6fa5", 2) +
        vR(216, 214, 80, 46, "#a37a52", "#7a5a3c", 3) + vP("M256 214v46", "", "#7a5a3c", 2) + vR(224, 226, 26, 10, "#2d2f36", "", 2) + vC(246, 231, 1.4, "#4caf50") + vP("M262 236h26", "", "#7a5a3c", 2) + vP("M222 260v4M290 260v4", "", "#5b4430", 3) +
        vR(234, 202, 46, 10, "#2d2f36", "", 4) + vP("M240 207h34", "", "#555", 1.2, ) +
        vR(282, 196, 12, 18, "#c0563f") + vP("M288 196q-8-12-2-22M288 196q6-14 0-24M288 196q10-6 8-18", "", "#3e8a4a", 3) +
        vE(170, 312, 70, 18, "#c0563f", "#9c4130") + vR(124, 276, 92, 8, "#8a6b4a", "#6b4f33", 2) + vP("M132 284v20M208 284v20", "", "#6b4f33", 5) + vR(134, 268, 22, 8, "#fff", "#9aa1ab", 1, 1) + vR(180, 270, 18, 6, "#333", "", 2) + vC(192, 273, 1.2, "#e05a47") +
        vP("M288 326v-66", "", "#555", 3) + vE(288, 328, 10, 3, "#555") + vP("M276 262l6-20h12l6 20z", "#f5e3b5", "#c9a86a", 1.5),
      items: [["el techo", "ceiling", 120, 12, "l"], ["el ventilador de techo", "ceiling fan", 130, 38, "l"], ["las cortinas", "curtains", 110, 110, "l"], ["la ventana", "window", 141, 92, "l"], ["el cuadro", "picture", 200, 86, "l"], ["el interruptor", "light switch", 178, 140, "l"], ["los cojines", "cushions", 131, 202, "l"], ["el sofá", "sofa", 150, 236, "l"], ["el enchufe", "socket", 201, 250, "l", 0, "el tomacorriente"], ["el libro", "book", 145, 272, "l"], ["la mesa de centro", "coffee table", 170, 280, "l"], ["la alfombra", "rug", 122, 318, "l", 0, "el tapete"],
        ["la lámpara de techo", "ceiling light", 252, 44, "r"], ["el aire acondicionado", "air conditioner", 264, 51, "r"], ["el reloj", "clock", 262, 96, "r"], ["la pared", "wall", 204, 160, "r"], ["la tele", "TV", 257, 150, "r", 0, "el televisor"], ["la planta", "plant", 288, 186, "r"], ["la barra de sonido", "soundbar", 257, 207, "r"], ["la consola", "games console", 237, 231, "r"], ["el mueble de la tele", "TV stand", 276, 248, "r"], ["el mando a distancia", "remote control", 189, 273, "r", 0, "el control remoto"], ["la lámpara de pie", "floor lamp", 288, 252, "r"]] },

    { id: "dormitorio", grp: "home", bg: "#f3eefb", es: "El dormitorio", en: "The bedroom", lvl: "a1", kind: "scene",
      svg: vR(0, 0, 400, 340, "#f3eefb") + vR(0, 266, 400, 74, "#e2d2bd") + vP("M0 266h400", "", "#c7b293", 2) +
        vR(104, 68, 48, 198, "#c9a27a", "#8a6b4a", 4) + vP("M128 68v198", "", "#8a6b4a", 2) + vR(108, 84, 16, 84, "#d6ecfb", "#a9b4bf", 2, 1.5) + vP("M110 92l10-6M110 104l12-8", "", "#fff", 1.5) + vP("M124 178v24M132 178v24", "", "#5b4430", 3.4) +
        vP("M166 56v4", "", "#666", 2) + vP("M166 60q-6 0-6 4M154 76l12-12 12 12z", "", "#555", 2) +
        vR(196, 38, 70, 58, "#d6ecfb", "#fff", 0, 5) + vC(250, 54, 7, "#ffe9a6") + vP("M231 38v58", "", "#fff", 3) +
        vR(162, 146, 100, 56, "#8a5a3c", "#5b3a29", 10) + vR(158, 196, 108, 56, "#7aa5dc", "#4f7cac", 4) + vR(158, 196, 108, 14, "#fff", "#cfd6e0", 2, 1.5) + vR(170, 182, 34, 16, "#fff", "#cfd6e0", 6, 1.5) + vR(218, 182, 34, 16, "#fff", "#cfd6e0", 6, 1.5) + vP("M168 252v12M256 252v12", "", "#5b3a29", 5) +
        vR(270, 210, 28, 56, "#c9a27a", "#8a6b4a", 3) + vP("M270 236h28", "", "#8a6b4a", 2) + vC(284, 229, 1.8, "#5b3a29") + vC(284, 252, 1.8, "#5b3a29") +
        vP("M290 210v-14", "", "#8a6b4a", 3) + vP("M282 196l3-16h10l3 16z", "#f5e3b5", "#c9a86a", 1.5) + vR(272, 200, 12, 10, "#e05a47", "", 3) + vC(278, 205, 3, "#fff") + vP("M278 203v2h1.6", "", "#333", .8) +
        vE(210, 302, 46, 13, "#a98fd6", "#8a6fc0", 1.5),
      items: [["el espejo", "mirror", 116, 128, "l"], ["la percha", "hanger", 166, 70, "l", 0, "el gancho"], ["la cabecera", "headboard", 212, 162, "l"], ["el armario", "wardrobe", 140, 236, "l", 0, "el clóset"], ["la cama", "bed", 162, 242, "l"], ["la alfombra", "rug", 196, 304, "l", 0, "el tapete"],
        ["la ventana", "window", 214, 66, "r"], ["la almohada", "pillow", 236, 190, "r"], ["la sábana", "sheet", 246, 205, "r"], ["el edredón", "duvet", 258, 238, "r", 0, "la cobija"], ["la lámpara", "lamp", 290, 188, "r"], ["el despertador", "alarm clock", 278, 205, "r"], ["el cajón", "drawer", 284, 226, "r"], ["la mesita de noche", "bedside table", 291, 254, "r", 0, "la mesa de noche"]] },

    { id: "bano", grp: "home", bg: "#eaf6f8", es: "El baño", en: "The bathroom", lvl: "a1", kind: "scene",
      svg: vR(0, 0, 400, 340, "#eaf6f8") + vP("M0 120h400M0 170h400M0 220h400M0 270h400M150 100v190M200 100v190M250 100v190", "", "#d3eaee", 1.4) + vR(0, 284, 400, 56, "#cfd9dc") + vP("M0 284h400", "", "#a9b9bd", 2) +
        vP("M112 230V58h22v6", "", "#9aa7b4", 3) + vP("M128 64h16l-2 8h-12z", "#9aa7b4") + vP("M130 78v8M136 78v10M142 78v8M133 92v6M139 92v6", "", "#7cc0e8", 1.6) +
        vP("M104 50h70", "", "#9aa7b4", 3) + vP("M150 52q4 90 0 178h22q-4-88 0-178z", "#f2a8bc", "#d9809a", 1.5) + vP("M157 60v164M164 60v164", "", "#d9809a", 1) +
        vP("M102 230h72v30q0 24-24 24h-24q-24 0-24-24z", "#fff", "#a9b4bf") + vP("M102 236h72", "", "#a9b4bf", 1.5) +
        vR(182, 196, 30, 30, "#fff", "#a9b4bf", 4) + vP("M206 204h-6", "", "#9aa7b4", 3) + vP("M176 228h44q0 26-22 26t-22-26z", "#fff", "#a9b4bf") + vP("M188 254h20l2 30h-24z", "#fff", "#a9b4bf") +
        vC(228, 216, 9, "#fff", "#a9b4bf") + vC(228, 216, 3, "#cfd6e0") + vP("M228 207v-4h-6", "", "#9aa7b4", 2) +
        vP("M220 110h22", "", "#9aa7b4", 3) + vR(222, 110, 18, 46, "#f4a742", "#c97f1d", 2) + vP("M222 146h18", "", "#fff", 2) +
        vR(248, 90, 42, 62, "#d6ecfb", "#9aa7b4", 16, 3) + vP("M258 104l12-10M258 116l18-16", "", "#fff", 2) +
        vP("M240 200h56l-6 16h-44z", "#fff", "#a9b4bf") + vR(262, 216, 12, 68, "#fff", "#a9b4bf") + vP("M268 200v-8h6", "", "#8d97a3", 3) + vR(244, 193, 10, 6, "#f2c94c", "#c9a227", 2, 1) +
        vR(284, 186, 9, 13, "#7fc4e8", "#4f8cff", 2, 1) + vP("M287 186v-12M290 186v-10", "", "#e05a47", 2) +
        vR(114, 298, 56, 12, "#7fb3d6", "#5b8fb8", 3, 1.5),
      items: [["la ducha", "shower", 136, 68, "l"], ["la cortina de baño", "shower curtain", 160, 140, "l", 0, "la cortina de la ducha"], ["la cisterna", "cistern", 196, 210, "l", 0, "el tanque"], ["la bañera", "bathtub", 130, 258, "l", 0, "la tina"], ["el inodoro", "toilet", 196, 238, "l"], ["la alfombrilla", "bath mat", 142, 304, "l", 0, "el tapete de baño"],
        ["la toalla", "towel", 231, 132, "r"], ["el espejo", "mirror", 270, 122, "r"], ["el cepillo de dientes", "toothbrush", 288, 180, "r"], ["el jabón", "soap", 249, 195, "r"], ["el grifo", "tap", 270, 194, "r", 0, "la llave"], ["el lavabo", "washbasin", 268, 208, "r", 0, "el lavamanos"], ["el papel higiénico", "toilet paper", 228, 216, "r"]] },

    { id: "comedor", grp: "home", bg: "#fbf1e6", es: "El comedor", en: "The dining room", lvl: "a1", kind: "scene",
      svg: vR(0, 0, 400, 340, "#fbf1e6") + vR(0, 272, 400, 68, "#c8a77e") + vP("M0 272h400", "", "#a8875e", 2) +
        vP("M200 0v40", "", "#555", 2) + vP("M174 62q2-22 26-22t26 22z", "#2f6f5e", "#1f4f42", 1.5) + vE(200, 63, 8, 4, "#ffe38a") +
        vR(144, 92, 112, 56, "#a8875e", "#7a5a3c", 4) + vR(150, 98, 100, 44, "#c9a27a") + vP("M182 98v44M218 98v44", "", "#7a5a3c", 2) + vC(176, 120, 2, "#5b3a29") + vC(224, 120, 2, "#5b3a29") + vR(170, 78, 12, 14, "#7fc4e8", "#4f8cff", 2, 1) + vP("M176 78q-6-12 0-20M176 78q6-10 2-20", "", "#3e8a4a", 2) + vC(174, 58, 3.4, "#e45b8f") + vC(179, 60, 3, "#f2c94c") +
        vP("M106 140v130M122 140v82M106 142h16M106 160h16M106 178h16M106 196h16M104 222h34M134 222v48", "", "#8a5a3c", 5) + vP("M294 140v130M278 140v82M294 142h-16M294 160h-16M294 178h-16M294 196h-16M296 222h-34M266 222v48", "", "#8a5a3c", 5) +
        vP("M122 178h156l14 28H108z", "#f4f6fb", "#c9cfdb", 1.5) + vP("M108 206h184l-4 30H112z", "#f4f6fb", "#c9cfdb", 1.5) + vP("M120 236v50M280 236v50", "", "#7a5a3c", 7) +
        vE(154, 194, 20, 6.5, "#fff", "#9aa7b4", 1.5) + vE(154, 194, 11, 3.5, "none", "#cfd6e0", 1) + vE(246, 194, 20, 6.5, "#fff", "#9aa7b4", 1.5) + vE(246, 194, 11, 3.5, "none", "#cfd6e0", 1) +
        vP("M128 186l-3 15M126 186v4M130 186v4", "", "#8d97a3", 2) + vP("M178 186l3 15", "", "#8d97a3", 2.6) + vP("M219 187l8 0-6 13h-10z", "#7fb3d6", "#5b8fb8", 1) + vP("M268 186l3 15", "", "#8d97a3", 2.6) + vE(276, 187, 2.4, 3.4, "#8d97a3") + vP("M276 190l2 11", "", "#8d97a3", 2) +
        vP("M156 166h10l-1 18h-8z", "#e7f4fb", "#7fa6c4", 1.2) + vP("M252 166h10l-1 18h-8z", "#e7f4fb", "#7fa6c4", 1.2) +
        vP("M192 160h16v4q4 4 4 12v8h-24v-8q0-8 4-12z", "#d6ecfb", "#7fa6c4", 1.4) + vP("M208 168q6 0 6 6t-6 6", "", "#7fa6c4", 1.6) +
        vC(222, 176, 5, "#e05a47") + vC(231, 174, 5, "#f2c94c") + vC(238, 177, 4.6, "#7fb37a") + vP("M216 178h28l-4 8h-20z", "#c9a27a", "#8a6b4a", 1.2),
      items: [["la lámpara de techo", "ceiling light", 200, 52, "l"], ["el jarrón", "vase", 176, 84, "l", 0, "el florero"], ["las sillas", "chairs", 114, 170, "l"], ["el tenedor", "fork", 127, 194, "l"], ["el plato", "plate", 154, 194, "l"], ["el vaso", "glass", 161, 175, "l"], ["el mantel", "tablecloth", 160, 222, "l"], ["la mesa", "table", 120, 260, "l"],
        ["el aparador", "sideboard", 238, 132, "r"], ["la jarra", "jug", 200, 168, "r"], ["el frutero", "fruit bowl", 230, 182, "r"], ["la servilleta", "napkin", 220, 194, "r"], ["el cuchillo", "knife", 270, 194, "r"], ["la cuchara", "spoon", 277, 199, "r"]] },

    { id: "casa", grp: "home", bg: "#dff0fb", es: "La casa por fuera", en: "Outside the house", lvl: "a2", kind: "scene",
      svg: vR(0, 0, 400, 340, "#dff0fb") + vC(124, 30, 12, "#ffd36b") + vR(0, 270, 400, 70, "#8cc77a") +
        vR(228, 66, 16, 40, "#a9563c", "#7a3a28") + vP("M236 60q-6-8 0-14M242 58q-6-8 0-14", "", "#bbb", 2) +
        vR(112, 120, 150, 150, "#f4e3c4", "#c9a86a") + vP("M100 126L187 62L274 126Z", "#c0563f", "#8f3b2a") +
        vR(126, 138, 34, 30, "#d6ecfb", "#fff", 0, 4) + vR(126, 198, 34, 32, "#d6ecfb", "#fff", 0, 4) + vR(210, 132, 30, 40, "#d6ecfb", "#fff", 0, 4) + vR(202, 168, 46, 4, "#6b4f33") + vP("M204 156v12M212 156v12M220 156v12M228 156v12M236 156v12M244 156v12M204 156h42", "", "#6b4f33", 2) +
        vR(174, 210, 30, 60, "#8a5a3c", "#5b3a29") + vC(198, 242, 2.4, "#f2c94c") + vC(212, 232, 3.4, "#fff", "#555", 1.4) +
        vR(262, 196, 36, 74, "#e8e4dc", "#b9b2a4") + vP("M266 206h28M266 216h28M266 226h28M266 236h28M266 246h28M266 256h28", "", "#c9c2b4", 2) +
        vP("M110 270v-24", "", "#6b4f33", 5) + vC(108, 224, 18, "#5c9c58") + vC(116, 210, 10, "#6fae6a") +
        vP("M176 270h28l18 70h-64z", "#e2cfa8") +
        vP("M100 282h60M222 282h78M100 296h60M222 296h78M106 278v22M118 278v22M130 278v22M142 278v22M154 278v22M228 278v22M240 278v22M252 278v22M264 278v22M276 278v22M288 278v22", "", "#fff", 3) +
        vP("M134 314v-22", "", "#6b4f33", 3) + vR(124, 280, 20, 13, "#e05a47", "#a8392b", 3) + vP("M144 283v-6h4", "", "#a8392b", 2),
      items: [["el tejado", "roof", 150, 100, "l", 0, "el techo"], ["la ventana", "window", 143, 214, "l"], ["el árbol", "tree", 104, 222, "l"], ["la puerta", "door", 189, 242, "l"], ["el buzón", "letterbox", 134, 286, "l"], ["el jardín", "garden", 120, 322, "l"],
        ["la chimenea", "chimney", 236, 84, "r"], ["el balcón", "balcony", 226, 164, "r"], ["la pared", "wall", 252, 196, "r"], ["el timbre", "doorbell", 212, 232, "r"], ["el garaje", "garage", 282, 232, "r"], ["la valla", "fence", 270, 289, "r", 0, "la cerca"], ["el camino", "path", 196, 316, "r", 0, "el caminito"]] },
    { id: "bici", grp: "move", bg: "#eef6ee", es: "La bicicleta", en: "Parts of a bicycle", lvl: "a2", kind: "scene",
      svg: vR(0, 0, 400, 340, "#eef6ee") + vR(0, 282, 400, 58, "#cfd8c4") +
        [142, 258].map((x) => vC(x, 240, 40, "none", "#2b2b2b", 7) + vC(x, 240, 34, "none", "#9aa1ab", 2) + vP([0, 30, 60, 90, 120, 150].map((a) => { const r = a * Math.PI / 180; return "M" + (x + 33 * Math.cos(r)).toFixed(1) + " " + (240 + 33 * Math.sin(r)).toFixed(1) + "L" + (x - 33 * Math.cos(r)).toFixed(1) + " " + (240 - 33 * Math.sin(r)).toFixed(1); }).join(""), "", "#b8bec6", 1) + vC(x, 240, 4, "#666")).join("") +
        vP("M102 232q4-44 48-44", "", "#4a8f4a", 4) + vP("M112 190h52M120 190l20 50M160 190l-18 50", "", "#555", 3) +
        vP("M142 240L196 242L180 174M142 240L180 174M180 174L244 176M196 242L244 182", "", "#2f8f6f", 6) + vP("M244 170L258 240", "", "#2f8f6f", 5) +
        vP("M180 174l-4-12", "", "#555", 3.4) + vP("M164 160q12-6 26 0q-2 6-12 6q-10 0-14-6z", "#2b2b2b") +
        vP("M244 170l-2-14l14-2M238 156h4", "", "#555", 3.4) + vP("M256 154l10 2", "", "#2b2b2b", 5) + vP("M254 160l8 6", "", "#555", 2.2) + vC(236, 152, 4, "#f2c94c", "#c9a227", 1) +
        vR(256, 164, 12, 8, "#fff7c0", "#999", 2, 1.2) + vP("M268 168h8", "", "#fff3a0", 2) + vR(112, 184, 6, 10, "#e05a47", "", 1) +
        vC(196, 242, 13, "none", "#555", 3) + vC(142, 240, 6, "none", "#555", 2) + vP("M142 234L196 229M142 246L196 255", "", "#333", 1.6) + vP("M196 242L212 262", "", "#555", 4) + vR(204, 260, 18, 5, "#2b2b2b", "", 1),
      items: [["el sillín", "saddle", 178, 162, "l", 0, "el asiento"], ["el portabultos", "rack", 130, 190, "l", 0, "la parrilla"], ["el guardabarros", "mudguard", 106, 214, "l", 0, "el guardafango"], ["el piñón", "rear sprocket", 142, 240, "l"], ["los radios", "spokes", 160, 260, "l", 0, "los rayos"], ["el neumático", "tyre", 102, 250, "l", 0, "la llanta"], ["la rueda", "wheel", 130, 276, "l"], ["la cadena", "chain", 170, 250, "l"],
        ["el timbre", "bell", 236, 152, "r"], ["el manillar", "handlebars", 250, 155, "r", 0, "el manubrio"], ["el freno", "brake lever", 260, 164, "r"], ["la luz", "light", 270, 168, "r"], ["el cuadro", "frame", 220, 210, "r", 0, "el marco"], ["la horquilla", "fork", 252, 210, "r", 0, "la horquilla"], ["el plato", "chainring", 205, 236, "r"], ["el pedal", "pedal", 214, 262, "r"]] },

    { id: "coche", grp: "move", bg: "#eef2f8", es: "El coche", en: "Parts of a car", lvl: "a2", kind: "scene",
      svg: vR(0, 0, 400, 340, "#eef2f8") + vR(0, 282, 400, 58, "#9aa1ab") + vP("M0 312h400", "", "#fff", 3) +
        vP("M104 262V230Q106 214 124 210L156 206L178 178Q184 170 196 170H244Q254 170 262 180L278 204L290 208Q298 212 298 228V262Z", "#e05a47", "#a8392b") +
        vP("M182 178Q186 174 196 174H218V204H162Z", "#cfe8fb", "#7a2a20", 1.5) + vP("M222 174H244Q250 174 256 182L270 204H222Z", "#cfe8fb", "#7a2a20", 1.5) + vP("M264 184L280 206", "", "#bfe2f8", 5) +
        vP("M220 174v88M162 206v56M266 206v56", "", "#a8392b", 1.6) + vR(196, 212, 14, 4, "#7a2a20", "", 2) + vR(244, 212, 14, 4, "#7a2a20", "", 2) +
        vP("M264 196l8-2v8h-6z", "#2b2b2b") + vP("M272 202l12-6", "", "#2b2b2b", 2) + vP("M104 216h10v10h-10z", "#b31d1d") + vP("M288 212h10v8h-8z", "#fff3a0", "#c9a227", 1) +
        vR(98, 242, 22, 10, "#3b3f47", "", 3) + vR(282, 242, 20, 10, "#3b3f47", "", 3) + vR(124, 222, 8, 8, "#a8392b", "#7a2a20", 4, 1) + vP("M98 258h-8", "", "#666", 4) +
        vP("M286 208q-14-4-24-4", "", "#a8392b", 1.4) + vP("M118 210q14-2 38-4", "", "#a8392b", 1.4) +
        [140, 260].map((x) => vC(x, 262, 20, "#2b2b2b") + vC(x, 262, 10, "#c4ccd5") + vC(x, 262, 3, "#666")).join(""),
      items: [["el maletero", "boot", 124, 212, "l", 0, "la cajuela"], ["la luz trasera", "rear light", 108, 220, "l"], ["el tapón de gasolina", "fuel cap", 128, 226, "l", 0, "la tapa de gasolina"], ["el tubo de escape", "exhaust pipe", 94, 258, "l", 0, "el escape"], ["la ventanilla", "side window", 194, 190, "l"], ["la puerta", "door", 186, 240, "l"], ["la rueda", "wheel", 140, 270, "l"],
        ["el techo", "roof", 230, 171, "r"], ["el parabrisas", "windscreen", 272, 194, "r"], ["el retrovisor", "wing mirror", 267, 198, "r", 0, "el espejo lateral"], ["el limpiaparabrisas", "windscreen wiper", 278, 199, "r"], ["el capó", "bonnet", 283, 207, "r", 0, "el cofre"], ["la manija", "door handle", 251, 214, "r"], ["el faro", "headlight", 293, 216, "r"], ["el parachoques", "bumper", 292, 247, "r", 0, "la defensa"], ["el neumático", "tyre", 279, 266, "r", 0, "la llanta"]] },
    { id: "ropa", grp: "clothes", es: "La ropa", en: "Clothes", lvl: "a1", kind: "grid",
      items: [["la camisa", "shirt", '<path d="M26 14l-12 8 4 14 6-3v34h32V33l6 3 4-14-12-8-6 6h-16z" fill="#cfe2f8" stroke="#4f7cac" stroke-width="2.4"/><path d="M34 14l6 10 6-10" fill="none" stroke="#4f7cac" stroke-width="2.4"/><path d="M40 24v42" stroke="#4f7cac" stroke-width="1.6"/><circle cx="43" cy="34" r="1.5" fill="#4f7cac"/><circle cx="43" cy="46" r="1.5" fill="#4f7cac"/><circle cx="43" cy="58" r="1.5" fill="#4f7cac"/>'],
        ["la camiseta", "T-shirt", '<path d="M26 16l-14 10 6 12 8-4v32h28V34l8 4 6-12-14-10q-6 8-14 8t-14-8z" fill="#ff8a6b" stroke="#c4502f" stroke-width="2.4"/>'],
        ["el jersey", "jumper", '<path d="M26 14l-14 10v40h10V32l4 2v34h28V34l4-2v32h10V24l-14-10q-6 6-14 6t-14-6z" fill="#7fb37a" stroke="#3e7a3b" stroke-width="2.4"/><path d="M22 60h-10M68 60h-10M26 64h28" stroke="#3e7a3b" stroke-width="2"/>', "el suéter"],
        ["la chaqueta", "jacket", '<path d="M24 14l-12 10v42h12V30l2 38h12V20zM56 14l12 10v42H56V30l-2 38H42V20z" fill="#8a6b4a" stroke="#5b4430" stroke-width="2.4"/><path d="M38 20l-6 18M42 20l6 18" stroke="#5b4430" stroke-width="2"/>'],
        ["el abrigo", "coat", '<path d="M26 10l-14 10 4 52h48l4-52-14-10-10 10z" fill="#4a5568" stroke="#2d3748" stroke-width="2.4"/><path d="M40 20v52" stroke="#2d3748" stroke-width="2"/><circle cx="35" cy="34" r="2" fill="#e2e8f0"/><circle cx="35" cy="48" r="2" fill="#e2e8f0"/><circle cx="35" cy="62" r="2" fill="#e2e8f0"/>'],
        ["el vestido", "dress", '<path d="M32 10h16l-2 14 6 12 12 34H16l12-34 6-12z" fill="#e45b8f" stroke="#a8325f" stroke-width="2.4"/><path d="M28 36h24" stroke="#a8325f" stroke-width="2"/>'],
        ["la falda", "skirt", '<path d="M26 22h28l12 46H14z" fill="#9b6bff" stroke="#6a3fd8" stroke-width="2.4"/><path d="M26 28h28M32 30l-6 38M40 30v38M48 30l6 38" stroke="#6a3fd8" stroke-width="1.6"/>'],
        ["los pantalones", "trousers", '<path d="M24 12h32l4 60H46l-6-40-6 40H20z" fill="#2f3a56" stroke="#1d253a" stroke-width="2.4"/><path d="M24 20h32" stroke="#1d253a" stroke-width="2"/>'],
        ["los vaqueros", "jeans", '<path d="M24 12h32l4 60H46l-6-40-6 40H20z" fill="#5b8fd1" stroke="#2f5fa0" stroke-width="2.4"/><path d="M24 20h32M30 26q4 6 8 0M42 26q4 6 8 0" stroke="#f2c94c" stroke-width="1.6" fill="none"/>', "los jeans"],
        ["los pantalones cortos", "shorts", '<path d="M22 22h36l4 34H46l-6-18-6 18H18z" fill="#f2c94c" stroke="#b8901e" stroke-width="2.4"/><path d="M22 30h36" stroke="#b8901e" stroke-width="2"/>', "el short"],
        ["los calcetines", "socks", '<path d="M22 12h12v34l10 10q4 6-4 10-6 2-10-4L22 50zM46 12h12v34l10 10q4 6-4 10-6 2-10-4L46 50z" fill="#fff" stroke="#e05a47" stroke-width="2.4"/><path d="M22 18h12M46 18h12" stroke="#e05a47" stroke-width="3"/>', "las medias"],
        ["los zapatos", "shoes", '<path d="M10 52q2-12 12-12l8 4q14 4 22 4 6 0 6 8v4H10zM40 40q2-10 10-10l8 4q12 4 18 4v18H58" fill="#5b4430" stroke="#3a2a1d" stroke-width="2.4"/>'],
        ["las zapatillas de deporte", "trainers", '<path d="M10 50q4-16 14-16l6 6q12 6 26 6 10 0 12 8v6H10z" fill="#fff" stroke="#4f8cff" stroke-width="2.4"/><path d="M10 56h58" stroke="#4f8cff" stroke-width="5"/><path d="M28 40l4 6M34 38l4 6M40 40l4 6" stroke="#4f8cff" stroke-width="2"/>', "los tenis"],
        ["las botas", "boots", '<path d="M18 12h18v40l18 6q6 2 6 10v4H18zM44 12h14v40l12 6" fill="#8a5a3c" stroke="#5b3a29" stroke-width="2.4"/><path d="M18 64h42" stroke="#3a2a1d" stroke-width="4"/>'],
        ["el pijama", "pyjamas", '<path d="M26 10l-12 8 4 12 6-2v22h32V28l6 2 4-12-12-8-6 6h-16z" fill="#bfe0f5" stroke="#4f7cac" stroke-width="2"/><path d="M26 50h28l2 22H44l-4-14-4 14H24z" fill="#bfe0f5" stroke="#4f7cac" stroke-width="2"/><circle cx="34" cy="22" r="2" fill="#f2c94c"/><circle cx="46" cy="34" r="2" fill="#f2c94c"/><circle cx="34" cy="62" r="2" fill="#f2c94c"/>'],
        ["el bañador", "swimsuit", '<path d="M28 12h6l6 14 6-14h6l-2 18q8 8 4 22l-8 16H30l-8-16q-4-14 4-22z" fill="#2bb3a3" stroke="#0f7f86" stroke-width="2.4"/>', "el traje de baño"]] },

    { id: "accesorios", grp: "clothes", es: "Los accesorios", en: "Accessories", lvl: "a2", kind: "grid",
      items: [["la gorra", "cap", '<path d="M14 46q0-28 26-28t26 28z" fill="#e05a47" stroke="#a8392b" stroke-width="2.4"/><path d="M40 46h32q4 4 0 8H40z" fill="#c4473a" stroke="#a8392b" stroke-width="2.4"/><circle cx="40" cy="18" r="3" fill="#a8392b"/>'],
        ["el sombrero", "hat", '<ellipse cx="40" cy="52" rx="32" ry="9" fill="#d9b26f" stroke="#a07c3c" stroke-width="2.4"/><path d="M24 50q0-30 16-30t16 30z" fill="#e6c588" stroke="#a07c3c" stroke-width="2.4"/><path d="M24 44h32" stroke="#5b4430" stroke-width="5"/>'],
        ["las gafas", "glasses", '<circle cx="24" cy="42" r="12" fill="#e9f5ff" stroke="#1d253a" stroke-width="3.4"/><circle cx="56" cy="42" r="12" fill="#e9f5ff" stroke="#1d253a" stroke-width="3.4"/><path d="M36 40q4-4 8 0M12 38l-6-6M68 38l6-6" stroke="#1d253a" stroke-width="3" fill="none"/>', "los lentes"],
        ["las gafas de sol", "sunglasses", '<path d="M10 36h26q0 18-13 18T10 36zM44 36h26q0 18-13 18T44 36z" fill="#2d3748" stroke="#111" stroke-width="2.4"/><path d="M36 38h8M10 36l-4-4M70 36l4-4" stroke="#111" stroke-width="3"/>', "los lentes de sol"],
        ["la bufanda", "scarf", '<path d="M22 18q18 10 36 0v12q-18 10-36 0z" fill="#e45b8f" stroke="#a8325f" stroke-width="2.4"/><path d="M44 30v38h12V26" fill="#e45b8f" stroke="#a8325f" stroke-width="2.4"/><path d="M44 64h12M47 68v6M53 68v6" stroke="#a8325f" stroke-width="2"/>'],
        ["los guantes", "gloves", '<path d="M16 66V38l-4-10q2-4 6-1l4 8V18q0-4 4-4t4 4v14V14q0-4 4-4t4 4v18-14q0-4 4-4t4 4v28q0 10-6 14v10z" fill="#7fb37a" stroke="#3e7a3b" stroke-width="2.4"/><path d="M18 60h26" stroke="#3e7a3b" stroke-width="3"/>'],
        ["el cinturón", "belt", '<path d="M6 34h68v12H6z" fill="#8a5a3c" stroke="#5b3a29" stroke-width="2.4"/><rect x="30" y="29" width="18" height="22" rx="3" fill="none" stroke="#d9b26f" stroke-width="4"/><path d="M39 40h8" stroke="#d9b26f" stroke-width="3"/><circle cx="60" cy="40" r="2" fill="#3a2a1d"/><circle cx="68" cy="40" r="2" fill="#3a2a1d"/>'],
        ["el reloj", "watch", '<path d="M32 8h16v18H32zM32 54h16v18H32z" fill="#5b4430"/><circle cx="40" cy="40" r="16" fill="#fff" stroke="#9aa1ab" stroke-width="4"/><path d="M40 30v10l7 5" stroke="#1d253a" stroke-width="2.4" stroke-linecap="round"/>'],
        ["el bolso", "handbag", '<path d="M14 34h52l-4 34H18z" fill="#c0563f" stroke="#8f3b2a" stroke-width="2.4"/><path d="M28 34q0-18 12-18t12 18" fill="none" stroke="#8f3b2a" stroke-width="3"/><path d="M36 44h8v6h-8z" fill="#f2c94c"/>', "la cartera"],
        ["la mochila", "backpack", '<rect x="18" y="16" width="44" height="54" rx="14" fill="#4f8cff" stroke="#2f5fd0" stroke-width="2.4"/><path d="M24 44h32v20H24z" fill="#3a74e0" stroke="#2f5fd0" stroke-width="2"/><path d="M32 16q0-8 8-8t8 8" fill="none" stroke="#2f5fd0" stroke-width="3"/><path d="M34 52h12" stroke="#fff" stroke-width="2"/>'],
        ["la cartera", "wallet", '<rect x="12" y="24" width="56" height="36" rx="5" fill="#5b4430" stroke="#3a2a1d" stroke-width="2.4"/><path d="M44 34h24v16H44z" fill="#6f5640" stroke="#3a2a1d" stroke-width="2"/><circle cx="52" cy="42" r="2.5" fill="#d9b26f"/>', "la billetera"],
        ["el collar", "necklace", '<path d="M18 18q22 44 44 0" fill="none" stroke="#d9b26f" stroke-width="3"/><circle cx="40" cy="52" r="7" fill="#e45b8f" stroke="#d9b26f" stroke-width="2.4"/><circle cx="26" cy="36" r="2.5" fill="#fff" stroke="#d9b26f"/><circle cx="54" cy="36" r="2.5" fill="#fff" stroke="#d9b26f"/>'],
        ["los pendientes", "earrings", '<path d="M26 14q-6 0-6 6" fill="none" stroke="#d9b26f" stroke-width="2.4"/><path d="M54 14q-6 0-6 6" fill="none" stroke="#d9b26f" stroke-width="2.4"/><path d="M20 20l-6 26h12zM48 20l-6 26h12z" fill="#7fc4e8" stroke="#d9b26f" stroke-width="2.4"/>', "los aretes"],
        ["el anillo", "ring", '<circle cx="40" cy="46" r="16" fill="none" stroke="#d9b26f" stroke-width="6"/><path d="M34 26l6-10 6 10-6 6z" fill="#cfe8fb" stroke="#7fa6c4" stroke-width="2"/>'],
        ["la corbata", "tie", '<path d="M34 10h12l-2 10 8 40-12 14-12-14 8-40z" fill="#c0563f" stroke="#8f3b2a" stroke-width="2.4"/><path d="M36 30l10 6M34 44l12 6" stroke="#f2c94c" stroke-width="2"/>'],
        ["el paraguas", "umbrella", '<path d="M8 40q0-28 32-28t32 28q-6-6-12 0-6-6-10 0-5-6-10 0-5-6-10 0-6-6-12 0-6-6-10 0z" fill="#9b6bff" stroke="#6a3fd8" stroke-width="2.4"/><path d="M40 40v26q0 6-6 6t-6-6" fill="none" stroke="#3a2a1d" stroke-width="3"/>', "la sombrilla"]] },
    { id: "frutas", grp: "food", es: "Las frutas", en: "Fruit", lvl: "a1", kind: "grid",
      items: [["la manzana", "apple", vP("M40 26c-14-8-28 2-26 20 2 18 14 26 26 22 12 4 24-4 26-22 2-18-12-28-26-20z", "#e0463c", "#a52d26") + vP("M40 26q0-10 6-14", "", "#6b4f33", 3) + vP("M44 18q10-6 14 2-10 4-14-2z", "#5ca04e")],
        ["el plátano", "banana", vP("M18 22q-4 30 18 42 22 10 34-4-22 6-36-10-8-12-6-26z", "#f5d142", "#b8981e") + vP("M18 22l-2-6", "", "#6b4f33", 3), "la banana"],
        ["la naranja", "orange", vC(40, 44, 24, "#f59a2c", "#c26d10") + vP("M40 20q2-6 8-6", "", "#6b4f33", 3) + vP("M42 18q10-6 14 2-10 4-14-2z", "#5ca04e") + '<circle cx="32" cy="38" r="2" fill="#fbc77a"/><circle cx="48" cy="50" r="2" fill="#fbc77a"/>'],
        ["el limón", "lemon", vE(40, 42, 26, 18, "#f3e040", "#b8a51e") + vP("M14 42l-4 0M66 42l4 0", "", "#b8a51e", 4)],
        ["la fresa", "strawberry", vP("M20 30q20-8 40 0 2 22-20 38-22-16-20-38z", "#e5383b", "#a5262a") + vP("M24 28l8-8 8 6 8-6 8 8z", "#3e8a4a") + '<g fill="#ffe38a"><circle cx="32" cy="40" r="1.5"/><circle cx="46" cy="38" r="1.5"/><circle cx="40" cy="50" r="1.5"/><circle cx="30" cy="52" r="1.5"/><circle cx="50" cy="50" r="1.5"/></g>'],
        ["las uvas", "grapes", [[32, 28], [46, 28], [26, 40], [40, 40], [54, 40], [32, 52], [46, 52], [40, 64]].map(([x, y]) => vC(x, y, 7.5, "#7b4ba8", "#54307a", 1.5)).join("") + vP("M40 20q0-8 6-10", "", "#6b4f33", 3) + vP("M42 16q12-6 16 4-12 4-16-4z", "#5ca04e")],
        ["la sandía", "watermelon", vP("M8 30h64q-2 34-32 34T8 30z", "#3f9b4a") + vP("M13 30h54q-2 27-27 27T13 30z", "#ef4b5a") + '<g fill="#222"><ellipse cx="30" cy="40" rx="1.6" ry="2.6"/><ellipse cx="40" cy="46" rx="1.6" ry="2.6"/><ellipse cx="50" cy="40" rx="1.6" ry="2.6"/><ellipse cx="36" cy="36" rx="1.6" ry="2.6"/><ellipse cx="46" cy="36" rx="1.6" ry="2.6"/></g>'],
        ["el melón", "melon", vE(40, 44, 28, 22, "#d9e48a", "#9aa63e") + vP("M18 34q22 12 44 0M14 46q26 10 52 0M20 58q20 6 40 0", "", "#b6c25a", 1.6)],
        ["la piña", "pineapple", vE(40, 52, 16, 22, "#e8a93a", "#b27318") + vP("M28 40l24 24M28 56l16 16M36 32l20 20M52 40l-24 24M52 56L36 72M44 32L24 52", "", "#b27318", 1.4) + vP("M40 30l-10-20 8 8 2-14 2 14 8-8z", "#3e8a4a")],
        ["el mango", "mango", vP("M22 50c-4-20 16-34 32-28 14 6 14 28-2 38-14 8-28 4-30-10z", "#f5a623", "#c27a10") + vP("M54 22q12-4 16 4", "", "#3e8a4a", 4) + '<path d="M28 38q6-8 18-10" stroke="#ffcf6e" stroke-width="3" fill="none" stroke-linecap="round"/>'],
        ["la pera", "pear", vP("M40 16c-8 0-8 14-10 20-4 8-12 12-10 24 2 10 12 12 20 12s18-2 20-12c2-12-6-16-10-24-2-6-2-20-10-20z", "#b5d048", "#7d9628") + vP("M40 16q0-6 4-8", "", "#6b4f33", 3)],
        ["el melocotón", "peach", vC(40, 46, 22, "#f9a77b", "#d07448") + vP("M40 26q-6 18 0 40", "", "#d07448", 1.6) + vP("M42 24q10-8 16 0-10 4-16 0z", "#5ca04e"), "el durazno"],
        ["la cereza", "cherries", vC(28, 56, 10, "#c1121f", "#80080f") + vC(52, 56, 10, "#c1121f", "#80080f") + vP("M28 46q6-20 16-32M52 46q-2-20-8-32", "", "#3e7a3b", 2.4) + vP("M44 14q10-4 14 4-10 3-14-4z", "#5ca04e")],
        ["el kiwi", "kiwi", vC(40, 42, 24, "#8a6b3c") + vC(40, 42, 20, "#8cc63f") + vC(40, 42, 7, "#f4f7d8") + '<g fill="#222">' + [0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const r = a * Math.PI / 180; return '<circle cx="' + (40 + 11 * Math.cos(r)).toFixed(1) + '" cy="' + (42 + 11 * Math.sin(r)).toFixed(1) + '" r="1.4"/>'; }).join("") + "</g>"],
        ["el coco", "coconut", vC(40, 44, 24, "#7a5233", "#4d3220") + vC(32, 38, 2.6, "#3a2414") + vC(44, 36, 2.6, "#3a2414") + vC(38, 46, 2.6, "#3a2414") + vP("M24 30q4 4 2 10M56 54q-6 2-8 8", "", "#9a7050", 1.6)],
        ["la papaya", "papaya", vE(40, 42, 18, 28, "#f28c38", "#3e8a4a", 3) + vE(40, 46, 8, 14, "#7a3a1a") + '<g fill="#222"><circle cx="37" cy="40" r="1.6"/><circle cx="43" cy="44" r="1.6"/><circle cx="38" cy="50" r="1.6"/><circle cx="42" cy="54" r="1.6"/></g>']] },

    { id: "verduras", grp: "food", es: "Las verduras", en: "Vegetables", lvl: "a1", kind: "grid",
      items: [["el tomate", "tomato", vC(40, 46, 22, "#e5383b", "#a5262a") + vP("M30 26l10 6 10-6-4 8 8 2-14 2-14-2 8-2z", "#3e8a4a")],
        ["la zanahoria", "carrot", vP("M50 22L18 66q-2 4 2 2l40-34q-2-10-10-12z", "#f28c28", "#c2650e") + vP("M28 52l6 2M36 42l6 2M44 32l6 2", "", "#c2650e", 1.6) + vP("M54 22q2-12 10-14M56 26q8-8 16-6M52 22q-6-10-2-16", "", "#3e8a4a", 3)],
        ["la patata", "potato", vP("M14 44c0-14 14-22 30-20 16 2 24 12 22 24-2 12-16 18-30 16-14-2-22-8-22-20z", "#c8a165", "#8a6a37") + '<g fill="#8a6a37"><circle cx="30" cy="38" r="1.6"/><circle cx="48" cy="34" r="1.6"/><circle cx="44" cy="52" r="1.6"/></g>', "la papa"],
        ["la cebolla", "onion", vP("M40 18c-6 10-24 16-24 34 0 12 10 18 24 18s24-6 24-18c0-18-18-24-24-34z", "#c98b5a", "#8a5530") + vP("M40 22q-12 20 0 46M40 22q12 20 0 46", "", "#8a5530", 1.4) + vP("M36 70l-2 4M44 70l2 4", "", "#8a5530", 2)],
        ["el ajo", "garlic", vP("M40 14c-4 10-22 18-22 34 0 12 10 20 22 20s22-8 22-20c0-16-18-24-22-34z", "#f4efe2", "#b9ad8e") + vP("M40 24q-10 16-4 42M40 24q10 16 4 42", "", "#b9ad8e", 1.4)],
        ["la lechuga", "lettuce", vC(40, 46, 24, "#8cc63f", "#5a8f1e") + vP("M22 40q10-14 20-2 8-14 18 0M24 54q10-10 16 0 8-12 16 0", "", "#5a8f1e", 2) + vC(40, 48, 6, "#c7e58a")],
        ["el pepino", "cucumber", '<rect x="10" y="32" width="60" height="18" rx="9" fill="#3f8f3a" stroke="#2b6a27" stroke-width="2.4" transform="rotate(-20 40 41)"/>' + '<g fill="#a8d88a" transform="rotate(-20 40 41)"><circle cx="22" cy="38" r="1.4"/><circle cx="34" cy="44" r="1.4"/><circle cx="46" cy="38" r="1.4"/><circle cx="58" cy="44" r="1.4"/></g>'],
        ["el pimiento", "pepper", vP("M24 30c-6 14-4 34 6 38 6 2 8-4 10-4s4 6 10 4c10-4 12-24 6-38-6-6-26-6-32 0z", "#e5383b", "#a5262a") + vP("M40 28v-12h6", "", "#3e8a4a", 4), "el pimentón"],
        ["el brócoli", "broccoli", vP("M34 46h12l4 26H30z", "#8fc06a", "#5a8f1e") + vC(28, 36, 12, "#3e8a4a") + vC(52, 36, 12, "#3e8a4a") + vC(40, 26, 13, "#4f9a52") + vC(40, 42, 10, "#3e8a4a")],
        ["el maíz", "corn", vE(40, 40, 12, 26, "#f6cf3a", "#c49a12") + '<g stroke="#c49a12" stroke-width="1.2"><path d="M30 28h20M28 38h24M28 48h24M30 58h20M40 16v48"/></g>' + vP("M28 52q-12-10-8-34 6 18 12 26M52 52q12-10 8-34-6 18-12 26", "#6fae4a", "#3e7a3b", 1.4)],
        ["la berenjena", "aubergine", vP("M46 24c-10 2-30 18-30 34 0 10 8 14 16 12 12-2 26-24 26-36-2-6-6-10-12-10z", "#5b2a6e", "#3b1a4a") + vP("M46 24q6-4 10 2 4-6 10-2-4 6-10 8-8-2-10-8z", "#3e8a4a") + vP("M58 22l6-8", "", "#3e8a4a", 3), "la berenjena"],
        ["el calabacín", "courgette", '<rect x="8" y="33" width="64" height="16" rx="8" fill="#5c9c42" stroke="#36702a" stroke-width="2.4" transform="rotate(20 40 41)"/>' + '<path d="M14 30l-4-4" stroke="#6b4f33" stroke-width="3" transform="rotate(20 40 41)"/>', "la calabacita"],
        ["la calabaza", "pumpkin", vE(40, 48, 28, 22, "#f28c28", "#c2650e") + vP("M40 26q-12 22 0 44M40 26q12 22 0 44M24 32q-8 16 0 32M56 32q8 16 0 32", "", "#c2650e", 1.6) + vP("M40 28v-12q4 0 6 4", "", "#5a8f1e", 4)],
        ["los guisantes", "peas", vP("M10 44q30-26 60 0-30 18-60 0z", "#6fae4a", "#3e7a3b") + [22, 34, 46, 58].map((x) => vC(x, 44, 5.5, "#9bd36a", "#5a8f1e", 1.2)).join(""), "las arvejas"],
        ["las judías verdes", "green beans", vP("M14 24q24 10 52 40M18 18q26 10 54 38M12 32q22 12 48 38", "", "#5c9c42", 5.4), "las habichuelas"],
        ["la seta", "mushroom", vP("M12 42q0-24 28-24t28 24z", "#c98b5a", "#8a5530") + vR(32, 42, 16, 26, "#f4efe2", "#b9ad8e", 4) + '<g fill="#f4efe2"><circle cx="28" cy="30" r="3"/><circle cx="46" cy="26" r="3"/><circle cx="56" cy="36" r="2.4"/></g>', "el champiñón"],
        ["el aguacate", "avocado", vP("M40 12c-14 0-24 26-24 38 0 12 10 20 24 20s24-8 24-20c0-12-10-38-24-38z", "#3f6e2a") + vP("M40 18c-10 0-18 22-18 32 0 10 8 15 18 15s18-5 18-15c0-10-8-32-18-32z", "#d6e68a") + vC(40, 50, 9, "#8a5a3c")]] },

    { id: "menaje", grp: "food", es: "El menaje de cocina", en: "Cookware & kitchen tools", lvl: "a2", kind: "grid",
      items: [["la sartén", "frying pan", vE(32, 44, 24, 12, "#3b3f47", "#22252b") + vE(32, 42, 18, 8, "#555a63") + vP("M56 42h18", "", "#8a5a3c", 6)],
        ["la olla", "saucepan", vR(16, 34, 48, 30, "#9aa1ab", "#6b7480", 4) + vR(12, 30, 56, 6, "#6b7480", "", 3) + vR(34, 22, 12, 8, "#3b3f47", "", 3) + vP("M10 44h6M64 44h6", "", "#3b3f47", 5), "la olla"],
        ["el cazo", "small pan", vR(14, 36, 34, 24, "#c4ccd5", "#6b7480", 4) + vP("M48 42h24", "", "#3b3f47", 6), "la cacerola"],
        ["la tapa", "lid", vP("M12 48q28-30 56 0z", "#c4ccd5", "#6b7480") + vR(34, 26, 12, 6, "#3b3f47", "", 3) + vP("M10 50h60", "", "#6b7480", 3)],
        ["la espátula", "spatula", vR(30, 12, 20, 26, "#3b3f47", "", 4) + vP("M34 18v14M40 18v14M46 18v14", "", "#666", 2) + vP("M40 38v34", "", "#8a5a3c", 6)],
        ["el cucharón", "ladle", vP("M22 50q0 16 14 16t14-16z", "#c4ccd5", "#6b7480") + vP("M48 50q4-30 12-40", "", "#6b7480", 4)],
        ["la tabla de cortar", "chopping board", vR(10, 22, 56, 40, "#d9b26f", "#a07c3c", 6) + vC(58, 30, 3, "#fdf6ec") + vP("M18 54h28", "", "#c49a52", 2)],
        ["el cuchillo de cocina", "kitchen knife", vP("M8 48L52 30q6 2 4 8L12 52z", "#d8dee6", "#8d97a3") + vP("M52 36l20-8", "", "#2b2b2b", 8)],
        ["el pelador", "peeler", vR(14, 44, 30, 10, "#4f8cff", "", 5) + vP("M44 49h8M52 40h18v18H52z", "", "#8d97a3", 2.4) + vP("M56 49h10", "", "#555", 1.6)],
        ["el rallador", "grater", vP("M24 18h32l6 52H18z", "#d8dee6", "#8d97a3") + vR(30, 10, 20, 8, "#2b2b2b", "", 3) + '<g fill="#8d97a3"><circle cx="32" cy="32" r="2"/><circle cx="44" cy="32" r="2"/><circle cx="30" cy="46" r="2"/><circle cx="44" cy="46" r="2"/><circle cx="36" cy="58" r="2"/><circle cx="48" cy="58" r="2"/></g>'],
        ["el colador", "colander", vP("M12 34h56q0 28-28 28T12 34z", "#e05a47", "#a8392b") + vP("M8 34h64", "", "#a8392b", 4) + '<g fill="#fff"><circle cx="28" cy="42" r="2"/><circle cx="40" cy="44" r="2"/><circle cx="52" cy="42" r="2"/><circle cx="34" cy="52" r="2"/><circle cx="46" cy="52" r="2"/></g>'],
        ["las varillas", "whisk", vP("M40 72V48", "", "#2b2b2b", 6) + vP("M40 48q-18-20 0-38 18 18 0 38M40 48q-8-20 0-38 8 18 0 38", "", "#8d97a3", 2), "el batidor"],
        ["el abrelatas", "can opener", vP("M16 60l26-26", "", "#e05a47", 7) + vP("M48 64l-14-14", "", "#e05a47", 7) + vC(42, 34, 9, "#c4ccd5", "#6b7480") + vC(42, 34, 3, "#6b7480")],
        ["el rodillo", "rolling pin", vR(18, 34, 44, 16, "#d9b26f", "#a07c3c", 6) + vP("M6 42h12M62 42h12", "", "#a07c3c", 6)],
        ["la bandeja de horno", "baking tray", vP("M8 38h64l-6 18H14z", "#9aa1ab", "#6b7480") + vE(28, 36, 7, 3, "#d9a05b") + vE(44, 34, 7, 3, "#d9a05b") + vE(56, 37, 6, 3, "#d9a05b")],
        ["la manopla", "oven glove", vP("M22 66V30q0-14 14-14t14 14v10l6-6q6-2 8 4L50 54v12z", "#e05a47", "#a8392b") + vR(20, 62, 32, 8, "#fff", "#a8392b", 2)],
        ["la tostadora", "toaster", vR(14, 30, 52, 34, "#c4ccd5", "#6b7480", 10) + vR(24, 22, 12, 12, "#d9a05b", "#a8742c", 2) + vR(44, 22, 12, 12, "#d9a05b", "#a8742c", 2) + vR(60, 40, 6, 10, "#3b3f47", "", 2)],
        ["la cafetera", "coffee maker", vP("M26 12h28l-4 20 6 32H24l6-32z", "#3b3f47", "#22252b") + vR(30, 30, 20, 4, "#9aa1ab") + vP("M54 22q10 0 10 10t-8 10", "", "#22252b", 3)],
        ["el hervidor", "kettle", vP("M20 66l6-38q14-6 28 0l6 38z", "#4f8cff", "#2f5fd0") + vP("M26 28q14-16 28 0", "", "#2f5fd0", 4) + vP("M20 40l-10-6", "", "#2f5fd0", 5) + vR(18, 64, 44, 6, "#3b3f47", "", 2), "la tetera eléctrica"],
        ["la batidora", "blender", vP("M24 14h32l-4 34H28z", "#cfe8fb", "#7fa6c4") + vP("M32 40l8-4 8 4", "", "#8d97a3", 2) + vR(22, 48, 36, 18, "#3b3f47", "", 4) + vC(40, 57, 4, "#9aa1ab"), "la licuadora"]] },

    { id: "vajilla", grp: "food", es: "La vajilla y los cubiertos", en: "Tableware", lvl: "a1", kind: "grid",
      items: [["el plato", "plate", vE(40, 44, 30, 14, "#fff", "#9aa7b4") + vE(40, 44, 18, 8, "none", "#cfd6e0", 1.6)],
        ["el plato hondo", "soup plate", vE(40, 40, 30, 10, "#fff", "#9aa7b4") + vP("M14 42q4 18 26 18t26-18", "#fff", "#9aa7b4") + vE(40, 40, 18, 5, "#f2c46b")],
        ["el cuenco", "bowl", vP("M10 34h60q0 30-30 30T10 34z", "#7fc4e8", "#3f87b5") + vE(40, 34, 30, 6, "#d6ecfb", "#3f87b5", 2), "el tazón"],
        ["la taza", "cup", vP("M16 26h38v24q0 16-19 16T16 50z", "#fff", "#e05a47", 2.6) + vP("M54 32q12 0 12 10t-12 10", "", "#e05a47", 3) + vP("M28 18q4-6 0-10M40 18q4-6 0-10", "", "#bbb", 2)],
        ["el platillo", "saucer", vE(40, 50, 30, 10, "#fff", "#9aa7b4") + vE(40, 48, 12, 4, "none", "#cfd6e0", 1.6)],
        ["el vaso", "glass", vP("M24 14h32l-4 54H28z", "#e7f4fb", "#7fa6c4") + vP("M27 36h26l-2 30H29z", "#bfe2f8")],
        ["la copa", "wine glass", vP("M24 12h32q2 26-16 30-18-4-16-30z", "#f3e8f0", "#9a7aa8") + vP("M26 26h28q-2 14-14 16-12-2-14-16z", "#b0283b") + vP("M40 42v22M28 66h24", "", "#9a7aa8", 3)],
        ["la jarra", "jug", vP("M22 18h32l-2 8q4 6 4 18v22H22V44q0-12 4-18z", "#d6ecfb", "#7fa6c4") + vP("M56 30q12 2 10 14t-10 12", "", "#7fa6c4", 3) + vP("M22 18l-6-4", "", "#7fa6c4", 3)],
        ["el tenedor", "fork", vP("M40 74V40", "", "#8d97a3", 5) + vP("M30 12v18q0 10 10 10t10-10V12M37 12v18M43 12v18", "", "#8d97a3", 3)],
        ["el cuchillo", "knife", vP("M40 74V44", "", "#3b3f47", 7) + vP("M36 44V18q0-8 8-8v34z", "#d8dee6", "#8d97a3")],
        ["la cuchara", "spoon", vE(40, 22, 10, 14, "#d8dee6", "#8d97a3") + vP("M40 36v38", "", "#8d97a3", 5)],
        ["la cucharilla", "teaspoon", vE(40, 32, 7, 10, "#d8dee6", "#8d97a3") + vP("M40 42v28", "", "#8d97a3", 4), "la cucharita"],
        ["la servilleta", "napkin", vP("M14 22h52L40 66z", "#f6c1d0", "#d07a96") + vP("M14 22l26 16 26-16", "", "#d07a96", 1.6)],
        ["el salero", "salt shaker", vP("M28 26h24l4 42H24z", "#fff", "#9aa7b4") + vP("M28 26q12-14 24 0", "#c4ccd5", "#6b7480") + '<g fill="#555"><circle cx="36" cy="20" r="1.4"/><circle cx="40" cy="18" r="1.4"/><circle cx="44" cy="20" r="1.4"/></g>' + vP("M32 56h16", "", "#ddd", 6)],
        ["el pimentero", "pepper pot", vP("M28 26h24l4 42H24z", "#fff", "#9aa7b4") + vP("M28 26q12-14 24 0", "#c4ccd5", "#6b7480") + vC(40, 19, 1.6, "#555") + vP("M32 56h16", "", "#3b3f47", 6)],
        ["la botella", "bottle", vP("M34 10h12v14q10 6 10 18v28H24V42q0-12 10-18z", "#8fd0a6", "#3e8a5a") + vR(34, 8, 12, 6, "#3e8a5a", "", 2) + vR(26, 44, 28, 14, "#fff", "", 2)],
        ["la pajita", "straw", vP("M30 70L46 26l12-14", "", "#e05a47", 6) + vP("M38 48l-4 10M42 38l-3 8", "", "#fff", 2.4), "el sorbete"],
        ["la tetera", "teapot", vP("M18 40q0-16 22-16t22 16v12q0 14-22 14T18 52z", "#7fb37a", "#3e7a3b") + vP("M62 42q12-4 12-14M18 44l-8-6", "", "#3e7a3b", 4) + vR(34, 18, 12, 6, "#3e7a3b", "", 3)],
        ["el termo", "flask", vR(26, 18, 28, 52, "#4f8cff", "#2f5fd0", 8) + vR(30, 10, 20, 10, "#3b3f47", "", 3) + vP("M30 32h20", "", "#2f5fd0", 2)]] },

    { id: "lavadero", grp: "home", es: "El lavadero", en: "The laundry room", lvl: "a2", kind: "grid",
      items: [["la lavadora", "washing machine", vR(14, 10, 52, 62, "#f4f6f9", "#9aa7b4", 4) + vP("M14 22h52", "", "#9aa7b4", 2) + vC(56, 16, 2.4, "#4f8cff") + vC(40, 46, 16, "#cfe8fb", "#6b7480", 3) + vP("M28 50q12 6 24 0", "", "#7fb3d6", 2)],
        ["la secadora", "tumble dryer", vR(14, 10, 52, 62, "#eef1f5", "#9aa7b4", 4) + vP("M14 22h52", "", "#9aa7b4", 2) + vC(22, 16, 2.4, "#e05a47") + vC(40, 46, 16, "#3b3f47", "#6b7480", 3) + vP("M32 42q8 8 16 0", "", "#9aa1ab", 2)],
        ["la plancha", "iron", vP("M10 58q2-24 30-26h24q6 0 6 6v20z", "#4f8cff", "#2f5fd0") + vP("M30 32q2-12 14-12h14q6 0 6 6v6", "", "#2f5fd0", 4) + vR(10, 58, 60, 6, "#9aa1ab", "", 2)],
        ["la tabla de planchar", "ironing board", vP("M6 30h52q14 0 16 6-2 6-16 6H6z", "#a8d5e8", "#5b8fb8") + vP("M20 42l30 30M50 42L20 72", "", "#6b7480", 3)],
        ["el cesto de la ropa", "laundry basket", vP("M16 30h48l-6 40H22z", "#d9b26f", "#a07c3c") + vP("M18 42h44M20 54h40M30 30v40M40 30v40M50 30v40", "", "#a07c3c", 1.4) + vP("M24 30q4-12 16-8 10-6 16 8", "#7fc4e8", "#3f87b5", 1.4), "el canasto de la ropa"],
        ["las pinzas", "clothes pegs", vR(26, 14, 10, 52, "#f2c94c", "#c9a227", 3) + vR(44, 14, 10, 52, "#7fb37a", "#3e7a3b", 3) + vP("M31 34v6M49 34v6", "", "#8d97a3", 3), "los ganchos de ropa"],
        ["el tendedero", "clothes horse", vP("M10 70L28 20M70 70L52 20M28 20h24M20 40h40M16 54h48", "", "#9aa1ab", 3) + vR(24, 40, 14, 14, "#e05a47") + vR(44, 40, 12, 18, "#4f8cff")],
        ["la percha", "coat hanger", vP("M40 26v-6q0-6 6-6t4 6", "", "#6b7480", 3) + vP("M40 26L8 52h64z", "", "#a07c3c", 4), "el gancho"],
        ["el detergente", "washing powder", vR(18, 18, 44, 52, "#ff8a4c", "#d9581d", 4) + vC(40, 42, 12, "#fff") + vP("M34 42q6-8 12 0-6 8-12 0z", "#4f8cff") + vR(28, 12, 24, 8, "#d9581d", "", 2)],
        ["el suavizante", "fabric softener", vP("M24 26q0-8 8-8h16q8 0 8 8v42H24z", "#b39ddb", "#7e57c2") + vR(32, 10, 16, 8, "#7e57c2", "", 2) + vC(40, 46, 8, "#fff") + vP("M60 34v24", "", "#7e57c2", 4)],
        ["la lejía", "bleach", vP("M26 24q0-8 8-8h12q8 0 8 8v44H26z", "#fff", "#4f8cff") + vR(34, 8, 12, 8, "#4f8cff", "", 2) + vP("M30 40h20M30 48h20", "", "#4f8cff", 3), "el cloro"],
        ["el cubo", "bucket", vP("M18 30h44l-6 38H24z", "#4f8cff", "#2f5fd0") + vP("M18 30q22-28 44 0", "", "#6b7480", 2.4), "el balde"],
        ["la fregona", "mop", vP("M46 8L34 52", "", "#8a5a3c", 5) + vP("M24 52h22l6 20H18z", "#e9e4da", "#b9ad8e") + vP("M24 58v12M30 58v14M36 58v14M42 58v12", "", "#b9ad8e", 1.6), "el trapeador"],
        ["la escoba", "broom", vP("M48 8L36 46", "", "#8a5a3c", 5) + vP("M26 44h22l8 28H16z", "#e6c588", "#a07c3c") + vP("M24 52v18M32 52v20M40 52v20M48 52v18", "", "#a07c3c", 1.4)],
        ["el recogedor", "dustpan", vP("M10 40h40l6 26H6z", "#e05a47", "#a8392b") + vP("M50 46l20-10", "", "#a8392b", 6)],
        ["la aspiradora", "vacuum cleaner", vE(30, 56, 20, 12, "#e05a47", "#a8392b") + vC(22, 66, 4, "#333") + vC(40, 66, 4, "#333") + vP("M46 52q14-4 16-24l6-20", "", "#6b7480", 4) + vP("M62 10l10 4", "", "#3b3f47", 5)],
        ["el trapo", "cloth", vP("M12 30q14-8 28 0t28 0l-4 30q-14 8-26 0t-26 0z", "#ffd36b", "#c9a227") + vP("M16 40q12-6 24 0t26 0", "", "#c9a227", 1.4)]] },

    { id: "herramientas", grp: "things", es: "Las herramientas", en: "Tools", lvl: "a2", kind: "grid",
      items: [["el martillo", "hammer", vP("M40 30v42", "", "#8a5a3c", 7) + vP("M18 16h34q10 0 14 8H52v10H18z", "#6b7480", "#3b3f47")],
        ["el destornillador", "screwdriver", vR(34, 10, 12, 28, "#e05a47", "#a8392b", 5) + vP("M40 38v26", "", "#8d97a3", 4) + vP("M37 64h6l-3 8z", "#8d97a3")],
        ["la llave inglesa", "spanner", vP("M18 64L50 32", "", "#8d97a3", 8) + vP("M50 32q-6-14 6-20l2 10 8 2 4-8q8 12-6 22z", "#8d97a3", "#6b7480") + vC(18, 64, 6, "#8d97a3")],
        ["los alicates", "pliers", vP("M30 72l8-34M50 72l-8-34", "", "#e05a47", 7) + vP("M38 38L34 12h4l3 26M42 38l4-26h-4l-3 26", "#8d97a3", "#6b7480", 2) + vC(40, 38, 3.4, "#3b3f47"), "el alicate"],
        ["la sierra", "saw", vP("M8 40h48l8 10H8z", "#d8dee6", "#8d97a3") + vP("M8 50l4 5 4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5 4-5", "", "#8d97a3", 1.4) + vP("M56 30h16v24H58l-2-14z", "#8a5a3c")],
        ["el taladro", "drill", vP("M12 28h40q8 0 8 8v4q0 8-8 8H12z", "#f2c94c", "#c9a227") + vP("M32 48l-4 22h14l2-22", "#3b3f47") + vP("M60 38h14", "", "#8d97a3", 3)],
        ["los clavos", "nails", vP("M24 14h10M29 14v54M44 14h10M49 14v48M60 20h10M65 20v40", "", "#6b7480", 3) + vP("M27 68l2 6 2-6M47 62l2 6 2-6", "#6b7480")],
        ["los tornillos", "screws", vP("M24 16h14M31 16v46l-2 8M50 16h14M57 16v40l-2 8", "", "#8d97a3", 3.4) + vP("M27 26l8 4M27 34l8 4M27 42l8 4M27 50l8 4M53 26l8 4M53 34l8 4M53 42l8 4", "", "#6b7480", 1.4)],
        ["la cinta métrica", "tape measure", vR(12, 22, 40, 40, "#f2c94c", "#c9a227", 10) + vC(32, 42, 8, "#3b3f47") + vP("M52 54h22", "", "#f2c94c", 7) + vP("M56 52v4M62 52v4M68 52v4", "", "#555", 1.2), "el metro"],
        ["el nivel", "spirit level", vR(6, 32, 68, 16, "#f2c94c", "#c9a227", 3) + vR(32, 35, 16, 10, "#bfe8a8", "#5a8f1e", 3) + vC(40, 40, 3, "#fff")],
        ["la escalera", "ladder", vP("M22 72L30 8M58 72L50 8M28 20h24M26 34h28M24 48h32M22 62h36", "", "#9aa1ab", 4)],
        ["la brocha", "paintbrush", vR(32, 8, 16, 26, "#8a5a3c", "", 4) + vR(28, 34, 24, 8, "#9aa1ab") + vP("M28 42h24l-2 24H30z", "#2b2b2b") + vP("M30 62h20v6H30z", "#4f8cff")],
        ["el rodillo de pintura", "paint roller", vR(12, 14, 50, 18, "#4f8cff", "#2f5fd0", 6) + vP("M62 23h6v18H40v30", "", "#6b7480", 3) + vR(34, 60, 12, 14, "#e05a47", "", 3)],
        ["la caja de herramientas", "toolbox", vR(10, 32, 60, 34, "#e05a47", "#a8392b", 4) + vP("M28 32v-8h24v8", "", "#3b3f47", 4) + vP("M10 44h60", "", "#a8392b", 2) + vR(36, 40, 8, 8, "#c4ccd5", "", 1)],
        ["la linterna", "torch", vP("M10 32h30l12-8v32l-12-8H10z", "#3b3f47", "#22252b") + vP("M56 30l14-8M58 40h14M56 50l14 8", "", "#f2c94c", 3), "la linterna"],
        ["la cinta adhesiva", "sticky tape", vC(36, 40, 22, "#c4ccd5", "#9aa1ab") + vC(36, 40, 10, "#fff", "#9aa1ab") + vP("M56 48l16 6v8l-18-4", "#c4ccd5", "#9aa1ab", 1.4)],
        ["las tijeras", "scissors", vC(24, 58, 9, "none", "#e05a47", 4) + vC(48, 62, 9, "none", "#e05a47", 4) + vP("M28 50L62 10M44 54L36 10", "", "#8d97a3", 4)],
        ["la pala", "shovel", vP("M40 8v40", "", "#8a5a3c", 5) + vP("M32 8h16", "", "#3b3f47", 4) + vP("M26 46h28v10q0 16-14 18-14-2-14-18z", "#9aa1ab", "#6b7480")]] },

    { id: "aparatos", grp: "things", es: "Los aparatos", en: "Electronics & appliances", lvl: "a2", kind: "grid",
      items: [["la tele", "TV", vR(8, 14, 64, 42, "#1d2129", "#3b3f47", 3, 3) + vP("M14 48l14-14 8 8 12-12 18 18", "", "#4a6fa5", 2) + vP("M32 56l-4 10M48 56l4 10M24 66h32", "", "#3b3f47", 3), "el televisor"],
        ["el mando a distancia", "remote control", vR(30, 8, 20, 64, "#3b3f47", "#22252b", 8) + vC(40, 20, 4, "#e05a47") + '<g fill="#9aa1ab"><circle cx="35" cy="34" r="2.2"/><circle cx="45" cy="34" r="2.2"/><circle cx="35" cy="44" r="2.2"/><circle cx="45" cy="44" r="2.2"/><circle cx="35" cy="54" r="2.2"/><circle cx="45" cy="54" r="2.2"/></g>', "el control remoto"],
        ["el móvil", "mobile phone", vR(26, 8, 28, 64, "#2b2b2b", "", 6) + vR(29, 14, 22, 48, "#7fc4e8", "", 2) + vC(40, 67, 2, "#666"), "el celular"],
        ["el portátil", "laptop", vP("M16 18h48v32H16z", "#1d2129", "#9aa1ab") + vR(19, 21, 42, 26, "#7fc4e8") + vP("M8 52h64l-4 8H12z", "#c4ccd5", "#9aa1ab"), "la laptop"],
        ["la tableta", "tablet", vR(14, 12, 52, 58, "#2b2b2b", "", 6) + vR(18, 16, 44, 48, "#b39ddb", "", 2) + vC(40, 67, 1.8, "#666")],
        ["el cargador", "charger", vR(26, 30, 22, 26, "#fff", "#9aa7b4", 4) + vP("M32 30v-10M42 30v-10", "", "#8d97a3", 3) + vP("M37 56q0 14 14 14h20", "", "#9aa7b4", 3)],
        ["los auriculares", "headphones", vP("M16 50q0-34 24-34t24 34", "", "#3b3f47", 5) + vR(10, 44, 14, 22, "#e05a47", "#a8392b", 5) + vR(56, 44, 14, 22, "#e05a47", "#a8392b", 5), "los audífonos"],
        ["el altavoz", "speaker", vR(20, 10, 40, 60, "#3b3f47", "#22252b", 6) + vC(40, 26, 7, "#9aa1ab", "#666") + vC(40, 50, 12, "#9aa1ab", "#666") + vC(40, 50, 4, "#555"), "el parlante"],
        ["el router", "router", vR(10, 42, 60, 18, "#fff", "#9aa7b4", 4) + vP("M22 42V18M58 42V18", "", "#3b3f47", 3) + '<g fill="#4caf50"><circle cx="20" cy="51" r="2"/><circle cx="28" cy="51" r="2"/><circle cx="36" cy="51" r="2"/></g>', "el enrutador"],
        ["la impresora", "printer", vR(10, 30, 60, 28, "#c4ccd5", "#6b7480", 4) + vR(20, 12, 40, 18, "#fff", "#9aa7b4", 1) + vR(20, 52, 40, 18, "#fff", "#9aa7b4", 1) + vP("M26 58h28M26 64h20", "", "#9aa7b4", 1.4) + vC(62, 38, 2.4, "#4caf50")],
        ["la cámara", "camera", vR(10, 24, 60, 40, "#3b3f47", "#22252b", 6) + vR(18, 18, 16, 8, "#3b3f47", "", 2) + vC(42, 44, 14, "#9aa1ab", "#22252b", 3) + vC(42, 44, 7, "#4a6fa5") + vC(62, 32, 3, "#f2c94c")],
        ["la radio", "radio", vR(8, 26, 64, 40, "#c0563f", "#8f3b2a", 6) + vP("M20 26L52 8", "", "#6b7480", 2) + vC(28, 46, 12, "#3b3f47") + vR(46, 36, 20, 8, "#fff7c0", "", 2) + vC(56, 54, 4, "#3b3f47")],
        ["el ventilador", "fan", vC(40, 32, 22, "none", "#9aa1ab", 2) + vP("M40 32q-4-16 6-18 4 10-6 18zM40 32q14-6 18 4-10 4-18-4zM40 32q-10 12-18 6 4-10 18-6z", "#7fc4e8", "#4f8cff", 1.2) + vC(40, 32, 3, "#3b3f47") + vP("M40 54v14M28 70h24", "", "#6b7480", 4)],
        ["el aire acondicionado", "air conditioner", vR(6, 22, 68, 30, "#fbfcfd", "#9aa7b4", 6) + vP("M14 42h52M14 46h52", "", "#c4ccd5", 1.6) + vC(64, 30, 2, "#4caf50") + vP("M20 58q-2 6 0 12M34 58q-2 6 0 12M48 58q-2 6 0 12", "", "#7fc4e8", 2)],
        ["la lámpara de mesa", "table lamp", vP("M24 34l8-22h16l8 22z", "#f5e3b5", "#c9a86a") + vP("M40 34v28", "", "#6b7480", 3) + vE(40, 66, 14, 4, "#6b7480")],
        ["la bombilla", "light bulb", vP("M40 10c-14 0-20 10-20 20 0 10 8 14 10 24h20c2-10 10-14 10-24 0-10-6-20-20-20z", "#ffe38a", "#c9a227") + vR(30, 54, 20, 12, "#9aa1ab", "#6b7480", 2) + vP("M30 58h20M30 62h20", "", "#6b7480", 1.2), "el foco"],
        ["la regleta", "extension lead", vR(8, 38, 56, 18, "#fff", "#9aa7b4", 4) + [20, 34, 48].map((x) => vC(x, 47, 4.4, "#eef1f5", "#9aa7b4", 1.4)).join("") + vP("M64 47q10 0 10-14V18", "", "#9aa7b4", 3), "la extensión"],
        ["las pilas", "batteries", vR(18, 18, 18, 48, "#3b3f47", "", 3) + vR(22, 14, 10, 4, "#c4ccd5") + vR(18, 18, 18, 14, "#f2c94c") + vR(44, 18, 18, 48, "#3b3f47", "", 3) + vR(48, 14, 10, 4, "#c4ccd5") + vR(44, 18, 18, 14, "#f2c94c"), "las baterías"]] },

    { id: "vehiculos", grp: "move", es: "Los vehículos", en: "Vehicles", lvl: "a1", kind: "grid",
      items: [["el coche", "car", vP("M6 54V44q0-6 6-8l10-2 8-10h22l10 10 8 2q4 2 4 8v10z", "#e05a47", "#a8392b") + vP("M32 26h8v10H24zM44 26h6l8 10H44z", "#cfe8fb") + vC(22, 56, 7, "#2b2b2b") + vC(58, 56, 7, "#2b2b2b"), "el carro"],
        ["la moto", "motorbike", vC(18, 54, 11, "none", "#2b2b2b", 5) + vC(62, 54, 11, "none", "#2b2b2b", 5) + vP("M18 54l14-14h22l8 14M30 38h20q4-8 12-8M56 30l6-6", "", "#3b3f47", 4) + vP("M30 36q10-10 22-4l-4 8H32z", "#e05a47")],
        ["la bicicleta", "bicycle", vC(18, 54, 13, "none", "#2b2b2b", 3) + vC(62, 54, 13, "none", "#2b2b2b", 3) + vP("M18 54l12-22h20L62 54M30 32l10 22 10-22M40 54h-22M26 26h10M50 32l-2-8h8", "", "#2f8f6f", 3)],
        ["el autobús", "bus", vR(6, 18, 68, 38, "#f2c94c", "#c9a227", 6) + vR(12, 24, 12, 12, "#cfe8fb") + vR(28, 24, 12, 12, "#cfe8fb") + vR(44, 24, 12, 12, "#cfe8fb") + vR(60, 24, 10, 18, "#cfe8fb") + vC(20, 58, 6, "#2b2b2b") + vC(58, 58, 6, "#2b2b2b"), "el bus"],
        ["el camión", "lorry", vR(4, 20, 46, 34, "#4f8cff", "#2f5fd0", 2) + vP("M50 30h14l10 12v12H50z", "#e05a47", "#a8392b") + vR(56, 34, 8, 8, "#cfe8fb") + vC(16, 58, 6, "#2b2b2b") + vC(36, 58, 6, "#2b2b2b") + vC(64, 58, 6, "#2b2b2b"), "el camión"],
        ["la furgoneta", "van", vP("M6 56V24q0-4 4-4h40l14 14 8 4v18z", "#fff", "#9aa7b4") + vP("M50 22l12 12H50z", "#cfe8fb") + vP("M6 44h66", "", "#4f8cff", 4) + vC(20, 58, 6, "#2b2b2b") + vC(58, 58, 6, "#2b2b2b"), "la camioneta"],
        ["el taxi", "taxi", vP("M6 54V44q0-6 6-8l10-2 8-10h22l10 10 8 2q4 2 4 8v10z", "#f5d142", "#b8981e") + vP("M32 26h8v10H24zM44 26h6l8 10H44z", "#cfe8fb") + vR(32, 16, 16, 6, "#2b2b2b", "", 2) + vC(22, 56, 7, "#2b2b2b") + vC(58, 56, 7, "#2b2b2b")],
        ["el tren", "train", vP("M8 54V26q0-8 8-8h40q16 0 18 20v16z", "#2f8f6f", "#1f6a51") + vR(16, 26, 12, 12, "#cfe8fb") + vR(34, 26, 12, 12, "#cfe8fb") + vP("M54 26h10q4 4 6 12H54z", "#cfe8fb") + vC(20, 58, 5, "#2b2b2b") + vC(36, 58, 5, "#2b2b2b") + vC(58, 58, 5, "#2b2b2b") + vP("M2 66h76", "", "#6b7480", 3)],
        ["el metro", "underground", vR(8, 16, 64, 42, "#4f8cff", "#2f5fd0", 10) + vR(14, 24, 16, 14, "#cfe8fb") + vR(50, 24, 16, 14, "#cfe8fb") + vR(34, 22, 12, 30, "#cfe8fb") + vC(20, 48, 3, "#fff3a0") + vC(60, 48, 3, "#fff3a0") + vP("M4 66h72", "", "#6b7480", 3)],
        ["el tranvía", "tram", vP("M40 16V6M28 6h24", "", "#3b3f47", 2) + vR(8, 16, 64, 40, "#e05a47", "#a8392b", 6) + vR(14, 22, 14, 14, "#cfe8fb") + vR(33, 22, 14, 14, "#cfe8fb") + vR(52, 22, 14, 14, "#cfe8fb") + vC(20, 58, 5, "#2b2b2b") + vC(60, 58, 5, "#2b2b2b") + vP("M2 66h76", "", "#6b7480", 3)],
        ["el avión", "plane", vP("M6 42q0-6 10-6h50q10 0 12 6-2 6-12 6H16q-10 0-10-6z", "#fff", "#9aa7b4") + vP("M34 36l-8-22h8l16 22zM34 48l-8 18h8l16-18zM10 36l-4-12h6l8 12z", "#4f8cff", "#2f5fd0", 1.4) + vP("M60 40h6", "", "#7fc4e8", 3)],
        ["el helicóptero", "helicopter", vE(34, 42, 20, 14, "#f2c94c", "#c9a227") + vP("M30 40q2-10 12-10v12z", "#cfe8fb") + vP("M54 40h20M72 34v12", "", "#c9a227", 4) + vP("M8 24h52M34 24v4M22 62h28M28 56v6M44 56v6", "", "#3b3f47", 3)],
        ["el barco", "ship", vP("M4 46h72l-10 18H14z", "#c0563f", "#8f3b2a") + vR(16, 30, 44, 16, "#fff", "#9aa7b4") + vR(26, 18, 10, 12, "#3b3f47") + vR(42, 18, 10, 12, "#3b3f47") + '<g fill="#7fc4e8"><circle cx="24" cy="38" r="2.4"/><circle cx="34" cy="38" r="2.4"/><circle cx="44" cy="38" r="2.4"/><circle cx="54" cy="38" r="2.4"/></g>' + vP("M2 70q8-4 16 0t16 0 16 0 16 0 12 0", "", "#4f8cff", 2)],
        ["la barca", "rowing boat", vP("M8 48h64q-6 16-24 16H32Q14 64 8 48z", "#a37a52", "#7a5a3c") + vP("M20 38l44 18M60 38L16 56", "", "#8a5a3c", 3) + vP("M2 70q8-4 16 0t16 0 16 0 16 0 12 0", "", "#4f8cff", 2), "el bote"],
        ["el velero", "sailing boat", vP("M10 54h60q-6 12-22 12H32q-16 0-22-12z", "#fff", "#9aa7b4") + vP("M40 54V8", "", "#6b7480", 3) + vP("M42 10l24 40H42z", "#f2c94c", "#c9a227", 1.4) + vP("M38 16L18 48h20z", "#e05a47", "#a8392b", 1.4) + vP("M2 72q8-4 16 0t16 0 16 0 16 0 12 0", "", "#4f8cff", 2)],
        ["la ambulancia", "ambulance", vP("M6 56V22h44l12 12 10 4v18z", "#fff", "#9aa7b4") + vP("M50 24l10 10H50z", "#cfe8fb") + vP("M24 32v14M17 39h14", "", "#e05a47", 5) + vR(20, 16, 10, 6, "#4f8cff", "", 2) + vC(20, 58, 6, "#2b2b2b") + vC(58, 58, 6, "#2b2b2b")],
        ["el camión de bomberos", "fire engine", vR(4, 26, 50, 30, "#e5383b", "#a5262a", 3) + vP("M54 30h12l8 10v16H54z", "#e5383b", "#a5262a") + vR(58, 34, 8, 6, "#cfe8fb") + vP("M8 20h44M12 16v8M20 16v8M28 16v8M36 16v8M44 16v8", "", "#c4ccd5", 2.4) + vC(16, 58, 6, "#2b2b2b") + vC(38, 58, 6, "#2b2b2b") + vC(64, 58, 6, "#2b2b2b")],
        ["el coche de policía", "police car", vP("M6 54V44q0-6 6-8l10-2 8-10h22l10 10 8 2q4 2 4 8v10z", "#fff", "#3b3f47") + vP("M6 46h68", "", "#2f5fd0", 5) + vP("M32 26h8v10H24zM44 26h6l8 10H44z", "#cfe8fb") + vR(34, 16, 6, 6, "#e5383b") + vR(40, 16, 6, 6, "#4f8cff") + vC(22, 56, 7, "#2b2b2b") + vC(58, 56, 7, "#2b2b2b"), "la patrulla"],
        ["el tractor", "tractor", vP("M30 48V28h20l4 20z", "#4caf50", "#2e7d32") + vR(34, 30, 12, 10, "#cfe8fb") + vP("M10 48h44v8H10z", "#4caf50", "#2e7d32") + vC(46, 54, 14, "#2b2b2b") + vC(46, 54, 6, "#f2c94c") + vC(16, 60, 8, "#2b2b2b") + vC(16, 60, 3, "#f2c94c") + vP("M20 40V24", "", "#3b3f47", 3)],
        ["el patinete", "scooter", vP("M18 60h40M54 60L46 14M38 14h16", "", "#3b3f47", 4) + vC(16, 62, 7, "none", "#2b2b2b", 4) + vC(58, 62, 7, "none", "#2b2b2b", 4) + vP("M20 58h32", "", "#4f8cff", 5), "el scooter"]] },
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
    const Y = new Array(t.items.length), sp = 21, top = 14, bot = 332;
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
    else { const Y = vdLay(t);
      pic = '<div class="vd-pic"><svg viewBox="-56 0 512 340" role="img" aria-label="' + esc(t.en) + '">' + '' + vdLux('<rect x="-56" y="0" width="56" height="340" fill="' + (t.bg || "#fffdf8") + '"/><rect x="400" y="0" width="56" height="340" fill="' + (t.bg || "#fffdf8") + '"/>' + t.svg) +
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
  window.__vd = { topics: () => VDT.map((t) => ({ id: t.id, n: t.items.length, kind: t.kind, grp: t.grp })), deck: (re) => { const d = SRD.decks.find((x) => new RegExp(re).test(x.name)); return d ? d.w.length : 0; }, lat: () => vdLat(),
    pool: vdPool, pic: (tid, i) => { const t = VDT.find((x) => x.id === tid); return t ? vdPic(t, i) : ""; }, lay: (tid) => { const t = VDT.find((x) => x.id === tid); return t ? vdLay(t) : []; }, n: vdN, seq: () => window.__vdSeq, st: () => ({ on: VDP.on, i: VDP.i, paused: VDP.paused, rate: VDP.rate }) };
  /* ==/VISUAL== */

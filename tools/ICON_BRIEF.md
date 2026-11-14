# Icon brief — Ruta DELE

**Goal:** give the app a professional, consistent finish by replacing emoji used as interface icons with one coherent icon family, without changing layouts, wording or behaviour.

**Style (one family, no mixing)**
- Outline icons on a 24 × 24 grid, 1.9 px stroke, round caps and joins, no fills (the existing tab-bar and card icons already follow this; extend that set).
- Sized from the surrounding text (1.15 em), aligned to the text baseline, so they scale with the app's text-size setting.
- Colour: `currentColor` by default, so they follow every theme (light, dark and the 13 palettes) and sit correctly inside buttons. A small semantic palette only where colour carries meaning: streak = flame orange, freeze = ice blue, rewards = gold, growth = green, mistakes = red.
- No emoji in interface chrome: buttons, headings, list markers, stats, badges, quests, toasts, banners, settings. Typographic symbols (✓ → ↗ ✕ ·) stay; they're text, not pictures.

**Keep as they are**
- Spanish content: reading and listening texts, flashcard faces, translation bubbles.
- Country flags used as data (🇵🇦 🇪🇸), and anything the learner types.

**Mapping (emoji → icon)**
puzzle 🧩 · volume 🔊 · volume-off 🔇 · headphones 🎧 · cards 🗂 · target 🎯 · flame 🔥 · snowflake 🧊 · sun ☀ · book 📘 · book-open 📖 · pen ✍ · speech 🗣 · mic 🎙 🎤 · chart 📊 · star ⭐ · medal 🏅 💯 · trophy 🏆 · graduation 🎓 · file 📝 · library 📚 · tree 🌳 · sprout 🌱 · leaf 🌿 · mountain 🏔 🌋 · zap 🧠 · save 💾 · calendar 📅 · folder 📂 · alarm ⏰ · timer ⏱ · alert ⚠ · bulb 💡 · sparkles ✨ 🎉 · repeat 🔁 · shuffle 🔀 · briefcase 💼 · globe 🌎 🌍 · pin 📍 · back ↩ · flag 🏁 · bandage 🩹 · slow 🐢 · check ✅ · cross ❌.

**How**
1. One icon registry (`IC(name)`) so every icon comes from the same set.
2. A renderer that swaps mapped emoji for icons anywhere in the interface as it is drawn (covers toasts and dynamic messages too), skipping the content areas above.
3. Badges become medallions: gold ring when earned, grey when not.

**Done when**
- No mapped emoji remains in any screen's interface (automated scan of 29 screens + dynamic toasts).
- Icons render in light, dark and a palette theme; no layout shifts; earlier tests still pass.

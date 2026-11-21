"""Read & Listen › How-to & directions, batch v265 (21 Nov 2026): recipes, repairs and everyday procedures as step cards,
and directions as a route with turn arrows. All texts are original.
Paragraph flags: list (what you need, meta q = quantity), step (numbered step), tip / warn (boxes), h (heading);
route paragraphs: dir = start | straight | left | right | cross | round | up | bus | metro | walk | stairs | taxi | car | arrive.
Re-runnable (replaces items with the same id).   Usage: python3 tools/content/add_howto.py index.html"""
import json, sys
P = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(P, encoding="utf-8").read()

def need(*rows, h="Ingredientes", hEn="Ingredients"):
    return {"h": h, "hEn": hEn, "list": True, "s": [[es, en, {"q": q, "say": say}] for q, es, en, say in rows]}
def step(*pairs): return {"step": True, "s": [list(x) for x in pairs]}
def tip(*pairs, warn=False): d = {"s": [list(x) for x in pairs]}; d["warn" if warn else "tip"] = True; return d
def go(dir, *pairs, h=None):
    d = {"dir": dir, "s": [list(x) for x in pairs]}
    if h: d["h"] = h
    return d
def howto(id, lvl, country, t, sub, lay, paras, gl, q, **kw):
    x = {"id": id, "cat": "reading", "kind": "howto", "lay": lay, "lvl": lvl, "country": country, "t": t, "s": sub, "paras": paras, "gl": gl, "q": q}
    x.update(kw); return x

ITEMS = [
# ------------------------------------------------------------------ recipes
howto("como-guacamole", "a1", "México", "Guacamole", "Recipe · Guacamole in ten minutes", "steps",
 [need(("3", "aguacates maduros", "ripe avocados", "Tres aguacates maduros."), ("1", "tomate", "tomato", "Un tomate."), ("½", "cebolla blanca", "white onion", "Media cebolla blanca."),
       ("1", "limón", "lime", "Un limón."), ("1", "chile serrano (si te gusta el picante)", "serrano chilli (if you like it hot)", "Un chile serrano, si te gusta el picante."), ("—", "sal y cilantro", "salt and coriander", "Sal y cilantro.")),
  {"h": "Preparación", "hEn": "Method", "s": [["Necesitas un tazón y un tenedor.", "You need a bowl and a fork."]]},
  step(["Corta los aguacates por la mitad y quita el hueso.", "Cut the avocados in half and remove the stone."], ["Pon la pulpa en el tazón.", "Put the flesh in the bowl."]),
  step(["Aplasta los aguacates con el tenedor.", "Mash the avocados with the fork."]),
  step(["Pica el tomate, la cebolla, el chile y el cilantro en trozos pequeños.", "Chop the tomato, onion, chilli and coriander into small pieces."]),
  step(["Mezcla todo con el aguacate.", "Mix everything with the avocado."], ["Añade el jugo del limón y un poco de sal.", "Add the lime juice and a little salt."]),
  step(["Sirve el guacamole con totopos.", "Serve the guacamole with tortilla chips."]),
  tip(["Si guardas el guacamole, deja el hueso dentro: así no se pone negro tan rápido.", "If you keep the guacamole, leave the stone in it: that way it doesn't go brown so fast."])],
 [["maduro", "ripe"], ["el hueso", "stone, pit"], ["aplastar", "to mash"], ["picar", "to chop"], ["mezclar", "to mix"], ["los totopos", "tortilla chips"]],
 [["¿Cuántos aguacates necesitas?", ["dos", "tres", "cuatro"], 1], ["¿Con qué aplastas los aguacates?", ["con un cuchillo", "con un tenedor", "con una cuchara"], 1], ["¿Qué añades al final de la mezcla?", ["jugo de limón y sal", "azúcar", "agua"], 0], ["¿Con qué se sirve?", ["con pan", "con totopos", "con arroz"], 1], ["¿Para qué sirve dejar el hueso?", ["para dar sabor", "para que no se ponga negro tan rápido", "para decorar"], 1]],
 icon="🥑", facts=[["10 min", "tiempo"], ["4", "personas"], ["fácil", "dificultad"]]),

howto("como-tortilla", "a2", "España", "Tortilla de patatas", "Recipe · The classic Spanish omelette", "steps",
 [need(("5", "patatas medianas", "medium potatoes", "Cinco patatas medianas."), ("6", "huevos", "eggs", "Seis huevos."), ("1", "cebolla (opcional)", "onion (optional)", "Una cebolla, si quieres."),
       ("200 ml", "aceite de oliva", "olive oil", "Doscientos mililitros de aceite de oliva."), ("—", "sal", "salt", "Sal.")),
  step(["Pela las patatas y córtalas en láminas finas.", "Peel the potatoes and cut them into thin slices."], ["Si usas cebolla, córtala en tiras.", "If you use onion, cut it into strips."]),
  step(["Calienta el aceite en una sartén a fuego medio.", "Heat the oil in a frying pan over a medium heat."], ["Fríe las patatas y la cebolla unos veinte minutos, hasta que estén blandas.", "Fry the potatoes and onion for about twenty minutes, until they are soft."]),
  step(["Bate los huevos en un bol grande con un poco de sal.", "Beat the eggs in a large bowl with a little salt."]),
  step(["Escurre bien el aceite de las patatas y mézclalas con el huevo.", "Drain the oil from the potatoes well and mix them with the egg."], ["Deja reposar la mezcla cinco minutos.", "Let the mixture rest for five minutes."]),
  step(["Pon una cucharada de aceite en la sartén y echa la mezcla.", "Put a spoonful of oil in the pan and pour in the mixture."], ["Cocina a fuego bajo unos cuatro minutos.", "Cook over a low heat for about four minutes."]),
  step(["Pon un plato encima de la sartén y dale la vuelta a la tortilla con cuidado.", "Put a plate on top of the pan and carefully turn the omelette over."], ["Vuelve a ponerla en la sartén y cocínala tres minutos más.", "Put it back in the pan and cook it for three more minutes."]),
  tip(["El aceite está muy caliente: dale la vuelta encima del fregadero y sin prisa.", "The oil is very hot: turn it over above the sink and take your time."], warn=True),
  tip(["En España hay un gran debate: ¿tortilla con cebolla o sin cebolla?", "In Spain there's a big debate: omelette with onion or without?"])],
 [["pelar", "to peel"], ["la lámina", "thin slice"], ["la sartén", "frying pan"], ["batir", "to beat, whisk"], ["escurrir", "to drain"], ["dar la vuelta", "to turn over, flip"]],
 [["¿Cómo se cortan las patatas?", ["en cubos grandes", "en láminas finas", "por la mitad"], 1], ["¿Cuánto tiempo se fríen las patatas?", ["unos cinco minutos", "unos veinte minutos", "una hora"], 1], ["¿Qué se hace con los huevos?", ["se baten con sal", "se fríen aparte", "se cuecen"], 0], ["¿Para qué se usa el plato?", ["para servir", "para darle la vuelta a la tortilla", "para batir los huevos"], 1], ["¿Por qué hay que tener cuidado al darle la vuelta?", ["porque el aceite está muy caliente", "porque el plato puede romperse", "porque se enfría"], 0]],
 icon="🍳", facts=[["45 min", "tiempo"], ["4–6", "personas"], ["media", "dificultad"]]),

howto("como-arepas", "a2", "Colombia", "Arepas de queso", "Recipe · Cheese arepas for breakfast", "steps",
 [need(("2 tazas", "harina de maíz precocida", "pre-cooked cornmeal", "Dos tazas de harina de maíz precocida."), ("2 ½ tazas", "agua tibia", "warm water", "Dos tazas y media de agua tibia."),
       ("1 taza", "queso blanco rallado", "grated white cheese", "Una taza de queso blanco rallado."), ("1 cdta.", "sal", "salt", "Una cucharadita de sal."), ("—", "mantequilla", "butter", "Mantequilla.")),
  step(["En un bol, mezcla el agua tibia con la sal.", "In a bowl, mix the warm water with the salt."]),
  step(["Añade la harina poco a poco y amasa con las manos durante dos minutos.", "Add the flour little by little and knead with your hands for two minutes."], ["La masa tiene que quedar suave, sin pegarse a los dedos.", "The dough must be soft, without sticking to your fingers."]),
  step(["Agrega el queso y vuelve a amasar.", "Add the cheese and knead again."]),
  step(["Haz bolitas del tamaño de una mandarina y aplánalas hasta formar discos de un centímetro.", "Make little balls the size of a mandarin and flatten them into discs one centimetre thick."]),
  step(["Cocina las arepas en una sartén caliente, unos cinco minutos por cada lado.", "Cook the arepas in a hot pan, about five minutes on each side."]),
  step(["Sírvelas calientes con mantequilla y un poco más de queso encima.", "Serve them hot with butter and a bit more cheese on top."]),
  tip(["Si la masa se agrieta, moja tus manos con un poco de agua.", "If the dough cracks, wet your hands with a little water."])],
 [["la harina de maíz", "cornmeal"], ["tibio", "lukewarm"], ["amasar", "to knead"], ["la masa", "dough"], ["aplanar", "to flatten"], ["agrietarse", "to crack"]],
 [["¿Qué se mezcla primero?", ["la harina y el queso", "el agua tibia y la sal", "la mantequilla y la harina"], 1], ["¿Cómo debe quedar la masa?", ["suave y sin pegarse", "dura y seca", "líquida"], 0], ["¿De qué tamaño son las bolitas?", ["de una mandarina", "de una naranja grande", "de una uva"], 0], ["¿Cuánto tiempo se cocinan por cada lado?", ["dos minutos", "cinco minutos", "quince minutos"], 1], ["¿Qué haces si la masa se agrieta?", ["añades más harina", "te mojas las manos", "la tiras"], 1]],
 icon="🫓", facts=[["30 min", "tiempo"], ["6", "arepas"], ["fácil", "dificultad"]]),

howto("como-ceviche", "b1", "Perú", "Ceviche de pescado", "Recipe · Peruvian ceviche, step by step", "steps",
 [need(("500 g", "pescado blanco muy fresco (corvina o lenguado)", "very fresh white fish (sea bass or sole)", "Quinientos gramos de pescado blanco muy fresco, como corvina o lenguado."), ("12", "limones", "limes", "Doce limones."),
       ("1", "cebolla morada", "red onion", "Una cebolla morada."), ("1", "ají limo o ají amarillo", "Peruvian chilli", "Un ají limo o ají amarillo."), ("—", "cilantro, sal y pimienta", "coriander, salt and pepper", "Cilantro, sal y pimienta."),
       ("—", "camote y choclo cocidos para acompañar", "cooked sweet potato and corn to serve", "Camote y choclo cocidos para acompañar.")),
  step(["Corta el pescado en cubos de unos dos centímetros y guárdalo en la nevera mientras preparas lo demás.", "Cut the fish into cubes of about two centimetres and keep it in the fridge while you prepare the rest."]),
  step(["Corta la cebolla en pluma, es decir, en tiras muy finas, y déjala en agua fría con hielo diez minutos.", "Cut the onion into feather-thin strips and leave it in cold water with ice for ten minutes."], ["Así pierde el sabor fuerte.", "That way it loses its strong taste."]),
  step(["Exprime los limones justo antes de usarlos, sin apretar demasiado, para que el jugo no salga amargo.", "Squeeze the limes just before using them, without pressing too hard, so the juice doesn't turn bitter."]),
  step(["En un bol frío, pon el pescado con sal, el ají picado y el cilantro.", "In a cold bowl, put the fish with salt, the chopped chilli and the coriander."], ["Añade el jugo de limón hasta cubrir el pescado y mezcla suavemente.", "Add the lime juice until it covers the fish and mix gently."]),
  step(["Deja que el limón «cocine» el pescado solo de dos a cinco minutos; si esperas más, queda seco.", "Let the lime «cook» the fish for just two to five minutes; if you wait longer, it becomes dry."]),
  step(["Escurre la cebolla, ponla encima y sirve enseguida con camote y choclo.", "Drain the onion, put it on top and serve straight away with sweet potato and corn."]),
  tip(["Usa solo pescado del día y mantenlo siempre frío: el ceviche no se cocina con fuego.", "Only use fish caught that day and always keep it cold: ceviche isn't cooked with heat."], warn=True),
  tip(["El jugo que queda en el plato se llama «leche de tigre» y en Perú mucha gente se lo toma.", "The juice left on the plate is called «tiger's milk» and in Peru many people drink it."])],
 [["el ají", "chilli pepper (Peru)"], ["exprimir", "to squeeze"], ["amargo", "bitter"], ["escurrir", "to drain"], ["enseguida", "straight away"], ["el choclo", "corn on the cob (Andes)"]],
 [["¿Cómo se corta el pescado?", ["en filetes largos", "en cubos de unos dos centímetros", "muy fino"], 1], ["¿Por qué se deja la cebolla en agua con hielo?", ["para que pierda el sabor fuerte", "para que sea más dulce y roja", "para limpiarla"], 0], ["¿Por qué no hay que apretar mucho los limones?", ["para que el jugo no salga amargo", "para no cansarse", "para que no salpique"], 0], ["¿Qué pasa si el pescado está demasiado tiempo en el limón?", ["queda seco", "queda crudo", "se pone dulce"], 0], ["¿Qué es la «leche de tigre»?", ["una bebida con leche", "el jugo que queda en el plato", "una salsa picante aparte"], 1]],
 icon="🐟", facts=[["25 min", "tiempo"], ["4", "personas"], ["media", "dificultad"]]),

# ------------------------------------------------------------------ fixing and everyday procedures
howto("como-router", "a2", "Panamá", "No hay internet: reinicia el router", "How-to · Restart the router when the Wi-Fi stops working", "steps",
 [need(("—", "el router", "the router", "El router."), ("—", "un lápiz o un clip (para el botón de reinicio)", "a pencil or a paperclip (for the reset button)", "Un lápiz o un clip para el botón de reinicio."), h="Necesitas", hEn="You need"),
  step(["Mira las luces del router.", "Look at the lights on the router."], ["Si la luz de internet está roja o apagada, el problema puede ser el router.", "If the internet light is red or off, the problem may be the router."]),
  step(["Desconecta el cable de la corriente.", "Unplug the power cable."], ["Espera treinta segundos.", "Wait thirty seconds."]),
  step(["Vuelve a conectar el cable y espera dos o tres minutos.", "Plug the cable back in and wait two or three minutes."], ["Las luces se encienden poco a poco.", "The lights come on little by little."]),
  step(["Cuando la luz de internet esté verde, prueba otra vez el wifi en tu teléfono.", "When the internet light is green, try the Wi-Fi on your phone again."]),
  step(["Si todavía no funciona, llama a la compañía y dales el número de cliente que está en la factura.", "If it still doesn't work, call the company and give them the customer number on your bill."]),
  tip(["No aprietes el botón pequeño de «reset» si la compañía no te lo dice: borra la contraseña del wifi.", "Don't press the small «reset» button unless the company tells you to: it erases the Wi-Fi password."], warn=True)],
 [["la luz", "light (on a device)"], ["apagado", "off"], ["desconectar", "to unplug, disconnect"], ["la corriente", "mains power"], ["probar", "to try, test"], ["borrar", "to erase"]],
 [["¿Qué miras primero?", ["el teléfono", "las luces del router", "la factura"], 1], ["¿Cuánto tiempo esperas con el router desconectado?", ["treinta segundos", "diez minutos", "una hora"], 0], ["¿De qué color debe estar la luz de internet cuando funciona?", ["roja", "verde", "apagada"], 1], ["¿Dónde está el número de cliente?", ["en el router", "en la factura", "en el teléfono"], 1], ["¿Por qué no debes apretar el botón de «reset»?", ["porque borra la contraseña del wifi", "porque rompe el router", "porque es caro"], 0]],
 icon="📶", theme="fix", facts=[["5 min", "tiempo"], ["0 $", "coste"], ["fácil", "dificultad"]]),

howto("como-bici", "b1", "Chile", "Reparar una rueda pinchada", "How-to · Fix a flat bicycle tyre", "steps",
 [need(("2", "desmontadores de neumáticos", "tyre levers", "Dos desmontadores de neumáticos."), ("1", "parche y pegamento (o un kit de parches)", "patch and glue (or a patch kit)", "Un parche y pegamento, o un kit de parches."),
       ("1", "lija pequeña", "small piece of sandpaper", "Una lija pequeña."), ("1", "bombín", "bicycle pump", "Un bombín."), ("—", "un balde con agua", "a bucket of water", "Un balde con agua."), h="Herramientas", hEn="Tools"),
  step(["Quita la rueda de la bicicleta y saca todo el aire que quede en la cámara.", "Take the wheel off the bike and let out any air left in the inner tube."]),
  step(["Mete los desmontadores entre el neumático y la llanta y sácalo por un lado.", "Put the tyre levers between the tyre and the rim and lift it off on one side."], ["Después saca la cámara con cuidado.", "Then carefully take out the inner tube."]),
  step(["Infla un poco la cámara y métela en el agua por partes.", "Inflate the tube a little and put it in the water section by section."], ["Donde salgan burbujas, está el pinchazo: márcalo con un lápiz.", "Where bubbles come out, that's the puncture: mark it with a pencil."]),
  step(["Seca la zona, lija alrededor del agujero y pon una capa fina de pegamento.", "Dry the area, sand around the hole and spread a thin layer of glue."], ["Espera unos tres minutos, hasta que el pegamento ya no brille.", "Wait about three minutes, until the glue is no longer shiny."]),
  step(["Pega el parche y presiónalo fuerte durante un minuto.", "Stick the patch on and press it hard for a minute."]),
  step(["Antes de montar la cámara, pasa la mano por dentro del neumático: a veces la espina o el vidrio que causó el pinchazo sigue allí.", "Before fitting the tube, run your hand round the inside of the tyre: sometimes the thorn or glass that caused the puncture is still there."]),
  step(["Vuelve a meter la cámara y el neumático, infla hasta la presión que indica el lateral y monta la rueda.", "Put the tube and tyre back, inflate to the pressure shown on the side and refit the wheel."]),
  tip(["No uses destornilladores para sacar el neumático: pueden hacer otro agujero en la cámara.", "Don't use screwdrivers to remove the tyre: they can make another hole in the tube."], warn=True)],
 [["pinchado", "punctured, flat"], ["la cámara", "inner tube"], ["la llanta", "rim (Spain, Chile)"], ["el pinchazo", "puncture"], ["la lija", "sandpaper"], ["el bombín", "bicycle pump"]],
 [["¿Cómo encuentras el pinchazo?", ["mirando con una lupa", "metiendo la cámara en agua y buscando burbujas", "escuchando el aire"], 1], ["¿Cuándo pones el parche?", ["enseguida", "cuando el pegamento ya no brilla", "al día siguiente"], 1], ["¿Por qué hay que revisar el interior del neumático?", ["porque puede seguir allí lo que causó el pinchazo", "para limpiarlo", "para medir la presión"], 0], ["¿Dónde se ve la presión correcta?", ["en el bombín", "en el lateral del neumático", "en la llanta"], 1], ["¿Por qué no se deben usar destornilladores?", ["porque pueden hacer otro agujero", "porque son caros", "porque son pesados"], 0]],
 icon="🚲", theme="fix", facts=[["20 min", "tiempo"], ["≈ 3 $", "coste"], ["media", "dificultad"]]),

howto("como-fregadero", "b1", "España", "Desatascar el fregadero", "How-to · Unblock a kitchen sink without chemicals", "steps",
 [need(("1 taza", "bicarbonato", "bicarbonate of soda", "Una taza de bicarbonato."), ("1 taza", "vinagre blanco", "white vinegar", "Una taza de vinagre blanco."), ("—", "agua muy caliente", "very hot water", "Agua muy caliente."),
       ("1", "desatascador de ventosa", "plunger", "Un desatascador de ventosa."), ("1", "cubo", "bucket", "Un cubo."), h="Necesitas", hEn="You need"),
  step(["Quita el agua que haya en el fregadero con un vaso y échala en el cubo.", "Remove any water in the sink with a glass and pour it into the bucket."]),
  step(["Echa el bicarbonato por el desagüe y, después, el vinagre.", "Pour the bicarbonate of soda down the drain and then the vinegar."], ["Hará espuma: es normal.", "It will foam: that's normal."]),
  step(["Tapa el desagüe con un trapo y espera media hora.", "Cover the drain with a cloth and wait half an hour."]),
  step(["Echa poco a poco un litro de agua muy caliente.", "Slowly pour in a litre of very hot water."]),
  step(["Si el agua sigue sin bajar, usa el desatascador: ponlo sobre el desagüe, empuja y tira con fuerza diez o doce veces.", "If the water still doesn't go down, use the plunger: put it over the drain, push and pull hard ten or twelve times."]),
  step(["Si nada funciona, coloca el cubo debajo, desenrosca el sifón con cuidado y límpialo.", "If nothing works, put the bucket underneath, carefully unscrew the U-bend and clean it."]),
  tip(["No mezcles este truco con productos químicos para desatascar: pueden salpicar y quemarte.", "Don't combine this trick with chemical drain cleaners: they can splash and burn you."], warn=True),
  tip(["Para que no vuelva a pasar, no tires aceite por el fregadero: guárdalo en una botella y llévalo al punto limpio.", "To stop it happening again, don't pour oil down the sink: keep it in a bottle and take it to the recycling point."])],
 [["desatascar", "to unblock"], ["el desagüe", "drain, plughole"], ["la espuma", "foam"], ["el desatascador", "plunger"], ["el sifón", "U-bend, trap"], ["el punto limpio", "recycling centre (Spain)"]],
 [["¿Qué se echa primero por el desagüe?", ["el vinagre", "el bicarbonato", "el agua caliente"], 1], ["¿Cuánto tiempo hay que esperar con el desagüe tapado?", ["cinco minutos", "media hora", "toda la noche"], 1], ["¿Cuándo se usa el desatascador?", ["al principio", "si el agua sigue sin bajar", "nunca"], 1], ["¿Para qué sirve el cubo al final?", ["para recoger el agua al desenroscar el sifón", "para lavar los platos", "para mezclar el vinagre"], 0], ["¿Qué no hay que tirar por el fregadero?", ["agua caliente", "aceite", "vinagre"], 1]],
 icon="🚰", theme="fix", facts=[["40 min", "tiempo"], ["≈ 2 €", "coste"], ["fácil", "dificultad"]]),

howto("como-cajero", "a2", "Colombia", "Sacar dinero del cajero", "How-to · Take money out of a cash machine", "steps",
 [step(["Mete la tarjeta en el cajero, con la flecha hacia dentro.", "Put the card into the machine, with the arrow pointing in."]),
  step(["Elige el idioma: español o inglés.", "Choose the language: Spanish or English."]),
  step(["Escribe tu clave de cuatro dígitos y tapa el teclado con la otra mano.", "Type your four-digit PIN and cover the keypad with your other hand."]),
  step(["Elige «Retiro» y después la cuenta: «Ahorros» o «Corriente».", "Choose «Withdrawal» and then the account: «Savings» or «Current»."]),
  step(["Selecciona la cantidad o escribe otra.", "Select the amount or type another one."], ["El cajero te dice cuánto cobra el banco por la operación: acepta solo si estás de acuerdo.", "The machine tells you how much the bank charges for the transaction: accept only if you agree."]),
  step(["Recoge primero la tarjeta y luego el dinero y el recibo.", "Take your card first, then the money and the receipt."]),
  tip(["Si alguien te ofrece ayuda en el cajero, di que no y cancela la operación.", "If someone offers to help you at the cash machine, say no and cancel the transaction."], warn=True)],
 [["el cajero (automático)", "cash machine, ATM"], ["la clave", "PIN (Latin America)"], ["tapar", "to cover"], ["el retiro", "withdrawal"], ["la cuenta de ahorros", "savings account"], ["cobrar", "to charge"]],
 [["¿Cuántos dígitos tiene la clave?", ["cuatro", "seis", "dos"], 0], ["¿Por qué tapas el teclado?", ["para que nadie vea tu clave", "porque hace sol", "para limpiarlo"], 0], ["¿Qué opción eliges para sacar dinero?", ["«Consulta»", "«Retiro»", "«Depósito»"], 1], ["¿Qué recoges primero?", ["el dinero", "la tarjeta", "el recibo"], 1], ["¿Qué haces si un desconocido te ofrece ayuda?", ["le das la tarjeta", "dices que no y cancelas", "le pides el recibo"], 1]],
 icon="🏧", theme="fix", facts=[["2 min", "tiempo"], ["6", "pasos"], ["fácil", "dificultad"]]),

# ------------------------------------------------------------------ directions
howto("ruta-madrid-prado", "a1", "España", "Del hotel al Museo del Prado", "Directions · Walking in Madrid", "route",
 [go("start", ["Sal del hotel y gira a la derecha.", "Leave the hotel and turn right."]),
  go("straight", ["Sigue todo recto por la calle de Atocha unos cinco minutos.", "Go straight along Atocha Street for about five minutes."]),
  go("left", ["En la plaza, gira a la izquierda.", "At the square, turn left."], ["Hay una farmacia en la esquina.", "There's a chemist's on the corner."]),
  go("cross", ["Cruza el paseo del Prado por el paso de peatones.", "Cross the Paseo del Prado at the pedestrian crossing."]),
  go("straight", ["Camina por el parque, al lado de las fuentes.", "Walk through the park, next to the fountains."]),
  go("arrive", ["El museo está a la derecha, delante de ti.", "The museum is on the right, in front of you."], ["La entrada está en la puerta de Goya.", "The entrance is at the Goya door."])],
 [["salir de", "to leave"], ["girar a la derecha / izquierda", "to turn right / left"], ["seguir todo recto", "to go straight on"], ["la esquina", "corner"], ["cruzar", "to cross"], ["el paso de peatones", "pedestrian crossing"]],
 [["¿Qué haces al salir del hotel?", ["girar a la izquierda", "girar a la derecha", "cruzar la calle"], 1], ["¿Cuánto tiempo caminas por la calle de Atocha?", ["unos cinco minutos", "una hora", "un minuto"], 0], ["¿Qué hay en la esquina de la plaza?", ["un banco", "una farmacia", "un café"], 1], ["¿Por dónde cruzas el paseo del Prado?", ["por el paso de peatones", "por un puente", "por el metro"], 0], ["¿Dónde está la entrada?", ["en la puerta de Goya", "en el parque", "en la farmacia"], 0]],
 **{"from": "Hotel Central, calle de Atocha", "to": "Museo del Prado", "facts": [["12 min", "a pie"], ["900 m", "distancia"], ["5", "pasos"]]}),

howto("ruta-panama-metro", "a2", "Panamá", "Al Casco Viejo en metro y bus", "Directions · Public transport in Panama City", "route",
 [go("walk", ["Camina hasta la estación de metro Vía Argentina; está a tres cuadras de tu casa.", "Walk to the Vía Argentina metro station; it's three blocks from your house."]),
  go("metro", ["Toma la línea 1 en dirección Albrook.", "Take line 1 towards Albrook."], ["Necesitas la tarjeta Metro, que se recarga en la estación.", "You need the Metro card, which you top up at the station."], h="Línea 1"),
  go("metro", ["Bájate en la estación Cinco de Mayo; son cuatro paradas.", "Get off at Cinco de Mayo station; it's four stops."]),
  go("bus", ["Sal por la salida hacia la avenida Central y toma el metrobús con el letrero «Casco Antiguo».", "Leave by the exit towards Avenida Central and take the metrobus with the sign «Casco Antiguo»."], ["Pagas con la misma tarjeta.", "You pay with the same card."], h="Metrobús"),
  go("arrive", ["Bájate en la última parada, en la plaza de la Independencia.", "Get off at the last stop, in Plaza de la Independencia."], ["Desde allí, todo el Casco Viejo se recorre a pie.", "From there, you can walk all around the Casco Viejo."])],
 [["la cuadra", "block (street)"], ["tomar (el metro / el bus)", "to take (the metro / bus)"], ["en dirección a", "towards"], ["recargar", "to top up"], ["bajarse", "to get off"], ["el letrero", "sign"]],
 [["¿Qué estación de metro está cerca de casa?", ["Vía Argentina", "Albrook", "Cinco de Mayo"], 0], ["¿Cuántas paradas hay en el metro?", ["dos", "cuatro", "diez"], 1], ["¿Qué letrero tiene el metrobús?", ["«Albrook»", "«Casco Antiguo»", "«Vía Argentina»"], 1], ["¿Cómo se paga el metrobús?", ["en efectivo", "con la misma tarjeta del metro", "es gratis"], 1], ["¿Dónde termina el viaje?", ["en la plaza de la Independencia", "en la avenida Central", "en Albrook"], 0]],
 **{"from": "Tu casa, El Cangrejo", "to": "Casco Viejo", "facts": [["35 min", "total"], ["2", "transportes"], ["0,35 $", "metro"]]}),

howto("ruta-gdl-casa", "b1", "México", "Cómo llegar a mi casa", "Directions · A friend's voice message: driving in Guadalajara", "route",
 [go("car", ["Oye, para llegar a mi casa desde el aeropuerto, agarra la carretera a Chapala en dirección a Guadalajara.", "Hey, to get to my house from the airport, take the Chapala road towards Guadalajara."], ["Son como veinte minutos.", "It's about twenty minutes."]),
  go("round", ["Cuando llegues a la glorieta grande con la estatua, dale la vuelta y toma la tercera salida, hacia avenida Lázaro Cárdenas.", "When you reach the big roundabout with the statue, go round it and take the third exit, towards Avenida Lázaro Cárdenas."]),
  go("straight", ["Sigue derecho unos cuatro kilómetros, pasando dos semáforos y un puente.", "Carry straight on for about four kilometres, past two traffic lights and a bridge."]),
  go("right", ["Justo después de la gasolinera, da vuelta a la derecha en la calle Pino.", "Just after the petrol station, turn right into Pino Street."], ["Ojo, porque la calle es angosta y casi no se ve.", "Careful, because the street is narrow and you can hardly see it."]),
  go("arrive", ["Mi casa es la tercera a mano izquierda, la del portón verde.", "My house is the third one on the left, the one with the green gate."], ["Si te pierdes, márcame y te mando la ubicación.", "If you get lost, call me and I'll send you the location."])],
 [["agarrar (una calle)", "to take (a road) (Mexico)"], ["la glorieta", "roundabout (Mexico, Spain)"], ["seguir derecho", "to go straight on (Mexico)"], ["el semáforo", "traffic light"], ["angosto", "narrow"], ["el portón", "large gate"]],
 [["¿Desde dónde da las indicaciones?", ["desde el centro", "desde el aeropuerto", "desde la gasolinera"], 1], ["¿Qué salida hay que tomar en la glorieta?", ["la primera", "la segunda", "la tercera"], 2], ["¿Qué hay justo antes de la calle Pino?", ["un puente", "una gasolinera", "una estatua"], 1], ["¿Por qué hay que tener cuidado con la calle Pino?", ["porque es angosta y casi no se ve", "porque tiene mucho tráfico", "porque es de un solo sentido"], 0], ["¿Cómo es la casa?", ["la primera a la derecha, con portón azul", "la tercera a la izquierda, con portón verde", "la última de la calle"], 1]],
 **{"from": "Aeropuerto de Guadalajara", "to": "Calle Pino, casa del portón verde", "facts": [["≈ 30 min", "en carro"], ["4 km", "por Lázaro Cárdenas"], ["3.ª", "salida"]]}),
]

i = s.index("const LISTEN = ") + 15; j = s.index("];\n", i)
LI = json.loads(s[i:j + 1])
ids = {x["id"] for x in ITEMS}
LI = [x for x in LI if x["id"] not in ids] + ITEMS
s = s[:i] + json.dumps(LI, ensure_ascii=False, separators=(",", ":")) + s[j + 1:]
open(P, "w", encoding="utf-8").write(s)
print("How-to & directions:", len(ITEMS), "in place;", len(LI), "texts in all")

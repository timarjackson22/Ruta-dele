# DELE A2 v2020, Comprensión de lectura, Tarea 4: one narrative text of 375–425 words (biographical note, diary, blog
# entry, story, news or travel guide) and six questions with three options (Especificaciones DELE A2 2020).
# One per sample exam, on that exam's theme. gen.py puts it in place of the old gap-fill, which stays as labelled practice.
from gen_common import mc, R

INS = "Lea el texto y conteste a las preguntas (20–25). Seleccione la opción correcta (a, b o c)."
EN = "Read the text and answer questions 20–25."

T4 = [
 R("Tarea 4", INS, EN, [("Blog «Mochila y café» · Mi viaje a San Blas", """Hace tres años que escribo este blog sobre viajes baratos por Centroamérica, y hoy quiero contaros el viaje que más me ha cambiado: una semana en las islas de San Blas, en el Caribe de Panamá.

Todo empezó por casualidad. Yo quería ir a Costa Rica, pero los billetes de avión estaban carísimos. Una amiga panameña, Yaritza, me dijo: «¿Por qué no vienes a Panamá? Desde la capital puedes ir a San Blas en coche y en lancha, y no es caro». Yaritza, además, conocía a una familia guna que alquilaba cabañas, así que solo tuve que comprar el billete de avión a Panamá. Cambié mis planes en una noche.

El viaje desde la ciudad fue más difícil de lo que pensaba. Salimos a las cinco de la mañana en un todoterreno, porque la carretera tiene muchas curvas y subidas. Después de tres horas llegamos al puerto y allí tomamos una pequeña lancha. El mar estaba un poco movido y yo me mareé, pero cuando vi las islas me olvidé de todo: arena blanca, palmeras y un agua de color turquesa.

Las islas son territorio del pueblo guna, que vive allí desde hace siglos y tiene sus propias leyes. Por eso los visitantes pagan una pequeña tasa al llegar y tienen que respetar algunas normas: por ejemplo, no se pueden hacer fotos a las personas sin pedir permiso. A mí me pareció muy justo.

Dormimos en una cabaña muy sencilla, sin aire acondicionado y con electricidad solo unas horas por la noche. Los primeros días me costó un poco, porque estoy acostumbrado a mirar el móvil todo el tiempo. Pero al tercer día ya no lo echaba de menos: me levantaba con el sol, nadaba, leía y hablaba con otros viajeros.

Lo mejor fue la comida. Cada día comíamos pescado fresco con arroz con coco y plátano frito. Una tarde, una señora guna nos enseñó a preparar un plato típico y nos habló de las molas, las telas de colores que hacen las mujeres de su comunidad. Compré una para mi madre y fue el mejor regalo que le he hecho nunca.

Cuando volví a la ciudad, me sentí un poco raro con tanto ruido y tanto tráfico. Desde entonces intento usar menos el móvil y viajar más despacio. Si vais a Panamá, no os perdáis San Blas, pero id con tiempo y con respeto. Yo ya estoy ahorrando para volver el año que viene.""")],
  [mc("El autor fue a San Blas porque…", ["los viajes a Costa Rica eran caros.", "ya conocía las islas.", "quería visitar a su familia."], 0),
   mc("Durante el viaje a las islas, el autor…", ["se sintió mal en la lancha.", "fue en avión desde la capital.", "tardó solo una hora."], 0),
   mc("En las islas, los visitantes…", ["no pueden hacer ninguna foto.", "tienen que pagar al llegar.", "no tienen que seguir normas."], 1),
   mc("Al principio, en la cabaña, el autor…", ["echaba de menos su móvil.", "no podía dormir por el calor.", "se aburría con los otros viajeros."], 0),
   mc("Una señora guna…", ["les vendió pescado.", "les enseñó a cocinar.", "les hizo una mola."], 1),
   mc("Después del viaje, el autor…", ["quiere vivir en San Blas.", "ha cambiado algunos hábitos.", "no quiere volver a viajar."], 1)]),
 R("Tarea 4", INS, EN, [("Diario de una mudanza", """Lunes, 3 de marzo
Hoy empieza mi nueva vida. Después de seis años en un piso compartido con tres estudiantes, por fin vivo sola. El apartamento es pequeño, solo tiene un dormitorio, un salón con cocina abierta y un baño, pero tiene mucha luz y un balcón que da a un parque. Lo encontré gracias a mi compañera de trabajo, Lucía, que vive en el mismo edificio.

La mudanza fue un desastre. Alquilé una furgoneta para todo el día, pero mi hermano, que tenía que ayudarme, se puso enfermo la noche anterior. Al final, Lucía y su novio subieron conmigo las cajas por la escalera, porque el ascensor no funcionaba. ¡Cuatro pisos con una lavadora!

Jueves, 6 de marzo
Ya he conocido a casi todos los vecinos. La señora del primero, doña Carmen, me trajo un bizcocho de bienvenida y me explicó las normas de la comunidad: la basura se baja después de las ocho de la tarde y las bicicletas no se pueden dejar en el portal. Me contó que vive en el edificio desde 1980 y que conoce a todo el barrio. Es muy amable, pero habla muchísimo: estuvimos una hora en la puerta.

El vecino de al lado es un chico joven que toca la guitarra. Toca bien, pero a veces practica muy tarde, hasta la medianoche, y yo me levanto a las seis para ir a trabajar. No sé si decirle algo; no quiero empezar con problemas.

Domingo, 9 de marzo
Primera semana completa. Estoy aprendiendo a organizarme: los lunes hago la compra para toda la semana, cocino el domingo y lo guardo en el congelador. Antes, en el piso compartido, siempre había alguien en la cocina y yo comía cualquier cosa. Ahora como mejor y gasto menos. Los viernes también limpio la casa, porque no me gusta hacerlo el fin de semana.

Lo más difícil es el silencio. Por la noche la casa está muy tranquila y a veces me siento un poco sola. Por eso he empezado a invitar a amigos a cenar los viernes.

Lunes, 10 de marzo
Por fin hablé con el vecino de la guitarra. Fue muy fácil: me pidió perdón, me dijo que no sabía que las paredes eran tan finas y que desde ahora va a practicar solo hasta las diez. Además, me invitó a su concierto del sábado en un bar del barrio. Creo que voy a ir.""")],
  [mc("La autora encontró el apartamento…", ["por una compañera de trabajo.", "en un anuncio del periódico.", "con ayuda de su hermano."], 0),
   mc("El día de la mudanza…", ["su hermano la ayudó con las cajas.", "tuvieron que subir las cosas a pie.", "no pudo alquilar una furgoneta."], 1),
   mc("Doña Carmen…", ["se queja de la basura.", "le dio un dulce a la autora.", "tiene una bicicleta en el portal."], 1),
   mc("El problema con el vecino de al lado es que…", ["toca la guitarra muy mal.", "toca hasta muy tarde.", "no saluda a nadie."], 1),
   mc("Desde que vive sola, la autora…", ["come peor que antes.", "gasta más dinero.", "planifica sus comidas."], 2),
   mc("Al final, el vecino…", ["va a tocar menos horas.", "se va a cambiar de piso.", "no quiere hablar con ella."], 0)]),
 R("Tarea 4", INS, EN, [("Una historia de la sección «Gente que se mueve»", """Cuando Rubén Castillo cumplió cuarenta años, su médico le dio una mala noticia: tenía la tensión alta, pesaba quince kilos de más y dormía mal. «Me dijo que tenía que cambiar de vida, y que no era una sugerencia», cuenta Rubén, que trabaja como taxista en Ciudad de Panamá desde hace veinte años.

Al principio no sabía por dónde empezar. Pasaba diez horas al día sentado en el taxi, comía en la calle y los fines de semana veía el fútbol en el sofá. «Nunca me ha gustado el gimnasio. Me aburro mucho haciendo lo mismo una y otra vez», explica.

La solución llegó por su hija Valeria, de dieciséis años, que corre en el equipo de atletismo de su colegio. Un domingo le propuso acompañarla a la Cinta Costera, el paseo junto al mar donde muchos panameños hacen deporte. «El primer día no pude correr ni cinco minutos. Valeria se reía de mí, pero me esperó», recuerda.

Desde entonces van juntos todos los domingos y dos días entre semana, muy temprano, antes del trabajo, cuando todavía no hace calor. Rubén empezó caminando rápido y, poco a poco, alternando caminar y correr. A los seis meses ya podía correr cuarenta minutos sin parar y había perdido sus primeros cinco kilos. Al principio, sus compañeros taxistas se reían de él cuando lo veían con ropa de deporte. Ahora dos de ellos se han unido al grupo de los domingos.

También cambió su forma de comer. No hizo ninguna dieta especial: simplemente empezó a llevar comida de casa al taxi, bebe más agua y ha dejado los refrescos. «Lo que más me costó fue el café con mucha azúcar. Ahora lo tomo solo y, la verdad, ya no lo cambio», dice.

Un año después, Rubén ha perdido doce kilos, duerme mejor y su tensión es normal. Pero para él lo más importante es otra cosa: «Antes casi no hablaba con mi hija. Ahora, mientras corremos, me cuenta sus problemas, sus planes… Hemos encontrado nuestro momento».

El mes pasado participaron en su primera carrera popular, de diez kilómetros. Valeria llegó mucho antes, claro, pero esperó a su padre en la meta con una medalla de chocolate. Su próximo objetivo es la media maratón de Panamá, en enero. «No sé si voy a terminarla», dice Rubén riendo, «pero la vamos a intentar juntos».""")],
  [mc("El médico le dijo a Rubén que…", ["tenía que trabajar menos horas.", "era necesario cambiar sus hábitos.", "debía ir al gimnasio."], 1),
   mc("Antes de empezar a correr, Rubén…", ["no hacía casi ejercicio.", "iba al gimnasio sin ganas.", "jugaba al fútbol los domingos."], 0),
   mc("La primera vez que corrió con su hija…", ["corrió más de media hora.", "su hija no lo esperó.", "se cansó muy pronto."], 2),
   mc("Rubén y Valeria corren…", ["solo los domingos.", "por la mañana temprano.", "por la tarde, después del trabajo."], 1),
   mc("Para comer mejor, Rubén…", ["siguió una dieta del médico.", "lleva comida preparada en casa.", "toma café con más azúcar."], 1),
   mc("Según Rubén, lo mejor de correr es que…", ["ha ganado una medalla.", "ahora se lleva mejor con su hija.", "puede correr una maratón."], 1)]),
 R("Tarea 4", INS, EN, [("Noticia · Una tienda de barrio que no quiere cerrar", """En la calle del Mercado, en el barrio de Santa Ana, hay una pequeña tienda de ropa que tiene casi setenta años. Se llama Confecciones Ortega y la abrió en 1956 el abuelo de su actual dueña, Gladys Ortega. Al principio era una sastrería: el abuelo hacía trajes y camisas a medida para los hombres del barrio. Los vecinos más mayores todavía la llaman «la sastrería», aunque hace muchos años que allí no se hacen trajes.

Hace unos años, la tienda estuvo a punto de cerrar. En la misma calle abrieron dos grandes almacenes con ropa muy barata, y muchos clientes dejaron de venir. «Hubo meses en los que no vendíamos casi nada. Mi padre ya estaba mayor y quería jubilarse. Todos pensábamos que era el final», recuerda Gladys.

Gladys, que había estudiado Administración de Empresas y trabajaba en un banco, decidió dejar su trabajo y quedarse con el negocio. No fue una decisión fácil. «Ganaba mucho menos y trabajaba más horas, pero no podía ver cómo se cerraba la tienda de mi familia», explica.

Lo primero que hizo fue cambiar el tipo de productos. En lugar de competir con los precios de los grandes almacenes, empezó a vender ropa de diseñadores panameños jóvenes y a ofrecer arreglos: acortar pantalones, cambiar cremalleras o ajustar vestidos. «Mucha gente no sabe coser y no quiere tirar la ropa. Los arreglos ahora son casi la mitad de lo que ganamos», dice.

También abrió una página en las redes sociales, donde publica fotos de la ropa y cuenta la historia del barrio. Gracias a eso, ahora tiene clientes jóvenes que antes no conocían la tienda, e incluso turistas que llegan con el móvil en la mano buscando «la tienda del abuelo».

Además, los sábados por la mañana organiza un pequeño taller de costura para principiantes. Cada clase dura dos horas, los materiales están incluidos y el precio es bajo, así que siempre están llenas. «Algunas alumnas vienen con sus hijas. Me gusta pensar que estamos enseñando algo que no se debe perder», cuenta.

Hoy Confecciones Ortega tiene tres empleados y ha vuelto a ganar dinero. Gladys no piensa en abrir más tiendas: «Prefiero algo pequeño y bien hecho. Lo importante es que el barrio siga teniendo su tienda». En la pared, junto a la caja, todavía está la vieja máquina de coser de su abuelo.""")],
  [mc("Cuando se abrió, Confecciones Ortega…", ["vendía ropa de mujer.", "hacía ropa para cada cliente.", "era unos grandes almacenes."], 1),
   mc("La tienda casi cerró porque…", ["abrieron tiendas con precios más bajos.", "el abuelo se puso enfermo.", "cambiaron la calle del barrio."], 0),
   mc("Para quedarse con la tienda, Gladys…", ["pidió dinero al banco.", "estudió Administración de Empresas.", "dejó su trabajo anterior."], 2),
   mc("Hoy, una parte importante del dinero de la tienda viene de…", ["los arreglos de ropa.", "la ropa más barata.", "las ventas por internet."], 0),
   mc("Gracias a las redes sociales…", ["la tienda tiene clientes nuevos.", "Gladys ha abierto otra tienda.", "los turistas compran por internet."], 0),
   mc("Sobre el futuro, Gladys…", ["quiere tener más tiendas.", "prefiere seguir con un negocio pequeño.", "va a vender la máquina de su abuelo."], 1)]),
]

# Themed vocabulary from the learner's textbook (Thematic Vocabulary, chapter 34 + current events), merged into the
# word bank (W) by patch_wordbank.py. One theme per line block: (Spanish name, English name, entries).
# Entry: "spanish|english" — nouns keep their article (el/la/los/las, el/la … (-a)); prefixes: v: verb, a: adjective,
# x: expression, d: adverb. Lists are the learner's own word lists (meanings re-checked), not copied text.
T = [
("La nacionalidad", "Nationality", """
a:alemán|German; a:argentino|Argentinian; a:asiático|Asian; a:boliviano|Bolivian; a:brasileño|Brazilian; a:canadiense|Canadian;
a:centroamericano|Central American; a:chileno|Chilean; a:chino|Chinese; a:colombiano|Colombian; a:coreano|Korean;
a:costarricense|Costa Rican; a:cubano|Cuban; a:dominicano|Dominican; a:ecuatoriano|Ecuadorian; a:español|Spanish;
a:europeo|European; a:francés|French; a:griego|Greek; a:guatemalteco|Guatemalan; a:guyanés|Guyanese; a:haitiano|Haitian;
a:hondureño|Honduran; a:indio|Indian; a:inglés|English; a:italiano|Italian; a:jamaiquino|Jamaican; a:japonés|Japanese;
a:mexicano|Mexican; a:nicaragüense|Nicaraguan; a:norteamericano|North American; a:panameño|Panamanian; a:paraguayo|Paraguayan;
a:peruano|Peruvian; a:puertorriqueño|Puerto Rican; a:salvadoreño|Salvadoran; a:sudamericano|South American; a:uruguayo|Uruguayan;
a:venezolano|Venezuelan; a:vietnamita|Vietnamese"""),
("La familia", "Family", """
la abuela|grandmother; el abuelo|grandfather; los abuelos|grandparents; el cuñado|brother-in-law; la cuñada|sister-in-law;
la esposa|wife; el esposo|husband; la familia|family; la hermana|sister; el hermano|brother; los hermanos|brothers and sisters;
la hija|daughter; el hijo|son; los hijos|children (sons and daughters); la madrastra|stepmother; la madre|mother;
la madrina|godmother; la mamá|mum, mom; la nieta|granddaughter; el nieto|grandson; la niña|girl; el niño|boy;
la nuera|daughter-in-law; el padrastro|stepfather; el padre|father; los padres|parents; el padrino|godfather;
los padrinos|godparents; los papás|parents; el pariente|relative; la prima|cousin (female); el primo|cousin (male);
la sobrina|niece; el sobrino|nephew; la suegra|mother-in-law; el suegro|father-in-law; los suegros|in-laws; la tía|aunt;
el tío|uncle; los tíos|aunts and uncles; el yerno|son-in-law"""),
("Las características físicas", "Physical characteristics", """
a:alto|tall; a:bajo|short; a:bonito|pretty; a:calvo|bald; a:ciego|blind; a:débil|weak; a:delgado|thin; a:feo|ugly;
a:flaco|skinny; a:fuerte|strong; a:gordo|fat; a:hermoso|beautiful, handsome; a:joven|young; a:minusválido|disabled;
a:sordo|deaf; a:viejo|old; a:musculoso|muscular; a:atractivo|attractive; a:guapo|good-looking;
x:tener … años|to be … years old; x:tener los ojos azules|to have blue eyes; x:tener los ojos cafés|to have brown eyes;
x:tener los ojos negros|to have dark eyes; x:tener los ojos verdes|to have green eyes; x:tener el pelo rubio|to have blond hair;
x:tener el pelo moreno|to have dark hair; x:tener el pelo castaño|to have brown hair; x:tener el pelo negro|to have black hair;
x:tener el pelo rojo|to have red hair; x:tener el pelo rizado|to have curly hair; x:tener el pelo ondulado|to have wavy hair;
x:tener el pelo lacio|to have straight hair"""),
("Las características psicológicas", "Personality", """
a:activo|active; a:alegre|cheerful; a:amable|kind, friendly; a:ambicioso|ambitious; a:antipático|unpleasant; a:atlético|athletic;
a:bondadoso|kind; a:benévolo|benevolent; a:cómico|funny; a:contento|happy, pleased; a:cortés|polite; a:cruel|cruel;
a:curioso|curious; a:descontento|unhappy; a:divertido|fun; a:egoísta|selfish; a:franco|frank; a:furioso|furious;
a:generoso|generous; a:honesto|honest; a:imaginativo|imaginative; a:impulsivo|impulsive; a:ingenuo|naive;
a:inteligente|intelligent; a:interesante|interesting; a:orgulloso|proud; a:perezoso|lazy; a:serio|serious;
a:simpático|nice, likeable; a:supersticioso|superstitious; a:triste|sad; a:valiente|brave; a:reservado|reserved;
a:talentoso|talented; a:poderoso|powerful; a:positivo|positive; a:impaciente|impatient; a:independiente|independent;
a:cínico|cynical; a:sensible|sensitive; a:apasionado|passionate; a:cuidadoso|careful; a:mentiroso|lying; el mentiroso|liar"""),
("Las emociones", "Emotions and feelings", """
la alegría|joy; el amor|love; la envidia|envy; la felicidad|happiness; el gusto|pleasure; la lealtad|loyalty; el miedo|fear;
el odio|hate; el orgullo|pride; la pasión|passion; la piedad|pity; la tristeza|sadness; la valentía|bravery; la vergüenza|shame"""),
("La casa y los cuartos", "House and rooms", """
el alquiler|rent; el apartamento|apartment, flat; el armario|wardrobe, closet; el ascensor|lift, elevator; el balcón|balcony;
la casa|house; el césped|lawn; la chimenea|fireplace; la cocina|kitchen; el comedor|dining room; el contrato|lease, contract;
el cuarto|room; el cuarto de baño|bathroom; el desván|attic; el dormitorio|bedroom; el edificio de apartamentos|block of flats;
la escalera|stairs; el estudio|study; el fregadero|kitchen sink; el garaje|garage; la habitación|room; el inquilino|tenant;
el jardín|garden; la pared|wall; el pasillo|hall, corridor; el patio|patio; el piso|floor, storey; la planta baja|ground floor;
el propietario|owner; la puerta|door; la sala|living room; el sótano|basement; el techo|ceiling, roof; la terraza|terrace;
la ventana|window"""),
("Los muebles y los aparatos", "Furniture and appliances", """
la alfombra|rug, carpet; la almohada|pillow; la aspiradora|vacuum cleaner; el buró|bedside table (Mexico); la butaca|armchair;
la cama|bed; la cómoda|chest of drawers; la computadora|computer; el congelador|freezer; la cortina|curtain;
el cuadro|picture, painting; el espejo|mirror; el estéreo|stereo; la estufa|stove, cooker; el horno|oven;
el horno de microondas|microwave oven; la lámpara|lamp; la lavadora|washing machine; el lavaplatos|dishwasher;
el librero|bookcase; la mesa|table; el mueble|piece of furniture; el ordenador|computer (Spain); el piano|piano;
la pintura|painting; el refrigerador|refrigerator; el reloj|clock; el reloj despertador|alarm clock;
el reproductor de blu-ray|Blu-ray player; el reproductor de MP3|MP3 player; la secadora|tumble dryer; la silla|chair;
el sillón|armchair; el sofá|sofa; el televisor|TV set; el tocador|dressing table"""),
("Los quehaceres del hogar", "Housework", """
v:cocinar|to cook; x:cortar el césped|to mow the lawn; x:cuidar a los niños|to look after the children; x:ir de compras|to go shopping;
x:lavar los platos|to wash the dishes; x:limpiar la casa|to clean the house; x:pasar la aspiradora|to vacuum;
x:planchar la ropa|to iron the clothes; x:poner la mesa|to set the table; x:quitar la mesa|to clear the table;
x:sacar la basura|to take out the rubbish; x:sacudir los muebles|to dust the furniture"""),
("La ciudad", "The city", """
la acera|pavement, sidewalk; el aeropuerto|airport; la aldea|village; el almacén|department store; la avenida|avenue;
el ayuntamiento|town hall; el banco|bank; el barrio|neighbourhood; la biblioteca|library; la bodega|grocery store; el café|café;
la calle|street; la carnicería|butcher's; la catedral|cathedral; el centro comercial|shopping centre; el centro juvenil|youth centre;
el cine|cinema; el cuartel de policía|police station; el correo|post office; la corte|court; el edificio|building;
la escuela|school; la estación|station; el estadio|stadium; la fábrica|factory; la farmacia|chemist's, pharmacy;
la ferretería|hardware shop; la florería|florist's; la frutería|fruit shop; la gasolinera|petrol station; el hospital|hospital;
el hotel|hotel; la iglesia|church; la joyería|jeweller's; la lavandería|launderette; la librería|bookshop; el mercado|market;
el monumento|monument; el museo|museum; la panadería|bakery; el parque|park; la estación de bomberos|fire station;
la pastelería|cake shop; la perfumería|perfume shop; la piscina|swimming pool; la plaza|square; el pueblo|town, village;
el puente|bridge; el rascacielos|skyscraper; el restaurante|restaurant; la sinagoga|synagogue; el suburbio|suburb;
el supermercado|supermarket; el teatro|theatre; el templo|temple; la terminal de autobuses|bus station; la tienda|shop;
la tienda de ropa|clothes shop; la tintorería|dry cleaner's; la universidad|university; el vecindario|neighbourhood;
la zapatería|shoe shop"""),
("Los animales", "Animals", """
la abeja|bee; la araña|spider; la ardilla|squirrel; la ballena|whale; el buey|ox; el burro|donkey; el caballo|horse;
la cabra|goat; el canguro|kangaroo; la cebra|zebra; el cisne|swan; el cochino|pig; el cocodrilo|crocodile; el conejo|rabbit;
el elefante|elephant; la gallina|hen; el gallo|rooster; el gato|cat; la jirafa|giraffe; el león|lion; el leopardo|leopard;
el lobo|wolf; el mono|monkey; el murciélago|bat; el oso|bear; la oveja|sheep; el pájaro|bird; la pantera|panther;
el pavo|turkey; el perro|dog; el pez|fish; el pollo|chicken; la serpiente|snake; el tigre|tiger; el tiburón|shark;
la tortuga|turtle, tortoise; la vaca|cow; el zorro|fox"""),
("Las comidas", "Meals", """
el almuerzo|lunch; el apetito|appetite; la botella|bottle; la cena|dinner, supper; la comida|meal, food; la cuenta|bill, check;
el desayuno|breakfast; el menú|menu; la propina|tip"""),
("Los cubiertos", "Cutlery and tableware", """
la cuchara|spoon; la cucharita|teaspoon; el cuchillo|knife; el mantel|tablecloth; el plato|plate, dish; la servilleta|napkin;
la taza|cup; el tenedor|fork; el vaso|glass"""),
("La comida", "Food and drink", """
el agua mineral|mineral water; el arroz|rice; el azúcar|sugar; el bistec|steak; el café|coffee; la carne|meat;
la carne de res|beef; el cereal|cereal; la cereza|cherry; el chícharo|pea; el chocolate|chocolate; el cordero|lamb;
los dulces|sweets, candy; el elote|corn on the cob (Mexico); la ensalada|salad; la espinaca|spinach; la fresa|strawberry;
la fruta|fruit; la hamburguesa|hamburger; el helado|ice cream; el huevo|egg; el jamón|ham; las judías verdes|green beans;
el jugo|juice; el kétchup|ketchup; la leche|milk; la lechuga|lettuce; las legumbres|pulses, vegetables; el limón|lemon;
la limonada|lemonade; la mantequilla|butter; la manzana|apple; los mariscos|seafood; la mayonesa|mayonnaise;
el melocotón|peach; la mermelada|jam, marmalade; la mostaza|mustard; el pan|bread; el pan tostado|toast; el panecillo|bread roll;
la papa|potato; las papas fritas|chips, French fries; el pastel|cake; la pera|pear; el pescado|fish (food); la pimienta|pepper;
la pizza|pizza; el plátano|plantain, banana; el queso|cheese; la sal|salt; la salchicha|sausage; el sándwich|sandwich;
la sopa|soup; el té|tea; la ternera|veal; el tomate|tomato; la uva|grape; las verduras|vegetables, greens; la zanahoria|carrot"""),
("El cuerpo", "The body", """
la barba|beard; la barbilla|chin; el bigote|moustache; la boca|mouth; el brazo|arm; el cabello|hair; la cabeza|head;
la cara|face; las cejas|eyebrows; el codo|elbow; el corazón|heart; el cuello|neck; el cuerpo|body; el dedo|finger;
el dedo del pie|toe; el diente|tooth; la espalda|back; el estómago|stomach; la frente|forehead; la garganta|throat;
el hombro|shoulder; el labio|lip; la lengua|tongue; la mano|hand; la mejilla|cheek; la muela|molar, back tooth; la nariz|nose;
el oído|(inner) ear; el ojo|eye; la oreja|(outer) ear; la pantorrilla|calf; el párpado|eyelid; el pecho|chest; el pelo|hair;
las pestañas|eyelashes; el pie|foot; la piel|skin; la pierna|leg; la rodilla|knee; el rostro|face; la sangre|blood;
el tobillo|ankle"""),
("Las enfermedades", "Illnesses", """
x:tener dolor de cabeza|to have a headache; x:tener dolor de estómago|to have stomach ache; x:tener dolor de garganta|to have a sore throat;
x:tener dolor de pie|to have a sore foot; la apendicitis|appendicitis; el asma|asthma; el dolor|pain; la energía|energy;
la fiebre|fever; la fractura|fracture; la fuerza|strength; la gripe|flu; la infección|infection; la neumonía|pneumonia;
las paperas|mumps; la pulmonía|pneumonia; la quemadura|burn; el resfriado|cold; la rotura|break, fracture;
el sarampión|measles; la tos|cough; la urgencia|emergency; la varicela|chickenpox"""),
("La salud", "Health: related words", """
el accidente|accident; la ambulancia|ambulance; la aspirina|aspirin; el cuidado|care; la cura|cure; la enfermera|nurse;
el enfermo|patient, sick person; la medicina|medicine; la pomada|ointment; el reposo|rest; la salud|health; el sudor|sweat;
la temperatura|temperature; el tratamiento|treatment; la vacuna|vaccine"""),
("La escuela", "School", """
el alumno|pupil; el aula|classroom; el banco|bench; el bolígrafo|ballpoint pen; la calculadora|calculator;
el calendario|calendar; la clase|class; el colegio|school; el consejero|counsellor; el cuaderno|exercise book, notebook;
el diccionario|dictionary; el dictado|dictation; el director|head teacher, principal; el ejercicio|exercise; el error|mistake;
la escuela|school; la escuela primaria|primary school; la escuela secundaria|secondary school; el estudiante|student;
el estudio|study; el examen|exam, test; la explicación|explanation; la falta|mistake; la fila|line, queue; la frase|sentence;
la goma de borrar|rubber, eraser; la gramática|grammar; el horario de clases|timetable; el lápiz|pencil; la lección|lesson;
la lectura|reading; el libro|book; el maestro|teacher; el mapa|map; la materia|subject; la mochila|backpack, school bag;
la nota|mark, grade; la oración|sentence; la página|page; la palabra|word; el papel|paper; el patio|playground;
la pizarra|blackboard; la pluma|pen; la poesía|poetry; la pregunta|question; el profesor|teacher; el pupitre|school desk;
la regla|ruler; la respuesta|answer; el resumen|summary; la sala de clases|classroom; la tarea|homework; las tijeras|scissors;
el timbre|bell; la tiza|chalk; el trabajo|work; los útiles|school supplies; el vocabulario|vocabulary"""),
("Las materias", "School subjects", """
el álgebra|algebra; las artes industriales|design and technology; la artesanía|arts and crafts; el inglés|English;
la biología|biology; la química|chemistry; el dibujo|drawing; la educación física|PE; el español|Spanish;
la geografía|geography; la historia|history; la informática|computer science; el latín|Latin; las matemáticas|maths;
la física|physics; la ciencia|science; la tecnología|technology"""),
("Las actividades escolares", "School activities", """
la banda|band; el círculo|club; el círculo de matemáticas|maths club; el círculo dramático|drama club;
el círculo español|Spanish club; el círculo internacional|international club; el coro|choir; el equipo|team;
el equipo de béisbol|baseball team; el equipo de fútbol|football team; la excursión|school trip; la orquesta|orchestra"""),
("Oficios y profesiones", "Jobs and professions", """
el/la abogado(-a)|lawyer; el actor|actor; la actriz|actress; el/la atleta|athlete; el/la artista|artist, performer;
el/la bombero(-a)|firefighter; el/la campesino(-a)|farm worker; el/la carnicero(-a)|butcher; el/la cartero(-a)|postman, postwoman;
el/la científico(-a)|scientist; el/la cocinero(-a)|cook, chef; el/la comerciante|shopkeeper, merchant; el/la dentista|dentist;
el/la dependiente|shop assistant; el/la director(-ora)|manager, director; el/la diseñador(-ora)|designer;
el/la enfermero(-a)|nurse; el/la escritor(-ora)|writer; el/la farmacéutico(-a)|pharmacist; el/la gerente|manager;
el/la ingeniero(-a)|engineer; el/la investigador(-ora)|researcher; el/la juez(-a)|judge; el/la médico(-a)|doctor;
el/la mesero(-a)|waiter (Latin America); el/la mozo(-a)|waiter; el/la músico(-a)|musician; el/la obrero(-a)|labourer, worker;
el/la panadero(-a)|baker; el/la peluquero(-a)|hairdresser; el/la piloto|pilot; el/la pintor(-ora)|painter; el poeta|poet;
la poetisa|poet (female); el/la policía|police officer; el/la presidente(-a)|president; la profesión|profession;
el/la profesor(-ora)|teacher; el/la programador(-ora)|programmer; el/la secretario(-a)|secretary; el/la soldado|soldier"""),
("Los pasatiempos", "Hobbies and free time", """
el baile|dance; el campo|countryside; el centro comercial|shopping centre; el cine|cinema; el concierto|concert;
el deporte|sport; el día feriado|public holiday; el día libre|day off; la discoteca|nightclub; el estadio|stadium;
la exposición|exhibition; la feria|fair; la fiesta|party, celebration; la isla tropical|tropical island; la montaña|mountain;
el museo|museum; los naipes|playing cards; la ópera|opera; el parque nacional|national park; el parque zoológico|zoo;
el partido|game, match; el paseo|walk; la pelota|ball; la playa|beach; el teatro|theatre; la televisión|television;
las vacaciones|holidays, vacation"""),
("Los deportes", "Sports", """
el alpinismo|mountaineering; el atletismo|athletics; el barco de vela|sailing boat; el béisbol|baseball;
el esquí acuático|water-skiing; el fútbol|football, soccer; el fútbol americano|American football; los bolos|bowling;
el buceo|diving; la carrera|race, running; el esquí|skiing; el golf|golf; el hockey|hockey; la natación|swimming"""),
("El teléfono", "The telephone", """
la cabina telefónica|phone box; la tarjeta telefónica|phone card; v:colgar|to hang up; v:descolgar|to pick up (the phone);
el buzón de voz|voicemail; la guía telefónica|phone book; x:larga distancia|long distance; la llamada|call;
el contestador automático|answering machine; v:marcar|to dial; el número equivocado|wrong number; a:ocupado|busy, engaged;
el auricular|receiver"""),
("El correo", "The post office", """
el apartado postal|PO box; el buzón|postbox, mailbox; la carta|letter; el cartero|postman; el código postal|postcode;
el correo|post, mail; la dirección|address; la estampilla|stamp; el giro postal|money order; el paquete|parcel;
x:por avión|by airmail; el sobre|envelope; la tarjeta postal|postcard; el telegrama|telegram; la ventanilla|counter window"""),
("El banco", "The bank", """
el billete|banknote; la caja|till, cashier's desk; el/la cajero(-a)|cashier; la caja fuerte|safe; el cajero automático|cash machine, ATM;
el cambio|exchange rate, change; el cheque de viajero|traveller's cheque; la cuenta de ahorros|savings account;
la cuenta corriente|current account; v:depositar|to deposit; el depósito|deposit; el dinero|money; el efectivo|cash;
la moneda|coin, currency; v:retirar|to withdraw; el retiro|withdrawal; la transferencia electrónica|bank transfer;
la aduana|customs; el aduanero|customs officer; el seguro social|social security"""),
("La ropa", "Clothes", """
el abrigo|coat; la blusa|blouse; el bolsillo|pocket; las botas|boots; la bufanda|scarf; el calcetín|sock; la camisa|shirt;
la camiseta|T-shirt; el chaleco|waistcoat, vest; la chaqueta|jacket; el cinturón|belt; la corbata|tie; la falda|skirt;
la gorra|cap; los guantes|gloves; el impermeable|raincoat; el pantalón|trousers, pants; el pantalón corto|shorts;
las medias|tights, pantyhose; el pañuelo|handkerchief; la ropa|clothes; el saco|jacket (Latin America); las sandalias|sandals;
el sombrero|hat; el suéter|jumper, sweater; los tenis|trainers, sneakers; los tirantes|braces, suspenders; el traje|suit;
el traje de baño|swimsuit; el vestido|dress; el zapato|shoe"""),
("Los colores", "Colours", """
a:amarillo|yellow; a:anaranjado|orange; a:azul|blue; a:blanco|white; a:café|brown (Latin America); a:gris|grey;
a:marrón|brown; a:morado|purple; a:negro|black; a:rojo|red; a:rosado|pink; a:verde|green; a:violeta|violet"""),
("Las telas y los materiales", "Fabrics and materials", """
el algodón|cotton; el encaje|lace; el fieltro|felt; la franela|flannel; la gamuza|suede; la lana|wool; el lino|linen;
el nailon|nylon; la piel|leather, fur; el poliéster|polyester; el raso|satin; la seda|silk; el terciopelo|velvet"""),
("La joyería", "Jewellery", """
el anillo|ring; el arete|earring; la argolla|wedding ring; el broche|brooch; la cadena|chain; el collar|necklace;
el prendedor|pin, brooch; la pulsera|bracelet; el reloj|watch; la sortija|ring"""),
("Piedras preciosas y metales", "Gems and metals", """
el brillante|diamond (cut); el diamante|diamond; la esmeralda|emerald; la perla|pearl; el rubí|ruby; el zafiro|sapphire;
el topacio|topaz; el oro|gold; la plata|silver; el platino|platinum"""),
("El viaje y el transporte", "Travel and transport", """
el aeropuerto|airport; el alojamiento|accommodation; el asiento|seat; el aterrizaje|landing; el autobús|bus;
el automóvil|car; la autopista|motorway; el avión|plane; el barco|boat, ship; el baúl|trunk; la bicicleta|bicycle;
el billete|ticket (Spain); el boleto|ticket (Latin America); la brújula|compass; la calle|street; el camarote|cabin;
el camino|road, way; el camión|lorry, truck; la camioneta|van; la carretera|road; el carro|car (Latin America);
el compartimiento|compartment; el despegue|take-off; el equipaje|luggage; la escala|stopover; la estación|station;
el ferrocarril|railway; el guía|guide; el horario|timetable; el huésped|guest; el itinerario|itinerary; la llegada|arrival;
la maleta|suitcase; el medio de transporte|means of transport; el metro|underground, subway; la moto|motorbike;
la motocicleta|motorcycle; el muelle|pier; el peaje|toll; la parada|stop, bus stop; el pasajero|passenger; la posada|inn;
la puerta de embarque|boarding gate; la ruta|route; la salida|departure; la tarifa|fare, price; el taxi|taxi;
la terminal de autobuses|bus station; el tranvía|tram; el tren|train; el vapor|steamship; la ventanilla|ticket window;
el viaje|trip, journey; el viajero|traveller; el vuelo|flight"""),
("La política", "Politics", """
el/la alcalde(-esa)|mayor; la asamblea|assembly; el/la ayudante militar|military aide; el ayuntamiento|town hall;
la cámara de diputados|chamber of deputies; el/la candidato(-a)|candidate; la conferencia|conference; el congreso|congress;
la democracia|democracy; los derechos|rights; el desempleo|unemployment; el/la dictador(-ora)|dictator; la dictadura|dictatorship;
el/la diputado(-a)|member of parliament; la economía|economy; el ejército|army; la embajada|embassy;
el/la embajador(-ora)|ambassador; la entrevista|interview; la frontera|border; el gabinete|cabinet; el gobierno|government;
el/la gobernador(-ora)|governor; la guerra|war; el/la guerrillero(-a)|guerrilla fighter; la inflación|inflation;
la insurrección|uprising; el/la jefe(-a) de estado|head of state; la mayoría|majority; el/la ministro(-a)|minister;
la minoría|minority; las noticias|news; el noticiero|news programme; el parlamento|parliament; el partido|party (political);
el periódico|newspaper; el/la periodista|journalist; el plazo|term, deadline; el poder ejecutivo|executive power;
el/la político(-a)|politician; el/la presidente(-a)|president; el/la primer(-a) ministro(-a)|prime minister;
la primera dama|first lady; el programa|programme, platform; la rebeldía|rebellion; la recesión|recession; la reina|queen;
la república|republic; la revista|magazine; la revolución|revolution; el rey|king; el senado|senate;
el/la senador(-ora)|senator; los titulares|headlines; el tratado|treaty; el/la vicepresidente(-a)|vice-president"""),
("La vida cultural", "Cultural life", """
el/la acomodador(-ora)|usher; el acto|act; las artes|the arts; el/la artista|artist, performer; el auditorio|auditorium;
el ballet|ballet; la cola|queue, line; la comedia|comedy; el/la compositor(-ora)|composer; el concierto|concert;
la cultura|culture; el/la dramaturgo(-a)|playwright; la escena|scene; el/la escultor(-ora)|sculptor; la escultura|sculpture;
el espectáculo|show; la estrella|star; la exposición|exhibition; la fila|row; la función|performance, showing;
la música|music; el/la músico(-a)|musician; la obra de teatro|play; la ópera|opera; la orquesta|orchestra;
el personaje|character; el/la pintor(-ora)|painter; la pintura|painting; la poesía|poetry; el poeta|poet; la poetisa|poet (female);
el reparto|cast; la taquilla|box office; el teatro|theatre"""),
]

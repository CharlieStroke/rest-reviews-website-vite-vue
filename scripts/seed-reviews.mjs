/**
 * seed-reviews.mjs
 * Inyecta ~100 reseñas realistas distribuidas entre los 4 establecimientos.
 * Uso: node scripts/seed-reviews.mjs
 */

const BASE_URL = 'http://localhost:3000';
const EMAIL    = 'carlos.gomez@anahuac.mx';
const PASSWORD = 'carloscarlos';

// ── Establecimientos ────────────────────────────────────────────────────────
const ESTABLISHMENTS = {
  delyFull:       'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b21',
  guajaquenito:   'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
  cuckooResto:    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b23',
  cuckooBox:      '96e8f23d-08d6-400e-9d26-03d05edbd74f',
};

// ── Pool de reseñas por establecimiento ─────────────────────────────────────
// Cada entrada: [foodScore, serviceScore, priceScore, comment]
// Distribución intencional: ~35% positivo, ~30% neutral, ~35% negativo

const REVIEWS = {
  delyFull: [
    // POSITIVAS
    [5, 5, 5, 'Las tortas de DelyFull son increíbles, el pan siempre fresco y el relleno generoso. El mejor lugar para comer entre clases.'],
    [5, 4, 4, 'Pedí la quesadilla de huitlacoche y quedé muy satisfecho, el sabor fue auténtico y la porción más que suficiente para una comida.'],
    [4, 5, 4, 'El servicio fue muy amable, me atendieron rápido y la comida llegó caliente. Las enchiladas verdes estaban deliciosas y bien condimentadas.'],
    [5, 4, 5, 'Excelente relación precio-calidad. Por menos de cincuenta pesos comí una torta completa con agua fresca incluida, muy recomendable.'],
    [4, 4, 4, 'La sopa del día estuvo muy sabrosa, me sorprendió la calidad considerando que es comida universitaria. El personal fue amable y eficiente.'],
    [5, 5, 4, 'Los tacos de DelyFull son de lo mejor del campus, la carne bien sazonada y las tortillas hechas al momento. Sin duda volvería a pedir.'],
    [4, 5, 5, 'Muy buena atención, pedí la ensalada con pollo y llegó en menos de cinco minutos. Los precios son muy accesibles para ser comida del campus.'],
    [5, 4, 4, 'La torta de pierna estuvo deliciosa, bien caliente y con todos los ingredientes frescos. El servicio fue rápido a pesar de que había mucha gente.'],
    // NEUTRAS
    [3, 3, 3, 'La comida estuvo bien, nada extraordinario pero cumple su función. Las quesadillas son normales, el servicio tarda un poco en hora pico.'],
    [3, 4, 3, 'Pedí los tacos de bistec y estuvieron regulares, la carne un poco seca pero las tortillas estaban bien. El precio es razonable para el campus.'],
    [4, 3, 3, 'La torta de milanesa estaba bien pero el pan estaba un poco duro. El servicio fue correcto aunque tuvieron que repetir mi orden dos veces.'],
    [3, 3, 4, 'Comida correcta y precios justos. No es el mejor lugar del campus pero es conveniente y rápido cuando tienes poco tiempo entre clases.'],
    [3, 4, 4, 'Pedí las enchiladas rojas y estuvieron aceptables, el mole era de lata pero el arroz sí estaba bien hecho. El personal fue amable durante la espera.'],
    [4, 3, 3, 'El pozole del día estuvo bueno pero la porción fue un poco chica para el precio. El servicio fue normal, sin nada destacable positivo ni negativo.'],
    // NEGATIVAS
    [1, 2, 2, 'La torta llegó completamente fría y el pan estaba duro, tuve que esperar casi veinte minutos y al final la comida no valió la pena el tiempo.'],
    [2, 1, 2, 'El servicio fue muy lento y grosero, pedí una quesadilla sencilla y tardé quince minutos. La comida llegó tibia y sin el queso que pedí extra.'],
    [2, 2, 1, 'Los precios subieron pero la calidad bajó mucho. Pagué ochenta pesos por una torta pequeña y fría, definitivamente no volvería a pedir aquí.'],
    [1, 3, 2, 'Los tacos de bistec estaban crudos por dentro y con muy poco relleno. Fue una experiencia terrible, me dolió el estómago después de comer.'],
    [2, 2, 2, 'La comida estuvo muy por debajo de las expectativas. El arroz estaba duro, los frijoles aguados y el pollo sin sabor. No lo recomendaría.'],
    [2, 1, 3, 'Me cobraron de más y cuando lo señalé el encargado fue grosero. La comida además estaba fría. Una experiencia muy desagradable en general.'],
    [1, 2, 2, 'Pedí la sopa de fideos y llegó fría con fideos pasados de cocción. La presentación era descuidada y el sabor muy insípido para lo que cobran.'],
    [2, 3, 1, 'Los precios son abusivos para la calidad que ofrecen. Por esa cantidad de dinero esperaría al menos que la comida llegara caliente y bien condimentada.'],
    [3, 2, 2, 'El servicio tardó demasiado y cuando reclamé me dijeron que esperara sin dar explicación. La comida llegó regular, ni buena ni terrible.'],
    [2, 2, 2, 'La tortilla de los tacos estaba quemada y el relleno escaso. Para el precio que manejan esperaba mucho más cantidad y calidad en cada platillo.'],
    [1, 1, 2, 'Encontré un cabello en mi comida y cuando lo reporté nadie se disculpó ni ofreció solución. Pésima higiene y peor actitud del personal de cocina.'],
  ],

  guajaquenito: [
    // POSITIVAS
    [5, 5, 4, 'La tlayuda de Guajaquenito es auténtica oaxaqueña, con quesillo fresco y tasajo bien asado. Una experiencia gastronómica que vale cada peso pagado.'],
    [5, 4, 5, 'El mole negro es increíble, con la complejidad de sabores que solo la cocina oaxaqueña puede ofrecer. Los tamales de rajas también estaban exquisitos.'],
    [4, 5, 4, 'Excelente atención, el personal explica cada platillo con orgullo. El membrillo con queso como postre fue la perfecta conclusión de una gran comida.'],
    [5, 4, 4, 'Pedí el estofado de Oaxaca y fue una revelación culinaria. La carne suave, la salsa equilibrada y las verduras frescas. Muy recomendable para conocer la cocina local.'],
    [4, 4, 5, 'Los precios son muy justos considerando la calidad y autenticidad de la cocina oaxaqueña que ofrecen. Las memelas estaban perfectas de sabor y consistencia.'],
    [5, 5, 5, 'Todo en Guajaquenito es excepcional: la comida auténtica, el servicio cálido y los precios accesibles. El mole amarillo superó completamente mis expectativas.'],
    [4, 4, 4, 'El tasajo asado estaba perfectamente condimentado y la porción generosa. Vine acompañado y todos quedamos muy satisfechos con los platillos que ordenamos.'],
    [5, 3, 4, 'La comida es extraordinaria, el mole coloradito de los domingos es insuperable. Solo el servicio podría mejorar un poco en tiempo de respuesta durante horas pico.'],
    // NEUTRAS
    [3, 3, 3, 'La comida es auténtica oaxaqueña pero para quienes no estamos acostumbrados al mole puede resultar muy pesada. El servicio fue normal y los precios razonables.'],
    [4, 3, 3, 'Los tamales de chipilín estaban bien pero esperaba un sabor más intenso. El servicio tardó bastante aunque al final la calidad de la comida compensó la espera.'],
    [3, 4, 3, 'Pedí la tlayuda y la encontré demasiado grande para terminarla sola. El sabor era correcto pero no me convenció del todo el nivel de picante de la salsa.'],
    [3, 3, 4, 'Comida típica oaxaqueña correcta, aunque algunos platillos estaban demasiado condimentados para mi gusto personal. Los precios son adecuados para la oferta que tienen.'],
    [4, 3, 3, 'El membrillo con queso como postre estuvo bueno, aunque la orden principal del estofado estaba un poco fría. El servicio fue amable pero lento en horario de comida.'],
    [3, 3, 3, 'Experiencia regular, la comida cumple con ser típica oaxaqueña pero no superó expectativas. El ambiente es ruidoso en hora pico y el servicio no muy atento.'],
    // NEGATIVAS
    [2, 2, 2, 'El mole llegó frío y con una consistencia extraña, nada parecido a un mole auténtico. Para el precio que cobran esperaba mucha más calidad y autenticidad en la comida.'],
    [1, 2, 2, 'Los tamales estaban fríos y con muy poco relleno. Pagué un precio considerable y recibí algo que claramente no era casero ni fresco. Decepcionante experiencia.'],
    [2, 1, 3, 'El servicio fue pésimo, el mesero me ignoró durante diez minutos a pesar de estar parado frente a él. La tlayuda llegó sin el quesillo que pedí especialmente.'],
    [3, 2, 1, 'Los precios son exagerados para una cafetería universitaria. Pagué ciento veinte pesos por una porción pequeña de tasajo que en cualquier mercado costaría la mitad.'],
    [2, 3, 2, 'El mole negro tenía un sabor artificial, claramente hecho con pasta comercial en lugar de preparación artesanal. Para llamarse cocina oaxaqueña debería ser más auténtico.'],
    [1, 2, 2, 'Encontré la comida con un olor raro y decidí no terminarla. El personal no fue empático cuando lo comenté. La higiene del lugar deja mucho que desear.'],
    [2, 1, 2, 'Tardaron cuarenta minutos en traer mi orden y cuando llegó estaba completamente fría. Le pedí que la calentaran y el encargado me dijo que no era posible.'],
    [2, 2, 1, 'Precios de restaurante gourmet con calidad de comida rápida congelada. La tlayuda llegó con la masa cruda por un lado y quemada por el otro. Muy malo.'],
    [3, 2, 2, 'El servicio es desorganizado, me cobraron un platillo diferente al que pedí. La comida estaba pasable pero la experiencia en general fue bastante frustrante.'],
    [1, 3, 2, 'La tortilla de los tamales estaba correosa y el mole sin sabor. Para ser un lugar que presume cocina oaxaqueña auténtica la ejecución fue realmente decepcionante.'],
    [2, 2, 2, 'Pedí el estofado y llegó frío con la carne dura. La presentación era descuidada y el sabor muy genérico. No recomendaría este lugar a nadie que quiera cocina oaxaqueña real.'],
  ],

  cuckooResto: [
    // POSITIVAS
    [5, 5, 4, 'El capuchino de Cuckoo Coffee es de los mejores del campus, bien preparado con una crema perfecta. El brownie que pedí de postre también estaba excepcional.'],
    [4, 5, 4, 'Vine a estudiar y el ambiente es ideal: tranquilo, con buen wifi y el café llegó exactamente como lo pedí. Los sándwiches también son muy buenos y frescos.'],
    [5, 4, 5, 'El menú de lunch es muy completo y a precios razonables. La pasta carbonara estaba cremosa y la porción generosa. El servicio fue rápido y muy amable.'],
    [4, 4, 4, 'Muy buen lugar para tomar un descanso entre clases. El americano estuvo perfectamente preparado y el personal fue atento sin ser intrusivo durante mi estancia.'],
    [5, 5, 5, 'Cuckoo Coffee es el mejor lugar del campus para reuniones de trabajo. El espresso doble estuvo perfecto y la ensalada César llegó fresca y bien aderezada.'],
    [4, 4, 5, 'Precios muy justos para la calidad que ofrecen. Pedí el sandwich de pavo y estaba fresco con ingredientes de buena calidad. El té helado también estaba excelente.'],
    [5, 4, 4, 'El frappuccino de caramelo fue exactamente lo que necesitaba para aguantar la tarde de exámenes. El personal fue muy amable y rápido para atender el pedido.'],
    [4, 5, 4, 'Excelente servicio, el barista supo recomendarme la bebida perfecta para mi gusto. La pasta del día también estaba muy bien preparada y la porción fue suficiente.'],
    // NEUTRAS
    [3, 4, 3, 'El café estuvo aceptable pero no extraordinario para el precio. El ambiente es agradable para estudiar aunque a veces está muy lleno y es difícil encontrar mesa.'],
    [4, 3, 3, 'La comida del menú ejecutivo estuvo bien pero tardó bastante en llegar. El café sí estuvo bueno como siempre, el problema fue la coordinación entre caja y cocina.'],
    [3, 3, 3, 'Pedí el sandwich club y estaba correcto, nada especial. El café americano también cumplió su función. El lugar es cómodo pero los precios podrían ser más accesibles.'],
    [3, 4, 3, 'El lugar es cómodo y el wifi funciona bien para estudiar. La comida es regular, no destaca especialmente pero tampoco decepciona. El servicio fue atento y rápido.'],
    [4, 3, 4, 'El capuchino de la tarde estaba bien aunque un poco frío para mi gusto. La rebanada de pastel de zanahoria estaba sabrosa. Buen lugar para una pausa relajada.'],
    [3, 3, 3, 'Ambiente agradable pero la comida no cumplió las expectativas. El sandwich llegó sin uno de los ingredientes y el café estaba apenas tibio. Podría mejorar bastante.'],
    // NEGATIVAS
    [2, 2, 2, 'El café llegó frío y cuando lo pedí de nuevo tardaron diez minutos más. Para ser una cafetería especializada en café esperaba mucho mejor preparación y temperatura.'],
    [3, 1, 2, 'El servicio fue pésimo, nadie se acercó a atender la mesa durante quince minutos. Tuve que ir a la caja a pedir yo mismo la orden. La comida estuvo regular nomás.'],
    [2, 2, 1, 'Los precios son muy elevados para la calidad que ofrecen. Pagué ochenta pesos por un americano aguado que claramente estaba hecho con café de mala calidad.'],
    [1, 3, 2, 'La pasta llegó fría y sin sal, completamente insípida. Le pedí al mesero que la cambiara y me dijo que era imposible. Nunca esperaría esto de un lugar así.'],
    [2, 2, 2, 'El frappuccino tenía sabor artificial y demasiado dulce. La galleta que pedí estaba rancia. Para lo que cobran esperaba productos frescos y de buena calidad.'],
    [3, 1, 2, 'Me ignoraron durante veinte minutos mientras otras mesas recibían su pedido antes que yo. Cuando reclamé fueron groseros. La bebida estuvo regular para el precio.'],
    [2, 2, 1, 'Absolutamente caro para la calidad. El sandwich de pavo estaba seco, el pan duro y el café sin sabor. No justifica en absoluto los precios que manejan actualmente.'],
    [1, 2, 2, 'El café americano sabía a agua caliente con colorante, sin cuerpo ni aroma. Para llamarse cafetería especializada debería invertir en mejores granos y preparación.'],
    [2, 3, 2, 'La pasta carbonara llegó con la salsa cortada y fría. Le avisé al mesero y solo se encogió de hombros. Experiencia muy desagradable que no repetiría jamás.'],
    [3, 1, 2, 'El tiempo de espera fue absurdo, tardaron treinta minutos en traer un café y un sandwich. El lugar no estaba lleno así que no hay justificación para tanta demora.'],
    [2, 2, 2, 'El ambiente se deterioró mucho, las mesas estaban sucias y el piso también. Para ser la cafetería más cara del campus debería tener mejores estándares de limpieza.'],
  ],

  cuckooBox: [
    // POSITIVAS
    [5, 4, 5, 'El box de pollo BBQ de Cuckoo Box es mi favorito del campus, muy abundante y con las papas perfectamente crujientes. Excelente relación precio-calidad.'],
    [4, 5, 4, 'Pedí el box de nuggets con salsa ranch y estuvo delicioso. El personal fue muy amable y rápido, me atendieron en menos de cinco minutos pese a la fila.'],
    [5, 4, 4, 'Las alitas de la semana son increíbles, con el marinado perfecto. El box completo con papas y refresco es muy conveniente para comer entre clases rápidamente.'],
    [4, 4, 5, 'Por el precio de Cuckoo Box obtienes una porción generosa y de buena calidad. Las papas gajo son las mejores del campus, bien condimentadas y crujientes siempre.'],
    [5, 5, 4, 'Muy buen servicio, el personal siempre está de buen humor y la comida llega rápido. El box especial del viernes vale completamente la pena por la cantidad que dan.'],
    [4, 4, 4, 'El combo de pollo frito con ensalada coleslaw estuvo muy bueno, la carne jugosa y bien condimentada. Los precios son accesibles para el nivel de calidad que manejan.'],
    [5, 3, 5, 'La comida en Cuckoo Box siempre está fresca y caliente, nunca me han fallado en ese aspecto. Las papas crujientes y el pollo jugoso hacen la combinación perfecta.'],
    [4, 5, 4, 'El servicio de Cuckoo Box es el más rápido del campus, ideal para cuando tienes solo veinte minutos de descanso. La calidad es consistente y los precios razonables.'],
    // NEUTRAS
    [3, 3, 3, 'Las papas estaban bien aunque un poco blandas para mi gusto. El pollo estuvo correcto pero nada extraordinario. El servicio fue normal y la espera razonable.'],
    [3, 4, 3, 'Pedí el box básico y estuvo aceptable, aunque las papas llegaron frías esta vez. El personal fue amable pero la comida en sí no fue tan buena como otras visitas.'],
    [4, 3, 3, 'El pollo estuvo bien condimentado pero la porción me pareció un poco pequeña para el precio. El servicio fue correcto aunque la caja tardó en procesar el pago.'],
    [3, 3, 4, 'Comida de fast food correcta, cumple su función cuando tienes prisa. Los precios son razonables pero la calidad es inconsistente dependiendo del día y horario.'],
    [3, 4, 3, 'El box de nuggets estaba bien aunque llegaron un poco fríos. El mesero fue atento pero la cocina tardó más de lo usual para ser un lugar de comida rápida.'],
    [4, 3, 3, 'Las papas gajo estuvieron bien pero el pollo tenía demasiado aceite. La porción fue suficiente y el precio razonable. Nada especial pero tampoco decepcionante.'],
    // NEGATIVAS
    [1, 2, 2, 'El pollo llegó completamente crudo por dentro, tuve que devolverlo. El encargado no se disculpó ni me ofreció compensación alguna. Riesgo para la salud de los estudiantes.'],
    [2, 1, 2, 'Esperé veinticinco minutos por un box simple y cuando llegó estaba frío y grasoso. El personal fue grosero cuando pregunté por mi pedido. Muy mala experiencia.'],
    [2, 2, 1, 'Por esos precios esperaba más calidad. Las papas estaban blandas y frías, el pollo seco y sin sabor. Definitivamente no vale lo que cobran en este establecimiento.'],
    [1, 3, 2, 'El pollo frito estaba rancio, claramente de días anteriores recalentado. El aceite olía mal y la carne tenía una textura horrible. Reporté el problema sin respuesta.'],
    [2, 2, 2, 'La comida llegó fría a pesar de que el lugar estaba casi vacío. Las papas blandas y el pollo sin sazón. Para comida rápida esperaba al menos que llegara caliente.'],
    [3, 1, 2, 'El personal fue muy grosero y tardaron mucho tiempo en atender la caja. Cuando llegó la comida estaba tibia y las papas blandas. Pésimo servicio para comida rápida.'],
    [2, 2, 1, 'Precios que suben cada semana mientras la calidad baja. El box que antes tenía buena porción ahora viene con muy poco pollo y papas de calidad inferior a la habitual.'],
    [1, 2, 2, 'El aceite de la fritura estaba claramente reutilizado muchas veces, la comida tenía un sabor rancio horrible. Me causó malestar estomacal el resto del día de clases.'],
    [2, 3, 2, 'Las papas gajo llegaron crudas por dentro y quemadas por fuera. El pollo estaba aceptable pero la mala experiencia con las papas arruinó el pedido completamente.'],
    [3, 1, 1, 'Muy caro para comida de baja calidad. El servicio además fue pésimo, me dieron el pedido equivocado y no quisieron hacer el cambio. Total pérdida de tiempo y dinero.'],
    [2, 2, 2, 'La comida de Cuckoo Box ha bajado notablemente de calidad. Antes era mi lugar favorito pero ahora el pollo siempre llega seco y las papas frías y sin condimento.'],
  ],
};

// ── Helpers ─────────────────────────────────────────────────────────────────
async function login() {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(`Login failed: ${JSON.stringify(json)}`);
  console.log(`✓ Login exitoso — usuario: ${json.data.user.name} (${json.data.user.role})`);
  return json.data.token;
}

async function createReview(token, establishmentId, food, service, price, comment) {
  const res = await fetch(`${BASE_URL}/api/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ establishmentId, foodScore: food, serviceScore: service, priceScore: price, comment }),
  });
  return res.json();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const token = await login();

  const entries = [
    ...REVIEWS.delyFull.map(r => ['DelyFull',       ESTABLISHMENTS.delyFull,      ...r]),
    ...REVIEWS.guajaquenito.map(r => ['Guajaquenito',  ESTABLISHMENTS.guajaquenito,  ...r]),
    ...REVIEWS.cuckooResto.map(r => ['Cuckoo Resto',   ESTABLISHMENTS.cuckooResto,   ...r]),
    ...REVIEWS.cuckooBox.map(r => ['Cuckoo Box',      ESTABLISHMENTS.cuckooBox,     ...r]),
  ];

  console.log(`\n→ Inyectando ${entries.length} reseñas...\n`);

  let ok = 0, fail = 0;
  for (const [name, id, food, service, price, comment] of entries) {
    const result = await createReview(token, id, food, service, price, comment);
    if (result.success) {
      const stars = `${food}★/${service}★/${price}★`;
      console.log(`  ✓ [${name}] ${stars} — ${comment.slice(0, 60)}…`);
      ok++;
    } else {
      console.warn(`  ✗ [${name}] ERROR: ${JSON.stringify(result)}`);
      fail++;
    }
    // Pequeña pausa para no saturar el servidor
    await sleep(120);
  }

  console.log(`\n✅ Completado: ${ok} creadas, ${fail} fallidas de ${entries.length} total.`);
  console.log('\nSiguiente paso: ejecuta POST /api/metrics/run (admin) para procesar el pipeline.');
}

main().catch(err => {
  console.error('Error fatal:', err.message);
  process.exit(1);
});

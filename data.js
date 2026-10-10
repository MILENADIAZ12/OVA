/* Datos del OVA: Routers y Direccionamiento IP */

const STEPS = [
  { ico: "🏷️", t: "Asignación de IP", d: "El dispositivo obtiene su dirección, normalmente por DHCP desde el router." },
  { ico: "📦", t: "Encapsulado", d: "La aplicación genera datos, que se dividen en paquetes con cabecera IP (origen y destino)." },
  { ico: "🤔", t: "Decisión local", d: "El equipo compara la IP destino con su máscara. Si está en la misma red, lo envía directo; si no, lo manda a su puerta de enlace (el router)." },
  { ico: "📥", t: "Recepción en el router", d: "El router lee la cabecera del paquete para conocer su destino." },
  { ico: "🗺️", t: "Consulta de la tabla", d: "Busca la ruta que mejor coincide. Si no hay coincidencia exacta, elige la del prefijo más largo, es decir, la entrada más específica que contenga al destino. Si nada coincide, usa la ruta por defecto." },
  { ico: "🔁", t: "NAT (si aplica)", d: "En redes domésticas, el router cambia la IP privada por la IP pública compartida." },
  { ico: "➡️", t: "Reenvío", d: "El paquete se envía al router vecino (siguiente salto) indicado en la tabla, y así sucesivamente hasta el destino final." },
  { ico: "✅", t: "Entrega y respuesta", d: "El equipo de destino reensambla los paquetes y la respuesta hace el camino inverso." }
];

const ROUTER_PARTS = {
  puertos: "<b>Puertos:</b> donde se conectan los cables o la fibra, incluido el puerto que va a Internet (WAN).",
  cpu: "<b>Procesador:</b> el \"cerebro\" que calcula las rutas.",
  matriz: "<b>Matriz de conmutación:</b> el circuito que pasa cada paquete al puerto de salida correcto.",
  memorias: "<b>Memorias:</b> RAM (lo que está trabajando y la tabla de rutas), ROM (el arranque), Flash (el sistema operativo) y NVRAM (la configuración guardada).",
  tabla: "<b>Tabla de enrutamiento:</b> guarda cada red de destino, el siguiente router al que hay que enviar y qué tan bueno es ese camino.",
  so: "<b>Sistema operativo:</b> el programa que maneja todo el equipo (en Cisco se llama IOS)."
};

const TIMELINE = [
  { y: "1969–70s", d: "ARPANET, la red que dio origen a Internet, usa los primeros aparatos parecidos a routers (llamados IMP)." },
  { y: "1981–83", d: "Se publica IPv4 (documento RFC 791) y en 1983 ARPANET adopta TCP/IP como su forma oficial de comunicarse." },
  { y: "1980s", d: "Las IPs se organizan por clases (A, B, C). En 1984 nace Cisco y empiezan los routers comerciales." },
  { y: "1990s", d: "Como las IPs empiezan a escasear, aparecen CIDR (1993), las IPs privadas y el NAT. En 1995 se define IPv6." },
  { y: "2000s", d: "Se vuelven comunes los routers Wi-Fi en las casas y BGP se consolida como el protocolo que une Internet." },
  { y: "2011–19", d: "Se acaban las direcciones IPv4 disponibles. En 2017 IPv6 se vuelve estándar oficial de Internet." },
  { y: "2020s", d: "Llegan las redes manejadas por software, el Wi-Fi 6 y 7, los sistemas mesh y crece el uso de IPv6." }
];

/* Actividad 1: ¿pública o privada? (tabla del documento) */
const PP = [
  { ip: "192.168.0.15", priv: true,  why: "Está dentro del rango 192.168.0.0/16 (192.168.x.x), reservado para redes privadas." },
  { ip: "8.8.8.8",      priv: false, why: "No pertenece a ningún rango privado. Es el DNS público de Google, visible en Internet." },
  { ip: "10.20.30.40",  priv: true,  why: "Todo lo que empieza por 10 pertenece al rango privado 10.0.0.0/8." },
  { ip: "172.16.5.4",   priv: true,  why: "El rango privado 172.16.0.0/12 va de 172.16.x.x a 172.31.x.x, y 172.16 está dentro." },
  { ip: "172.32.1.1",   priv: false, why: "¡Trampa! El rango privado llega solo hasta 172.31.255.255. 172.32 ya queda por fuera, así que es pública." },
  { ip: "190.25.100.3", priv: false, why: "190.x.x.x no es un rango privado; es una dirección pública (bloques asignados en Latinoamérica)." },
  { ip: "1.1.1.1",      priv: false, why: "No está en ningún rango privado. Es el DNS público de Cloudflare." },
  { ip: "192.169.1.1",  priv: false, why: "¡Trampa! El rango privado es 192.168.x.x. 192.169 está por fuera, así que es pública." },
  { ip: "172.31.255.10",priv: true,  why: "Es el final del rango 172.16.0.0/12 (172.16 – 172.31), así que todavía es privada." },
  { ip: "181.49.12.7",  priv: false, why: "181.x.x.x no está en ningún rango privado; es una dirección pública." }
];

/* Actividad 2: verdadero o falso */
const TF = [
  { s: "Una IP privada puede usarse directamente para navegar en Internet sin necesidad de NAT.", a: false,
    why: "Las IP privadas no se enrutan en Internet. El router usa NAT para cambiarlas por la IP pública compartida." },
  { s: "La puerta de enlace predeterminada es la IP del router en la red local.", a: true,
    why: "La puerta de enlace es la IP del router (por ejemplo 192.168.1.1), por donde los equipos salen a otras redes." },
  { s: "IPv6 usa direcciones de 128 bits.", a: true,
    why: "IPv6 tiene 128 bits (unos 340 sextillones de direcciones); IPv4 solo tiene 32 bits." },
  { s: "El enrutamiento estático se adapta automáticamente cuando un enlace se cae.", a: false,
    why: "Eso es el enrutamiento dinámico. En el estático, si un camino falla no se arregla solo: el administrador debe cambiar la ruta." },
  { s: "El servidor DNS traduce nombres como google.com a direcciones IP.", a: true,
    why: "Esa es justamente la función del DNS: convertir nombres fáciles de recordar en direcciones IP." },
  { s: "La dirección 172.32.1.1 pertenece al rango privado 172.16.0.0/12.", a: false,
    why: "El rango 172.16.0.0/12 cubre de 172.16.0.0 a 172.31.255.255. 172.32.1.1 queda por fuera, es pública." }
];

/* Actividad 3: ¿misma subred? */
const SUBNETS = [
  { a: "192.168.1.10",  b: "192.168.1.200", p: 24 },
  { a: "192.168.1.10",  b: "192.168.2.10",  p: 24 },
  { a: "10.5.3.1",      b: "10.200.7.9",    p: 8  },
  { a: "172.16.5.4",    b: "172.16.9.20",   p: 16 },
  { a: "192.168.10.20", b: "192.168.10.140",p: 25 },
  { a: "192.168.10.65", b: "192.168.10.100",p: 26 }
];

/* Actividad 4: relacionar */
const MATCH = [
  { k: "Dirección IP",     v: "Número que identifica a cada equipo en la red." },
  { k: "Máscara de subred",v: "Indica qué parte de la IP es la red y qué parte es el equipo." },
  { k: "Puerta de enlace", v: "IP del router por donde se sale a otras redes." },
  { k: "DNS",              v: "Traduce nombres como google.com a direcciones IP." },
  { k: "DHCP",             v: "Reparte las direcciones IP automáticamente." },
  { k: "NAT",              v: "Cambia la IP privada por la IP pública compartida." }
];

/* Evaluación: 12 preguntas con retroalimentación por opción */
const QUIZ = [
  { q: "¿Cuál es la función principal de un router?",
    o: ["Unir varias redes y escoger por dónde enviar los paquetes", "Conectar equipos dentro de la misma red local únicamente", "Traducir nombres de dominio a direcciones IP", "Almacenar las páginas web que se visitan"],
    c: 0,
    w: ["Correcto: el router se conecta al menos a dos redes y, con su tabla de enrutamiento, decide el mejor camino para cada paquete.",
        "Eso describe a un switch, que conecta equipos de la misma red. El router une redes diferentes.",
        "Esa es la función del servidor DNS, no del router.",
        "Un router no almacena páginas; solo reenvía paquetes hacia su destino."] },
  { q: "¿Cuántos bits tiene una dirección IPv4?",
    o: ["16 bits", "32 bits", "64 bits", "128 bits"], c: 1,
    w: ["16 bits darían solo 65.536 direcciones; IPv4 tiene muchas más.",
        "Correcto: IPv4 usa 32 bits (4 octetos de 8 bits), lo que da unos 4.300 millones de direcciones.",
        "64 bits no corresponde a ninguna versión de IP.",
        "128 bits es el tamaño de IPv6, no de IPv4."] },
  { q: "¿Cuál de las siguientes es una dirección IPv6 válida?",
    o: ["192.168.300.1", "10.0.0.1", "2001:db8::1", "00:1A:2B:3C:4D:5E"], c: 2,
    w: ["No es válida ni siquiera en IPv4: cada octeto llega máximo a 255 y aquí hay 300.",
        "Es una dirección IPv4 (privada), no IPv6.",
        "Correcto: IPv6 se escribe en hexadecimal separado por \":\" y \"::\" abrevia grupos de ceros.",
        "Eso es una dirección MAC (física) de 48 bits, no una dirección IP."] },
  { q: "¿Cuál de estas direcciones es PRIVADA?",
    o: ["172.32.0.1", "172.20.10.5", "8.8.4.4", "192.169.0.1"], c: 1,
    w: ["El rango privado 172.16.0.0/12 termina en 172.31.255.255; 172.32 ya es pública.",
        "Correcto: 172.20 está dentro del rango privado 172.16.0.0 – 172.31.255.255.",
        "8.8.4.4 es un DNS público de Google.",
        "El rango privado es 192.168.x.x; 192.169 queda por fuera, es pública."] },
  { q: "La máscara 255.255.255.0 equivale al prefijo:",
    o: ["/8", "/16", "/24", "/32"], c: 2,
    w: ["/8 es 255.0.0.0 (solo el primer octeto es red).",
        "/16 es 255.255.0.0 (dos octetos de red).",
        "Correcto: tres octetos en 255 son 3 × 8 = 24 bits de red, es decir /24.",
        "/32 es 255.255.255.255 y representa una sola dirección (un solo host)."] },
  { q: "El PC 192.168.1.10/24 quiere enviar un paquete a 192.168.2.20. ¿Qué hace?",
    o: ["Lo envía directamente al destino por el switch", "Lo envía a su puerta de enlace (el router)", "Descarta el paquete porque no tiene ruta", "Lo envía como broadcast a toda la red"], c: 1,
    w: ["Solo se envía directo si el destino está en la misma red. Con /24, la red del PC es 192.168.1.0 y la del destino es 192.168.2.0: son distintas.",
        "Correcto: al aplicar la máscara, las redes son distintas (192.168.1.0 vs 192.168.2.0), así que el paquete va a la puerta de enlace.",
        "El PC no descarta el paquete: para redes externas siempre tiene la puerta de enlace.",
        "El broadcast no sirve para llegar a otra red; los routers no reenvían broadcast."] },
  { q: "¿Qué servicio reparte direcciones IP automáticamente a los equipos?",
    o: ["DNS", "NAT", "DHCP", "OSPF"], c: 2,
    w: ["DNS traduce nombres a direcciones IP; no las asigna.",
        "NAT traduce IP privadas a la pública, pero no asigna direcciones a los equipos.",
        "Correcto: el servidor DHCP (normalmente el router en casa) asigna IP, máscara, puerta de enlace y DNS.",
        "OSPF es un protocolo de enrutamiento dinámico entre routers."] },
  { q: "¿Para qué sirve NAT en una red doméstica?",
    o: ["Para que muchos equipos con IP privada compartan una sola IP pública", "Para cifrar la información que viaja por Internet", "Para traducir nombres de páginas web", "Para repartir IPs a los equipos de la casa"], c: 0,
    w: ["Correcto: NAT cambia la IP privada de cada equipo por la IP pública del router. Por eso IPv4 aún no se ha agotado en la práctica.",
        "NAT no cifra información; solo traduce direcciones.",
        "Eso lo hace el DNS.",
        "Eso lo hace el DHCP."] },
  { q: "Si varias rutas de la tabla coinciden con el destino, el router elige:",
    o: ["La ruta con el prefijo más corto", "La ruta con el prefijo más largo (la más específica)", "Siempre la ruta por defecto", "Una ruta al azar"], c: 1,
    w: ["Es al revés: un prefijo corto es más general. El router prefiere la ruta más específica.",
        "Correcto: se elige el prefijo más largo, la entrada más específica que contiene al destino.",
        "La ruta por defecto solo se usa cuando no hay ninguna otra coincidencia.",
        "El router no elige al azar; sigue la regla del prefijo más largo y la métrica."] },
  { q: "¿Qué protocolo une a los proveedores de Internet entre sí?",
    o: ["RIP", "BGP", "DHCP", "EIGRP"], c: 1,
    w: ["RIP es un protocolo de enrutamiento usado dentro de una organización.",
        "Correcto: BGP es el protocolo que intercambia rutas entre proveedores y \"une\" Internet.",
        "DHCP asigna direcciones IP; no es un protocolo de enrutamiento.",
        "EIGRP se usa dentro de una organización, no entre proveedores."] },
  { q: "¿Cuál es una desventaja del enrutamiento ESTÁTICO?",
    o: ["Gasta muchos recursos del router", "Es difícil de configurar en redes pequeñas", "Si un camino falla, no se arregla solo", "Es menos seguro que el dinámico"], c: 2,
    w: ["Al contrario: el estático no gasta recursos del router. Esa es una desventaja del dinámico.",
        "En redes pequeñas el estático es justamente sencillo de configurar.",
        "Correcto: las rutas estáticas no cambian hasta que el administrador las actualiza, por eso no se adaptan a fallas.",
        "El estático se considera más seguro, porque no intercambia información con otros routers."] },
  { q: "En el caso práctico, ¿qué comando ejecuta el PC 1 para comprobar que se comunica con el PC 2?",
    o: ["ipconfig", "ping 192.168.1.11", "ping 192.168.1.10", "nslookup 192.168.1.11"], c: 1,
    w: ["ipconfig muestra la configuración IP del propio equipo, pero no prueba la conexión con otro.",
        "Correcto: ping envía mensajes al PC 2 (192.168.1.11); si hay respuestas, hay comunicación.",
        "192.168.1.10 es la IP del propio PC 1; así solo se prueba a sí mismo.",
        "nslookup consulta el DNS; no comprueba la conectividad entre los equipos."] }
];

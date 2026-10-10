/* OVA Routers y Direccionamiento IP — lógica interactiva */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- utilidades ---------- */
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2400);
  }
  const ipToInt = ip => ip.split(".").reduce((a, o) => (a * 256) + Number(o), 0);
  const intToIp = n => [24, 16, 8, 0].map(s => Math.floor(n / Math.pow(2, s)) % 256).join(".");
  const maskInt = p => p === 0 ? 0 : (Math.pow(2, 32) - Math.pow(2, 32 - p));
  const andInt = (a, b) => { // AND de 32 bits sin perder signo
    let r = 0;
    for (let s = 24; s >= 0; s -= 8) {
      const x = Math.floor(a / Math.pow(2, s)) % 256, y = Math.floor(b / Math.pow(2, s)) % 256;
      r = r * 256 + (x & y);
    }
    return r;
  };
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------- navegación ---------- */
  const sections = $$("#navList a").map(a => a.dataset.sec);
  const visited = new Set();

  function show(id) {
    if (!sections.includes(id)) id = sections[0];
    $$(".sec").forEach(s => s.classList.toggle("active", s.id === id));
    $$("#navList a").forEach(a => a.classList.toggle("active", a.dataset.sec === id));
    visited.add(id);
    $$("#navList a").forEach(a => a.classList.toggle("done", visited.has(a.dataset.sec)));
    const pct = Math.round(visited.size / sections.length * 100);
    $("#progressBar").style.width = pct + "%";
    $("#progressText").textContent = pct + "%";
    const i = sections.indexOf(id);
    $("#prevBtn").style.visibility = i === 0 ? "hidden" : "visible";
    $("#nextBtn").style.visibility = i === sections.length - 1 ? "hidden" : "visible";
    $("#pagerInfo").textContent = (i + 1) + " / " + sections.length;
    $("#sidebar").classList.remove("open");
    window.scrollTo(0, 0);
    setTimeout(() => window.scrollTo(0, 0), 0);
    if (pct === 100 && !show._done) { show._done = true; toast("🎉 ¡Recorriste todas las secciones del OVA!"); }
  }
  function go(id) { if (location.hash.slice(1) === id) show(id); else location.hash = id; }
  window.addEventListener("hashchange", () => show(location.hash.slice(1)));
  $("#prevBtn").onclick = () => go(sections[Math.max(0, sections.indexOf(location.hash.slice(1) || sections[0]) - 1)]);
  $("#nextBtn").onclick = () => go(sections[Math.min(sections.length - 1, sections.indexOf(location.hash.slice(1) || sections[0]) + 1)]);
  $$("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
  $("#menuBtn").onclick = () => $("#sidebar").classList.toggle("open");

  /* ---------- objetivos ---------- */
  const objBoxes = $$("#objGrid input");
  objBoxes.forEach(cb => cb.onchange = () => {
    const n = objBoxes.filter(c => c.checked).length;
    $("#objStatus").textContent = n + " de " + objBoxes.length + " objetivos marcados." + (n === objBoxes.length ? " ¡Excelente! 🎯" : "");
  });

  /* ---------- pestañas de contenido ---------- */
  $$("#contentTabs button").forEach(btn => btn.onclick = () => {
    $$("#contentTabs button").forEach(b => { if (b.classList.contains("active")) b.classList.add("seen"); b.classList.remove("active"); });
    btn.classList.add("active");
    $$(".tab-panel").forEach(p => p.classList.toggle("active", p.id === btn.dataset.tab));
  });

  /* flip cards */
  $$(".flip").forEach(f => {
    const t = () => f.classList.toggle("flipped");
    f.onclick = t;
    f.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); t(); } };
  });

  /* explorador de bits */
  const baseIp = "192.168.10.150";
  function renderBits() {
    const p = Number($("#pfxRange").value);
    $("#pfxVal").textContent = p;
    const octs = baseIp.split(".").map(o => Number(o).toString(2).padStart(8, "0"));
    let idx = 0;
    $("#bitsView").innerHTML = octs.map(o => '<div class="octet">' + o.split("").map(b => '<span class="bit ' + (idx++ < p ? "n" : "h") + '">' + b + "</span>").join("") + "</div>").join("");
    const ipI = ipToInt(baseIp), m = maskInt(p), net = andInt(ipI, m);
    const hosts = Math.pow(2, 32 - p);
    const bc = net + hosts - 1;
    $("#ipFacts").innerHTML =
      '<div><small>Máscara</small><b>' + intToIp(m) + "</b></div>" +
      '<div><small>Dirección de red</small><b>' + intToIp(net) + "</b></div>" +
      '<div><small>Broadcast</small><b>' + intToIp(bc) + "</b></div>" +
      '<div><small>Hosts utilizables</small><b>' + (hosts - 2).toLocaleString("es-CO") + "</b></div>";
  }
  $("#pfxRange").oninput = renderBits;
  renderBits();

  /* stepper de funcionamiento */
  let step = 0;
  $("#stepDots").innerHTML = STEPS.map((s, i) => '<li data-i="' + i + '" title="' + s.t + '">' + (i + 1) + "</li>").join("");
  function renderStep() {
    const s = STEPS[step];
    $("#stepCard").innerHTML = '<div class="step-ico">' + s.ico + '</div><div><p class="eyebrow">Paso ' + (step + 1) + " de " + STEPS.length + "</p><h4>" + s.t + "</h4><p>" + s.d + "</p></div>";
    $$("#stepDots li").forEach((li, i) => { li.classList.toggle("cur", i === step); li.classList.toggle("done", i < step); });
    $("#stepPrev").disabled = step === 0;
    $("#stepNext").textContent = step === STEPS.length - 1 ? "Reiniciar ↺" : "Siguiente paso →";
  }
  $("#stepPrev").onclick = () => { if (step > 0) { step--; renderStep(); } };
  $("#stepNext").onclick = () => { step = step === STEPS.length - 1 ? 0 : step + 1; renderStep(); };
  $$("#stepDots li").forEach(li => li.onclick = () => { step = Number(li.dataset.i); renderStep(); });
  renderStep();

  /* partes del router */
  $$(".r-part").forEach(g => {
    const sel = () => { $$(".r-part").forEach(x => x.classList.remove("sel")); g.classList.add("sel"); $("#partInfo").innerHTML = ROUTER_PARTS[g.dataset.part]; };
    g.addEventListener("mouseenter", sel);
    g.addEventListener("click", sel);
  });

  /* línea de tiempo */
  $("#timeline").innerHTML = TIMELINE.map((t, i) => '<button class="tl-item" data-i="' + i + '"><i class="tl-dot"></i><span>' + t.y + "</span></button>").join("");
  function selTl(i) {
    $$(".tl-item").forEach((b, j) => b.classList.toggle("sel", j === i));
    $("#timelineDetail").innerHTML = "<h4>" + TIMELINE[i].y + "</h4><p>" + TIMELINE[i].d + "</p>";
  }
  $$(".tl-item").forEach(b => b.onclick = () => selTl(Number(b.dataset.i)));
  selTl(0);

  /* ---------- galería / lightbox ---------- */
  $$("[data-zoom]").forEach(fig => fig.onclick = () => {
    const media = fig.querySelector("img, svg").cloneNode(true);
    media.removeAttribute("style");
    $("#lbContent").innerHTML = "";
    $("#lbContent").appendChild(media);
    $("#lightbox").hidden = false;
  });
  $("#lightbox").onclick = e => { if (e.target.id === "lightbox" || e.target.tagName === "BUTTON") $("#lightbox").hidden = true; };
  document.addEventListener("keydown", e => { if (e.key === "Escape") $("#lightbox").hidden = true; });

  /* ---------- diagrama animado ---------- */
  const P = { pc1: [90, 80], pc2: [90, 240], sw: [300, 160], rt: [470, 160], net: [660, 160] };
  const packet = $("#packet");
  let animating = false;
  function hl(id) { $$(".node").forEach(n => n.classList.remove("hl")); if (id) $("#n-" + id).classList.add("hl"); }
  function log(html) { const li = document.createElement("li"); li.innerHTML = html; $("#diagramLog").appendChild(li); }
  function moveSeg(from, to, ms) {
    return new Promise(res => {
      const t0 = performance.now();
      function f(now) {
        const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        packet.setAttribute("transform", "translate(" + (from[0] + (to[0] - from[0]) * e) + "," + (from[1] + (to[1] - from[1]) * e) + ")");
        k < 1 ? requestAnimationFrame(f) : res();
      }
      requestAnimationFrame(f);
    });
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function hop(a, b, node, msg) { await moveSeg(P[a], P[b], 900); hl(node); log(msg); await wait(700); }

  async function simulate(kind) {
    if (animating) return;
    animating = true;
    $$("[data-send]").forEach(b => b.disabled = true);
    $("#diagramLog").innerHTML = "";
    packet.style.display = "";
    packet.setAttribute("transform", "translate(" + P.pc1 + ")");
    hl("pc1");
    if (kind === "local") {
      log("<b>PC 1</b> crea el paquete: origen <code>192.168.1.10</code> → destino <code>192.168.1.11</code>.");
      await wait(900);
      log("Aplica la máscara <code>/24</code>: red de PC 1 = <code>192.168.1.0</code>, red del destino = <code>192.168.1.0</code>. <b>¡Misma red!</b> Se envía directo, sin router.");
      await wait(1200);
      await hop("pc1", "sw", "sw", "El <b>switch</b> recibe la trama y la entrega por el puerto donde está PC 2.");
      await hop("sw", "pc2", "pc2", "✅ <b>PC 2</b> recibe el paquete. El router no intervino porque ambos equipos están en la misma subred.");
    } else {
      log("<b>PC 1</b> crea el paquete: origen <code>192.168.1.10</code> → destino <code>8.8.8.8</code>.");
      await wait(900);
      log("Aplica la máscara <code>/24</code>: <code>8.8.8.8</code> NO está en <code>192.168.1.0/24</code>. Lo envía a su <b>puerta de enlace</b> <code>192.168.1.1</code>.");
      await wait(1200);
      await hop("pc1", "sw", "sw", "El <b>switch</b> lo reenvía hacia el puerto del router.");
      await hop("sw", "rt", "rt", "El <b>router</b> lee la cabecera, consulta su tabla (usa la ruta por defecto hacia el ISP) y aplica <b>NAT</b>: cambia <code>192.168.1.10</code> por su IP pública.");
      await hop("rt", "net", "net", "El paquete viaja por <b>Internet</b> salto a salto (router vecino → router vecino) hasta <code>8.8.8.8</code>.");
      await wait(300);
      log("↩️ La respuesta regresa por el camino inverso; el router deshace el NAT y la entrega a PC 1.");
      await moveSeg(P.net, P.rt, 700); hl("rt");
      await moveSeg(P.rt, P.sw, 600); hl("sw");
      await moveSeg(P.sw, P.pc1, 600); hl("pc1");
      log("✅ <b>PC 1</b> recibe la respuesta.");
    }
    await wait(800);
    packet.style.display = "none";
    hl(null);
    $$("[data-send]").forEach(b => b.disabled = false);
    animating = false;
  }
  $$("[data-send]").forEach(b => b.onclick = () => simulate(b.dataset.send));

  /* ---------- terminal simulada ---------- */
  const out = $("#termOut"), input = $("#termInput");
  const hostsLan = { "192.168.1.1": "Router", "192.168.1.10": "PC 1", "192.168.1.11": "PC 2", "192.168.1.12": "PC 3" };
  function print(html) { out.innerHTML += html + "\n"; out.scrollTop = out.scrollHeight; }
  const rnd = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  function validIp(s) { return /^(\d{1,3}\.){3}\d{1,3}$/.test(s) && s.split(".").every(o => Number(o) <= 255); }
  function pingLines(ip, mode) {
    let l = "\nHaciendo ping a " + ip + " con 32 bytes de datos:\n";
    let rec = 0;
    for (let i = 0; i < 4; i++) {
      if (mode === "ok") { const t = ip.startsWith("192.168.1.") ? (ip === "192.168.1.10" ? 0 : rnd(0, 2)) : rnd(18, 42); l += '<span class="ok">Respuesta desde ' + ip + ": bytes=32 tiempo" + (t === 0 ? "<1" : "=" + t) + "ms TTL=" + (ip.startsWith("192.168.1.") ? 128 : 117) + "</span>\n"; rec++; }
      else if (mode === "unreach") l += '<span class="err">Respuesta desde 192.168.1.10: Host de destino inaccesible.</span>\n';
      else l += '<span class="err">Tiempo de espera agotado para esta solicitud.</span>\n';
    }
    l += "\nEstadísticas de ping para " + ip + ":\n    Paquetes: enviados = 4, recibidos = " + (mode === "timeout" ? 0 : 4) + ", perdidos = " + (mode === "timeout" ? 4 : 0) + "\n";
    if (mode === "ok") l += '<span class="ok">✔ Hay comunicación con ' + (hostsLan[ip] || ip) + ".</span>\n";
    else if (mode === "unreach") l += '<span class="err">✘ Ningún equipo usa esa IP en la red 192.168.1.0/24.</span>\n';
    else l += '<span class="err">✘ No hay ruta hacia ese destino en esta práctica.</span>\n';
    return l;
  }
  function run(cmd) {
    cmd = cmd.trim();
    print('<span class="cmd">C:\\Users\\PC1&gt;' + cmd.replace(/</g, "&lt;") + "</span>");
    if (!cmd) return;
    const [c, arg] = cmd.toLowerCase().split(/\s+/);
    if (c === "cls" || c === "clear") { out.innerHTML = ""; return; }
    if (c === "help") { print("Comandos disponibles:\n  ipconfig        Muestra la configuración IP del PC 1\n  ping &lt;IP&gt;       Prueba la comunicación con otro equipo\n  cls             Limpia la pantalla\n"); return; }
    if (c === "ipconfig") { print("\nConfiguración IP de Windows\n\nAdaptador de Ethernet:\n   Dirección IPv4. . . . . . . . . : 192.168.1.10\n   Máscara de subred . . . . . . . : 255.255.255.0\n   Puerta de enlace predeterminada : 192.168.1.1\n"); return; }
    if (c === "ping") {
      if (!arg || !validIp(arg)) { print('<span class="err">La solicitud de ping no pudo encontrar el host ' + (arg || "") + ". Escribe una IP válida, por ejemplo: ping 192.168.1.11</span>\n"); return; }
      let mode;
      if (hostsLan[arg]) mode = "ok";
      else if (arg.startsWith("192.168.1.")) mode = "unreach";
      else if (arg === "8.8.8.8" || arg === "1.1.1.1") mode = "ok";
      else mode = "timeout";
      print(pingLines(arg, mode));
      if (arg === "192.168.1.11") toast("✔ ¡PC 1 se comunica con PC 2!");
      return;
    }
    print("\"" + cmd.replace(/</g, "&lt;") + "\" no se reconoce como un comando interno o externo. Escribe help.\n");
  }
  input.addEventListener("keydown", e => { if (e.key === "Enter") { run(input.value); input.value = ""; } });
  $$("[data-cmd]").forEach(b => b.onclick = () => { run(b.dataset.cmd); input.focus(); });
  $("#terminal").addEventListener("click", () => input.focus());

  /* ---------- Actividad 1: pública o privada ---------- */
  function renderPP() {
    let score = 0, answered = 0;
    $("#ppList").innerHTML = PP.map((x, i) => '<div class="pp" data-i="' + i + '"><div class="pp-top"><code>' + x.ip + '</code><div class="pp-btns"><button data-v="pub">Pública</button><button data-v="priv">Privada</button></div></div></div>').join("");
    $("#ppScore").textContent = "0 / " + PP.length;
    $$("#ppList .pp").forEach(card => {
      const x = PP[card.dataset.i];
      $$("button", card).forEach(btn => btn.onclick = () => {
        const ok = (btn.dataset.v === "priv") === x.priv;
        $$("button", card).forEach(b => b.disabled = true);
        btn.classList.add("picked");
        card.classList.add(ok ? "ok" : "bad");
        card.insertAdjacentHTML("beforeend", '<div class="fb"><b class="' + (ok ? "ok" : "bad") + '">' + (ok ? "✔ Correcto." : "✘ Incorrecto: es " + (x.priv ? "privada" : "pública") + ".") + "</b> " + x.why + "</div>");
        answered++; if (ok) score++;
        $("#ppScore").textContent = score + " / " + PP.length;
        if (answered === PP.length) toast("Actividad 1 terminada: " + score + "/" + PP.length);
      });
    });
  }
  $("#ppReset").onclick = renderPP;
  renderPP();

  /* ---------- Actividad 2: verdadero o falso ---------- */
  function renderTF() {
    let score = 0, answered = 0;
    $("#tfList").innerHTML = TF.map((x, i) => '<div class="tf" data-i="' + i + '"><div class="tf-row"><span><b>' + (i + 1) + ".</b> " + x.s + '</span><div class="tf-btns"><button data-v="1">Verdadero</button><button data-v="0">Falso</button></div></div></div>').join("");
    $("#tfScore").textContent = "0 / " + TF.length;
    $$("#tfList .tf").forEach(card => {
      const x = TF[card.dataset.i];
      $$("button", card).forEach(btn => btn.onclick = () => {
        const ok = (btn.dataset.v === "1") === x.a;
        $$("button", card).forEach(b => b.disabled = true);
        btn.classList.add("picked");
        card.classList.add(ok ? "ok" : "bad");
        card.insertAdjacentHTML("beforeend", '<div class="fb"><b class="' + (ok ? "ok" : "bad") + '">' + (ok ? "✔ Correcto." : "✘ Incorrecto: la afirmación es " + (x.a ? "verdadera" : "falsa") + ".") + "</b> " + x.why + "</div>");
        answered++; if (ok) score++;
        $("#tfScore").textContent = score + " / " + TF.length;
        if (answered === TF.length) toast("Actividad 2 terminada: " + score + "/" + TF.length);
      });
    });
  }
  $("#tfReset").onclick = renderTF;
  renderTF();

  /* ---------- Actividad 3: misma subred ---------- */
  let snIdx = 0, snScore = 0;
  function renderSN() {
    const box = $("#subnetBox");
    if (snIdx >= SUBNETS.length) {
      box.innerHTML = "<h4>Resultado: " + snScore + " / " + SUBNETS.length + "</h4><p>" + (snScore >= 5 ? "¡Muy bien! Dominas el uso de la máscara para comparar redes." : "Repasa el explorador de bits en Contenido → Características y vuelve a intentarlo.") + '</p><button class="btn ghost" id="snAgain">Intentar de nuevo</button>';
      $("#snAgain").onclick = () => { snIdx = 0; snScore = 0; renderSN(); };
      return;
    }
    const s = SUBNETS[snIdx];
    box.innerHTML = '<p class="eyebrow">Caso ' + (snIdx + 1) + " de " + SUBNETS.length + " · Aciertos: " + snScore + '</p>' +
      '<div class="sn-pair"><div><small>Equipo A</small><code>' + s.a + "/" + s.p + '</code></div><div><small>Equipo B</small><code>' + s.b + "/" + s.p + '</code></div></div>' +
      '<p>Máscara: <code>' + intToIp(maskInt(s.p)) + '</code>. ¿Están en la misma subred?</p>' +
      '<div class="sn-btns"><button class="btn primary" data-y="1">Sí, misma subred</button><button class="btn secondary" data-y="0">No, necesitan router</button></div><div id="snFb"></div>';
    $$("[data-y]", box).forEach(b => b.onclick = () => {
      const m = maskInt(s.p), na = andInt(ipToInt(s.a), m), nb = andInt(ipToInt(s.b), m), same = na === nb;
      const ok = (b.dataset.y === "1") === same;
      if (ok) snScore++;
      $$("[data-y]", box).forEach(x => x.disabled = true);
      $("#snFb").innerHTML = '<div class="fb" style="margin-top:12px"><b class="' + (ok ? "ok" : "bad") + '">' + (ok ? "✔ Correcto." : "✘ Incorrecto.") + "</b> " +
        (same ? "Al aplicar la máscara, ambas direcciones dan la misma red, así que se comunican directamente (solo con el switch)." : "Al aplicar la máscara, las redes son diferentes: el tráfico debe pasar por la puerta de enlace (router).") + "</div>" +
        '<div class="sn-work">A:  ' + s.a.padEnd(16) + " AND " + intToIp(m) + "  =  <span class=\"y\">" + intToIp(na) + "</span>\nB:  " + s.b.padEnd(16) + " AND " + intToIp(m) + "  =  <span class=\"y\">" + intToIp(nb) + "</span>\n" + (same ? "Redes iguales → misma subred" : "Redes distintas → subredes diferentes") + "</div>" +
        '<div style="margin-top:12px"><button class="btn primary" id="snNext">' + (snIdx === SUBNETS.length - 1 ? "Ver resultado" : "Siguiente caso →") + "</button></div>";
      $("#snNext").onclick = () => { snIdx++; renderSN(); };
    });
  }
  renderSN();

  /* ---------- Actividad 4: relacionar ---------- */
  let mSel = null, mScore = 0;
  function renderMatch() {
    mSel = null; mScore = 0;
    $("#matchScore").textContent = "0 / " + MATCH.length;
    $("#matchL").innerHTML = shuffle(MATCH.map((m, i) => i)).map(i => '<button class="m-item" data-k="' + i + '"><b>' + MATCH[i].k + "</b></button>").join("");
    $("#matchR").innerHTML = shuffle(MATCH.map((m, i) => i)).map(i => '<button class="m-item" data-v="' + i + '">' + MATCH[i].v + "</button>").join("");
    $$("#matchL .m-item").forEach(b => b.onclick = () => {
      if (b.classList.contains("ok")) return;
      $$("#matchL .m-item").forEach(x => x.classList.remove("sel"));
      b.classList.add("sel"); mSel = b;
    });
    $$("#matchR .m-item").forEach(b => b.onclick = () => {
      if (b.classList.contains("ok")) return;
      if (!mSel) { toast("Primero elige un concepto de la izquierda."); return; }
      if (mSel.dataset.k === b.dataset.v) {
        mSel.classList.remove("sel"); mSel.classList.add("ok"); b.classList.add("ok");
        mSel.disabled = true; b.disabled = true; mSel = null; mScore++;
        $("#matchScore").textContent = mScore + " / " + MATCH.length;
        if (mScore === MATCH.length) toast("🎉 ¡Relacionaste todos los conceptos!");
      } else {
        const k = MATCH[mSel.dataset.k].k;
        b.classList.add("shake");
        toast("✘ Esa no es la función de " + k + ". ¡Intenta otra!");
        setTimeout(() => b.classList.remove("shake"), 450);
      }
    });
  }
  $("#matchReset").onclick = renderMatch;
  renderMatch();

  /* ---------- Evaluación ---------- */
  let qi = 0, qScore = 0;
  let answers = new Array(QUIZ.length).fill(null);
  const L = ["A", "B", "C", "D"];
  function renderQ() {
    const q = QUIZ[qi];
    $("#qCounter").textContent = "Pregunta " + (qi + 1) + " de " + QUIZ.length;
    $("#qScore").textContent = "Puntaje: " + qScore;
    $("#qBar").style.width = (qi / QUIZ.length * 100) + "%";
    $("#qText").textContent = q.q;
    $("#qOpts").innerHTML = q.o.map((o, i) => '<button class="q-opt" data-i="' + i + '"><span class="k">' + L[i] + "</span><span>" + o + "</span></button>").join("");
    $("#qFeedback").hidden = true;
    $("#qNext").disabled = true;
    $("#qNext").textContent = qi === QUIZ.length - 1 ? "Ver resultados" : "Siguiente →";
    $$("#qOpts .q-opt").forEach(b => b.onclick = () => answerQ(Number(b.dataset.i)));
  }
  function answerQ(i) {
    const q = QUIZ[qi], ok = i === q.c;
    answers[qi] = i;
    if (ok) qScore++;
    $$("#qOpts .q-opt").forEach((b, j) => { b.disabled = true; if (j === q.c) b.classList.add("ok"); else if (j === i) b.classList.add("bad"); });
    const fb = $("#qFeedback");
    fb.className = "q-feedback " + (ok ? "ok" : "bad");
    fb.innerHTML = ok
      ? "<b>✔ ¡Correcto!</b><p>" + q.w[i] + "</p>"
      : "<b>✘ Incorrecto.</b><p><b>Por qué tu respuesta no es correcta:</b> " + q.w[i] + "</p><p><b>Respuesta correcta (" + L[q.c] + "):</b> " + q.w[q.c] + "</p>";
    fb.hidden = false;
    $("#qScore").textContent = "Puntaje: " + qScore;
    $("#qNext").disabled = false;
  }
  $("#qNext").onclick = () => { if (qi < QUIZ.length - 1) { qi++; renderQ(); } else finishQuiz(); };

  function finishQuiz() {
    $("#qBar").style.width = "100%";
    $("#quiz").hidden = true;
    const pct = Math.round(qScore / QUIZ.length * 100);
    const grade = (qScore / QUIZ.length * 5).toFixed(1);
    const color = pct >= 80 ? "var(--ok)" : pct >= 60 ? "#d97706" : "var(--bad)";
    const msg = pct >= 80 ? "¡Excelente! Dominas los conceptos de routers y direccionamiento IP." : pct >= 60 ? "Buen trabajo. Repasa las preguntas que fallaste en la sección de retroalimentación." : "Te recomendamos repasar el contenido y volver a intentarlo.";
    const r = $("#quizResult");
    r.hidden = false;
    r.innerHTML = '<div class="score-ring" style="background:conic-gradient(' + color + " " + pct + '%,#e2e8f0 0)"><span style="background:#fff;width:118px;height:118px;border-radius:50%;display:grid;place-items:center">' + qScore + "/" + QUIZ.length + "</span></div>" +
      "<h3>Nota: " + grade + " / 5.0</h3><p>" + msg + '</p><div class="result-btns"><button class="btn primary" id="toFb">Ver retroalimentación detallada →</button><button class="btn ghost" id="qRetry">Repetir evaluación</button></div>';
    $("#toFb").onclick = () => go("retroalimentacion");
    $("#qRetry").onclick = resetQuiz;
    renderFeedback();
    toast("Evaluación terminada: " + qScore + "/" + QUIZ.length);
  }
  function resetQuiz() {
    qi = 0; qScore = 0; answers = new Array(QUIZ.length).fill(null);
    $("#quizResult").hidden = true; $("#quiz").hidden = false;
    renderQ(); renderFeedback();
  }

  /* ---------- Retroalimentación ---------- */
  function renderFeedback() {
    const done = answers.every(a => a !== null);
    if (!done) {
      $("#fbSummary").innerHTML = "";
      $("#fbList").innerHTML = '<div class="card fb-empty"><h3>Aún no has terminado la evaluación</h3><p>Responde las ' + QUIZ.length + ' preguntas de la sección 8 y aquí aparecerá la revisión completa de tus respuestas con la explicación de cada una.</p><button class="btn primary" id="toQuiz">Ir a la evaluación →</button></div>' +
        '<div class="card"><h3>¿Cómo funciona la retroalimentación en este OVA?</h3><ul class="icon-list">' +
        "<li><b>⚡</b><span><strong>Inmediata:</strong> en cada actividad y en cada pregunta de la evaluación ves al instante si acertaste.</span></li>" +
        "<li><b>💬</b><span><strong>Explicada:</strong> si fallas, se explica por qué tu opción no es correcta y por qué la correcta sí lo es.</span></li>" +
        "<li><b>🔁</b><span><strong>Repetible:</strong> todas las actividades se pueden reiniciar para practicar de nuevo.</span></li></ul></div>";
      $("#toQuiz").onclick = () => go("evaluacion");
      return;
    }
    const ok = answers.filter((a, i) => a === QUIZ[i].c).length;
    $("#fbSummary").innerHTML =
      '<div class="stat"><b style="color:var(--ok)">' + ok + '</b><small>Correctas</small></div>' +
      '<div class="stat"><b style="color:var(--bad)">' + (QUIZ.length - ok) + '</b><small>Incorrectas</small></div>' +
      '<div class="stat"><b>' + Math.round(ok / QUIZ.length * 100) + '%</b><small>Aciertos</small></div>' +
      '<div class="stat"><b>' + (ok / QUIZ.length * 5).toFixed(1) + '</b><small>Nota sobre 5.0</small></div>';
    $("#fbList").innerHTML = QUIZ.map((q, i) => {
      const a = answers[i], good = a === q.c;
      return '<div class="fb-item ' + (good ? "ok" : "bad") + '"><h4>' + (good ? "✔" : "✘") + " " + (i + 1) + ". " + q.q + "</h4>" +
        '<p class="ans">Tu respuesta: <b>' + L[a] + ". " + q.o[a] + "</b></p>" +
        (good ? "" : '<p class="ans">Respuesta correcta: <b>' + L[q.c] + ". " + q.o[q.c] + "</b></p>") +
        '<div class="why">' + (good ? "<b>¿Por qué es correcta?</b> " + q.w[a] : "<b>¿Por qué es incorrecta?</b> " + q.w[a] + "<br><b>¿Por qué la otra es correcta?</b> " + q.w[q.c]) + "</div></div>";
    }).join("") + '<div style="text-align:center"><button class="btn ghost" id="fbRetry">Repetir evaluación</button></div>';
    $("#fbRetry").onclick = () => { resetQuiz(); go("evaluacion"); };
  }

  renderQ();
  renderFeedback();
  show(location.hash.slice(1) || "portada");
})();

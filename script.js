/* =========================================================
   Ana & Diogo — interações
   ========================================================= */
(function () {
  "use strict";

  /* ---- Data do casamento (EDITE AQUI) ---- */
  var WEDDING_DATE = new Date("2026-11-27T16:00:00");
  /* ---- WhatsApp para confirmações (EDITE AQUI, formato 55DDDNUMERO) ---- */
  var WHATSAPP = "5599999999999";

  /* ---------- Contagem regressiva ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var el = document.getElementById("countdown");
    if (!el) return;
    var diff = WEDDING_DATE.getTime() - Date.now();
    if (diff < 0) diff = 0;
    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    set("cd-days", d);
    set("cd-hours", pad(h));
    set("cd-min", pad(m));
    set("cd-sec", pad(sec));
  }
  function set(id, v) {
    var n = document.getElementById(id);
    if (n) n.textContent = v;
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
  }

  /* ---------- Cards de acompanhantes ---------- */
  var acompSelect = document.getElementById("acompanhantes");
  var companionsContainer = document.getElementById("companions-container");

  function updateCompanionCards() {
    var count = parseInt(acompSelect.value) || 0;
    companionsContainer.innerHTML = "";
    for (var i = 1; i <= count; i++) {
      var card = document.createElement("div");
      card.className = "companion-card";
      card.innerHTML =
        '<div class="companion-card__header"><span class="label">Acompanhante ' + i + '</span></div>' +
        '<div class="field">' +
          '<label for="acomp_nome_' + i + '">Nome completo</label>' +
          '<input type="text" id="acomp_nome_' + i + '" name="acomp_nome_' + i + '" placeholder="Nome do acompanhante">' +
        '</div>';
      companionsContainer.appendChild(card);
      (function (c) {
        requestAnimationFrame(function () { c.classList.add("in"); });
      }(card));
    }
  }

  if (acompSelect && companionsContainer) {
    acompSelect.addEventListener("change", updateCompanionCards);
  }

  /* ---------- Cards de crianças ---------- */
  var criancasRadios    = document.querySelectorAll("input[name='criancas']");
  var childrenCountWrap = document.getElementById("children-count-wrap");
  var numCriancasSelect = document.getElementById("num-criancas");
  var childrenContainer = document.getElementById("children-container");

  function updateChildrenCards() {
    var count = parseInt(numCriancasSelect.value) || 0;
    childrenContainer.innerHTML = "";
    for (var i = 1; i <= count; i++) {
      var card = document.createElement("div");
      card.className = "companion-card";
      card.innerHTML =
        '<div class="companion-card__header"><span class="label">Criança ' + i + '</span></div>' +
        '<div class="field">' +
          '<label for="crianca_nome_' + i + '">Nome da criança</label>' +
          '<input type="text" id="crianca_nome_' + i + '" name="crianca_nome_' + i + '" placeholder="Nome da criança">' +
        '</div>';
      childrenContainer.appendChild(card);
      (function (c) {
        requestAnimationFrame(function () { c.classList.add("in"); });
      }(card));
    }
  }

  function showChildrenCount() {
    childrenCountWrap.style.display = "block";
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        childrenCountWrap.classList.add("in");
        updateChildrenCards();
      });
    });
  }

  function hideChildrenCount() {
    childrenCountWrap.classList.remove("in");
    childrenContainer.innerHTML = "";
    setTimeout(function () { childrenCountWrap.style.display = "none"; }, 350);
  }

  criancasRadios.forEach(function (radio) {
    radio.addEventListener("change", function () {
      if (this.value === "sim") {
        showChildrenCount();
      } else {
        hideChildrenCount();
      }
    });
  });

  if (numCriancasSelect) {
    numCriancasSelect.addEventListener("change", updateChildrenCards);
  }

  /* ---------- RSVP ---------- */
  var form = document.getElementById("rsvp-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var data = new FormData(form);
      var nome = (data.get("nome") || "").toString().trim();
      var presenca = (data.get("presenca") || "sim").toString();
      var acomp = (data.get("acompanhantes") || "0").toString();
      var msg = (data.get("mensagem") || "").toString().trim();

      // Monta mensagem para WhatsApp
      var linhas = [];
      linhas.push("Confirmacao de presenca — Casamento Ana & Diogo");
      linhas.push("Nome: " + (nome || "—"));
      linhas.push(presenca === "sim" ? "Presenca: Vou comparecer ✓" : "Presenca: Nao poderei ir");
      if (presenca === "sim") {
        linhas.push("Acompanhantes: " + acomp);
        var acompCount = parseInt(acomp) || 0;
        for (var i = 1; i <= acompCount; i++) {
          var acompNome = (data.get("acomp_nome_" + i) || "").toString().trim();
          linhas.push("  Acomp. " + i + ": " + (acompNome || "—"));
        }
      }
      var criancas = (data.get("criancas") || "nao").toString();
      if (criancas === "sim") {
        var numCriancas = parseInt(data.get("num_criancas") || "0");
        linhas.push("Criancas: " + numCriancas);
        for (var j = 1; j <= numCriancas; j++) {
          var criancaNome = (data.get("crianca_nome_" + j) || "").toString().trim();
          linhas.push("  Crianca " + j + ": " + (criancaNome || "—"));
        }
      } else {
        linhas.push("Criancas: Nao");
      }
      if (msg) linhas.push("Recado: " + msg);
      var texto = encodeURIComponent(linhas.join("\n"));
      var waUrl = "https://wa.me/" + WHATSAPP + "?text=" + texto;

      // Estado de sucesso
      var card = document.getElementById("rsvp-card-inner");
      var success = document.getElementById("rsvp-success");
      var nameOut = document.getElementById("rsvp-name-out");
      var waBtn = document.getElementById("rsvp-wa");
      if (nameOut) nameOut.textContent = nome ? nome.split(" ")[0] : "";
      if (waBtn) waBtn.setAttribute("href", waUrl);
      if (success) {
        var subEl = document.getElementById("rsvp-success-sub");
        if (subEl) {
          subEl.textContent = presenca === "sim"
            ? "Mal podemos esperar para celebrar com você. Toque abaixo para enviar sua confirmação aos noivos."
            : "Vamos sentir sua falta. Toque abaixo para enviar seu recado aos noivos.";
        }
      }
      if (card) card.style.display = "none";
      if (success) success.classList.add("show");
      success.scrollIntoView ? null : null; // evitar uso de scrollIntoView
    });
  }

  /* ---------- Copiar PIX ---------- */
  var pix = document.getElementById("pix-card");
  if (pix) {
    pix.addEventListener("click", function () {
      var key = pix.getAttribute("data-pix") || "";
      var hint = document.getElementById("pix-hint");
      function done() {
        if (hint) {
          var old = hint.textContent;
          hint.textContent = "Chave copiada!";
          setTimeout(function () { hint.textContent = old; }, 1800);
        }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(key).then(done, done);
      } else {
        done();
      }
    });
  }
})();

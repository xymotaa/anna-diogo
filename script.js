/* =========================================================
   Ana & Diogo — interações
   ========================================================= */
(function () {
  "use strict";

  /* ---- Data do casamento (EDITE AQUI) ---- */
  var WEDDING_DATE = new Date("2026-08-08T16:00:00");
  /* ---- Webhook do Make que recebe as inscrições (EDITE AQUI) ---- */
  var RSVP_WEBHOOK_URL = "https://hook.us2.make.com/bakomqifi6pafuiwk37dvvy73ibsif3b";

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

      // Valida nomes de acompanhantes
      var acompCount = parseInt(acomp) || 0;
      for (var v = 1; v <= acompCount; v++) {
        var acompInput = document.getElementById("acomp_nome_" + v);
        if (!acompInput || !acompInput.value.trim()) {
          acompInput && acompInput.focus();
          acompInput && acompInput.scrollIntoView({ behavior: "smooth", block: "center" });
          acompInput && (acompInput.style.borderColor = "var(--accent)");
          acompInput && acompInput.addEventListener("input", function () { this.style.borderColor = ""; }, { once: true });
          alert("Por favor, preencha o nome do acompanhante " + v + ".");
          return;
        }
      }

      // Valida nomes de crianças
      var criancasVal = (data.get("criancas") || "nao").toString();
      if (criancasVal === "sim") {
        var numCriancasVal = parseInt(data.get("num_criancas") || "0");
        for (var k = 1; k <= numCriancasVal; k++) {
          var criancaInput = document.getElementById("crianca_nome_" + k);
          if (!criancaInput || !criancaInput.value.trim()) {
            criancaInput && criancaInput.focus();
            criancaInput && criancaInput.scrollIntoView({ behavior: "smooth", block: "center" });
            criancaInput && (criancaInput.style.borderColor = "var(--accent)");
            criancaInput && criancaInput.addEventListener("input", function () { this.style.borderColor = ""; }, { once: true });
            alert("Por favor, preencha o nome da criança " + k + ".");
            return;
          }
        }
      }

      // Monta nomes de acompanhantes e crianças
      var acompNomes = [];
      for (var i = 1; i <= acompCount; i++) {
        acompNomes.push((data.get("acomp_nome_" + i) || "").toString().trim());
      }
      var criancas = (data.get("criancas") || "nao").toString();
      var numCriancas = criancas === "sim" ? (parseInt(data.get("num_criancas") || "0") || 0) : 0;
      var criancaNomes = [];
      for (var j = 1; j <= numCriancas; j++) {
        criancaNomes.push((data.get("crianca_nome_" + j) || "").toString().trim());
      }

      var payload = {
        nome: nome,
        telefone: (data.get("telefone") || "").toString().trim(),
        presenca: presenca,
        acompanhantes: presenca === "sim" ? acompCount : 0,
        acompanhantes_nomes: acompNomes.join(", "),
        criancas: numCriancas,
        criancas_nomes: criancaNomes.join(", "),
        mensagem: msg,
        enviado_em: new Date().toISOString()
      };

      function mostrarSucesso() {
        var card = document.getElementById("rsvp-card-inner");
        var success = document.getElementById("rsvp-success");
        var nameOut = document.getElementById("rsvp-name-out");
        if (nameOut) nameOut.textContent = nome ? nome.split(" ")[0] : "";
        if (success) {
          var subEl = document.getElementById("rsvp-success-sub");
          if (subEl) {
            subEl.textContent = presenca === "sim"
              ? "Mal podemos esperar para celebrar com você!"
              : "Vamos sentir sua falta. Obrigado por nos avisar!";
          }
        }
        if (card) card.style.display = "none";
        if (success) success.classList.add("show");
      }

      var submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando...";
      }

      fetch(RSVP_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function () { mostrarSucesso(); })
        .catch(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Confirmar presença";
          }
          alert("Não foi possível enviar sua confirmação. Verifique sua internet e tente novamente.");
        });
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

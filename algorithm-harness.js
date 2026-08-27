(() => {
  const F = window.FormationEngine;
  if (!F) throw new Error("Formation engine failed to load.");
  const $ = (id) => document.getElementById(id);
  const barriers = [
    ["Busyness / hurry", "busyness"],
    ["Digital distraction", "digital"],
    ["Tiredness", "tiredness"],
    ["Work / responsibilities", "work"],
    ["Stress / emotional load", "stress"],
    ["Spiritual dryness", "dryness"],
    ["Unsure where to begin", "uncertain"],
    ["Overdoing", "overdoing"],
  ];
  let mode = "quick";
  let state = Object.fromEntries(
    F.D.map((domain) => [domain, { core: 3, impact: 3 }]),
  );

  function profile() {
    return {
      data: Object.fromEntries(
        F.D.map((domain) => [
          domain,
          {
            core: state[domain].core,
            impact:
              mode === "deep" ? state[domain].impact : state[domain].core,
            nCore: 4,
            nImpact: 4,
          },
        ]),
      ),
      mode,
      barriers: [
        ...document.querySelectorAll("#barriers input:checked"),
      ].map((input) => input.value),
      connections: [],
      constraints: [],
    };
  }

  function renderRows() {
    $("domains").innerHTML = F.D.map((domain) => {
      const safeId = domain.toLowerCase().replaceAll(" ", "-");
      return `<div class="domainrow ${mode === "quick" ? "quick" : ""}" data-domain="${domain}">
        <b>${domain}</b>
        <label><span class="sr-only">${domain} presence</span><input id="${safeId}-core" class="core" type="range" min="1" max="5" step="0.05" value="${state[domain].core}"></label>
        <span class="value core-value"></span>
        <label class="impact"><span class="sr-only">${domain} impact</span><input id="${safeId}-impact" class="impact-input" type="range" min="1" max="5" step="0.05" value="${state[domain].impact}" ${mode === "quick" ? "disabled" : ""}></label>
        <span class="value impact impact-value"></span>
        <span class="pattern"></span>
      </div>`;
    }).join("");
    document.querySelectorAll(".domainrow").forEach((row) => {
      const domain = row.dataset.domain;
      row.querySelector(".core").addEventListener("input", (event) => {
        state[domain].core = Number(event.target.value);
        if (mode === "quick") state[domain].impact = state[domain].core;
        render();
      });
      row.querySelector(".impact-input").addEventListener("input", (event) => {
        state[domain].impact = Number(event.target.value);
        render();
      });
    });
    render();
  }

  function render() {
    document.querySelectorAll(".domainrow").forEach((row) => {
      const domain = row.dataset.domain;
      const values = state[domain];
      row.querySelector(".core").value = values.core;
      row.querySelector(".impact-input").value = values.impact;
      row.querySelector(".core-value").textContent = values.core.toFixed(2);
      row.querySelector(".impact-value").textContent = values.impact.toFixed(2);
      row.querySelector(".pattern").textContent =
        mode === "deep"
          ? F.deepPattern(values.core, values.impact)
          : F.quickPattern(values.core);
    });
    const result = F.interpret(profile());
    $("anchor").textContent = result.anchors.length
      ? result.anchors.join(" + ")
      : "No clearly differentiated Anchor";
    $("anchorWhy").textContent = result.anchors.length
      ? "Strong in absolute terms and meaningfully differentiated from the participant’s baseline."
      : "No strength stands apart enough to name confidently.";
    $("confidence").textContent = result.confidence;
    $("attention").textContent =
      result.attention ||
      (result.broad ? "Broad Invitation" : "Open Invitation");
    $("attentionWhy").textContent = result.broad
      ? "Opportunity is broadly distributed across a low profile; the engine does not manufacture one priority."
      : result.attention
        ? "One candidate has enough evidence and separation to justify naming it."
        : "Candidates are too close or too weakly evidenced to justify one Attention.";
    $("median").textContent = result.diagnostic.baseline?.toFixed(2) ?? "—";
    $("overall").textContent = result.diagnostic.overall?.toFixed(2) ?? "—";
    $("gap").textContent =
      result.diagnostic.attentionGap?.toFixed(3) ?? "—";
    $("modeOut").textContent = result.diagnostic.mode === "deep" ? "112" : "56";
    $("candidates").innerHTML = result.candidates
      .slice(0, 7)
      .map(
        (domain) =>
          `<tr><td>${domain}</td><td>${result.rows[domain].pattern}</td><td>${result.rows[domain].opportunity.toFixed(3)}</td></tr>`,
      )
      .join("");
    $("raw").textContent = JSON.stringify(
      {
        anchors: result.anchors,
        attention: result.attention,
        confidence: result.confidence,
        alternates: result.alternates,
        broad: result.broad,
        diagnostic: result.diagnostic,
      },
      null,
      2,
    );
  }

  function setAll(value) {
    state = Object.fromEntries(
      F.D.map((domain) => [domain, { core: value, impact: value }]),
    );
  }

  function syncMode() {
    $("quickBtn").classList.toggle("active", mode === "quick");
    $("deepBtn").classList.toggle("active", mode === "deep");
  }

  function preset(name) {
    document
      .querySelectorAll("#barriers input")
      .forEach((input) => (input.checked = false));
    if (name === "high") setAll(4.2);
    if (name === "low") setAll(1.8);
    if (name === "mid") setAll(3);
    if (name === "oneweak") {
      setAll(3.6);
      state.Sabbath = { core: 1.6, impact: 1.6 };
    }
    if (name === "onestrong") {
      setAll(3.2);
      state.Scripture = { core: 4.7, impact: 4.7 };
    }
    if (name === "makeroom") {
      mode = "deep";
      setAll(3.4);
      state.Solitude = { core: 2.1, impact: 4.2 };
    }
    if (name === "deepen") {
      mode = "deep";
      setAll(3.4);
      state.Prayer = { core: 4.2, impact: 2.1 };
    }
    if (name === "ties") {
      setAll(3.2);
      state.Prayer = { core: 4.55, impact: 4.55 };
      state.Scripture = { core: 4.53, impact: 4.53 };
      state.Community = { core: 4.52, impact: 4.52 };
    }
    syncMode();
    renderRows();
  }

  function makeProfile(value, selectedMode = "quick") {
    return {
      data: Object.fromEntries(
        F.D.map((domain) => [
          domain,
          { core: value, impact: value, nCore: 4, nImpact: 4 },
        ]),
      ),
      mode: selectedMode,
      barriers: [],
      connections: [],
      constraints: [],
    };
  }

  function runStress() {
    const checks = [
      ["Uniform high", () => {
        const result = F.interpret(makeProfile(4.2));
        return [result.anchors.length === 0 && result.attention === null, `Anchor: ${result.anchors.join(", ") || "none"} · Attention: ${result.attention || result.confidence}`];
      }],
      ["Uniform low", () => {
        const result = F.interpret(makeProfile(1.8));
        return [result.broad && result.confidence === "Broad Invitation", result.confidence];
      }],
      ["One weak domain", () => {
        const input = makeProfile(3.6);
        input.data.Sabbath = { core: 1.5, impact: 1.5, nCore: 4, nImpact: 4 };
        const result = F.interpret(input);
        return [result.attention === "Sabbath", `Attention: ${result.attention || result.confidence}`];
      }],
      ["One strong domain", () => {
        const input = makeProfile(3.1);
        input.data.Scripture = { core: 4.7, impact: 4.7, nCore: 4, nImpact: 4 };
        const result = F.interpret(input);
        return [result.anchors[0] === "Scripture", `Anchor: ${result.anchors.join(", ") || "none"}`];
      }],
      ["Deep: Make Room", () => {
        const input = makeProfile(3.4, "deep");
        input.data.Solitude = { core: 2.1, impact: 4.2, nCore: 4, nImpact: 4 };
        const result = F.interpret(input);
        return [result.rows.Solitude.pattern === "Make Room", `Solitude: ${result.rows.Solitude.pattern}`];
      }],
      ["Deep: Deepen", () => {
        const input = makeProfile(3.4, "deep");
        input.data.Prayer = { core: 4.2, impact: 2.1, nCore: 4, nImpact: 4 };
        const result = F.interpret(input);
        return [result.rows.Prayer.pattern === "Deepen", `Prayer: ${result.rows.Prayer.pattern}`];
      }],
      ["Three-way Anchor tie", () => {
        const input = makeProfile(3.2);
        input.data.Prayer = { core: 4.55, impact: 4.55, nCore: 4, nImpact: 4 };
        input.data.Scripture = { core: 4.53, impact: 4.53, nCore: 4, nImpact: 4 };
        input.data.Community = { core: 4.52, impact: 4.52, nCore: 4, nImpact: 4 };
        const result = F.interpret(input);
        return [result.anchors.length === 0, `Anchor: ${result.anchors.join(", ") || "none — tie withheld"}`];
      }],
      ["Context cannot create weakness", () => {
        const input = makeProfile(3.6);
        input.barriers = ["busyness", "digital", "tiredness"];
        const result = F.interpret(input);
        return [result.attention === null, `Attention: ${result.attention || result.confidence}`];
      }],
    ];
    let passed = 0;
    $("stressgrid").innerHTML = checks
      .map(([name, check]) => {
        try {
          const [ok, message] = check();
          if (ok) passed++;
          return `<article class="stress"><strong>${name}</strong><span class="${ok ? "pass" : "fail"}">${ok ? "PASS" : "FAIL"}</span><div>${message}</div></article>`;
        } catch (error) {
          return `<article class="stress"><strong>${name}</strong><span class="fail">FAIL</span><div>${error.message}</div></article>`;
        }
      })
      .join("");
    $("stressSummary").textContent = `${passed} of ${checks.length} deterministic checks passed.`;
  }

  function selectTab(tabName, updateHash = true) {
    const selected = tabName === "stress" ? "stress" : "sim";
    document.querySelectorAll("[data-tab]").forEach((button) => {
      const active = button.dataset.tab === selected;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === selected);
    });
    if (updateHash && location.hash !== `#${selected}`)
      history.replaceState(null, "", `#${selected}`);
  }

  $("barriers").innerHTML = barriers
    .map(
      ([label, value]) =>
        `<label class="check"><input type="checkbox" value="${value}"><span>${label}</span></label>`,
    )
    .join("");
  document
    .querySelectorAll("#barriers input")
    .forEach((input) => input.addEventListener("change", render));
  document
    .querySelectorAll("[data-tab]")
    .forEach((button) =>
      button.addEventListener("click", () => selectTab(button.dataset.tab)),
    );
  document
    .querySelectorAll("[data-preset]")
    .forEach((button) =>
      button.addEventListener("click", () => preset(button.dataset.preset)),
    );
  $("quickBtn").addEventListener("click", () => {
    mode = "quick";
    F.D.forEach((domain) => (state[domain].impact = state[domain].core));
    syncMode();
    renderRows();
  });
  $("deepBtn").addEventListener("click", () => {
    mode = "deep";
    syncMode();
    renderRows();
  });
  $("resetBtn").addEventListener("click", () => {
    mode = "quick";
    setAll(3);
    syncMode();
    renderRows();
  });
  $("randomBtn").addEventListener("click", () => {
    state = Object.fromEntries(
      F.D.map((domain) => [
        domain,
        { core: 1 + Math.random() * 4, impact: 1 + Math.random() * 4 },
      ]),
    );
    renderRows();
  });
  window.addEventListener("hashchange", () => selectTab(location.hash.slice(1), false));

  syncMode();
  renderRows();
  runStress();
  selectTab(location.hash.slice(1), false);
})();

// Licensed under GNU General Public License v3.0
// Created by fowntain

!(function () {
  if (document.getElementById("result-iframe")) {
    alert("Deltahack is already running!");
    return;
  }
  console.log("Deltahack: Initializing...");
  let e = {
      GEMINI_API_KEY: "AIzaSyBOWdxRh29lRxTYKHWzd4kEBaFcXJF45oU",
      GEMINI_API_URL:
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    },
    t = [512, 1024, 2048, 4096, 6144, 8192];
  function a() {
    if (window.lucide) window.lucide.createIcons();
    else {
      let e = document.createElement("script");
      (e.src = "https://unpkg.com/lucide@latest"),
        (e.onload = () => {
          window.lucide && window.lucide.createIcons();
        }),
        document.head.appendChild(e);
    }
  }
  let n = {
    resultIframe: null,
    styleTag: null,
    rawAnswer: "",
    autoCopy: "true" === localStorage.getItem("math_scanner_auto_copy"),
    maxTokens:
      parseInt(localStorage.getItem("math_scanner_max_tokens")) || 4096,
    showExplanations:
      "true" === localStorage.getItem("math_scanner_explanations"),
    hideKeybind: localStorage.getItem("math_scanner_hide_keybind") || "ctrl+e",
    isHidden: !1,
  };
  function o(e) {
    return (
      console.log("Deltahack: Evaluating math expressions..."),
      e.replace(/{{(.*?)}}/g, (e, t) => {
        try {
          let a = t.replace(/\s+/g, ""),
            n = a.replace(/Math\.sqrt/g, "").replace(/Math\.PI/g, "");
          if (/[^0-9\+\-\*\/\.\(\)\[\]\^,A-Za-z]/g.test(n))
            return (
              console.warn(
                "Deltahack: Blocked potentially unsafe math expression:",
                t
              ),
              "[Invalid Expression]"
            );
          let o = n.replace(/(\d+(?:\.\d+)?)[eE][\+\-]?\d+/g, "");
          if (/[A-Za-z]/.test(o))
            return (
              console.info(
                "Deltahack: Skipping evaluation for symbolic expression:",
                t
              ),
              t.trim()
            );
          a = (a = (a = (a = (a = (a = a.replace(/\^/g, "**")).replace(
            /(\d)(\()/g,
            "$1*$2"
          )).replace(/\)(\d)/g, ")*$2")).replace(/\)\(/g, ")*(")).replace(
            /(\d)(Math\.sqrt)/g,
            "$1*$2"
          )).replace(/(\d)(Math\.PI)/g, "$1*$2");
          let i = Function("return " + a)();
          if ("number" == typeof i && i % 1 != 0) {
            let r = i.toString();
            if (r.includes(".") && r.split(".")[1].length > 4) {
              let s = parseFloat(i.toFixed(4));
              return (
                console.log(
                  `Deltahack: Evaluated: ${t.trim()} = ${i} (rounded to ${s})`
                ),
                s.toString()
              );
            }
          }
          return (
            console.log(`Deltahack: Evaluated: ${t.trim()} = ${i}`),
            i.toString()
          );
        } catch (l) {
          return (
            console.error("Deltahack: Error evaluating math expression:", t, l),
            `[Calculation Error: ${t}]`
          );
        }
      })
    );
  }
  function i(e) {
    var t;
    let a = e.replace(/«([^»]+)»/g, "$1");
    return (a = (a = (a = (a = (a = (a = (a = (a = (a = a
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")).replace(
      /\*\*([^*]+)\*\*/g,
      "<strong>$1</strong>"
    )).replace(/`([^`]+)`/g, "<code>$1</code>")).replace(
      /\^\{([^}]+)\}/g,
      "<sup>$1</sup>"
    )).replace(
      /([A-Za-z0-9\)\]])\^(-?\d+(?:\.\d+)?)/g,
      "$1<sup>$2</sup>"
    )).replace(/Math\.sqrt/g, "&radic;")).replace(/Math\.PI/g, "&pi;")).replace(
      / \* /g,
      " &times; "
    )).replace(/\n/g, "<br>")).replace(/ {2,}/g, (e) =>
      "&nbsp;".repeat(e.length)
    );
  }
  function r(e, t) {
    let a = 0,
      n = 0,
      o = 0,
      i = 0;
    function r(t) {
      t.preventDefault(),
        (a = o - t.clientX),
        (n = i - t.clientY),
        (o = t.clientX),
        (i = t.clientY),
        (e.style.top = e.offsetTop - n + "px"),
        (e.style.left = e.offsetLeft - a + "px"),
        (e.style.right = "auto"),
        (e.style.bottom = "auto");
    }
    function s() {
      (document.onmouseup = null), (document.onmousemove = null);
    }
    t.onmousedown = function e(t) {
      t.preventDefault(),
        (o = t.clientX),
        (i = t.clientY),
        (document.onmouseup = s),
        (document.onmousemove = r);
    };
  }
  function s() {
    console.log("Deltahack: Opening settings...");
    let o = null;
    n.resultIframe &&
      ((o = {
        top: n.resultIframe.style.top,
        left: n.resultIframe.style.left,
        right: n.resultIframe.style.right,
        bottom: n.resultIframe.style.bottom,
      }),
      n.resultIframe.remove(),
      (n.resultIframe = null));
    let i = document.createElement("div");
    (i.id = "result-iframe"),
      o &&
        (o.top && (i.style.top = o.top),
        o.left && (i.style.left = o.left),
        o.right && (i.style.right = o.right),
        o.bottom && (i.style.bottom = o.bottom));
    let s = t.findIndex((e) => e >= n.maxTokens),
      l = s >= 0 ? s : t.length - 1;
    i.innerHTML = `
      <div class="result-header">
        <span>Settings</span>
        <div class="result-actions">
          <button class="close-result-btn" title="Close">\xd7</button>
        </div>
      </div>
      <div class="settings-container">
        <div class="setting-item">
          <div class="setting-item-row">
            <div class="setting-label">
              <div class="setting-label-title">API Key</div>
              <div class="setting-label-desc">Your Gemini API key</div>
            </div>
            <div class="setting-control">
              <input type="password" id="settings-api-key" placeholder="Enter API key" value="${
                e.GEMINI_API_KEY
              }">
            </div>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-label">
            <div class="setting-label-title">Max Tokens</div>
            <div class="setting-label-desc">Maximum response length. Higher values allow for harder problems but you will hit your quota faster.</div>
          </div>
          <div class="token-slider-container">
            <div class="token-slider-value" id="token-value">${t[l]}</div>
            <input type="range" class="token-slider" id="settings-max-tokens" min="0" max="${
              t.length - 1
            }" step="1" value="${l}">
            <div class="token-slider-labels">
              ${t.map((e) => `<span>${e}</span>`).join("")}
            </div>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-item-row">
            <div class="setting-label">
              <div class="setting-label-title">Show Explanations</div>
              <div class="setting-label-desc">Include step-by-step explanations</div>
            </div>
            <div class="setting-control">
              <div class="setting-toggle ${
                n.showExplanations ? "active" : ""
              }" id="settings-explanations">
                <div class="setting-toggle-slider"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-item-row">
            <div class="setting-label">
              <div class="setting-label-title">Hide Keybind</div>
              <div class="setting-label-desc">Quick hide/show shortcut</div>
            </div>
            <div class="setting-control">
              <input type="text" id="settings-keybind" placeholder="ctrl+e" value="${
                n.hideKeybind
              }">
            </div>
          </div>
        </div>
        <div class="settings-buttons">
          <button class="back-settings-btn" id="back-settings" title="Go back"><i data-lucide="chevron-left"></i></button>
          <button class="save-settings-btn-row" id="save-settings"><i data-lucide="save"></i><span>Save Settings</span></button>
        </div>
      </div>
      <div class="result-footer">
        <span>DogeUB - <a id="discord-link">discord.gg/unblocking</a>  |  Ctrl+E to quick hide</span>
      </div>`;
    let d = i.querySelector(".close-result-btn"),
      p = i.querySelector("#discord-link"),
      u = i.querySelector("#settings-explanations"),
      g = i.querySelector("#save-settings"),
      b = i.querySelector("#back-settings"),
      f = i.querySelector("#settings-max-tokens"),
      m = i.querySelector("#token-value"),
      h = i.querySelector("#settings-keybind"),
      y = {
        apiKey: e.GEMINI_API_KEY,
        maxTokens: n.maxTokens,
        showExplanations: n.showExplanations,
        hideKeybind: n.hideKeybind,
      };
    p &&
      p.addEventListener("click", (e) => {
        e.preventDefault(),
          window.open("https://discord.gg/unblocking", "_blank");
      }),
      d.addEventListener("click", () => {
        i.remove(), (n.resultIframe = null);
      }),
      f &&
        m &&
        f.addEventListener("input", (e) => {
          let a = parseInt(e.target.value);
          m.textContent = t[a];
        }),
      u &&
        u.addEventListener("click", () => {
          u.classList.toggle("active");
        }),
      g.addEventListener("click", () => {
        let a = i.querySelector("#settings-api-key").value.trim(),
          o = parseInt(i.querySelector("#settings-max-tokens").value),
          r = t[o],
          s = u.classList.contains("active"),
          l = h.value.trim();
        a &&
          ((e.GEMINI_API_KEY = a), localStorage.setItem("gemini_api_key", a)),
          (n.maxTokens = r),
          localStorage.setItem("math_scanner_max_tokens", r.toString()),
          (n.showExplanations = s),
          localStorage.setItem("math_scanner_explanations", s.toString()),
          l &&
            ((n.hideKeybind = l),
            localStorage.setItem("math_scanner_hide_keybind", l)),
          console.log("Deltahack: Settings saved."),
          c("Ready to scan", !1, !0, !0);
      }),
      b &&
        b.addEventListener("click", () => {
          (!(function e() {
            let a = i.querySelector("#settings-api-key").value.trim(),
              n = parseInt(i.querySelector("#settings-max-tokens").value),
              o = t[n],
              r = u.classList.contains("active"),
              s = h.value.trim();
            return (
              a !== y.apiKey ||
              o !== y.maxTokens ||
              r !== y.showExplanations ||
              s !== y.hideKeybind
            );
          })() ||
            confirm(
              "You have unsaved changes. Are you sure you want to go back?"
            )) &&
            c("Ready to scan", !1, !0, !0);
        }),
      document.body.appendChild(i),
      (n.resultIframe = i),
      r(i, i.querySelector(".result-header")),
      a();
  }
  async function l() {
    console.log("Deltahack: 'Scan Page' clicked.");
    let e = document.querySelector(".scan-btn");
    e &&
      ((e.disabled = !0),
      (e.innerHTML = '<i data-lucide="loader-2"></i>'),
      a());
    try {
      let t = "",
        n = document.querySelector("iframe.tool_launch");
      if (
        (n && n.contentDocument && n.contentDocument.body
          ? (console.log(
              "Deltahack: Found tool iframe. Reading text from iframe body."
            ),
            (t = n.contentDocument.body.innerText))
          : (console.log(
              "Deltahack: No tool iframe found. Falling back to main document body text."
            ),
            (t = document.body.innerText)),
        !t || "" === t.trim())
      )
        throw Error("Could not get any visible text from the page.");
      console.log(
        `Deltahack: Page text captured (${t.length} chars). Sending to AI.`
      ),
        await d(t);
    } catch (o) {
      console.error("Deltahack: Scan error:", o), c("Error: " + o.message, !0);
    }
  }
  async function d(t) {
    if (!e.GEMINI_API_KEY) {
      c("Error: API key not set", !0);
      return;
    }
    console.log("Deltahack: Calling sendToGemini..."), c("Loading...", !1);
    try {
      console.log("Deltahack: Sending fetch request to Gemini...");
      let a = await fetch(`${e.GEMINI_API_URL}?key=${e.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: n.showExplanations
                    ? "Solve the math problem from this DeltaMath page. Text may be fragmented (e.g., 'f(x)=9(1.05)\\n-\\nx' means 'f(x)=9(1.05)^-x'). Answer ALL parts. Use {{expr}} for calculations: {{5000+2000*3}} becomes 11000, {{4*Math.sqrt(35)}} for roots. Wrap each answer in guillemets \xab\xbb. For multiple parts:\nDomain: \xab[13, 18]\xbb\nRange: \xab(-∞, 8]\xbb\nCommon answers: 'does NOT make sense', 'does make sense', 'all real numbers', 'non-negative real numbers'. Provide concise step-by-step explanations for your work. If it is a graphing problem, provide the key points or equations and explain how to plot them. If you cannot answer for any reason, simply say 'Cannot solve this problem.'"
                    : "Solve the math problem from this DeltaMath page. Text may be fragmented (e.g., 'f(x)=9(1.05)\\n-\\nx' means 'f(x)=9(1.05)^-x'). Answer ALL parts. Use {{expr}} for calculations: {{5000+2000*3}} becomes 11000, {{4*Math.sqrt(35)}} for roots. Wrap each answer in guillemets \xab\xbb. For multiple parts:\nDomain: \xab[13, 18]\xbb\nRange: \xab(-∞, 8]\xbb\nCommon answers: 'does NOT make sense', 'does make sense', 'all real numbers', 'non-negative real numbers'. Be concise and don't include steps/explanations unless specifically requested. If it is a graphing problem, provide only the key points or equations needed to plot the graph, not a full description. If you cannot answer for any reason, simply say 'Cannot solve this problem.'",
                },
                { text: t },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 32,
            topP: 1,
            maxOutputTokens: n.maxTokens,
          },
        }),
      });
      if (
        (console.log(
          "Deltahack: Fetch response received:",
          a.status,
          a.statusText
        ),
        !a.ok)
      ) {
        let o = await a.text();
        console.error("Deltahack: API request failed:", o);
        let i;
        try {
          i = JSON.parse(o);
        } catch (r) {
          throw Error(
            `API request failed with status ${a.status}. Response: ${o}`
          );
        }
        throw Error(
          i.error?.message || `API request failed with status ${a.status}`
        );
      }
      let s = await a.json();
      if (
        (console.log("Deltahack: API data parsed:", s),
        s.candidates?.[0]?.finishReason === "SAFETY")
      )
        throw (
          (console.warn("Deltahack: Response blocked for safety reasons."),
          Error(
            "Response was blocked for safety reasons. The page text might be too large or complex."
          ))
        );
      if (
        !s.candidates ||
        !s.candidates[0] ||
        !s.candidates[0].content ||
        !s.candidates[0].content.parts ||
        !s.candidates[0].content.parts[0] ||
        !s.candidates[0].content.parts[0].text
      ) {
        console.error("Deltahack: Invalid response structure:", s);
        let l = s.candidates?.[0]?.finishReason;
        if (l && "STOP" !== l)
          throw Error(`Response blocked: ${l}. Try scanning again.`);
        throw Error("No answer received (invalid response structure).");
      }
      let d = s.candidates[0].content.parts[0].text;
      console.log("Deltahack: Answer received:", d), c(d, !1, !1, !0);
    } catch (p) {
      console.error("Deltahack: Gemini API error:", p),
        c("Error: " + p.message, !0);
    }
  }
  function c(e, t = !1, d = !1, c = !1) {
    console.log("Deltahack: Showing result. Is Error:", t);
    let p = null;
    n.resultIframe &&
      ((p = {
        top: n.resultIframe.style.top,
        left: n.resultIframe.style.left,
        right: n.resultIframe.style.right,
        bottom: n.resultIframe.style.bottom,
      }),
      n.resultIframe.remove(),
      (n.resultIframe = null));
    let u;
    u = t ? e : "Loading..." === e ? "Loading..." : o(e);
    let g = document.createElement("div");
    (g.id = "result-iframe"),
      c && g.classList.add("animate-in"),
      p &&
        (p.top && (g.style.top = p.top),
        p.left && (g.style.left = p.left),
        p.right && (g.style.right = p.right),
        p.bottom && (g.style.bottom = p.bottom)),
      (n.isHidden = !1),
      (n.rawAnswer = "");
    let b = "Loading..." === e,
      f = "",
      m = [];
    if (!t && !b) {
      let h = (function e(t) {
        if (!t) return "";
        let a = [],
          n = /«([^»]+)»/g,
          o;
        for (; null !== (o = n.exec(t)); ) {
          let i = (o[1] || "").trim();
          i && a.push(i);
        }
        return a.join("\n");
      })(e);
      (n.rawAnswer = o(h)),
        m.push(...n.rawAnswer.split("\n").filter((e) => e.trim())),
        (f = i(u));
    }
    let y = m.length > 1,
      x = `
      <button class="scan-btn" title="Scan page for math problems">
        <i data-lucide="play"></i>
      </button>
      <button class="copy-answer-btn" title="Copy answer to clipboard">
        <i data-lucide="clipboard"></i>
      </button>
      <button class="auto-copy-toggle ${
        n.autoCopy ? "active" : ""
      }" title="Toggle auto-copy">
        <span>Auto</span>
      </button>
      <button class="settings-btn" title="Settings">
        <i data-lucide="settings"></i>
      </button>
      <button class="close-result-btn" title="Close">\xd7</button>
    `;
    g.innerHTML = `
      <div class="result-header">
        <span>Deltahack v0.1</span>
        <div class="result-actions">
          ${x}
        </div>
      </div>
      <div class="result-content ${t ? "error" : b ? "loading" : ""}"></div>
      <div class="result-footer">
        <span>DogeUB - <a id="discord-link">discord.gg/unblocking</a>  |  Ctrl+E to quick hide</span>
      </div>`;
    let k = g.querySelector(".result-content"),
      v = g.querySelector("#discord-link");
    v &&
      v.addEventListener("click", (e) => {
        e.preventDefault(),
          window.open("https://discord.gg/unblocking", "_blank");
      });
    let $ = g.querySelector(".scan-btn"),
      _ = g.querySelector(".copy-answer-btn"),
      w = g.querySelector(".auto-copy-toggle"),
      I = g.querySelector(".settings-btn"),
      E = g.querySelector(".close-result-btn");
    (t || b || d) &&
      (_ && (_.style.display = "none"), w && (w.style.display = "none")),
      y && _ && (_.style.display = "none"),
      t
        ? ($ &&
            (($.disabled = !1),
            ($.innerHTML = '<i data-lucide="play"></i>'),
            a()),
          (k.innerText = u))
        : b
        ? ($ &&
            (($.disabled = !0),
            ($.innerHTML = '<i data-lucide="loader-2"></i>'),
            a()),
          (k.innerText = "Loading..."))
        : d
        ? (k.innerHTML =
            '<div style="text-align:center;padding:20px;color:#8a8d96; font-size:14px;">Deltahack ready for scan</div>')
        : y
        ? ((k.innerHTML = ""),
          m.forEach((t, a) => {
            let n = document.createElement("div");
            n.className = "answer-item";
            let r = document.createElement("div");
            r.className = "answer-text";
            let s = e.split("\n"),
              l = t;
            for (let d of s) {
              let c = d.match(/«([^»]+)»/);
              if (c) {
                let p = c[1].trim(),
                  u = o(p);
                if (u === t) {
                  l = d.replace(/«([^»]+)»/g, "$1");
                  break;
                }
              }
            }
            let g = o(l);
            r.innerHTML = i(g);
            let b = document.createElement("div");
            b.className = "answer-item-actions";
            let f = document.createElement("button");
            (f.className = "answer-item-btn copy-btn"),
              (f.innerHTML =
                '<i data-lucide="clipboard" style="width: 13px; height: 13px;"></i>'),
              (f.title = `Copy: ${t}`),
              f.addEventListener("click", async () => {
                let e = f.textContent;
                try {
                  if (navigator.clipboard && navigator.clipboard.writeText)
                    await navigator.clipboard.writeText(t);
                  else {
                    let a = document.createElement("textarea");
                    (a.value = t),
                      (a.style.position = "fixed"),
                      (a.style.opacity = "0"),
                      document.body.appendChild(a);
                    try {
                      a.focus(), a.select();
                      let n = document.execCommand("copy");
                      if (!n) throw Error("Copy failed");
                    } finally {
                      document.body.removeChild(a);
                    }
                  }
                  (f.textContent = "✓"),
                    setTimeout(() => {
                      f.textContent = e;
                    }, 1500);
                } catch (o) {
                  console.error("Copy failed:", o),
                    (f.textContent = "Failed"),
                    setTimeout(() => {
                      f.textContent = e;
                    }, 1500);
                }
              }),
              b.appendChild(f),
              n.appendChild(r),
              n.appendChild(b),
              k.appendChild(n);
          }))
        : (_ &&
            ((_.disabled = !n.rawAnswer),
            (_.style.display = n.rawAnswer ? "flex" : "none")),
          w && n.rawAnswer && (w.style.display = "flex"),
          (k.innerHTML = f)),
      !$ ||
        ($.addEventListener("mousedown", (e) => e.stopPropagation()),
        $.addEventListener("click", l),
        t ||
          d ||
          (($.innerHTML = '<i data-lucide="play"></i>'),
          ($.disabled = !1),
          a())),
      I &&
        (I.addEventListener("mousedown", (e) => e.stopPropagation()),
        I.addEventListener("click", s)),
      w &&
        (w.addEventListener("mousedown", (e) => e.stopPropagation()),
        w.addEventListener("click", () => {
          (n.autoCopy = !n.autoCopy),
            localStorage.setItem("math_scanner_auto_copy", n.autoCopy),
            n.autoCopy
              ? w.classList.add("active")
              : w.classList.remove("active"),
            console.log("Deltahack: Auto-copy toggled:", n.autoCopy);
        })),
      _ &&
        (_.addEventListener("mousedown", (e) => e.stopPropagation()),
        _.addEventListener("click", async () => {
          if (n.rawAnswer)
            try {
              if (navigator.clipboard && navigator.clipboard.writeText)
                await navigator.clipboard.writeText(n.rawAnswer);
              else {
                let e = document.createElement("textarea");
                (e.value = n.rawAnswer),
                  (e.style.position = "fixed"),
                  (e.style.opacity = "0"),
                  document.body.appendChild(e);
                try {
                  e.focus(), e.select();
                  let t = document.execCommand("copy");
                  if (!t) throw Error("Fallback copy command was unsuccessful");
                } finally {
                  document.body.removeChild(e);
                }
              }
              let o = _.innerHTML;
              (_.innerHTML = '<i data-lucide="check"></i>'),
                a(),
                setTimeout(() => {
                  (_.innerHTML = o), a();
                }, 2e3);
            } catch (i) {
              console.error("Deltahack: Failed to copy answer:", i);
            }
        })),
      E &&
        (E.addEventListener("mousedown", (e) => e.stopPropagation()),
        E.addEventListener("click", () => {
          g.remove(), (n.resultIframe = null);
        })),
      !t &&
        !b &&
        !d &&
        n.autoCopy &&
        n.rawAnswer &&
        navigator.clipboard &&
        navigator.clipboard.writeText &&
        navigator.clipboard
          .writeText(n.rawAnswer)
          .then(() => {
            if (
              (console.log("Deltahack: Auto-copied answer:", n.rawAnswer), _)
            ) {
              let e = _.innerHTML;
              (_.innerHTML = '<i data-lucide="check"></i>'),
                a(),
                setTimeout(() => {
                  (_.innerHTML = e), a();
                }, 2e3);
            }
          })
          .catch((e) => {
            console.error("Deltahack: Auto-copy failed:", e);
          }),
      document.body.appendChild(g),
      (n.resultIframe = g),
      r(g, g.querySelector(".result-header")),
      a();
  }
  !(function t() {
    console.log("Deltahack: Creating UI..."),
      n.resultIframe && (n.resultIframe.remove(), (n.resultIframe = null));
    let o = document.createElement("style");
    (o.id = "math-scanner-style"),
      (o.textContent = `
      @keyframes fadeIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
      @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      #result-iframe{position:fixed;top:20px;right:20px;background:#1a1d29;border:1px solid #2a2f3f;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.5);z-index:1000000;min-width:450px;min-height:120px;max-width:520px}
      #result-iframe.animate-in{animation:fadeIn 0.3s ease-out}
      .result-header{background:linear-gradient(135deg,#2a2f3f 0%,#1f2330 100%);color:#e8eaed;padding:12px 16px;cursor:move;display:flex;justify-content:space-between;align-items:center;font-weight:600;border-radius:12px 12px 0 0;font-size:14px}
      .result-actions{display:flex;gap:8px;align-items:center}
      .result-actions button{border:none;cursor:pointer;border-radius:6px;font-size:13px;height:28px;padding:0 10px;font-weight:500;transition:all 0.2s;display:flex;align-items:center;gap:6px}
      .result-actions button svg{width:14px;height:14px;stroke-width:2}
      .scan-btn{background:#3a4a5f;color:#e8eaed}
      .scan-btn:hover:not(:disabled){background:#4a5a6f;transform:translateY(-1px)}
      .scan-btn:disabled{background:#2a2f3f;color:#6c6f7a;cursor:not-allowed;transform:none}
      .scan-btn:disabled svg{animation:spin 1s linear infinite}
      .copy-answer-btn{background:#2a2f3f;color:#b8bac0}
      .copy-answer-btn:hover:not(:disabled){background:#3a3f4f;color:#e8eaed}
      .copy-answer-btn:disabled{opacity:0.4;cursor:not-allowed}
      .auto-copy-toggle{background:#2a2f3f;color:#b8bac0;padding:0 10px}
      .auto-copy-toggle:hover{background:#3a3f4f;color:#e8eaed}
      .auto-copy-toggle.active{background:#3a5a8b;color:#e8eaed}
      .auto-copy-toggle.active:hover{background:#4a6a9b}
      .close-result-btn{background:none;color:#8a8d96;font-size:18px;line-height:18px;padding:0 8px}
      .close-result-btn:hover{background:rgba(255,255,255,0.1);color:#e8eaed}
      .result-content{padding:18px;font-size:15px;line-height:1.7;white-space:pre-wrap;word-wrap:break-word;max-height:420px;overflow-y:auto;color:#e8eaed}
      .result-content code{background:#0f1118;color:#7dd3fc;padding:2px 6px;border-radius:4px;font-family:'Consolas','Monaco','Courier New',monospace;font-size:13px;border:1px solid #1a1d29}
      .result-content::-webkit-scrollbar{width:8px}
      .result-content::-webkit-scrollbar-track{background:#0f1118;border-radius:8px}
      .result-content::-webkit-scrollbar-thumb{background:#2a2f3f;border-radius:8px}
      .result-content::-webkit-scrollbar-thumb:hover{background:#3a3f4f}
      .answer-item{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;margin-bottom:10px;background:#0f1118;border:1px solid #2a2f3f;border-radius:8px;gap:12px;animation:slideIn 0.3s ease-out}
      .answer-item:last-child{margin-bottom:0}
      .answer-text{flex:1;font-size:14px;line-height:1.6;color:#e8eaed}
      .answer-item-actions{display:flex;gap:6px;flex-shrink:0}
      .answer-item-btn{border:none;cursor:pointer;border-radius:6px;font-size:12px;height:26px;padding:0 10px;font-weight:500;transition:all 0.2s;background:#2a2f3f;color:#b8bac0}
      .answer-item-btn:hover{background:#3a3f4f;color:#e8eaed}
      .loading{text-align:center;color:#6c6f7a;animation:pulse 1.5s ease-in-out infinite}
      .error{color:#f87171;animation:slideIn 0.3s ease-out}
      .api-key-section{padding:18px}
      .api-key-section label{display:block;margin-bottom:8px;font-weight:500;color:#b8bac0;font-size:13px}
      .api-key-section input{width:100%;padding:10px 12px;border:1px solid #2a2f3f;background:#0f1118;color:#e8eaed;border-radius:8px;margin-bottom:10px;box-sizing:border-box;font-size:13px;transition:all 0.2s}
      .api-key-section input:focus{outline:none;border-color:#4a4f5f;background:#14161f}
      .api-key-section button{width:100%;padding:10px;background:linear-gradient(135deg,#3a5a8b 0%,#2d4a74 100%);color:#e8eaed;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;transition:all 0.2s}
      .api-key-section button:hover{background:linear-gradient(135deg,#4a6a9b 0%,#3d5a84 100%);transform:translateY(-1px)}
      .api-key-section small{color:#6c6f7a;font-size:11px}
      .api-key-section small a{color:#5b8dee;text-decoration:none}
      .api-key-section small a:hover{text-decoration:underline}
      .result-footer{background:#1a1d29;color:#6c6f7a;padding:6px 16px;text-align:center;font-size:11px;border-radius:0 0 12px 12px;border-top:1px solid #2a2f3f}
      .result-footer a{color:#8a8d96;text-decoration:none;cursor:pointer}
      .result-footer a:hover{color:#b8bac0}
      .settings-btn{background:#2a2f3f;color:#b8bac0}
      .settings-btn:hover{background:#3a3f4f;color:#e8eaed}
      .settings-container{padding:18px}
      .setting-item{display:flex;flex-direction:column;padding:14px 16px;margin-bottom:12px;background:#0f1118;border:1px solid #2a2f3f;border-radius:8px;gap:12px;animation:slideIn 0.3s ease-out}
      .setting-item:last-child{margin-bottom:0}
      .setting-item-row{display:flex;justify-content:space-between;align-items:center;gap:16px}
      .setting-label{flex:1;text-align:left}
      .setting-label-title{font-weight:600;color:#e8eaed;font-size:14px;margin-bottom:4px;text-align:left}
      .setting-label-desc{color:#8a8d96;font-size:12px;text-align:left}
      .setting-control{flex-shrink:0}
      .setting-control input[type="text"],.setting-control input[type="password"]{padding:8px 12px;border:1px solid #2a2f3f;background:#1a1d29;color:#e8eaed;border-radius:6px;font-size:13px;width:200px;transition:border-color 0.2s;font-family:'Consolas','Monaco','Courier New',monospace}
      .setting-control input[type="text"]:focus,.setting-control input[type="password"]:focus{outline:none;border-color:#4a4f5f}
      .setting-toggle{width:48px;height:26px;background:#2a2f3f;border-radius:13px;position:relative;cursor:pointer;transition:background 0.2s}
      .setting-toggle.active{background:#3a5a8b}
      .setting-toggle-slider{position:absolute;top:3px;left:3px;width:20px;height:20px;background:#e8eaed;border-radius:50%;transition:transform 0.2s}
      .setting-toggle.active .setting-toggle-slider{transform:translateX(22px)}
      .token-slider-container{width:100%}
      .token-slider{width:100%;height:6px;background:#2a2f3f;border-radius:3px;outline:none;-webkit-appearance:none;appearance:none;cursor:pointer;border:none}
      .token-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;background:#3a5a8b;border-radius:50%;cursor:pointer;transition:all 0.2s;border:none}
      .token-slider::-webkit-slider-thumb:hover{background:#4a6a9b;transform:scale(1.1)}
      .token-slider::-moz-range-thumb{width:18px;height:18px;background:#3a5a8b;border:none;border-radius:50%;cursor:pointer;transition:all 0.2s}
      .token-slider::-moz-range-thumb:hover{background:#4a6a9b;transform:scale(1.1)}
      .token-slider-labels{display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:#6c6f7a}
      .token-slider-value{text-align:center;color:#e8eaed;font-weight:600;font-size:14px;margin-bottom:8px}
      .save-settings-btn{width:100%;padding:12px;background:linear-gradient(135deg,#3a5a8b 0%,#2d4a74 100%);color:#e8eaed;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.2s;margin-top:12px}
      .save-settings-btn:hover{background:linear-gradient(135deg,#4a6a9b 0%,#3d5a84 100%);transform:translateY(-1px)}
      .settings-buttons{display:flex;gap:12px;margin-top:12px}
      .back-settings-btn{width:44px;min-width:44px;height:44px;min-height:44px;padding:0;background:#2a2f3f;color:#b8bac0;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.2s;display:flex;align-items:center;justify-content:center;flex-shrink:0}
      .back-settings-btn:hover{background:#3a3f4f;color:#e8eaed;transform:translateY(-1px)}
      .back-settings-btn svg{width:18px;height:18px}
      .save-settings-btn-row{flex:1;height:44px;min-height:44px;padding:0 16px;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#3a5a8b 0%,#2d4a74 100%);color:#e8eaed;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.2s}
      .save-settings-btn-row:hover{background:linear-gradient(135deg,#4a6a9b 0%,#3d5a84 100%);transform:translateY(-1px)}
      .save-settings-btn-row svg{width:16px;height:16px}`),
      document.head.appendChild(o),
      (n.styleTag = o);
    let i = localStorage.getItem("gemini_api_key");
    i
      ? ((e.GEMINI_API_KEY = i),
        console.log("Deltahack: Loaded API key from localStorage."),
        c("Ready to scan", !1, !0))
      : (console.log("Deltahack: No API key found. Showing setup."),
        (function t() {
          n.resultIframe && n.resultIframe.remove();
          let o = document.createElement("div");
          (o.id = "result-iframe"),
            (o.style.top = "20px"),
            (o.style.right = "20px"),
            (o.innerHTML = `
      <div class="result-header">
        <span>Deltahack Setup</span>
        <div class="result-actions">
          <button class="close-result-btn" title="Close">\xd7</button>
        </div>
      </div>
      <div class="api-key-section">
        <label for="gemini-api-key">Gemini API Key:</label>
        <input type="password" id="gemini-api-key" placeholder="Enter your API key">
        <button id="save-api-key">Save</button>
        <small>Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank">AI Studio</a></small>
      </div>
      <div class="result-footer">
        <span>DogeUB - <a id="discord-link">discord.gg/unblocking</a>  |  Ctrl+E to quick hide</span>
      </div>`);
          let i = o.querySelector(".close-result-btn"),
            s = o.querySelector("#discord-link");
          s &&
            s.addEventListener("click", (e) => {
              e.preventDefault(),
                window.open("https://discord.gg/unblocking", "_blank");
            }),
            i.addEventListener("click", () => {
              o.remove(),
                (n.resultIframe = null),
                n.styleTag && n.styleTag.remove();
            });
          let l = o.querySelector("#save-api-key");
          l.addEventListener("click", () => {
            let t = o.querySelector("#gemini-api-key").value.trim();
            t
              ? ((e.GEMINI_API_KEY = t),
                localStorage.setItem("gemini_api_key", t),
                console.log("Deltahack: API key saved."),
                c("Ready to scan", !1, !0))
              : alert("Please enter a valid API key");
          }),
            document.body.appendChild(o),
            (n.resultIframe = o),
            r(o, o.querySelector(".result-header")),
            a();
        })()),
      document.addEventListener("keydown", (e) => {
        if (!n.resultIframe) return;
        let t = n.hideKeybind.toLowerCase(),
          a = t.split("+"),
          o = a[a.length - 1],
          i = a.includes("ctrl"),
          r = a.includes("alt"),
          s = a.includes("shift"),
          l = e.key.toLowerCase() === o,
          d = i ? e.ctrlKey : !e.ctrlKey,
          c = r ? e.altKey : !e.altKey,
          p = s ? e.shiftKey : !e.shiftKey;
        l &&
          d &&
          c &&
          p &&
          (e.preventDefault(),
          e.stopPropagation(),
          n.resultIframe &&
            ((n.isHidden = !n.isHidden),
            (n.resultIframe.style.display = n.isHidden ? "none" : "block"),
            console.log("Deltahack: Iframe visibility toggled:", !n.isHidden)));
      });
  })();
})();

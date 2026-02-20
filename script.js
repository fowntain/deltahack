// Licensed under GNU General Public License v3.0
// Created by fowntain

(function () {
  if (document.getElementById("result-iframe")) {
    alert("Deltahack is already running!");
    return;
  }
  console.log("Deltahack: Initializing...");

  const CONFIG = {
    GEMINI_API_KEY: "",
    GEMINI_API_URL:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  };

  const TOKEN_PRESETS = [512, 1024, 2048, 4096, 6144, 8192];

  function loadLucideIfNeeded() {
    if (!window.lucide) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/lucide@latest";
      script.onload = () => {
        if (window.lucide) {
          window.lucide.createIcons();
        }
      };
      document.head.appendChild(script);
    } else {
      window.lucide.createIcons();
    }
  }

  let state = {
    resultIframe: null,
    styleTag: null,
    rawAnswer: "",
    autoCopy: localStorage.getItem("math_scanner_auto_copy") === "true",
    maxTokens:
      parseInt(localStorage.getItem("math_scanner_max_tokens")) || 4096,
    showExplanations:
      localStorage.getItem("math_scanner_explanations") === "true",
    hideKeybind: localStorage.getItem("math_scanner_hide_keybind") || "ctrl+e",
    scanKeybind: localStorage.getItem("math_scanner_scan_keybind") || "ctrl+r",
    proxyUrl: localStorage.getItem("math_scanner_proxy_url") || "",
    isHidden: false,
  };

  function evaluateMathExpressions(answer) {
    console.log("Deltahack: Evaluating math expressions...");
    const regex = /{{(.*?)}}/g;
    return answer.replace(regex, (match, expression) => {
      try {
        let sanitized = expression.replace(/\s+/g, "");

        let testString = sanitized
          .replace(/Math\.sqrt/g, "")
          .replace(/Math\.PI/g, "");

        if (/[^0-9\+\-\*\/\.\(\)\[\]\^,A-Za-z]/g.test(testString)) {
          console.warn(
            "Deltahack: Blocked potentially unsafe math expression:",
            expression
          );
          return `[Invalid Expression]`;
        }

        const variableCheckString = testString.replace(
          /(\d+(?:\.\d+)?)[eE][\+\-]?\d+/g,
          ""
        );
        if (/[A-Za-z]/.test(variableCheckString)) {
          console.info(
            "Deltahack: Skipping evaluation for symbolic expression:",
            expression
          );
          return expression.trim();
        }

        sanitized = sanitized.replace(/\^/g, "**");
        sanitized = sanitized.replace(/(\d)(\()/g, "$1*$2");
        sanitized = sanitized.replace(/\)(\d)/g, ")*$2");
        sanitized = sanitized.replace(/\)\(/g, ")*(");
        sanitized = sanitized.replace(/(\d)(Math\.sqrt)/g, "$1*$2");
        sanitized = sanitized.replace(/(\d)(Math\.PI)/g, "$1*$2");

        const result = new Function("return " + sanitized)();

        if (typeof result === "number" && result % 1 !== 0) {
          const resultString = result.toString();
          if (
            resultString.includes(".") &&
            resultString.split(".")[1].length > 4
          ) {
            const roundedResult = parseFloat(result.toFixed(4));
            console.log(
              `Deltahack: Evaluated: ${expression.trim()} = ${result} (rounded to ${roundedResult})`
            );
            return roundedResult.toString();
          }
        }

        console.log(`Deltahack: Evaluated: ${expression.trim()} = ${result}`);
        return result.toString();
      } catch (error) {
        console.error(
          "Deltahack: Error evaluating math expression:",
          expression,
          error
        );
        return `[Calculation Error: ${expression}]`;
      }
    });
  }

  function formatAnswerForDisplay(answer) {
    const escapeHtml = (str) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    let safe = answer.replace(/«([^»]+)»/g, "$1");
    safe = escapeHtml(safe);

    safe = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");

    safe = safe.replace(/\^\{([^}]+)\}/g, "<sup>$1</sup>");
    safe = safe.replace(
      /([A-Za-z0-9\)\]])\^(-?\d+(?:\.\d+)?)/g,
      "$1<sup>$2</sup>"
    );
    safe = safe.replace(/Math\.sqrt/g, "&radic;");
    safe = safe.replace(/Math\.PI/g, "&pi;");
    safe = safe.replace(/ \* /g, " &times; ");
    safe = safe.replace(/\n/g, "<br>");
    safe = safe.replace(/ {2,}/g, (match) => "&nbsp;".repeat(match.length));
    return safe;
  }

  function extractRawAnswer(text) {
    if (!text) return "";
    const matches = [];
    const re = /«([^»]+)»/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const part = (m[1] || "").trim();
      if (part) matches.push(part);
    }
    return matches.join("\n");
  }

  async function copyWithRetry(text, retries, delay) {
    retries = retries || 3;
    delay = delay || 100;
    for (var attempt = 1; attempt <= retries; attempt++) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.style.cssText = "position:fixed;opacity:0";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          var ok = document.execCommand("copy");
          document.body.removeChild(ta);
          if (!ok) throw new Error("execCommand copy failed");
        }
        return true;
      } catch (e) {
        if (attempt < retries) {
          await new Promise(function(r) { setTimeout(r, delay); });
        } else {
          throw e;
        }
      }
    }
  }

  function executeSandboxedJS(code, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const id = "sbx_" + Math.random().toString(36).substr(2, 12);
      let timer, iframe;

      const cleanup = () => {
        clearTimeout(timer);
        window.removeEventListener("message", handler);
        if (iframe && iframe.parentNode) iframe.remove();
      };

      const handler = (e) => {
        if (!e.data || e.data.sbxId !== id) return;
        if (e.data.ready) {
          iframe.contentWindow.postMessage({ sbxId: id, code }, "*");
          return;
        }
        cleanup();
        if (e.data.error) {
          reject(new Error(e.data.error));
        } else {
          resolve(e.data.result);
        }
      };

      window.addEventListener("message", handler);

      iframe = document.createElement("iframe");
      iframe.sandbox = "allow-scripts";
      iframe.style.cssText =
        "position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none;z-index:-1";
      iframe.srcdoc = [
        "<script>",
        "window.addEventListener('message', function(e) {",
        "  if (!e.data || e.data.sbxId !== '" + id + "') return;",
        "  try {",
        "    var __fn = new Function(e.data.code);",
        "    var __r = __fn();",
        "    parent.postMessage({sbxId: '" + id + "', result: __r == null ? 'undefined' : String(__r)}, '*');",
        "  } catch(err) {",
        "    parent.postMessage({sbxId: '" + id + "', error: err.message}, '*');",
        "  }",
        "});",
        "parent.postMessage({sbxId: '" + id + "', ready: true}, '*');",
        "<\/script>",
      ].join("\n");

      document.body.appendChild(iframe);

      timer = setTimeout(() => {
        cleanup();
        reject(new Error("Code execution timed out (" + timeout + "ms)"));
      }, timeout);
    });
  }

  function transpilePythonToJS(pyCode) {
    let js = pyCode;

    js = js.replace(
      /^\s*(import\s+math|from\s+math\s+import\s+[^;\n]*)\s*$/gm,
      ""
    );
    js = js.replace(/^\s*import\s+\w+.*$/gm, "");
    js = js.replace(/^\s*from\s+\w+\s+import\s+.*$/gm, "");

    const mathMap = {
      "math.sqrt": "Math.sqrt",
      "math.pi": "Math.PI",
      "math.e": "Math.E",
      "math.sin": "Math.sin",
      "math.cos": "Math.cos",
      "math.tan": "Math.tan",
      "math.asin": "Math.asin",
      "math.acos": "Math.acos",
      "math.atan": "Math.atan",
      "math.atan2": "Math.atan2",
      "math.log10": "Math.log10",
      "math.log2": "Math.log2",
      "math.log": "Math.log",
      "math.floor": "Math.floor",
      "math.ceil": "Math.ceil",
      "math.pow": "Math.pow",
      "math.fabs": "Math.abs",
      "math.inf": "Infinity",
    };
    for (const [py, jsFn] of Object.entries(mathMap)) {
      js = js.split(py).join(jsFn);
    }

    js = js.replace(/\babs\(/g, "Math.abs(");
    js = js.replace(
      /\bround\(([^,)]+),\s*(\d+)\)/g,
      "parseFloat(($1).toFixed($2))"
    );
    js = js.replace(/\bround\(([^)]+)\)/g, "Math.round($1)");
    js = js.replace(/\bint\(/g, "Math.trunc(");
    js = js.replace(/\bfloat\(/g, "Number(");
    js = js.replace(/\bstr\(/g, "String(");

    js = js.replace(/\bTrue\b/g, "true");
    js = js.replace(/\bFalse\b/g, "false");
    js = js.replace(/\bNone\b/g, "null");

    js = js.replace(
      /(\w[\w.]*)\s*\/\/\s*(\w[\w.]*)/g,
      "Math.floor($1 / $2)"
    );

    js = js.replace(/(^|\s)#(.*)$/gm, "$1//$2");

    let hasPrint = /\bprint\s*\(/.test(js);
    if (hasPrint) {
      js =
        'var __out = [];\n' +
        js.replace(
          /\bprint\s*\(([^)]*)\)/g,
          "__out.push(String($1))"
        ) +
        '\nreturn __out.join("\\n");';
    } else if (!/\breturn\b/.test(js)) {
      let lines = js.split("\n").filter((l) => l.trim());
      if (lines.length > 0) {
        let last = lines[lines.length - 1].trim();
        if (
          !last.startsWith("var ") &&
          !last.startsWith("let ") &&
          !last.startsWith("//") &&
          !last.startsWith("}") &&
          last !== ""
        ) {
          lines[lines.length - 1] = "return " + last;
        }
      }
      js = lines.join("\n");
    }

    return js;
  }

  async function processCodeBlocks(answer) {
    const jsBlockRegex = /\[EXEC_JS\]([\s\S]*?)\[\/EXEC_JS\]/g;
    const pyBlockRegex = /\[EXEC_PY\]([\s\S]*?)\[\/EXEC_PY\]/g;

    let result = answer;
    const blocks = [];
    let match;

    while ((match = jsBlockRegex.exec(answer)) !== null) {
      blocks.push({
        full: match[0],
        code: match[1].trim(),
        lang: "js",
        index: match.index,
      });
    }
    while ((match = pyBlockRegex.exec(answer)) !== null) {
      blocks.push({
        full: match[0],
        code: match[1].trim(),
        lang: "py",
        index: match.index,
      });
    }

    if (blocks.length === 0) {
      console.warn(
        "Deltahack: ⚠ No [EXEC_JS] or [EXEC_PY] code blocks found in AI response. AI did not use code execution."
      );
      return answer;
    }

    console.log(
      `Deltahack: ✓ Found ${blocks.length} code block(s) to execute.`
    );

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      try {
        let codeToRun = block.code;
        if (block.lang === "py") {
          console.log(
            `Deltahack: [Block ${i + 1}/${blocks.length}] Transpiling Python → JS...`
          );
          codeToRun = transpilePythonToJS(codeToRun);
          console.log(
            `Deltahack: [Block ${i + 1}] Transpiled code:`,
            codeToRun
          );
        }

        console.log(
          `Deltahack: [Block ${i + 1}/${blocks.length}] Executing ${block.lang} in sandbox:\n`,
          block.code
        );
        const execResult = await executeSandboxedJS(codeToRun);
        console.log(
          `Deltahack: [Block ${i + 1}/${blocks.length}] ✓ Result: ${execResult}`
        );
        result = result.replace(block.full, execResult);
      } catch (err) {
        console.error(
          `Deltahack: [Block ${i + 1}/${blocks.length}] ✗ Execution failed:`,
          err
        );
        result = result.replace(
          block.full,
          `[Code Error: ${err.message}]`
        );
      }
    }

    return result;
  }

  function createUI() {
    console.log("Deltahack: Creating UI...");
    if (state.resultIframe) {
      state.resultIframe.remove();
      state.resultIframe = null;
    }

    const style = document.createElement("style");
    style.id = "math-scanner-style";
    style.textContent = `
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
      .save-settings-btn-row svg{width:16px;height:16px}`;

    document.head.appendChild(style);
    state.styleTag = style;

    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      CONFIG.GEMINI_API_KEY = savedKey;
      console.log("Deltahack: Loaded API key from localStorage.");
      showResult("Ready to scan", false, true);
    } else {
      console.log("Deltahack: No API key found. Showing setup.");
      showApiKeySetup();
    }

    function matchKeybind(e, keybindStr) {
      const parts = keybindStr.toLowerCase().split("+");
      const key = parts[parts.length - 1];
      const needsCtrl = parts.includes("ctrl");
      const needsAlt = parts.includes("alt");
      const needsShift = parts.includes("shift");
      return (
        e.key.toLowerCase() === key &&
        (needsCtrl ? e.ctrlKey : !e.ctrlKey) &&
        (needsAlt ? e.altKey : !e.altKey) &&
        (needsShift ? e.shiftKey : !e.shiftKey)
      );
    }

    document.addEventListener("keydown", (e) => {
      if (!state.resultIframe) return;

      if (matchKeybind(e, state.hideKeybind)) {
        e.preventDefault();
        e.stopPropagation();
        toggleIframeVisibility();
        return;
      }

      if (matchKeybind(e, state.scanKeybind)) {
        e.preventDefault();
        e.stopPropagation();
        const scanBtn = document.querySelector(".scan-btn");
        if (scanBtn && !scanBtn.disabled) {
          scanPage();
        }
        return;
      }
    });
  }

  function toggleIframeVisibility() {
    if (!state.resultIframe) return;

    state.isHidden = !state.isHidden;
    state.resultIframe.style.display = state.isHidden ? "none" : "block";
    console.log("Deltahack: Iframe visibility toggled:", !state.isHidden);
  }

  function showApiKeySetup() {
    if (state.resultIframe) {
      state.resultIframe.remove();
    }

    const resultDiv = document.createElement("div");
    resultDiv.id = "result-iframe";
    resultDiv.style.top = "20px";
    resultDiv.style.right = "20px";

    resultDiv.innerHTML = `
      <div class="result-header">
        <span>Deltahack Setup</span>
        <div class="result-actions">
          <button class="close-result-btn" title="Close">×</button>
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
      </div>`;

    const closeButton = resultDiv.querySelector(".close-result-btn");
    const discordLink = resultDiv.querySelector("#discord-link");
    if (discordLink) {
      discordLink.addEventListener("click", (e) => {
        e.preventDefault();
        window.open("https://discord.gg/unblocking", "_blank");
      });
    }
    closeButton.addEventListener("click", () => {
      resultDiv.remove();
      state.resultIframe = null;
      if (state.styleTag) state.styleTag.remove();
    });

    const saveButton = resultDiv.querySelector("#save-api-key");
    saveButton.addEventListener("click", () => {
      const apiKey = resultDiv.querySelector("#gemini-api-key").value.trim();
      if (apiKey) {
        CONFIG.GEMINI_API_KEY = apiKey;
        localStorage.setItem("gemini_api_key", apiKey);
        console.log("Deltahack: API key saved.");
        showResult("Ready to scan", false, true);
      } else {
        alert("Please enter a valid API key");
      }
    });

    document.body.appendChild(resultDiv);
    state.resultIframe = resultDiv;
    makeDraggable(resultDiv, resultDiv.querySelector(".result-header"));
    loadLucideIfNeeded();
  }

  function makeDraggable(element, handle) {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = element.offsetTop - pos2 + "px";
      element.style.left = element.offsetLeft - pos1 + "px";
      element.style.right = "auto";
      element.style.bottom = "auto";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  function showSettings() {
    console.log("Deltahack: Opening settings...");
    let savedPosition = null;
    if (state.resultIframe) {
      savedPosition = {
        top: state.resultIframe.style.top,
        left: state.resultIframe.style.left,
        right: state.resultIframe.style.right,
        bottom: state.resultIframe.style.bottom,
      };
      state.resultIframe.remove();
      state.resultIframe = null;
    }

    const resultDiv = document.createElement("div");
    resultDiv.id = "result-iframe";
    if (savedPosition) {
      if (savedPosition.top) resultDiv.style.top = savedPosition.top;
      if (savedPosition.left) resultDiv.style.left = savedPosition.left;
      if (savedPosition.right) resultDiv.style.right = savedPosition.right;
      if (savedPosition.bottom) resultDiv.style.bottom = savedPosition.bottom;
    }

    const currentTokenIndex = TOKEN_PRESETS.findIndex(
      (val) => val >= state.maxTokens
    );
    const sliderValue =
      currentTokenIndex >= 0 ? currentTokenIndex : TOKEN_PRESETS.length - 1;

    resultDiv.innerHTML = `
      <div class="result-header">
        <span>Settings</span>
        <div class="result-actions">
          <button class="close-result-btn" title="Close">×</button>
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
                CONFIG.GEMINI_API_KEY
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
            <div class="token-slider-value" id="token-value">${
              TOKEN_PRESETS[sliderValue]
            }</div>
            <input type="range" class="token-slider" id="settings-max-tokens" min="0" max="${
              TOKEN_PRESETS.length - 1
            }" step="1" value="${sliderValue}">
            <div class="token-slider-labels">
              ${TOKEN_PRESETS.map((val) => `<span>${val}</span>`).join("")}
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
                state.showExplanations ? "active" : ""
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
                state.hideKeybind
              }">
            </div>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-item-row">
            <div class="setting-label">
              <div class="setting-label-title">Scan Keybind</div>
              <div class="setting-label-desc">Quick scan shortcut</div>
            </div>
            <div class="setting-control">
              <input type="text" id="settings-scan-keybind" placeholder="ctrl+r" value="${
                state.scanKeybind
              }">
            </div>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-item-row">
            <div class="setting-label">
              <div class="setting-label-title">Proxy URL</div>
              <div class="setting-label-desc">Route API calls through a proxy to bypass CSP (optional)</div>
            </div>
            <div class="setting-control">
              <input type="text" id="settings-proxy-url" placeholder="https://your-proxy.workers.dev" value="${
                state.proxyUrl
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

    const closeButton = resultDiv.querySelector(".close-result-btn");
    const discordLink = resultDiv.querySelector("#discord-link");
    const explanationsToggle = resultDiv.querySelector(
      "#settings-explanations"
    );
    const saveButton = resultDiv.querySelector("#save-settings");
    const backButton = resultDiv.querySelector("#back-settings");
    const tokenSlider = resultDiv.querySelector("#settings-max-tokens");
    const tokenValueDisplay = resultDiv.querySelector("#token-value");
    const keybindInput = resultDiv.querySelector("#settings-keybind");
    const scanKeybindInput = resultDiv.querySelector("#settings-scan-keybind");
    const proxyUrlInput = resultDiv.querySelector("#settings-proxy-url");

    const originalValues = {
      apiKey: CONFIG.GEMINI_API_KEY,
      maxTokens: state.maxTokens,
      showExplanations: state.showExplanations,
      hideKeybind: state.hideKeybind,
      scanKeybind: state.scanKeybind,
      proxyUrl: state.proxyUrl,
    };

    function hasChanges() {
      const currentApiKey = resultDiv
        .querySelector("#settings-api-key")
        .value.trim();
      const currentTokenIndex = parseInt(
        resultDiv.querySelector("#settings-max-tokens").value
      );
      const currentMaxTokens = TOKEN_PRESETS[currentTokenIndex];
      const currentExplanations =
        explanationsToggle.classList.contains("active");
      const currentKeybind = keybindInput.value.trim();
      const currentScanKeybind = scanKeybindInput.value.trim();
      const currentProxyUrl = proxyUrlInput.value.trim();

      return (
        currentApiKey !== originalValues.apiKey ||
        currentMaxTokens !== originalValues.maxTokens ||
        currentExplanations !== originalValues.showExplanations ||
        currentKeybind !== originalValues.hideKeybind ||
        currentScanKeybind !== originalValues.scanKeybind ||
        currentProxyUrl !== originalValues.proxyUrl
      );
    }

    if (discordLink) {
      discordLink.addEventListener("click", (e) => {
        e.preventDefault();
        window.open("https://discord.gg/unblocking", "_blank");
      });
    }

    closeButton.addEventListener("click", () => {
      resultDiv.remove();
      state.resultIframe = null;
    });

    if (tokenSlider && tokenValueDisplay) {
      tokenSlider.addEventListener("input", (e) => {
        const index = parseInt(e.target.value);
        tokenValueDisplay.textContent = TOKEN_PRESETS[index];
      });
    }

    if (explanationsToggle) {
      explanationsToggle.addEventListener("click", () => {
        explanationsToggle.classList.toggle("active");
      });
    }

    saveButton.addEventListener("click", () => {
      const apiKey = resultDiv.querySelector("#settings-api-key").value.trim();
      const tokenIndex = parseInt(
        resultDiv.querySelector("#settings-max-tokens").value
      );
      const maxTokens = TOKEN_PRESETS[tokenIndex];
      const explanations = explanationsToggle.classList.contains("active");
      const keybind = keybindInput.value.trim();

      if (apiKey) {
        CONFIG.GEMINI_API_KEY = apiKey;
        localStorage.setItem("gemini_api_key", apiKey);
      }

      state.maxTokens = maxTokens;
      localStorage.setItem("math_scanner_max_tokens", maxTokens.toString());

      state.showExplanations = explanations;
      localStorage.setItem(
        "math_scanner_explanations",
        explanations.toString()
      );

      if (keybind) {
        state.hideKeybind = keybind;
        localStorage.setItem("math_scanner_hide_keybind", keybind);
      }

      const scanKeybind = scanKeybindInput.value.trim();
      if (scanKeybind) {
        state.scanKeybind = scanKeybind;
        localStorage.setItem("math_scanner_scan_keybind", scanKeybind);
      }

      state.proxyUrl = proxyUrlInput.value.trim();
      localStorage.setItem("math_scanner_proxy_url", state.proxyUrl);

      console.log("Deltahack: Settings saved.");
      showResult("Ready to scan", false, true, true);
    });

    if (backButton) {
      backButton.addEventListener("click", () => {
        if (hasChanges()) {
          if (
            !confirm(
              "You have unsaved changes. Are you sure you want to go back?"
            )
          ) {
            return;
          }
        }
        showResult("Ready to scan", false, true, true);
      });
    }

    document.body.appendChild(resultDiv);
    state.resultIframe = resultDiv;
    makeDraggable(resultDiv, resultDiv.querySelector(".result-header"));
    loadLucideIfNeeded();
  }

  async function scanPage() {
    console.log("Deltahack: 'Scan Page' clicked.");
    const scanBtn = document.querySelector(".scan-btn");
    if (scanBtn) {
      scanBtn.disabled = true;
      scanBtn.innerHTML = `<i data-lucide="loader-2"></i>`;
      loadLucideIfNeeded();
    }

    try {
      let pageText = "";
      const iframe = document.querySelector("iframe.tool_launch");

      if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
        console.log(
          "Deltahack: Found tool iframe. Reading text from iframe body."
        );
        pageText = iframe.contentDocument.body.innerText;
      } else {
        console.log(
          "Deltahack: No tool iframe found. Falling back to main document body text."
        );
        pageText = document.body.innerText;
      }

      if (!pageText || pageText.trim() === "") {
        throw new Error("Could not get any visible text from the page.");
      }

      console.log(
        `Deltahack: Page text captured (${pageText.length} chars). Sending to AI.`
      );
      await sendToGemini(pageText);
    } catch (error) {
      console.error("Deltahack: Scan error:", error);
      showResult("Error: " + error.message, true);
    }
  }

  async function sendToGemini(pageText) {
    if (!CONFIG.GEMINI_API_KEY) {
      showResult("Error: API key not set", true);
      return;
    }
    console.log("Deltahack: Calling sendToGemini...");
    showResult("Loading...", false);

    try {
      console.log("Deltahack: Sending fetch request to Gemini...");
      const apiUrl = state.proxyUrl || CONFIG.GEMINI_API_URL;
      const response = await fetch(
        `${apiUrl}?key=${CONFIG.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: state.showExplanations
                      ? "Solve the math problem from this DeltaMath page. Text may be fragmented (e.g., 'f(x)=9(1.05)\\n-\\nx' means 'f(x)=9(1.05)^-x'). Answer ALL parts.\n\nCRITICAL RULE — MANDATORY CODE EXECUTION:\n- You MUST perform ALL numerical calculations using [EXEC_JS]...[/EXEC_JS] blocks. NEVER compute numbers yourself — your arithmetic is unreliable.\n- Do NOT write your own calculated number anywhere. The code block output IS the number. Do NOT duplicate or guess the result.\n- Do NOT write comments in code blocks. No // or /* comments. Just raw code to save tokens.\n- JS code MUST use 'return' for the final value.\n\nExample:\n«[EXEC_JS]\nvar a = 5000 * Math.pow(1.05, 12);\nreturn Math.round(a * 100) / 100;\n[/EXEC_JS]»\n\nWrap each final answer in guillemets «». Place the [EXEC_JS] block INSIDE the «» so its output becomes the answer. For non-numeric answers just write them directly: «all real numbers»\n\nFor multiple parts, label each:\nDomain: «[13, 18]»\nRange: «(-∞, 8]»\n\nCommon non-numeric answers: 'does NOT make sense', 'does make sense', 'all real numbers', 'non-negative real numbers'.\n\nProvide concise step-by-step explanations for your reasoning (but never manually compute a number — always use a code block). If it is a graphing problem, provide key points/equations and explain how to plot them. If you cannot answer, say 'Cannot solve this problem.'"
                      : "Solve the math problem from this DeltaMath page. Text may be fragmented (e.g., 'f(x)=9(1.05)\\n-\\nx' means 'f(x)=9(1.05)^-x'). Answer ALL parts.\n\nCRITICAL RULE — MANDATORY CODE EXECUTION:\n- You MUST perform ALL numerical calculations using [EXEC_JS]...[/EXEC_JS] blocks. NEVER compute numbers yourself — your arithmetic is unreliable.\n- Do NOT write your own calculated number anywhere. The code block output IS the number. Do NOT duplicate or guess the result.\n- Do NOT write comments in code blocks. No // or /* comments. Just raw code to save tokens.\n- JS code MUST use 'return' for the final value.\n\nExample:\n«[EXEC_JS]\nvar a = 5000 * Math.pow(1.05, 12);\nreturn Math.round(a * 100) / 100;\n[/EXEC_JS]»\n\nWrap each final answer in guillemets «». Place the [EXEC_JS] block INSIDE the «» so its output becomes the answer. For non-numeric answers just write them directly: «all real numbers»\n\nFor multiple parts, label each:\nDomain: «[13, 18]»\nRange: «(-∞, 8]»\n\nCommon non-numeric answers: 'does NOT make sense', 'does make sense', 'all real numbers', 'non-negative real numbers'.\n\nDo NOT include any explanations, steps, or reasoning. Output ONLY the labeled answers with «» markers. No extra text. If it is a graphing problem, provide only the key points or equations needed. If you cannot answer, say 'Cannot solve this problem.'",
                  },
                  {
                    text: pageText,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              topK: 32,
              topP: 1,
              maxOutputTokens: state.maxTokens,
            },
          }),
        }
      );

      console.log(
        "Deltahack: Fetch response received:",
        response.status,
        response.statusText
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Deltahack: API request failed:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(
            `API request failed with status ${response.status}. Response: ${errorText}`
          );
        }
        throw new Error(
          errorData.error?.message ||
            `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Deltahack: API data parsed:", data);

      if (data.candidates?.[0]?.finishReason === "SAFETY") {
        console.warn("Deltahack: Response blocked for safety reasons.");
        throw new Error(
          "Response was blocked for safety reasons. The page text might be too large or complex."
        );
      }

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content ||
        !data.candidates[0].content.parts ||
        !data.candidates[0].content.parts[0] ||
        !data.candidates[0].content.parts[0].text
      ) {
        console.error("Deltahack: Invalid response structure:", data);
        const finishReason = data.candidates?.[0]?.finishReason;
        if (finishReason && finishReason !== "STOP") {
          throw new Error(
            `Response blocked: ${finishReason}. Try scanning again.`
          );
        }
        throw new Error("No answer received (invalid response structure).");
      }

      let answer = data.candidates[0].content.parts[0].text;
      console.log("Deltahack: Answer received:", answer);

      try {
        answer = await processCodeBlocks(answer);
      } catch (codeErr) {
        console.error(
          "Deltahack: Code block processing error:",
          codeErr
        );
      }

      showResult(answer, false, false, true);
    } catch (error) {
      console.error("Deltahack: Gemini API error:", error);
      showResult("Error: " + error.message, true);
    }
  }

  function showResult(
    answer,
    isError = false,
    isReady = false,
    shouldAnimate = false
  ) {
    console.log("Deltahack: Showing result. Is Error:", isError);
    let savedPosition = null;
    if (state.resultIframe) {
      savedPosition = {
        top: state.resultIframe.style.top,
        left: state.resultIframe.style.left,
        right: state.resultIframe.style.right,
        bottom: state.resultIframe.style.bottom,
      };
      state.resultIframe.remove();
      state.resultIframe = null;
    }
    let processedAnswer;
    if (isError) {
      processedAnswer = answer;
    } else if (answer === "Loading...") {
      processedAnswer = "Loading...";
    } else {
      processedAnswer = evaluateMathExpressions(answer);
    }
    const resultDiv = document.createElement("div");
    resultDiv.id = "result-iframe";

    if (shouldAnimate) {
      resultDiv.classList.add("animate-in");
    }

    if (savedPosition) {
      if (savedPosition.top) resultDiv.style.top = savedPosition.top;
      if (savedPosition.left) resultDiv.style.left = savedPosition.left;
      if (savedPosition.right) resultDiv.style.right = savedPosition.right;
      if (savedPosition.bottom) resultDiv.style.bottom = savedPosition.bottom;
    }

    state.isHidden = false;

    state.rawAnswer = "";
    const isLoading = answer === "Loading...";
    let formattedAnswer = "";
    const rawAnswers = [];
    if (!isError && !isLoading) {
      const extracted = extractRawAnswer(answer);
      state.rawAnswer = evaluateMathExpressions(extracted);
      rawAnswers.push(...state.rawAnswer.split("\n").filter((a) => a.trim()));
      formattedAnswer = formatAnswerForDisplay(processedAnswer);
    }

    const contentClass = isError ? "error" : isLoading ? "loading" : "";
    const hasMultipleAnswers = rawAnswers.length > 1;

    const headerButtons = `
      <button class="scan-btn" title="Scan page for math problems">
        <i data-lucide="play"></i>
      </button>
      <button class="copy-answer-btn" title="Copy answer to clipboard">
        <i data-lucide="clipboard"></i>
      </button>
      <button class="auto-copy-toggle ${
        state.autoCopy ? "active" : ""
      }" title="Toggle auto-copy">
        <span>Auto</span>
      </button>
      <button class="settings-btn" title="Settings">
        <i data-lucide="settings"></i>
      </button>
      <button class="close-result-btn" title="Close">×</button>
    `;

    resultDiv.innerHTML = `
      <div class="result-header">
        <span>Deltahack v0.1</span>
        <div class="result-actions">
          ${headerButtons}
        </div>
      </div>
      <div class="result-content ${contentClass}"></div>
      <div class="result-footer">
        <span>DogeUB - <a id="discord-link">discord.gg/unblocking</a>  |  Ctrl+E to quick hide</span>
      </div>`;

    const contentElement = resultDiv.querySelector(".result-content");
    const discordLink = resultDiv.querySelector("#discord-link");
    if (discordLink) {
      discordLink.addEventListener("click", (e) => {
        e.preventDefault();
        window.open("https://discord.gg/unblocking", "_blank");
      });
    }
    const scanBtn = resultDiv.querySelector(".scan-btn");
    const copyButton = resultDiv.querySelector(".copy-answer-btn");
    const autoCopyToggle = resultDiv.querySelector(".auto-copy-toggle");
    const settingsBtn = resultDiv.querySelector(".settings-btn");
    const closeButton = resultDiv.querySelector(".close-result-btn");

    if (isError || isLoading || isReady) {
      if (copyButton) copyButton.style.display = "none";
      if (autoCopyToggle) autoCopyToggle.style.display = "none";
    }

    if (hasMultipleAnswers) {
      if (copyButton) copyButton.style.display = "none";
    }

    if (isError) {
      if (scanBtn) {
        scanBtn.disabled = false;
        scanBtn.innerHTML = `<i data-lucide="play"></i>`;
        loadLucideIfNeeded();
      }
      contentElement.innerText = processedAnswer;
    } else if (isLoading) {
      if (scanBtn) {
        scanBtn.disabled = true;
        scanBtn.innerHTML = `<i data-lucide="loader-2"></i>`;
        loadLucideIfNeeded();
      }
      contentElement.innerText = "Loading...";
    } else if (isReady) {
      contentElement.innerHTML =
        '<div style="text-align:center;padding:20px;color:#8a8d96; font-size:14px;">Deltahack ready for scan</div>';
    } else if (hasMultipleAnswers) {
      contentElement.innerHTML = "";
      rawAnswers.forEach((evaluatedAnswer, index) => {
        const answerItem = document.createElement("div");
        answerItem.className = "answer-item";

        const answerText = document.createElement("div");
        answerText.className = "answer-text";

        const lines = answer.split("\n");
        let displayLine = evaluatedAnswer;

        for (const line of lines) {
          const guillemets = line.match(/«([^»]+)»/);
          if (guillemets) {
            const extractedRaw = guillemets[1].trim();
            const extractedEvaluated = evaluateMathExpressions(extractedRaw);
            if (extractedEvaluated === evaluatedAnswer) {
              displayLine = line.replace(/«([^»]+)»/g, "$1");
              break;
            }
          }
        }

        const evaluatedLine = evaluateMathExpressions(displayLine);
        answerText.innerHTML = formatAnswerForDisplay(evaluatedLine);

        const answerActions = document.createElement("div");
        answerActions.className = "answer-item-actions";

        const copyBtn = document.createElement("button");
        copyBtn.className = "answer-item-btn copy-btn";
        copyBtn.innerHTML = `<i data-lucide="clipboard" style="width: 13px; height: 13px;"></i>`;
        copyBtn.title = `Copy: ${evaluatedAnswer}`;

        copyBtn.addEventListener("click", async () => {
          const originalText = copyBtn.textContent;
          try {
            await copyWithRetry(evaluatedAnswer);
            copyBtn.textContent = "✓";
            setTimeout(() => {
              copyBtn.textContent = originalText;
            }, 1500);
          } catch (e) {
            console.error("Deltahack: Copy failed:", e);
            copyBtn.textContent = "Failed";
            setTimeout(() => {
              copyBtn.textContent = originalText;
            }, 1500);
          }
        });

        answerActions.appendChild(copyBtn);
        answerItem.appendChild(answerText);
        answerItem.appendChild(answerActions);
        contentElement.appendChild(answerItem);
      });
    } else {
      if (copyButton) {
        copyButton.disabled = !state.rawAnswer;
        copyButton.style.display = state.rawAnswer ? "flex" : "none";
      }
      if (autoCopyToggle && state.rawAnswer) {
        autoCopyToggle.style.display = "flex";
      }
      contentElement.innerHTML = formattedAnswer;
    }

    if (scanBtn) {
      scanBtn.addEventListener("mousedown", (event) => event.stopPropagation());
      scanBtn.addEventListener("click", scanPage);
      if (!isError && !isReady) {
        scanBtn.innerHTML = `<i data-lucide="play"></i>`;
        scanBtn.disabled = false;
        loadLucideIfNeeded();
      }
    }

    if (settingsBtn) {
      settingsBtn.addEventListener("mousedown", (event) =>
        event.stopPropagation()
      );
      settingsBtn.addEventListener("click", showSettings);
    }

    if (autoCopyToggle) {
      autoCopyToggle.addEventListener("mousedown", (event) =>
        event.stopPropagation()
      );
      autoCopyToggle.addEventListener("click", () => {
        state.autoCopy = !state.autoCopy;
        localStorage.setItem("math_scanner_auto_copy", state.autoCopy);
        if (state.autoCopy) {
          autoCopyToggle.classList.add("active");
        } else {
          autoCopyToggle.classList.remove("active");
        }
        console.log("Deltahack: Auto-copy toggled:", state.autoCopy);
      });
    }

    if (copyButton) {
      copyButton.addEventListener("mousedown", (event) =>
        event.stopPropagation()
      );
      copyButton.addEventListener("click", async () => {
        if (!state.rawAnswer) return;
        try {
          await copyWithRetry(state.rawAnswer);
          const originalHTML = copyButton.innerHTML;
          copyButton.innerHTML = `<i data-lucide="check"></i>`;
          loadLucideIfNeeded();
          setTimeout(() => {
            copyButton.innerHTML = originalHTML;
            loadLucideIfNeeded();
          }, 2000);
        } catch (copyError) {
          console.error("Deltahack: Failed to copy answer:", copyError);
        }
      });
    }

    if (closeButton) {
      closeButton.addEventListener("mousedown", (event) =>
        event.stopPropagation()
      );
      closeButton.addEventListener("click", () => {
        resultDiv.remove();
        state.resultIframe = null;
      });
    }

    if (
      !isError &&
      !isLoading &&
      !isReady &&
      state.autoCopy &&
      state.rawAnswer
    ) {
      copyWithRetry(state.rawAnswer)
        .then(() => {
          console.log("Deltahack: Auto-copied answer:", state.rawAnswer);
          if (copyButton) {
            const originalHTML = copyButton.innerHTML;
            copyButton.innerHTML = `<i data-lucide="check"></i>`;
            loadLucideIfNeeded();
            setTimeout(() => {
              copyButton.innerHTML = originalHTML;
              loadLucideIfNeeded();
            }, 2000);
          }
        })
        .catch((error) => {
          console.error("Deltahack: Auto-copy failed after retries:", error);
        });
    }

    document.body.appendChild(resultDiv);
    state.resultIframe = resultDiv;
    makeDraggable(resultDiv, resultDiv.querySelector(".result-header"));
    loadLucideIfNeeded();
  }

  createUI();
})();

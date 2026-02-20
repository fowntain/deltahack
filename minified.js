// Licensed under GNU General Public License v3.0
// Created by fowntain

!function(){if(document.getElementById("result-iframe")){alert("Deltahack is already running!");return}console.log("Deltahack: Initializing...");let e={GEMINI_API_KEY:"",GEMINI_API_URL:"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"},t=[512,1024,2048,4096,6144,8192];function a(){if(window.lucide)window.lucide.createIcons();else{let e=document.createElement("script");e.src="https://unpkg.com/lucide@latest",e.onload=()=>{window.lucide&&window.lucide.createIcons()},document.head.appendChild(e)}}let n={resultIframe:null,styleTag:null,rawAnswer:"",autoCopy:"true"===localStorage.getItem("math_scanner_auto_copy"),maxTokens:parseInt(localStorage.getItem("math_scanner_max_tokens"))||4096,showExplanations:"true"===localStorage.getItem("math_scanner_explanations"),hideKeybind:localStorage.getItem("math_scanner_hide_keybind")||"ctrl+e",scanKeybind:localStorage.getItem("math_scanner_scan_keybind")||"ctrl+r",proxyUrl:localStorage.getItem("math_scanner_proxy_url")||"",isHidden:!1};function r(e){return console.log("Deltahack: Evaluating math expressions..."),e.replace(/{{(.*?)}}/g,(e,t)=>{try{let a=t.replace(/\s+/g,""),n=a.replace(/Math\.sqrt/g,"").replace(/Math\.PI/g,"");if(/[^0-9\+\-\*\/\.\(\)\[\]\^,A-Za-z]/g.test(n))return console.warn("Deltahack: Blocked potentially unsafe math expression:",t),"[Invalid Expression]";let r=n.replace(/(\d+(?:\.\d+)?)[eE][\+\-]?\d+/g,"");if(/[A-Za-z]/.test(r))return console.info("Deltahack: Skipping evaluation for symbolic expression:",t),t.trim();a=(a=(a=(a=(a=(a=a.replace(/\^/g,"**")).replace(/(\d)(\()/g,"$1*$2")).replace(/\)(\d)/g,")*$2")).replace(/\)\(/g,")*(")).replace(/(\d)(Math\.sqrt)/g,"$1*$2")).replace(/(\d)(Math\.PI)/g,"$1*$2");let o=Function("return "+a)();if("number"==typeof o&&o%1!=0){let i=o.toString();if(i.includes(".")&&i.split(".")[1].length>4){let s=parseFloat(o.toFixed(4));return console.log(`Deltahack: Evaluated: ${t.trim()} = ${o} (rounded to ${s})`),s.toString()}}return console.log(`Deltahack: Evaluated: ${t.trim()} = ${o}`),o.toString()}catch(l){return console.error("Deltahack: Error evaluating math expression:",t,l),`[Calculation Error: ${t}]`}})}function o(e){var t;let a=e.replace(/«([^»]+)»/g,"$1");return(a=(a=(a=(a=(a=(a=(a=(a=(a=a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")).replace(/`([^`]+)`/g,"<code>$1</code>")).replace(/\^\{([^}]+)\}/g,"<sup>$1</sup>")).replace(/([A-Za-z0-9\)\]])\^(-?\d+(?:\.\d+)?)/g,"$1<sup>$2</sup>")).replace(/Math\.sqrt/g,"&radic;")).replace(/Math\.PI/g,"&pi;")).replace(/ \* /g," &times; ")).replace(/\n/g,"<br>")).replace(/ {2,}/g,e=>"&nbsp;".repeat(e.length))}async function i(e,t,a){t=t||3,a=a||100;for(var n=1;n<=t;n++)try{if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(e);else{var r=document.createElement("textarea");r.value=e,r.style.cssText="position:fixed;opacity:0",document.body.appendChild(r),r.focus(),r.select();var o=document.execCommand("copy");if(document.body.removeChild(r),!o)throw Error("execCommand copy failed")}return!0}catch(i){if(n<t)await new Promise(function(e){setTimeout(e,a)});else throw i}}function s(e,t=15e3){return new Promise((a,n)=>{let r="sbx_"+Math.random().toString(36).substr(2,12),o,i,s=()=>{clearTimeout(o),window.removeEventListener("message",l),i&&i.parentNode&&i.remove()},l=t=>{if(t.data&&t.data.sbxId===r){if(t.data.ready){i.contentWindow.postMessage({sbxId:r,code:e},"*");return}s(),t.data.error?n(Error(t.data.error)):a(t.data.result)}};window.addEventListener("message",l),(i=document.createElement("iframe")).sandbox="allow-scripts",i.style.cssText="position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none;z-index:-1",i.srcdoc=["<script>","window.addEventListener('message', function(e) {","  if (!e.data || e.data.sbxId !== '"+r+"') return;","  try {","    var __fn = new Function(e.data.code);","    var __r = __fn();","    parent.postMessage({sbxId: '"+r+"', result: __r == null ? 'undefined' : String(__r)}, '*');","  } catch(err) {","    parent.postMessage({sbxId: '"+r+"', error: err.message}, '*');","  }","});","parent.postMessage({sbxId: '"+r+"', ready: true}, '*');","</script>",].join("\n"),document.body.appendChild(i),o=setTimeout(()=>{s(),n(Error("Code execution timed out ("+t+"ms)"))},t)})}function l(e){let t=e;for(let[a,n]of(t=(t=(t=t.replace(/^\s*(import\s+math|from\s+math\s+import\s+[^;\n]*)\s*$/gm,"")).replace(/^\s*import\s+\w+.*$/gm,"")).replace(/^\s*from\s+\w+\s+import\s+.*$/gm,""),Object.entries({"math.sqrt":"Math.sqrt","math.pi":"Math.PI","math.e":"Math.E","math.sin":"Math.sin","math.cos":"Math.cos","math.tan":"Math.tan","math.asin":"Math.asin","math.acos":"Math.acos","math.atan":"Math.atan","math.atan2":"Math.atan2","math.log10":"Math.log10","math.log2":"Math.log2","math.log":"Math.log","math.floor":"Math.floor","math.ceil":"Math.ceil","math.pow":"Math.pow","math.fabs":"Math.abs","math.inf":"Infinity"})))t=t.split(a).join(n);t=(t=(t=(t=(t=(t=(t=(t=(t=(t=(t=t.replace(/\babs\(/g,"Math.abs(")).replace(/\bround\(([^,)]+),\s*(\d+)\)/g,"parseFloat(($1).toFixed($2))")).replace(/\bround\(([^)]+)\)/g,"Math.round($1)")).replace(/\bint\(/g,"Math.trunc(")).replace(/\bfloat\(/g,"Number(")).replace(/\bstr\(/g,"String(")).replace(/\bTrue\b/g,"true")).replace(/\bFalse\b/g,"false")).replace(/\bNone\b/g,"null")).replace(/(\w[\w.]*)\s*\/\/\s*(\w[\w.]*)/g,"Math.floor($1 / $2)")).replace(/(^|\s)#(.*)$/gm,"$1//$2");if(/\bprint\s*\(/.test(t))t="var __out = [];\n"+t.replace(/\bprint\s*\(([^)]*)\)/g,"__out.push(String($1))")+'\nreturn __out.join("\\n");';else if(!/\breturn\b/.test(t)){let r=t.split("\n").filter(e=>e.trim());if(r.length>0){let o=r[r.length-1].trim();o.startsWith("var ")||o.startsWith("let ")||o.startsWith("//")||o.startsWith("}")||""===o||(r[r.length-1]="return "+o)}t=r.join("\n")}return t}async function d(e){let t=/\[EXEC_JS\]([\s\S]*?)\[\/EXEC_JS\]/g,a=/\[EXEC_PY\]([\s\S]*?)\[\/EXEC_PY\]/g,n=e,r=[],o;for(;null!==(o=t.exec(e));)r.push({full:o[0],code:o[1].trim(),lang:"js",index:o.index});for(;null!==(o=a.exec(e));)r.push({full:o[0],code:o[1].trim(),lang:"py",index:o.index});if(0===r.length)return console.warn("Deltahack: ⚠ No [EXEC_JS] or [EXEC_PY] code blocks found in AI response. AI did not use code execution."),e;console.log(`Deltahack: ✓ Found ${r.length} code block(s) to execute.`);for(let i=0;i<r.length;i++){let d=r[i];try{let c=d.code;"py"===d.lang&&(console.log(`Deltahack: [Block ${i+1}/${r.length}] Transpiling Python → JS...`),c=l(c),console.log(`Deltahack: [Block ${i+1}] Transpiled code:`,c)),console.log(`Deltahack: [Block ${i+1}/${r.length}] Executing ${d.lang} in sandbox:
`,d.code);let p=await s(c);console.log(`Deltahack: [Block ${i+1}/${r.length}] ✓ Result: ${p}`),n=n.replace(d.full,p)}catch(u){console.error(`Deltahack: [Block ${i+1}/${r.length}] ✗ Execution failed:`,u),n=n.replace(d.full,`[Code Error: ${u.message}]`)}}return n}function c(e,t){let a=0,n=0,r=0,o=0;function i(t){t.preventDefault(),a=r-t.clientX,n=o-t.clientY,r=t.clientX,o=t.clientY,e.style.top=e.offsetTop-n+"px",e.style.left=e.offsetLeft-a+"px",e.style.right="auto",e.style.bottom="auto"}function s(){document.onmouseup=null,document.onmousemove=null}t.onmousedown=function e(t){t.preventDefault(),r=t.clientX,o=t.clientY,document.onmouseup=s,document.onmousemove=i}}function p(){console.log("Deltahack: Opening settings...");let r=null;n.resultIframe&&(r={top:n.resultIframe.style.top,left:n.resultIframe.style.left,right:n.resultIframe.style.right,bottom:n.resultIframe.style.bottom},n.resultIframe.remove(),n.resultIframe=null);let o=document.createElement("div");o.id="result-iframe",r&&(r.top&&(o.style.top=r.top),r.left&&(o.style.left=r.left),r.right&&(o.style.right=r.right),r.bottom&&(o.style.bottom=r.bottom));let i=t.findIndex(e=>e>=n.maxTokens),s=i>=0?i:t.length-1;o.innerHTML=`
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
              <input type="password" id="settings-api-key" placeholder="Enter API key" value="${e.GEMINI_API_KEY}">
            </div>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-label">
            <div class="setting-label-title">Max Tokens</div>
            <div class="setting-label-desc">Maximum response length. Higher values allow for harder problems but you will hit your quota faster.</div>
          </div>
          <div class="token-slider-container">
            <div class="token-slider-value" id="token-value">${t[s]}</div>
            <input type="range" class="token-slider" id="settings-max-tokens" min="0" max="${t.length-1}" step="1" value="${s}">
            <div class="token-slider-labels">
              ${t.map(e=>`<span>${e}</span>`).join("")}
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
              <div class="setting-toggle ${n.showExplanations?"active":""}" id="settings-explanations">
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
              <input type="text" id="settings-keybind" placeholder="ctrl+e" value="${n.hideKeybind}">
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
              <input type="text" id="settings-scan-keybind" placeholder="ctrl+r" value="${n.scanKeybind}">
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
              <input type="text" id="settings-proxy-url" placeholder="https://your-proxy.workers.dev" value="${n.proxyUrl}">
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
      </div>`;let l=o.querySelector(".close-result-btn"),d=o.querySelector("#discord-link"),p=o.querySelector("#settings-explanations"),u=o.querySelector("#save-settings"),g=o.querySelector("#back-settings"),b=o.querySelector("#settings-max-tokens"),h=o.querySelector("#token-value"),f=o.querySelector("#settings-keybind"),y=o.querySelector("#settings-scan-keybind"),x=o.querySelector("#settings-proxy-url"),v={apiKey:e.GEMINI_API_KEY,maxTokens:n.maxTokens,showExplanations:n.showExplanations,hideKeybind:n.hideKeybind,scanKeybind:n.scanKeybind,proxyUrl:n.proxyUrl};d&&d.addEventListener("click",e=>{e.preventDefault(),window.open("https://discord.gg/unblocking","_blank")}),l.addEventListener("click",()=>{o.remove(),n.resultIframe=null}),b&&h&&b.addEventListener("input",e=>{let a=parseInt(e.target.value);h.textContent=t[a]}),p&&p.addEventListener("click",()=>{p.classList.toggle("active")}),u.addEventListener("click",()=>{let a=o.querySelector("#settings-api-key").value.trim(),r=parseInt(o.querySelector("#settings-max-tokens").value),i=t[r],s=p.classList.contains("active"),l=f.value.trim();a&&(e.GEMINI_API_KEY=a,localStorage.setItem("gemini_api_key",a)),n.maxTokens=i,localStorage.setItem("math_scanner_max_tokens",i.toString()),n.showExplanations=s,localStorage.setItem("math_scanner_explanations",s.toString()),l&&(n.hideKeybind=l,localStorage.setItem("math_scanner_hide_keybind",l));let d=y.value.trim();d&&(n.scanKeybind=d,localStorage.setItem("math_scanner_scan_keybind",d)),n.proxyUrl=x.value.trim(),localStorage.setItem("math_scanner_proxy_url",n.proxyUrl),console.log("Deltahack: Settings saved."),m("Ready to scan",!1,!0,!0)}),g&&g.addEventListener("click",()=>{(!function e(){let a=o.querySelector("#settings-api-key").value.trim(),n=parseInt(o.querySelector("#settings-max-tokens").value),r=t[n],i=p.classList.contains("active"),s=f.value.trim(),l=y.value.trim(),d=x.value.trim();return a!==v.apiKey||r!==v.maxTokens||i!==v.showExplanations||s!==v.hideKeybind||l!==v.scanKeybind||d!==v.proxyUrl}()||confirm("You have unsaved changes. Are you sure you want to go back?"))&&m("Ready to scan",!1,!0,!0)}),document.body.appendChild(o),n.resultIframe=o,c(o,o.querySelector(".result-header")),a()}async function u(){console.log("Deltahack: 'Scan Page' clicked.");let e=document.querySelector(".scan-btn");e&&(e.disabled=!0,e.innerHTML='<i data-lucide="loader-2"></i>',a());try{let t="",n=document.querySelector("iframe.tool_launch");if(n&&n.contentDocument&&n.contentDocument.body?(console.log("Deltahack: Found tool iframe. Reading text from iframe body."),t=n.contentDocument.body.innerText):(console.log("Deltahack: No tool iframe found. Falling back to main document body text."),t=document.body.innerText),!t||""===t.trim())throw Error("Could not get any visible text from the page.");console.log(`Deltahack: Page text captured (${t.length} chars). Sending to AI.`),await g(t)}catch(r){console.error("Deltahack: Scan error:",r),m("Error: "+r.message,!0)}}async function g(t){if(!e.GEMINI_API_KEY){m("Error: API key not set",!0);return}console.log("Deltahack: Calling sendToGemini..."),m("Loading...",!1);try{console.log("Deltahack: Sending fetch request to Gemini...");let a=n.proxyUrl||e.GEMINI_API_URL,r=await fetch(`${a}?key=${e.GEMINI_API_KEY}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:n.showExplanations?"Solve the math problem from this DeltaMath page. Text may be fragmented (e.g., 'f(x)=9(1.05)\\n-\\nx' means 'f(x)=9(1.05)^-x'). Answer ALL parts.\n\nCRITICAL RULE — MANDATORY CODE EXECUTION:\n- You MUST perform ALL numerical calculations using [EXEC_JS]...[/EXEC_JS] blocks. NEVER compute numbers yourself — your arithmetic is unreliable.\n- Do NOT write your own calculated number anywhere. The code block output IS the number. Do NOT duplicate or guess the result.\n- Do NOT write comments in code blocks. No // or /* comments. Just raw code to save tokens.\n- JS code MUST use 'return' for the final value.\n\nExample:\n\xab[EXEC_JS]\nvar a = 5000 * Math.pow(1.05, 12);\nreturn Math.round(a * 100) / 100;\n[/EXEC_JS]\xbb\n\nWrap each final answer in guillemets \xab\xbb. Place the [EXEC_JS] block INSIDE the \xab\xbb so its output becomes the answer. For non-numeric answers just write them directly: \xaball real numbers\xbb\n\nFor multiple parts, label each:\nDomain: \xab[13, 18]\xbb\nRange: \xab(-∞, 8]\xbb\n\nCommon non-numeric answers: 'does NOT make sense', 'does make sense', 'all real numbers', 'non-negative real numbers'.\n\nProvide concise step-by-step explanations for your reasoning (but never manually compute a number — always use a code block). If it is a graphing problem, provide key points/equations and explain how to plot them. If you cannot answer, say 'Cannot solve this problem.'":"Solve the math problem from this DeltaMath page. Text may be fragmented (e.g., 'f(x)=9(1.05)\\n-\\nx' means 'f(x)=9(1.05)^-x'). Answer ALL parts.\n\nCRITICAL RULE — MANDATORY CODE EXECUTION:\n- You MUST perform ALL numerical calculations using [EXEC_JS]...[/EXEC_JS] blocks. NEVER compute numbers yourself — your arithmetic is unreliable.\n- Do NOT write your own calculated number anywhere. The code block output IS the number. Do NOT duplicate or guess the result.\n- Do NOT write comments in code blocks. No // or /* comments. Just raw code to save tokens.\n- JS code MUST use 'return' for the final value.\n\nExample:\n\xab[EXEC_JS]\nvar a = 5000 * Math.pow(1.05, 12);\nreturn Math.round(a * 100) / 100;\n[/EXEC_JS]\xbb\n\nWrap each final answer in guillemets \xab\xbb. Place the [EXEC_JS] block INSIDE the \xab\xbb so its output becomes the answer. For non-numeric answers just write them directly: \xaball real numbers\xbb\n\nFor multiple parts, label each:\nDomain: \xab[13, 18]\xbb\nRange: \xab(-∞, 8]\xbb\n\nCommon non-numeric answers: 'does NOT make sense', 'does make sense', 'all real numbers', 'non-negative real numbers'.\n\nDo NOT include any explanations, steps, or reasoning. Output ONLY the labeled answers with \xab\xbb markers. No extra text. If it is a graphing problem, provide only the key points or equations needed. If you cannot answer, say 'Cannot solve this problem.'"},{text:t},]},],generationConfig:{temperature:.2,topK:32,topP:1,maxOutputTokens:n.maxTokens}})});if(console.log("Deltahack: Fetch response received:",r.status,r.statusText),!r.ok){let o=await r.text();console.error("Deltahack: API request failed:",o);let i;try{i=JSON.parse(o)}catch(s){throw Error(`API request failed with status ${r.status}. Response: ${o}`)}throw Error(i.error?.message||`API request failed with status ${r.status}`)}let l=await r.json();if(console.log("Deltahack: API data parsed:",l),l.candidates?.[0]?.finishReason==="SAFETY")throw console.warn("Deltahack: Response blocked for safety reasons."),Error("Response was blocked for safety reasons. The page text might be too large or complex.");if(!l.candidates||!l.candidates[0]||!l.candidates[0].content||!l.candidates[0].content.parts||!l.candidates[0].content.parts[0]||!l.candidates[0].content.parts[0].text){console.error("Deltahack: Invalid response structure:",l);let c=l.candidates?.[0]?.finishReason;if(c&&"STOP"!==c)throw Error(`Response blocked: ${c}. Try scanning again.`);throw Error("No answer received (invalid response structure).")}let p=l.candidates[0].content.parts[0].text;console.log("Deltahack: Answer received:",p);try{p=await d(p)}catch(u){console.error("Deltahack: Code block processing error:",u)}m(p,!1,!1,!0)}catch(g){console.error("Deltahack: Gemini API error:",g),m("Error: "+g.message,!0)}}function m(e,t=!1,s=!1,l=!1){console.log("Deltahack: Showing result. Is Error:",t);let d=null;n.resultIframe&&(d={top:n.resultIframe.style.top,left:n.resultIframe.style.left,right:n.resultIframe.style.right,bottom:n.resultIframe.style.bottom},n.resultIframe.remove(),n.resultIframe=null);let g;g=t?e:"Loading..."===e?"Loading...":r(e);let m=document.createElement("div");m.id="result-iframe",l&&m.classList.add("animate-in"),d&&(d.top&&(m.style.top=d.top),d.left&&(m.style.left=d.left),d.right&&(m.style.right=d.right),d.bottom&&(m.style.bottom=d.bottom)),n.isHidden=!1,n.rawAnswer="";let b="Loading..."===e,h="",f=[];if(!t&&!b){let y=function e(t){if(!t)return"";let a=[],n=/«([^»]+)»/g,r;for(;null!==(r=n.exec(t));){let o=(r[1]||"").trim();o&&a.push(o)}return a.join("\n")}(e);n.rawAnswer=r(y),f.push(...n.rawAnswer.split("\n").filter(e=>e.trim())),h=o(g)}let x=f.length>1,v=`
      <button class="scan-btn" title="Scan page for math problems">
        <i data-lucide="play"></i>
      </button>
      <button class="copy-answer-btn" title="Copy answer to clipboard">
        <i data-lucide="clipboard"></i>
      </button>
      <button class="auto-copy-toggle ${n.autoCopy?"active":""}" title="Toggle auto-copy">
        <span>Auto</span>
      </button>
      <button class="settings-btn" title="Settings">
        <i data-lucide="settings"></i>
      </button>
      <button class="close-result-btn" title="Close">\xd7</button>
    `;m.innerHTML=`
      <div class="result-header">
        <span>Deltahack v0.1</span>
        <div class="result-actions">
          ${v}
        </div>
      </div>
      <div class="result-content ${t?"error":b?"loading":""}"></div>
      <div class="result-footer">
        <span>DogeUB - <a id="discord-link">discord.gg/unblocking</a>  |  Ctrl+E to quick hide</span>
      </div>`;let k=m.querySelector(".result-content"),$=m.querySelector("#discord-link");$&&$.addEventListener("click",e=>{e.preventDefault(),window.open("https://discord.gg/unblocking","_blank")});let _=m.querySelector(".scan-btn"),w=m.querySelector(".copy-answer-btn"),I=m.querySelector(".auto-copy-toggle"),E=m.querySelector(".settings-btn"),S=m.querySelector(".close-result-btn");(t||b||s)&&(w&&(w.style.display="none"),I&&(I.style.display="none")),x&&w&&(w.style.display="none"),t?(_&&(_.disabled=!1,_.innerHTML='<i data-lucide="play"></i>',a()),k.innerText=g):b?(_&&(_.disabled=!0,_.innerHTML='<i data-lucide="loader-2"></i>',a()),k.innerText="Loading..."):s?k.innerHTML='<div style="text-align:center;padding:20px;color:#8a8d96; font-size:14px;">Deltahack ready for scan</div>':x?(k.innerHTML="",f.forEach((t,a)=>{let n=document.createElement("div");n.className="answer-item";let s=document.createElement("div");s.className="answer-text";let l=e.split("\n"),d=t;for(let c of l){let p=c.match(/«([^»]+)»/);if(p){let u=p[1].trim(),g=r(u);if(g===t){d=c.replace(/«([^»]+)»/g,"$1");break}}}let m=r(d);s.innerHTML=o(m);let b=document.createElement("div");b.className="answer-item-actions";let h=document.createElement("button");h.className="answer-item-btn copy-btn",h.innerHTML='<i data-lucide="clipboard" style="width: 13px; height: 13px;"></i>',h.title=`Copy: ${t}`,h.addEventListener("click",async()=>{let e=h.textContent;try{await i(t),h.textContent="✓",setTimeout(()=>{h.textContent=e},1500)}catch(a){console.error("Deltahack: Copy failed:",a),h.textContent="Failed",setTimeout(()=>{h.textContent=e},1500)}}),b.appendChild(h),n.appendChild(s),n.appendChild(b),k.appendChild(n)})):(w&&(w.disabled=!n.rawAnswer,w.style.display=n.rawAnswer?"flex":"none"),I&&n.rawAnswer&&(I.style.display="flex"),k.innerHTML=h),!_||(_.addEventListener("mousedown",e=>e.stopPropagation()),_.addEventListener("click",u),t||s||(_.innerHTML='<i data-lucide="play"></i>',_.disabled=!1,a())),E&&(E.addEventListener("mousedown",e=>e.stopPropagation()),E.addEventListener("click",p)),I&&(I.addEventListener("mousedown",e=>e.stopPropagation()),I.addEventListener("click",()=>{n.autoCopy=!n.autoCopy,localStorage.setItem("math_scanner_auto_copy",n.autoCopy),n.autoCopy?I.classList.add("active"):I.classList.remove("active"),console.log("Deltahack: Auto-copy toggled:",n.autoCopy)})),w&&(w.addEventListener("mousedown",e=>e.stopPropagation()),w.addEventListener("click",async()=>{if(n.rawAnswer)try{await i(n.rawAnswer);let e=w.innerHTML;w.innerHTML='<i data-lucide="check"></i>',a(),setTimeout(()=>{w.innerHTML=e,a()},2e3)}catch(t){console.error("Deltahack: Failed to copy answer:",t)}})),S&&(S.addEventListener("mousedown",e=>e.stopPropagation()),S.addEventListener("click",()=>{m.remove(),n.resultIframe=null})),t||b||s||!n.autoCopy||!n.rawAnswer||i(n.rawAnswer).then(()=>{if(console.log("Deltahack: Auto-copied answer:",n.rawAnswer),w){let e=w.innerHTML;w.innerHTML='<i data-lucide="check"></i>',a(),setTimeout(()=>{w.innerHTML=e,a()},2e3)}}).catch(e=>{console.error("Deltahack: Auto-copy failed after retries:",e)}),document.body.appendChild(m),n.resultIframe=m,c(m,m.querySelector(".result-header")),a()}!function t(){console.log("Deltahack: Creating UI..."),n.resultIframe&&(n.resultIframe.remove(),n.resultIframe=null);let r=document.createElement("style");r.id="math-scanner-style",r.textContent=`
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
      .save-settings-btn-row svg{width:16px;height:16px}`,document.head.appendChild(r),n.styleTag=r;let o=localStorage.getItem("gemini_api_key");function i(e,t){let a=t.toLowerCase().split("+"),n=a[a.length-1],r=a.includes("ctrl"),o=a.includes("alt"),i=a.includes("shift");return e.key.toLowerCase()===n&&(r?e.ctrlKey:!e.ctrlKey)&&(o?e.altKey:!e.altKey)&&(i?e.shiftKey:!e.shiftKey)}o?(e.GEMINI_API_KEY=o,console.log("Deltahack: Loaded API key from localStorage."),m("Ready to scan",!1,!0)):(console.log("Deltahack: No API key found. Showing setup."),function t(){n.resultIframe&&n.resultIframe.remove();let r=document.createElement("div");r.id="result-iframe",r.style.top="20px",r.style.right="20px",r.innerHTML=`
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
      </div>`;let o=r.querySelector(".close-result-btn"),i=r.querySelector("#discord-link");i&&i.addEventListener("click",e=>{e.preventDefault(),window.open("https://discord.gg/unblocking","_blank")}),o.addEventListener("click",()=>{r.remove(),n.resultIframe=null,n.styleTag&&n.styleTag.remove()});let s=r.querySelector("#save-api-key");s.addEventListener("click",()=>{let t=r.querySelector("#gemini-api-key").value.trim();t?(e.GEMINI_API_KEY=t,localStorage.setItem("gemini_api_key",t),console.log("Deltahack: API key saved."),m("Ready to scan",!1,!0)):alert("Please enter a valid API key")}),document.body.appendChild(r),n.resultIframe=r,c(r,r.querySelector(".result-header")),a()}()),document.addEventListener("keydown",e=>{if(n.resultIframe){if(i(e,n.hideKeybind)){e.preventDefault(),e.stopPropagation(),n.resultIframe&&(n.isHidden=!n.isHidden,n.resultIframe.style.display=n.isHidden?"none":"block",console.log("Deltahack: Iframe visibility toggled:",!n.isHidden));return}if(i(e,n.scanKeybind)){e.preventDefault(),e.stopPropagation();let t=document.querySelector(".scan-btn");t&&!t.disabled&&u();return}}})}()}();

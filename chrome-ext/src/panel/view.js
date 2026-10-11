(function (g) {
  "use strict";

const C = g.DyCleanCore;
const W = g.DyCleanWorker;
const CSS = g.DyCleanStyles;
  const VERSION = "1.0.0";
  const MAX_ROWS = 300;

  const ICON = {
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11.5V16"/></svg>',
    ok: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>',
    warn: '<svg viewBox="0 0 24 24"><path d="M12 3 2 20h20L12 3z"/><path d="M12 9.5v4.5M12 17h.01"/></svg>',
    error: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
    fold: '<svg viewBox="0 0 24 24"><path d="M8 5v14M17 8l-4 4 4 4"/></svg>',
    halt: '<svg viewBox="0 0 24 24"><rect x="6.5" y="6.5" width="11" height="11" rx="2.5"/></svg>',
    mark: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h10M4 17h13"/></svg>',
    alert: '<svg viewBox="0 0 24 24"><path d="M12 3 2 20h20L12 3z"/><path d="M12 9.5v4.5M12 17h.01"/></svg>',
  };

  const TEMPLATE = `
    <svg width="0" height="0" aria-hidden="true" style="position:absolute">
      <defs>
        <linearGradient id="dyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#8b5cf6"/>
          <stop offset="100%" stop-color="#d946ef"/>
        </linearGradient>
      </defs>
    </svg>

    <button class="bubble" id="bubble" title="展开面板" aria-label="展开 dy-clean 面板">
      <svg viewBox="0 0 58 58" aria-hidden="true">
        <circle class="ring-bg" cx="29" cy="29" r="26"/>
        <circle class="ring-fg" cx="29" cy="29" r="26"/>
      </svg>
      <span class="n" id="b-num">0<span class="u">条</span></span>
    </button>

    <div class="shell">
      <div class="bar">
        <span class="mark">${ICON.mark}</span>
        <span class="name">dy-clean<em>v${VERSION}</em></span>
        <span class="spacer"></span>
        <span class="pill" id="pill"><i></i><span id="pill-t">空闲</span></span>
        <button class="icon-btn" id="collapse" title="收起为悬浮球" aria-label="收起面板">${ICON.fold}</button>
      </div>

      <div class="main">
        <div class="left">
          <div class="cap">清理目标</div>
          <div class="opts">
            <input type="checkbox" id="likes" checked>
            <label for="likes">
              <span class="box"></span>
              <span class="tx"><span class="nm">喜欢</span><span class="sub">取消喜欢 / 点赞</span></span>
            </label>
            <input type="checkbox" id="favs" checked>
            <label for="favs">
              <span class="box"></span>
              <span class="tx"><span class="nm">收藏</span><span class="sub">取消收藏</span></span>
            </label>
          </div>

          <div class="note">${ICON.alert}<span>取消后<b>无法恢复</b>，会真实提交到抖音。</span></div>

          <div class="count">
            <span class="v" id="s-done">0</span>
            <span class="k">已处理</span>
          </div>
          <div class="mini">
            <div><span class="v" id="s-round">0</span><span class="k">轮次</span></div>
            <div><span class="v" id="s-left">—</span><span class="k">本页剩余</span></div>
          </div>

          <div class="cta">
            <button class="btn btn-go" id="go">开始清理</button>
            <button class="btn btn-halt" id="stop" disabled>${ICON.halt}<span>停止</span></button>
          </div>
        </div>

        <div class="right">
          <div class="prog">
            <div class="prog-top">
              <span class="lb" id="p-label">准备中…</span>
              <span class="pc" id="p-pct"></span>
            </div>
            <div class="bar" id="p-bar"><i></i></div>
          </div>

          <div class="log-top"><span>运行日志</span><span class="spacer"></span><button id="clear">清空</button></div>
          <div class="log" id="log" role="log" aria-live="polite"></div>
        </div>
      </div>
    </div>`;

  function mount() {
    if (document.getElementById("__dyCleanTM") || !document.body) return;

    const host = document.createElement("div");
    host.id = "__dyCleanTM";
    host.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:2147483647";
    const sh = host.attachShadow({ mode: "open" });
    document.body.appendChild(host);

    const style = document.createElement("style");
    style.textContent = CSS;
    sh.appendChild(style);

    const app = document.createElement("div");
    app.className = "app";
    app.innerHTML = TEMPLATE;
    sh.appendChild(app);

    const $ = (id) => sh.getElementById(id);
    const logBox = $("log");
    const stats = { done: 0, round: 0 };
    const ctl = { stopped: false };
    let armed = false;
    let timer = null;

    function log(msg, type) {
      const level = type === "ok" || type === "warn" || type === "error" ? type : "info";
      const row = document.createElement("div");
      row.className = "row " + level;

      const ic = document.createElement("span");
      ic.className = "ic";
      ic.innerHTML = ICON[level];

      const tx = document.createElement("span");
      tx.className = "tx";
      const ts = document.createElement("span");
      ts.className = "ts";
      ts.textContent = new Date().toLocaleTimeString("zh-CN", { hour12: false });
      tx.append(ts, document.createTextNode(msg));

      row.append(ic, tx);
      logBox.appendChild(row);
      while (logBox.childElementCount > MAX_ROWS) logBox.removeChild(logBox.firstElementChild);
      logBox.scrollTop = logBox.scrollHeight;
    }

    function setPhase(label) {
      $("p-label").textContent = label;
    }

    function setPill(text) {
      $("pill-t").textContent = text;
    }

    function setProgress(done, total) {
      const bar = $("p-bar");
      const pc = $("p-pct");
      if (!total || total <= 0) {
        bar.classList.add("indet");
        pc.textContent = "";
        bar.firstElementChild.style.width = "";
        return;
      }
      bar.classList.remove("indet");
      const r = Math.max(0, Math.min(1, done / total));
      bar.firstElementChild.style.width = (r * 100).toFixed(1) + "%";
      pc.textContent = Math.round(r * 100) + "%";
    }

    function clearProgress() {
      const bar = $("p-bar");
      bar.classList.remove("indet");
      bar.firstElementChild.style.width = "0";
      $("p-pct").textContent = "";
    }

    function render() {
      $("s-done").textContent = stats.done;
      $("s-round").textContent = stats.round;
      const left = C.selectedCount();
      $("s-left").textContent = left == null ? "—" : left;
      $("b-num").innerHTML = stats.done + '<span class="u">条</span>';
    }

    function setBusy(on) {
      app.classList.toggle("busy", on);
      if (on) app.classList.remove("done");
      $("go").disabled = on;
      $("stop").disabled = !on;
      $("likes").disabled = on;
      $("favs").disabled = on;
      $("bubble").style.setProperty("--p", on ? "0.35" : "0");
    }

    function setCollapsed(on) {
      app.classList.toggle("collapsed", on);
      $("collapse").title = on ? "展开" : "收起为悬浮球";
    }

    function disarm() {
      armed = false;
      if (timer) clearTimeout(timer);
      timer = null;
      const go = $("go");
      go.classList.remove("armed");
      go.textContent = "开始清理";
    }

    $("collapse").addEventListener("click", () => setCollapsed(true));
    $("bubble").addEventListener("click", () => setCollapsed(false));
    $("clear").addEventListener("click", () => (logBox.innerHTML = ""));

    $("stop").addEventListener("click", () => {
      ctl.stopped = true;
      setPhase("正在停止…");
      setPill("停止中");
      log("正在停止…", "warn");
    });

    $("go").addEventListener("click", () => {
      const targets = ["likes", "favs"].filter((k) => $(k).checked);
      if (!targets.length) {
        log("请至少勾选一个清理目标", "warn");
        return;
      }
      if (!armed) {
        armed = true;
        const go = $("go");
        go.classList.add("armed");
        go.textContent = "再点一次，真的取消";
        log("再次点击「" + go.textContent + "」以开始（不可恢复）", "warn");
        timer = setTimeout(disarm, 6000);
        return;
      }
      disarm();
      run(targets);
    });

    sh.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && app.classList.contains("collapsed")) setCollapsed(false);
    });

    async function run(targets) {
      ctl.stopped = false;
      setBusy(true);
      app.classList.remove("flash");
      setPill("运行中");
      log("开始清理: " + targets.map((k) => W.KINDS[k].tab).join(" + "));
      setPhase("准备中…");
      setProgress(0, 0);

      for (const kind of targets) {
        setPhase("正在清理「" + W.KINDS[kind].tab + "」");
        const r = await W.runUntilDone(kind, log, ctl);
        stats.done += r.processed || 0;
        stats.round += r.rounds || 0;
        render();
        if (ctl.stopped) {
          log("已手动停止", "warn");
          setPhase("已停止");
          break;
        }
        if (r.empty) {
          log(W.KINDS[kind].tab + " 已清空，共约 " + (r.processed || 0) + " 条", "ok");
          setPhase(W.KINDS[kind].tab + " 已清空");
        } else if (r.error) {
          log(W.KINDS[kind].tab + " 出错退出: " + r.error, "error");
          setPhase(W.KINDS[kind].tab + " 出错退出");
        } else if (r.stopped) {
          log(W.KINDS[kind].tab + " 停止: " + r.stopped, "warn");
          setPhase(W.KINDS[kind].tab + " 已停止");
        }
        clearProgress();
        await C.sleep(1000);
      }

      setBusy(false);
      app.classList.add("done");
      setPill(ctl.stopped ? "已停止" : "已完成");
      log("完成，本轮共处理约 " + stats.done + " 条", "ok");
      if (app.classList.contains("collapsed")) {
        app.classList.add("flash");
        setTimeout(() => app.classList.remove("flash"), 1900);
      }
    }

    log("面板就绪 —— 会真实取消喜欢 / 收藏，不可恢复", "warn");
    render();
    setInterval(() => {
      if (sh.host.isConnected) render();
    }, 1000);
  }

  g.DyCleanPanel = { mount, VERSION };
})(typeof window !== "undefined" ? window : globalThis);

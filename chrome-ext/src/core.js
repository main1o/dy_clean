(function (g) {
  "use strict";

  const textOf = (el) => ((el && (el.innerText || el.textContent)) || "").replace(/\s+/g, " ").trim();

  function visible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden" && s.opacity !== "0";
  }

  const NODE_SEL = "button,div,span,a,li,[role=button],[role=tab]";

  function nodes() {
    return Array.from(document.querySelectorAll(NODE_SEL)).filter(visible);
  }

  function find(text) {
    const hits = nodes().filter((el) => textOf(el) === text);
    hits.sort((a, b) => textOf(a).length - textOf(b).length);
    return hits[0] || null;
  }

  function findAll(text) {
    return nodes().filter((el) => textOf(el) === text);
  }

  function findTab(name) {
    const tabs = Array.from(document.querySelectorAll('[role="tab"], .semi-tabs-tab'));
    for (const el of tabs) {
      if (visible(el) && textOf(el).indexOf(name) === 0) return el;
    }
    for (const el of nodes()) {
      const t = textOf(el);
      if (t && t.length <= name.length + 6 && t.indexOf(name) === 0) return el;
    }
    return null;
  }

  function click(el) {
    if (!el) return false;
    try {
      el.scrollIntoView({ block: "center", inline: "nearest" });
    } catch (e) {}
    const r = el.getBoundingClientRect();
    const opts = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: r.left + r.width / 2,
      clientY: r.top + r.height / 2,
      button: 0,
    };
    el.dispatchEvent(new PointerEvent("pointerdown", opts));
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    el.dispatchEvent(new PointerEvent("pointerup", opts));
    el.dispatchEvent(new MouseEvent("mouseup", opts));
    el.dispatchEvent(new MouseEvent("click", opts));
    try {
      el.click();
    } catch (e) {}
    return true;
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function waitFor(fn, timeoutMs = 8000, stepMs = 200) {
    const end = Date.now() + timeoutMs;
    for (;;) {
      try {
        const v = fn();
        if (v) return v;
      } catch (e) {}
      if (Date.now() >= end) return null;
      await sleep(stepMs);
    }
  }

  function selectedCount() {
    for (const el of document.querySelectorAll("span,div")) {
      if (el.children.length) continue;
      const m = textOf(el).match(/^已选\s*(\d+)$/);
      if (m) return Number(m[1]);
    }
    return null;
  }

  function cardCount() {
    return Array.from(
      document.querySelectorAll('a[href*="/video/"], a[href*="/note/"], a[href*="/shipin/"]')
    ).filter(visible).length;
  }

  function hasEmptyText() {
    return /暂无喜欢的视频|暂无收藏的视频|暂无内容|登录后即可观看/.test(textOf(document.body));
  }

  function looksLoading() {
    return !!document.querySelector(
      '[class*="skeleton"],[class*="Skeleton"],[class*="loading"],[class*="Loading"]'
    );
  }

  async function waitForList(timeoutMs) {
    const end = Date.now() + timeoutMs;
    while (Date.now() < end) {
      if (cardCount() > 0) {
        await sleep(400);
        return { ready: true, empty: false, cards: cardCount() };
      }
      if (hasEmptyText()) return { ready: true, empty: true, cards: 0 };
      await sleep(300);
    }
    await sleep(500);
    const cards = cardCount();
    if (cards > 0) return { ready: true, empty: false, cards };
    if (hasEmptyText()) return { ready: true, empty: true, cards: 0 };
    return { ready: false, empty: false, cards, loading: looksLoading() };
  }

  g.DyCleanCore = {
    textOf, visible, nodes, find, findAll, findTab, click, sleep, waitFor,
    selectedCount, cardCount, hasEmptyText, looksLoading, waitForList,
  };
})(typeof window !== "undefined" ? window : globalThis);
(function (g) {
  "use strict";

const C = g.DyCleanCore;

const KINDS = {
  likes: { tab: "喜欢", actions: ["取消喜欢", "取消点赞"] },
  favs: { tab: "收藏", actions: ["取消收藏"] },
};

const CONFIRM_LABELS = ["确认取消", "确认删除", "确定", "确认"];
const NEVER_CLICK = ["暂不取消", "取消"];

async function enterBatch(log) {
  if (C.find("退出管理")) return true;
  if (C.hasEmptyText() && C.cardCount() === 0) return "empty";

  const hits = await C.waitFor(() => C.findAll("批量管理"), 6000);
  if (!hits || !hits.length) {
    log("找不到「批量管理」按钮", "error");
    return false;
  }
  let target = hits[hits.length - 1];
  for (const el of hits) {
    if (/btn|button|clickable/i.test((el.className || "") + " " + (el.getAttribute("role") || ""))) {
      target = el;
      break;
    }
  }
  C.click(target);
  await C.sleep(1000);
  if (!C.find("退出管理") && !C.find("全选") && !C.find("取消全选")) {
    C.click(target);
    await C.sleep(1000);
  }

  const ok = await C.waitFor(
    () => C.find("退出管理") || C.find("全选") || C.find("取消全选") || C.find("已选"),
    5000
  );
  if (!ok) {
    log("进入批量管理失败", "error");
    return false;
  }
  return true;
}

async function selectAll() {
  const label = await C.waitFor(() => C.find("全选") || C.find("取消全选"), 4000);
  if (!label) return C.selectedCount();

  const wrap = label.closest("span.semi-checkbox") || label.closest("label") || label.closest("span,div");
  const input = wrap && wrap.querySelector('input[type="checkbox"]');
  const checked = input ? input.checked : /取消全选/.test(C.textOf(label));

  if (!checked) {
    C.click(wrap || label);
    await C.sleep(600);
    if (input && !input.checked) {
      C.click(input.closest("span.semi-checkbox") || wrap || label);
      await C.sleep(400);
    }
  }
  return C.selectedCount();
}

async function clickAction(kind, log) {
  for (const name of KINDS[kind].actions) {
    const btn = await C.waitFor(() => C.find(name), 2500);
    if (btn && !btn.disabled) {
      C.click(btn);
      await C.sleep(700);
      return true;
    }
  }
  log("未找到「" + KINDS[kind].actions[0] + "」按钮", "error");
  return false;
}

async function confirmDialog(log) {
  for (let i = 0; i < 15; i++) {
    for (const name of CONFIRM_LABELS) {
      if (NEVER_CLICK.includes(name)) continue;
      const hits = C.findAll(name).filter((el) => !NEVER_CLICK.includes(C.textOf(el)));
      hits.sort((a, b) => C.textOf(a).length - C.textOf(b).length);
      const btn = hits[0];
      if (btn) {
        C.click(btn);
        log("确认弹窗: " + C.textOf(btn));
        await C.sleep(400);
        if (C.find(name)) C.click(btn);
        return true;
      }
    }
    await C.sleep(250);
  }
  log("未识别到确认弹窗（可能已直接生效）", "warn");
  return false;
}

async function runOnce(kind, log) {
  const name = KINDS[kind].tab;

  if (location.pathname.indexOf("/user/self") < 0) {
    location.href = "https://www.douyin.com/user/self";
    await C.sleep(3500);
  }
  await C.waitFor(() => C.find("批量管理") || C.find("喜欢") || C.find("收藏"), 8000);

  const tab = await C.waitFor(() => C.findTab(name), 5000);
  if (tab) {
    C.click(tab);
    log("等待「" + name + "」列表加载…");
    await C.sleep(kind === "likes" ? 2500 : 1800);
  } else {
    log("未找到页签「" + name + "」", "warn");
  }

  let ready = await C.waitForList(kind === "likes" ? 20000 : 12000);
  if (!ready.ready) {
    log("列表未就绪，3s 后重试…", "warn");
    await C.sleep(3000);
    ready = await C.waitForList(8000);
  }
  if (ready.ready && ready.empty) return { empty: true };
  if (!ready.ready && ready.cards === 0) {
    log("无卡片且无空态，本轮跳过，下轮再试", "warn");
    return { error: "list-not-ready" };
  }

  const entered = await enterBatch(log);
  if (entered === "empty") return { empty: true };
  if (!entered) return { error: "no-batch-ui" };

  await C.sleep(400);
  let n = await selectAll();
  log(name + " 已选: " + (n == null ? "?" : n));

  if (n === 0) {
    if (C.hasEmptyText() || C.cardCount() === 0) return { empty: true };
    log(name + " 未选中，重试全选", "warn");
    n = await selectAll();
    if (n === 0) return { error: "select-failed" };
  }

  if (!(await clickAction(kind, log))) return { error: "no-action" };
  await C.sleep(500);
  await confirmDialog(log);

  for (let retry = 0; retry < 3; retry++) {
    await C.sleep(800);
    if (C.find("确认取消") || C.find("确认删除")) {
      log("弹窗仍在，重试确认", "warn");
      await confirmDialog(log);
      continue;
    }
    const left = KINDS[kind].actions.some((a) => C.find(a));
    const sel = C.selectedCount();
    if (left && sel != null && sel > 0) {
      log("操作可能未生效，重试", "warn");
      if (await clickAction(kind, log)) {
        await C.sleep(500);
        await confirmDialog(log);
        continue;
      }
    }
    break;
  }

  await C.sleep(1800);
  return { ok: true, selected: n };
}

async function runUntilDone(kind, log, ctl) {
  let processed = 0;
  let round = 0;
  let noProgress = 0;
  let lastSelected = null;

  for (;;) {
    if (ctl.stopped) return { stopped: "user", processed, rounds: round };
    round += 1;
    log(KINDS[kind].tab + " 第 " + round + " 轮");
    const r = await runOnce(kind, log);

    if (r.empty) return { empty: true, processed, rounds: round };

    if (r.error) {
      if (++noProgress >= 5) return { error: r.error, processed, rounds: round };
      await C.sleep(1000);
      continue;
    }

    processed += r.selected || 0;
    await C.sleep(800);

    if (C.hasEmptyText() && C.cardCount() === 0) return { empty: true, processed, rounds: round };

    const now = C.selectedCount();
    if (lastSelected != null && now != null && now >= lastSelected) {
      if (++noProgress >= 5) {
        log(KINDS[kind].tab + " 连续多轮无进展，停止（可能触发风控）", "warn");
        return { stopped: "no-progress", processed, rounds: round };
      }
    } else {
      noProgress = 0;
    }
    lastSelected = now;
    log(KINDS[kind].tab + " 仍有剩余（已选约 " + (now == null ? "?" : now) + "），继续下一轮");
  }
}

  g.DyCleanWorker = { KINDS, runOnce, runUntilDone };
})(typeof window !== "undefined" ? window : globalThis);

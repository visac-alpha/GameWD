const STORAGE_KEY = "gamewd-checklist-v9";

const COLOR_KEYS = [
  { key: "cai", label: "彩" },
  { key: "hong", label: "红" },
  { key: "huang", label: "金" },
  { key: "zi", label: "紫" },
];

const STATUS = {
  none: "none",
  check: "check",
  swap: "swap",
  miss: "miss",
};

const STATUS_META = [
  { key: STATUS.check, title: "已获得", label: "已获得" },
  { key: STATUS.swap, title: "等待置换", label: "等待置换" },
  { key: STATUS.miss, title: "未获得", label: "未获得" },
];

const MAX_TURNS = 15;
const DEFAULT_PVP_TURNS = 10;

let state = {
  editMode: false,
  markMode: false,
  compareMode: false,
  compareHp: "",
  compareAtk: "",
  compareDef: "",
  compareDr: "",
  compareTurns: String(DEFAULT_PVP_TURNS),
  sections: [],
};

let editing = {
  sectionId: null,
  itemId: null,
};

function uid() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyColors() {
  return {
    cai: { enabled: false, value: "", status: STATUS.none },
    hong: { enabled: false, value: "", status: STATUS.none },
    huang: { enabled: false, value: "", status: STATUS.none },
    zi: { enabled: false, value: "", status: STATUS.none },
  };
}

const MAIN_CANNON_TEXTS = [
  "战斗中减少30%受到伤害",
  "对生命高于60%的敌人，提升32%最终伤害",
  "【唯一】佩戴6个[闪避宝石]时，额外获得36%闪避，减少35%受到伤害",
];

const CONTROL_TEXTS = [
  "每回合开始时，获得5%最终增伤和5%最终减伤，最多4层，持续到战斗结束",
  "最终减伤+20%",
  "【唯一】佩戴6个[战舰伤害宝石]时，额外获得36%闪避，减少35%受到伤害",
  "受到攻击时，伤害提升10%，受到伤害增加5%，最多6层",
  "死亡时，立刻复活，恢复20%最大生命，并增加20%速度，持续1回合",
];

const PROPULSION_TEXTS = [
  "每累计恢复1次生命，伤害提升5%，最多15层",
  "每累计损失10%生命，伤害提升5%，最多20层",
  "自身生命首次低于30%时，立刻恢复25%最大生命",
  "全部战斗属性+20%",
];

const ENGINE_TEXTS = [
  "每次攻击或释放技能时，额外造成敌人最大生命10%的追加伤害（最高不超过自身100%攻击）",
  "【闪避专属】释放[撞击]时，每次额外造成自身已损失生命80%的追加伤害，并恢复16%最大生命",
  "最终增伤+20%",
  "每回合开始时，伤害提升8%，最多40%",
  "速度减少20%，伤害提升40%",
  "战斗开始时，伤害提升60%，每次攻击减少15%",
];

const ARMOR_TEXTS = [
  "【闪避专属】每次闪避时，发动[撞击]，对敌人造成自身最大生命28%的伤害，同时自身损失10%当前生命",
  "战斗开始时，自身立刻损失20%最大生命，获得20%攻击和20%速度",
  "自身生命首次低于30%时，最终减伤+35%，持续到战斗结束",
  "自身生命10%以下时，伤害提升75%",
];

const RADAR_TEXTS = [
  "【闪避专属】释放[撞击]时，额外损失5%当前生命，提升20%撞击伤害，最多叠加5次",
  "每回合开始时，偷取敌人7%攻击，最高不超过自身攻击14%，最多3层",
  "每回合开始时，自身恢复攻击力15%的生命",
  "每次攻击时，50%概率获得8%攻击和8%防御，持续5回合，最多3层",
];

function createItem(text = "新文案") {
  return { id: uid(), text, colors: emptyColors() };
}

function createSection(title = "新条幅") {
  return {
    id: uid(),
    title,
    open: true,
    items: [],
  };
}

function defaultData() {
  return {
    editMode: false,
    markMode: false,
    compareMode: false,
    compareHp: "",
    compareAtk: "",
    compareDef: "",
    compareDr: "",
    compareTurns: String(DEFAULT_PVP_TURNS),
    sections: [
      {
        id: uid(),
        title: "主炮",
        open: true,
        items: MAIN_CANNON_TEXTS.map((text) => createItem(text)),
      },
      {
        id: uid(),
        title: "中控",
        open: true,
        items: CONTROL_TEXTS.map((text) => createItem(text)),
      },
      {
        id: uid(),
        title: "推进",
        open: true,
        items: PROPULSION_TEXTS.map((text) => createItem(text)),
      },
      {
        id: uid(),
        title: "引擎",
        open: true,
        items: ENGINE_TEXTS.map((text) => createItem(text)),
      },
      {
        id: uid(),
        title: "装甲",
        open: true,
        items: ARMOR_TEXTS.map((text) => createItem(text)),
      },
      {
        id: uid(),
        title: "雷达",
        open: true,
        items: RADAR_TEXTS.map((text) => createItem(text)),
      },
    ],
  };
}

function countEnabledColors(sections) {
  let n = 0;
  for (const section of sections || []) {
    for (const item of section.items || []) {
      for (const { key } of COLOR_KEYS) {
        if (item.colors?.[key]?.enabled) n += 1;
      }
    }
  }
  return n;
}

function fromSeed() {
  const seed =
    (typeof window !== "undefined" && window.CHECKLIST_SEED) ||
    (typeof CHECKLIST_SEED !== "undefined" ? CHECKLIST_SEED : null);
  if (!seed || !Array.isArray(seed.sections)) return null;
  return {
    editMode: false,
    markMode: false,
    compareMode: false,
    compareHp: seed.compareHp ?? "",
    compareAtk: seed.compareAtk ?? "",
    compareDef: seed.compareDef ?? "",
    compareDr: seed.compareDr ?? "",
    compareTurns: seed.compareTurns ?? String(DEFAULT_PVP_TURNS),
    sections: seed.sections.map(normalizeSection),
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fromSeed() || defaultData();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.sections)) return fromSeed() || defaultData();
    const loaded = {
      editMode: !!parsed.editMode,
      markMode: !!parsed.markMode,
      compareMode: !!parsed.compareMode,
      compareHp: parsed.compareHp ?? "",
      compareAtk: parsed.compareAtk ?? "",
      compareDef: parsed.compareDef ?? "",
      compareDr: parsed.compareDr ?? "",
      compareTurns: parsed.compareTurns ?? String(DEFAULT_PVP_TURNS),
      sections: parsed.sections.map(normalizeSection),
    };
    // 本地有清单但所有颜色都未勾选：多半是换浏览器/清站点数据后的空壳，自动回填备份
    if (countEnabledColors(loaded.sections) === 0) {
      const seeded = fromSeed();
      if (seeded && countEnabledColors(seeded.sections) > 0) return seeded;
    }
    return loaded;
  } catch {
    return fromSeed() || defaultData();
  }
}

function restoreColorSeed() {
  const seeded = fromSeed();
  if (!seeded) {
    alert("没有找到颜色备份（checklist-seed.js）");
    return false;
  }
  state = {
    ...seeded,
    editMode: state.editMode,
    markMode: state.markMode,
    compareMode: state.compareMode,
  };
  save();
  render();
  return true;
}

function normalizeSection(section) {
  return {
    ...section,
    items: (section.items || []).map(normalizeItem),
  };
}

function normalizeItem(item) {
  const colors = emptyColors();
  for (const { key } of COLOR_KEYS) {
    const src = item.colors?.[key] || {};
    colors[key] = {
      enabled: !!src.enabled,
      value: src.value ?? src.desc ?? "",
      status: src.status || STATUS.none,
    };
  }
  return {
    id: item.id || uid(),
    text: item.text ?? item.name ?? "",
    colors,
  };
}

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      editMode: state.editMode,
      markMode: state.markMode,
      compareMode: state.compareMode,
      compareHp: state.compareHp,
      compareAtk: state.compareAtk,
      compareDef: state.compareDef,
      compareDr: state.compareDr,
      compareTurns: state.compareTurns,
      sections: state.sections,
    })
  );
}

function findSection(sectionId) {
  return state.sections.find((s) => s.id === sectionId);
}

function findItem(sectionId, itemId) {
  const section = findSection(sectionId);
  if (!section) return null;
  return section.items.find((i) => i.id === itemId) || null;
}

function moveInArray(list, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return false;
  if (fromIndex >= list.length || toIndex >= list.length) return false;
  const [item] = list.splice(fromIndex, 1);
  list.splice(toIndex, 0, item);
  return true;
}

function moveItem(sectionId, itemId, delta) {
  const section = findSection(sectionId);
  if (!section) return;
  const from = section.items.findIndex((i) => i.id === itemId);
  if (moveInArray(section.items, from, from + delta)) {
    save();
    render();
  }
}

function moveSection(sectionId, delta) {
  const from = state.sections.findIndex((s) => s.id === sectionId);
  if (moveInArray(state.sections, from, from + delta)) {
    save();
    render();
  }
}

function enabledColors(item) {
  return COLOR_KEYS.filter((c) => item.colors[c.key]?.enabled);
}

function isOwnedStatus(status) {
  return status === STATUS.check || status === STATUS.swap;
}

function variantViewClass(item, colorKey) {
  if (state.markMode || state.compareMode) return "";

  const colors = enabledColors(item);
  const owned = colors.filter((c) => isOwnedStatus(item.colors[c.key].status));
  const st = item.colors[colorKey].status;
  const classes = [];

  if (st === STATUS.miss) classes.push("is-miss");

  // 已获得 / 等待置换：展示一致（高亮主行）；置换仅靠 [置] 标记区分
  if (owned.length > 0) {
    if (isOwnedStatus(st)) classes.push("is-primary");
    else {
      classes.push("is-dim");
      classes.push("is-shrink");
    }
  }

  return classes.join(" ");
}

function parseColorValues(value) {
  return String(value || "")
    .split(/[,，]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function isFixedNumber(text, index, token) {
  const before = text.slice(Math.max(0, index - 10), index);
  const after = text.slice(index + token.length, index + token.length + 8);
  if (/(低于|高于|少于|不足|小于|大于)$/.test(before)) return true;
  if (/^(以下|以上|概率)/.test(after)) return true;
  if (/^(层|次|回合|个)/.test(after)) return true;
  if (/(最多|持续|叠加)$/.test(before)) return true;
  if (/佩戴\d*$/.test(before)) return true;
  if (/损失$/.test(before) && /^(当前|最大)?生命/.test(after)) return true;
  if (/恢复$/.test(before) && /^最大生命/.test(after) && /战斗开始时/.test(text)) {
    return true;
  }
  return false;
}

function mapTextNumbers(text, valueStr) {
  const values = parseColorValues(valueStr);
  const re = /[+\-]?\d+(?:\.\d+)?%?/g;
  const tokens = [];
  let match;
  while ((match = re.exec(text))) {
    tokens.push({
      index: match.index,
      end: match.index + match[0].length,
      token: match[0],
      fixed: isFixedNumber(text, match.index, match[0]),
      display: match[0],
      highlight: false,
    });
  }

  const slots = tokens.filter((token) => !token.fixed);
  values.forEach((value, vi) => {
    const token = slots[vi];
    if (!token) return;
    token.display = value;
    token.highlight = true;
  });

  return tokens;
}

function highlightText(text, colorKey, valueStr) {
  const tokens = mapTextNumbers(text, valueStr);
  let html = "";
  let last = 0;
  for (const token of tokens) {
    html += escapeHtml(text.slice(last, token.index));
    if (token.highlight) {
      html += `<span class="num ${colorKey}">${escapeHtml(token.display)}</span>`;
    } else {
      html += escapeHtml(token.display);
    }
    last = token.end;
  }
  html += escapeHtml(text.slice(last));
  return html;
}

function appliedText(text, valueStr) {
  const tokens = mapTextNumbers(text, valueStr);
  if (!tokens.length) return text;
  let out = "";
  let last = 0;
  for (const token of tokens) {
    out += text.slice(last, token.index);
    out += token.display;
    last = token.end;
  }
  out += text.slice(last);
  return out;
}

function formatPct(n) {
  const v = Math.round(Number(n) * 10) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function formatNum(n) {
  return Math.round(n).toLocaleString("zh-CN");
}

function overallPct(kind, value, hp, atk) {
  const vsAtk = kind === "伤害" || kind === "追加上限" || kind === "攻击";
  const base = vsAtk ? atk : hp;
  if (!base) return null;
  return (value / base) * 100;
}

function damageUptimeFactor(text) {
  const above = text.match(/高于(\d+(?:\.\d+)?)%/);
  if (above) return Number(above[1]) / 100;

  const below =
    text.match(/(\d+(?:\.\d+)?)%以下/) ||
    text.match(/低于(\d+(?:\.\d+)?)%/);
  if (below) return Number(below[1]) / 100;

  return 1;
}

function summarizeLift(text, hp, atk) {
  const bits = computeBonuses(text, hp, atk);
  let hpPct = 0;
  let dealValue = 0;
  let atkLift = 0;
  let dmgUpPct = 0;
  let healPerRound = 0;
  let hasHp = false;
  let hasDeal = false;
  let hasAtkLift = false;
  let hasDmgUp = false;
  let hasRoundHeal = false;

  for (const bit of bits) {
    const pct = Number(bit.percent);
    if (!Number.isFinite(pct) && bit.display !== "deal" && bit.display !== "atk") {
      continue;
    }
    if (bit.kind === "生命" || bit.kind === "回血" || bit.kind === "等效生命") {
      if (!Number.isFinite(pct)) continue;
      hpPct += pct;
      hasHp = true;
      if (bit.perRoundHeal) {
        healPerRound += bit.healPerRound;
        hasRoundHeal = true;
      }
    } else if (bit.display === "deal") {
      dealValue += bit.value;
      hasDeal = true;
    } else if (bit.display === "atk") {
      atkLift += bit.value;
      hasAtkLift = true;
    } else if (bit.display === "amp") {
      dmgUpPct += Number(bit.value);
      hasDmgUp = true;
    }
  }

  const uptime = damageUptimeFactor(text);
  if (hasDmgUp) dmgUpPct *= uptime;

  const loss = text.match(/损失(\d+(?:\.\d+)?)%(?:当前|最大)?生命/);
  if (loss) {
    hpPct -= Number(loss[1]);
    hasHp = true;
  }

  const hasDmg = hasDeal || hasAtkLift || hasDmgUp;

  return {
    hpPct,
    dealValue,
    atkLift,
    dmgUpPct,
    healPerRound,
    hasHp,
    hasDmg,
    hasDeal,
    hasAtkLift,
    hasDmgUp,
    hasRoundHeal,
  };
}

function liftKey(itemId, colorKey) {
  return `${itemId}::${colorKey || "_"}`;
}

function computeItemLift(item, colorKey) {
  const hp = Number(state.compareHp) || 0;
  const atk = Number(state.compareAtk) || 0;
  const source = colorKey
    ? appliedText(item.text, item.colors[colorKey]?.value)
    : item.text;
  return summarizeLift(source, hp, atk);
}

let compareRanks = new Map();

function rebuildCompareRanks() {
  compareRanks = new Map();
  if (!state.compareMode) return;

  const assign = (list, valueKey, rankKey, peerKey) => {
    const sorted = list.slice().sort((a, b) => b[valueKey] - a[valueKey]);
    let rank = 0;
    let last = null;
    for (const entry of sorted) {
      const value = entry[valueKey];
      if (last === null || value !== last) rank += 1;
      last = value;
      const key = liftKey(entry.itemId, entry.colorKey);
      const rec = compareRanks.get(key) || { ...entry };
      rec[rankKey] = rank;
      rec[peerKey] = list.length;
      rec.hpPct = entry.hpPct;
      rec.dealValue = entry.dealValue;
      rec.atkLift = entry.atkLift;
      rec.dmgUpPct = entry.dmgUpPct;
      rec.hasHp = entry.hasHp;
      rec.hasDmg = entry.hasDmg;
      rec.hasDeal = entry.hasDeal;
      rec.hasAtkLift = entry.hasAtkLift;
      rec.hasDmgUp = entry.hasDmgUp;
      rec.healPerRound = entry.healPerRound;
      rec.hasRoundHeal = entry.hasRoundHeal;
      compareRanks.set(key, rec);
    }
  };

  for (const section of state.sections) {
    const entries = [];
    for (const item of section.items) {
      const colors = enabledColors(item);
      if (colors.length) {
        for (const color of colors) {
          const lift = computeItemLift(item, color.key);
          if (!lift.hasHp && !lift.hasDmg) continue;
          entries.push({ itemId: item.id, colorKey: color.key, ...lift });
        }
      } else {
        const lift = computeItemLift(item, null);
        if (!lift.hasHp && !lift.hasDmg) continue;
        entries.push({ itemId: item.id, colorKey: null, ...lift });
      }
    }

    assign(
      entries.filter((e) => e.hasHp),
      "hpPct",
      "hpRank",
      "hpPeers"
    );
  }
}

function formatLiftPct(pct) {
  const n = Number(pct);
  const sign = n > 0 ? "+" : "";
  return `${sign}${formatPct(n)}%`;
}

function fightTurns() {
  const n = Number(state.compareTurns);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_PVP_TURNS;
  return Math.min(MAX_TURNS, Math.max(1, Math.round(n)));
}

function enemyTakenMul() {
  const dr = Number(state.compareDr);
  if (!Number.isFinite(dr) || dr <= 0) return 1;
  return Math.max(0, Math.min(1, 1 - dr / 100));
}

function applyDr(raw) {
  return Math.max(0, Number(raw)) * enemyTakenMul();
}

function extraFromAtkPct(atk, pctPoints) {
  const p = Number(pctPoints) / 100;
  if (!atk || !Number.isFinite(p) || p === 0) return 0;
  return atk * p;
}

function mean(list) {
  if (!list.length) return 0;
  return list.reduce((a, b) => a + b, 0) / list.length;
}

function stackSeries(maxStacks, gainPerTurn, turns) {
  const cap = Math.max(0, Number(maxStacks) || 0);
  const gain = Number(gainPerTurn) || 0;
  const series = [];
  let current = 0;
  for (let i = 0; i < turns; i += 1) {
    current = Math.min(cap, current + gain);
    series.push(current);
  }
  return series;
}

function computeBonuses(text, hp, atk) {
  const results = [];
  if (!text || (!hp && !atk)) return results;

  const add = (kind, value, flags = {}) => {
    const display = flags.display || "";
    if (display === "amp") {
      if (!Number.isFinite(value) || value === 0) return;
      results.push({
        kind,
        value,
        percent: formatPct(value),
        display,
      });
      return;
    }
    if (!Number.isFinite(value) || value === 0) return;
    if (value < 0 && kind !== "等效生命") return;
    const percent = overallPct(kind, value, hp, atk);
    if (percent == null) return;
    results.push({
      kind,
      value,
      percent: formatPct(percent),
      display,
      real: display === "deal" || !!flags.real,
      perRoundHeal: !!flags.perRoundHeal,
      healPerRound: Number(flags.healPerRound) || 0,
    });
  };

  const T = fightTurns();
  const stacksMatch =
    text.match(/最多(?:叠加)?(\d+)层/) || text.match(/最多叠加(\d+)次/);
  const maxStacks = stacksMatch ? Number(stacksMatch[1]) : 1;
  const useStacks = maxStacks > 1;
  const perRound = /每回合/.test(text);
  const perHit = /每次攻击|受到攻击时/.test(text);
  const cumulative = /每累计/.test(text);
  const ramps = useStacks && (perRound || perHit || cumulative);
  const procRate = /50%\s*概率/.test(text) ? 0.5 : 1;
  const durationMatch = text.match(/持续(\d+)回合/);
  const duration = durationMatch ? Number(durationMatch[1]) : null;
  const toEnd = /持续到战斗结束/.test(text);
  const stackMul = ramps
    ? mean(stackSeries(maxStacks, procRate, T))
    : useStacks
      ? maxStacks
      : 1;
  const durMul =
    duration && !toEnd && !useStacks ? Math.min(duration, T) / T : 1;

  const addDr = (pctPoints) => {
    const per = Number(pctPoints) / 100;
    if (!hp || !Number.isFinite(per) || per <= 0) return;
    if (ramps) {
      let ehp = 0;
      for (const stacks of stackSeries(maxStacks, procRate, T)) {
        const p = Math.min(0.9, per * stacks);
        if (p > 0 && p < 1) ehp += p / (1 - p);
      }
      add("等效生命", hp * (ehp / T));
      return;
    }
    const p = Math.min(0.9, per * (useStacks ? maxStacks : 1));
    if (p >= 1) return;
    add("等效生命", hp * p / (1 - p));
  };

  let t = text;

  // 闪避已溢出：只保留减伤，不把闪避折进等效生命
  t = t.replace(/\d+(?:\.\d+)?%闪避/g, " ");

  // 全部战斗属性会加闪避；闪避已溢出，20%/10% 都不计入
  t = t.replace(/全部战斗属性\s*[+＋]?\s*(\d+(?:\.\d+)?)%/g, " ");

  t = t.replace(
    /伤害提升\s*(\d+(?:\.\d+)?)%\s*[，,、]?\s*每次攻击减少(\d+(?:\.\d+)?)%/g,
    (_, start, dec) => {
      let current = Number(start);
      const step = Number(dec);
      let sum = 0;
      for (let i = 0; i < T; i += 1) {
        sum += Math.max(0, current);
        current -= step;
      }
      add("增伤", sum / T, { display: "amp" });
      return " ";
    }
  );

  t = t.replace(
    /伤害提升\s*(\d+(?:\.\d+)?)%\s*[，,、]?\s*最多\s*(\d+(?:\.\d+)?)%/g,
    (_, step, cap) => {
      const stepN = Number(step);
      const capN = Number(cap);
      let p = capN;
      if (perRound) {
        let current = 0;
        let sum = 0;
        for (let i = 0; i < T; i += 1) {
          current = Math.min(capN, current + stepN);
          sum += current;
        }
        p = sum / T;
      }
      add("增伤", p, { display: "amp" });
      return " ";
    }
  );

  t = t.replace(
    /敌人最大生命[\s\S]{0,40}不超过自身(\d+(?:\.\d+)?)%攻击/g,
    (_, cap) => {
      const p = Number(cap);
      add("追加上限", applyDr(atk * p / 100), { display: "deal" });
      return " ";
    }
  );

  t = t.replace(/不超过自身(?:攻击)?(\d+(?:\.\d+)?)%(?:攻击)?/g, (match, cap) => {
    if (/偷取|敌人/.test(text) && /攻击/.test(match + text)) {
      let p = Number(cap);
      if (perRound) {
        const steal = text.match(/偷取敌人(\d+(?:\.\d+)?)%攻击/);
        const step = steal ? Number(steal[1]) : p;
        let current = 0;
        let sum = 0;
        for (let i = 0; i < T; i += 1) {
          current = Math.min(p, current + step);
          sum += current;
        }
        p = sum / T;
      }
      add("攻击", extraFromAtkPct(atk, p), { display: "atk" });
    }
    return " ";
  });

  t = t.replace(/恢复攻击力(\d+(?:\.\d+)?)%的生命/g, (_, n) => {
    const perTurn = atk * Number(n) / 100;
    const total = perRound ? perTurn * T : perTurn;
    add("回血", total, {
      perRoundHeal: perRound,
      healPerRound: perTurn,
    });
    return " ";
  });

  t = t.replace(/恢复(\d+(?:\.\d+)?)%最大生命/g, (_, n) => {
    let p = Number(n);
    if (perRound) p *= T;
    add("回血", hp * p / 100);
    return " ";
  });

  t = t.replace(/已损失生命(\d+(?:\.\d+)?)%/g, (_, n) => {
    const lostHp = hp * 0.5;
    const p = Number(n) / 100;
    add("伤害", applyDr(lostHp * p), { display: "deal" });
    return " ";
  });

  t = t.replace(/(?:造成|对敌人造成)自身最大生命(\d+(?:\.\d+)?)%/g, (_, n) => {
    const p = Number(n);
    add("伤害", applyDr(hp * p / 100), { display: "deal" });
    return " ";
  });

  t = t.replace(/最大生命(\d+(?:\.\d+)?)%的伤害/g, (_, n) => {
    const p = Number(n);
    add("伤害", applyDr(hp * p / 100), { display: "deal" });
    return " ";
  });

  t = t.replace(/减少(\d+(?:\.\d+)?)%受到伤害/g, (_, n) => {
    addDr(n);
    return " ";
  });

  t = t.replace(/受到伤害增加(\d+(?:\.\d+)?)%/g, (_, n) => {
    const per = Number(n) / 100;
    if (!hp || !Number.isFinite(per) || per <= 0) return " ";
    if (ramps) {
      let ehp = 0;
      for (const stacks of stackSeries(maxStacks, procRate, T)) {
        const p = per * stacks;
        if (p > 0) ehp += -p / (1 + p);
      }
      add("等效生命", hp * (ehp / T));
    } else {
      const p = per * (useStacks ? maxStacks : 1);
      add("等效生命", hp * (-p / (1 + p)));
    }
    return " ";
  });

  t = t.replace(/(\d+(?:\.\d+)?)%最终减伤/g, (_, n) => {
    addDr(n);
    return " ";
  });

  t = t.replace(/最终减伤\s*[+＋]?\s*(\d+(?:\.\d+)?)%/g, (_, n) => {
    addDr(n);
    return " ";
  });

  t = t.replace(/(\d+(?:\.\d+)?)%最终增伤/g, (_, n) => {
    add("增伤", Number(n) * stackMul, { display: "amp" });
    return " ";
  });

  t = t.replace(/最终增伤\s*[+＋]?\s*(\d+(?:\.\d+)?)%/g, (_, n) => {
    add("增伤", Number(n) * stackMul, { display: "amp" });
    return " ";
  });

  t = t.replace(/提升(\d+(?:\.\d+)?)%最终伤害/g, (_, n) => {
    add("增伤", Number(n) * stackMul, { display: "amp" });
    return " ";
  });

  t = t.replace(/提升(\d+(?:\.\d+)?)%撞击伤害/g, (_, n) => {
    add("增伤", Number(n) * stackMul, { display: "amp" });
    return " ";
  });

  t = t.replace(/伤害提升(\d+(?:\.\d+)?)%/g, (_, n) => {
    add("增伤", Number(n) * stackMul, { display: "amp" });
    return " ";
  });

  t = t.replace(/获得(\d+(?:\.\d+)?)%攻击/g, (_, n) => {
    const p = Number(n) * stackMul;
    add("攻击", extraFromAtkPct(atk, p), { display: "atk" });
    return " ";
  });

  return results;
}

function getCompareRec(item, colorKey) {
  return compareRanks.get(liftKey(item.id, colorKey)) || null;
}

function compareRec(item, colorKey) {
  return getCompareRec(item, colorKey) || computeItemLift(item, colorKey);
}

function renderDmgLiftHtml(item, colorKey) {
  if (!state.compareMode) return "";
  const rec = compareRec(item, colorKey);
  if (!rec.hasDeal && !rec.hasAtkLift && !rec.hasDmgUp) {
    return `<span class="lift-side lift-left"></span>`;
  }
  const parts = [];
  if (rec.hasDeal) {
    parts.push(
      `<span class="lift lift-dmg lift-real">伤害 ${formatNum(rec.dealValue)}</span>`
    );
  }
  if (rec.hasAtkLift) {
    parts.push(
      `<span class="lift lift-dmg">攻击 ${formatNum(rec.atkLift)}</span>`
    );
  }
  if (rec.hasDmgUp) {
    parts.push(
      `<span class="lift lift-dmg">伤害提升${formatLiftPct(rec.dmgUpPct)}</span>`
    );
  }
  return `<span class="lift-side lift-left">${parts.join("")}</span>`;
}

function renderHpLiftHtml(item, colorKey) {
  if (!state.compareMode) return "";
  const rec = compareRec(item, colorKey);
  if (!rec.hasHp) return `<span class="lift-side lift-right"></span>`;
  const top = rec.hpRank === 1 ? " is-top" : "";
  const neg = rec.hpPct < 0 ? " is-neg" : "";
  const color = colorKey ? ` ${colorKey}` : "";
  const rankHtml =
    rec.hpPeers >= 2 && rec.hpRank
      ? `<span class="rank-badge rank-hp${top}">${rec.hpRank}</span>`
      : "";
  const hpParts = [];
  if (rec.hasRoundHeal) {
    hpParts.push(
      `<span class="lift lift-hp lift-heal${top}${color}">每回合恢复 ${formatNum(rec.healPerRound)}</span>`
    );
  } else {
    hpParts.push(
      `<span class="lift lift-hp${neg}${top}${color}">等效生命${formatLiftPct(rec.hpPct)}</span>`
    );
  }
  return `<span class="lift-side lift-right">
    ${hpParts.join("")}
    ${rankHtml}
  </span>`;
}

/* ---------- render ---------- */

const sectionsEl = document.getElementById("sections");
const editModeBtn = document.getElementById("btn-edit-mode");
const markModeBtn = document.getElementById("btn-mark-mode");
const compareModeBtn = document.getElementById("btn-compare-mode");
const restoreSeedBtn = document.getElementById("btn-restore-seed");
const addSectionBtn = document.getElementById("btn-add-section");
const compareHpInput = document.getElementById("compare-hp");
const compareAtkInput = document.getElementById("compare-atk");
const compareTurnsInput = document.getElementById("compare-turns");
const compareDrInput = document.getElementById("compare-dr");

const itemDialog = document.getElementById("item-dialog");
const itemForm = document.getElementById("item-form");
const itemTextInput = document.getElementById("item-text");
const colorEditorsEl = document.getElementById("color-editors");
const itemCancelBtn = document.getElementById("item-cancel");

const sectionDialog = document.getElementById("section-dialog");
const sectionForm = document.getElementById("section-form");
const sectionTitleInput = document.getElementById("section-title");
const sectionCancelBtn = document.getElementById("section-cancel");

function render() {
  document.body.classList.toggle("edit-mode", state.editMode);
  document.body.classList.toggle("mark-mode", state.markMode);
  document.body.classList.toggle("compare-mode", state.compareMode);
  editModeBtn.classList.toggle("active", state.editMode);
  editModeBtn.textContent = state.editMode ? "退出编辑" : "编辑模式";
  markModeBtn.classList.toggle("active", state.markMode);
  markModeBtn.textContent = state.markMode ? "退出标记" : "标记模式";
  compareModeBtn.classList.toggle("active", state.compareMode);
  compareModeBtn.textContent = state.compareMode ? "退出比较" : "比较模式";
  addSectionBtn.style.display = state.editMode ? "" : "none";
  if (compareHpInput) compareHpInput.value = state.compareHp;
  if (compareAtkInput) compareAtkInput.value = state.compareAtk;
  if (compareTurnsInput) compareTurnsInput.value = state.compareTurns || DEFAULT_PVP_TURNS;
  if (compareDrInput) compareDrInput.value = state.compareDr;

  if (!state.sections.length) {
    sectionsEl.innerHTML = `<div class="empty">还没有条幅。打开编辑模式后点击「添加条幅」。</div>`;
    return;
  }

  rebuildCompareRanks();
  sectionsEl.innerHTML = state.sections.map(renderSection).join("");
  bindItemDrag();
}

function renderSection(section, sectionIndex) {
  const count = section.items.length;
  return `
    <article class="section ${section.open ? "open" : ""}" data-section-id="${section.id}">
      <div style="display:flex;align-items:stretch">
        <button type="button" class="section-header" data-action="toggle" aria-expanded="${section.open}">
          <span class="chevron">▸</span>
          <span class="section-title">${escapeHtml(section.title)}</span>
          <span class="section-count">${count} 项</span>
        </button>
        <div class="section-tools edit-only">
          <button type="button" class="btn btn-ghost btn-sm" data-action="move-section-up" ${sectionIndex === 0 ? "disabled" : ""}>↑</button>
          <button type="button" class="btn btn-ghost btn-sm" data-action="move-section-down" ${sectionIndex === state.sections.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" class="btn btn-ghost btn-sm" data-action="edit-section">改名</button>
          <button type="button" class="btn btn-danger btn-sm" data-action="delete-section">删除</button>
        </div>
      </div>
      <div class="section-body">
        <div class="item-list">
          ${
            section.items.length
              ? section.items
                  .map((item, itemIndex) => renderItem(section, item, itemIndex))
                  .join("")
              : `<div class="empty">此条幅暂无项目</div>`
          }
        </div>
        <div class="add-item-wrap edit-only">
          <button type="button" class="btn btn-primary btn-sm" data-action="add-item">添加文案</button>
        </div>
      </div>
    </article>
  `;
}

function renderItem(section, item, itemIndex) {
  const colors = enabledColors(item);
  const last = section.items.length - 1;
  const variants = colors.length
    ? colors.map((c) => renderVariantLine(item, c)).join("")
    : `<div class="item-copy">${renderDmgLiftHtml(item, null)}<span class="item-text">${escapeHtml(item.text)}</span>${renderHpLiftHtml(item, null)}</div>`;
  return `
    <div class="item-row" data-section-id="${section.id}" data-item-id="${item.id}">
      <span class="drag-handle edit-only" draggable="true" title="拖动排序" aria-label="拖动排序">⋮⋮</span>
      <div class="item-variants">
        ${variants}
      </div>
      <div class="item-actions edit-only">
        <button type="button" class="btn btn-ghost btn-sm" data-action="move-item-up" ${itemIndex === 0 ? "disabled" : ""} title="上移">↑</button>
        <button type="button" class="btn btn-ghost btn-sm" data-action="move-item-down" ${itemIndex === last ? "disabled" : ""} title="下移">↓</button>
        <button type="button" class="btn btn-ghost btn-sm" data-action="edit-item">编辑</button>
        <button type="button" class="btn btn-danger btn-sm" data-action="delete-item">删除</button>
      </div>
    </div>
  `;
}

function renderVariantLine(item, colorMeta) {
  const data = item.colors[colorMeta.key];
  const viewClass = variantViewClass(item, colorMeta.key);
  const swapTag =
    data.status === STATUS.swap
      ? `<span class="swap-tag" title="等待置换">[置]</span>`
      : "";
  return `
    <div class="item-copy variant ${colorMeta.key} ${viewClass}" data-color="${colorMeta.key}">
      ${renderDmgLiftHtml(item, colorMeta.key)}
      <span class="color-label ${colorMeta.key}">${colorMeta.label}</span>
      ${swapTag}
      <span class="item-text">${highlightText(item.text, colorMeta.key, data.value)}</span>
      ${renderHpLiftHtml(item, colorMeta.key)}
      <div class="status-btns mark-only">
        ${STATUS_META.map(
          (s) => `
          <button
            type="button"
            class="status-btn ${s.key} ${data.status === s.key ? "active" : ""}"
            data-action="set-status"
            data-status="${s.key}"
          >${s.label}</button>
        `
        ).join("")}
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/* ---------- events ---------- */

sectionsEl.addEventListener("click", (e) => {
  const actionEl = e.target.closest("[data-action]");
  if (!actionEl) return;

  const sectionEl = e.target.closest("[data-section-id]");
  if (!sectionEl) return;

  const sectionId = sectionEl.dataset.sectionId;
  const action = actionEl.dataset.action;
  const itemEl = e.target.closest("[data-item-id]");
  const itemId = itemEl?.dataset.itemId;

  switch (action) {
    case "toggle": {
      const section = findSection(sectionId);
      if (!section) return;
      section.open = !section.open;
      save();
      render();
      break;
    }
    case "edit-section":
      openSectionDialog(sectionId);
      break;
    case "delete-section":
      if (confirm("确定删除这个条幅及其全部项目？")) {
        state.sections = state.sections.filter((s) => s.id !== sectionId);
        save();
        render();
      }
      break;
    case "add-item":
      openItemDialog(sectionId, null);
      break;
    case "edit-item":
      openItemDialog(sectionId, itemId);
      break;
    case "delete-item": {
      const section = findSection(sectionId);
      if (!section) return;
      section.items = section.items.filter((i) => i.id !== itemId);
      save();
      render();
      break;
    }
    case "move-item-up":
      moveItem(sectionId, itemId, -1);
      break;
    case "move-item-down":
      moveItem(sectionId, itemId, 1);
      break;
    case "move-section-up":
      moveSection(sectionId, -1);
      break;
    case "move-section-down":
      moveSection(sectionId, 1);
      break;
    case "set-status": {
      const colorKey = e.target.closest("[data-color]")?.dataset.color;
      const next = actionEl.dataset.status;
      const item = findItem(sectionId, itemId);
      if (!item || !colorKey || !item.colors[colorKey]) return;
      item.colors[colorKey].status =
        item.colors[colorKey].status === next ? STATUS.none : next;
      save();
      render();
      break;
    }
    default:
      break;
  }
});

function bindItemDrag() {
  if (!state.editMode) return;

  sectionsEl.querySelectorAll(".item-row").forEach((row) => {
    const handle = row.querySelector(".drag-handle");
    if (!handle) return;

    handle.addEventListener("dragstart", (e) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          sectionId: row.dataset.sectionId,
          itemId: row.dataset.itemId,
        })
      );
      row.classList.add("dragging");
    });

    handle.addEventListener("dragend", () => {
      row.classList.remove("dragging");
      sectionsEl
        .querySelectorAll(".item-row.drag-over")
        .forEach((el) => el.classList.remove("drag-over"));
    });

    row.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      row.classList.add("drag-over");
    });

    row.addEventListener("dragleave", () => {
      row.classList.remove("drag-over");
    });

    row.addEventListener("drop", (e) => {
      e.preventDefault();
      row.classList.remove("drag-over");
      let payload;
      try {
        payload = JSON.parse(e.dataTransfer.getData("text/plain"));
      } catch {
        return;
      }
      const fromSection = findSection(payload.sectionId);
      const toSection = findSection(row.dataset.sectionId);
      if (!fromSection || !toSection) return;
      const fromIndex = fromSection.items.findIndex((i) => i.id === payload.itemId);
      const toIndex = toSection.items.findIndex((i) => i.id === row.dataset.itemId);
      if (fromIndex < 0 || toIndex < 0) return;
      if (fromSection === toSection) {
        if (fromIndex === toIndex) return;
        moveInArray(fromSection.items, fromIndex, toIndex);
      } else {
        const [item] = fromSection.items.splice(fromIndex, 1);
        toSection.items.splice(toIndex, 0, item);
      }
      save();
      render();
    });
  });
}

editModeBtn.addEventListener("click", () => {
  state.editMode = !state.editMode;
  if (state.editMode) {
    state.markMode = false;
    state.compareMode = false;
  }
  save();
  render();
});

markModeBtn.addEventListener("click", () => {
  state.markMode = !state.markMode;
  if (state.markMode) {
    state.editMode = false;
    state.compareMode = false;
  }
  save();
  render();
});

compareModeBtn.addEventListener("click", () => {
  state.compareMode = !state.compareMode;
  if (state.compareMode) {
    state.editMode = false;
    state.markMode = false;
  }
  save();
  render();
});

restoreSeedBtn?.addEventListener("click", () => {
  if (
    !confirm(
      "用项目里的颜色备份覆盖当前清单的颜色勾选与数值？\n（会保留你现在的编辑/标记/比较模式开关）"
    )
  ) {
    return;
  }
  restoreColorSeed();
});

function onCompareStatInput() {
  state.compareHp = compareHpInput.value;
  state.compareAtk = compareAtkInput.value;
  state.compareTurns = compareTurnsInput?.value || String(DEFAULT_PVP_TURNS);
  state.compareDr = compareDrInput?.value ?? "";
  save();
  refreshCalcs();
}

function refreshCalcs() {
  if (!state.compareMode) return;
  rebuildCompareRanks();
  sectionsEl.querySelectorAll(".item-row").forEach((row) => {
    const item = findItem(row.dataset.sectionId, row.dataset.itemId);
    if (!item) return;
    row.querySelectorAll(".item-copy").forEach((line) => {
      const colorKey = line.dataset.color || null;
      const leftHtml = renderDmgLiftHtml(item, colorKey);
      const leftEl = line.querySelector(".lift-left");
      if (leftEl) leftEl.outerHTML = leftHtml;
      else if (leftHtml) line.insertAdjacentHTML("afterbegin", leftHtml);

      const rightHtml = renderHpLiftHtml(item, colorKey);
      const rightEl = line.querySelector(".lift-right");
      if (rightEl) rightEl.outerHTML = rightHtml;
      else if (rightHtml) {
        const status = line.querySelector(".status-btns");
        if (status) status.insertAdjacentHTML("beforebegin", rightHtml);
        else line.insertAdjacentHTML("beforeend", rightHtml);
      }
    });
  });
}

compareHpInput.addEventListener("input", onCompareStatInput);
compareAtkInput.addEventListener("input", onCompareStatInput);
compareTurnsInput?.addEventListener("input", onCompareStatInput);
compareDrInput?.addEventListener("input", onCompareStatInput);

addSectionBtn.addEventListener("click", () => {
  openSectionDialog(null);
});

/* ---------- section dialog ---------- */

function openSectionDialog(sectionId) {
  editing.sectionId = sectionId;
  const section = sectionId ? findSection(sectionId) : null;
  sectionTitleInput.value = section ? section.title : "";
  sectionDialog.showModal();
  sectionTitleInput.focus();
}

sectionCancelBtn.addEventListener("click", () => sectionDialog.close());

sectionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = sectionTitleInput.value.trim();
  if (!title) return;

  if (editing.sectionId) {
    const section = findSection(editing.sectionId);
    if (section) section.title = title;
  } else {
    const section = createSection(title);
    section.items = [];
    state.sections.push(section);
  }
  save();
  render();
  sectionDialog.close();
});

/* ---------- item dialog ---------- */

function openItemDialog(sectionId, itemId) {
  editing.sectionId = sectionId;
  editing.itemId = itemId;

  const item = itemId ? findItem(sectionId, itemId) : null;
  document.getElementById("item-dialog-title").textContent = item
    ? "编辑文案"
    : "添加文案";
  itemTextInput.value = item ? item.text : "";

  colorEditorsEl.innerHTML = COLOR_KEYS.map((c) => {
    const data = item?.colors?.[c.key] || {
      enabled: false,
      value: "",
      status: STATUS.none,
    };
    return `
      <div class="color-editor ${data.enabled ? "" : "disabled"}" data-color="${c.key}">
        <label class="toggle">
          <input type="checkbox" class="color-enable" ${data.enabled ? "checked" : ""} />
          <span class="color-label ${c.key}">${c.label}</span>
        </label>
        <label class="field value-field">
          <span>数值（多个用逗号隔开，按文案里数字顺序替换并高亮）</span>
          <input type="text" class="color-value-input" maxlength="80" placeholder="例如：30% 或 30%,16%" value="${escapeHtml(
            data.value || ""
          )}" />
        </label>
      </div>
    `;
  }).join("");

  colorEditorsEl.querySelectorAll(".color-enable").forEach((cb) => {
    cb.addEventListener("change", () => {
      const editor = cb.closest(".color-editor");
      editor.classList.toggle("disabled", !cb.checked);
    });
  });

  itemDialog.showModal();
  itemTextInput.focus();
}

itemCancelBtn.addEventListener("click", () => itemDialog.close());

itemForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = itemTextInput.value.trim();
  if (!text) return;

  const colors = emptyColors();

  colorEditorsEl.querySelectorAll(".color-editor").forEach((editor) => {
    const key = editor.dataset.color;
    const enabled = editor.querySelector(".color-enable").checked;
    const value = editor.querySelector(".color-value-input").value.trim();
    const existing = editing.itemId
      ? findItem(editing.sectionId, editing.itemId)?.colors?.[key]
      : null;

    colors[key] = {
      enabled,
      value,
      status: existing?.status || STATUS.none,
    };
  });

  const section = findSection(editing.sectionId);
  if (!section) return;

  if (editing.itemId) {
    const item = findItem(editing.sectionId, editing.itemId);
    if (!item) return;
    item.text = text;
    item.colors = colors;
  } else {
    section.items.push({ id: uid(), text, colors });
  }

  save();
  render();
  itemDialog.close();
});

/* ---------- boot ---------- */

state = load();
render();

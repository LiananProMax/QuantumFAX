/**
 * Client performance metric store.
 *
 * Keeps bounded per-client summaries so the dashboard can inspect EasyClick
 * tick, image, template and network timings without mixing them into logs.
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data");
const STATE_FILE = path.join(DATA_DIR, "perfMetrics.json");
const DEFAULT_SUMMARY_LIMIT = parseInt(process.env.PERF_SUMMARY_LIMIT, 10) || 120;
const DEFAULT_SLOW_EVENT_LIMIT = parseInt(process.env.PERF_SLOW_EVENT_LIMIT, 10) || 100;
const DEFAULT_BATCH_LIMIT = parseInt(process.env.PERF_BATCH_LIMIT, 10) || 20;
const ANALYSIS_WINDOW = parseInt(process.env.PERF_ANALYSIS_WINDOW, 10) || 20;

const METRIC_LABELS = {
    tick: "主循环 tick",
    "health.emergency": "损控检测",
    "health.capture": "截图",
    "health.pixel": "像素检测",
    "health.damageTemplate": "损控模板匹配",
    "health.spaceTemplate": "在太空模板匹配",
    "fleet.schedule": "舰队上报调度",
    "fleet.http": "舰队上报 HTTP",
    "logs.schedule": "日志上报调度",
    "logs.http": "日志上报 HTTP"
};

const SEVERITY_RANK = {
    info: 1,
    warn: 2,
    critical: 3
};

let state = {
    clients: {},
    updatedAt: null
};

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function loadState() {
    ensureDataDir();
    try {
        if (fs.existsSync(STATE_FILE)) {
            const data = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
            state = {
                clients: data.clients || {},
                updatedAt: data.updatedAt || null
            };
        }
    } catch (err) {
        console.error("[PerfMetricStore] 加载失败:", err.message);
    }
}

function saveState() {
    ensureDataDir();
    try {
        state.updatedAt = new Date().toISOString();
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
        return true;
    } catch (err) {
        console.error("[PerfMetricStore] 保存失败:", err.message);
        return false;
    }
}

function normalizeText(value) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value).trim();
}

function normalizeTimestamp(value) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
    }
    return Date.now();
}

function normalizeNumber(value, fallback = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.max(0, Math.round(parsed));
}

function normalizeMetric(raw) {
    const name = normalizeText(raw.name);
    const count = normalizeNumber(raw.count);
    const totalMs = normalizeNumber(raw.totalMs);

    if (!name || count <= 0) {
        return null;
    }

    return {
        name,
        count,
        totalMs,
        avgMs: normalizeNumber(raw.avgMs, count > 0 ? totalMs / count : 0),
        maxMs: normalizeNumber(raw.maxMs),
        slowCount: normalizeNumber(raw.slowCount)
    };
}

function normalizeSlowEvent(raw) {
    const name = normalizeText(raw.name);
    const elapsedMs = normalizeNumber(raw.elapsedMs);

    if (!name || elapsedMs <= 0) {
        return null;
    }

    return {
        name,
        elapsedMs,
        detail: normalizeText(raw.detail).slice(0, 300),
        occurredAt: normalizeTimestamp(raw.occurredAt)
    };
}

function normalizeSummary(raw, common, index, receivedAt) {
    const metrics = Array.isArray(raw.metrics)
        ? raw.metrics.map((item) => normalizeMetric(item || {})).filter(Boolean)
        : [];
    const slowEvents = Array.isArray(raw.slowEvents)
        ? raw.slowEvents.map((item) => normalizeSlowEvent(item || {})).filter(Boolean)
        : [];

    if (metrics.length === 0 && slowEvents.length === 0) {
        return null;
    }

    return {
        id: `${receivedAt}-${index}`,
        clientId: common.clientId,
        shipType: common.shipType,
        shipName: common.shipName,
        collectedAt: normalizeTimestamp(raw.collectedAt),
        receivedAt,
        intervalMs: normalizeNumber(raw.intervalMs),
        metrics,
        slowEvents
    };
}

function append(raw) {
    const payload = raw || {};
    const clientId = normalizeText(payload.clientId);
    const summaries = Array.isArray(payload.summaries) ? payload.summaries.slice(0, DEFAULT_BATCH_LIMIT) : [];
    const receivedAt = Date.now();

    if (!clientId) {
        return { error: "缺少 clientId" };
    }
    if (summaries.length === 0) {
        return { error: "缺少 summaries" };
    }

    const common = {
        clientId,
        shipType: normalizeText(payload.shipType),
        shipName: normalizeText(payload.shipName)
    };
    const acceptedSummaries = summaries
        .map((item, index) => normalizeSummary(item || {}, common, index, receivedAt))
        .filter(Boolean);

    if (acceptedSummaries.length === 0) {
        return { error: "没有可保存的性能指标" };
    }

    const existing = state.clients[clientId] || {
        clientId,
        shipType: common.shipType,
        shipName: common.shipName,
        summaries: [],
        slowEvents: []
    };
    const slowEvents = acceptedSummaries.reduce((items, summary) => items.concat(summary.slowEvents), []);

    state.clients[clientId] = {
        clientId,
        shipType: common.shipType || existing.shipType,
        shipName: common.shipName || existing.shipName,
        updatedAt: receivedAt,
        latest: acceptedSummaries[acceptedSummaries.length - 1],
        summaries: existing.summaries.concat(acceptedSummaries).slice(-DEFAULT_SUMMARY_LIMIT),
        slowEvents: existing.slowEvents.concat(slowEvents).slice(-DEFAULT_SLOW_EVENT_LIMIT)
    };
    saveState();

    return {
        clientId,
        accepted: acceptedSummaries.length,
        total: state.clients[clientId].summaries.length
    };
}

function getClientPerf(clientId) {
    const key = normalizeText(clientId);
    const client = state.clients[key];

    if (!client) {
        return {
            clientId: key,
            latest: null,
            summaries: [],
            slowEvents: [],
            analysis: buildAnalysis(null),
            summaryLimit: DEFAULT_SUMMARY_LIMIT,
            slowEventLimit: DEFAULT_SLOW_EVENT_LIMIT
        };
    }

    return {
        ...client,
        summaries: client.summaries.slice().reverse(),
        slowEvents: client.slowEvents.slice().reverse(),
        analysis: buildAnalysis(client),
        summaryLimit: DEFAULT_SUMMARY_LIMIT,
        slowEventLimit: DEFAULT_SLOW_EVENT_LIMIT
    };
}

function getMetricLabel(name) {
    return METRIC_LABELS[name] || name;
}

function aggregateMetrics(summaries) {
    const byName = {};

    summaries.forEach((summary) => {
        (summary.metrics || []).forEach((metric) => {
            const item = byName[metric.name] || {
                name: metric.name,
                label: getMetricLabel(metric.name),
                count: 0,
                totalMs: 0,
                maxMs: 0,
                slowCount: 0
            };

            item.count += metric.count || 0;
            item.totalMs += metric.totalMs || 0;
            item.maxMs = Math.max(item.maxMs, metric.maxMs || 0);
            item.slowCount += metric.slowCount || 0;
            byName[metric.name] = item;
        });
    });

    return Object.keys(byName)
        .map((name) => {
            const item = byName[name];
            return {
                ...item,
                avgMs: item.count > 0 ? Math.round(item.totalMs / item.count) : 0
            };
        })
        .sort((a, b) => b.avgMs - a.avgMs);
}

function summarizeSlowEvents(events) {
    const byName = {};

    events.forEach((event) => {
        const item = byName[event.name] || {
            name: event.name,
            label: getMetricLabel(event.name),
            count: 0,
            maxMs: 0,
            latestAt: 0
        };

        item.count += 1;
        item.maxMs = Math.max(item.maxMs, event.elapsedMs || 0);
        item.latestAt = Math.max(item.latestAt, event.occurredAt || 0);
        byName[event.name] = item;
    });

    return Object.keys(byName)
        .map((name) => byName[name])
        .sort((a, b) => b.count - a.count || b.maxMs - a.maxMs)
        .slice(0, 6);
}

function addFinding(findings, severity, title, description, recommendation, metricNames) {
    findings.push({
        severity,
        title,
        description,
        recommendation,
        metricNames: metricNames || []
    });
}

function analyzeMetricRules(metrics, slowEventSummary) {
    const findings = [];
    const byName = {};

    metrics.forEach((metric) => {
        byName[metric.name] = metric;
    });

    const tick = byName.tick;
    if (tick && (tick.avgMs >= 1500 || tick.maxMs >= 3000)) {
        addFinding(
            findings,
            "critical",
            "主循环存在明显卡顿",
            `最近主循环平均 ${tick.avgMs}ms，最大 ${tick.maxMs}ms，可能影响损控响应速度。`,
            "优先查看截图、模板匹配和 HTTP 指标，先处理平均耗时最高或慢操作最多的环节。",
            ["tick"]
        );
    } else if (tick && (tick.avgMs >= 800 || tick.slowCount > 0)) {
        addFinding(
            findings,
            "warn",
            "主循环偶发变慢",
            `最近主循环平均 ${tick.avgMs}ms，慢操作 ${tick.slowCount} 次。`,
            "观察慢操作列表，如果集中在截图或网络请求，可继续降低对应频率或超时。",
            ["tick"]
        );
    }

    const capture = byName["health.capture"];
    if (capture && (capture.avgMs >= 500 || capture.maxMs >= 1200)) {
        addFinding(
            findings,
            "critical",
            "截图耗时是主要瓶颈",
            `截图平均 ${capture.avgMs}ms，最大 ${capture.maxMs}ms。`,
            "保持单 tick 只截图一次，并考虑降低检测频率、缩小检测区域或检查设备录屏/悬浮窗权限状态。",
            ["health.capture"]
        );
    } else if (capture && capture.avgMs >= 200) {
        addFinding(
            findings,
            "warn",
            "截图成本偏高",
            `截图平均 ${capture.avgMs}ms，已接近会拖慢 tick 的水平。`,
            "继续观察设备负载，必要时拉大 tick 间隔或把部分非关键检测降频。",
            ["health.capture"]
        );
    }

    const damageTemplate = byName["health.damageTemplate"];
    if (damageTemplate && (damageTemplate.avgMs >= 400 || damageTemplate.maxMs >= 1000)) {
        addFinding(
            findings,
            "warn",
            "损控模板匹配耗时偏高",
            `损控模板匹配平均 ${damageTemplate.avgMs}ms，最大 ${damageTemplate.maxMs}ms。`,
            "优先确认匹配区域是否足够小；如仍偏高，可只在血量明显下降时执行模板匹配。",
            ["health.damageTemplate"]
        );
    }

    const emergency = byName["health.emergency"];
    if (emergency && emergency.avgMs >= 1000) {
        addFinding(
            findings,
            "warn",
            "损控检测整体耗时偏高",
            `损控检测整体平均 ${emergency.avgMs}ms。`,
            "结合截图、像素检测和模板匹配指标定位具体环节，避免在同一 tick 内叠加多个高成本动作。",
            ["health.emergency"]
        );
    }

    ["fleet.http", "logs.http"].forEach((name) => {
        const metric = byName[name];
        if (!metric) {
            return;
        }
        if (metric.avgMs >= 3000 || metric.maxMs >= 5000) {
            addFinding(
                findings,
                "critical",
                `${getMetricLabel(name)} 网络耗时过高`,
                `${getMetricLabel(name)} 平均 ${metric.avgMs}ms，最大 ${metric.maxMs}ms。`,
                "检查客户端到后端的局域网质量和后端负载；必要时继续降低上报频率或缩短 HTTP timeout。",
                [name]
            );
        } else if (metric.avgMs >= 1000) {
            addFinding(
                findings,
                "warn",
                `${getMetricLabel(name)} 偏慢`,
                `${getMetricLabel(name)} 平均 ${metric.avgMs}ms。`,
                "后台上报已避免阻塞 tick，但仍建议检查网络稳定性，避免队列长期堆积。",
                [name]
            );
        }
    });

    if (slowEventSummary.length > 0 && slowEventSummary[0].count >= 3) {
        addFinding(
            findings,
            "warn",
            "慢操作集中出现",
            `最近慢操作主要集中在 ${slowEventSummary[0].label}，共 ${slowEventSummary[0].count} 次。`,
            "优先处理出现次数最多的慢操作，它通常比单次最大耗时更影响长期体验。",
            [slowEventSummary[0].name]
        );
    }

    return findings
        .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity])
        .slice(0, 8);
}

function getAnalysisStatus(findings) {
    if (findings.some((item) => item.severity === "critical")) {
        return "critical";
    }
    if (findings.some((item) => item.severity === "warn")) {
        return "warn";
    }
    return "good";
}

function getAnalysisHeadline(status, metrics) {
    if (status === "critical") {
        return "发现会明显影响客户端响应速度的性能瓶颈";
    }
    if (status === "warn") {
        return "发现若干性能风险，建议继续观察并按建议优化";
    }
    if (metrics.length === 0) {
        return "暂无足够性能数据，等待客户端上报";
    }
    return "近期性能表现正常，未发现明显瓶颈";
}

function buildAnalysis(client) {
    if (!client || !Array.isArray(client.summaries) || client.summaries.length === 0) {
        return {
            status: "insufficient",
            headline: "暂无足够性能数据，等待客户端上报",
            generatedAt: Date.now(),
            windowSize: 0,
            metricSummary: [],
            bottlenecks: [],
            slowEventSummary: [],
            findings: []
        };
    }

    const summaries = client.summaries.slice(-ANALYSIS_WINDOW);
    const metrics = aggregateMetrics(summaries);
    const slowEventSummary = summarizeSlowEvents((client.slowEvents || []).slice(-DEFAULT_SLOW_EVENT_LIMIT));
    const findings = analyzeMetricRules(metrics, slowEventSummary);
    const status = getAnalysisStatus(findings);

    return {
        status,
        headline: getAnalysisHeadline(status, metrics),
        generatedAt: Date.now(),
        windowSize: summaries.length,
        metricSummary: metrics,
        bottlenecks: metrics
            .filter((metric) => metric.avgMs > 0)
            .slice(0, 6),
        slowEventSummary,
        findings
    };
}

loadState();

module.exports = {
    append,
    getClientPerf,
    summaryLimit: DEFAULT_SUMMARY_LIMIT,
    slowEventLimit: DEFAULT_SLOW_EVENT_LIMIT
};

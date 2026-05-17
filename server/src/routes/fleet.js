const express = require("express");

const clientLogStore = require("../store/clientLogStore");
const fleetStore = require("../store/fleetStore");

const router = express.Router();

router.get("/ship-types", (req, res) => {
    res.json({
        success: true,
        shipTypes: fleetStore.getAllowedShipTypes()
    });
});

router.post("/report", (req, res) => {
    const result = fleetStore.report(req.body || {});
    if (result.error) {
        return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
        success: true,
        ship: result.ship
    });
});

router.post("/logs", (req, res) => {
    const result = clientLogStore.append(req.body || {});
    if (result.error) {
        return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
        success: true,
        clientId: result.clientId,
        accepted: result.accepted,
        total: result.total
    });
});

router.get("/ships", (req, res) => {
    res.json({
        success: true,
        now: Date.now(),
        offlineTimeoutMs: fleetStore.offlineTimeoutMs,
        ships: fleetStore.getShips()
    });
});

router.get("/summary", (req, res) => {
    res.json({
        success: true,
        now: Date.now(),
        summary: fleetStore.getSummary()
    });
});

router.get("/ships/:clientId/logs", (req, res) => {
    res.json({
        success: true,
        clientId: req.params.clientId,
        logLimit: clientLogStore.logLimit,
        logs: clientLogStore.getLogs(req.params.clientId, {
            limit: req.query.limit
        })
    });
});

router.get("/ships/:clientId/history", (req, res) => {
    res.json({
        success: true,
        clientId: req.params.clientId,
        history: fleetStore.getHistory(req.params.clientId)
    });
});

module.exports = router;

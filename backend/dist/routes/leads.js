"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Lead_1 = __importDefault(require("../models/Lead"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const requireAdmin = (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Not authorized" });
    }
    if (user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
};
router.use(auth_1.protect);
router.post("/", requireAdmin, async (req, res) => {
    try {
        const { name, email, status, source } = req.body;
        const user = req.user;
        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }
        const lead = await Lead_1.default.create({
            name,
            email,
            status: status || "New",
            source: source || "Website",
            owner: user.id,
        });
        return res.status(201).json(lead);
    }
    catch {
        return res.status(500).json({ message: "Server error" });
    }
});
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page || "1", 10);
        const limit = parseInt(req.query.limit || "10", 10);
        const status = req.query.status;
        const source = req.query.source;
        const search = req.query.search;
        const sort = req.query.sort || "latest";
        const filter = {};
        if (status)
            filter.status = status;
        if (source)
            filter.source = source;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        const sortOrder = sort === "oldest" ? 1 : -1;
        const total = await Lead_1.default.countDocuments(filter);
        const leads = await Lead_1.default.find(filter)
            .sort({ createdAt: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit);
        return res.json({
            data: leads,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch {
        return res.status(500).json({ message: "Server error" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const lead = await Lead_1.default.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }
        return res.json(lead);
    }
    catch {
        return res.status(500).json({ message: "Server error" });
    }
});
router.put("/:id", requireAdmin, async (req, res) => {
    try {
        const lead = await Lead_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }
        return res.json(lead);
    }
    catch {
        return res.status(500).json({ message: "Server error" });
    }
});
router.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const lead = await Lead_1.default.findByIdAndDelete(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }
        return res.json({ message: "Lead deleted successfully" });
    }
    catch {
        return res.status(500).json({ message: "Server error" });
    }
});
router.get("/export/csv", requireAdmin, async (req, res) => {
    try {
        const leads = await Lead_1.default.find({});
        const headers = ["Name", "Email", "Status", "Source", "Created At"];
        const rows = leads.map((lead) => [
            lead.name,
            lead.email,
            lead.status,
            lead.source,
            lead.createdAt.toISOString(),
        ]);
        const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
        res.header("Content-Type", "text/csv");
        res.attachment("leads.csv");
        return res.send(csv);
    }
    catch {
        return res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;

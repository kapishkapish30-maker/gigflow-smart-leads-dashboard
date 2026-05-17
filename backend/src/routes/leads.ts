import { Router, Request, Response } from "express";
import Lead from "../models/Lead";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);

router.post("/", authorizeRoles("admin"), async (req: Request, res: Response) => {
  try {
    const { name, email, status, source } = req.body;
    const user = (req as any).user;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const lead = await Lead.create({
      name,
      email,
      status: status || "New",
      source: source || "Website",
      owner: user.id,
    });

    return res.status(201).json(lead);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const status = req.query.status as string;
    const source = req.query.source as string;
    const search = req.query.search as string;
    const sort = (req.query.sort as string) || "latest";

    const filter: any = {};

    if (status) filter.status = status;
    if (source) filter.source = source;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const sortOrder = sort === "oldest" ? 1 : -1;

    const total = await Lead.countDocuments(filter);

    const leads = await Lead.find(filter)
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
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    return res.json(lead);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.json(lead);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/export/csv", authorizeRoles("admin"), async (req: Request, res: Response) => {
  try {
    const leads = await Lead.find({});

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
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
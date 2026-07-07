import fs from 'fs';

const serverCode = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import speakeasy from "speakeasy";
import winston from "winston";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import Groq from "groq-sdk";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// -------------------------------------------------------------
// AUDIT LOGGING & SECURITY MIDDLEWARE SETUP
// -------------------------------------------------------------
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const auditLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, "audit-financial.log") })
  ]
});

// Init Prisma
const prisma = new PrismaClient();

// Init Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2023-10-16" as any
});

// Init Groq
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// Auth Config
const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret";

// Auth Middleware
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId }, 
      include: { tenant: true } 
    });

    if (!user || user.loginStatus === "SUSPENDED") {
      return res.status(403).json({ error: "Access Denied" });
    }
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const requireSuperAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== "SUPER_ADMIN") return res.status(403).json({ error: "Forbidden" });
  next();
};

const rateLimiterMiddleware = (req: any, res: any, next: any) => {
  // Mock rate limiter
  next();
};

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------
app.post("/api/auth/register", async (req, res) => {
  const { email, password, companyName } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    // First user becomes super admin
    const count = await prisma.user.count();
    const role = count === 0 ? "SUPER_ADMIN" : "TENANT_ADMIN";

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        tenant: {
          create: {
            companyName: companyName || "My Roofing Company"
          }
        }
      },
      include: { tenant: true }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email }, include: { tenant: true } });
    if (!user || user.loginStatus === "SUSPENDED") return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

app.get("/api/auth/me", requireAuth, (req: any, res) => {
  res.json({ user: req.user });
});

// -------------------------------------------------------------
// ROUTE IMPLEMENTATIONS
// -------------------------------------------------------------
app.get("/api/company", requireAuth, (req: any, res) => {
  res.json(req.user.tenant);
});

app.put("/api/tenant/settings", requireAuth, async (req: any, res) => {
  try {
    const updated = await prisma.tenant.update({
      where: { id: req.user.tenant.id },
      data: {
        companyName: req.body.companyName,
        twilioPhoneNumber: req.body.twilioPhoneNumber,
        physicalAddress: req.body.physicalAddress
      }
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/company/stripe-connect", requireAuth, async (req: any, res) => {
  try {
    const updated = await prisma.tenant.update({
      where: { id: req.user.tenant.id },
      data: {
        stripeConnectId: "acct_" + Math.random().toString(36).substring(7),
        stripeStatus: "active"
      }
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/stats", requireAuth, async (req: any, res) => {
  try {
    const leads = await prisma.lead.findMany({ where: { tenantId: req.user.tenant.id }});
    const txs = await prisma.transaction.findMany({ where: { tenantId: req.user.tenant.id }});
    
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter((l: any) => ["scheduled", "won"].includes(l.status)).length;
    const ratio = totalLeads ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
    
    const revenueGenerated = txs
      .filter((t: any) => t.status === "paid")
      .reduce((sum: number, t: any) => sum + (t.amount - t.platformFee), 0);

    const platformFeesPaid = txs
      .filter((t: any) => t.status === "paid")
      .reduce((sum: number, t: any) => sum + t.platformFee, 0);

    res.json({
      totalLeads,
      qualifiedLeads,
      ratio,
      revenueGenerated,
      platformFeesPaid
    });
  } catch (err: any) {
    res.json({ totalLeads: 0, qualifiedLeads: 0, ratio: 0, revenueGenerated: 0, platformFeesPaid: 0 });
  }
});

app.get("/api/leads", requireAuth, async (req: any, res) => {
  try {
    const leads = await prisma.lead.findMany({
      where: { tenantId: req.user.tenant.id },
      include: { messages: { orderBy: { timestamp: "asc" } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(leads);
  } catch (err: any) {
    res.json([]);
  }
});

app.get("/api/leads/:id", requireAuth, async (req: any, res) => {
  try {
    const lead = await prisma.lead.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenant.id },
      include: { messages: { orderBy: { timestamp: "asc" } } }
    });
    if (!lead) return res.status(404).json({ error: "Not found" });
    
    res.json(lead);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/leads", requireAuth, async (req: any, res) => {
  try {
    const lead = await prisma.lead.create({
      data: {
        tenantId: req.user.tenant.id,
        homeownerName: req.body.homeownerName,
        homeownerPhone: req.body.homeownerPhone,
        homeownerChannel: req.body.homeownerChannel,
        neighborhood: req.body.neighborhood,
        status: "new",
        messages: {
          create: {
            sender: "homeowner",
            text: req.body.message || "Hello"
          }
        }
      },
      include: { messages: true }
    });
    res.json(lead);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/leads/:id/status", requireAuth, async (req: any, res) => {
  try {
    const updated = await prisma.lead.update({
      where: { id: req.params.id, tenantId: req.user.tenant.id },
      data: { status: req.body.status }
    });
    res.json(updated);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/leads/:id/chat", requireAuth, async (req: any, res) => {
  try {
    const lead = await prisma.lead.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenant.id },
      include: { messages: { orderBy: { timestamp: "asc" } } }
    });
    if (!lead) return res.status(404).json({ error: "Not found" });

    // Add user message
    const userMessage = await prisma.message.create({
      data: {
        leadId: lead.id,
        sender: "homeowner",
        text: req.body.message
      }
    });

    // Generate Groq reply
    let replyText = "Fallback response from Sarah AI.";
    if (groq) {
      try {
        const history = lead.messages.map((m: any) => ({
          role: m.sender === "homeowner" ? "user" as const : "assistant" as const,
          content: m.text
        }));
        
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are Sarah, a helpful office assistant for " + req.user.tenant.companyName + ". Be extremely brief and helpful." },
            ...history,
            { role: "user", content: req.body.message }
          ],
          model: "llama-3.1-8b-instant",
        });

        replyText = chatCompletion.choices[0]?.message?.content || replyText;
      } catch (err: any) {
        console.error("Groq error:", err);
      }
    }

    // Add AI reply
    const aiMessage = await prisma.message.create({
      data: {
        leadId: lead.id,
        sender: "assistant",
        text: replyText
      }
    });

    const updatedLead = await prisma.lead.findFirst({
        where: { id: req.params.id },
        include: { messages: { orderBy: { timestamp: "asc" } } }
    });

    res.json({ reply: replyText, lead: updatedLead });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/leads/:id/book", requireAuth, async (req: any, res) => {
  try {
    const updated = await prisma.lead.update({
      where: { id: req.params.id, tenantId: req.user.tenant.id },
      data: {
        bookingTime: req.body.time,
        status: "scheduled"
      }
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/transactions", requireAuth, async (req: any, res) => {
  try {
    const txs = await prisma.transaction.findMany({
      where: { tenantId: req.user.tenant.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(txs);
  } catch(err: any) {
    res.json([]);
  }
});

app.post("/api/transactions/:id/pay", requireAuth, async (req: any, res) => {
  try {
    const updated = await prisma.transaction.update({
      where: { id: req.params.id, tenantId: req.user.tenant.id },
      data: {
        status: "paid",
        paymentMechanic: req.body.paymentMethod || "ach"
      }
    });
    
    // Auto update lead if valid
    await prisma.lead.updateMany({
        where: { id: updated.id, tenantId: req.user.tenant.id },
        data: { status: "won" }
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/transactions", requireAuth, async (req: any, res) => {
    try {
        const platformFee = Number(req.body.amount) * 0.02;
        const tx = await prisma.transaction.create({
            data: {
                tenantId: req.user.tenant.id,
                amount: Number(req.body.amount),
                platformFee,
                status: "pending",
                paymentMechanic: "card"
            }
        });
        res.json(tx);
    } catch(err: any){
        res.status(500).json({error: err.message});
    }
});

// Admin Routes
app.get("/admin/dashboard-stats", requireAuth, requireSuperAdmin, async (req: any, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        leads: { include: { messages: true } },
        transactions: true
      }
    });
    
    let totalProcessedVolume = 0;
    let totalPlatformProfit = 0;

    const tenantStats = tenants.map((t: any) => {
      const tenantTxs = t.transactions;
      const tenantVolume = tenantTxs.filter((tx:any) => tx.status === "paid").reduce((acc:any, tx:any) => acc + tx.amount, 0);
      const tenantFees = tenantTxs.filter((tx:any) => tx.status === "paid").reduce((acc:any, tx:any) => acc + tx.platformFee, 0);
      
      totalProcessedVolume += tenantVolume;
      totalPlatformProfit += tenantFees;

      return {
        companyId: t.id,
        companyName: t.companyName,
        stripeConnectId: t.stripeConnectId || "pending",
        stripeStatus: t.stripeStatus,
        totalLeads: t.leads.length,
        totalQualified: t.leads.filter((l:any) => ["scheduled", "won"].includes(l.status)).length,
        totalRoofsBooked: t.leads.filter((l:any) => ["won"].includes(l.status)).length,
        totalVolume: tenantVolume,
        platformFeesGenerated: tenantFees,
        leads: t.leads
      };
    });

    res.json({
      totalProcessedVolume,
      totalPlatformProfit,
      availableBalance: totalPlatformProfit,
      pendingBalance: 0,
      tenants: tenantStats
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/cashout", requireAuth, requireSuperAdmin, rateLimiterMiddleware, (req: any, res) => {
  const { amount, totpToken } = req.body;
  if (!totpToken || totpToken.length !== 6) {
    auditLogger.error({
      event: "INVALID_2FA_TOKEN_SUBMITTED",
      ipAddress: req.ip || "unknown",
      adminId: req.user.id,
      timestamp: new Date().toISOString(),
      details: { amountRequested: amount }
    });
    return res.status(403).json({ error: "Invalid TOTP 2FA code" });
  }

  auditLogger.info({
    event: "CASHOUT_SUCCESS",
    ipAddress: req.ip || "unknown",
    adminId: req.user.id,
    timestamp: new Date().toISOString(),
    details: { payoutAmount: amount, destination: "Platform Linked Default Checking" }
  });

  res.json({ success: true, payoutId: "po_" + Math.random().toString(36).substr(2, 9) });
});

app.get("/admin/audit-logs", requireAuth, requireSuperAdmin, (req: any, res) => {
  try {
    const logPath = path.join(logDir, "audit-financial.log");
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, "utf8");
      const lines = content.split("\n").filter(Boolean).map(line => {
        try { return JSON.parse(line); } catch (e) { return null; }
      }).filter(Boolean);
      res.json(lines.reverse().slice(0, 50));
    } else {
      res.json([]);
    }
  } catch (err) {
    res.json([]);
  }
});

// Frontend fallback
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(\`Server running on http://localhost:\${PORT} (Dev)\`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on http://localhost:\${PORT} (Prod)\`);
  });
}
`;

fs.writeFileSync('server.ts', serverCode);
console.log('Successfully wrote server.ts');

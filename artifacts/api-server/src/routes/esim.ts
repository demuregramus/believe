import { Router, type IRouter } from "express";
import {
  getCatalogue,
  getCatalogueBundle,
  placeOrder,
  getTransaction,
  getTransactionEsims,
  getAccountBalance,
  getZones,
} from "../lib/limitflex";

const router: IRouter = Router();

// ── Catalogue ────────────────────────────────────────────────────────────────

// GET /esim/catalogue?unlimited=&region=&countriesIso=&page=&pageSize=
router.get("/esim/catalogue", async (req, res): Promise<void> => {
  try {
    const { unlimited, region, countriesIso, page, pageSize } =
      req.query as Record<string, string>;
    const data = await getCatalogue({
      unlimited: unlimited !== undefined ? unlimited === "true" : undefined,
      region: region || undefined,
      countriesIso: countriesIso || undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Error fetching eSIM catalogue");
    res.status(500).json({ error: "Failed to fetch eSIM catalogue" });
  }
});

// GET /esim/catalogue/:id
router.get("/esim/catalogue/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid catalogue ID" });
      return;
    }
    const data = await getCatalogueBundle(id);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Error fetching eSIM bundle");
    res.status(500).json({ error: "Failed to fetch eSIM bundle" });
  }
});

// ── Orders ────────────────────────────────────────────────────────────────────

// POST /esim/orders — places order via POST /order, returns transaction
router.post("/esim/orders", async (req, res): Promise<void> => {
  const { productId, quantity } = req.body as {
    productId?: number;
    quantity?: number;
  };
  if (!productId || isNaN(Number(productId))) {
    res.status(400).json({ error: "productId is required" });
    return;
  }
  try {
    const referenceCode = crypto.randomUUID();
    const transaction = await placeOrder({
      productId: Number(productId),
      quantity: quantity ?? 1,
      referenceCode,
    });
    res.status(201).json(transaction);
  } catch (err) {
    req.log.error({ err }, "Error placing eSIM order");
    res.status(500).json({ error: "Failed to place eSIM order" });
  }
});

// ── Transactions ──────────────────────────────────────────────────────────────

// GET /esim/transactions/:id — poll transaction status
router.get("/esim/transactions/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid transaction ID" });
      return;
    }
    const transaction = await getTransaction(id);
    res.json(transaction);
  } catch (err) {
    req.log.error({ err }, "Error fetching transaction");
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

// GET /esim/transactions/:id/esims — get eSIM activation codes once SUCCESSFUL
router.get("/esim/transactions/:id/esims", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid transaction ID" });
      return;
    }
    const esims = await getTransactionEsims(id);
    res.json(esims);
  } catch (err) {
    req.log.error({ err }, "Error fetching eSIMs for transaction");
    res.status(500).json({ error: "Failed to fetch eSIM details" });
  }
});

// ── Account ───────────────────────────────────────────────────────────────────

// GET /esim/balance
router.get("/esim/balance", async (req, res): Promise<void> => {
  try {
    const balance = await getAccountBalance();
    res.json(balance);
  } catch (err) {
    req.log.error({ err }, "Error fetching account balance");
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

// ── Zones ─────────────────────────────────────────────────────────────────────

// GET /esim/zones
router.get("/esim/zones", async (req, res): Promise<void> => {
  try {
    const zones = await getZones();
    res.json(zones);
  } catch (err) {
    req.log.error({ err }, "Error fetching zones");
    res.status(500).json({ error: "Failed to fetch zones" });
  }
});

export default router;

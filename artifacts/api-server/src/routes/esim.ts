import { Router, type IRouter } from "express";
import { getCatalogue, getCatalogueBundle, placeOrder, getOrder } from "../lib/limitflex";

const router: IRouter = Router();

// GET /esim/catalogue
// Query: unlimited, region, countriesIso, page, pageSize
router.get("/esim/catalogue", async (req, res): Promise<void> => {
  try {
    const { unlimited, region, countriesIso, page, pageSize } = req.query as Record<string, string>;
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

// POST /esim/orders
// Body: { productId: number, quantity?: number }
router.post("/esim/orders", async (req, res): Promise<void> => {
  const { productId, quantity } = req.body as { productId?: number; quantity?: number };
  if (!productId || isNaN(Number(productId))) {
    res.status(400).json({ error: "productId is required" });
    return;
  }

  try {
    const referenceCode = crypto.randomUUID();
    const order = await placeOrder({
      productId: Number(productId),
      quantity: quantity ?? 1,
      referenceCode,
    });
    res.status(201).json(order);
  } catch (err) {
    req.log.error({ err }, "Error placing eSIM order");
    res.status(500).json({ error: "Failed to place eSIM order" });
  }
});

// GET /esim/orders/:id
router.get("/esim/orders/:id", async (req, res): Promise<void> => {
  try {
    const order = await getOrder(req.params.id);
    res.json(order);
  } catch (err) {
    req.log.error({ err }, "Error fetching eSIM order");
    res.status(500).json({ error: "Failed to fetch eSIM order" });
  }
});

export default router;

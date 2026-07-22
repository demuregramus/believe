import { Router, type IRouter } from "express";

const router: IRouter = Router();

const PLANS = [
  {
    id: "talk-text",
    name: "Talk & Text Only",
    price: "$4.99",
    billingCycle: "Billed $9.98 every 2 months",
    description: "Cheapest plan for voice & messaging. Unlimited talk & text with NO cellular data.",
    features: [
      "Unlimited talk & text nationwide",
      "No cellular data included (0 Data)",
      "Billed $9.98 every 2 months ($4.99/mo)",
      "Free local US phone number",
      "Wi-Fi calling & web messaging portal",
      "Compatible with any cell phone",
    ],
    highlight: false,
    badge: "Cheapest Plan",
  },
  {
    id: "basic",
    name: "Basic 5G (1GB)",
    price: "$9.99",
    billingCycle: "Billed $19.98 every 2 months",
    description: "Light data plan with 1GB full-speed 5G data plus unlimited talk & text.",
    features: [
      "1GB full-speed 5G data per month",
      "Unlimited talk & text nationwide",
      "Billed $19.98 every 2 months ($9.99/mo)",
      "Wi-Fi calling & web messaging",
      "Instant eSIM QR Code download",
    ],
    highlight: false,
    badge: null,
  },
  {
    id: "starter",
    name: "Starter 5G (5GB)",
    price: "$14.99",
    billingCycle: "Billed $29.98 every 2 months",
    description: "5GB of high-speed 5G data for regular browsing, maps, and messaging.",
    features: [
      "5GB full-speed 5G data per month",
      "Unlimited talk & text nationwide",
      "Billed $29.98 every 2 months ($14.99/mo)",
      "Mobile hotspot included",
      "Instant eSIM QR Code download",
    ],
    highlight: false,
    badge: null,
  },
  {
    id: "unlimited",
    name: "Unlimited 5G",
    price: "$19.99",
    billingCycle: "Billed $39.98 every 2 months",
    description: "Truly unlimited nationwide 5G data, talk, text & mobile hotspot.",
    features: [
      "Unlimited full-speed 5G & 4G LTE data",
      "Unlimited talk & text nationwide",
      "Billed $39.98 every 2 months ($19.99/mo)",
      "Unlimited mobile hotspot included",
      "Priority 5G network access",
    ],
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "global-ultra",
    name: "Global Ultra 5G",
    price: "$29.99",
    billingCycle: "Billed $59.98 every 2 months",
    description: "Unlimited nationwide 5G data PLUS international roaming in 150+ countries.",
    features: [
      "Unlimited 5G data in US & Canada",
      "International roaming in 150+ countries",
      "Billed $59.98 every 2 months ($29.99/mo)",
      "Unlimited talk, text & mobile hotspot",
      "VIP customer support",
    ],
    highlight: false,
    badge: "Ultimate Travel",
  },
];

router.get("/plans", async (_req, res): Promise<void> => {
  res.json(PLANS);
});

export default router;

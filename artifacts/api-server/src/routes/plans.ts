import { Router, type IRouter } from "express";

const router: IRouter = Router();

const PLANS = [
  {
    id: "free-flex",
    name: "Free Flex (TextNow Match)",
    price: "$0",
    billingCycle: "$0.00 Forever Free",
    description: "100% Free local US phone number with unlimited Wi-Fi calling & web messaging. Zero credit card required.",
    features: [
      "100% Free local US phone number",
      "Unlimited Wi-Fi calling & texting",
      "Free web messaging portal access",
      "Essential app access (Maps, Email, Rideshare)",
      "+$1.99 One-time SIM installation fee",
      "+$0.99 Lowest state sales tax (2.5%)",
    ],
    highlight: false,
    badge: "100% Free ($0)",
  },
  {
    id: "talk-text",
    name: "Talk & Text Only",
    price: "$4.99",
    billingCycle: "Billed $9.98 every 2 months",
    description: "Nationwide cellular talk & text with NO Wi-Fi required and NO data limits.",
    features: [
      "Unlimited nationwide talk & text (cellular network)",
      "No cellular data (0 Data cap)",
      "Billed $9.98 every 2 months ($4.99/mo equivalent)",
      "+$1.99 One-time SIM installation fee",
      "+$0.99 Lowest state sales tax (2.5%)",
      "Free local US phone number included",
    ],
    highlight: false,
    badge: "TextNow Price Match",
  },
  {
    id: "basic",
    name: "Basic 5G (2GB)",
    price: "$9.99",
    billingCycle: "Billed $19.98 every 2 months",
    description: "Everyday 5G data plan with 2GB full-speed data plus unlimited talk & text.",
    features: [
      "2GB full-speed 5G data per month",
      "Unlimited talk & text nationwide",
      "Billed $19.98 every 2 months ($9.99/mo equivalent)",
      "+$1.99 One-time SIM installation fee",
      "+$0.99 Lowest state sales tax (2.5%)",
      "Instant 1-tap eSIM activation",
    ],
    highlight: false,
    badge: "TextNow Price Match",
  },
  {
    id: "unlimited",
    name: "Unlimited 5G",
    price: "$19.99",
    billingCycle: "Billed $39.98 every 2 months",
    description: "Flagship unlimited plan. Truly unlimited 5G data, talk, text & mobile hotspot.",
    features: [
      "Unlimited full-speed 5G & 4G LTE data",
      "Unlimited talk & text nationwide",
      "Billed $39.98 every 2 months ($19.99/mo equivalent)",
      "Unlimited mobile hotspot included",
      "+$1.99 One-time SIM installation fee",
      "+$0.99 Lowest state sales tax (2.5%)",
    ],
    highlight: true,
    badge: "🔥 Most Popular",
  },
  {
    id: "global-ultra",
    name: "Global Ultra 5G",
    price: "$29.99",
    billingCycle: "Billed $59.98 every 2 months",
    description: "Unlimited 5G data in US & Canada PLUS international roaming in 150+ countries.",
    features: [
      "Unlimited 5G data in US & Canada",
      "International roaming in 150+ countries",
      "Billed $59.98 every 2 months ($29.99/mo equivalent)",
      "+$1.99 One-time SIM installation fee",
      "+$0.99 Lowest state sales tax (2.5%)",
      "VIP customer support",
    ],
    highlight: false,
    badge: "Ultimate Travel Pass",
  },
];

router.get("/plans", async (_req, res): Promise<void> => {
  res.json(PLANS);
});

export default router;

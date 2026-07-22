import { Router, type IRouter } from "express";

const router: IRouter = Router();

const PLANS = [
  {
    id: "free",
    name: "Free Flex",
    price: "$0",
    description: "Unlimited talk & text over Wi-Fi plus free data for select apps. No contract, no credit card.",
    features: [
      "Free local phone number",
      "Unlimited talk & text over Wi-Fi",
      "Free data for select apps",
      "Free eSIM available",
      "No credit card required",
      "Nationwide 5G coverage",
    ],
    highlight: false,
    badge: null,
  },
  {
    id: "basic",
    name: "Basic 5G",
    price: "$9.99",
    description: "2GB of full-speed 5G data for everyday use, with unlimited talk & text.",
    features: [
      "Everything in Free Flex",
      "2GB full-speed 5G data",
      "Unlimited talk & text",
      "Wi-Fi calling",
      "Mobile hotspot included",
      "No annual contract",
    ],
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "unlimited",
    name: "Unlimited 5G",
    price: "$19.99",
    description: "Truly unlimited 5G data, talk & text with no speed throttling after a cap.",
    features: [
      "Everything in Basic 5G",
      "Unlimited full-speed 5G data",
      "Unlimited hotspot",
      "International texting",
      "Priority network access",
      "Multi-line discounts available",
    ],
    highlight: false,
    badge: "Best Value",
  },
];

router.get("/plans", async (_req, res): Promise<void> => {
  res.json(PLANS);
});

export default router;

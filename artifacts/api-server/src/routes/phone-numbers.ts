import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { claimedNumbersTable } from "@workspace/db";
import { searchAvailableNumbers, provisionPhoneNumber } from "../lib/signalwire";
import {
  ListAvailableNumbersQueryParams,
  ClaimPhoneNumberBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/phone-numbers/available", async (req, res): Promise<void> => {
  const parsed = ListAvailableNumbersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const numbers = await searchAvailableNumbers({
      areaCode: parsed.data.areaCode,
      contains: parsed.data.contains,
    });

    const response = numbers.map((n) => ({
      phoneNumber: n.phone_number,
      friendlyName: n.friendly_name,
      region: n.region ?? "",
      rateCenter: n.rate_center ?? "",
      monthlyFee: "$0.00",
    }));

    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Error fetching available numbers");
    res.status(500).json({ error: "Failed to fetch available numbers from SignalWire" });
  }
});

router.post("/phone-numbers/claim", async (req, res): Promise<void> => {
  const parsed = ClaimPhoneNumberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const provisioned = await provisionPhoneNumber(parsed.data.phoneNumber);

    const [claimed] = await db
      .insert(claimedNumbersTable)
      .values({
        sid: provisioned.sid,
        phoneNumber: provisioned.phone_number,
        friendlyName: provisioned.friendly_name,
        userEmail: parsed.data.userEmail ?? null,
        userName: parsed.data.userName ?? null,
        status: "active",
      })
      .returning();

    res.status(201).json({
      sid: claimed.sid,
      phoneNumber: claimed.phoneNumber,
      friendlyName: claimed.friendlyName,
      status: claimed.status,
      claimedAt: claimed.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error claiming phone number");
    res.status(500).json({ error: "Failed to provision phone number" });
  }
});

export default router;

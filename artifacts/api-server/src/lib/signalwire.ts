import { logger } from "./logger";

const PROJECT_ID = process.env.SIGNALWIRE_PROJECT_ID || "dce9fe57-7237-4a59-9521-1cabbd77fc27";
const API_TOKEN = process.env.SIGNALWIRE_API_TOKEN || "PTbd6bce7da6e0bab1960ee4a260d925be22af2ba817d4fc57";
const SPACE_URL = process.env.SIGNALWIRE_SPACE_URL || "demuregram.signalwire.com";

const BASE_URL = `https://${SPACE_URL}/api/laml/2010-04-01/Accounts/${PROJECT_ID}`;

function authHeader(): string {
  return "Basic " + Buffer.from(`${PROJECT_ID}:${API_TOKEN}`).toString("base64");
}

export interface SignalWireAvailableNumber {
  phone_number: string;
  friendly_name: string;
  region: string;
  rate_center: string;
  lata?: string;
  latitude?: string;
  longitude?: string;
}

export interface SignalWireMessage {
  sid: string;
  from: string;
  to: string;
  body: string;
  direction: string;
  status: string;
  date_created: string;
}

export interface SignalWireCall {
  sid: string;
  from: string;
  to: string;
  status: string;
  duration?: string;
  date_created: string;
}

export interface SignalWireIncomingNumber {
  sid: string;
  phone_number: string;
  friendly_name: string;
  status: string;
  date_created: string;
}

export async function searchAvailableNumbers(params: {
  areaCode?: string;
  contains?: string;
}): Promise<SignalWireAvailableNumber[]> {
  const url = new URL(`${BASE_URL}/AvailablePhoneNumbers/US/Local.json`);
  if (params.areaCode) url.searchParams.set("AreaCode", params.areaCode);
  if (params.contains) url.searchParams.set("Contains", params.contains);
  url.searchParams.set("PageSize", "20");

  const res = await fetch(url.toString(), {
    headers: { Authorization: authHeader(), Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ status: res.status, body: text }, "SignalWire available numbers error");
    throw new Error(`SignalWire error: ${res.status}`);
  }

  const data = (await res.json()) as { available_phone_numbers: SignalWireAvailableNumber[] };
  return data.available_phone_numbers ?? [];
}

export async function provisionPhoneNumber(phoneNumber: string): Promise<SignalWireIncomingNumber> {
  const body = new URLSearchParams({ PhoneNumber: phoneNumber });
  const res = await fetch(`${BASE_URL}/IncomingPhoneNumbers.json`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ status: res.status, body: text }, "SignalWire provision number error");
    throw new Error(`SignalWire error provisioning number: ${res.status}`);
  }

  return (await res.json()) as SignalWireIncomingNumber;
}

export async function getExistingNumber(
  phoneNumber: string
): Promise<SignalWireIncomingNumber | null> {
  const url = new URL(`${BASE_URL}/IncomingPhoneNumbers.json`);
  url.searchParams.set("PhoneNumber", phoneNumber);

  const res = await fetch(url.toString(), {
    headers: { Authorization: authHeader(), Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ status: res.status, body: text }, "SignalWire get existing number error");
    throw new Error(`SignalWire error fetching existing number: ${res.status}`);
  }

  const data = (await res.json()) as { incoming_phone_numbers: SignalWireIncomingNumber[] };
  return data.incoming_phone_numbers?.[0] ?? null;
}

export async function sendSms(params: {
  from: string;
  to: string;
  body: string;
}): Promise<SignalWireMessage> {
  const body = new URLSearchParams({ From: params.from, To: params.to, Body: params.body });
  const res = await fetch(`${BASE_URL}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ status: res.status, body: text }, "SignalWire send SMS error");
    throw new Error(`SignalWire error sending SMS: ${res.status}`);
  }

  return (await res.json()) as SignalWireMessage;
}

/**
 * Initiate a live outbound PSTN voice call via SignalWire REST API.
 * This instructs the telecom provider to dial destination physical phone numbers over the PSTN.
 */
export async function createCall(params: {
  from: string;
  to: string;
  url?: string;
}): Promise<SignalWireCall> {
  const twimlUrl = params.url || "https://demo.twilio.com/welcome/voice/";
  const body = new URLSearchParams({ From: params.from, To: params.to, Url: twimlUrl });

  const res = await fetch(`${BASE_URL}/Calls.json`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ status: res.status, body: text }, "SignalWire create call error");
    throw new Error(`SignalWire error creating call: ${res.status}`);
  }

  return (await res.json()) as SignalWireCall;
}

export async function listMessages(params: {
  phoneNumber: string;
  limit?: number;
}): Promise<SignalWireMessage[]> {
  const url = new URL(`${BASE_URL}/Messages.json`);
  url.searchParams.set("To", params.phoneNumber);
  url.searchParams.set("PageSize", String(params.limit ?? 50));

  const res = await fetch(url.toString(), {
    headers: { Authorization: authHeader(), Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ status: res.status, body: text }, "SignalWire list messages error");
    throw new Error(`SignalWire error listing messages: ${res.status}`);
  }

  const data = (await res.json()) as { messages: SignalWireMessage[] };
  return data.messages ?? [];
}

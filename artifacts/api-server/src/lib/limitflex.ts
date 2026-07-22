import { logger } from "./logger";

const BASE_URL =
  process.env.LIMITFLEX_BASE_URL ?? "https://esim-api.limitflex.com/v1/api";
const API_KEY = process.env.LIMITFLEX_API_KEY ?? "";

function authHeaders() {
  return {
    "X-API-Key": API_KEY,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

async function limitflexFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers ?? {}) },
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ status: res.status, body: text, url }, "LimitFlex API error");
    throw new Error(`LimitFlex error ${res.status}: ${text}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LimitFlexZone {
  name: string;
  iso: string;
  region: string;
  ensignUrl: string;
  popularDestination?: boolean;
  networks?: LimitFlexNetwork[] | null;
}

export interface LimitFlexNetwork {
  name: string;
  brandName: string;
  speeds: string[];
}

export interface LimitFlexCountry {
  name: string;
  iso: string;
  region: string;
  ensignUrl: string;
  popularDestination?: boolean;
  networks?: LimitFlexNetwork[];
}

export interface LimitFlexBundle {
  id: number;
  title: string;
  description: string;
  type: string;
  data: string;
  duration: string;
  unlimited: boolean;
  promotional: boolean;
  price: number;
  currencyCode: string;
  currencySymbol: string;
  throttled: boolean;
  supportRoaming: boolean;
  autostart: boolean;
  speeds: string[] | null;
  zone: LimitFlexZone;
  roamingCountries: LimitFlexCountry[];
}

export interface LimitFlexCatalogueResponse {
  content: LimitFlexBundle[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export interface LimitFlexBalanceResponse {
  oldBalance: number;
  newBalance: number;
  currencyCode: string;
  currencyName: string;
}

/** Response from POST /order and GET /transactions/{id} */
export interface LimitFlexTransaction {
  id: number;
  productId: number;
  productType: string;
  productTitle: string;
  currency: string;
  unlimited: boolean;
  dataAmount: string;
  duration: string;
  region: string;
  zone: string;
  zoneIso: string;
  quantity: number;
  unitPrice: number;
  totalFee: number;
  promotional: boolean;
  /** PENDING | PROCESSING | SUCCESSFUL | REFUNDED | FAILED */
  status: string;
  referenceId: string | null;
  createdAt: string;
  balanceResponse: LimitFlexBalanceResponse;
}

export interface LimitFlexEsimBundle {
  id: number;
  zone: string;
  used: boolean;
  title: string;
  region: string;
  zoneIso: string;
  duration: string;
  expired: boolean;
  dataAmount: string;
  unlimited: boolean;
  initialQuantity: number;
  remainingQuantity: number;
  purchasedTime: string;
  firstUsageTime: string | null;
  expiryTime: string | null;
}

/** One eSIM from GET /transactions/{id}/esims */
export interface LimitFlexEsim {
  iccid: string;
  installed: boolean;
  smdpAddress: string;
  smdpStatus: string;
  activationCode: string;
  coverage: string;
  topUp: boolean;
  status: string;
  installationTime: string | null;
  expiryTime: string | null;
  bundles: LimitFlexEsimBundle[];
  /** Computed: LPA:1$smdpAddress$activationCode */
  lpaString?: string;
}

export interface LimitFlexAccountBalance {
  amount: number;
  currencyCode: string;
  currencySymbol: string;
  updatedAt: string;
}

export interface LimitFlexWebhook {
  url: string;
  enabled: boolean;
  createdAt: string;
}

// ── Catalogue ─────────────────────────────────────────────────────────────────

export async function getCatalogue(params: {
  unlimited?: boolean;
  region?: string;
  countriesIso?: string;
  page?: number;
  pageSize?: number;
}): Promise<LimitFlexCatalogueResponse> {
  const qs = new URLSearchParams();
  if (params.unlimited !== undefined)
    qs.set("unlimited", String(params.unlimited));
  if (params.region) qs.set("region", params.region);
  if (params.countriesIso) qs.set("countriesIso", params.countriesIso);
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", String(params.pageSize ?? 20));
  return limitflexFetch<LimitFlexCatalogueResponse>(`/catalogue?${qs}`);
}

export async function getCatalogueBundle(id: number): Promise<LimitFlexBundle> {
  return limitflexFetch<LimitFlexBundle>(`/catalogue/${id}`);
}

// ── Orders ────────────────────────────────────────────────────────────────────

/** POST /order — returns a transaction immediately (status usually PROCESSING) */
export async function placeOrder(params: {
  productId: number;
  quantity: number;
  referenceCode: string;
}): Promise<LimitFlexTransaction> {
  return limitflexFetch<LimitFlexTransaction>("/order", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ── Transactions ──────────────────────────────────────────────────────────────

/** GET /transactions/{id} — poll until status === "SUCCESSFUL" */
export async function getTransaction(id: number): Promise<LimitFlexTransaction> {
  return limitflexFetch<LimitFlexTransaction>(`/transactions/${id}`);
}

/**
 * GET /transactions/{id}/esims
 * Call once the transaction is SUCCESSFUL to get the ICCID + activation code.
 * Automatically computes the LPA string: LPA:1$smdpAddress$activationCode
 */
export async function getTransactionEsims(
  transactionId: number
): Promise<LimitFlexEsim[]> {
  const esims = await limitflexFetch<LimitFlexEsim[]>(
    `/transactions/${transactionId}/esims`
  );
  return esims.map((e) => ({
    ...e,
    lpaString: `LPA:1$${e.smdpAddress}$${e.activationCode}`,
  }));
}

/** GET /transactions — paginated history */
export async function getTransactions(params: {
  referenceCode?: string;
  regions?: string;
  page?: number;
  pageSize?: number;
}): Promise<unknown> {
  const qs = new URLSearchParams();
  if (params.referenceCode) qs.set("referenceCode", params.referenceCode);
  if (params.regions) qs.set("regions", params.regions);
  qs.set("page", String(params.page ?? 0));
  qs.set("pageSize", String(params.pageSize ?? 20));
  return limitflexFetch(`/transactions?${qs}`);
}

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

  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LimitFlexZone {
  name: string;
  iso: string;
  region: string;
  ensignUrl: string;
  networks?: LimitFlexNetwork[] | null;
  popularDestination?: boolean;
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
    sort: { empty: boolean; unsorted: boolean; sorted: boolean };
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

export interface LimitFlexOrder {
  id: string;
  status: string;
  productId: number;
  quantity: number;
  referenceCode: string;
  createdAt?: string;
}

export interface LimitFlexOrderDetail extends LimitFlexOrder {
  esims?: LimitFlexEsim[];
}

export interface LimitFlexEsim {
  iccid?: string;
  activationCode?: string;
  qrCodeUrl?: string;
  lpaString?: string;
  status?: string;
}

// ── API functions ─────────────────────────────────────────────────────────────

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

export async function getCatalogueBundle(
  id: number
): Promise<LimitFlexBundle> {
  return limitflexFetch<LimitFlexBundle>(`/catalogue/${id}`);
}

export async function placeOrder(params: {
  productId: number;
  quantity: number;
  referenceCode: string;
}): Promise<LimitFlexOrder> {
  return limitflexFetch<LimitFlexOrder>("/order", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getOrder(id: string): Promise<LimitFlexOrderDetail> {
  return limitflexFetch<LimitFlexOrderDetail>(`/order/${id}`);
}

export async function getTransactions(params: {
  page?: number;
  pageSize?: number;
}): Promise<unknown> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", String(params.pageSize ?? 20));
  return limitflexFetch(`/transactions?${qs}`);
}

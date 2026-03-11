export interface ParcelStatus {
  id: number;
  message: string;
}

export interface ParcelItem {
  description: string;
  quantity: number;
  weight: string;
  value: string;
  hs_code: string;
  origin_country: string;
  product_id: string;
  variant_id: string;
  sku: string;
  properties: Record<string, unknown>;
  return_reason: string | null;
  return_message: string | null;
}

export interface ParcelLabel {
  normal_printer: string[];
  label_printer: string;
}

export interface Parcel {
  id: number;
  reference: string;
  status: ParcelStatus;
  tracking_number: string;
  tracking_url: string;
  carrier: { code: string };
  weight: string;
  order_number: string;
  name: string;
  address: string;
  house_number: string;
  city: string;
  postal_code: string;
  country: { iso_2: string; name: string };
  label: ParcelLabel | null;
  parcel_items: ParcelItem[];
  created_at: string;
  updated_at: string;
  shipment: { id: number; name: string } | null;
  is_return: boolean;
  total_insured_value: number;
  [key: string]: unknown;
}

export interface ShippingMethod {
  id: number;
  name: string;
  carrier: string;
  min_weight: string;
  max_weight: string;
  service_point_input: string;
  price: number;
  countries: Array<{
    id: number;
    name: string;
    price: number;
    iso_2: string;
    iso_3: string;
    lead_time_hours: number;
  }>;
}

export interface Brand {
  id: number;
  name: string;
  color: string;
  secondary_color: string;
  website: string;
  screen_logo: { url: string };
  print_logo: { url: string };
  domain: string;
  [key: string]: unknown;
}

export interface Integration {
  id: number;
  shop_name: string;
  shop_url: string | null;
  system: string;
  failing_since: string | null;
  last_fetch: string;
  last_updated_at: string;
  service_point_enabled: boolean;
  webhook_active: boolean;
  webhook_url: string | null;
}

export interface User {
  username: string;
  company_name: string;
  telephone: string;
  address: string;
  postal_code: string;
  city: string;
  email: string;
  registered: string;
  invoices: Array<{
    id: number;
    ref: string;
    type: string;
    price_incl: number;
    price_excl: number;
    isPayed: boolean;
    date: string;
  }>;
  [key: string]: unknown;
}

export interface SendCloudError {
  error: {
    code: number;
    message: string;
  };
}

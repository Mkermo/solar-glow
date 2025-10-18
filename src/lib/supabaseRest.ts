const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL. Add it to your environment configuration.');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY. Add it to your environment configuration.');
}

type FilterOperator =
  | 'eq'
  | 'neq'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'ilike'
  | 'like'
  | 'is'
  | 'in';

interface RestFilter {
  column: string;
  operator?: FilterOperator;
  value: string | number | boolean | null;
}

interface RestOrder {
  column: string;
  ascending?: boolean;
}

interface SupabaseRestOptions {
  select?: string;
  filters?: RestFilter[];
  limit?: number;
  order?: RestOrder;
  single?: boolean;
  signal?: AbortSignal;
}

function toStringValue(value: string | number | boolean | null) {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function buildHeaders(single?: boolean) {
  const headers: Record<string, string> = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
  };

  if (single) {
    headers.Accept = 'application/vnd.pgrst.object+json';
    headers.Prefer = 'single-object';
  } else {
    headers.Accept = 'application/json';
  }

  return headers;
}

export async function supabaseRestSelect<T = unknown>(
  table: string,
  options: SupabaseRestOptions = {},
): Promise<T extends any[] ? T : T | T[]> {
  const {
    select = '*',
    filters = [],
    limit,
    order,
    single = false,
    signal,
  } = options;

  const endpoint = new URL(`${supabaseUrl}/rest/v1/${table}`);
  endpoint.searchParams.set('select', select);

  filters.forEach(({ column, operator = 'eq', value }) => {
    endpoint.searchParams.set(column, `${operator}.${toStringValue(value)}`);
  });

  if (typeof limit === 'number') {
    endpoint.searchParams.set('limit', String(limit));
  }

  if (order?.column) {
    const direction = order.ascending === false ? 'desc' : 'asc';
    endpoint.searchParams.set('order', `${order.column}.${direction}`);
  }

  const response = await fetch(endpoint.toString(), {
    headers: buildHeaders(single),
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Supabase REST error (${response.status} ${response.statusText}) for ${table}: ${
        errorBody || 'No response body'
      }`,
    );
  }

  if (response.status === 204) {
    return single ? (null as any) : ([] as any);
  }

  return (await response.json()) as any;
}

export async function supabaseRestUpdate<T = unknown>(
  table: string,
  values: Record<string, unknown>,
  filters: RestFilter[],
): Promise<T | T[]> {
  const endpoint = new URL(`${supabaseUrl}/rest/v1/${table}`);

  filters.forEach(({ column, operator = 'eq', value }) => {
    endpoint.searchParams.set(column, `${operator}.${toStringValue(value)}`);
  });

  const response = await fetch(endpoint.toString(), {
    method: 'PATCH',
    headers: {
      ...buildHeaders(false),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Supabase REST update error (${response.status} ${response.statusText}) for ${table}: ${
        errorBody || 'No response body'
      }`,
    );
  }

  if (response.status === 204) {
    return [] as any;
  }

  return (await response.json()) as any;
}

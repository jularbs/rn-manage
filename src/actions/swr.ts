export const fetcher = async ({
  url,
  token,
  params,
  cache = { revalidate: 0 },
}: {
  url: string;
  token?: string;
  params?: Record<string, string>;
  cache?: Record<string, number | string>;
}) => {
  const baseURL = new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/${url}`);
  const searchParams: URLSearchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== "") {
        if (Array.isArray(value)) {
          value.forEach((val) => {
            searchParams.append(key, val);
          });
        } else {
          searchParams.append(key, value);
        }
      }
    });
    baseURL.search = searchParams.toString();
  }

  const res = await fetch(baseURL.toString(), {
    next: cache,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    return res.json().then((error) => {
      throw error;
    });
  }

  return res.json();
};

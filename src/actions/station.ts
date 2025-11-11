export const createStation = async ({ token, data }: { token: string | undefined; data: FormData }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/stations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      return res.json().then((error) => {
        throw error;
      });
    }

    return res.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    throw {
      message: "Server error, please try again later",
    };
  }
};

export const updateStation = async ({ token, data, id }: { token: string | undefined; data: FormData; id: string }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/stations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "PUT",
      body: data,
    });

    if (!res.ok) {
      return res.json().then((error) => {
        throw error;
      });
    }

    return res.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    throw {
      message: "Server error, please try again later",
    };
  }
};

export const setDefaultStation = async ({ token, id }: { token: string | undefined; id: string }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/stations/default/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "PUT",
    });

    if (!res.ok) {
      return res.json().then((error) => {
        throw error;
      });
    }

    return res.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    throw {
      message: "Server error, please try again later",
    };
  }
};

export const removeStation = async ({ id, token }: { id: string; token: string | undefined }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/stations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "DELETE",
    });

    if (!res.ok) {
      return res.json().then((error) => {
        throw error;
      });
    }

    return res.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    throw {
      message: "Server error, please try again later",
    };
  }
};
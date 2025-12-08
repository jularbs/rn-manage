export const createRecepient = async ({ token, data }: { token: string | undefined; data: Record<string, string> }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/recepients`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      method: "POST",
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

export const updateRecepient = async ({ token, data, recepientId }: { token: string | undefined; data: Record<string, string>; recepientId: string }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/recepients/${recepientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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

export const deleteRecepient = async ({ token, recepientId }: { token: string | undefined; recepientId: string }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/recepients/${recepientId}`, {
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

export const toggleRecepientStatus = async ({ token, recepientId }: { token: string | undefined; recepientId: string }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/recepients/${recepientId}/toggle-status`, {
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
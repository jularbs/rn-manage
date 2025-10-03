//Auth Functions
export const Login = async ({ email, password }: { email: string; password: string }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/auth/login`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ email, password }),
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
      error: "Server error, please try again later",
    };
  }
};

export const Register = async ({
  name,
  email,
  password,
  confirmPassword,
}: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/auth/register`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ name, email, password, confirmPassword }),
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
      error: "Server error, please try again later",
    };
  }
};

export const Logout = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/signout`, {});

    if (!res.ok) {
      return res.json().then((error) => {
        throw error;
      });
    }

    return res.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw {
      error: "Server error, please try again later",
    };
  }
};

export const validateToken = async (token: string | undefined) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/validate-token`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return res.json().then((error) => {
        console.log("VALIDATE TOKEN ERROR: ", error);
        throw error;
      });
    }

    return res.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw {
      error: "Server error, please try again later",
    };
  }
};

export const requestResetPassword = async ({ email }: { email: string }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v2/auth/request-reset-password`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ email: email }),
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
      error: "Server error, please try again later",
    };
  }
};

export const resetPassword = async ({ data }: { data: Record<string, string> }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v2/auth/reset-password`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(data),
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
      error: "Server error, please try again later",
    };
  }
};

export const changePassword = async ({
  token,
  data,
}: {
  token: string | undefined;
  data: Record<string, string | number>;
}) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v2/auth/change-password`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "PUT",
      body: JSON.stringify(data),
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
      error: "Server error, please try again later",
    };
  }
};

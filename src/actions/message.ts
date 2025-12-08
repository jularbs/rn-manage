export const markMessageAsUnread = async ({ token, messageId }: { token: string | undefined; messageId: string }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/messages/${messageId}/unread`, {
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

export const markMessageAsRead = async ({ token, messageId }: { token: string | undefined; messageId: string }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/messages/${messageId}/read`, {
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

export const deleteMessage = async ({ token, messageId }: { token: string | undefined; messageId: string }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/messages/${messageId}`, {
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
}

class ResponseError extends Error {
  data: any;
  response: Response;
}

export default async function fetcher(input: RequestInfo, init?: RequestInit) {
  try {
    const response = await fetch(input, init);

    // if the server replies, there's always some data in json
    // if there's a network error, it will throw at the previous line
    const data = await response.json();

    if (response.ok) {
      return data;
    }

    const error = new ResponseError(response.statusText);
    error.response = response;
    error.data = data;
    throw error;
  } catch (error) {
    if (!error.data) {
      error.data = { message: error.message };
    }
    throw error;
  }
}

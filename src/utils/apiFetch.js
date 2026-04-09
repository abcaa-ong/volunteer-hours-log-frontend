export class SessionExpiredError extends Error {
  constructor() {
    super('Sessão expirada');
    this.name = 'SessionExpiredError';
  }
}

export const apiFetch = async (url, options = {}) => {
  const response = await fetch(url, options);

  if (response.status === 401) {
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new SessionExpiredError();
  }

  return response;
};
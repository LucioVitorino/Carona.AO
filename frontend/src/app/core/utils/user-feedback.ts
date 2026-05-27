const fallbackMessages: Record<string, string> = {
  'Invalid credentials': 'Email ou senha incorretos. Verifique e tente novamente.',
  'email and password are required': 'Digite o email e a senha para entrar.',
  'Email already registered': 'Já existe uma conta com este email.',
  'Invalid email format': 'Digite um email válido.',
  'Valid email is required': 'Digite um email válido.',
  'Invalid or expired token': 'Este link já expirou. Peça uma nova recuperação de senha.',
  'Passwords do not match': 'As senhas não coincidem. Confirme e tente novamente.',
};

export function userFeedback(response: unknown, fallback: string): string {
  const message = readMessage(response);
  if (!message) {
    return fallback;
  }

  return fallbackMessages[message] ?? message;
}

function readMessage(response: unknown): string {
  if (!response || typeof response !== 'object') {
    return '';
  }

  const maybeResponse = response as { error?: { error?: unknown; message?: unknown } };
  const value = maybeResponse.error?.error ?? maybeResponse.error?.message;

  return typeof value === 'string' ? value : '';
}

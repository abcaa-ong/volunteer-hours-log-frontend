/**
 * Valida um endereço de email
 * @param {string} email - Email a ser validado
 * @returns {boolean} true se válido, false caso contrário
 */
export const validateEmail = (email) => {
  if (!email) return false;
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida um CPF (formato: 000.000.000-00)
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} true se válido, false caso contrário
 */
export const validateCPF = (cpf) => {
  if (!cpf) return true; // CPF é opcional
  
  const digitsOnly = cpf.replace(/\D/g, '');
  return digitsOnly.length === 11;
};

/**
 * Valida um telefone (formato: (00) 00000-0000 ou (00) 0000-0000)
 * @param {string} phone - Telefone a ser validado
 * @returns {boolean} true se válido, false caso contrário
 */
export const validatePhone = (phone) => {
  if (!phone) return true; // Telefone é opcional
  
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length === 10 || digitsOnly.length === 11;
};

/**
 * Valida um CEP (formato: 00000-000)
 * @param {string} zipCode - CEP a ser validado
 * @returns {boolean} true se válido, false caso contrário
 */
export const validateZipCode = (zipCode) => {
  if (!zipCode) return true; // CEP é opcional
  
  const digitsOnly = zipCode.replace(/\D/g, '');
  return digitsOnly.length === 8;
};

/**
 * Valida a duração de uma atividade
 * @param {number} minutes - Duração em minutos
 * @returns {boolean} true se válido, false caso contrário
 */
export const validateDuration = (minutes) => {
  const MIN_MINUTES = 15;
  const MAX_MINUTES = 720; // 12 horas
  
  return minutes >= MIN_MINUTES && minutes <= MAX_MINUTES;
};

/**
 * Valida uma descrição
 * @param {string} description - Descrição a ser validada
 * @param {number} minLength - Tamanho mínimo
 * @param {number} maxLength - Tamanho máximo
 * @returns {boolean} true se válido, false caso contrário
 */
export const validateDescription = (description, minLength = 10, maxLength = 500) => {
  if (!description) return false;

  const trimmed = description.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

/**
 * Valida um título
 * @param {string} title - Título a ser validado
 * @param {number} minLength - Tamanho mínimo
 * @param {number} maxLength - Tamanho máximo
 * @returns {boolean} true se válido, false caso contrário
 */
export const validateTitle = (title, minLength = 10, maxLength = 75) => {
  if (!title) return false;

  const trimmed = title.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

/**
 * Sanitiza uma string removendo caracteres perigosos
 * @param {string} input - String a ser sanitizada
 * @returns {string} String sanitizada
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < e >
    .substring(0, 500); // Limita tamanho
};

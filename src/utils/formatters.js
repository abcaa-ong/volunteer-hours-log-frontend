/**
 * Formata uma data para o padrão brasileiro (dd/mm/yyyy)
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada
 */
export const formatDate = (date) => {
  if (!date) return '';
  
    let dateObj;
  if (typeof date === 'string') {
    const [y, m, d] = date.split('-');
    dateObj = new Date(y, m - 1, d);
  } else {
    dateObj = date;
  }
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formata minutos para horas e minutos (ex: 150 → "2h30min")
 * @param {number} minutes - Minutos a serem formatados
 * @returns {string} Tempo formatado
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '0min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  
  return `${hours}h${mins}min`;
};

/**
 * Formata o status da atividade para exibição
 * @param {string} status - Status da atividade
 * @returns {string} Status formatado
 */
export const formatActivityStatus = (status) => {
  const statusMap = {
    'PENDING': 'Pendente',
    'APPROVED': 'Aprovada',
    'REJECTED': 'Rejeitada'
  };
  
  return statusMap[status] || status;
};

/**
 * Formata o tipo de usuário para exibição
 * @param {string} userType - Tipo de usuário
 * @returns {string} Tipo formatado
 */
export const formatUserType = (userType) => {
  const typeMap = {
    'VOLUNTEER': 'Voluntário',
    'ADMIN': 'Administrador'
  };
  
  return typeMap[userType] || userType;
};

import { API_BASE_URL } from '../utils/constants';
import { getAuthHeaders } from '../utils/apiHeaders';

const activityAPI = `${API_BASE_URL}/activity`;

/**
 * Busca todas as atividades
 * @param {string} token - Token JWT
 * @returns {Promise<Array>} Lista de atividades
 */
export const fetchActivities = async (token, page = 0, size = 12) => {
  try {
    const response = await fetch(`${activityAPI}/listAll?page=${page}&size=${size}`, {
      headers: getAuthHeaders(token)
    });

    if (response.status === 204) return { content: [], currentPage: 0,
         pageSize: size, totalElements: 0, totalPages: 0 };

    if (!response.ok) throw new Error('Erro ao buscar atividades');
    return await response.json(); 


    } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    throw error;
  }
};

/**
 * Busca uma atividade por ID
 * @param {number} id - ID da atividade
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Dados da atividade
 */
export const fetchActivityById = async (id, token) => {
  try {
    const response = await fetch(`${activityAPI}/list/${id}`, {
      headers: getAuthHeaders(token)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Atividade não encontrada');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar atividade:', error);
    throw error;
  }
};

/**
 * Busca atividades de um voluntário
 * @param {number} volunteerId - ID do voluntário
 * @param {string} token - Token JWT
 * @returns {Promise<Array>} Lista de atividades
 */
export const fetchActivitiesByVolunteer = async (volunteerId, token, page = 0, size = 12 )=> {
  try {
    console.log('fetchActivitiesByVolunteer - volunteerId:', volunteerId);
    console.log('fetchActivitiesByVolunteer - URL:', `${activityAPI}/volunteer/${volunteerId}`);
    
    const response = await fetch(`${activityAPI}/volunteer/${volunteerId}?page=${page}&size=${size}`, {
      headers: getAuthHeaders(token)
    });

    console.log('fetchActivitiesByVolunteer - status:', response.status);

    if (response.status === 204) {
      console.log('fetchActivitiesByVolunteer - Nenhuma atividade encontrada (204)');
      return { content: [], currentPage: 0, pageSize: size, totalElements: 0, totalPages: 0 };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('fetchActivitiesByVolunteer - Erro:', errorText);
      throw new Error(errorText || 'Erro ao buscar atividades');
    }

    const data = await response.json();
    console.log('fetchActivitiesByVolunteer - Dados recebidos:', data);
    return data;

  } catch (error) {
    console.error('Erro ao buscar atividades do voluntário:', error);
    throw error;
  }
};

/**
 * Busca atividades por status
 * @param {string} status - Status da atividade (PENDING, APPROVED, REJECTED)
 * @param {string} token - Token JWT
 * @returns {Promise<Array>} Lista de atividades
 */
export const fetchActivitiesByStatus = async (status, token,  page = 0, size = 12) => {
  try {
    const response = await fetch(`${activityAPI}/status/${status}?page=${page}&size=${size}`, {
      headers: getAuthHeaders(token)
    });

    if (response.status === 204) {
      return { content: [], currentPage: 0, pageSize: size, totalElements: 0, totalPages: 0 };
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao buscar atividades');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar atividades por status:', error);
    throw error;
  }
};

/**
 * Cria uma nova atividade
 * @param {Object} activity - Dados da atividade
 * @param {string} activity.date - Data da atividade (YYYY-MM-DD)
 * @param {string} activity.description - Descrição da atividade
 * @param {number} activity.durationMinutes - Duração em minutos
 * @param {number} activity.volunteerId - ID do voluntário
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Atividade criada
 */
export const createActivity = async (activity, token) => {
  try {
    const response = await fetch(`${activityAPI}/create`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(activity)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao criar atividade');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    throw error;
  }
};

/**
 * Atualiza uma atividade
 * @param {number} id - ID da atividade
 * @param {Object} activity - Dados atualizados
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Atividade atualizada
 */
export const updateActivity = async (id, activity, token) => {
  try {
    const response = await fetch(`${activityAPI}/update/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(activity)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao atualizar atividade');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    throw error;
  }
};

/**
 * Atualiza o status de uma atividade
 * @param {number} id - ID da atividade
 * @param {string} status - Novo status (PENDING, APPROVED, REJECTED)
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Atividade atualizada
 */
export const updateActivityStatus = async (id, status, token) => {
  try {
    const response = await fetch(`${activityAPI}/${id}/status?status=${status}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao atualizar status');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
};

/**
 * Deleta uma atividade
 * @param {number} id - ID da atividade
 * @param {string} token - Token JWT
 * @returns {Promise<void>}
 */
export const deleteActivity = async (id, token) => {
  try {
    const response = await fetch(`${activityAPI}/delete/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao deletar atividade');
    }
  } catch (error) {
    console.error('Erro ao deletar atividade:', error);
    throw error;
  }
};

import { API_BASE_URL } from '../utils/constants';
import { getAuthHeaders } from '../utils/apiHeaders';
import { apiFetch } from '../utils/apiFetch';

const volunteerAPI = `${API_BASE_URL}/volunteer`;

export const fetchVolunteers = async (token, page = 0, size = 10 ) => {
  const response = await apiFetch(`${volunteerAPI}/list?page=${page}&size=${size}`, {
    headers: getAuthHeaders(token)
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar voluntários');
  }

  return await response.json();
};

export const fetchVolunteerById = async (volunteerId, token) => {
  const response = await apiFetch(`${volunteerAPI}/${volunteerId}`, {
    headers: getAuthHeaders(token)
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar voluntário');
  }

  return await response.json();
};

export const updateVolunteerUserType = async (volunteerId, userType, token) => {
  const response = await apiFetch(`${volunteerAPI}/${volunteerId}/usertype?userType=${userType}`, {
    method: 'PATCH',
    headers: getAuthHeaders(token)
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar tipo de usuário');
  }

  return await response.json();
};

export const deleteVolunteer = async (volunteerId, token) => {
  const response = await apiFetch(`${volunteerAPI}/delete/${volunteerId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir voluntário');
  }
};

import { API_BASE_URL } from '../utils/constants';
import { getHeaders } from '../utils/apiHeaders';
import { apiFetch } from '../utils/apiFetch';

const departmentAPI = `${API_BASE_URL}/departments`;

/**
 * Busca todos os departamentos
 * @param {string} token - Token JWT
 * @returns {Promise<Array>} Lista de departamentos
 */
export const fetchDepartments = async (token) => {
  try {
    const response = await apiFetch(`${departmentAPI}/list`, { 
      headers: getHeaders(token)
    });

    if (response.status === 204) {
      return [];
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao buscar departamentos');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error);
    throw error;
  }
};

/**
 * Busca um departamento por ID
 * @param {number} id - ID do departamento
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Dados do departamento
 */
export const fetchDepartmentById = async (id, token) => {
  try {
    const response = await apiFetch(`${departmentAPI}/${id}`, {
      headers: getHeaders(token)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Departamento não encontrado');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar departamento:', error);
    throw error;
  }
};

/**
 * Cria um novo departamento
 * @param {Object} department - Dados do departamento
 * @param {string} department.name - Nome do departamento
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Departamento criado
 */
export const createDepartment = async (department, token) => {
  try {
    const response = await apiFetch(`${departmentAPI}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(department)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao criar departamento');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar departamento:', error);
    throw error;
  }
};

/**
 * Atualiza um departamento
 * @param {number} id - ID do departamento
 * @param {Object} department - Dados atualizados
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Departamento atualizado
 */
export const updateDepartment = async (id, department, token) => {
  try {
    const response = await apiFetch(`${departmentAPI}/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(department)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao atualizar departamento');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar departamento:', error);
    throw error;
  }
};

/**
 * Deleta um departamento
 * @param {number} id - ID do departamento
 * @param {string} token - Token JWT
 * @returns {Promise<void>}
 */
export const deleteDepartment = async (id, token) => {
  try {
    const response = await apiFetch(`${departmentAPI}/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao deletar departamento');
    }
  } catch (error) {
    console.error('Erro ao deletar departamento:', error);
    throw error;
  }
};

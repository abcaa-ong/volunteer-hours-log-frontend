import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../service/departmentApi';
import { toast } from 'react-toastify';
import { Briefcase, Plus, Edit2, Trash2, X } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import './Departments.css';

const Departments = () => {
  const { token } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDepartments(token);
      setDepartments(data);
    } catch (error) {
      if (error.name === 'SessionExpiredError') return;
      toast.error('Erro ao carregar setores');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleOpenModal = (department = null) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        description: department.description || ''
      });
    } else {
      setEditingDepartment(null);
      setFormData({ name: '', description: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
    setFormData({ name: '', description: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nome do setor é obrigatório');
      return;
    }

    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, formData, token);
        toast.success('Setor atualizado com sucesso!');
      } else {
        await createDepartment(formData, token);
        toast.success('Setor criado com sucesso!');
      }
      handleCloseModal();
      loadDepartments();
    } catch (error) {
      if (error.name === 'SessionExpiredError') return;
      toast.error(`Erro ao ${editingDepartment ? 'atualizar' : 'criar'} setor`);
      console.error(error);
    }
  };

  const handleDelete = async (departmentId, departmentName) => {
    if (!window.confirm(`Deseja realmente excluir o setor "${departmentName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await deleteDepartment(departmentId, token);
      toast.success('Setor excluído com sucesso!');
      loadDepartments();
    } catch (error) {
      if (error.name === 'SessionExpiredError') return;
      toast.error('Erro ao excluir setor');
      console.error(error);
    }
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="content">
        <div className="departments-page">
          <div className="page-header">
            
            <div>
            <h1>Setores</h1>
              <p className="subtitle">Gerencie os setores da organização</p>
            </div>
            <button onClick={() => handleOpenModal()} className="btn btn-primary">
              <Plus size={18} />
              Novo Setor
            </button>
          </div>

          <div className="departments-card">
            {loading ? (
              <div className="loading-state">
                <p>Carregando setores...</p>
              </div>
            ) : departments.length === 0 ? (
              <div className="empty-state">
                <Briefcase size={48} />
                <p>Nenhum setor cadastrado</p>
                <button onClick={() => handleOpenModal()} className="btn btn-primary">
                  <Plus size={18} />
                  Criar Primeiro Setor
                </button>
              </div>
            ) : (
              <div className="departments-grid">
                {departments.map((department) => (
                  <div key={department.id} className="department-card">
                    <div className="department-header">
                      <h3>{department.name}</h3>
                      <div className="department-actions">
                        <button
                          onClick={() => handleOpenModal(department)}
                          className="btn-icon btn-edit"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(department.id, department.name)}
                          className="btn-icon btn-delete"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    {department.description && (
                      <p className="department-description">{department.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDepartment ? 'Editar Setor' : 'Novo Setor'}</h2>
              <button onClick={handleCloseModal} className="btn-close">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nome do Setor *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Educação"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descreva as atividades deste setor..."
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDepartment ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;

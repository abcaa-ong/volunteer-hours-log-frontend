import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchDepartmentById } from '../../service/departmentApi';
import { validateDescription, validateTitle } from '../../utils/validators';
import { toast } from 'react-toastify';
import './ActivityForm.css';

const ActivityForm = ({ onSubmit, onCancel, initialData = null }) => {
  const { token, user } = useAuth();

  const [formData, setFormData] = useState({
    date: initialData?.date || '',
    durationMinutes: initialData?.durationMinutes || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    volunteerId: user?.volunteerId || ''
  });

  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      date: initialData?.date || '',
      durationMinutes: initialData?.durationMinutes || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
      volunteerId: user?.volunteerId || ''
    });
  }, [initialData, user?.volunteerId]);

  useEffect(() => {
    const loadDepartment = async () => {
      if (user?.departmentId) {
        try {
          const department = await fetchDepartmentById(user.departmentId, token);
          setDepartmentName(department?.name || String(user.departmentId));
        } catch (error) {
          console.error('Erro ao carregar departamento:', error);
        }
      }
    };

    loadDepartment();
  }, [token, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.date) {
      toast.error('Por favor, selecione uma data');
      return false;
    }

    const [y, m, d] = formData.date.split('-');
    const selectedDate = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      toast.error('A data não pode ser futura');
      return false;
    }

    if (!formData.durationMinutes) {
      toast.error('Por favor, selecione a duração');
      return false;
    }

    const duration = parseInt(formData.durationMinutes, 10);
    if (duration < 30) {
      toast.error('Duração mínima: 30 minutos');
      return false;
    }

    if (duration > 300) {
      toast.error('Duração máxima: 5 horas');
      return false;
    }

    if (!validateDescription(formData.description, 10, 500)) {
      toast.error('Descrição deve ter entre 10 e 500 caracteres');
      return false;
    }

    if (!validateTitle(formData.title, 10, 75)) {
      toast.error('Descrição deve ter entre 10 e 75 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        date: formData.date,
        description: formData.description.trim(),
        title: formData.title.trim(),
        durationMinutes: parseInt(formData.durationMinutes, 10),
        volunteerId: parseInt(formData.volunteerId, 10)
      };

      await onSubmit(payload);

      if (!initialData) {
        setFormData({
          date: '',
          title: '',
          durationMinutes: '',
          description: '',
          volunteerId: user?.volunteerId || ''
        });
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="activity-form-card">
      <h2>{initialData ? 'Editar Atividade' : 'Registrar Atividade'}</h2>

      <form onSubmit={handleSubmit} className="activity-form">
        <div className="form-group">
          <label>Voluntário</label>
          <input
            type="text"
            value={user?.name || ''}
            disabled
            className="input-disabled"
          />
        </div>

        <div className="form-group">
          <label>Setor</label>
          <input
            type="text"
            value={departmentName}
            disabled
            className="input-disabled"
          />
        </div>

        <div className="form-group">
          <label>Data da Atividade *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            required
          />
          <small>A data não pode ser futura</small>
        </div>

        <div className="form-group">
          <label>Duração *</label>
          <select
            name="durationMinutes"
            value={formData.durationMinutes}
            onChange={handleChange}
            required
          >
            <option value="">Selecione a duração</option>
            <option value="30">30min</option>
            <option value="60">1h</option>
            <option value="90">1h30</option>
            <option value="120">2h</option>
            <option value="150">2h30</option>
            <option value="180">3h</option>
            <option value="210">3h30</option>
            <option value="240">4h</option>
            <option value="300">5h</option>
          </select>
          <small>Intervalos de 30 minutos</small>
        </div>

       <div className="form-group">
          <label>Título da Atividade</label>
          <input
            name="title"
            onChange={handleChange}
            type="text"
            value={formData.title}
            placeholder="Descreva o título da atividade"
          />
          <small>
            {formData.title.length}/75 caracteres (mínimo: 10)
          </small>
        </div>

        <div className="form-group">
          <label>Descrição da Atividade *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Descreva a atividade realizada..."
            required
            maxLength="500"
          />
          <small>
            {formData.description.length}/500 caracteres (mínimo: 10)
          </small>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Salvando...' : initialData ? 'Atualizar' : 'Registrar'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;

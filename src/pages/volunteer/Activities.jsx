import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchActivitiesByVolunteer,
  createActivity,
  updateActivity,
  deleteActivity
} from '../../service/activityApi';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import ActivityForm from '../../components/volunteer/ActivityForm';
import ActivityList from '../../components/volunteer/ActivityList';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
import './Activities.css';

const PAGE_SIZE = 12;

const Activities = () => {
  const { user, token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadActivities = useCallback(async () => {
    if (!user?.volunteerId) {
      console.error('volunteerId não encontrado no user:', user);
      toast.error('Erro: ID do voluntário não encontrado');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Buscando atividades para volunteerId:', user.volunteerId);
      const data = await fetchActivitiesByVolunteer(user.volunteerId, token, currentPage, PAGE_SIZE);
      console.log('Atividades recebidas:', data);
      setActivities(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      toast.error('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  }, [token, user, currentPage]);

  useEffect(() => {
    if (user?.volunteerId) {
      console.log('Carregando atividades para volunteerId:', user.volunteerId);
      loadActivities();
    }
  }, [loadActivities, user?.volunteerId]);

  const handleCreate = async (activityData) => {
    try {
      await createActivity(activityData, token);
      toast.success('Atividade registrada com sucesso!');
      setIsFormOpen(false);
      loadActivities();
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      toast.error('Erro ao registrar atividade');
      throw error;
    }
  };

  const handleUpdate = async (activityData) => {
    if (!editingActivity) {
      return;
    }

    try {
      await updateActivity(editingActivity.id, activityData, token);
      toast.success('Atividade atualizada com sucesso!');
      setEditingActivity(null);
      setIsFormOpen(false);
      loadActivities();
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      toast.error(error.message || 'Erro ao atualizar atividade');
      throw error;
    }
  };

  const handleStartEdit = (activity) => {
    setEditingActivity(activity);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingActivity(null);
    setIsFormOpen(false);
  };

  const handleToggleForm = () => {
    if (editingActivity && isFormOpen) {
      setEditingActivity(null);
    }

    setIsFormOpen((prev) => !prev);
  };

  const handleDelete = async (id) => {
    try {
      await deleteActivity(id, token);
      if (editingActivity?.id === id) {
        setEditingActivity(null);
        setIsFormOpen(false);
      }
      return true;
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      throw error;
    }
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="content">
        <h1>Minhas Atividades</h1>
        <p className="subtitle">Registre e acompanhe suas atividades de voluntariado</p>

        <section className="activity-form-panel">
          <div className="activity-form-toolbar">
            <div>
              <h2>{editingActivity ? 'Editando Atividade' : 'Registrar Atividade'}</h2>
              <p className="activity-form-summary">
                {editingActivity
                  ? 'Atualize os dados da atividade selecionada.'
                  : 'Abra o formulário apenas quando precisar registrar uma nova atividade.'}
              </p>
            </div>

            <button
              type="button"
              className={`btn ${isFormOpen ? 'btn-secondary' : 'btn-primary'} activity-form-toggle`}
              onClick={handleToggleForm}
            >
              {isFormOpen
                ? editingActivity
                  ? 'Fechar edição'
                  : 'Fechar formulário'
                : editingActivity
                  ? 'Continuar edição'
                  : 'Nova atividade'}
            </button>
          </div>

          {isFormOpen && (
            <div className="activity-form-shell">
              <ActivityForm
                onSubmit={editingActivity ? handleUpdate : handleCreate}
                onCancel={editingActivity ? handleCancelEdit : null}
                initialData={editingActivity}
              />
            </div>
          )}
        </section>

        {loading ? (
          <Loading message="Carregando atividades..." />
        ) : (
          <>
            <ActivityList
              activities={activities}
              onEdit={handleStartEdit}
              onDelete={handleDelete}
              onRefresh={loadActivities}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Activities;

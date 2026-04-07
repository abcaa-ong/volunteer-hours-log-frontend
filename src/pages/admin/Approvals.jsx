import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchActivitiesByStatus, updateActivityStatus } from '../../service/activityApi';
import { fetchDepartments } from '../../service/departmentApi';
import { formatDate, formatDuration, formatActivityStatus } from '../../utils/formatters';
import { toast } from 'react-toastify';
import { CheckSquare, Check, X, Clock } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import Pagination from '../../components/common/Pagination';
import './Approvals.css';

const PAGE_SIZE = 10;

const Approvals = () => {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const departmentMap = useMemo(
    () => Object.fromEntries(departments.map((d) => [d.id, d.name])),
    [departments]
  );

  useEffect(() => {
    fetchDepartments(token)
      .then(setDepartments)
      .catch((err) => console.error('Erro ao carregar departamentos:', err));
  }, [token]);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchActivitiesByStatus(filter, token, currentPage, PAGE_SIZE);
      setActivities(data.content);
      setTotalPages(data.totalPages);
      setSelectedActivityId(null);
    } catch (error) {
      toast.error('Erro ao carregar atividades');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filter, token, currentPage]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(0);
  };

  const handleStatusChange = async (activityId, newStatus) => {
    const statusText = newStatus === 'APPROVED' ? 'aprovar' : 'rejeitar';

    if (!window.confirm(`Deseja realmente ${statusText} esta atividade?`)) {
      return;
    }

    try {
      await updateActivityStatus(activityId, newStatus, token);
      toast.success(`Atividade ${newStatus === 'APPROVED' ? 'aprovada' : 'rejeitada'} com sucesso!`);
      loadActivities();
    } catch (error) {
      toast.error(`Erro ao ${statusText} atividade`);
      console.error(error);
    }
  };

  const handleToggleDetails = (activityId) => {
    setSelectedActivityId((currentId) => (currentId === activityId ? null : activityId));
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="content">
        <div className="approvals-page">
          <div className="page-header">
            <CheckSquare size={32} />
            <div>
              <h1>Aprovações</h1>
              <p className="subtitle">Gerencie as atividades dos voluntários</p>
            </div>
          </div>

          <div className="filter-tabs">
            <button
              className={`tab ${filter === 'PENDING' ? 'active' : ''}`}
              onClick={() => handleFilterChange('PENDING')}
            >
              <Clock size={18} />
              Pendentes
              {filter === 'PENDING' && activities.length > 0 && (
                <span className="badge-count">{activities.length}</span>
              )}
            </button>
            <button
              className={`tab ${filter === 'APPROVED' ? 'active' : ''}`}
              onClick={() => handleFilterChange('APPROVED')}
            >
              <Check size={18} />
              Aprovadas
            </button>
            <button
              className={`tab ${filter === 'REJECTED' ? 'active' : ''}`}
              onClick={() => handleFilterChange('REJECTED')}
            >
              <X size={18} />
              Rejeitadas
            </button>
          </div>

          <div className="approvals-card">
            {loading ? (
              <div className="loading-state">
                <p>Carregando atividades...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="empty-state">
                <CheckSquare size={48} />
                <p>Nenhuma atividade {formatActivityStatus(filter).toLowerCase()}</p>
              </div>
            ) : (
              <div className="activities-table">
                <table>
                  <thead>
                    <tr>
                      <th>Voluntário</th>
                      <th>Data</th>
                      <th>Título</th>
                      <th>Duração</th>
                      <th>Status</th>
                      {filter === 'PENDING' && <th>Ações</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity) => {
                      const isSelected = selectedActivityId === activity.id;

                      return (
                        <Fragment key={activity.id}>
                          <tr
                            onClick={() => handleToggleDetails(activity.id)}
                            className={isSelected ? 'selected-row' : ''}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>
                              <div className="volunteer-info">
                                <strong>{activity.volunteerName}</strong>
                                
                              </div>
                            </td>
                            <td>{formatDate(activity.date)}</td>
                            <td>
                              <div className="description-cell">{activity.title}</div>
                            </td>
                            <td>{formatDuration(activity.durationMinutes)}</td>
                            <td>
                              <span className={`badge badge-${activity.activityStatus.toLowerCase()}`}>
                                {formatActivityStatus(activity.activityStatus)}
                              </span>
                            </td>
                            {filter === 'PENDING' && (
                              <td>
                                <div className="action-buttons">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(activity.id, 'APPROVED');
                                    }}
                                    className="btn-icon btn-approve"
                                    title="Aprovar"
                                  >
                                    <Check size={18} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(activity.id, 'REJECTED');
                                    }}
                                    className="btn-icon btn-reject"
                                    title="Rejeitar"
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>

                          {isSelected && (
                            <tr className="details-row">
                              <td colSpan={filter === 'PENDING' ? 6 : 5}>
                                <div className="approval-details-inline">
                                  <h3>Detalhes da Atividade</h3>
                                  <div className="approval-details-grid">
                                    <div className="approval-section">
                                      <h4>Voluntário</h4>
                                      <p><strong>Nome:</strong> {activity.volunteerName}</p>
                                      <p><strong>Setor:</strong> {departmentMap[activity.departmentId] || activity.departmentName || '-'}</p>
                                    </div>

                                    <div className="approval-section">
                                      <h4>Atividade</h4>
                                      <p><strong>Data:</strong> {formatDate(activity.date)}</p>
                                      <p><strong>Duração:</strong> {formatDuration(activity.durationMinutes)}</p>
                                      <p><strong>Status:</strong> {formatActivityStatus(activity.activityStatus)}</p>
                                    </div>

                                    <div className="approval-section full-width">
                                      <h4>Descrição Completa</h4>
                                      <p>{activity.description}</p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Approvals;

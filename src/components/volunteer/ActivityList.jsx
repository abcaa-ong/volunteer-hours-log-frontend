import { useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { formatDate, formatDuration, formatActivityStatus } from '../../utils/formatters';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import './ActivityList.css';

const PREVIEW_CHARACTER_LIMIT = 100;

const ActivityList = ({ activities, onEdit, onDelete, onRefresh }) => {
  const { canEditOwnActivity, canDeleteOwnActivity } = usePermissions();
  const [filter, setFilter] = useState('ALL');
  const [expandedActivityId, setExpandedActivityId] = useState(null);

  const filteredActivities = activities.filter((activity) => {
    if (filter === 'ALL') return true;
    return activity.activityStatus === filter;
  });

  const handleDelete = async (activity) => {
    if (!canDeleteOwnActivity(activity)) {
      toast.error('Você só pode deletar atividades pendentes');
      return;
    }

    if (!window.confirm('Deseja realmente deletar esta atividade?')) {
      return;
    }

    try {
      await onDelete(activity.id);
      toast.success('Atividade deletada com sucesso!');
      if (onRefresh) onRefresh();
    } catch {
      toast.error('Erro ao deletar atividade');
    }
  };

  const handleToggleDescription = (activityId) => {
    setExpandedActivityId((currentId) => (currentId === activityId ? null : activityId));
  };

  const handleEdit = (activity) => {
    if (!canEditOwnActivity(activity)) {
      toast.error('Você só pode editar atividades pendentes');
      return;
    }

    if (onEdit) onEdit(activity);
  };

  return (
    <div className="activity-list-container">
      <div className="list-header">
        <h2>Minhas Atividades</h2>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            Todas ({activities.length})
          </button>
          <button
            className={`filter-btn ${filter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setFilter('PENDING')}
          >
            Pendentes ({activities.filter((a) => a.activityStatus === 'PENDING').length})
          </button>
          <button
            className={`filter-btn ${filter === 'APPROVED' ? 'active' : ''}`}
            onClick={() => setFilter('APPROVED')}
          >
            Aprovadas ({activities.filter((a) => a.activityStatus === 'APPROVED').length})
          </button>
          <button
            className={`filter-btn ${filter === 'REJECTED' ? 'active' : ''}`}
            onClick={() => setFilter('REJECTED')}
          >
            Rejeitadas ({activities.filter((a) => a.activityStatus === 'REJECTED').length})
          </button>
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>Nenhuma atividade encontrada</h3>
          <p>
            {filter === 'ALL'
              ? 'Você ainda não registrou nenhuma atividade.'
              : `Você não tem atividades ${formatActivityStatus(filter).toLowerCase()}.`}
          </p>
        </div>
      ) : (
        <div className="activities-grid">
          {filteredActivities.map((activity) => {
            const isExpanded = expandedActivityId === activity.id;
            const isLongDescription = activity.description.length > PREVIEW_CHARACTER_LIMIT;
            const previewDescription = isLongDescription
              ? `${activity.description.slice(0, PREVIEW_CHARACTER_LIMIT).trimEnd()}...`
              : activity.description;
            const remainingDescription = isLongDescription
              ? activity.description.slice(PREVIEW_CHARACTER_LIMIT).trimStart()
              : '';

            return (
              <div key={activity.id} className="activity-card">
                <div className="card-header">
                  <div className="activity-date">
                    <span className="date-icon">📅</span>
                    <span>{formatDate(activity.date)}</span>
                  </div>
                  <span className={`badge badge-${activity.activityStatus.toLowerCase()}`}>
                    {formatActivityStatus(activity.activityStatus)}
                  </span>
                </div>

                <div className="card-body">
                  <div className="activity-duration">
                    <span className="duration-icon">⏱️</span>
                    <span>{formatDuration(activity.durationMinutes)}</span>
                  </div>

                  <p className="activity-title">{activity.title}</p>

                  {isExpanded && activity.description && (
                    <div className="activity-description-expanded">
                      <p>{activity.description}</p>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  {canEditOwnActivity(activity) ? (
                    <>

                        <button
                      onClick={() => handleToggleDescription(activity.id)}
                      className="btn-icon btn-view"
                      title={isExpanded ? 'Ocultar descrição' : 'Visualizar descrição'}
                      disabled={!isLongDescription && !activity.description}
                    >
                      <Eye size={18} />
                      <span>{isLongDescription ? (isExpanded ? 'Ocultar' : 'Detalhes') : 'Detalhes'}</span>
                    </button>

                      <button
                        onClick={() => handleEdit(activity)}
                        className="btn-icon btn-edit"
                        title="Editar"
                      >
                        <Pencil size={18} />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDelete(activity)}
                        className="btn-icon btn-delete"
                        title="Deletar"
                      >
                        <Trash2 size={18} />
                        <span>Deletar</span>
                      </button>

                    </>
                  ) : (
                    <button
                      onClick={() => handleToggleDescription(activity.id)}
                      className="btn-icon btn-view"
                      title={isExpanded ? 'Ocultar descrição' : 'Visualizar descrição'}
                      disabled={!isLongDescription && !activity.description}
                    >
                      <Eye size={18} />
                      <span>{isLongDescription ? (isExpanded ? 'Ocultar' : 'Detalhes') : 'Detalhes'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityList;

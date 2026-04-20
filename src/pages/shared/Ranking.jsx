import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchRanking } from '../../service/activityApi';
import { formatDuration } from '../../utils/formatters';
import { toast } from 'react-toastify';
import { Trophy, Calendar, RotateCcw } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import './Ranking.css';

const MEDAL = ['🥇', '🥈', '🥉'];

const Ranking = () => {
  const { token } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadRanking = useCallback(async (start, end) => {
    try {
      setLoading(true);
      const data = await fetchRanking(token, start || undefined, end || undefined);
      setRanking(data);
    } catch (error) {
      if (error.name === 'SessionExpiredError') return;
      toast.error('Erro ao carregar ranking');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadRanking('', '');
  }, [loadRanking, token]);

  const handleFilter = (e) => {
    e.preventDefault();
    if ((startDate && !endDate) || (!startDate && endDate)) {
      toast.error('Preencha as duas datas para filtrar por período');
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      toast.error('A data de início deve ser anterior à data de fim');
      return;
    }
    loadRanking(startDate, endDate);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    loadRanking('', '');
  };

  const shortName = (name) => {
    const parts = name?.trim()?.split(/\s+/).filter(Boolean) || [];
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    if (parts.length <= 1) return cap(parts[0] || '');
    return `${cap(parts[0])} ${cap(parts[parts.length - 1])}`;
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="content">
        <div className="ranking-page">
          <div className="page-header">
            <Trophy size={32} />
            <div>
              <h1>Ranking de Voluntários</h1>
              <p className="subtitle">Voluntários com mais horas aprovadas</p>
            </div>
          </div>

          <div className="ranking-card">
            <form className="ranking-filters" onSubmit={handleFilter}>
              <div className="filter-group">
                <label htmlFor="startDate">
                  <Calendar size={16} />
                  Data de início
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="endDate">
                  <Calendar size={16} />
                  Data de fim
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="filter-actions">
                <button type="submit" className="btn-filter">
                  Filtrar
                </button>
                <button type="button" className="btn-reset" onClick={handleReset} title="Limpar filtros">
                  <RotateCcw size={16} />
                </button>
              </div>
            </form>

            {loading ? (
              <div className="loading-state">
                <p>Carregando ranking...</p>
              </div>
            ) : ranking.length === 0 ? (
              <div className="empty-state">
                <Trophy size={48} />
                <p>Nenhum dado encontrado para o período selecionado</p>
              </div>
            ) : (
              <div className="ranking-table-wrapper">
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th className="col-rank">Posição</th>
                      <th>Nome</th>
                      <th>Setor</th>
                      <th className="col-num">Horas</th>
                      <th className="col-num">Atividades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((item) => (
                      <tr key={item.volunteerId} className={item.rank <= 3 ? `top-${item.rank}` : ''}>
                        <td className="col-rank">
                          <span className="rank-badge">
                            {item.rank <= 3 ? MEDAL[item.rank - 1] : `${item.rank}º`}
                          </span>
                        </td> 
                        
                        <td>
                          <strong>{shortName(item.volunteerName)}</strong>  
                      </td>
                                            
                        <td>{item.department}</td>
                        <td className="col-num">
                          <span className="hours-badge">
                            {formatDuration(item.totalMinutes)}
                          </span>
                        </td>
                        <td className="col-num">{item.totalActivities}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Ranking;

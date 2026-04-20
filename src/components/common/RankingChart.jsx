import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchRanking } from '../../service/activityApi';
import { formatDuration } from '../../utils/formatters';
import { Trophy } from 'lucide-react';

const MEDAL = ['🥇', '🥈', '🥉'];
const TOP = 5;

const RankingChart = ({ baseRoute }) => {
  const { token } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchRanking(token)
      .then((data) => setRanking((data || []).slice(0, TOP)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const maxMinutes = ranking[0]?.totalMinutes || 1;

  return (
    <div className="ranking-chart-card">
      <div className="ranking-chart-header">
        <Trophy size={20} />
        <h3>Top Voluntários</h3>
        <Link to={`${baseRoute}/ranking`} className="ranking-chart-link">
          Ver completo →
        </Link>
      </div>

      {loading ? (
        <p className="ranking-chart-empty">Carregando...</p>
      ) : ranking.length === 0 ? (
        <p className="ranking-chart-empty">Nenhum dado disponível</p>
      ) : (
        <ul className="ranking-chart-list">
          {ranking.map((item) => (
            <li key={item.volunteerId} className="ranking-chart-item">
              <span className="ranking-chart-medal">
                {item.rank <= 3 ? MEDAL[item.rank - 1] : `${item.rank}º`}
              </span>
              <div className="ranking-chart-info">
                <div className="ranking-chart-name-row">
                  <span className="ranking-chart-name">{item.volunteerName}</span>
                  <span className="ranking-chart-hours">{formatDuration(item.totalMinutes)}</span>
                </div>
                <div className="ranking-chart-track">
                  <div
                    className="ranking-chart-bar"
                    style={{ width: `${(item.totalMinutes / maxMinutes) * 100}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RankingChart;

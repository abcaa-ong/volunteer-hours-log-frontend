import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import RankingChart from '../../components/common/RankingChart';
import './Dashboard.css';

const VolunteerDashboard = () => {
  const { user } = useAuth();

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
        <div className="welcome-card">
          <h1>Bem-vindo, {shortName(user?.name)}! 👋</h1>
          <p className="subtitle">
            Painel do Voluntário
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">📝</div>
            <h3>Minhas Atividades</h3>
            <p>Registre e acompanhe suas atividades</p>
            <Link to="/volunteer/activities" className="card-link">
              Acessar →
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">👤</div>
            <h3>Meu Perfil</h3>
            <p>Visualize e edite seus dados</p>
            <Link to="/volunteer/profile" className="card-link">
              Acessar →
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3>Meus Relatórios</h3>
            <p>Consulte suas horas e gere certificados</p>
            <Link to="/volunteer/reports" className="card-link">
              Acessar →
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🏆</div>
            <h3>Ranking</h3>
            <p>Veja os voluntários com mais horas aprovadas</p>
            <Link to="/volunteer/ranking" className="card-link">
              Acessar →
            </Link>
          </div>
        </div>

        <RankingChart baseRoute="/volunteer" />
      </div>
      <Footer />
    </div>
  );
};

export default VolunteerDashboard;

import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import RankingChart from '../../components/common/RankingChart';
import '../volunteer/Dashboard.css';

const shortName = (name) => {
  const parts = name?.trim()?.split(/\s+/).filter(Boolean) || [];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  if (parts.length <= 1) return cap(parts[0] || '');
  return `${cap(parts[0])} ${cap(parts[parts.length - 1])}`;
};

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <Sidebar />
      <div className="content">
        <div className="welcome-card">
          <h1>Bem-vindo, {shortName(user?.name)}! 👋</h1>
          <p className="subtitle">
            Painel do Administrador
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">👥</div>
            <h3>Voluntários</h3>
            <p>Gerencie todos os voluntários</p>
            <a href="/admin/volunteers" className="card-link">
              Acessar →
            </a>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">✅</div>
            <h3>Aprovações</h3>
            <p>Aprovar ou rejeitar atividades</p>
            <a href="/admin/approvals" className="card-link">
              Acessar →
            </a>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🏢</div>
            <h3>Setores</h3>
            <p>Gerencie os setores da organização</p>
            <a href="/admin/departments" className="card-link">
              Acessar →
            </a>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📝</div>
            <h3>Minhas Atividades</h3>
            <p>Registre suas próprias atividades</p>
            <a href="/admin/activities" className="card-link">
              Acessar →
            </a>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🏆</div>
            <h3>Ranking</h3>
            <p>Voluntários com mais horas aprovadas</p>
            <a href="/admin/ranking" className="card-link">
              Acessar →
            </a>
          </div>
        </div>

        <RankingChart baseRoute="/admin" />
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;

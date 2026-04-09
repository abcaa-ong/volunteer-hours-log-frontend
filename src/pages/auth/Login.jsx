import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as loginAPI } from '../../service/authApi';
import { toast } from 'react-toastify';
import logo from '../../assets/logo.png';
import './auth.css';


const Login = () => {
  // Estado do formulário
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState('');

  const { login } = useAuth();

  useEffect(() => {
    if (sessionStorage.getItem('sessionExpired')) {
      sessionStorage.removeItem('sessionExpired');
      setSessionExpiredMsg('Sua sessão expirou. Faça login novamente.');
    }
  }, []);
  const navigate = useNavigate();

  // Atualiza o state quando um campo muda
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manipula o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Faz login na API
      const response = await loginAPI(credentials);
      
      // Salva dados no contexto
      login(
        response.userType,
        response.name,
        response.volunteerId,
        response.departmentId,
        response.email,
        response.token
      );
      
      // Mostra mensagem de sucesso
      toast.success(`Bem-vindo, ${response.name}!`);
      
      // Redireciona baseado no tipo de usuário
      if (response.userType === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/volunteer/dashboard');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="ABCAA Logo" className="auth-logo" />
        <div className="auth-header">
          <h1>Sistema ABCAA</h1>
          <p>Faça login para continuar</p>
        </div>

        {sessionExpiredMsg && (
          <p className="error-message">{sessionExpiredMsg}</p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="auth-actions">
            <Link to="/forgot-password" className="auth-inline-link">
              Esqueceu sua senha?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary btn-block"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Não tem uma conta? <Link to="/register">Registre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

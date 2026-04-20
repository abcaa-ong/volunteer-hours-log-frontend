import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchVolunteerProfile, saveVolunteerProfile } from '../../service/profileApi';
import { validateCPF, validatePhone, validateZipCode } from '../../utils/validators';
import { toast } from 'react-toastify';
import { Save, Loader } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import './Profile.css';

const shortName = (name) => {
  const parts = name?.trim()?.split(/\s+/).filter(Boolean) || [];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  if (parts.length <= 1) return cap(parts[0] || '');
  return `${cap(parts[0])} ${cap(parts[parts.length - 1])}`;
};

const formatPhone = (value) => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 11);

  if (digitsOnly.length <= 2) {
    return digitsOnly ? `(${digitsOnly}` : '';
  }

  if (digitsOnly.length <= 6) {
    return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2)}`;
  }

  if (digitsOnly.length <= 10) {
    return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 6)}-${digitsOnly.slice(6)}`;
  }

  return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 7)}-${digitsOnly.slice(7)}`;
};

const formatCPF = (value) => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 11);

  if (digitsOnly.length <= 3) {
    return digitsOnly;
  }

  if (digitsOnly.length <= 6) {
    return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3)}`;
  }

  if (digitsOnly.length <= 9) {
    return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3, 6)}.${digitsOnly.slice(6)}`;
  }

  return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3, 6)}.${digitsOnly.slice(6, 9)}-${digitsOnly.slice(9)}`;
};

const formatZipCode = (value) => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 8);

  if (digitsOnly.length <= 5) {
    return digitsOnly;
  }

  return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5)}`;
};

const Profile = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    birthDate: '',
    cpf: ''
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await fetchVolunteerProfile(token);
      if (profile) {
        setFormData({
          phone: profile.phone ? formatPhone(profile.phone) : '',
          zipCode: profile.zipCode ? formatZipCode(profile.zipCode) : '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          birthDate: profile.birthDate ? profile.birthDate.slice(0, 10) : '',
          cpf: profile.cpf ? formatCPF(profile.cpf) : ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'phone') formattedValue = formatPhone(value);
    if (name === 'cpf') formattedValue = formatCPF(value);
    if (name === 'zipCode') formattedValue = formatZipCode(value);

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const validateForm = () => {
    if (formData.cpf && !validateCPF(formData.cpf)) {
      toast.error('CPF inválido');
      return false;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      toast.error('Telefone inválido');
      return false;
    }

    if (formData.zipCode && !validateZipCode(formData.zipCode)) {
      toast.error('CEP inválido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      const savedProfile = await saveVolunteerProfile(formData, token);
      if (savedProfile) {
        setFormData({
          phone: savedProfile.phone ? formatPhone(savedProfile.phone) : formData.phone || '',
          zipCode: savedProfile.zipCode ? formatZipCode(savedProfile.zipCode) : formData.zipCode || '',
          address: savedProfile.address || formData.address || '',
          city: savedProfile.city || formData.city || '',
          state: savedProfile.state || formData.state || '',
          birthDate: savedProfile.birthDate ? savedProfile.birthDate.slice(0, 10) : formData.birthDate || '',
          cpf: savedProfile.cpf ? formatCPF(savedProfile.cpf) : formData.cpf || ''
        });
      }
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      if (error.name === 'SessionExpiredError') return;
      toast.error(error.message || 'Erro ao salvar perfil');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <Sidebar />
        <div className="content">
          <div className="profile-page">
            <div className="loading-container">
              <Loader className="spinner" size={40} />
              <p>Carregando perfil...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="container">
      <Sidebar />
      <div className="content">
        <div className="profile-page">
          <div className="page-header">
            <div>
              <h1>Meu Perfil</h1>
              <p className="subtitle">Complete seus dados pessoais</p>
            </div>
          </div>

          <div className="profile-card">
            <div className="user-info">
              <h3>{shortName(user?.name)}</h3>
              <p>{user?.email}</p>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>CPF</label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    maxLength="14"
                    inputMode="numeric"
                    autoComplete="off"
                  />
                  <small className="field-hint">Digite apenas os numeros que o formato e aplicado automaticamente.</small>
                </div>

                <div className="form-group">
                  <label>Data de Nascimento</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    maxLength="15"
                    inputMode="numeric"
                    autoComplete="tel-national"
                  />
                  <small className="field-hint">Digite apenas os numeros que o formato e aplicado automaticamente.</small>
                </div>

                <div className="form-group">
                  <label>CEP</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="00000-000"
                    maxLength="9"
                    inputMode="numeric"
                    autoComplete="postal-code"
                  />
                  <small className="field-hint">Digite apenas os numeros que o formato e aplicado automaticamente.</small>
                </div>
              </div>

              <div className="form-group">
                <label>Endereço</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cidade</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Cidade"
                  />
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  >
                    <option value="">Selecione</option>
                    <option value="AC">AC</option>
                    <option value="AL">AL</option>
                    <option value="AP">AP</option>
                    <option value="AM">AM</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                    <option value="GO">GO</option>
                    <option value="MA">MA</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="MG">MG</option>
                    <option value="PA">PA</option>
                    <option value="PB">PB</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="PI">PI</option>
                    <option value="RJ">RJ</option>
                    <option value="RN">RN</option>
                    <option value="RS">RS</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="SC">SC</option>
                    <option value="SP">SP</option>
                    <option value="SE">SE</option>
                    <option value="TO">TO</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={saving} className="btn btn-primary">
                  <Save size={18} />
                  {saving ? 'Salvando...' : 'Salvar Perfil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;

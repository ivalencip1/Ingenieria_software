import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap, BookOpen, GraduationCap, Pencil, Palette, Puzzle, Users, Rocket, Star, Globe, Heart, Trophy, BarChart3, Clock, Bell } from 'lucide-react';
import './OnboardingSurvey.css';

const OnboardingSurvey = ({ usuarioId, onComplete }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    connection_level: '',
    professional_stage: '',
    challenge_types: [],
    motivating_topics: [],
    main_motivation: '',
    frequency: '',
    notification_method: ''
  });

  const steps = [
    {
      title: '¡Hola! 👋',
      subtitle: 'Cuéntanos un poco sobre ti',
      questions: []
    },
    {
      title: '🎯 Tu Situación Actual',
      subtitle: 'Ayúdanos a entender mejor tu contexto',
      questions: [
        {
          id: 'connection_level',
          label: '¿Cuál es tu nivel de conexión con la gamificación?',
          type: 'radio',
          options: [
            { value: 'starting', label: 'Estoy comenzando', icon: Zap },
            { value: 'occasional', label: 'Participación ocasional', icon: BarChart3 },
            { value: 'frequent', label: 'Muy comprometido', icon: Trophy }
          ]
        },
        {
          id: 'professional_stage',
          label: '¿En qué etapa profesional te encuentras?',
          type: 'radio',
          options: [
            { value: 'seeking', label: 'En búsqueda de oportunidades', icon: Pencil },
            { value: 'learning', label: 'En proceso de aprendizaje', icon: BookOpen },
            { value: 'growing', label: 'Crecimiento profesional', icon: GraduationCap }
          ]
        }
      ]
    },
    {
      title: '💡 Tus Intereses',
      subtitle: 'Selecciona los tipos de desafíos que te interesan',
      questions: [
        {
          id: 'challenge_types',
          label: 'Tipos de desafíos que te atraen (selecciona varios):',
          type: 'checkbox',
          options: [
            { value: 'technical', label: 'Técnicos y de programación', icon: Puzzle },
            { value: 'creative', label: 'Creativos e innovadores', icon: Palette },
            { value: 'problem_solving', label: 'Resolución de problemas', icon: Puzzle },
            { value: 'communication', label: 'Comunicación y liderazgo', icon: Users },
            { value: 'collaboration', label: 'Trabajo en equipo', icon: Users }
          ]
        },
        {
          id: 'motivating_topics',
          label: 'Temas que más te motivan (selecciona varios):',
          type: 'checkbox',
          options: [
            { value: 'technology', label: 'Tecnología e innovación', icon: Rocket },
            { value: 'personal_growth', label: 'Desarrollo personal', icon: Star },
            { value: 'sustainability', label: 'Sostenibilidad', icon: Globe },
            { value: 'social_impact', label: 'Impacto social', icon: Heart },
            { value: 'health', label: 'Salud y bienestar', icon: Heart }
          ]
        }
      ]
    },
    {
      title: '🎁 Preferencias Finales',
      subtitle: 'Personaliza tu experiencia',
      questions: [
        {
          id: 'main_motivation',
          label: '¿Qué te motiva principalmente?',
          type: 'radio',
          options: [
            { value: 'rewards', label: 'Ganar recompensas', icon: Trophy },
            { value: 'progress', label: 'Ver mi progreso', icon: BarChart3 },
            { value: 'sharing', label: 'Compartir logros', icon: Users },
            { value: 'challenge', label: 'Aceptar desafíos', icon: Zap }
          ]
        },
        {
          id: 'frequency',
          label: '¿Con qué frecuencia prefieres participar?',
          type: 'radio',
          options: [
            { value: 'daily', label: 'Diariamente', icon: Clock },
            { value: 'weekly', label: 'Semanalmente', icon: Clock },
            { value: 'monthly', label: 'Mensualmente', icon: Clock }
          ]
        },
        {
          id: 'notification_method',
          label: '¿Cómo prefieres recibir notificaciones?',
          type: 'radio',
          options: [
            { value: 'email', label: 'Correo electrónico', icon: Pencil },
            { value: 'whatsapp', label: 'WhatsApp', icon: Users },
            { value: 'app', label: 'Notificaciones en la app', icon: Bell }
          ]
        }
      ]
    }
  ];

  const handleRadioChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxChange = (questionId, value) => {
    setFormData(prev => {
      const current = prev[questionId] || [];
      if (current.includes(value)) {
        return {
          ...prev,
          [questionId]: current.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [questionId]: [...current, value]
        };
      }
    });
  };

  const handleTextareaChange = (e) => {
    const value = e.target.value.substring(0, 200);
    setFormData(prev => ({
      ...prev,
      bio: value
    }));
  };

  const isStepValid = () => {
    const step = steps[currentStep];
    return step.questions.every(q => {
      const value = formData[q.id];
      if (q.type === 'textarea') {
        return value.trim().length > 0;
      } else if (q.type === 'checkbox') {
        return Array.isArray(value) && value.length > 0;
      } else {
        return value !== '';
      }
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/survey/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: usuarioId,
          ...formData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la encuesta');
      }

      const data = await response.json();
      
      // Actualizar usuario en localStorage con survey_completed = true
      const usuarioActualizado = {
        ...data.user,
        survey_completed: true
      };
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));

      setCompleted(true);
      
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al guardar la encuesta: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="onboarding-container">
        <div className="survey-card">
          <div className="success-message">
            <div>
              <div className="success-icon">✅</div>
              <div className="success-title">¡Perfecto!</div>
              <div className="success-subtitle">Tu perfil ha sido configurado exitosamente</div>
              <p style={{ color: '#999', fontSize: '14px' }}>Redireccionando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const step = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="onboarding-container">
      <div className="survey-card">
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="progress-text">Paso {currentStep + 1} de {steps.length}</div>
        </div>

        <div className="step-section">
          <h2 className="survey-title">{step.title}</h2>
          <p className="survey-subtitle">{step.subtitle}</p>

          {step.questions.map(question => (
            <div key={question.id} className="question-group">
              <label className="question-label">{question.label}</label>

              {question.type === 'radio' && (
                <div className="options-grid">
                  {question.options.map(option => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.value}
                        className={`option-button ${formData[question.id] === option.value ? 'selected' : ''}`}
                        onClick={() => handleRadioChange(question.id, option.value)}
                      >
                        <IconComponent className="option-icon" size={20} />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {question.type === 'checkbox' && (
                <div className="checkbox-group">
                  {question.options.map(option => {
                    const IconComponent = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={`checkbox-wrapper ${
                          (formData[question.id] || []).includes(option.value) ? 'checked' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="checkbox-input"
                          checked={(formData[question.id] || []).includes(option.value)}
                          onChange={() => handleCheckboxChange(question.id, option.value)}
                        />
                        <IconComponent size={20} style={{ marginRight: '10px' }} />
                        <span className="checkbox-label">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {question.type === 'textarea' && (
                <div>
                  <textarea
                    className="biography-textarea"
                    placeholder={question.placeholder}
                    value={formData[question.id]}
                    onChange={handleTextareaChange}
                    maxLength={200}
                  />
                  <div className="biography-char-count">
                    {formData[question.id].length}/200
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="button-group">
          <button
            className="btn btn-secondary"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft size={20} style={{ marginRight: '8px', display: 'inline' }} />
            Atrás
          </button>
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!isStepValid() || loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner" style={{ marginRight: '8px', display: 'inline-block' }}></span>
                Guardando...
              </>
            ) : (
              <>
                {currentStep === steps.length - 1 ? 'Completar' : 'Siguiente'}
                {currentStep < steps.length - 1 && <ChevronLeft size={20} style={{ marginLeft: '8px', display: 'inline', transform: 'rotate(180deg)' }} />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSurvey;

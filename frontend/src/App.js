import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ChallengesPage from './components/ChallengesPage';
import ProfilePage from './components/ProfilePage';
import SkillsShowcase from './components/SkillsShowcase';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Components
const Header = () => {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div 
              onClick={() => setCurrentPage('home')}
              className="cursor-pointer flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  UBUNTOO
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Je suis parce que nous sommes</p>
              </div>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => setCurrentPage('home')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 'home' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              🏠 Accueil
            </button>
            <button
              onClick={() => setCurrentPage('challenges')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 'challenges' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              🚀 Défis
            </button>
            <button
              onClick={() => setCurrentPage('profile')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 'profile' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              👤 Profil
            </button>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
              <p className="text-xs text-gray-500">{user?.job_title || 'Membre Ubuntu'}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <button
              onClick={logout}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    full_name: '',
    job_title: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData);
    }

    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-3xl">U</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            UBUNTOO
          </h1>
          <p className="text-lg text-gray-600 mb-2">Le réseau social de l'altérité et de l'action</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-800 italic font-medium">
              💫 "Je suis parce que nous sommes"
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email professionnel
              </label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-lg px-3 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="votre.email@exemple.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-lg px-3 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-lg px-3 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="nom_utilisateur"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    name="full_name"
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-lg px-3 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Prénom Nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poste actuel
                  </label>
                  <input
                    name="job_title"
                    type="text"
                    value={formData.job_title}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-lg px-3 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ex: Développeur, Consultant, Étudiant..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio / Présentation Ubuntu
                  </label>
                  <textarea
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-lg px-3 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Partagez vos valeurs, vos engagements, ce qui vous anime..."
                  />
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Chargement...
                  </div>
                ) : (
                  <>
                    {isLogin ? (
                      <span>🚀 Se connecter à UBUNTOO</span>
                    ) : (
                      <span>🌟 Rejoindre la communauté Ubuntu</span>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              {isLogin ? 
                '🆕 Pas encore membre ? Rejoignez la communauté Ubuntu' : 
                '👋 Déjà membre ? Se connecter'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PostForm = ({ onPostCreated }) => {
  const [formData, setFormData] = useState({
    content: '',
    post_type: 'idea',
    tags: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await axios.post(`${API}/posts`, postData);
      setFormData({ content: '', post_type: 'idea', tags: '' });
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const postTypes = [
    { value: 'idea', label: '💡 Idée innovante', description: 'Partagez une idée créative' },
    { value: 'action', label: '🎯 Action concrète', description: 'Décrivez une action réalisée' },
    { value: 'testimony', label: '❤️ Témoignage', description: 'Racontez votre expérience' },
    { value: 'challenge', label: '🚀 Défi relevé', description: 'Partagez un défi que vous avez relevé' },
    { value: 'success', label: '✨ Réussite', description: 'Célébrez vos accomplissements' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <span className="mr-2">📝</span>
        Partager avec la communauté Ubuntu
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Type de publication</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {postTypes.map((type) => (
              <label
                key={type.value}
                className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                  formData.post_type === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="post_type"
                  value={type.value}
                  checked={formData.post_type === type.value}
                  onChange={(e) => setFormData({ ...formData, post_type: e.target.value })}
                  className="sr-only"
                />
                <div className="text-lg font-medium mb-1">{type.label}</div>
                <div className="text-xs text-gray-500">{type.description}</div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Votre message Ubuntu</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Partagez votre idée, action, témoignage... Comment incarnez-vous les valeurs Ubuntu dans votre parcours ?"
            rows="4"
            required
            className="block w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags (optionnel)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Ex: innovation, équipe, formation (séparés par des virgules)"
            className="block w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-sm disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Publication en cours...
            </div>
          ) : (
            <span>🚀 Publier dans la communauté</span>
          )}
        </button>
      </form>
    </div>
  );
};

const PostCard = ({ post }) => {
  const getPostTypeConfig = (type) => {
    const configs = {
      idea: { icon: '💡', label: 'Idée', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      action: { icon: '🎯', label: 'Action', color: 'bg-green-100 text-green-800 border-green-200' },
      testimony: { icon: '❤️', label: 'Témoignage', color: 'bg-red-100 text-red-800 border-red-200' },
      challenge: { icon: '🚀', label: 'Défi', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      success: { icon: '✨', label: 'Réussite', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    };
    return configs[type] || { icon: '📝', label: 'Publication', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const config = getPostTypeConfig(post.post_type);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold">
            {post.user?.full_name?.charAt(0) || 'U'}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <h4 className="font-semibold text-gray-900">{post.user?.full_name}</h4>
            <span className="text-sm text-gray-500">@{post.user?.username}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          {post.user?.job_title && (
            <p className="text-sm text-gray-600 mb-3">{post.user.job_title}</p>
          )}
          
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium mb-4 ${config.color}`}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </div>
          
          <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
              <span>👍</span>
              <span>{post.likes_count}</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
              <span>💬</span>
              <span>{post.comments_count}</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
              <span>🔄</span>
              <span>{post.shares_count}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'challenges':
        return <ChallengesPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Bienvenue sur UBUNTOO, {user?.full_name} ! 🌟
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Partagez vos idées, actions et témoignages pour construire ensemble 
                une communauté d'entraide et d'innovation sociale.
              </p>
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                <p className="text-blue-800 text-sm italic font-medium">
                  💫 "Je suis parce que nous sommes" - Ensemble, créons l'impact !
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <PostForm onPostCreated={fetchPosts} />

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">🌊</span>
                    Fil d'actualité Ubuntu
                  </h3>
                  
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-4">Chargement des publications...</p>
                    </div>
                  ) : posts.length > 0 ? (
                    posts.map((post) => <PostCard key={post.id} post={post} />)
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
                      <span className="text-6xl mb-4 block">🌱</span>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Première graine Ubuntu
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Aucune publication pour le moment.
                      </p>
                      <p className="text-gray-400 text-sm">
                        Soyez le premier à partager quelque chose d'inspirant !
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <SkillsShowcase user={user} isOwner={true} />
                
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🎯 Actions rapides
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setCurrentPage('challenges')}
                      className="w-full text-left bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-4 rounded-lg border border-purple-200 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🚀</span>
                        <div>
                          <div className="font-medium text-purple-900">Défis communautaires</div>
                          <div className="text-sm text-purple-600">Participez aux challenges Ubuntu</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage('profile')}
                      className="w-full text-left bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-4 rounded-lg border border-blue-200 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">👤</span>
                        <div>
                          <div className="font-medium text-blue-900">Mon profil Ubuntu</div>
                          <div className="text-sm text-blue-600">Gérez vos skills et badges</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {renderPage()}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">U</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            UBUNTOO
          </h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement de la communauté Ubuntu...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthForm />;
};

export default App;

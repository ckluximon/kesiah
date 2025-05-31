import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/users/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/register`, userData);
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Components
const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-blue-600">UBUNTOO</h1>
            <p className="text-sm text-gray-600 hidden md:block">Je suis parce que nous sommes</p>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Accueil</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Communauté</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Défis</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Badges</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">Bonjour, {user?.full_name}</span>
            <button
              onClick={logout}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">UBUNTOO</h1>
          <p className="text-lg text-gray-600 mb-2">Le réseau social de l'altérité et de l'action</p>
          <p className="text-sm text-gray-500 italic">"Je suis parce que nous sommes"</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom d'utilisateur
                  </label>
                  <input
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom complet
                  </label>
                  <input
                    name="full_name"
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Poste actuel
                  </label>
                  <input
                    name="job_title"
                    type="text"
                    value={formData.job_title}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio / Présentation
                  </label>
                  <textarea
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-500"
            >
              {isLogin ? 'Pas encore membre ? S\'inscrire' : 'Déjà membre ? Se connecter'}
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Partager une publication</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <select
            value={formData.post_type}
            onChange={(e) => setFormData({ ...formData, post_type: e.target.value })}
            className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="idea">💡 Idée</option>
            <option value="action">🎯 Action</option>
            <option value="testimony">❤️ Témoignage</option>
            <option value="challenge">🚀 Défi</option>
            <option value="success">✨ Réussite</option>
          </select>
        </div>

        <div>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Partagez votre idée, action, témoignage..."
            rows="4"
            required
            className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Tags (séparés par des virgules)"
            className="block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Publication...' : 'Publier'}
        </button>
      </form>
    </div>
  );
};

const PostCard = ({ post }) => {
  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'idea': return '💡';
      case 'action': return '🎯';
      case 'testimony': return '❤️';
      case 'challenge': return '🚀';
      case 'success': return '✨';
      default: return '📝';
    }
  };

  const getPostTypeLabel = (type) => {
    switch (type) {
      case 'idea': return 'Idée';
      case 'action': return 'Action';
      case 'testimony': return 'Témoignage';
      case 'challenge': return 'Défi';
      case 'success': return 'Réussite';
      default: return 'Publication';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-semibold">
            {post.user?.full_name?.charAt(0) || 'U'}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold text-gray-900">{post.user?.full_name}</h4>
            <span className="text-sm text-gray-500">@{post.user?.username}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
          
          {post.user?.job_title && (
            <p className="text-sm text-gray-600 mb-2">{post.user.job_title}</p>
          )}
          
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg">{getPostTypeIcon(post.post_type)}</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {getPostTypeLabel(post.post_type)}
            </span>
          </div>
          
          <p className="text-gray-800 mb-3">{post.content}</p>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <button className="flex items-center space-x-1 hover:text-blue-600">
              <span>👍</span>
              <span>{post.likes_count}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-blue-600">
              <span>💬</span>
              <span>{post.comments_count}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-blue-600">
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

  return (
    <div>
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenue sur UBUNTOO, {user?.full_name} ! 🌟
          </h2>
          <p className="text-gray-600">
            Partagez vos idées, actions et témoignages pour construire ensemble une communauté d'entraide et d'innovation sociale.
          </p>
        </div>

        <PostForm onPostCreated={fetchPosts} />

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Fil d'actualité</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Chargement des publications...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune publication pour le moment.</p>
              <p className="text-gray-400 text-sm mt-2">
                Soyez le premier à partager quelque chose !
              </p>
            </div>
          )}
        </div>
      </div>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">UBUNTOO</h1>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthForm />;
};

export default App;

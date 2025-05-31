import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BadgeShowcase = ({ userId, isOwner = false }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNominationModal, setShowNominationModal] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      const response = await axios.get(`${API}/badges?user_id=${userId}`);
      setBadges(response.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const badgeInfo = {
    empathy: { name: 'Empathie', icon: '❤️', color: 'from-red-400 to-red-600', description: 'Comprend et partage les émotions des autres' },
    leadership: { name: 'Leadership', icon: '👑', color: 'from-yellow-400 to-yellow-600', description: 'Guide et inspire les équipes' },
    resilience: { name: 'Résilience', icon: '💪', color: 'from-orange-400 to-orange-600', description: 'Surmonte les défis avec courage' },
    creativity: { name: 'Créativité', icon: '🎨', color: 'from-purple-400 to-purple-600', description: 'Génère des idées innovantes' },
    communication: { name: 'Communication', icon: '💬', color: 'from-blue-400 to-blue-600', description: 'Communique efficacement' },
    collaboration: { name: 'Collaboration', icon: '🤝', color: 'from-green-400 to-green-600', description: 'Travaille harmonieusement en équipe' },
    innovation: { name: 'Innovation', icon: '💡', color: 'from-indigo-400 to-indigo-600', description: 'Apporte des solutions créatives' }
  };

  const getBadgeStatus = (status) => {
    switch (status) {
      case 'validated':
        return { color: 'text-green-600', icon: '✅', text: 'Validé' };
      case 'pending':
        return { color: 'text-yellow-600', icon: '⏳', text: 'En attente' };
      case 'rejected':
        return { color: 'text-red-600', icon: '❌', text: 'Rejeté' };
      default:
        return { color: 'text-gray-600', icon: '❓', text: 'Inconnu' };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Badges Ubuntu</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Chargement des badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Badges Ubuntu 🏆</h3>
        {isOwner && (
          <button
            onClick={() => setShowNominationModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Demander un badge
          </button>
        )}
      </div>

      {badges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const info = badgeInfo[badge.badge_type] || { 
              name: badge.badge_type, 
              icon: '🏅', 
              color: 'from-gray-400 to-gray-600',
              description: badge.description 
            };
            const status = getBadgeStatus(badge.status);

            return (
              <div key={badge.id} className="relative group">
                <div className={`bg-gradient-to-br ${info.color} rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                  <div className="text-center">
                    <div className="text-4xl mb-2">{info.icon}</div>
                    <h4 className="font-bold text-lg mb-1">{info.name}</h4>
                    <p className="text-sm opacity-90 mb-3">{info.description}</p>
                    
                    <div className={`inline-flex items-center space-x-1 ${status.color} bg-white bg-opacity-20 rounded-full px-3 py-1`}>
                      <span>{status.icon}</span>
                      <span className="text-sm font-medium text-white">{status.text}</span>
                    </div>

                    {badge.status === 'pending' && (
                      <div className="mt-3 text-xs opacity-75">
                        <div className="flex items-center justify-center space-x-2">
                          <span>👍 {badge.votes_for}</span>
                          <span>👎 {badge.votes_against}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tooltip avec plus d'infos */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                    {badge.title}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🏆</span>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Aucun badge pour le moment</h4>
          <p className="text-gray-600 mb-4">
            {isOwner ? 
              "Commencez à collecter des badges en participant à la communauté !" :
              "Cette personne n'a pas encore de badges validés."
            }
          </p>
          {isOwner && (
            <button
              onClick={() => setShowNominationModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Demander votre premier badge
            </button>
          )}
        </div>
      )}

      {/* Badge nomination modal would go here */}
      {showNominationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Demander un badge</h3>
            <p className="text-gray-600 mb-4">
              Cette fonctionnalité sera bientôt disponible ! En attendant, participez aux défis communautaires pour gagner des badges automatiquement.
            </p>
            <button
              onClick={() => setShowNominationModal(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeShowcase;

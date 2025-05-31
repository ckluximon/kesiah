import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChallengeCard = ({ challenge, onUpdate }) => {
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const joinChallenge = async () => {
    setJoining(true);
    try {
      await axios.post(`${API}/challenges/${challenge.id}/join`);
      setHasJoined(true);
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Error joining challenge:', error);
    } finally {
      setJoining(false);
    }
  };

  const getChallengeIcon = (category) => {
    switch (category) {
      case 'innovation-socio-professionnelle': return '🚀';
      case 'environnement': return '🌱';
      case 'entraide': return '🤝';
      case 'ethique': return '⚖️';
      default: return '💫';
    }
  };

  const getChallengeColor = (category) => {
    switch (category) {
      case 'innovation-socio-professionnelle': return 'from-blue-500 to-blue-600';
      case 'environnement': return 'from-green-500 to-green-600';
      case 'entraide': return 'from-purple-500 to-purple-600';
      case 'ethique': return 'from-indigo-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const daysLeft = Math.ceil((new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24));
  const participantsCount = challenge.participants?.length || 0;
  const maxParticipants = challenge.max_participants;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`bg-gradient-to-r ${getChallengeColor(challenge.category)} p-6 text-white`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl">{getChallengeIcon(challenge.category)}</span>
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
            {daysLeft > 0 ? `${daysLeft} jours restants` : 'Terminé'}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
        <p className="text-blue-100 text-sm opacity-90">{challenge.category.replace('-', ' ')}</p>
      </div>

      <div className="p-6">
        <p className="text-gray-700 mb-4 leading-relaxed">{challenge.description}</p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Participants</span>
            <span className="font-semibold text-gray-900">
              {participantsCount}
              {maxParticipants ? ` / ${maxParticipants}` : ''}
            </span>
          </div>

          {maxParticipants && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${getChallengeColor(challenge.category)} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${Math.min((participantsCount / maxParticipants) * 100, 100)}%` }}
              ></div>
            </div>
          )}

          {challenge.rewards && challenge.rewards.length > 0 && (
            <div className="space-y-2">
              <span className="text-gray-600 text-sm">Récompenses Ubuntu :</span>
              <div className="flex flex-wrap gap-2">
                {challenge.rewards.map((reward, index) => (
                  <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    🏆 Badge {reward}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <span>Créé par </span>
            <span className="font-medium text-gray-700">Admin Ubuntu</span>
          </div>

          {!hasJoined && daysLeft > 0 && (
            <button
              onClick={joinChallenge}
              disabled={joining || (maxParticipants && participantsCount >= maxParticipants)}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                joining || (maxParticipants && participantsCount >= maxParticipants)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : `bg-gradient-to-r ${getChallengeColor(challenge.category)} text-white hover:shadow-lg transform hover:scale-105`
              }`}
            >
              {joining ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Inscription...</span>
                </div>
              ) : maxParticipants && participantsCount >= maxParticipants ? (
                'Complet'
              ) : (
                'Participer'
              )}
            </button>
          )}

          {hasJoined && (
            <div className="flex items-center space-x-2 text-green-600">
              <span>✅</span>
              <span className="font-medium">Inscrit !</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;

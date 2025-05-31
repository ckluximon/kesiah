import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChallengeCard from './ChallengeCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await axios.get(`${API}/challenges`);
      setChallenges(response.data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a default challenge if none exist
  const createDefaultChallenge = async () => {
    const defaultChallenge = {
      title: "Innovation Socio-Professionnelle 2025",
      description: "Partagez une innovation, une idée ou une action qui contribue au développement professionnel et social. Que ce soit une nouvelle méthode de travail, un projet collaboratif, ou une initiative d'entraide, montrez comment vous incarnez les valeurs Ubuntu dans votre parcours professionnel !",
      category: "innovation-socio-professionnelle",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      max_participants: 100,
      rewards: ["innovation", "collaboration", "leadership"]
    };

    try {
      await axios.post(`${API}/challenges`, defaultChallenge);
      fetchChallenges();
    } catch (error) {
      console.error('Error creating default challenge:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement des défis Ubuntu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Défis Communautaires Ubuntu 🚀
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Participez aux défis de la communauté UBUNTOO et développez vos soft skills 
            tout en contribuant à l'innovation sociale et professionnelle.
          </p>
          <div className="mt-4 flex justify-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
              <p className="text-blue-800 text-sm italic font-medium">
                💫 "Je suis parce que nous sommes" - Ensemble, relevons les défis !
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Défis Actifs</h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {challenges.length} défi{challenges.length !== 1 ? 's' : ''} disponible{challenges.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {challenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <ChallengeCard 
              key={challenge.id} 
              challenge={challenge} 
              onUpdate={fetchChallenges}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <span className="text-8xl mb-6 block">🚀</span>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Aucun défi actif pour le moment
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Les défis communautaires permettent de développer vos soft skills 
            et de contribuer à l'innovation sociale !
          </p>
          <button
            onClick={createDefaultChallenge}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
          >
            Créer le premier défi Ubuntu 🌟
          </button>
        </div>
      )}

      <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Comment participer aux défis Ubuntu ? 🤔
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">1</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Choisissez</h4>
            <p className="text-gray-600 text-sm">Sélectionnez un défi qui vous inspire</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">2</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Participez</h4>
            <p className="text-gray-600 text-sm">Inscrivez-vous et relevez le défi</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">3</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Partagez</h4>
            <p className="text-gray-600 text-sm">Publiez vos actions et idées</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">4</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Gagnez</h4>
            <p className="text-gray-600 text-sm">Obtenez des badges et reconnaissance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;

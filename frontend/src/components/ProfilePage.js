import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SkillsShowcase from './SkillsShowcase';
import BadgeShowcase from './BadgeShowcase';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProfilePage = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    job_title: user?.job_title || '',
    location: user?.location || '',
    personal_values: user?.personal_values || [],
    engagements: user?.engagements || []
  });
  const [newValue, setNewValue] = useState('');
  const [newEngagement, setNewEngagement] = useState('');

  const handleSave = async () => {
    try {
      await axios.put(`${API}/users/me`, formData);
      setEditing(false);
      // Refresh user data
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const addValue = () => {
    if (newValue.trim() && !formData.personal_values.includes(newValue.trim())) {
      setFormData({
        ...formData,
        personal_values: [...formData.personal_values, newValue.trim()]
      });
      setNewValue('');
    }
  };

  const removeValue = (valueToRemove) => {
    setFormData({
      ...formData,
      personal_values: formData.personal_values.filter(value => value !== valueToRemove)
    });
  };

  const addEngagement = () => {
    if (newEngagement.trim() && !formData.engagements.includes(newEngagement.trim())) {
      setFormData({
        ...formData,
        engagements: [...formData.engagements, newEngagement.trim()]
      });
      setNewEngagement('');
    }
  };

  const removeEngagement = (engagementToRemove) => {
    setFormData({
      ...formData,
      engagements: formData.engagements.filter(engagement => engagement !== engagementToRemove)
    });
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Profile */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-8 sm:px-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {user.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 text-white">
              {editing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="text-2xl font-bold bg-transparent border-b-2 border-white border-opacity-50 focus:border-opacity-100 outline-none text-white placeholder-blue-200 w-full max-w-md"
                  placeholder="Votre nom complet"
                />
              ) : (
                <h1 className="text-3xl font-bold">{user.full_name}</h1>
              )}
              
              {editing ? (
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                  className="text-lg bg-transparent border-b border-white border-opacity-50 focus:border-opacity-100 outline-none text-blue-100 placeholder-blue-200 w-full max-w-md mt-2"
                  placeholder="Votre poste actuel"
                />
              ) : (
                <p className="text-blue-100 text-lg">{user.job_title || 'Poste non renseigné'}</p>
              )}
              
              <p className="text-blue-200 text-sm mt-1">@{user.username}</p>
            </div>
            <div className="text-right">
              <button
                onClick={editing ? handleSave : () => setEditing(true)}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                {editing ? 'Sauvegarder' : 'Modifier le profil'}
              </button>
              {editing && (
                <button
                  onClick={() => setEditing(false)}
                  className="ml-2 bg-transparent border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{user.posts_count || 0}</div>
          <div className="text-gray-600">Publications</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{user.badges?.length || 0}</div>
          <div className="text-gray-600">Badges Ubuntu</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{user.following_count || 0}</div>
          <div className="text-gray-600">Connexions</div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">À propos</h3>
        {editing ? (
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            rows="4"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Parlez-nous de vous, de vos valeurs, de votre parcours..."
          />
        ) : (
          <p className="text-gray-700 leading-relaxed">
            {user.bio || "Cette personne n'a pas encore ajouté de description."}
          </p>
        )}
      </div>

      {/* Personal Values */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Valeurs Personnelles</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {formData.personal_values.map((value, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
              <span>💫 {value}</span>
              {editing && (
                <button
                  onClick={() => removeValue(value)}
                  className="text-blue-600 hover:text-blue-800 ml-1"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
        {editing && (
          <div className="flex space-x-2">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addValue()}
              placeholder="Ajouter une valeur (ex: Bienveillance, Équité...)"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addValue}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Ajouter
            </button>
          </div>
        )}
      </div>

      {/* Engagements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagements & Actions</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {formData.engagements.map((engagement, index) => (
            <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
              <span>🌱 {engagement}</span>
              {editing && (
                <button
                  onClick={() => removeEngagement(engagement)}
                  className="text-green-600 hover:text-green-800 ml-1"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
        {editing && (
          <div className="flex space-x-2">
            <input
              type="text"
              value={newEngagement}
              onChange={(e) => setNewEngagement(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addEngagement()}
              placeholder="Ajouter un engagement (ex: Bénévolat, Écologie...)"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addEngagement}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Ajouter
            </button>
          </div>
        )}
      </div>

      {/* Skills Showcase */}
      <div className="mb-8">
        <SkillsShowcase user={user} isOwner={true} />
      </div>

      {/* Badges Showcase */}
      <div className="mb-8">
        <BadgeShowcase userId={user.id} isOwner={true} />
      </div>
    </div>
  );
};

export default ProfilePage;

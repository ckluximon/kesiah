import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SkillsShowcase = ({ user, isOwner = false }) => {
  const [skills, setSkills] = useState(user?.soft_skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [editing, setEditing] = useState(false);

  const softSkillsOptions = [
    { name: 'Leadership', icon: '🎯', color: 'bg-blue-500' },
    { name: 'Empathie', icon: '❤️', color: 'bg-red-500' },
    { name: 'Créativité', icon: '🎨', color: 'bg-purple-500' },
    { name: 'Communication', icon: '💬', color: 'bg-green-500' },
    { name: 'Résilience', icon: '💪', color: 'bg-orange-500' },
    { name: 'Collaboration', icon: '🤝', color: 'bg-indigo-500' },
    { name: 'Innovation', icon: '💡', color: 'bg-yellow-500' },
    { name: 'Adaptabilité', icon: '🔄', color: 'bg-teal-500' },
    { name: 'Esprit critique', icon: '🧠', color: 'bg-gray-500' },
    { name: 'Pédagogie', icon: '📚', color: 'bg-blue-600' }
  ];

  const getSkillInfo = (skillName) => {
    return softSkillsOptions.find(skill => 
      skill.name.toLowerCase() === skillName.toLowerCase()
    ) || { name: skillName, icon: '⭐', color: 'bg-gray-400' };
  };

  const addSkill = async (skillName) => {
    if (skills.includes(skillName)) return;
    
    try {
      const updatedSkills = [...skills, skillName];
      await axios.put(`${API}/users/me`, { soft_skills: updatedSkills });
      setSkills(updatedSkills);
      setNewSkill('');
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const removeSkill = async (skillToRemove) => {
    try {
      const updatedSkills = skills.filter(skill => skill !== skillToRemove);
      await axios.put(`${API}/users/me`, { soft_skills: updatedSkills });
      setSkills(updatedSkills);
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Soft Skills Ubuntu</h3>
        {isOwner && (
          <button
            onClick={() => setEditing(!editing)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {editing ? 'Terminer' : 'Modifier'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {skills.map((skill) => {
          const skillInfo = getSkillInfo(skill);
          return (
            <div
              key={skill}
              className={`${skillInfo.color} rounded-lg p-3 text-white relative group`}
            >
              <div className="flex flex-col items-center text-center">
                <span className="text-2xl mb-1">{skillInfo.icon}</span>
                <span className="text-sm font-medium">{skillInfo.name}</span>
              </div>
              {editing && (
                <button
                  onClick={() => removeSkill(skill)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {softSkillsOptions
              .filter(skill => !skills.includes(skill.name))
              .map((skill) => (
                <button
                  key={skill.name}
                  onClick={() => addSkill(skill.name)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-2 text-sm transition-colors"
                >
                  <span>{skill.icon}</span>
                  <span>{skill.name}</span>
                  <span className="text-blue-600">+</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {skills.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-2 block">🌱</span>
          <p>Aucune compétence ajoutée pour le moment</p>
          {isOwner && (
            <p className="text-sm mt-1">Cliquez sur "Modifier" pour ajouter vos soft skills !</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillsShowcase;

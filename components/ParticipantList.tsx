// components/ParticipantList.tsx

import React from 'react';
import { UserCircleIcon, HandRaisedIcon } from './icons';

interface Participant {
  id: string;
  name: string;
  email?: string;
  joined: number;
}

interface ParticipantListProps {
  participants: Participant[];
  onAllowCoder: (email: string) => void;
  raisedHands: string[];
  isAdmin: boolean;
}

const ParticipantList: React.FC<ParticipantListProps> = ({ 
  participants, 
  onAllowCoder, 
  raisedHands, 
  isAdmin 
}) => {
  const sortedParticipants = participants.sort((a, b) => a.joined - b.joined);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold mb-2">Active Participants</h3>
      {sortedParticipants.map((participant) => (
        <div key={participant.id} className="flex items-center justify-between p-2 bg-slate-800 rounded">
          <div className="flex items-center space-x-2">
            <UserCircleIcon className="w-6 h-6 text-slate-400" />
            <span className="text-sm">{participant.name}</span>
            {raisedHands.includes(participant.email || '') && (
              <HandRaisedIcon className="w-4 h-4 text-yellow-500 animate-bounce" title="Hand Raised" />
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => onAllowCoder(participant.email || '')}
              className="px-2 py-1 text-xs bg-blue-600 rounded hover:bg-blue-700"
            >
              Allow Code
            </button>
          )}
        </div>
      ))}
      {participants.length === 0 && (
        <p className="text-sm text-slate-500 text-center">No participants yet</p>
      )}
    </div>
  );
};

export default ParticipantList;
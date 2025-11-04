import React from 'react';
import { User, LiveStudioState } from '../types';
import { HandRaisedIcon } from './icons';

interface ParticipantListProps {
    participants: LiveStudioState['participants'];
    allowedCoders: string[];
    contributions: LiveStudioState['contributions'];
    raisedHands: string[];
    isAdmin: boolean;
    onTogglePermission: (email: string) => void;
}

const UserAvatar: React.FC<{ name?: string; avatar?: string; }> = ({ name, avatar }) => {
    if (avatar) {
        return <img src={avatar} alt={name || 'User Avatar'} className="w-8 h-8 rounded-full object-cover" />;
    }
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
        <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold text-sm">
            {initial}
        </div>
    );
};


const ParticipantList: React.FC<ParticipantListProps> = ({ participants, allowedCoders, contributions, raisedHands, isAdmin, onTogglePermission }) => {
    
    return (
        <ul className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(participants).map(([email, userData]) => {
                // FIX: Cast object entry value to its correct type to resolve properties.
                const user = userData as { name: string; avatar?: string };
                const isAllowed = allowedCoders.includes(email);
                const hasRaisedHand = raisedHands.includes(email);
                const contribution = contributions[email];
                const isCurrentUserAdmin = email.includes('admin');

                return (
                    <li key={email} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-grow">
                            <UserAvatar name={user.name} avatar={user.avatar} />
                            <span className="text-sm font-medium flex items-center gap-1.5">
                                {user.name} {isCurrentUserAdmin ? '(Admin)' : ''}
                                {hasRaisedHand && <HandRaisedIcon className="w-4 h-4 text-yellow-500"/>}
                            </span>
                             {isAdmin && contribution && (
                                <div className="text-xs text-slate-400 ml-auto" title={`+${contribution.insertions} / -${contribution.deletions}`}>
                                    {contribution.insertions + contribution.deletions} edits
                                </div>
                            )}
                        </div>
                        {isAdmin && !isCurrentUserAdmin && (
                             <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                <button
                                    onClick={() => onTogglePermission(email)}
                                    className={`text-xs font-semibold px-2 py-1 rounded-full ${isAllowed ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-600'}`}
                                    title="Toggle Code Permission"
                                >
                                    {isAllowed ? 'Coding' : 'Allow'}
                                </button>
                                <button className="text-xs text-slate-400 hover:text-red-500" title="Mute (simulated)">Mute</button>
                                <button className="text-xs text-slate-400 hover:text-red-500" title="Kick (simulated)">Kick</button>
                             </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};

export default ParticipantList;
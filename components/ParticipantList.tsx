import React from 'react';
import { HandRaisedIcon } from './icons';

/* local lightweight shapes to avoid tight coupling with ../types */
type Participant = { name: string; avatar?: string; email?: string };
type Contribution = { insertions?: number; deletions?: number };

interface ParticipantListProps {
  participants?: Record<string, Participant>;
  attendance?: Record<string, { name: string; joinedAt: number }>;
  allowedCoders?: string[];
  contributions?: Record<string, Contribution>;
  raisedHands?: string[];
  isAdmin?: boolean;
  onTogglePermission?: (email: string) => void;
}

const UserAvatar: React.FC<{ name?: string; avatar?: string }> = ({ name, avatar }) => {
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

const ParticipantList: React.FC<ParticipantListProps> = ({
  participants = {},
  attendance = {},
  allowedCoders = [],
  contributions = {},
  raisedHands = [],
  isAdmin = false,
  onTogglePermission,
}) => {
  const entries = Object.entries(participants);

  if (entries.length === 0) {
    return <div className="text-sm text-slate-500">No participants yet.</div>;
  }

  return (
    <ul className="space-y-3 max-h-64 overflow-y-auto">
      {entries.map(([email, userData]) => {
        const user = (userData as Participant) ?? { name: email };
        const isAllowed = allowedCoders.includes(email);
        const hasRaisedHand = raisedHands.includes(email);
        const contribution = contributions?.[email];
        const attendanceInfo = attendance?.[email];
        const isCurrentUserAdmin = user.email?.includes('admin') || false;

        return (
          <li key={email} className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-grow">
              <UserAvatar name={user.name} avatar={user.avatar} />
              <div className="flex flex-col">
                <span className="text-sm font-medium flex items-center gap-1.5">
                  {user.name} {isCurrentUserAdmin ? '(Admin)' : ''}
                  {hasRaisedHand && <HandRaisedIcon className="w-4 h-4 text-yellow-500" />}
                </span>
                {attendanceInfo && (
                  <span className="text-xs text-slate-400">
                    Joined: {new Date(attendanceInfo.joinedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
              {isAdmin && contribution && (
                <div className="text-xs text-slate-400 ml-auto" title={`+${contribution.insertions ?? 0} / -${contribution.deletions ?? 0}`}>
                  {( (contribution.insertions ?? 0) + (contribution.deletions ?? 0) )} edits
                </div>
              )}
            </div>

            {isAdmin && !isCurrentUserAdmin && (
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => onTogglePermission?.(email)}
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${isAllowed ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-600'}`}
                  title="Toggle Code Permission"
                >
                  {isAllowed ? 'Coding' : 'Allow'}
                </button>
                <button type="button" className="text-xs text-slate-400 hover:text-red-500" title="Mute (simulated)">Mute</button>
                <button type="button" className="text-xs text-slate-400 hover:text-red-500" title="Kick (simulated)">Kick</button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default ParticipantList;
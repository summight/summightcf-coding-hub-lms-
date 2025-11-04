import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';

interface AdminProfileProps {
    onBack: () => void;
    currentName: string;
    currentEmail: string;
    currentPassword: string; 
    onUpdateProfile: (name: string, email: string) => boolean;
    onUpdatePassword: (newPass: string) => boolean;
}

const AdminProfile: React.FC<AdminProfileProps> = ({ onBack, currentName, currentEmail, currentPassword, onUpdateProfile, onUpdatePassword }) => {
    const [name, setName] = useState(currentName);
    const [email, setEmail] = useState(currentEmail);

    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const [profileMessage, setProfileMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage('');
        if (onUpdateProfile(name, email)) {
            setProfileMessage('Profile updated successfully!');
        } else {
            setProfileMessage('Error updating profile.');
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage('');
        if (oldPass !== currentPassword) {
            setPasswordMessage('Current password does not match.');
            return;
        }
        if (newPass !== confirmPass) {
            setPasswordMessage('New passwords do not match.');
            return;
        }
        if (newPass.length < 6) {
            setPasswordMessage('New password must be at least 6 characters long.');
            return;
        }
        if (onUpdatePassword(newPass)) {
            setPasswordMessage('Password updated successfully!');
            setOldPass('');
            setNewPass('');
            setConfirmPass('');
        } else {
            setPasswordMessage('Error updating password.');
        }
    };

    return (
        <div className="flex-grow container mx-auto px-4 py-8 space-y-8">
            <Button onClick={onBack} variant="secondary">&larr; Back to Dashboard</Button>
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Admin Profile</h1>
                <p className="text-md text-slate-600 dark:text-slate-400">Manage your administrator account details.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Edit Profile Details">
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <Button type="submit">Save Changes</Button>
                        {profileMessage && <p className="text-sm text-green-600 dark:text-green-400 mt-2">{profileMessage}</p>}
                    </form>
                </Card>

                <Card title="Change Password">
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                            <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <Button type="submit">Update Password</Button>
                        {passwordMessage && <p className={`text-sm mt-2 ${passwordMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{passwordMessage}</p>}
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default AdminProfile;
// components/AdminProfile.tsx
import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';

interface AdminProfileProps {
    onBack: () => void;
    currentName: string;
    currentEmail: string;
    // We keep currentPassword for completeness, but it is now only a placeholder ('**********')
    // and is NOT used for verification.
    currentPassword: string; 
    
    // Both are async now
    onUpdateProfile: (name: string, email: string) => Promise<boolean>;
    // The service function handleUpdateAdminPassword (in App.tsx) must be updated 
    // to accept oldPass as well, for a secure server-side check.
    onUpdatePassword: (oldPass: string, newPass: string) => Promise<boolean>; 
}

const AdminProfile: React.FC<AdminProfileProps> = ({ 
    onBack, 
    currentName, 
    currentEmail, 
    // currentPassword is intentionally NOT destructured or used for comparison
    onUpdateProfile, 
    onUpdatePassword 
}) => {
    const [name, setName] = useState(currentName);
    const [email, setEmail] = useState(currentEmail);

    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const [profileMessage, setProfileMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [isProfileUpdating, setIsProfileUpdating] = useState(false);
    const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);


    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage('');
        setIsProfileUpdating(true);
        
        const success = await onUpdateProfile(name, email); 

        if (success) {
            setProfileMessage('Profile updated successfully!');
        } else {
            setProfileMessage('Error updating profile. Check server logs.');
        }
        setIsProfileUpdating(false);
    };


    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage('');
        setIsPasswordUpdating(true);

        // Client-side validation checks
        if (!oldPass || !newPass || !confirmPass) {
            setPasswordMessage('All password fields are required.');
            setIsPasswordUpdating(false);
            return;
        }
        if (newPass !== confirmPass) {
            setPasswordMessage('New passwords do not match.');
            setIsPasswordUpdating(false);
            return;
        }
        if (newPass.length < 6) {
            setPasswordMessage('New password must be at least 6 characters long.');
            setIsPasswordUpdating(false);
            return;
        }
        if (oldPass === newPass) {
            setPasswordMessage('New password cannot be the same as the current password.');
            setIsPasswordUpdating(false);
            return;
        }
        
        // Pass both the old and new password to the DB service for server-side verification and update
        const success = await onUpdatePassword(oldPass, newPass);

        if (success) {
            setPasswordMessage('Password updated successfully!');
            // Clear fields on success
            setOldPass('');
            setNewPass('');
            setConfirmPass('');
        } else {
            // The service failed, likely because oldPass was incorrect or DB failed
            setPasswordMessage('Error updating password. Current password may be incorrect, or a server error occurred.');
        }
        setIsPasswordUpdating(false);
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
                        <Button type="submit" disabled={isProfileUpdating}>
                            {isProfileUpdating ? 'Saving...' : 'Save Changes'}
                        </Button>
                        {profileMessage && <p className={`text-sm mt-2 ${profileMessage.includes('successfully') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{profileMessage}</p>}
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
                        <Button type="submit" disabled={isPasswordUpdating}>
                            {isPasswordUpdating ? 'Updating...' : 'Update Password'}
                        </Button>
                        {passwordMessage && <p className={`text-sm mt-2 ${passwordMessage.includes('successfully') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{passwordMessage}</p>}
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default AdminProfile;
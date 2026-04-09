import React from 'react';
import { Network, LogIn, LogOut } from 'lucide-react';
import { User } from '../types';

interface TopBarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export function TopBar({ user, onLogin, onLogout }: TopBarProps) {
  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Network className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
          FlowGenius
        </h1>
      </div>

      <div>
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium text-sm">
                  {user.name.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                {user.name}
              </span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={onLogin}
            className="flex items-center space-x-2 px-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in with Google</span>
          </button>
        )}
      </div>
    </header>
  );
}

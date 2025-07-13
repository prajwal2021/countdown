'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface Countdown {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  addExtraDay: boolean;
  totalDays: number;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [label, setLabel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [addExtraDay, setAddExtraDay] = useState(false);
  const [totalDays, setTotalDays] = useState<number | null>(null);
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);

  // Load countdowns from localStorage on component mount
  useEffect(() => {
    if (session?.user?.email) {
      const savedCountdowns = localStorage.getItem(`countdowns_${session.user.email}`);
      if (savedCountdowns) {
        setCountdowns(JSON.parse(savedCountdowns));
      } else {
        setCountdowns([]);
      }
    }
  }, [session]);

  // Save countdowns to localStorage whenever countdowns change
  useEffect(() => {
    if (session?.user?.email && countdowns.length > 0) {
      localStorage.setItem(`countdowns_${session.user.email}`, JSON.stringify(countdowns));
    }
  }, [countdowns, session]);

  // Update remaining days for all countdowns every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns(prevCountdowns => 
        prevCountdowns.map(countdown => ({
          ...countdown,
          totalDays: calculateRemainingDays(countdown.startDate, countdown.endDate, countdown.addExtraDay)
        }))
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const calculateRemainingDays = (start: string, end: string, extraDay: boolean): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();

    // If the end date has passed, return 0
    if (endDate < now) {
      return 0;
    }

    // Calculate days from now to end date
    const timeDiff = endDate.getTime() - now.getTime();
    let daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Add extra day if checkbox was checked
    if (extraDay) {
      daysDiff += 1;
    }

    return Math.max(0, daysDiff);
  };

  const calculateDays = () => {
    if (!label.trim()) {
      alert('Please enter a label for your countdown');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert('Start date cannot be after end date');
      return;
    }

    // Calculate difference in milliseconds
    const timeDiff = end.getTime() - start.getTime();
    
    // Convert to days
    let daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Add extra day if checkbox is checked
    if (addExtraDay) {
      daysDiff += 1;
    }

    setTotalDays(daysDiff);
  };

  const saveCountdown = () => {
    if (!session) {
      alert('You need to login to save countdowns');
      return;
    }

    if (!label.trim() || totalDays === null) {
      alert('Please calculate days first and ensure you have a label');
      return;
    }

    const newCountdown: Countdown = {
      id: Date.now().toString(),
      label: label.trim(),
      startDate,
      endDate,
      addExtraDay,
      totalDays: calculateRemainingDays(startDate, endDate, addExtraDay)
    };

    setCountdowns(prev => [...prev, newCountdown]);
    
    // Reset form
    resetCalculator();
  };

  const resetCalculator = () => {
    setLabel('');
    setStartDate('');
    setEndDate('');
    setAddExtraDay(false);
    setTotalDays(null);
  };

  const deleteCountdown = (id: string) => {
    setCountdowns(prev => prev.filter(countdown => countdown.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex">
      {/* Header with Auth */}
      <div className="absolute top-4 right-4 z-10">
        {status === 'loading' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg">
            <div className="animate-pulse text-gray-600 dark:text-gray-300">Loading...</div>
          </div>
        ) : session ? (
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {session.user?.name}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn('google')}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        )}
      </div>

      {/* Left Side - Calculator */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Date Calculator
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Calculate and save countdowns
            </p>
          </div>

          <div className="space-y-6">
            {/* Label Input */}
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Label (e.g., "US Trip", "Vacation")
              </label>
              <input
                type="text"
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Enter a label for your countdown"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              />
            </div>

            {/* Start Date Input */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              />
            </div>

            {/* End Date Input */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              />
            </div>

            {/* Extra Day Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="addExtraDay"
                checked={addExtraDay}
                onChange={(e) => setAddExtraDay(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="addExtraDay" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Add 1 extra day to the calculation
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={calculateDays}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Calculate Days
              </button>
              <button
                onClick={resetCalculator}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Reset
              </button>
            </div>

            {/* Result Display */}
            {totalDays !== null && (
              <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-center">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                    Total Days Between Dates
                  </p>
                  <p className="text-4xl font-bold text-blue-800 dark:text-blue-200">
                    {totalDays}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {addExtraDay ? '(including extra day)' : ''}
                  </p>
                  <button
                    onClick={saveCountdown}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Save Countdown
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How it works:
            </h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Enter a label for your countdown</li>
              <li>• Select your start and end dates</li>
              <li>• Check the box if you want to add an extra day</li>
              <li>• Click "Calculate Days" then "Save Countdown"</li>
              <li>• View your saved countdowns on the right</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Saved Countdowns */}
      <div className="w-96 bg-white dark:bg-gray-800 shadow-xl p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your Countdowns
          </h2>
          {!session ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm">Sign in to save and view your countdowns</p>
              </div>
              <button
                onClick={() => signIn('google')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mx-auto transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {countdowns.length === 0 ? 'No countdowns saved yet' : `${countdowns.length} countdown${countdowns.length === 1 ? '' : 's'} saved`}
            </p>
          )}
        </div>

                {session && (
          <div className="space-y-4">
            {countdowns.map((countdown) => (
              <div
                key={countdown.id}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 border border-blue-200 dark:border-gray-600"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {countdown.label}
                  </h3>
                  <button
                    onClick={() => deleteCountdown(countdown.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                  >
                    ×
                  </button>
                </div>
                
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {countdown.totalDays}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {countdown.totalDays === 0 ? 'Days completed!' : 'days left'}
                  </p>
                </div>
                
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <p>Ends: {new Date(countdown.endDate).toLocaleDateString()}</p>
                  {countdown.addExtraDay && (
                    <p className="text-blue-600 dark:text-blue-400">+1 extra day included</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {session && countdowns.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setCountdowns([])}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Clear All Countdowns
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

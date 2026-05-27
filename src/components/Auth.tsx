import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Ship, Anchor, Skull } from 'lucide-react';

export function Auth() {
  const { signIn, signUp, createPlayer, player } = useGame();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, captainName);
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlayer = async () => {
    if (!captainName.trim()) {
      setError('Enter a captain name');
      return;
    }
    setLoading(true);
    try {
      await createPlayer(captainName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create player');
    } finally {
      setLoading(false);
    }
  };

  if (player && !player.captain_name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md border border-amber-500/20 shadow-2xl">
          <div className="text-center mb-8">
            <Skull className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-amber-500">Name Your Captain</h2>
            <p className="text-slate-400 mt-2">What shall the seas call you?</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              placeholder="Captain name..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />

            {error && (
              <div className="bg-red-900/50 text-red-300 text-sm p-3 rounded-lg border border-red-500/30">
                {error}
              </div>
            )}

            <button
              onClick={handleCreatePlayer}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Setting Sail...' : 'Begin Your Voyage'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md border border-amber-500/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center gap-2 mb-4">
            <Ship className="w-10 h-10 text-amber-500" />
            <Anchor className="w-10 h-10 text-slate-400" />
            <Skull className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-amber-500 mb-2">Pirate Seas</h1>
          <p className="text-slate-400">Adventure awaits on the high seas</p>
        </div>

        <div className="flex mb-6 bg-slate-700/50 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              isLogin ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              !isLogin ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="captain@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Min 6 characters"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Captain Name</label>
              <input
                type="text"
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Captain Jack Sparrow"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 text-red-300 text-sm p-3 rounded-lg border border-red-500/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Loading...' : isLogin ? 'Hoist the Sails' : 'Join the Crew'}
          </button>
        </form>
      </div>
    </div>
  );
}

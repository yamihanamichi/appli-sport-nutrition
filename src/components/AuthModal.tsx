import { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState(''); // nouveau : message d’info
  const [loading, setLoading] = useState(false);

  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          setError("Le nom d'utilisateur est requis");
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) {
          setError(error);
        } else {
          // ne ferme pas la modale tout de suite
          setInfo("Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse avant de te connecter ✉️");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) setError(error);
        else onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative border border-yellow-400/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-2">
            {isSignUp ? 'DEVIENS UN HÉROS' : 'CONNEXION'}
          </h2>
          <p className="text-gray-400">
            {isSignUp
              ? 'Crée ton compte héroïque'
              : 'Accède à ton académie'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Nom de héros
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="Deku"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
                placeholder="hero@academy.jp"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {info && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-green-400 text-sm">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'CHARGEMENT...'
              : isSignUp
              ? "S'INSCRIRE"
              : 'SE CONNECTER'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setInfo('');
            }}
            className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors"
          >
            {isSignUp
              ? 'Déjà un compte ? Connecte-toi'
              : "Pas encore de compte ? Inscris-toi"}
          </button>
        </div>
      </div>
    </div>
  );
}

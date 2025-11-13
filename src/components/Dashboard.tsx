import { useEffect, useState } from 'react';
import { Flame, Activity, LogOut, Plus, User, Dumbbell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ProfilePage from './ProfilePage';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface Profile {
  username: string;
  total_calories_consumed: number;
  total_calories_burned: number;
  total_proteins_consumed?: number;
  height?: number;
  weight?: number;
  goal?: string;
  gender?: string;
}

interface DashboardProps {
  onAddMeal: () => void;
  onAddActivity: () => void;
}

export default function Dashboard({ onAddMeal, onAddActivity }: DashboardProps) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [showProfile, setShowProfile] = useState(false);

  const [dailyCalories, setDailyCalories] = useState<number | null>(null);
  const [dailyProtein, setDailyProtein] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats(period);
    }
  }, [user, period]);

  /** Charger les infos utilisateur */
  const loadProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, total_calories_consumed, total_calories_burned, total_proteins_consumed, height, weight, goal, gender')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
      if (data) calculateNeeds(data);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  /** Calcul des besoins journaliers */
  const calculateNeeds = (data: Profile) => {
    if (!data.weight || !data.height || !data.gender) return;

    const weight = data.weight;
    const height = data.height;
    const gender = data.gender.toLowerCase();

    //  Formule BMR (Harris-Benedict)
    const bmr =
      gender === 'femme'
        ? 655 + 9.6 * weight + 1.8 * height - 4.7 * 25 // âge moyen 25 ans
        : 66 + 13.7 * weight + 5 * height - 6.8 * 25;

    //  Ajustement selon l'objectif
    let activityFactor = 1.4;
    if (data.goal === 'Prise de muscle') activityFactor = 1.6;
    else if (data.goal === 'Perte de poids') activityFactor = 1.2;

    const dailyCalories = Math.round(bmr * activityFactor);

    //  Protéines selon objectif
    let proteinPerKg = 1.6;
    if (data.goal === 'Prise de muscle') proteinPerKg = 2.2;
    else if (data.goal === 'Perte de poids') proteinPerKg = 1.8;

    const dailyProtein = Math.round(weight * proteinPerKg);

    setDailyCalories(dailyCalories);
    setDailyProtein(dailyProtein);
  };

  /** Charger les stats selon la période */
  const loadStats = async (selectedPeriod: 'week' | 'month') => {
    if (!user) return;

    try {
      const { data: meals } = await supabase
        .from('meals')
        .select('total_calories, total_proteins_consumed, created_at')
        .eq('user_id', user.id);

      const { data: activities } = await supabase
        .from('user_activities')
        .select('total_calories_burned, created_at')
        .eq('user_id', user.id);

      const today = new Date();
      const days = selectedPeriod === 'month' ? 30 : 7;

      const lastDays = Array.from({ length: days }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (days - 1 - i));
        return d.toISOString().split('T')[0];
      });

      const grouped = lastDays.map((date) => {
        const dayMeals = meals?.filter((m) => m.created_at.startsWith(date)) || [];
        const dayActivities = activities?.filter((a) => a.created_at.startsWith(date)) || [];

        const consumed = dayMeals.reduce((sum, m) => sum + (m.total_calories || 0), 0);
        const burned = dayActivities.reduce((sum, a) => sum + (a.total_calories_burned || 0), 0);
        const proteins = dayMeals.reduce((sum, m) => sum + (m.total_proteins_consumed || 0), 0);

        return {
          date: date.split('-').reverse().slice(0, 2).join('/'),
          consommées: consumed,
          brûlées: burned,
          protéines: proteins,
        };
      });

      setChartData(grouped);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-yellow-400 text-2xl font-bold animate-pulse">
          Chargement...
        </div>
      </div>
    );
  }

  if (showProfile) return <ProfilePage onBack={() => setShowProfile(false)} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black text-white">
              Bienvenue, {profile?.username} !
            </h1>
            <p className="text-gray-400">Prêt à progresser aujourd’hui ? 💪</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              Mon Profil
            </button>

            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </header>

        {/*  Besoins journaliers */}
        {dailyCalories && dailyProtein && (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Flame className="w-8 h-8 text-white" />
                <span className="text-white/80 text-sm font-bold">BESOIN CALORIQUE</span>
              </div>
              <div className="text-4xl font-black text-white mb-2">
                {dailyCalories.toLocaleString()} kcal
              </div>
              <div className="text-white/80 text-sm">par jour</div>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Dumbbell className="w-8 h-8 text-white" />
                <span className="text-white/80 text-sm font-bold">PROTÉINES CIBLES</span>
              </div>
              <div className="text-4xl font-black text-white mb-2">
                {dailyProtein} g
              </div>
              <div className="text-white/80 text-sm">par jour</div>
            </div>
          </div>
        )}

        {/*  Statistiques du jour */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 text-white" />
              <span className="text-white/80 text-sm font-bold">CONSOMMÉES (JOUR)</span>
            </div>
            <div className="text-4xl font-black text-white mb-2">
              {chartData[chartData.length - 1]?.consommées || 0}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-white" />
              <span className="text-white/80 text-sm font-bold">BRÛLÉES (JOUR)</span>
            </div>
            <div className="text-4xl font-black text-white mb-2">
              {chartData[chartData.length - 1]?.brûlées || 0}
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Dumbbell className="w-8 h-8 text-white" />
              <span className="text-white/80 text-sm font-bold">PROTÉINES (JOUR)</span>
            </div>
            <div className="text-4xl font-black text-white mb-2">
              {chartData[chartData.length - 1]?.protéines || 0} g
            </div>
          </div>
        </div>

        {/* Graphique */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-white">
              Statistiques {period === 'week' ? 'hebdomadaires' : 'mensuelles'}
            </h2>

            <div className="flex gap-2 bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  period === 'week'
                    ? 'bg-yellow-400 text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  period === 'month'
                    ? 'bg-yellow-400 text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Mois
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="consommées" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="brûlées" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="protéines" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Boutons */}
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={onAddMeal}
            className="group bg-gray-800 hover:bg-gray-700 rounded-2xl p-8 transition-all transform hover:scale-105 active:scale-95 shadow-xl border-2 border-transparent hover:border-yellow-400"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-yellow-400 p-3 rounded-xl group-hover:rotate-12 transition-transform">
                <Plus className="w-8 h-8 text-gray-900" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-black text-white">Ajouter un repas</h3>
                <p className="text-gray-400">Enregistre ce que tu manges</p>
              </div>
            </div>
          </button>

          <button
            onClick={onAddActivity}
            className="group bg-gray-800 hover:bg-gray-700 rounded-2xl p-8 transition-all transform hover:scale-105 active:scale-95 shadow-xl border-2 border-transparent hover:border-green-400"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-400 p-3 rounded-xl group-hover:rotate-12 transition-transform">
                <Plus className="w-8 h-8 text-gray-900" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-black text-white">Ajouter une activité</h3>
                <p className="text-gray-400">Log ton entraînement</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

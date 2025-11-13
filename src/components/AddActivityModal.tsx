import { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Activity {
  id: string;
  name: string;
  calories_per_hour: number;
  category: string;
}

interface AddActivityModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddActivityModal({ onClose, onSuccess }: AddActivityModalProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [duration, setDuration] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = activities.filter(activity =>
        activity.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredActivities(filtered);
    } else {
      setFilteredActivities(activities);
    }
  }, [searchQuery, activities]);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('name');

      if (error) throw error;
      setActivities(data || []);
      setFilteredActivities(data || []);
    } catch (err) {
      console.error('Error loading activities:', err);
    }
  };

  const calculateCaloriesBurned = () => {
    if (!selectedActivity || !duration) return 0;
    return Math.round((selectedActivity.calories_per_hour * parseFloat(duration)) / 60);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedActivity) return;

    setError('');
    setLoading(true);

    try {
      const totalCaloriesBurned = calculateCaloriesBurned();

      const { error: activityError } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_id: selectedActivity.id,
          duration_minutes: parseFloat(duration),
          total_calories_burned: totalCaloriesBurned,
        });

      if (activityError) throw activityError;

      const { data: profile } = await supabase
        .from('profiles')
        .select('total_calories_burned, hero_level')
        .eq('id', user.id)
        .single();

      if (profile) {
        const newTotalBurned = profile.total_calories_burned + totalCaloriesBurned;
        const newLevel = Math.floor(newTotalBurned / 5000) + 1;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            total_calories_burned: newTotalBurned,
            hero_level: Math.max(profile.hero_level, newLevel),
          })
          .eq('id', user.id);

        if (updateError) throw updateError;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      cardio: 'bg-red-500',
      force: 'bg-blue-500',
      flexibility: 'bg-green-500',
      combat: 'bg-orange-500',
      intense: 'bg-purple-500',
      general: 'bg-gray-500',
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative border border-green-400/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-3xl font-black text-white mb-2">
            AJOUTER UNE ACTIVITÉ
          </h2>
          <p className="text-gray-400">Enregistre ton entraînement héroïque</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Rechercher une activité
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-400"
                placeholder="Recherche une activité..."
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2">
            {filteredActivities.map((activity) => (
              <button
                key={activity.id}
                type="button"
                onClick={() => setSelectedActivity(activity)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedActivity?.id === activity.id
                    ? 'bg-green-400 text-gray-900'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{activity.name}</div>
                    <div className="text-sm opacity-80">
                      {activity.calories_per_hour} cal/heure
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getCategoryColor(
                      activity.category
                    )}`}
                  >
                    {activity.category}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {selectedActivity && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Durée (minutes)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-400"
                  placeholder="30"
                  min="1"
                  required
                />
              </div>

              {duration && (
                <div className="bg-green-400/10 border border-green-400 rounded-lg p-4">
                  <div className="text-green-400 font-bold text-lg">
                    Calories brûlées: {calculateCaloriesBurned()} cal
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedActivity || !duration}
            className="w-full bg-green-400 hover:bg-green-300 text-gray-900 font-black py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'ENREGISTREMENT...' : "AJOUTER L'ACTIVITÉ"}
          </button>
        </form>
      </div>
    </div>
  );
}

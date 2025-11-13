import { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Food {
  id: string;
  name: string;
  calories_per_100g: number;
  proteins_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
}

interface AddMealModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMealModal({ onClose, onSuccess }: AddMealModalProps) {
  const { user } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFoods();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = foods.filter((food) =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFoods(filtered);
    } else {
      setFilteredFoods(foods);
    }
  }, [searchQuery, foods]);

  const loadFoods = async () => {
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .order('name');

      if (error) throw error;
      setFoods(data || []);
      setFilteredFoods(data || []);
    } catch (err) {
      console.error('Erreur chargement aliments:', err);
    }
  };

  /**  Calcul des calories selon la quantité */
  const calculateCalories = () => {
    if (!selectedFood || !grams) return 0;
    return Math.round((selectedFood.calories_per_100g * parseFloat(grams)) / 100);
  };

  /**  Calcul des protéines selon la quantité */
  const calculateProteins = () => {
    if (!selectedFood || !grams) return 0;
    return Math.round((selectedFood.proteins_per_100g * parseFloat(grams)) / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFood) return;

    setError('');
    setLoading(true);

    try {
      const totalCalories = calculateCalories();
      const totalProteins = calculateProteins();

      //  Insertion du repas dans la table meals
      const { error: mealError } = await supabase.from('meals').insert({
        user_id: user.id,
        food_id: selectedFood.id,
        grams: parseFloat(grams),
        total_calories: totalCalories,
        total_proteins_consumed: totalProteins,
        meal_type: mealType,
      });

      if (mealError) throw mealError;

      //  Mise à jour du profil
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_calories_consumed, total_proteins_consumed')
        .eq('id', user.id)
        .single();

      if (profile) {
        const newCalories = (profile.total_calories_consumed || 0) + totalCalories;
        const newProteins = (profile.total_proteins_consumed || 0) + totalProteins;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            total_calories_consumed: newCalories,
            total_proteins_consumed: newProteins,
          })
          .eq('id', user.id);

        if (updateError) throw updateError;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative border border-yellow-400/20">
        {/* Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-black text-white mb-2">AJOUTER UN REPAS</h2>
        <p className="text-gray-400 mb-6">Enregistre ce que tu as mangé 🍽️</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélecteur repas */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Type de repas
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="breakfast">Petit-déjeuner</option>
              <option value="lunch">Déjeuner</option>
              <option value="dinner">Dîner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          {/* Recherche aliment */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Rechercher un aliment
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                placeholder="Ex : Poulet, riz..."
              />
            </div>
          </div>

          {/* Liste des aliments */}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {filteredFoods.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => setSelectedFood(food)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedFood?.id === food.id
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                <div className="font-bold">{food.name}</div>
                <div className="text-sm opacity-80">
                  {food.calories_per_100g} cal — {food.proteins_per_100g} g prot / 100g
                </div>
              </button>
            ))}
          </div>

          {selectedFood && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Quantité (g)
                </label>
                <input
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                  placeholder="150"
                  min="1"
                  required
                />
              </div>

              {grams && (
                <div className="bg-yellow-400/10 border border-yellow-400 rounded-lg p-4 text-yellow-400 font-bold">
                  <p>Calories : {calculateCalories()} kcal</p>
                  <p>Protéines : {calculateProteins()} g</p>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Bouton valider */}
          <button
            type="submit"
            disabled={loading || !selectedFood || !grams}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'ENREGISTREMENT...' : 'AJOUTER LE REPAS'}
          </button>
        </form>
      </div>
    </div>
  );
}

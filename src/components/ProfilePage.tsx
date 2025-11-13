import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Ruler, Weight, ChevronDown, Target, Sparkles } from 'lucide-react';

interface Profile {
  username: string;
  height?: number;
  weight?: number;
  goal?: string;
  gender?: string;
  avatar_url?: string;
}

interface ProfilePageProps {
  onBack: () => void;
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (user?.id) fetchProfile();
  }, [user]);

  /** Charger le profil depuis Supabase */
  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Erreur chargement profil:', error);
    } else {
      setProfile(data);
    }

    setLoading(false);
  };

  /** Sauvegarder les infos */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        height: profile?.height,
        weight: profile?.weight,
        goal: profile?.goal,
        gender: profile?.gender,
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      alert('❌ Erreur lors de la sauvegarde');
      console.error(error);
    } else {
      alert('✅ Profil mis à jour avec succès');
      setEditMode(false);
      fetchProfile();
    }
  };

  /** Upload d’un nouvel avatar */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Supprimer ancien avatar (évite le 400)
      await supabase.storage.from('avatars').remove([`${user.id}/${fileName}`]);

      //  Upload du nouveau fichier
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      //  Récupérer le lien public
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl;

      //  Mettre à jour la table profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      alert('✅ Avatar mis à jour');
      fetchProfile();
    } catch (err) {
      console.error('Erreur upload:', err);
      alert('❌ Erreur lors de l’upload de l’image');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-yellow-400 text-xl">
        Chargement du profil...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-lg border border-yellow-400/10 relative overflow-hidden">
        <button
          onClick={onBack}
          className="text-yellow-400 hover:text-yellow-300 mb-6 font-bold"
        >
          ← Retour au tableau de bord
        </button>

        <h1 className="text-3xl font-black text-center mb-8">
          Mon Profil de Héros 💥
        </h1>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-40 h-40 object-cover rounded-full border-4 border-yellow-400 shadow-xl"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-500">
              Aucun avatar
            </div>
          )}
        </div>

        {/* Bouton d’upload */}
        <div className="text-center mb-8">
          <label className="inline-block bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-400 transition cursor-pointer">
            <Sparkles className="inline w-5 h-5 mr-2 text-yellow-300" />
            Changer d’avatar
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </label>
        </div>

        {/* Mode affichage */}
        {!editMode && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-xl font-bold">{profile?.username}</p>
              <p className="text-gray-400 mt-1">{profile?.gender}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-700 p-4 rounded-xl">
                <p className="text-gray-400 text-sm">Taille</p>
                <p className="text-2xl font-bold">{profile?.height || '-'} cm</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-xl">
                <p className="text-gray-400 text-sm">Poids</p>
                <p className="text-2xl font-bold">{profile?.weight || '-'} kg</p>
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-xl text-center">
              <p className="text-gray-400 text-sm">Objectif</p>
              <p className="text-lg font-bold">
                {profile?.goal || 'Non défini'}
              </p>
            </div>

            <button
              onClick={() => setEditMode(true)}
              className="w-full bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-300 transition transform hover:scale-105 active:scale-95"
            >
              Modifier mes informations
            </button>
          </div>
        )}

        {/* Mode édition */}
        {editMode && (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Genre */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Genre</label>
              <div className="relative">
                <select
                  value={profile?.gender || 'Autre'}
                  onChange={(e) =>
                    setProfile({ ...profile!, gender: e.target.value })
                  }
                  className="w-full appearance-none bg-gray-700 text-white rounded-lg px-3 py-2 outline-none"
                >
                  <option style={{ backgroundColor: '#1f2937', color: 'white' }}>Homme</option>
                  <option style={{ backgroundColor: '#1f2937', color: 'white' }}>Femme</option>
                  <option style={{ backgroundColor: '#1f2937', color: 'white' }}>Autre</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Taille */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Taille (cm)</label>
              <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2">
                <Ruler className="text-gray-400 mr-2" />
                <input
                  type="number"
                  value={profile?.height || ''}
                  onChange={(e) =>
                    setProfile({ ...profile!, height: Number(e.target.value) })
                  }
                  className="bg-transparent outline-none text-white flex-1"
                  placeholder="Ex: 180"
                />
              </div>
            </div>

            {/* Poids */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Poids (kg)</label>
              <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2">
                <Weight className="text-gray-400 mr-2" />
                <input
                  type="number"
                  value={profile?.weight || ''}
                  onChange={(e) =>
                    setProfile({ ...profile!, weight: Number(e.target.value) })
                  }
                  className="bg-transparent outline-none text-white flex-1"
                  placeholder="Ex: 80"
                />
              </div>
            </div>

            {/* Objectif */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Objectif</label>
              <div className="relative flex items-center bg-gray-700 rounded-lg px-3 py-2">
                <Target className="text-gray-400 mr-2" />
                <select
                  value={profile?.goal || ''}
                  onChange={(e) =>
                    setProfile({ ...profile!, goal: e.target.value })
                  }
                  className="flex-1 appearance-none bg-transparent text-white outline-none"
                >
                  <option value="">Choisir un objectif</option>
                  <option style={{ backgroundColor: '#1f2937', color: 'white' }} value="Perte de poids">
                    Perte de poids
                  </option>
                  <option style={{ backgroundColor: '#1f2937', color: 'white' }} value="Prise de muscle">
                    Prise de muscle
                  </option>
                  <option style={{ backgroundColor: '#1f2937', color: 'white' }} value="Maintien">
                    Maintien
                  </option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-300 transition transform hover:scale-105 active:scale-95"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="flex-1 bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

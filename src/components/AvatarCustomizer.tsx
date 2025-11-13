// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase';
// import { useAuth } from '../contexts/AuthContext';
// import { Palette, Shirt, Sparkles, Save } from 'lucide-react';

// interface AvatarData {
//   skin: string;
//   hair: string;
//   outfit: string;
// }

// export default function AvatarCustomizer({ onClose }: { onClose: () => void }) {
//   const { user } = useAuth();
//   const [avatar, setAvatar] = useState<AvatarData>({
//     skin: 'light',
//     hair: 'brown',
//     outfit: 'blue',
//   });
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     loadAvatar();
//   }, []);

//   const loadAvatar = async () => {
//     if (!user) return;
//     const { data } = await supabase
//       .from('profiles')
//       .select('avatar')
//       .eq('id', user.id)
//       .single();

//     if (data?.avatar) setAvatar(data.avatar);
//   };

//   const saveAvatar = async () => {
//     if (!user) return;
//     setSaving(true);

//     const { error } = await supabase
//       .from('profiles')
//       .update({ avatar })
//       .eq('id', user.id);

//     setSaving(false);
//     if (error) alert('Erreur lors de la sauvegarde');
//     else alert('Avatar sauvegardé ! ✅');
//     onClose();
//   };

//   const skinColors = ['#f5d6c6', '#d1a382', '#8b5a2b', '#5c3a1b'];
//   const hairColors = ['#000000', '#3b2a1a', '#b87333', '#ffcc00'];
//   const outfits = ['#4f46e5', '#16a34a', '#dc2626', '#f59e0b'];

//   return (
//     <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg max-w-md mx-auto">
//       <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
//         <Sparkles className="text-yellow-400" /> Personnalise ton avatar
//       </h2>

//       {/* Aperçu simple de l’avatar */}
//       <div
//         className="mx-auto w-40 h-40 rounded-full flex items-center justify-center mb-6"
//         style={{ backgroundColor: avatar.skin }}
//       >
//         <div
//           className="w-20 h-10 rounded-md"
//           style={{ backgroundColor: avatar.hair }}
//         ></div>
//         <div
//           className="absolute w-20 h-10 mt-20 rounded-md"
//           style={{ backgroundColor: avatar.outfit }}
//         ></div>
//       </div>

//       {/* Choix de la peau */}
//       <div className="mb-4">
//         <p className="mb-2 flex items-center gap-2">
//           <Palette className="w-4 h-4 text-yellow-400" /> Peau :
//         </p>
//         <div className="flex gap-2">
//           {skinColors.map((color) => (
//             <button
//               key={color}
//               onClick={() => setAvatar({ ...avatar, skin: color })}
//               className={`w-8 h-8 rounded-full border-2 ${
//                 avatar.skin === color ? 'border-yellow-400' : 'border-transparent'
//               }`}
//               style={{ backgroundColor: color }}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Cheveux */}
//       <div className="mb-4">
//         <p className="mb-2 flex items-center gap-2">
//           <Shirt className="w-4 h-4 text-yellow-400" /> Cheveux :
//         </p>
//         <div className="flex gap-2">
//           {hairColors.map((color) => (
//             <button
//               key={color}
//               onClick={() => setAvatar({ ...avatar, hair: color })}
//               className={`w-8 h-8 rounded-full border-2 ${
//                 avatar.hair === color ? 'border-yellow-400' : 'border-transparent'
//               }`}
//               style={{ backgroundColor: color }}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Vêtements */}
//       <div className="mb-6">
//         <p className="mb-2 flex items-center gap-2">
//           <Shirt className="w-4 h-4 text-yellow-400" /> Tenue :
//         </p>
//         <div className="flex gap-2">
//           {outfits.map((color) => (
//             <button
//               key={color}
//               onClick={() => setAvatar({ ...avatar, outfit: color })}
//               className={`w-8 h-8 rounded-full border-2 ${
//                 avatar.outfit === color ? 'border-yellow-400' : 'border-transparent'
//               }`}
//               style={{ backgroundColor: color }}
//             />
//           ))}
//         </div>
//       </div>

//       <div className="flex gap-3">
//         <button
//         onClick={saveAvatar}
//         disabled={saving}
//         className="flex-1 bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-300 transition flex items-center justify-center gap-2"
//         >
//         <Save className="w-5 h-5" />
//         {saving ? 'Sauvegarde...' : 'Sauvegarder'}
//         </button>
//         <button
//           onClick={onClose}
//           className="flex-1 bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition"
//         >
//           Annuler
//         </button>
//       </div>
//     </div>
//   );
// }

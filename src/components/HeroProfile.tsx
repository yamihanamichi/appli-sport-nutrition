// import { useEffect, useState } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { supabase } from '../lib/supabase';
// import { ArrowLeft, Sparkles } from 'lucide-react';

// interface Profile {
//   username: string;
//   height?: number;
//   gender?: string;
//   avatar?: {
//     skin?: string;
//     hair?: string;
//     outfit?: string;
//   };
// }

// export default function HeroProfile({ onBack }: { onBack: () => void }) {
//   const { user } = useAuth();
//   const [profile, setProfile] = useState<Profile | null>(null);

//   useEffect(() => {
//     const load = async () => {
//       if (!user) return;
//       const { data } = await supabase
//         .from('profiles')
//         .select('username, height, gender, avatar')
//         .eq('id', user.id)
//         .single();
//       if (data) setProfile(data as Profile);
//     };
//     load();
//   }, [user]);

//   const skin = profile?.avatar?.skin ?? '#f5d6c6';
//   const hair = profile?.avatar?.hair ?? '#2c1810';
//   const outfit = profile?.avatar?.outfit ?? '#2563eb';
//   const isFemale = profile?.gender?.toLowerCase() === 'femme';

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
//       <div className="max-w-5xl mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-10">
//           <button
//             onClick={onBack}
//             className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-bold"
//           >
//             <ArrowLeft className="w-5 h-5" />
//             Retour au profil
//           </button>
//           <div className="flex items-center gap-2 text-sm tracking-widest">
//             <Sparkles className="text-yellow-400" />
//             <span className="font-black">MYSELF HERO</span>
//           </div>
//         </div>

//         {/* Section principale */}
//         <div className="grid md:grid-cols-2 gap-10 items-center">
//           {/* Avatar stylisé */}
//           <div className="relative bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-6 border border-white/10 overflow-hidden shadow-xl">
//             <div
//               className="absolute -inset-8 blur-3xl opacity-30"
//               style={{
//                 background: `radial-gradient(circle, ${outfit} 0%, transparent 60%)`,
//               }}
//             />

//             <div className="flex justify-center items-end h-[400px] relative z-10">
//               {isFemale ? (
//                 <FemaleHeroSVG skin={skin} hair={hair} outfit={outfit} />
//               ) : (
//                 <MaleHeroSVG skin={skin} hair={hair} outfit={outfit} />
//               )}
//             </div>
//           </div>

//           {/* Infos Héros */}
//           <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10">
//             <h1 className="text-4xl font-black text-yellow-400 mb-2 uppercase tracking-widest">
//               {profile?.username || 'Nom inconnu'}
//             </h1>
//             <p className="text-gray-400 font-semibold mb-8">
//               HÉROS EN FORMATION À L’ACADÉMIE U.A.
//             </p>

//             <div className="flex flex-col gap-4 text-lg">
//               <div>
//                 <span className="text-gray-400">TAILLE : </span>
//                 <span className="font-bold">{profile?.height ?? '—'} cm</span>
//               </div>
//               <div>
//                 <span className="text-gray-400">GENRE : </span>
//                 <span className="font-bold">
//                   {isFemale ? 'Féminin' : 'Masculin'}
//                 </span>
//               </div>
//             </div>

//             <div className="mt-10 text-center">
//               <div className="inline-block px-6 py-2 border-2 border-yellow-400 text-yellow-400 font-black rounded-lg tracking-widest">
//                 PLUS ULTRA!
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* --- Silhouette homme --- */
// function MaleHeroSVG({
//   skin,
//   hair,
//   outfit,
// }: {
//   skin: string;
//   hair: string;
//   outfit: string;
// }) {
//   return (
//     <svg width="240" height="420" viewBox="0 0 240 420">
//       <ellipse cx="120" cy="70" rx="34" ry="40" fill={skin} />
//       <path d="M85 40 L155 40 L170 75 L70 75 Z" fill={hair} />
//       <rect x="85" y="110" width="70" height="120" rx="12" fill={outfit} />
//       <rect x="85" y="230" width="25" height="120" rx="8" fill={outfit} />
//       <rect x="130" y="230" width="25" height="120" rx="8" fill={outfit} />
//       <rect x="80" y="350" width="40" height="20" rx="3" fill="#cbd5e1" />
//       <rect x="120" y="350" width="40" height="20" rx="3" fill="#cbd5e1" />
//     </svg>
//   );
// }

// /* --- Silhouette femme --- */
// function FemaleHeroSVG({
//   skin,
//   hair,
//   outfit,
// }: {
//   skin: string;
//   hair: string;
//   outfit: string;
// }) {
//   return (
//     <svg width="240" height="420" viewBox="0 0 240 420">
//       <ellipse cx="120" cy="70" rx="30" ry="38" fill={skin} />
//       <path d="M60 60 Q120 0 180 60 Q170 120 60 120 Z" fill={hair} />
//       <path d="M80 120 Q120 100 160 120 L160 220 L80 220 Z" fill={outfit} />
//       <rect x="90" y="220" width="25" height="120" rx="8" fill={outfit} />
//       <rect x="125" y="220" width="25" height="120" rx="8" fill={outfit} />
//       <rect x="88" y="338" width="36" height="14" rx="2" fill="#cbd5e1" />
//       <rect x="136" y="338" width="36" height="14" rx="2" fill="#cbd5e1" />
//     </svg>
//   );
// }


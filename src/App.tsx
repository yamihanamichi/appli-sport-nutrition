import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Landing from './components/Landing';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import AddMealModal from './components/AddMealModal';
import AddActivityModal from './components/AddActivityModal';

function App() {
  const { user, loading } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [refreshDashboard, setRefreshDashboard] = useState(0);

  const handleGetStarted = () => {
    setShowLanding(false);
    if (!user) {
      setShowAuthModal(true);
    }
  };

  const handleModalSuccess = () => {
    setRefreshDashboard(prev => prev + 1);
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

  if (showLanding && !user) {
    return (
      <>
        <Landing onGetStarted={handleGetStarted} />
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <button
          onClick={() => setShowAuthModal(true)}
          className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black px-8 py-4 rounded-lg text-xl transition-all transform hover:scale-105"
        >
          SE CONNECTER
        </button>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  return (
    <>
      <Dashboard
        key={refreshDashboard}
        onAddMeal={() => setShowMealModal(true)}
        onAddActivity={() => setShowActivityModal(true)}
      />
      {showMealModal && (
        <AddMealModal
          onClose={() => setShowMealModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
      {showActivityModal && (
        <AddActivityModal
          onClose={() => setShowActivityModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
}

export default App;

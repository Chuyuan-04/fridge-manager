import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import PreferencesPage from './components/PreferencesPage';
import IngredientsPage from './components/IngredientsPage';
import MainPage from './components/MainPage';

function App() {
  const [step, setStep] = useState('landing');
  const [preferences, setPreferences] = useState({
    tastes: [],
    quickMeals: false,
    allergens: [],
    dietType: [],
    restrictions: [],
    periodRestrictions: [],
    considerNutrition: false
  });
  const [ingredients, setIngredients] = useState([]);

console.log("当前状态:", { step, ingredients, preferences });

  return (
    <>
      {step === 'landing' && <LandingPage onNext={() => setStep('preferences')} />}
      {step === 'preferences' && (
        <PreferencesPage
          preferences={preferences}
          setPreferences={setPreferences}
          onNext={() => setStep('ingredients')}
          onSkip={() => setStep('ingredients')}
        />
      )}
      {step === 'ingredients' && (
        <IngredientsPage
          ingredients={ingredients}
          setIngredients={setIngredients}
          onComplete={() => setStep('main')}
        />
      )}
      {step === 'main' && (
        <MainPage
          ingredients={ingredients}
          setIngredients={setIngredients}
          preferences={preferences}
          onBack={() => setStep('ingredients')}
        />
      )}
    </>
  );
}

export default App;
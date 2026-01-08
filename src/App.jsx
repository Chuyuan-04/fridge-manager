import React, { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import PreferencesPage from './components/PreferencesPage';
import IngredientsPage from './components/IngredientsPage';
import MainPage from './components/MainPage';

/* ------------------ localStorage keys ------------------ */
const LS_KEYS = {
  INGREDIENTS: 'fm_ingredients_v1',
  PREFERENCES: 'fm_preferences_v1',
  STEP: 'fm_step_v1',
  ADD_STORAGE: 'fm_addStorage_v1',
};

/* ------------------ defaults ------------------ */
const DEFAULT_PREFERENCES = {
  tastes: [],
  quickMeals: false,
  allergens: [],
  dietType: [],
  restrictions: [],
  periodRestrictions: [],
  considerNutrition: false,
};

/* ------------------ helpers ------------------ */
function loadFromLocalStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('localStorage load failed:', key, e);
    return fallback;
  }
}

/* ================== App ================== */
export default function App() {
  /* -------- state -------- */
  const [step, setStep] = useState(() =>
    loadFromLocalStorage(LS_KEYS.STEP, 'landing')
  );

  const [preferences, setPreferences] = useState(() =>
    loadFromLocalStorage(LS_KEYS.PREFERENCES, DEFAULT_PREFERENCES)
  );

  const [ingredients, setIngredients] = useState(() =>
    loadFromLocalStorage(LS_KEYS.INGREDIENTS, [])
  );

  const [addStorage, setAddStorage] = useState(() =>
    loadFromLocalStorage(LS_KEYS.ADD_STORAGE, 'fridge')
  );

  /* -------- persist -------- */
  useEffect(() => {
    localStorage.setItem(LS_KEYS.STEP, JSON.stringify(step));
  }, [step]);

  useEffect(() => {
    localStorage.setItem(
      LS_KEYS.PREFERENCES,
      JSON.stringify(preferences)
    );
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem(
      LS_KEYS.INGREDIENTS,
      JSON.stringify(ingredients)
    );
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem(
      LS_KEYS.ADD_STORAGE,
      JSON.stringify(addStorage)
    );
  }, [addStorage]);

  /* -------- guards (防白屏) -------- */
  useEffect(() => {
    const validSteps = ['landing', 'preferences', 'ingredients', 'main'];
    if (!validSteps.includes(step)) {
      console.warn('Invalid step, reset to landing:', step);
      setStep('landing');
    }
  }, [step]);

  /* -------- actions -------- */
  const clearFridge = () => {
    setIngredients([]);
    localStorage.removeItem(LS_KEYS.INGREDIENTS);
  };

  const goAddIngredients = (storage = 'fridge') => {
    setAddStorage(storage);
    setStep('ingredients');
  };

  /* -------- render -------- */
  return (
    <>
      {step === 'landing' && (
        <LandingPage onNext={() => setStep('preferences')} />
      )}

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
          addStorage={addStorage}
          setAddStorage={setAddStorage}
          onComplete={() => setStep('main')}
          onBack={() => setStep('main')}
        />
      )}

      {step === 'main' && (
        <MainPage
          ingredients={ingredients}
          setIngredients={setIngredients}
          preferences={preferences}
          onBack={() => goAddIngredients('fridge')}
          onClearFridge={clearFridge}
          addStorage={addStorage}
          onAddToStorage={goAddIngredients}
        />
      )}
    </>
  );
}

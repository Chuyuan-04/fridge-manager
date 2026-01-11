import { supabase } from './config/supabaseClient';
import React, { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import PreferencesPage from './components/PreferencesPage';
import IngredientsPage from './components/IngredientsPage';
import MainPage from './components/MainPage';

const LS_KEYS = { INGREDIENTS: 'fm_ingredients_v1', PREFERENCES: 'fm_preferences_v1', STEP: 'fm_step_v1', ADD_STORAGE: 'fm_addStorage_v1' };
const DEFAULT_PREFERENCES = { tastes: [], quickMeals: false, allergens: [], dietType: [], restrictions: [], periodRestrictions: [], considerNutrition: false };

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

export default function App() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(() => loadFromLocalStorage(LS_KEYS.STEP, 'landing'));
  const [preferences, setPreferences] = useState(() => loadFromLocalStorage(LS_KEYS.PREFERENCES, DEFAULT_PREFERENCES));
  const [ingredients, setIngredients] = useState(() => loadFromLocalStorage(LS_KEYS.INGREDIENTS, []));
  const [addStorage, setAddStorage] = useState(() => loadFromLocalStorage(LS_KEYS.ADD_STORAGE, 'fridge'));

  /* -------- 1. 监听登录状态 -------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔑 登录状态变化:", _event, session?.user?.email);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* -------- 2. 登录后拉取云端数据 -------- */
  useEffect(() => {
    if (user) {
      const syncCloudData = async () => {
        console.log("📡 正在为用户", user.email, "抓取云端数据...");
        
        // 抓取食材
        const { data: cloudIngredients } = await supabase
          .from('ingredients')
          .select('*')
          .eq('user_id', user.id);
        
        if (cloudIngredients && cloudIngredients.length > 0) {
          setIngredients(cloudIngredients);
        }

        // ✅ 核心修复：获取偏好使用 maybeSingle() 避免 406 报错
        const { data: cloudPrefs, error: prefError } = await supabase
          .from('preferences')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(); 
        
        if (prefError) console.warn("抓取偏好提示:", prefError.message);
        
        if (cloudPrefs) {
          // 将数据库的下划线格式转回代码的驼峰格式
          setPreferences({
            tastes: cloudPrefs.tastes,
            quickMeals: cloudPrefs.quick_meals,
            allergens: cloudPrefs.allergens,
            dietType: cloudPrefs.diet_type,
            restrictions: cloudPrefs.restrictions,
            periodRestrictions: cloudPrefs.period_restrictions,
            considerNutrition: cloudPrefs.consider_nutrition
          });
        }
      };

      syncCloudData();
    }
  }, [user]);

  /* -------- 3. 数据持久化逻辑 -------- */
  useEffect(() => { localStorage.setItem(LS_KEYS.STEP, JSON.stringify(step)); }, [step]);
  
  // ✅ 核心修复：同步偏好到云端时，映射字段名以匹配数据库
  useEffect(() => { 
    localStorage.setItem(LS_KEYS.PREFERENCES, JSON.stringify(preferences));
    if (user) { 
      const prefsForDB = {
        id: user.id,
        tastes: preferences.tastes,
        quick_meals: preferences.quickMeals,
        allergens: preferences.allergens,
        diet_type: preferences.dietType,
        restrictions: preferences.restrictions,
        period_restrictions: preferences.periodRestrictions,
        consider_nutrition: preferences.considerNutrition,
        updated_at: new Date()
      };
      supabase.from('preferences').upsert(prefsForDB).then(({error}) => {
        if(error) console.error("同步偏好至云端失败:", error.message);
      }); 
    }
  }, [preferences, user]);

  useEffect(() => { localStorage.setItem(LS_KEYS.INGREDIENTS, JSON.stringify(ingredients)); }, [ingredients]);
  useEffect(() => { localStorage.setItem(LS_KEYS.ADD_STORAGE, JSON.stringify(addStorage)); }, [addStorage]);

  /* -------- 4. 核心操作 -------- */
  const clearFridge = async () => {
    if (window.confirm("确定要清空冰箱吗？云端数据也会同步删除。")) {
      setIngredients([]);
      localStorage.removeItem(LS_KEYS.INGREDIENTS);
      if (user) {
        await supabase.from('ingredients').delete().eq('user_id', user.id);
      }
    }
  };

  const goAddIngredients = (storage = 'fridge') => {
    setAddStorage(storage);
    setStep('ingredients');
  };

  /* -------- 5. 自动跳关逻辑 -------- */
  useEffect(() => {
    if (user && step === 'landing') {
      console.log("🚀 检测到已登录，自动跳转至主页...");
      setStep('main');
    }
  }, [user, step]);

  /* -------- 渲染 -------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <div className="p-2 text-xs text-right bg-green-100 text-green-800 shadow-inner">
          🟢 已连接云端: {user.email}
        </div>
      )}

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
          user={user}
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
    </div>
  );
}
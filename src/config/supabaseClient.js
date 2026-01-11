// src/config/supabaseClient.js
import { createClient } from '@supabase/supabase-js'
console.log('所有环境变量:', import.meta.env);

// 1. Vite 中使用 import.meta.env 而不是 process.env
// 2. 变量名必须以 VITE_ 开头才能被识别
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 3. 使用 export const，这样才能匹配 App.jsx 里的 import { supabase }
export const supabase = createClient(supabaseUrl, supabaseKey)
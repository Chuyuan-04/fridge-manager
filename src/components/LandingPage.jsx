import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient'; // 确保路径正确

function LandingPage({ onNext }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 调用 Supabase 的发送魔术链接功能
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // 登录成功后跳回的地址，Vite 本地开发通常是 http://localhost:5173
        emailRedirectTo: window.location.origin, 
      },
    });

    if (error) {
      setMessage(`❌ 错误: ${error.message}`);
    } else {
      setMessage('✅ 登录邮件已发送！请检查你的收件箱并点击链接。');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <div className="text-6xl mb-6">🧊🍳</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">冰箱托管</h1>
        <p className="text-xl text-gray-600 mb-8">
          将你的冰箱托管<br/>
          解放大脑<br/>
          根据现有食材，智能推荐菜谱

        </p>

        {/* 登录区域 */}
        <div className="bg-white rounded-lg p-8 mb-8 shadow-lg border border-blue-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">登录以同步云端数据</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="输入你的邮箱..."
              className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition"
            >
              {loading ? '发送中...' : '发送登录链接'}
            </button>
          </form>
          {message && <p className="mt-4 text-sm text-blue-600 font-medium">{message}</p>}
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={onNext}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              暂不登录，直接开始使用 (数据仅存本地)
            </button>
          </div>
        </div>

        {/* 原有的特点展示卡片 */}
        <div className="grid grid-cols-3 gap-4 text-sm opacity-70">
           {/* ... 原有的三个特点代码 ... */}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
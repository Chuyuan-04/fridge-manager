
import React from 'react';

function LandingPage({ onNext }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <div className="text-6xl mb-6">🧊🍳</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">冰箱托管</h1>
        <p className="text-xl text-gray-600 mb-8">
          不需要记住冰箱里有什么<br/>
          不用每天想"今天吃什么"<br/>
          基于现有食材，智能推荐菜谱
        </p>
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-3xl mb-2">⏱️</div>
              <div className="font-semibold">省时省事</div>
              <div className="text-gray-500">3分钟完成设置</div>
            </div>
            <div>
              <div className="text-3xl mb-2">♻️</div>
              <div className="font-semibold">减少浪费</div>
              <div className="text-gray-500">提醒快过期食材</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold">精准推荐</div>
              <div className="text-gray-500">基于实际食材</div>
            </div>
          </div>
        </div>
        <button
          onClick={onNext}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          开始托管我的冰箱 →
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
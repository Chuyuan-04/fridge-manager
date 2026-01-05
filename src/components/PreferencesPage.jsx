import React from 'react';
export default function PreferencesPage({ onNext }) {
  return <div className="p-10">偏好设置页 <button onClick={onNext} className="bg-blue-500 text-white p-2">下一步</button></div>;
}
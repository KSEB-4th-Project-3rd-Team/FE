"use client";

import React from "react";
import { Unity } from "react-unity-webgl";
import type { UnityProvider } from "react-unity-webgl/distribution/types/unity-provider";
import { Activity, Cpu, Zap } from "lucide-react";

interface UnityPlayerProps {
  unityProvider: UnityProvider;
  isLoaded: boolean;
  loadingProgression: number;
}

const UnityPlayer = ({ unityProvider, isLoaded, loadingProgression }: UnityPlayerProps) => {
  const loadingPercentage = Math.round(loadingProgression * 100);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }} className="bg-gradient-to-br from-blue-50 to-indigo-100">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="text-center space-y-6 p-8">
            {/* 애니메이션 아이콘 */}
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Activity className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Cpu className="w-3 h-3 text-white animate-spin" />
              </div>
            </div>
            
            {/* 로딩 텍스트 */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                WMS 시뮬레이션 로딩 중
              </h3>
              <p className="text-sm text-gray-600">
                3D 창고 환경을 준비하고 있습니다...
              </p>
            </div>
            
            {/* 프로그레스 바 */}
            <div className="w-80 max-w-full mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">진행률</span>
                <span className="text-sm font-bold text-blue-600">{loadingPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div 
                  className="h-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-sm transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${loadingPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                </div>
              </div>
            </div>
            
            {/* 로딩 단계 */}
            <div className="space-y-2 text-xs text-gray-500">
              {loadingPercentage < 30 && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <span>시스템 초기화 중...</span>
                </div>
              )}
              {loadingPercentage >= 30 && loadingPercentage < 70 && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <span>3D 모델 로딩 중...</span>
                </div>
              )}
              {loadingPercentage >= 70 && loadingPercentage < 95 && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span>시뮬레이션 환경 구성 중...</span>
                </div>
              )}
              {loadingPercentage >= 95 && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  <span>마지막 준비 중...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <Unity
        unityProvider={unityProvider}
        style={{
          visibility: isLoaded ? "visible" : "hidden",
          width: '100%',
          height: '100%',
          imageSmoothing: false,
        }}
        devicePixelRatio={Math.min(window.devicePixelRatio || 1, 2)}
      />
      
      {/* 로딩 완료 후 페이드인 효과 */}
      {isLoaded && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full animate-fade-in"></div>
        </div>
      )}
    </div>
  );
};

export default UnityPlayer;

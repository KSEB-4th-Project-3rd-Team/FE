"use client";

import React from "react";
import { Unity } from "react-unity-webgl";
import type { UnityProvider } from "react-unity-webgl/distribution/types/unity-provider";

interface UnityPlayerProps {
  unityProvider: UnityProvider;
  isLoaded: boolean;
  loadingProgression: number;
}

const UnityPlayer = ({ unityProvider, isLoaded, loadingProgression }: UnityPlayerProps) => {
  const loadingPercentage = Math.round(loadingProgression * 100);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!isLoaded && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <p>Loading... ({loadingPercentage}%)</p>
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
    </div>
  );
};

export default UnityPlayer;

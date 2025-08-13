"use client";

import React from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

const UnityPlayer = () => {
  const { unityProvider, isLoaded, loadingProgression } = useUnityContext({
    // ✅ 중요: 아래 파일 이름들은 Unity 빌드 설정에 따라 달라질 수 있습니다.
    // KSEB-Web/public/unity/Build/ 폴더에 있는 실제 파일명으로 수정해주세요.
    loaderUrl: "/unity/Build/build.loader.js",
    dataUrl: "/unity/Build/build.data",
    frameworkUrl: "/unity/Build/build.framework.js",
    codeUrl: "/unity/Build/build.wasm",
  });

  // 로딩 진행률을 표시합니다.
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
        }}
      />
    </div>
  );
};

export default UnityPlayer;

# 프론트와 약속할 “연결 규격 (컨트랙트)”

- **GameObject**: `"TaskBridge"`
- **메서드**: `AssignTaskFromJson(string json)`
- **JSON 스키마**:
    
    ```json
    json
    복사편집
    {
      "type": "inbound | outbound | 입고 | 출고",
      "rackId": "B003",   // 또는 B03 등, Unity가 ConvertRackId로 정규화함
      "taskId": "선택",   // 없으면 무시
      "ts": 1723530000000 // 선택
    }
    
    ```
    
- **성공 조건**: Unity 콘솔에 `[TaskBridge] 작업 등록 OK → INBOUND B03 (taskId=...)` 등 로그가 찍힘 → `TaskManager`의 `allTasks`/`pendingTasks`에 삽입됨 → `Update()`의 `AssignPendingTasks()`가 알아서 할당.

---

# 1) 순수 HTML + JS 최소 예제 (로컬 테스트용)

프론트 몰라도 이 파일 하나로 바로 검증 가능해.

```html
html
복사편집
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Unity WebGL Bridge Test</title>
    <style> #unity-canvas { width: 960px; height: 600px; background:#111; } </style>
  </head>
  <body>
    <canvas id="unity-canvas"></canvas>
    <div>
      <select id="type">
        <option value="inbound">inbound</option>
        <option value="outbound">outbound</option>
      </select>
      <input id="rack" placeholder="B003" value="B003" />
      <button id="send">입출고 승인</button>
      <span id="status">Loading Unity…</span>
    </div>

    <!-- 1) Unity 로더 불러오기 (경로는 네 빌드 파일명에 맞춰 수정) -->
    <script src="/Unity/Build/AMR.loader.js"></script>
    <script>
      // 2) 인스턴스 생성
      const config = {
        dataUrl: "/Unity/Build/AMR.data",
        frameworkUrl: "/Unity/Build/AMR.framework.js",
        codeUrl: "/Unity/Build/AMR.wasm",
        streamingAssetsUrl: "/Unity/StreamingAssets",
        companyName: "YourCompany",
        productName: "AMR",
        productVersion: "1.0",
      };
      let unity = null;
      createUnityInstance(document.getElementById("unity-canvas"), config).then(inst => {
        unity = inst;
        document.getElementById("status").textContent = "Unity ready";
      });

      // 3) 버튼 → Unity로 JSON 전송
      document.getElementById("send").onclick = () => {
        if (!unity) { alert("Unity 준비 중"); return; }
        const payload = {
          taskId: (crypto.randomUUID?.() || String(Date.now())),
          type: document.getElementById("type").value, // inbound | outbound
          rackId: document.getElementById("rack").value,
          ts: Date.now()
        };
        unity.SendMessage("TaskBridge", "AssignTaskFromJson", JSON.stringify(payload));
        console.log("sent", payload);
      };
    </script>
  </body>
</html>

```

> 이걸로 브라우저 콘솔(F12)에서 Unity 로그까지 같이 보이면 연결 OK.
> 
> 
> 빌드가 압축되어 있으면(브로틀리/지집) **Player Settings → Publishing → Decompression Fallback** 체크해두면 dev서버에서도 잘 뜬다.
> 

---

# 2) React에 붙일 때(프론트 담당자에게 줄 버전)

```jsx
jsx
복사편집
// UnityEmbed.jsx
import { useEffect, useRef, useState } from "react";

export default function UnityEmbed() {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "/Unity/Build/AMR.loader.js";
    s.onload = () => {
      const cfg = {
        dataUrl: "/Unity/Build/AMR.data",
        frameworkUrl: "/Unity/Build/AMR.framework.js",
        codeUrl: "/Unity/Build/AMR.wasm",
        streamingAssetsUrl: "/Unity/StreamingAssets",
        companyName: "YourCompany",
        productName: "AMR",
        productVersion: "1.0",
      };
      // @ts-ignore
      createUnityInstance(canvasRef.current, cfg).then(inst => {
        window.unity = inst;
        setReady(true);
      });
    };
    document.body.appendChild(s);
    return () => document.body.removeChild(s);
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} id="unity-canvas" style={{ width: 960, height: 600 }} />
      <div style={{ marginTop: 8, fontSize: 12 }}>{ready ? "Unity ready" : "Loading Unity…"}</div>
    </div>
  );
}

```

```jsx
jsx
복사편집
// ApproveControls.jsx
export default function ApproveControls() {
  const approve = (type, rackId) => {
    const inst = window.unity;
    if (!inst) return alert("Unity 준비 중");
    const msg = { taskId: crypto.randomUUID?.() ?? String(Date.now()), type, rackId, ts: Date.now() };
    inst.SendMessage("TaskBridge", "AssignTaskFromJson", JSON.stringify(msg));
  };

  return (
    <div>
      <button onClick={() => approve("inbound", "B003")}>입고 B003 승인</button>
      <button onClick={() => approve("outbound", "B015")}>출고 B015 승인</button>
    </div>
  );
}

```

- 프론트는 **`createUnityInstance` 후 `window.unity`에 저장**만 해주면, 어디서든 `SendMessage` 호출 가능.
- GameObject/메서드 이름은 **대소문자 정확히 일치**해야 함.

# Unity 쪽 체크리스트 (마지막 점검)

- 씬에 **`TaskBridge`*라는 GameObject 존재 + `TaskBridge.cs` 붙어있음.
- `TaskBridge.taskManager` 슬롯에 실제 `TaskManager` 오브젝트 연결됨.
- **Development Build**로 한 번 빌드해서 브라우저 콘솔에서 `Debug.Log`가 보이는지 확인.
- (압축 사용 시) **Decompression Fallback** ON 또는 서버에 브로틀리/지집 헤더 설정.

---

# 디버깅 포인트

- `SendMessage`는 리턴값 없음 → **Unity 쪽 로그**로 확인:
    - 정상: `[TaskBridge] 작업 등록 OK → INBOUND B03 …`
    - 오류: `JSON 파싱 실패` / `랙 위치 없음` / `taskManager 참조 없음`
- 오브젝트/메서드 이름 불일치가 제일 흔한 원인.
- 빌드가 안 뜨면 로더 경로/파일명, 또는 압축 설정 의심.
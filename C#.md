using UnityEngine;
using System.Runtime.InteropServices;
using System.Collections.Generic;

[System.Serializable]
public class WebTaskPayload
{
    public string type;    // "inbound" | "outbound" | "입고" | "출고" (대소문자 OK)
    public string rackId;  // 예: "B003", "B03"
    public string taskId;  // (선택) 웹에서 지정하고 싶으면 사용
    public long ts;        // (선택)
}

public class TaskBridge : MonoBehaviour
{
    public TaskManager taskManager; // 인스펙터에서 연결

    // 완료된 작업 추적 (중복 전송 방지)
    private HashSet<int> reportedTasks = new HashSet<int>();
    private float checkInterval = 0.5f; // 0.5초마다 체크
    private float nextCheckTime = 0f;

#if UNITY_WEBGL && !UNITY_EDITOR
    // JavaScript 함수 호출을 위한 외부 함수 선언
    [DllImport("__Internal")]
    private static extern void SendMessageToParent(string message);
#endif

    void Start()
    {
        Debug.Log($"=== GameObject 이름: '{gameObject.name}' ===");
        Debug.Log($"=== TaskManager 연결: {taskManager != null} ===");
    }

    void Update()
    {
        // 주기적으로 작업 완료 체크
        if (Time.time >= nextCheckTime)
        {
            CheckCompletedTasks();
            nextCheckTime = Time.time + checkInterval;
        }
    }

    // 완료된 작업 체크 및 프론트로 전송
    private void CheckCompletedTasks()
    {
        if (taskManager == null) return;

        foreach (var task in taskManager.completedTasks)
        {
            // 이미 보고한 작업은 스킵
            if (reportedTasks.Contains(task.taskId)) continue;

            // 작업 완료 메시지 전송
            OnTaskCompleted(task.taskId.ToString(), task.rackId, task.type);
            reportedTasks.Add(task.taskId);
        }
    }

    // ===== Unity → 프론트엔드 메시지 전송 메서드들 =====

    // 작업 완료 시 호출
    public void OnTaskCompleted(string taskId, string rackId, string taskType)
    {
        string message = $"{{" +
            $"\"type\":\"TaskCompleted\"," +
            $"\"taskId\":\"{taskId}\"," +
            $"\"rackId\":\"{rackId}\"," +
            $"\"taskType\":\"{taskType}\"," +
            $"\"timestamp\":{System.DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}" +
            $"}}";

        SendToFrontend(message);
        Debug.Log($"[TaskBridge → Frontend] 작업 완료: Task {taskId} - {taskType} {rackId}");
    }

    // 작업 시작 시 호출 (선택사항)
    public void OnTaskStarted(string taskId, string amrId, string taskType)
    {
        string message = $"{{" +
            $"\"type\":\"TaskStarted\"," +
            $"\"taskId\":\"{taskId}\"," +
            $"\"amrId\":\"{amrId}\"," +
            $"\"taskType\":\"{taskType}\"," +
            $"\"timestamp\":{System.DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}" +
            $"}}";

        SendToFrontend(message);
        Debug.Log($"[TaskBridge → Frontend] 작업 시작: Task {taskId} by AMR_{amrId}");
    }

    // AMR 상태 변경 시 호출 (선택사항)
    public void OnAmrStatusChanged(string amrId, string status)
    {
        string message = $"{{" +
            $"\"type\":\"AmrStatusChanged\"," +
            $"\"amrId\":\"{amrId}\"," +
            $"\"status\":\"{status}\"," +
            $"\"timestamp\":{System.DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}" +
            $"}}";

        SendToFrontend(message);
    }

    // 에러 발생 시 호출 (선택사항)
    public void OnTaskError(string taskId, string errorMessage)
    {
        // JSON 이스케이프 처리
        errorMessage = errorMessage.Replace("\"", "\\\"");

        string message = $"{{" +
            $"\"type\":\"TaskError\"," +
            $"\"taskId\":\"{taskId}\"," +
            $"\"error\":\"{errorMessage}\"," +
            $"\"timestamp\":{System.DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}" +
            $"}}";

        SendToFrontend(message);
        Debug.LogError($"[TaskBridge → Frontend] 작업 에러: Task {taskId} - {errorMessage}");
    }

    // 프론트엔드로 메시지 전송 (공통 메서드)
    private void SendToFrontend(string message)
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        // WebGL 빌드에서는 JavaScript 함수 호출
        SendMessageToParent(message);
#else
        // 에디터에서는 콘솔 출력
        Debug.Log($"[To Frontend] {message}");
#endif
    }

    // ===== 프론트엔드 → Unity 메시지 수신 (기존 코드 유지) =====

    // JS → Unity 진입점 (반드시 string 하나 받는 시그니처)
    public void AssignTaskFromJson(string json)
    {
        if (taskManager == null)
        {
            Debug.LogError("[TaskBridge] taskManager 참조가 없습니다.");
            return;
        }
        if (string.IsNullOrEmpty(json))
        {
            Debug.LogError("[TaskBridge] 빈 JSON.");
            return;
        }

        WebTaskPayload m = null;
        try
        {
            m = JsonUtility.FromJson<WebTaskPayload>(json);
        }
        catch (System.Exception e)
        {
            Debug.LogError($"[TaskBridge] JSON 파싱 실패: {e.Message}\n{json}");
            OnTaskError("unknown", $"JSON 파싱 실패: {e.Message}");
            return;
        }

        if (m == null || string.IsNullOrWhiteSpace(m.type) || string.IsNullOrWhiteSpace(m.rackId))
        {
            Debug.LogError($"[TaskBridge] 필드 부족(type/rackId). json={json}");
            OnTaskError(m?.taskId ?? "unknown", "필수 필드 누락");
            return;
        }

        // 1) type 매핑
        string mappedType = MapType(m.type);
        if (mappedType == null)
        {
            Debug.LogError($"[TaskBridge] 지원하지 않는 type: {m.type}");
            OnTaskError(m.taskId, $"지원하지 않는 type: {m.type}");
            return;
        }

        // 2) 랙ID 정규화
        string normalizedRack = taskManager.ConvertRackId(m.rackId);

        // 3) 랙 좌표 조회 (없으면 중단)
        Vector3 rackPosition = taskManager.GetRackPosition(normalizedRack);
        if (rackPosition == Vector3.zero)
        {
            Debug.LogError($"[TaskBridge] 랙 '{normalizedRack}' 위치를 찾을 수 없습니다.");
            OnTaskError(m.taskId, $"랙 {normalizedRack} 위치를 찾을 수 없음");
            return;
        }

        // 4) 새 작업 생성
        var newTask = new TaskManager.TaskType
        {
            // 웹에서 taskId를 주면 사용, 아니면 1000번대 자동
            taskId = !string.IsNullOrEmpty(m.taskId) ?
                     SafeParseInt(m.taskId, taskManager.allTasks.Count + 1000) :
                     taskManager.allTasks.Count + 1000,
            type = mappedType,               // "INBOUND" | "OUTBOUND"
            rackId = normalizedRack,         // 예: "B03"
            status = "pending",
            assignedAgentId = -1,
            currentPhase = 0,
            assignedTime = 0f
        };

        // 5) 중간/최종 목표 세팅 (TaskManager 로직과 동일한 규칙)
        if (mappedType == "INBOUND")
        {
            newTask.intermediateTarget = taskManager.inboundArea.position; // 먼저 입고장
            newTask.finalTarget = rackPosition;                            // 그 다음 랙
        }
        else // OUTBOUND
        {
            newTask.intermediateTarget = rackPosition;                     // 먼저 랙
            newTask.finalTarget = taskManager.outboundArea.position;       // 그 다음 출고장
        }

        // 6) 큐 삽입
        taskManager.allTasks.Add(newTask);
        taskManager.pendingTasks.Enqueue(newTask);

        Debug.Log($"[TaskBridge] 작업 등록 OK → {newTask.type} {newTask.rackId} (taskId={newTask.taskId})");

        // 작업 등록 완료 알림 전송
        OnTaskRegistered(newTask.taskId.ToString(), newTask.rackId, newTask.type);
    }

    // 작업 등록 완료 알림
    private void OnTaskRegistered(string taskId, string rackId, string taskType)
    {
        string message = $"{{" +
            $"\"type\":\"TaskRegistered\"," +
            $"\"taskId\":\"{taskId}\"," +
            $"\"rackId\":\"{rackId}\"," +
            $"\"taskType\":\"{taskType}\"," +
            $"\"timestamp\":{System.DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}" +
            $"}}";

        SendToFrontend(message);
        Debug.Log($"[TaskBridge → Frontend] 작업 등록: Task {taskId}");
    }

    // TaskManager에서 직접 호출할 수 있는 public 메서드
    public void NotifyTaskAssigned(int taskId, int amrId)
    {
        var task = taskManager.allTasks.Find(t => t.taskId == taskId);
        if (task != null)
        {
            OnTaskStarted(taskId.ToString(), amrId.ToString(), task.type);
        }
    }

    // TaskManager에서 직접 호출할 수 있는 public 메서드  
    public void NotifyTaskCompleted(int taskId)
    {
        var task = taskManager.completedTasks.Find(t => t.taskId == taskId);
        if (task != null)
        {
            OnTaskCompleted(taskId.ToString(), task.rackId, task.type);
        }
    }

    private string MapType(string t)
    {
        if (string.IsNullOrEmpty(t)) return null;
        t = t.Trim().ToLower();
        if (t == "in" || t == "inbound" || t == "입고") return "INBOUND";
        if (t == "out" || t == "outbound" || t == "출고") return "OUTBOUND";
        return null;
    }

    private int SafeParseInt(string s, int fallback)
    {
        if (int.TryParse(s, out var v)) return v;
        return fallback;
    }

    // 시스템 상태 전송 (선택사항 - 대시보드용)
    public void SendSystemStatus()
    {
        if (taskManager == null) return;

        string message = $"{{" +
            $"\"type\":\"SystemStatus\"," +
            $"\"totalTasks\":{taskManager.allTasks.Count}," +
            $"\"pendingTasks\":{taskManager.pendingTasks.Count}," +
            $"\"activeTasks\":{taskManager.amrCurrentTasks.Count}," +
            $"\"completedTasks\":{taskManager.completedTasks.Count}," +
            $"\"timestamp\":{System.DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}" +
            $"}}";

        SendToFrontend(message);
    }
}
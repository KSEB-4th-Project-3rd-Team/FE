using UnityEngine;

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
        try { m = JsonUtility.FromJson<WebTaskPayload>(json); }
        catch (System.Exception e)
        {
            Debug.LogError($"[TaskBridge] JSON 파싱 실패: {e.Message}\n{json}");
            return;
        }
        if (m == null || string.IsNullOrWhiteSpace(m.type) || string.IsNullOrWhiteSpace(m.rackId))
        {
            Debug.LogError($"[TaskBridge] 필드 부족(type/rackId). json={json}");
            return;
        }

        // 1) type 매핑
        string mappedType = MapType(m.type);
        if (mappedType == null)
        {
            Debug.LogError($"[TaskBridge] 지원하지 않는 type: {m.type}");
            return;
        }

        // 2) 랙ID 정규화
        string normalizedRack = taskManager.ConvertRackId(m.rackId);

        // 3) 랙 좌표 조회 (없으면 중단)
        Vector3 rackPosition = taskManager.GetRackPosition(normalizedRack);
        if (rackPosition == Vector3.zero)
        {
            Debug.LogError($"[TaskBridge] 랙 '{normalizedRack}' 위치를 찾을 수 없습니다.");
            return;
        }

        // 4) 새 작업 생성
        var newTask = new TaskManager.TaskType
        {
            // 웹에서 taskId를 주면 사용, 아니면 1000번대 자동
            taskId = !string.IsNullOrEmpty(m.taskId) ? SafeParseInt(m.taskId, taskManager.allTasks.Count + 1000)
                                                     : taskManager.allTasks.Count + 1000,
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

        // (선택) autoAssignTasks가 켜져 있더라도 바로 돌리고 싶으면 다음 줄 주석 해제
        // taskManager.AssignPendingTasks();
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
}

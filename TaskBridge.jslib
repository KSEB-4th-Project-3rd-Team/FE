     mergeInto(LibraryManager.library, {
         SendMessageToParent: function(messagePtr) {
             var message = UTF8ToString(messagePtr);

             try {
                 var parsedMessage = JSON.parse(message);

                 if (parsedMessage.type === 'TaskCompleted') {
                     // 전역 함수가 있는지 확인하고 직접 호출
                     if (typeof window.onUnityTaskCompleted === 'function') {
                         // 이벤트 객체 대신, 순수한 데이터 객체(parsedMessage)를 전달
                         window.onUnityTaskCompleted(parsedMessage);
                     } else {
                         console.warn('[Unity → Web] window.onUnityTaskCompleted function not
      found.');
                     }
                     console.log('[Unity → Web] Task Completed:', parsedMessage.taskId);
                 }

             } catch (e) {
                 console.error('[Unity → Web] Error:', e);
             }
         }
     });
# Hướng dẫn gửi điểm về web (dành cho người làm Unity / Unreal)

Tài liệu này mô tả **duy nhất 1 việc cần làm** để bài thực hành (Unity hoặc Unreal) báo điểm về được hệ thống web P-DTwin sau khi sinh viên làm xong bài. Không cần quan tâm bài làm bằng công nghệ gì, miễn tuân theo đúng hợp đồng (contract) dưới đây.

## Bối cảnh

Bài thực hành được nhúng vào trang web qua `<iframe>`. Trang web đã tự truyền sẵn 2 tham số vào URL của iframe khi nhúng:

```
?assignmentId=123&token=eyJhbGciOi...
```

- `assignmentId`: mã bài làm của sinh viên đó, dùng nếu bên Unity/Unreal cần định danh (thường không cần dùng tới, vì web tự biết bài nào đang mở).
- `token`: JWT của sinh viên, không cần Unity/Unreal xử lý gì, web tự lo phần gửi API.

Việc duy nhất bên làm bài (Unity/Unreal) cần làm là: **khi sinh viên hoàn thành bài, gọi 1 lệnh JavaScript báo điểm về cho trang web cha (parent).** Trang web sẽ tự nhận và gửi điểm lên server.

## Hợp đồng (contract) cần tuân theo

Khi bài hoàn thành (có kết quả cuối cùng — dù đạt hay không đạt), gọi đúng lệnh sau **1 lần duy nhất**:

```js
window.parent.postMessage({
  type: "PDTWIN_SUBMIT",
  score: 8.5,        // BẮT BUỘC — số điểm, thang 0-10 (được phép số thập phân), không âm, không vượt quá 10
  details: "..."     // KHÔNG bắt buộc — 1 chuỗi string tự do, ghi chú thêm chi tiết làm bài (nếu có nhiều dữ liệu thì tự JSON.stringify(...) trước khi gán vào đây, đừng gán thẳng object)
}, window.location.origin);
```

**Lưu ý quan trọng:**
- Chỉ gọi **1 lần** khi đã có kết quả cuối cùng — không gọi lặp đi lặp lại giữa chừng lúc chưa xong bài.
- `score` phải là kiểu số (number), không phải chuỗi chữ.
- Tham số thứ 2 của `postMessage` nên dùng `window.location.origin` (không dùng `"*"`) để chỉ gửi cho đúng trang web đang nhúng nó, an toàn hơn.

## (Mới) Báo điểm tạm thời — cho phép "thoát giữa chừng vẫn giữ điểm"

Ngoài lệnh nộp điểm cuối cùng ở trên, web P-DTwin giờ hỗ trợ thêm 1 lệnh **không bắt buộc**: báo điểm **tạm thời** (điểm đang có tính tới thời điểm hiện tại, chưa phải kết quả cuối). Mục đích: nếu sinh viên thoát ra giữa chừng khi chưa làm xong bài, web sẽ ghi nhận đúng điểm đang có tại thời điểm đó thay vì luôn về 0.

```js
window.parent.postMessage({
  type: "PDTWIN_PROGRESS",
  score: 5   // điểm hiện tại tính tới lúc này, thang 0-10
}, window.location.origin);
```

**Khác với `PDTWIN_SUBMIT` ở chỗ:**
- Gọi được **nhiều lần**, mỗi khi điểm/tiến độ thay đổi (vd sau mỗi bước hoàn thành) — không giới hạn số lần như `PDTWIN_SUBMIT`.
- Không tự động lưu lên server ngay — web chỉ giữ tạm giá trị này ở phía trình duyệt. Server chỉ thực sự ghi điểm khi: (a) bài hoàn thành và gọi `PDTWIN_SUBMIT` như bình thường, hoặc (b) sinh viên thoát giữa chừng và xác nhận thoát — lúc đó web mới gửi giá trị `PDTWIN_PROGRESS` gần nhất lên server thay cho 0.
- Không cần `details`, không bắt buộc phải gọi — nếu không gọi gì cả, hành vi mặc định vẫn như cũ: thoát giữa chừng = điểm 0.

Nếu bên Unity/Unreal muốn tính năng "làm được nửa vẫn được nửa điểm" hoạt động, chỉ cần gọi thêm lệnh này mỗi khi điểm hiện tại thay đổi trong lúc chơi — không cần đổi gì ở `PDTWIN_SUBMIT` lúc hoàn thành.

## Nếu làm bằng Unity WebGL

Unity không gọi thẳng JS từ C# được — cần qua 1 file `.jslib` (plugin JavaScript cho WebGL).

**Bước 1** — Tạo file `Assets/Plugins/WebGL/ScoreBridge.jslib`:
```js
mergeInto(LibraryManager.library, {
  SendScoreToWeb: function (score, detailsPtr) {
    var details = UTF8ToString(detailsPtr);
    window.parent.postMessage({
      type: "PDTWIN_SUBMIT",
      score: score,
      details: details
    }, window.location.origin);
  },

  // Tuỳ chọn — báo điểm tạm thời, gọi được nhiều lần trong lúc chơi
  SendProgressToWeb: function (score) {
    window.parent.postMessage({
      type: "PDTWIN_PROGRESS",
      score: score
    }, window.location.origin);
  }
});
```

**Bước 2** — Trong C#, khai báo và gọi hàm này khi bài hoàn thành:
```csharp
using System.Runtime.InteropServices;

public class ScoreReporter : MonoBehaviour
{
#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern void SendScoreToWeb(float score, string details);
    [DllImport("__Internal")]
    private static extern void SendProgressToWeb(float score);
#endif

    public void ReportScore(float score, string details = "")
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        SendScoreToWeb(score, details);
#else
        Debug.Log($"[Editor] Would report score: {score}, {details}");
#endif
    }

    // Tuỳ chọn — gọi mỗi khi điểm/tiến độ hiện tại thay đổi trong lúc chơi,
    // để nếu sinh viên thoát giữa chừng thì web vẫn giữ đúng điểm đang có.
    public void ReportProgress(float score)
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        SendProgressToWeb(score);
#else
        Debug.Log($"[Editor] Would report progress: {score}");
#endif
    }
}
```
Gọi `ReportScore(...)` ở đúng chỗ code xử lý "bài đã hoàn thành" (vd sau khi tính xong điểm cuối). Gọi `ReportProgress(...)` (không bắt buộc) mỗi khi điểm hiện tại thay đổi giữa lúc chơi.

**Bước 3 — QUAN TRỌNG — WebGL Template**: Mỗi lần Build (export WebGL) từ Unity Editor, Unity thường **ghi đè lại toàn bộ `index.html`** theo template mặc định. Nếu chỉ sửa tay `index.html` sau khi build thì lần build sau sẽ mất code. Cách làm đúng lâu dài: tạo 1 **WebGL Template tuỳ chỉnh** trong project tại `Assets/WebGLTemplates/PDTwinTemplate/index.html` (copy từ template mặc định của Unity rồi thêm đoạn `.jslib` gọi được — thực ra với cách dùng `.jslib` ở trên thì không cần sửa `index.html` nữa, vì code gọi JS nằm trong file `.jslib` đã build kèm theo, không nằm trong `index.html`). Tức là: **làm đúng theo Bước 1 + 2 ở trên thì không cần đụng gì tới `index.html`/WebGL Template cả** — đây là ưu điểm của cách dùng `.jslib`, khỏi lo bị ghi đè mỗi lần build.

**Ví dụ đã chạy thực tế**: file `unity-builds/quiz-demo1/index.html` trong repo web đã có sẵn hàm nhận tương đương (`window.SendScoreToWeb = ...`) — có thể xem tham khảo cách hoạt động, tuy build đó gọi thẳng trong `index.html` (không qua `.jslib`) vì là bản demo cũ hơn.

## Nếu làm bằng Unreal (Pixel Streaming)

Unreal không nhúng JS trực tiếp được như Unity, nhưng Pixel Streaming có sẵn cơ chế gửi dữ liệu tuỳ ý từ Unreal ra trang web (qua WebRTC data channel, thường gọi là "UI Interaction" / custom response message trong Pixel Streaming JS frontend).

**Việc cần làm:**
1. Trong C++/Blueprint Unreal: khi bài hoàn thành, gửi 1 message qua Pixel Streaming data channel (định dạng JSON tuỳ chọn, ví dụ `{"event": "quizComplete", "score": 8.5}`).
2. Trong file JS của Pixel Streaming frontend (file JS mà đội Unreal đang tự host/tuỳ chỉnh cho signalling server — không phải file trong repo web này) — thêm đoạn lắng nghe message đó và **dịch sang đúng hợp đồng ở trên**:
```js
// Trong file JS của Pixel Streaming frontend, chỗ đang xử lý các response từ Unreal gửi lên
if (message.event === "quizComplete") {
  window.parent.postMessage({
    type: "PDTWIN_SUBMIT",
    score: message.score,
    details: JSON.stringify(message)
  }, window.location.origin);
}
```

Việc "dịch" từ định dạng nội bộ Pixel Streaming sang đúng hợp đồng `PDTWIN_SUBMIT` này do bên Unreal tự làm ở tầng JS frontend của họ — trang web P-DTwin chỉ cần nhận đúng `postMessage` theo hợp đồng, không quan tâm bên trong Unreal gửi qua data channel theo cấu trúc gì.

## Tóm tắt cho cả 2 bên

Dù Unity hay Unreal, chỉ cần đảm bảo: **JS chạy trong iframe/trang nhúng bài học gọi đúng 1 lần** `window.parent.postMessage({type:"PDTWIN_SUBMIT", score, details}, window.location.origin)` khi bài hoàn thành. Phần còn lại (nhận điểm, lưu vào hệ thống, hiển thị cho giáo viên) trang web đã tự lo, không cần bên làm bài xử lý gì thêm.

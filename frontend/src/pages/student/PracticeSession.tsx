import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Group, Panel, Separator } from "react-resizable-panels";
import { myAssignments } from "@/api/practice";
import { submitScore } from "@/api/scores";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FullscreenButton from "@/components/ui/FullscreenButton";
import PlcSubmitConsole from "@/components/practice/PlcSubmitConsole";
import { Tag } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { ArrowLeft, AlertTriangle, Clock, Star, Video, VideoOff } from "lucide-react";

export default function PracticeSessionPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const aid = Number(assignmentId);
  useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const gxWorkRef = useRef<HTMLIFrameElement>(null);
  const cameraContainerRef = useRef<HTMLDivElement>(null);

  const { data: assignments = [] } = useQuery({
    queryKey: ["my-assignments"],
    queryFn: myAssignments,
  });

  const assignment = assignments.find((a) => a.id === aid);
  const token = localStorage.getItem("token") ?? "";

  const isAvailable =
    assignment?.status === "AVAILABLE" || assignment?.status === "COMPLETED";
  const isExpired = assignment?.status === "EXPIRED";

  const [camVisible, setCamVisible] = useState(true);
  const [camTimestamp, setCamTimestamp] = useState(() => Date.now());
  const [camError, setCamError] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [exiting, setExiting] = useState(false);

  const needsExitConfirm =
    !!assignment && assignment.status !== "COMPLETED" && score === null;

  useEffect(() => {
    if (!camVisible) return;

    const intervalId = setInterval(() => {
      setCamTimestamp(Date.now());
    }, 200);

    return () => clearInterval(intervalId);
  }, [camVisible]);

  useEffect(() => {
    const handler = async (e: MessageEvent) => {
      let data: {
        type?: string;
        score?: number;
        details?: string;
        data?: unknown;
      } = {};
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }

      if (data.type === "PDTWIN_PROGRESS" && typeof data.score === "number") {
        setCurrentScore(data.score);
        return;
      }

      const isPDTwin =
        data.type === "PDTWIN_SUBMIT" || data.type === "QUIZ_COMPLETE";
      if (isPDTwin && typeof data.score === "number" && !submitted) {
        setSubmitted(true);
        const details =
          data.details ?? (data.data ? JSON.stringify(data.data) : undefined);
        try {
          await submitScore({
            assignmentId: aid,
            score: data.score,
            details,
          });
          setScore(data.score);
          toast.success(`Nộp bài thành công! Điểm: ${data.score}`);
        } catch {
          toast.error("Lỗi khi nộp điểm");
          setSubmitted(false);
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [aid, submitted]);

  // Chặn nút Back của trình duyệt khi chưa nộp bài — mỗi lần bấm Back sẽ
  // đẩy lại 1 nấc lịch sử để giữ nguyên trang, đồng thời mở popup xác nhận.
  useEffect(() => {
    if (!needsExitConfirm) return;

    window.history.pushState(null, "", window.location.href);
    const onPopState = () => {
      window.history.pushState(null, "", window.location.href);
      setShowExitConfirm(true);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [needsExitConfirm]);

  // Cảnh báo mặc định của trình duyệt khi đóng tab/F5/gõ URL khác.
  useEffect(() => {
    if (!needsExitConfirm) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [needsExitConfirm]);

  const handleBackClick = () => {
    if (needsExitConfirm) {
      setShowExitConfirm(true);
    } else {
      navigate("/dashboard");
    }
  };

  const confirmExit = async () => {
    setExiting(true);
    try {
      await submitScore({
        assignmentId: aid,
        score: currentScore,
        details: "Thoát khi chưa hoàn thành bài",
      });
    } catch {
      // Vẫn cho thoát dù nộp điểm 0 thất bại, để không kẹt sinh viên lại trang này.
    }
    setShowExitConfirm(false);
    navigate("/dashboard");
  };

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-sm text-muted">Đang tải bài thực hành...</div>
      </div>
    );
  }

  if (score !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="w-full max-w-sm rounded-[20px] bg-white p-10 text-center shadow-pop">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-success-100">
            <span className="text-2xl font-semibold text-success-500">
              {score ?? assignment?.rawScore}
            </span>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-ink">Hoàn thành!</h2>
          <p className="mb-6 text-sm text-muted">Bài làm của bạn đã được ghi nhận</p>
          <Button size="md" onClick={() => navigate("/my-practice")}>Về danh sách bài</Button>
        </div>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="w-full max-w-sm rounded-[20px] bg-white p-10 text-center shadow-pop">
          <AlertTriangle
            size={40}
            className={`mx-auto mb-4 ${isExpired ? "text-brand-500" : "text-info-500"}`}
          />
          <h2 className="mb-2 text-xl font-semibold text-ink">
            {isExpired ? "Đã hết thời gian" : "Chưa đến giờ làm bài"}
          </h2>
          <p className="mb-6 text-sm text-muted">
            {isExpired
              ? "Thời gian làm bài đã kết thúc"
              : `Bài mở lúc: ${new Date(assignment.startTime!).toLocaleString("vi-VN")}`}
          </p>
          <Button variant="secondary" size="md" icon={<ArrowLeft size={14} />} onClick={() => navigate("/my-practice")}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const iframeSrc = `/unity/${assignment.unitySceneName}/index.html?assignmentId=${aid}&token=${token}`;
  const cameraSrc = `/api/proxy/camera?practiceSessionId=${assignment.practiceSessionId}&t=${camTimestamp}`;
  const showGxWork = assignment.lessonNumber === 2 && !!assignment.gxWorkUrl;
  const showPlcConsole = assignment.lessonNumber === 3;

  const endLabel = new Date(assignment.endTime!).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface">
      {/* Thanh trên: quay lại | tên bài + lớp | điểm, giờ kết thúc, bật/tắt camera */}
      <header className="flex items-center gap-4 border-b border-line bg-white px-5 py-3">
        <Button variant="secondary" icon={<ArrowLeft size={12} />} onClick={handleBackClick}>
          Quay lại
        </Button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-3">
          <h1 className="truncate text-base font-semibold leading-5 text-ink">{assignment.practiceTitle}</h1>
          <Tag className="hidden shrink-0 md:inline-flex">{assignment.classroomName}</Tag>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex h-[30px] items-center gap-1.5 rounded-full bg-info-100 px-3 text-xs text-info-500">
            <Star size={12} /> Điểm hiện tại: <span className="font-semibold">{currentScore}</span>
          </span>
          <span className="flex h-[30px] items-center gap-1.5 rounded-full bg-brand-100 px-3 text-xs text-brand-500">
            <Clock size={12} /> Kết thúc lúc <span className="font-semibold">{endLabel}</span>
          </span>
          <Button variant="outline" icon={camVisible ? <VideoOff size={12} /> : <Video size={12} />}
            onClick={() => setCamVisible((v) => !v)}>
            {camVisible ? "Ẩn camera" : "Hiện camera"}
          </Button>
        </div>
      </header>

      <Group orientation="horizontal" className="min-h-0 flex-1 overflow-hidden p-3">
        {showGxWork && (
          <>
            <Panel defaultSize={38} minSize={15}>
              <WorkCard title="GX Works" fullscreenRef={gxWorkRef} dark>
                <iframe
                  ref={gxWorkRef}
                  src={assignment.gxWorkUrl!}
                  className="size-full border-0"
                  title="GX Work"
                  allow="fullscreen"
                />
              </WorkCard>
            </Panel>
            <ResizeHandle />
          </>
        )}

        <Panel defaultSize={showGxWork ? 39 : 72} minSize={20}>
          <WorkCard title="Mô phỏng Digital Twin" fullscreenRef={iframeRef} dark>
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              className="size-full border-0"
              title="Unity Practice Session"
              allow="fullscreen"
            />
          </WorkCard>
        </Panel>

        {camVisible && (
          <>
            <ResizeHandle />
            <Panel defaultSize={showGxWork ? 23 : 28} minSize={15}>
              <div className="flex h-full flex-col gap-3">
                <div className={showPlcConsole ? "min-h-0 flex-[4]" : "min-h-0 flex-1"}>
                  <WorkCard fullscreenRef={cameraContainerRef} bodyRef={cameraContainerRef} dark
                    title={<span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-success-500 ring-4 ring-success-100" />
                      Camera hệ thống thật
                    </span>}>
                    {assignment.cameraUrl ? (
                      <iframe
                        src={assignment.cameraUrl}
                        className="size-full border-0"
                        title="Camera hệ thống"
                        allow="fullscreen"
                      />
                    ) : camError ? (
                      <div className="flex size-full flex-col items-center justify-center gap-2 text-white/60">
                        <VideoOff size={28} />
                        <span className="text-xs">Không kết nối được camera</span>
                      </div>
                    ) : (
                      <img
                        src={cameraSrc}
                        alt="Camera hệ thống"
                        className="size-full object-cover"
                        onError={() => setCamError(true)}
                      />
                    )}
                  </WorkCard>
                </div>
                {showPlcConsole && (
                  <div className="min-h-0 flex-[6] overflow-hidden rounded-[10px] bg-white shadow-card">
                    <PlcSubmitConsole />
                  </div>
                )}
              </div>
            </Panel>
          </>
        )}
      </Group>

      <Modal
        open={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="Bạn chưa hoàn thành bài"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setShowExitConfirm(false)}>
              Ở lại làm tiếp
            </Button>
            <Button size="md" onClick={confirmExit} disabled={exiting}>
              {exiting ? "Đang thoát..." : `Thoát (điểm ${currentScore})`}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink">
          Bạn chưa nộp bài. Nếu thoát ra bây giờ, điểm sẽ được ghi nhận là{" "}
          <strong>{currentScore}</strong> (theo tiến độ hiện tại). Bạn có
          chắc chắn muốn thoát không?
        </p>
      </Modal>
    </div>
  );
}

/** Card trắng bo góc: header (tiêu đề + nút phóng to) và vùng nội dung (tối cho Unity/camera) */
function WorkCard({ title, fullscreenRef, bodyRef, dark, children }: {
  title: ReactNode;
  fullscreenRef: RefObject<HTMLElement | null>;
  bodyRef?: RefObject<HTMLDivElement | null>;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[10px] bg-white shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink">{title}</span>
        <FullscreenButton targetRef={fullscreenRef} />
      </div>
      <div ref={bodyRef} className={cn("min-h-0 flex-1 overflow-hidden", dark ? "bg-ink" : "bg-white")}>
        {children}
      </div>
    </div>
  );
}

/** Thanh kéo đổi kích thước giữa các card */
function ResizeHandle() {
  return (
    <Separator className="group flex w-3 cursor-col-resize items-center justify-center">
      <span className="h-10 w-1 rounded-full bg-line transition-colors group-hover:bg-brand-300 group-data-[resize-handle-active]:bg-brand-500" />
    </Separator>
  );
}

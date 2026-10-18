import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import {
  uploadGxwFile,
  getPlcSubmitStatus,
  getCurrentPlcJob,
  type PlcJobStatus,
} from "@/api/plcSubmit";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";
import Button from "@/components/ui/Button";

const RUNNING_STATES = ["QUEUED", "COMPILING", "WRITING"];

export default function PlcSubmitConsole() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<PlcJobStatus | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logBoxRef = useRef<HTMLDivElement>(null);

  const isRunning = !!status && RUNNING_STATES.includes(status.state);

  useEffect(() => {
    getCurrentPlcJob()
      .then((res) => {
        if (res.jobId) setJobId(res.jobId);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!jobId) return;
    if (status && !RUNNING_STATES.includes(status.state)) return;

    const poll = async () => {
      try {
        const res = await getPlcSubmitStatus(jobId);
        setStatus(res);
      } catch {
        // Bỏ qua lỗi poll lẻ tẻ, lần gọi sau sẽ tự thử lại.
      }
    };
    poll();
    const intervalId = setInterval(poll, 1000);
    return () => clearInterval(intervalId);
  }, [jobId, status?.state]);

  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [status?.log]);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async () => {
    if (!file || isRunning) return;
    setUploading(true);
    try {
      const res = await uploadGxwFile(file);
      setJobId(res.jobId);
      setStatus(null);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      if (isAxiosError(err)) {
        const code = err.response?.data?.error;
        const message = err.response?.data?.message;
        if (code === "BUSY") {
          toast.error("Đang có bạn khác nạp bài, chờ một chút rồi thử lại");
        } else {
          toast.error(message ?? "Lỗi khi nộp file");
        }
      } else {
        toast.error("Lỗi khi nộp file");
      }
    } finally {
      setUploading(false);
    }
  };

  const logLineColor = (level: string) =>
    level === "error"
      ? "text-brand-500"
      : level === "warn"
        ? "text-amber-600"
        : "text-ink";

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-line px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink">
          Nộp bài GX Works2
        </span>
      </div>

      <div className="flex items-center gap-2 px-3 pt-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".gxw"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          readOnly
          value={file?.name ?? ""}
          placeholder="Chưa chọn file .gxw"
          onClick={handlePickFile}
          className="h-[30px] min-w-0 flex-1 cursor-pointer truncate rounded border border-line bg-subtle px-3 text-xs text-ink placeholder:text-muted"
        />
        <Button variant="secondary" onClick={handlePickFile} disabled={isRunning}>
          Chọn file
        </Button>
        <Button icon={<Upload size={12} />} onClick={handleSubmit} disabled={!file || isRunning || uploading}>
          Nộp bài
        </Button>
      </div>

      {status?.state === "WRITING" && (
        <div className="mx-3 mt-2 rounded-[10px] border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          PLC đang nạp chương trình — Digital Twin tạm dừng, vui lòng đợi
        </div>
      )}

      {status?.state === "FAILED" && status.error && (
        <div className="mx-3 mt-2 rounded-[10px] border border-brand-300 bg-brand-100 px-3 py-2 text-xs text-brand-500">
          {status.error.message}
        </div>
      )}

      <div
        ref={logBoxRef}
        className="m-3 mt-2 min-h-0 flex-1 overflow-y-auto rounded-[10px] border border-line bg-subtle p-3 font-mono text-[11px] leading-5"
      >
        {!status?.log.length && (
          <div className="text-muted">Chưa có nhật ký</div>
        )}
        {status?.log.map((line, i) => (
          <div key={i} className={logLineColor(line.level)}>
            <span className="text-muted">{line.t}</span> {line.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

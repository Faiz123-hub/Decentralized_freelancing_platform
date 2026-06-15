import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import { formatDate } from "../utils/format.js";

const maxImageSize = 2 * 1024 * 1024;

const readImageAttachment = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type || "image/*",
        size: file.size,
        dataUrl: reader.result
      });
    };

    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.readAsDataURL(file);
  });

function JobChat({ jobId, title = "Order chat" }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(`/jobs/${jobId}/messages`);
      setMessages(data.messages || []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load chat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [jobId]);

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setError("");

      if (!file.type.startsWith("image/")) {
        throw new Error("Only photos are supported");
      }

      if (file.size > maxImageSize) {
        throw new Error("Photo must be 2 MB or smaller");
      }

      setAttachment(await readImageAttachment(file));
    } catch (imageError) {
      setAttachment(null);
      setError(imageError.message || "Unable to attach photo");
    } finally {
      event.target.value = "";
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();

    if (!text.trim() && !attachment) {
      setError("Write a message or attach a photo");
      return;
    }

    try {
      setSending(true);
      setError("");
      const { data } = await api.post(`/jobs/${jobId}/messages`, {
        text,
        attachment
      });
      setMessages((current) => [...current, data.message]);
      setText("");
      setAttachment(null);
    } catch (sendError) {
      setError(sendError.response?.data?.message || "Unable to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-brand-400">P2P workspace</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
        </div>
        <button
          type="button"
          onClick={loadMessages}
          className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 max-h-96 space-y-3 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
        {loading ? <p className="text-sm text-slate-400">Loading chat...</p> : null}
        {!loading && messages.length === 0 ? (
          <p className="text-sm text-slate-400">No messages yet. Start the order conversation here.</p>
        ) : null}
        {messages.map((message) => {
          const isMine = String(message.sender?._id || message.sender) === String(user?._id || user?.id);

          return (
            <div key={message._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl border p-3 ${
                  isMine
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-50"
                    : "border-slate-700 bg-slate-950 text-slate-100"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>{isMine ? "You" : message.sender?.name || "User"}</span>
                  <span>{formatDate(message.createdAt)}</span>
                </div>
                {message.text ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.text}</p> : null}
                {message.attachment?.dataUrl ? (
                  <a href={message.attachment.dataUrl} target="_blank" rel="noreferrer" className="mt-3 block">
                    <img
                      src={message.attachment.dataUrl}
                      alt={message.attachment.name || "Chat attachment"}
                      className="max-h-64 rounded-xl border border-slate-700 object-contain"
                    />
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {attachment ? (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3">
          <img src={attachment.dataUrl} alt={attachment.name} className="h-16 w-16 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{attachment.name}</p>
            <p className="text-xs text-slate-400">{Math.ceil(attachment.size / 1024)} KB</p>
          </div>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200"
          >
            Remove
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

      <form onSubmit={handleSend} className="mt-4 space-y-3">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write message"
          className="min-h-24 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-400"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500">
            Attach photo
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          <button
            type="submit"
            disabled={sending}
            className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default JobChat;

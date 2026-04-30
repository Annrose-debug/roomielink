import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { messageAPI } from "../services/api";
import Navbar from "../components/layout/Navbar";
import Card   from "../components/common/Card";
import Button from "../components/common/Button";
import toast  from "react-hot-toast";

const Messages = () => {
  const { userId: routeUserId } = useParams(); // optional: /messages/:userId
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [conversations, setConvs]    = useState([]);
  const [activeConvId,  setActiveId] = useState(null);
  const [activeUserId,  setActiveUid]= useState(routeUserId ? parseInt(routeUserId) : null);
  const [messages,      setMessages] = useState([]);
  const [draft,         setDraft]    = useState("");
  const [sending,       setSending]  = useState(false);
  const [loading,       setLoading]  = useState(true);

  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  useEffect(() => {
    loadConversations();
    // If URL has a userId, open that chat directly
    if (routeUserId) openChat(parseInt(routeUserId));
  }, []);

  // Poll for new messages every 5 seconds when a chat is open
  useEffect(() => {
    if (!activeUserId) return;
    pollRef.current = setInterval(() => loadMessages(activeUserId), 5000);
    return () => clearInterval(pollRef.current);
  }, [activeUserId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const { data } = await messageAPI.getConversations();
      setConvs(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const loadMessages = async (uid) => {
    try {
      const { data } = await messageAPI.getConversation(uid);
      setMessages(data.messages);
      setActiveId(data.conversationId);
      // Refresh unread counts in sidebar
      loadConversations();
    } catch (err) {
      toast.error("Could not load messages");
    }
  };

  const openChat = (uid) => {
    setActiveUid(uid);
    setMessages([]);
    loadMessages(uid);
    navigate(`/messages/${uid}`, { replace: true });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeUserId) return;

    setSending(true);
    try {
      const { data } = await messageAPI.send({ toUserId: activeUserId, body: draft.trim() });
      setMessages((p) => [...p, data]);
      setDraft("");
    } catch { toast.error("Failed to send message"); }
    finally { setSending(false); }
  };

  const activeConvInfo = conversations.find((c) => c.otherId === activeUserId);

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <Navbar />

      <div className="container-custom py-6 flex-1">
        <h1 className="text-2xl font-black text-violet-900 mb-4" style={{fontFamily:"Nunito,sans-serif"}}>
          Messages 💬
        </h1>

        <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-220px)]">

          {/* ── Conversation list ── */}
          <Card className="overflow-y-auto p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map((i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="text-5xl mb-3">💬</div>
                <p className="text-violet-500 font-semibold text-sm" style={{fontFamily:"Nunito,sans-serif"}}>No conversations yet</p>
                <p className="text-violet-400 text-xs mt-1">Match with a roomie to start chatting!</p>
                <Button variant="primary" size="sm" className="mt-4" onClick={() => navigate("/find-roommates")}>
                  Find Roommates
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-violet-50">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openChat(c.otherId)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-violet-50 transition-colors text-left ${c.otherId === activeUserId ? "bg-violet-50 border-l-4 border-coral-500" : ""}`}
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-coral-200 to-violet-300 shrink-0 relative">
                      {c.otherPic
                        ? <img src={`http://localhost:5000${c.otherPic}`} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-white font-black" style={{fontFamily:"Nunito,sans-serif"}}>{c.otherName?.[0]}</div>
                      }
                      {c.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-coral-500 text-white text-xs font-black rounded-full flex items-center justify-center">{c.unread}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${c.unread > 0 ? "text-violet-900" : "text-violet-700"}`} style={{fontFamily:"Nunito,sans-serif"}}>{c.otherName}</p>
                      <p className="text-xs text-violet-400 truncate">{c.lastMessage || "Start the conversation!"}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* ── Chat panel ── */}
          <div className="md:col-span-2 flex flex-col">
            {!activeUserId ? (
              <Card className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-4">👈</div>
                <h2 className="text-xl font-black text-violet-700 mb-2" style={{fontFamily:"Nunito,sans-serif"}}>Select a conversation</h2>
                <p className="text-violet-400 text-sm">Choose someone from the list to start chatting</p>
              </Card>
            ) : (
              <Card className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* Chat header */}
                <div className="flex items-center gap-3 p-4 border-b border-violet-50 bg-gradient-to-r from-violet-50 to-coral-50">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-coral-200 to-violet-300">
                    {activeConvInfo?.otherPic
                      ? <img src={`http://localhost:5000${activeConvInfo.otherPic}`} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-white font-black" style={{fontFamily:"Nunito,sans-serif"}}>{activeConvInfo?.otherName?.[0] ?? "?"}</div>
                    }
                  </div>
                  <div>
                    <p className="font-black text-violet-900" style={{fontFamily:"Nunito,sans-serif"}}>{activeConvInfo?.otherName ?? "Chat"}</p>
                    <p className="text-xs text-violet-400">RoomieLink member</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center py-8 text-violet-400 text-sm">
                      No messages yet — say hi! 👋
                    </div>
                  )}
                  {messages.map((m) => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm ${
                          isMe
                            ? "bg-gradient-to-br from-coral-500 to-coral-600 text-white rounded-br-none"
                            : "bg-violet-100 text-violet-800 rounded-bl-none"
                        }`}>
                          <p>{m.body}</p>
                          <p className={`text-xs mt-1 ${isMe ? "text-coral-200" : "text-violet-400"}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-3 border-t border-violet-50 flex gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-xl border-2 border-violet-200 px-4 py-2.5 text-sm text-violet-800 focus:outline-none focus:border-coral-400 transition-colors"
                    disabled={sending}
                  />
                  <Button type="submit" variant="primary" size="sm" loading={sending} disabled={!draft.trim()}>
                    Send 💬
                  </Button>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
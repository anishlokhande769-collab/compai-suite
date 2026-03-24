"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Upload, Settings, ChevronRight, MessageSquare, Bot, User, Cpu, Sparkles, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [useRag, setUseRag] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "agents" | "knowledge">("chat");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/knowledge/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        setFiles(prev => [...prev, file.name]);
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          model: selectedModel, 
          messages: newMessages,
          use_rag: useRag 
        }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const content = line.replace("data: ", "").trim();
            if (content === "[DONE]") break;
            try {
              const parsed = JSON.parse(content);
              assistantContent += parsed.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/40 backdrop-blur-2xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter leading-none">PROAI</h1>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-1.5 inline-block">v1.2 Studio</span>
          </div>
        </div>
        
        <nav className="px-4 py-2 space-y-1">
          {[
            { id: "chat", label: "Assistant", icon: <MessageSquare size={18}/> },
            { id: "agents", label: "Agent Lab", icon: <Cpu size={18}/> },
            { id: "knowledge", label: "Knowledge", icon: <BookOpen size={18}/> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${activeTab === tab.id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-4 space-y-8 mt-4">
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <button 
                onClick={() => setMessages([])}
                className="w-full text-left px-4 py-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all flex items-center justify-between group font-bold text-sm"
              >
                New Session <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2">Recent Workspaces</div>
                <div className="space-y-1">
                  {['Research Project X', 'Code Optimization', 'API Documentation'].map((item) => (
                    <button key={item} className="w-full text-left px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-all truncate">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Library</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{files.length}</span>
              </div>
              <div className="space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-default group">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="truncate flex-1">{f}</span>
                  </div>
                ))}
                {files.length === 0 && (
                  <div className="px-4 py-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                    <Upload className="mx-auto text-slate-700 mb-2" size={24} />
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Empty Vault</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl hover:bg-indigo-500/10 transition-all"
              >
                {isUploading ? "Syncing..." : "Upload New Assets"}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-slate-950">
        <header className="h-20 border-b border-slate-800/50 flex items-center px-10 justify-between bg-slate-950/60 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Engine</span>
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-sm font-bold focus:outline-none transition-all cursor-pointer hover:text-indigo-400"
              >
                <option value="gemini">Gemini-1.5-Pro</option>
                <option value="nemotron">NIM-Nemotron-4</option>
                <option value="kimi">Kimi-K2.5-Instruct</option>
              </select>
            </div>
            
            <div className="h-4 w-[1px] bg-slate-800" />

            <button 
              onClick={() => setUseRag(!useRag)}
              className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest ${useRag ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${useRag ? 'bg-white' : 'bg-slate-700'}`} />
              Contextual Intelligence
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-10 max-w-5xl mx-auto w-full scrollbar-hide">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-3xl mx-auto">
              <div className="w-24 h-24 rounded-3xl bg-indigo-600/10 flex items-center justify-center border border-indigo-600/20 shadow-2xl">
                <Cpu size={48} className="text-indigo-500" />
              </div>
              <div className="space-y-4">
                <h2 className="text-6xl font-black tracking-tight bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent italic">How can we advance?</h2>
                <p className="text-slate-500 font-medium text-lg">Integrated intelligence for research, development, and creation.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full mt-12">
                {[
                  { title: "Architectural Review", desc: "Evaluate system design patterns", icon: <Cpu/> },
                  { title: "Strategic Research", desc: "Synthesize data from local vault", icon: <BookOpen/> },
                ].map((p, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(p.title)}
                    className="p-8 text-left border border-slate-800/50 rounded-3xl bg-slate-900/20 hover:bg-slate-900 hover:border-indigo-500/50 transition-all group"
                  >
                    <div className="text-indigo-500/40 group-hover:text-indigo-500 transition-colors mb-4">{p.icon}</div>
                    <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-6 ${m.role === 'user' ? 'justify-end' : ''} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[85%] p-6 rounded-3xl ${m.role === 'user' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 border border-indigo-500/50' : 'bg-slate-900/50 border border-slate-800/50'}`}>
                <div className="flex items-center gap-2 mb-4 opacity-40 text-[9px] font-black uppercase tracking-[0.2em]">
                  {m.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                  {m.role === 'user' ? 'Operator' : `${selectedModel.toUpperCase()} Core`}
                </div>
                <div className="prose prose-invert prose-sm max-w-none leading-relaxed font-medium selection:bg-indigo-400/30">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-8 md:p-12 pt-0 max-w-5xl mx-auto w-full">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur-xl opacity-10 group-focus-within:opacity-30 transition duration-1000"></div>
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-3 flex items-end gap-3 shadow-2xl">
              <textarea 
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Initialize protocol..."
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-4 px-6 text-lg placeholder:text-slate-600 font-medium scrollbar-hide"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className={`p-4 rounded-2xl transition-all ${input.trim() && !isStreaming ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/40' : 'bg-slate-800 text-slate-500'}`}
              >
                {isStreaming ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={24} />}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

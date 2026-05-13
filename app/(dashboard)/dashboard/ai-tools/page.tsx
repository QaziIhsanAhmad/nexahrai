"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

type Tab = "chatbot" | "resume" | "interview" | "policy";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export default function AIToolsPage() {
  const [tab, setTab] = useState<Tab>("chatbot");

  // Chatbot state
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Hi! I'm NexaHR Assistant 🤖 I can help you with HR policies, leave procedures, payroll queries, and more. What can I help you with today?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`session_${Date.now()}`);

  // Resume parser state
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [parseResult, setParseResult] = useState<Record<string, unknown> | null>(null);
  const [parseLoading, setParseLoading] = useState(false);

  // Interview state
  const [jobTitle, setJobTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExpRequired] = useState("2+ years");
  const [level, setLevel] = useState<"JUNIOR" | "MID" | "SENIOR">("MID");
  const [questions, setQuestions] = useState<Array<{ category: string; question: string; purpose: string }>>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Policy generator state
  const [docType, setDocType] = useState<"OFFER_LETTER" | "WARNING_LETTER" | "EXPERIENCE_LETTER" | "POLICY">("OFFER_LETTER");
  const [docData, setDocData] = useState<Record<string, string>>({
    employeeName: "", position: "", department: "", salary: "",
    startDate: "", companyName: "", managerName: "",
    incidentDate: "", issue: "", joinDate: "", lastDate: "",
    policyName: "", effectiveDate: "",
  });
  const [generatedDoc, setGeneratedDoc] = useState("");
  const [docLoading, setDocLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendChatMessage() {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);
    setChatLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          sessionId: sessionId.current,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      toast.error("Failed to get response");
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  }

  async function handleParseResume() {
    if (!resumeText.trim()) { toast.error("Enter resume text"); return; }
    setParseLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "parse-resume", resumeText, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setParseResult(data);
      toast.success("Resume parsed successfully!");
    } catch {
      toast.error("Failed to parse resume");
    } finally {
      setParseLoading(false);
    }
  }

  async function handleGenerateQuestions() {
    if (!jobTitle) { toast.error("Enter job title"); return; }
    setQuestionsLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "interview-questions",
          jobTitle,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          experience,
          level,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions || []);
      toast.success(`${data.questions?.length ?? 0} questions generated!`);
    } catch {
      toast.error("Failed to generate questions");
    } finally {
      setQuestionsLoading(false);
    }
  }

  async function handleGenerateDoc() {
    setDocLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-document", docType, data: docData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGeneratedDoc(data.content);
      toast.success("Document generated!");
    } catch {
      toast.error("Failed to generate document");
    } finally {
      setDocLoading(false);
    }
  }

  const tabs = [
    { id: "chatbot" as Tab, label: "HR Chatbot", icon: "💬" },
    { id: "resume" as Tab, label: "Resume Parser", icon: "🤖" },
    { id: "interview" as Tab, label: "Interview AI", icon: "🎯" },
    { id: "policy" as Tab, label: "Policy Generator", icon: "📝" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Tools</h1>
        <p className="text-slate-500 text-sm mt-1">Powered by Anthropic Claude</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700"}`}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Chatbot */}
      {tab === "chatbot" && (
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col" style={{ height: "calc(100vh - 280px)" }}>
          <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">🤖</div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">NexaHR Assistant</p>
              <p className="text-xs text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />Online</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-slate-100 text-slate-900 rounded-bl-sm"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-slate-500 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t border-slate-200 flex gap-3">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
              placeholder="Ask about HR policies, leave, payroll..."
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors">
              Send
            </button>
          </div>
        </div>
      )}

      {/* Resume Parser */}
      {tab === "resume" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">AI Resume Parser</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Resume Text</label>
                  <textarea rows={8} value={resumeText} onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste the resume text here..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Description (optional — for matching score)</label>
                  <textarea rows={4} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description for AI matching score..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <button onClick={handleParseResume} disabled={parseLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                  {parseLoading ? "Parsing with AI..." : "Parse Resume with AI"}
                </button>
              </div>
            </div>
          </div>
          <div>
            {parseResult ? (
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h2 className="font-semibold text-slate-900">Parse Results</h2>
                {(parseResult.matchScore as number) && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Match Score</span>
                      <span className="text-2xl font-bold text-blue-600">{(parseResult.matchScore as number).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${parseResult.matchScore as number}%` }} />
                    </div>
                    {Boolean(parseResult.recommendation) && (
                      <p className="text-xs text-blue-700 mt-2 font-medium">Recommendation: {String(parseResult.recommendation).replace(/_/g, " ")}</p>
                    )}
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Personal Info</p>
                  <div className="space-y-1 text-sm text-slate-700">
                    {Object.entries((parseResult.personalInfo as Record<string, string>) || {}).map(([k, v]) => v && (
                      <div key={k} className="flex gap-2"><span className="text-slate-400 w-20 flex-shrink-0 capitalize">{k}:</span><span>{v}</span></div>
                    ))}
                  </div>
                </div>
                {Array.isArray(parseResult.skills) && (parseResult.skills as string[]).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(parseResult.skills as string[]).map((skill, i) => (
                        <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                {Array.isArray(parseResult.matchedSkills) && (parseResult.matchedSkills as string[]).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Matched Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(parseResult.matchedSkills as string[]).map((s, i) => <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{s}</span>)}
                    </div>
                  </div>
                )}
                {Array.isArray(parseResult.missingSkills) && (parseResult.missingSkills as string[]).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Missing Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(parseResult.missingSkills as string[]).map((s, i) => <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col items-center justify-center h-64 text-center">
                <span className="text-4xl mb-3">🤖</span>
                <p className="text-slate-500 text-sm">Parse results will appear here</p>
                <p className="text-slate-400 text-xs mt-1">Paste a resume and click Parse</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interview AI */}
      {tab === "interview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Generate Interview Questions</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title</label>
                <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior React Developer"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Required Skills (comma-separated)</label>
                <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, TypeScript, API design..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Experience Required</label>
                  <input type="text" value={experience} onChange={(e) => setExpRequired(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Seniority Level</label>
                  <select value={level} onChange={(e) => setLevel(e.target.value as "JUNIOR" | "MID" | "SENIOR")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="JUNIOR">Junior</option>
                    <option value="MID">Mid-Level</option>
                    <option value="SENIOR">Senior</option>
                  </select>
                </div>
              </div>
              <button onClick={handleGenerateQuestions} disabled={questionsLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                {questionsLoading ? "Generating..." : "Generate Questions with AI"}
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 overflow-y-auto max-h-[600px]">
            <h2 className="font-semibold text-slate-900 mb-4">Interview Questions {questions.length > 0 && `(${questions.length})`}</h2>
            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <span className="text-4xl mb-3">🎯</span>
                <p className="text-slate-400 text-sm">Questions will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${q.category === "Technical" ? "bg-blue-100 text-blue-700" : q.category === "Behavioral" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>
                        {q.category}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">{q.question}</p>
                    {q.purpose && <p className="text-xs text-slate-400 mt-1.5 italic">{q.purpose}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Policy Generator */}
      {tab === "policy" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">AI Document Generator</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Type</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value as typeof docType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="OFFER_LETTER">Offer Letter</option>
                  <option value="WARNING_LETTER">Warning Letter</option>
                  <option value="EXPERIENCE_LETTER">Experience Letter</option>
                  <option value="POLICY">Policy Document</option>
                </select>
              </div>

              {["employeeName", "companyName"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 capitalize">{field.replace(/([A-Z])/g, " $1").trim()}</label>
                  <input type="text" value={docData[field]} onChange={(e) => setDocData((d) => ({ ...d, [field]: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}

              {docType === "OFFER_LETTER" && ["position", "department", "salary", "startDate", "managerName"].map((f) => (
                <div key={f}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 capitalize">{f.replace(/([A-Z])/g, " $1").trim()}</label>
                  <input type={f.includes("Date") ? "date" : "text"} value={docData[f]} onChange={(e) => setDocData((d) => ({ ...d, [f]: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}

              {docType === "WARNING_LETTER" && ["issue", "incidentDate", "managerName"].map((f) => (
                <div key={f}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 capitalize">{f.replace(/([A-Z])/g, " $1").trim()}</label>
                  <input type={f.includes("Date") ? "date" : "text"} value={docData[f]} onChange={(e) => setDocData((d) => ({ ...d, [f]: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}

              {docType === "EXPERIENCE_LETTER" && ["position", "department", "joinDate", "lastDate"].map((f) => (
                <div key={f}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 capitalize">{f.replace(/([A-Z])/g, " $1").trim()}</label>
                  <input type={f.includes("Date") ? "date" : "text"} value={docData[f]} onChange={(e) => setDocData((d) => ({ ...d, [f]: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}

              {docType === "POLICY" && ["policyName", "effectiveDate"].map((f) => (
                <div key={f}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 capitalize">{f.replace(/([A-Z])/g, " $1").trim()}</label>
                  <input type={f.includes("Date") ? "date" : "text"} value={docData[f]} onChange={(e) => setDocData((d) => ({ ...d, [f]: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}

              <button onClick={handleGenerateDoc} disabled={docLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                {docLoading ? "Generating..." : "Generate Document with AI"}
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Generated Document</h2>
              {generatedDoc && (
                <button onClick={() => { navigator.clipboard.writeText(generatedDoc); toast.success("Copied!"); }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium">Copy</button>
              )}
            </div>
            {generatedDoc ? (
              <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed overflow-y-auto max-h-[500px] font-sans">
                {generatedDoc}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-center">
                <span className="text-4xl mb-3">📝</span>
                <p className="text-slate-400 text-sm">Generated document will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

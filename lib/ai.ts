import Groq from "groq-sdk";

let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

const MODEL = "llama3-8b-8192";

async function chat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
): Promise<string> {
  const completion = await getGroq().chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content ?? "";
}

export async function parseResume(resumeText: string, jobDescription?: string) {
  const text = await chat([
    {
      role: "system",
      content: "You are an expert HR recruiter. Return only valid JSON with no markdown or extra text.",
    },
    {
      role: "user",
      content: `Parse this resume and return a JSON object with this exact structure:
{
  "personalInfo": { "name": string, "email": string, "phone": string, "location": string, "linkedIn": null, "portfolio": null },
  "summary": string,
  "skills": string[],
  "experience": [{ "company": string, "title": string, "startDate": string, "endDate": string, "description": string, "achievements": string[] }],
  "education": [{ "institution": string, "degree": string, "field": string, "graduationYear": string }],
  "certifications": string[],
  "languages": string[],
  "totalYearsExperience": number${jobDescription ? `,
  "matchScore": number,
  "matchedSkills": string[],
  "missingSkills": string[],
  "strengths": string[],
  "weaknesses": string[],
  "recommendation": "STRONG_RECOMMEND" | "RECOMMEND" | "MAYBE" | "REJECT"` : ""}
}

${jobDescription ? `Job Description:\n${jobDescription}\n\n` : ""}Resume:\n${resumeText}`,
    },
  ]);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");
  return JSON.parse(jsonMatch[0]);
}

export async function generateInterviewQuestions(
  jobTitle: string,
  skills: string[],
  experience: string,
  level: "JUNIOR" | "MID" | "SENIOR" = "MID"
) {
  const text = await chat([
    {
      role: "system",
      content: "You are an expert interviewer. Return only a valid JSON array with no markdown.",
    },
    {
      role: "user",
      content: `Generate 10 interview questions for a ${level} ${jobTitle}.
Skills required: ${skills.join(", ")}
Experience required: ${experience}

Return a JSON array:
[{ "category": "Technical"|"Behavioral"|"Situational"|"Cultural", "question": string, "purpose": string, "expectedAnswer": string, "followUps": string[] }]`,
    },
  ]);

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");
  return JSON.parse(jsonMatch[0]);
}

export async function evaluateInterview(
  jobTitle: string,
  questions: Array<{ question: string; answer: string }>
) {
  const qa = questions.map((q) => `Q: ${q.question}\nA: ${q.answer}`).join("\n\n");

  const text = await chat([
    {
      role: "system",
      content: "You are an expert interviewer evaluator. Return only valid JSON with no markdown.",
    },
    {
      role: "user",
      content: `Evaluate this ${jobTitle} interview and return JSON:
{
  "overallScore": number,
  "technicalScore": number,
  "communicationScore": number,
  "problemSolvingScore": number,
  "answers": [{ "question": string, "score": number, "feedback": string }],
  "strengths": string[],
  "concerns": string[],
  "recommendation": "HIRE"|"CONSIDER"|"REJECT",
  "summary": string
}

${qa}`,
    },
  ]);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");
  return JSON.parse(jsonMatch[0]);
}

export async function generateHRDocument(
  type: "OFFER_LETTER" | "WARNING_LETTER" | "EXPERIENCE_LETTER" | "POLICY",
  data: Record<string, string>
) {
  const templates: Record<string, string> = {
    OFFER_LETTER: `Write a professional offer letter. Employee: ${data.employeeName}, Position: ${data.position}, Department: ${data.department}, Salary: ${data.salary}, Start Date: ${data.startDate}, Company: ${data.companyName}.`,
    WARNING_LETTER: `Write a formal warning letter. Employee: ${data.employeeName}, Issue: ${data.issue}, Date: ${data.incidentDate}, Company: ${data.companyName}, Manager: ${data.managerName}.`,
    EXPERIENCE_LETTER: `Write an experience letter. Employee: ${data.employeeName}, Position: ${data.position}, Join Date: ${data.joinDate}, Last Date: ${data.lastDate}, Company: ${data.companyName}.`,
    POLICY: `Write a comprehensive HR policy document. Policy: ${data.policyName}, Company: ${data.companyName}, Effective Date: ${data.effectiveDate}. Include: Purpose, Scope, Policy Statement, Procedures, Responsibilities, Violations.`,
  };

  const result = await chat([
    { role: "system", content: "You are an expert HR document writer. Write professional documents." },
    { role: "user", content: templates[type] },
  ]);
  return result;
}

export async function hrChatbot(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  companyPolicies?: string
) {
  const systemPrompt = `You are NexaHR Assistant, an AI HR chatbot. Help employees with HR questions about policies, leave, payroll, and procedures. Be professional, friendly, and concise. If unsure, direct them to HR.${companyPolicies ? `\n\nCompany Policies:\n${companyPolicies}` : ""}`;

  const result = await chat([
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ]);
  return result;
}

export async function analyzeHRData(data: Record<string, unknown>, query: string) {
  const result = await chat([
    { role: "system", content: "You are an HR data analyst. Provide concise, actionable insights." },
    {
      role: "user",
      content: `Analyze this HR data and answer: ${query}\n\nData: ${JSON.stringify(data, null, 2)}`,
    },
  ]);
  return result;
}

export async function atsCheck(resumeText: string, jobDescription?: string) {
  const text = await chat([
    {
      role: "system",
      content: "You are an expert ATS (Applicant Tracking System) analyst. Analyze resumes for ATS compatibility and return only valid JSON with no markdown.",
    },
    {
      role: "user",
      content: `Analyze this resume for ATS compatibility and return a JSON object with exactly this structure:
{
  "atsScore": number (0-100),
  "sections": {
    "contactInfo": { "present": boolean, "score": number, "maxScore": number, "issues": string[] },
    "summary": { "present": boolean, "score": number, "maxScore": number, "issues": string[] },
    "experience": { "present": boolean, "score": number, "maxScore": number, "issues": string[] },
    "education": { "present": boolean, "score": number, "maxScore": number, "issues": string[] },
    "skills": { "present": boolean, "score": number, "maxScore": number, "issues": string[] },
    "certifications": { "present": boolean, "score": number, "maxScore": number, "issues": string[] }
  },
  "keywords": {
    "found": string[],
    "missing": string[],
    "density": number
  },
  "formattingIssues": string[],
  "strengths": string[],
  "recommendations": string[],
  "readabilityScore": number (0-100)${jobDescription ? ',\n  "jobMatchScore": number (0-100),\n  "matchedJobKeywords": string[],\n  "missingJobKeywords": string[]' : ""}
}

Resume:
${resumeText}
${jobDescription ? `\nJob Description:\n${jobDescription}` : ""}`,
    },
  ]);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse ATS response");
  return JSON.parse(jsonMatch[0]);
}

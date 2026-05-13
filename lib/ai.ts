import { GoogleGenerativeAI } from "@google/generative-ai";

let _genai: GoogleGenerativeAI | null = null;
function getGenAI(): GoogleGenerativeAI {
  if (!_genai) {
    if (!process.env.GOOGLE_AI_API_KEY) throw new Error("GOOGLE_AI_API_KEY is not set");
    _genai = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  }
  return _genai;
}

const MODEL = "gemini-1.5-flash";

async function generate(prompt: string, systemInstruction?: string): Promise<string> {
  const model = getGenAI().getGenerativeModel({ model: MODEL, systemInstruction });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function parseResume(resumeText: string, jobDescription?: string) {
  const prompt = `You are an expert HR recruiter and resume parser. Parse the following resume and extract structured information.

${jobDescription ? `Job Description:\n${jobDescription}\n\n` : ""}Resume Text:
${resumeText}

Return a JSON object with this exact structure (no markdown, just JSON):
{
  "personalInfo": {
    "name": string,
    "email": string,
    "phone": string,
    "location": string,
    "linkedIn": null,
    "portfolio": null
  },
  "summary": string,
  "skills": string[],
  "experience": [
    {
      "company": string,
      "title": string,
      "startDate": string,
      "endDate": string,
      "description": string,
      "achievements": string[]
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string,
      "field": string,
      "graduationYear": string
    }
  ],
  "certifications": string[],
  "languages": string[],
  "totalYearsExperience": number${jobDescription ? `,
  "matchScore": number,
  "matchedSkills": string[],
  "missingSkills": string[],
  "strengths": string[],
  "weaknesses": string[],
  "recommendation": "STRONG_RECOMMEND" | "RECOMMEND" | "MAYBE" | "REJECT"` : ""}
}`;

  const text = await generate(prompt);
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
  const prompt = `Generate 10 targeted interview questions for a ${level} ${jobTitle} position.
Required skills: ${skills.join(", ")}
Required experience: ${experience}

Return a JSON array only (no markdown):
[{
  "category": "Technical" | "Behavioral" | "Situational" | "Cultural",
  "question": string,
  "purpose": string,
  "expectedAnswer": string,
  "followUps": string[]
}]`;

  const text = await generate(prompt);
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");
  return JSON.parse(jsonMatch[0]);
}

export async function evaluateInterview(
  jobTitle: string,
  questions: Array<{ question: string; answer: string }>
) {
  const qa = questions.map((q) => `Q: ${q.question}\nA: ${q.answer}`).join("\n\n");

  const prompt = `Evaluate this interview for a ${jobTitle} position. Score each answer and provide overall assessment.

${qa}

Return JSON only (no markdown):
{
  "overallScore": number (0-100),
  "technicalScore": number (0-100),
  "communicationScore": number (0-100),
  "problemSolvingScore": number (0-100),
  "answers": [{ "question": string, "score": number, "feedback": string }],
  "strengths": string[],
  "concerns": string[],
  "recommendation": "HIRE" | "CONSIDER" | "REJECT",
  "summary": string
}`;

  const text = await generate(prompt);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");
  return JSON.parse(jsonMatch[0]);
}

export async function generateHRDocument(
  type: "OFFER_LETTER" | "WARNING_LETTER" | "EXPERIENCE_LETTER" | "POLICY",
  data: Record<string, string>
) {
  const templates: Record<string, string> = {
    OFFER_LETTER: `Generate a professional offer letter for:
Employee: ${data.employeeName}, Position: ${data.position}, Department: ${data.department}
Salary: ${data.salary}, Start Date: ${data.startDate}, Company: ${data.companyName}
Include: greeting, offer details, salary, benefits summary, terms, acceptance request.`,

    WARNING_LETTER: `Generate a formal warning letter for:
Employee: ${data.employeeName}, Issue: ${data.issue}, Date of Incident: ${data.incidentDate}
Company: ${data.companyName}, Manager: ${data.managerName}
Include: formal tone, description of issue, consequences, expected improvement, signature block.`,

    EXPERIENCE_LETTER: `Generate an experience letter for:
Employee: ${data.employeeName}, Position: ${data.position}, Department: ${data.department}
Join Date: ${data.joinDate}, Last Date: ${data.lastDate}, Company: ${data.companyName}
Include: confirmation of employment, role description, conduct statement, best wishes.`,

    POLICY: `Generate an HR policy document for:
Policy: ${data.policyName}, Company: ${data.companyName}, Effective Date: ${data.effectiveDate}
Create a comprehensive policy with sections: Purpose, Scope, Policy Statement, Procedures, Responsibilities, Violations.`,
  };

  return generate(templates[type]);
}

export async function hrChatbot(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  companyPolicies?: string
) {
  const systemInstruction = `You are NexaHR Assistant, an AI-powered HR chatbot for a company's HR management system.
You help employees with HR-related questions about policies, procedures, benefits, leave, payroll, and more.
Be professional, friendly, and concise. If you don't know something specific, guide users to contact HR directly.
${companyPolicies ? `\nCompany Policies:\n${companyPolicies}` : ""}`;

  const model = getGenAI().getGenerativeModel({ model: MODEL, systemInstruction });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}

export async function analyzeHRData(data: Record<string, unknown>, query: string) {
  const prompt = `Analyze this HR data and answer the question concisely.

Data: ${JSON.stringify(data, null, 2)}

Question: ${query}

Provide a concise, actionable insight.`;

  return generate(prompt);
}

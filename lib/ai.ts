import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-sonnet-4-6";

export async function parseResume(resumeText: string, jobDescription?: string) {
  const prompt = `You are an expert HR recruiter and resume parser. Parse the following resume and extract structured information.

${jobDescription ? `Job Description:\n${jobDescription}\n\n` : ""}Resume Text:
${resumeText}

Return a JSON object with this exact structure:
{
  "personalInfo": {
    "name": string,
    "email": string,
    "phone": string,
    "location": string,
    "linkedIn": string | null,
    "portfolio": string | null
  },
  "summary": string,
  "skills": string[],
  "experience": [
    {
      "company": string,
      "title": string,
      "startDate": string,
      "endDate": string | "Present",
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

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
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
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `Generate 10 targeted interview questions for a ${level} ${jobTitle} position.
Required skills: ${skills.join(", ")}
Required experience: ${experience}

Return a JSON array with this structure:
[{
  "category": "Technical" | "Behavioral" | "Situational" | "Cultural",
  "question": string,
  "purpose": string,
  "expectedAnswer": string,
  "followUps": string[]
}]`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");
  return JSON.parse(jsonMatch[0]);
}

export async function evaluateInterview(
  jobTitle: string,
  questions: Array<{ question: string; answer: string }>
) {
  const qa = questions.map((q) => `Q: ${q.question}\nA: ${q.answer}`).join("\n\n");

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `Evaluate this interview for a ${jobTitle} position. Score each answer and provide overall assessment.

${qa}

Return JSON:
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
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
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
Employee: ${data.employeeName}
Position: ${data.position}
Department: ${data.department}
Salary: ${data.salary}
Start Date: ${data.startDate}
Company: ${data.companyName}
Include: greeting, offer details, salary, benefits summary, terms, acceptance request.`,

    WARNING_LETTER: `Generate a formal warning letter for:
Employee: ${data.employeeName}
Issue: ${data.issue}
Date of Incident: ${data.incidentDate}
Company: ${data.companyName}
Manager: ${data.managerName}
Include: formal tone, description of issue, consequences, expected improvement, signature block.`,

    EXPERIENCE_LETTER: `Generate an experience letter for:
Employee: ${data.employeeName}
Position: ${data.position}
Department: ${data.department}
Join Date: ${data.joinDate}
Last Date: ${data.lastDate}
Company: ${data.companyName}
Include: confirmation of employment, role description, conduct statement, best wishes.`,

    POLICY: `Generate an HR policy document for:
Policy: ${data.policyName}
Company: ${data.companyName}
Effective Date: ${data.effectiveDate}
Create a comprehensive, professional policy document with sections: Purpose, Scope, Policy Statement, Procedures, Responsibilities, Violations, and effective date.`,
  };

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: templates[type],
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function hrChatbot(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  companyPolicies?: string
) {
  const systemPrompt = `You are NexaHR Assistant, an AI-powered HR chatbot for a company's HR management system.
You help employees with HR-related questions about policies, procedures, benefits, leave, payroll, and more.
Be professional, friendly, and concise. If you don't know something specific, guide users to contact HR directly.
${companyPolicies ? `\nCompany Policies:\n${companyPolicies}` : ""}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: systemPrompt,
    messages,
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function analyzeHRData(data: Record<string, unknown>, query: string) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `Analyze this HR data and answer the question.

Data: ${JSON.stringify(data, null, 2)}

Question: ${query}

Provide a concise, actionable insight.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  parseResume,
  generateInterviewQuestions,
  evaluateInterview,
  generateHRDocument,
  hrChatbot,
  analyzeHRData,
  atsCheck,
} from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "parse-resume": {
        const { resumeText, jobDescription, applicationId } = body;
        if (!resumeText) return NextResponse.json({ error: "Resume text required" }, { status: 400 });

        let jobDesc = jobDescription;
        if (!jobDesc && applicationId) {
          const app = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { jobPosting: true },
          });
          if (app) {
            jobDesc = `${app.jobPosting.title}\n${app.jobPosting.description}\nRequired Skills: ${app.jobPosting.skills.join(", ")}`;
          }
        }

        const result = await parseResume(resumeText, jobDesc);

        if (applicationId && result.matchScore) {
          await prisma.application.update({
            where: { id: applicationId },
            data: {
              aiScore: result.matchScore,
              aiSummary: result.summary,
              status: "AI_SCREENED",
            },
          });

          await prisma.aIScreening.upsert({
            where: { applicationId },
            create: {
              applicationId,
              overallScore: result.matchScore,
              skillsScore: result.matchScore * 0.4,
              experienceScore: result.matchScore * 0.4,
              educationScore: result.matchScore * 0.2,
              matchedSkills: result.matchedSkills || [],
              missingSkills: result.missingSkills || [],
              strengths: result.strengths || [],
              weaknesses: result.weaknesses || [],
              recommendation: result.recommendation || "MAYBE",
            },
            update: {
              overallScore: result.matchScore,
              recommendation: result.recommendation || "MAYBE",
            },
          });
        }

        return NextResponse.json(result);
      }

      case "interview-questions": {
        const { jobTitle, skills, experience, level } = body;
        const questions = await generateInterviewQuestions(jobTitle, skills, experience, level);
        return NextResponse.json({ questions });
      }

      case "evaluate-interview": {
        const { jobTitle, questions } = body;
        const evaluation = await evaluateInterview(jobTitle, questions);
        return NextResponse.json(evaluation);
      }

      case "generate-document": {
        if (!["SUPER_ADMIN", "ADMIN", "HR_MANAGER"].includes(session.role)) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const { docType, data } = body;
        const content = await generateHRDocument(docType, data);
        return NextResponse.json({ content });
      }

      case "chat": {
        const { messages, sessionId } = body;

        let policies = "";
        if (session.companyId) {
          const companyPolicies = await prisma.companyPolicy.findMany({
            where: { companyId: session.companyId, isActive: true },
            select: { title: true, content: true },
            take: 5,
          });
          policies = companyPolicies
            .map((p) => `${p.title}:\n${p.content}`)
            .join("\n\n");
        }

        const response = await hrChatbot(messages, policies);

        await prisma.chatMessage.createMany({
          data: [
            ...messages.slice(-1).map((m: { role: string; content: string }) => ({
              companyId: session.companyId!,
              userId: session.userId,
              sessionId,
              role: m.role,
              content: m.content,
            })),
            {
              companyId: session.companyId!,
              userId: session.userId,
              sessionId,
              role: "assistant",
              content: response,
            },
          ],
        });

        return NextResponse.json({ response });
      }

      case "analyze": {
        const { data, query } = body;
        const insight = await analyzeHRData(data, query);
        return NextResponse.json({ insight });
      }

      case "ats-check": {
        const { resumeText, jobDescription } = body;
        if (!resumeText) return NextResponse.json({ error: "Resume text required" }, { status: 400 });
        const result = await atsCheck(resumeText, jobDescription);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("AI error:", error);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}

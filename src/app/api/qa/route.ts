import { NextRequest, NextResponse } from 'next/server';
import { defaultRAGService } from '@/lib/rag/rag';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const projectId = (body.projectId as string) || 'dd-101';
    const question = (body.question as string) || '';

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question parameter is required.' },
        { status: 400 }
      );
    }

    // Call RAG Service (handles Gemini RAG & Config Check)
    const ragResponse = await defaultRAGService.askQuestion(projectId, question);

    return NextResponse.json({
      success: true,
      ...ragResponse
    });
  } catch (error: unknown) {
    console.error('Error during AI Q&A RAG execution:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the Q&A request.', success: false },
      { status: 500 }
    );
  }
}

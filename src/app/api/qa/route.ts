import { NextRequest, NextResponse } from 'next/server';
import { defaultRAGService } from '@/lib/rag/rag';
import {
  appendProjectChatMessages,
  clearProjectChatHistory,
  getProjectChatHistory,
} from '@/lib/storage/app-storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || 'dd-101';
    const messages = getProjectChatHistory(projectId);
    return NextResponse.json({ success: true, projectId, messages });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load chat history';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const projectId = (body.projectId as string) || 'dd-101';
    const question = (body.question as string) || '';

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question parameter is required.', success: false },
        { status: 400 }
      );
    }

    const ragResponse = await defaultRAGService.askQuestion(projectId, question);
    const nowLabel = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    appendProjectChatMessages(projectId, [
      {
        sender: 'user',
        text: question.trim(),
        time: nowLabel,
      },
      {
        sender: 'copilot',
        text: ragResponse.answer,
        time: nowLabel,
        isDemoFallback: ragResponse.isDemoFallback,
        evidence: ragResponse.sources,
        metrics: {
          latencyMs: ragResponse.evalMetrics?.latencyMs,
          retrievedCount: ragResponse.sources.length,
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      ...ragResponse,
    });
  } catch (error: unknown) {
    console.error('Error during AI Q&A RAG execution:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the Q&A request.', success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || 'dd-101';
    clearProjectChatHistory(projectId);
    return NextResponse.json({ success: true, projectId });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to clear chat history';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

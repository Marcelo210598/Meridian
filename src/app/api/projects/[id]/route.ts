import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      trades: { orderBy: { created_at: "desc" }, take: 100 },
      snapshots: { orderBy: { created_at: "desc" }, take: 1 },
      events: { orderBy: { created_at: "desc" }, take: 50 },
      _count: { select: { trades: true, events: true } },
    },
  });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(project);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, color, active } = body;

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(color && { color }),
      ...(active !== undefined && { active }),
    },
  });
  return NextResponse.json(project);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

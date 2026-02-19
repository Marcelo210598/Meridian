import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { created_at: "desc" },
    include: {
      _count: { select: { trades: true, events: true } },
      snapshots: { orderBy: { created_at: "desc" }, take: 1 },
    },
  });
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, type = "TRADING", color = "#6366f1" } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "name é obrigatório" }, { status: 400 });
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const api_key = crypto.randomUUID();

  try {
    const project = await prisma.project.create({
      data: { name: name.trim(), slug, type, color, api_key },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Já existe um projeto com esse nome" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao criar projeto" },
      { status: 500 }
    );
  }
}

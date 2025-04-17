import { addTodo, getAllTodos } from "@/app/lib/data";
import { NextRequest, NextResponse } from "next/server";

// GET handler for /api/todos
export async function GET() {
  const todos = getAllTodos();
  return NextResponse.json(todos);
}

// POST handler for /api/todos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.text || typeof body.text !== "string" || body.text.trim === "") {
      return NextResponse.json(
        {
          error: true,
          message: "Task text is required",
        },
        { status: 400 }
      );
    }
    const newTodo = addTodo(body.text.trim());
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error("Failed to parse request body or add todo: ", error);
    return NextResponse.json(
      {
        error: true,
        message: "Invalid request body",
      },
      { status: 400 }
    );
  }
}

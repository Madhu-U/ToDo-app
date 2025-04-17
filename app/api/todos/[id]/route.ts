import { deletedTodo, toggleTodo } from "@/app/lib/data";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { id: string };
}

// PATCH handler for /api/todos/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      {
        error: true,
        message: "Invalid ID format",
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    let updatedTodo;
    if (typeof body.completed === "boolean") {
      updatedTodo = toggleTodo(id);
    }

    if (!updatedTodo) {
      return NextResponse.json(
        {
          error: true,
          message: "Todo not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: false, updatedTodo });
  } catch (error) {
    console.error("Failed to parse request body or udpate todo: ", error);
    return NextResponse.json(
      {
        error: true,
        message: "Invalid Request body",
      },
      { status: 400 }
    );
  }
}

// DELETE handler for /api/todos/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      {
        error: true,
        message: "Invalid ID format",
      },
      { status: 400 }
    );
  }

  const deleted = deletedTodo(id);
  if (!deleted) {
    return NextResponse.json(
      {
        error: true,
        message: "Todo not found",
      },
      { status: 404 }
    );
  }
  return NextResponse.json({
    error: false,
    message: `Todo with ID ${id} deleted`,
  });
}

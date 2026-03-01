import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deleteRoleTemplate } from "@/lib/storage";

interface RouteContext {
  params: Promise<{ roleId: string }>;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { roleId } = await context.params;
  await deleteRoleTemplate(roleId);

  return NextResponse.json({ ok: true });
}

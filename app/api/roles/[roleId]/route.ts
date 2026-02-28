import { NextResponse } from "next/server";
import { buildRoleApplyIntro } from "@/lib/prompt";
import { getRoleTemplate } from "@/lib/storage";

interface RouteContext {
  params: Promise<{ roleId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  const { roleId } = await context.params;
  const role = await getRoleTemplate(roleId);

  if (!role) {
    return NextResponse.json({ error: "Role template not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: role.id,
    roleTitle: role.roleTitle,
    targetSeniority: role.targetSeniority,
    durationMinutes: role.durationMinutes,
    focusAreas: role.focusAreas,
    companyName: role.companyName,
    intro: buildRoleApplyIntro(role),
  });
}

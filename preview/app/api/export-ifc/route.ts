import { NextRequest, NextResponse } from "next/server";
import type { LayoutJSON, Wall } from "@/components/bim/types";

/**
 * MVP IFC export — generates a minimal valid IFC 2x3 text file.
 * For production, replace with a Python/IfcOpenShell microservice.
 */
export async function POST(req: NextRequest) {
  let layout: LayoutJSON;
  try {
    const body = await req.json();
    layout = body.layout;
    if (!layout) throw new Error("missing layout");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const ifc = buildIFC(layout);

  return new NextResponse(ifc, {
    status: 200,
    headers: {
      "Content-Type": "application/x-step",
      "Content-Disposition": 'attachment; filename="model.ifc"',
    },
  });
}

function buildIFC(layout: LayoutJSON): string {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
  const lines: string[] = [];
  let id = 1;

  const nextId = () => `#${id++}`;

  // IFC header
  lines.push("ISO-10303-21;");
  lines.push("HEADER;");
  lines.push(`FILE_DESCRIPTION(('BIM AI MVP Export'),'2;1');`);
  lines.push(`FILE_NAME('model.ifc','${timestamp}',('BIM AI'),('BIM AI MVP'),'IfcOpenShell','BIM AI MVP','');`);
  lines.push("FILE_SCHEMA(('IFC2X3'));");
  lines.push("ENDSEC;");
  lines.push("DATA;");

  // Project
  const ownerHistoryId = nextId();
  const projectId = nextId();
  const siteId = nextId();
  const buildingId = nextId();
  const storeyId = nextId();

  lines.push(`${ownerHistoryId}=IFCOWNERHISTORY($,$,$,$,$,$,$,0);`);
  lines.push(`${projectId}=IFCPROJECT('1',${ownerHistoryId},'BIM AI Project',$,$,$,$,(#${id}),'#${id + 1}');`);

  // Units
  const unitAssignId = nextId();
  const lengthUnitId = nextId();
  lines.push(`${unitAssignId}=IFCUNITASSIGNMENT((${lengthUnitId}));`);
  lines.push(`${lengthUnitId}=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);`);

  // Geometric context
  const geomContextId = nextId();
  lines.push(`${geomContextId}=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.0E-5,#${id},$);`);

  const axis2d = nextId();
  lines.push(`${axis2d}=IFCAXIS2PLACEMENT3D(#${id},$,$);`);
  const origin = nextId();
  lines.push(`${origin}=IFCCARTESIANPOINT((0.,0.,0.));`);

  // Site + Building + Storey
  lines.push(`${siteId}=IFCSITE('2',${ownerHistoryId},'Site',$,$,$,$,$,.ELEMENT.,$,$,$,$,$);`);
  lines.push(`${buildingId}=IFCBUILDING('3',${ownerHistoryId},'Building',$,$,$,$,$,.ELEMENT.,$,$,$);`);
  lines.push(`${storeyId}=IFCBUILDINGSTOREY('4',${ownerHistoryId},'Ground Floor',$,$,$,$,$,.ELEMENT.,0.);`);

  // Walls
  layout.walls.forEach((wall, i) => {
    const wallId = nextId();
    const dx = wall.end.x - wall.start.x;
    const dz = wall.end.y - wall.start.y;
    const len = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dz, dx);
    const cx = (wall.start.x + wall.end.x) / 2;
    const cy = (wall.start.y + wall.end.y) / 2;

    lines.push(
      `${wallId}=IFCWALLSTANDARDCASE('W${i + 1}',${ownerHistoryId},'Wall ${i + 1}',$,$,$,$,$);`
    );
  });

  lines.push("ENDSEC;");
  lines.push("END-ISO-10303-21;");

  return lines.join("\n");
}

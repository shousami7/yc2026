export interface Point2D {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  start: Point2D;
  end: Point2D;
  thickness: number; // meters
  height: number;    // meters, default 2.8
}

export interface Door {
  id: string;
  position: Point2D;
  width: number;  // meters
  rotation: number; // radians
  wall_id?: string;
}

export interface Window {
  id: string;
  position: Point2D;
  width: number;   // meters
  height: number;  // meters
  sill_height: number; // meters from floor
  wall_id?: string;
}

export interface Room {
  id: string;
  name: string;
  polygon: Point2D[]; // outline vertices
}

export interface LayoutJSON {
  scale: number;       // pixels per meter (if known), else 1
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  rooms: Room[];
}

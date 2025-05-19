import * as blessed from "blessed";

// Component instance type
export interface ComponentInstance {
  id: string;
  type: string;
  element: blessed.Widgets.BlessedElement;
  props: Record<string, any>;
  children: ComponentInstance[];
}

// Render result type
export interface RenderResult {
  element: blessed.Widgets.BlessedElement;
  update: (newProps: Record<string, any>) => void;
  unmount: () => void;
}

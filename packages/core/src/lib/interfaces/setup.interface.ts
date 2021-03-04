import { KeyBindigsOptions } from './options.interface';

export interface EngineSetup {
  maxZoomIn?: number;
  maxZoomOut?: number;
  portMagneticRadius?: number;
  allowLooseLinks?: boolean;
  allowCanvasZoom?: boolean;
  allowCanvasTranslation?: boolean;
  inverseZoom?: boolean;
  keyBindings?: KeyBindigsOptions;
}

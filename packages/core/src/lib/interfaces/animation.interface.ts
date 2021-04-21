export interface AnimationConfig {
  /**
   * Timing in ms
   */
  timing: number;

  /**
   * Easing function
   */
  easing: 'ease' | 'ease-in' | 'ease-in-out' | 'ease-out' | string;
}

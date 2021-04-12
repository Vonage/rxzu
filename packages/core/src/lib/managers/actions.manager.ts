import { BaseAction, BaseActionState } from '../actions';
import { createValueState, ValueState } from '../state';

export interface DispatchedAction {
  action: BaseAction;
  state: BaseActionState;
}

export class ActionsManager {
  protected actionsBus$: ValueState<DispatchedAction | null>;

  constructor() {
    this.actionsBus$ = createValueState<DispatchedAction | null>(null);
  }

  /**
   * fire the action registered and notify subscribers
   */
  fireAction() {
    const action = this.actionsBus$.value?.action;
    if (action) {
      this.actionsBus$.set({ action, state: 'firing' });
      return action;
    }

    return;
  }

  /**
   * Unregister the action, post firing and notify subscribers
   */
  stopFiringAction() {
    const stoppedAction = this.actionsBus$.value?.action;
    if (stoppedAction) {
      this.actionsBus$.set({ action: stoppedAction, state: 'stopped' });
      return stoppedAction;
    }

    return;
  }

  /**
   * Register the new action, pre firing and notify subscribers
   */
  startFiringAction(action: BaseAction) {
    this.actionsBus$.set({ action, state: 'started' });
    return action;
  }

  observeActions() {
    return this.actionsBus$.select();
  }

  getCurrentAction() {
    return this.actionsBus$.value;
  }
}

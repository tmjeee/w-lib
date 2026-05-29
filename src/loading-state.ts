import { computed, signal, Signal } from '@angular/core';

/**
 * A lightweight utility for managing per-action loading states using signals.
 *
 * Philosophy:
 * - Most errors should propagate to GlobalErrorHandler.
 * - This utility helps manage UI loading states cleanly without forcing try/catch everywhere.
 * - Use it when you need to disable buttons / show spinners during async actions.
 *
 * Recommended usage:
 *
 * const loading = createLoadingState<'creatingBoard' | 'deletingBoard'>();
 *
 * async createBoard() {
 *   const title = await openDialog();
 *   if (!title) return;
 *
 *   await loading.withLoading('creatingBoard', async () => {
 *     const board = await this.boardService.createBoard(...);
 *     this.router.navigate(...);
 *   });
 * }
 *
 * In template:
 * <button [disabled]="loading.is('creatingBoard')()">
 *   {{ loading.is('creatingBoard')() ? 'Creating...' : 'Create Board' }}
 * </button>
 */
export function createLoadingState<T extends string = string>() {
  const loadingMap = signal<Partial<Record<T, boolean>>>({});
  const signalCache = new Map<T, Signal<boolean>>();

  /**
   * Returns a reactive signal indicating if a specific action is loading.
   * The returned signal is stable (same reference) for the same key.
   */
  const is = (key: T): Signal<boolean> => {
    if (!signalCache.has(key)) {
      signalCache.set(
        key,
        computed(() => loadingMap()[key] ?? false)
      );
    }
    return signalCache.get(key)!;
  };

  /**
   * Manually set the loading state for a key.
   */
  const set = (key: T, value: boolean): void => {
    loadingMap.update((map) => ({ ...map, [key]: value }));
  };

  /**
   * Runs an async function while automatically managing the loading state.
   * Errors are allowed to propagate (as per project convention).
   */
  const withLoading = async <R>(key: T, fn: () => Promise<R>): Promise<R> => {
    set(key, true);
    try {
      return await fn();
    } finally {
      set(key, false);
    }
  };

  /**
   * Raw access to the loading map (rarely needed).
   */
  const states = loadingMap.asReadonly();

  return {
    is,
    set,
    withLoading,
    states,
  };
}

/**
 * Type helper for action loading keys.
 * Example: type UserAction = 'addingToWorkspace' | 'removingFromWorkspace';
 */
export type LoadingKey = string;

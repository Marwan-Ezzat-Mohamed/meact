import {
  setNextUnitOfWork,
  wipRoot,
  currentRoot,
  setWipRoot,
  setDeletions,
} from "./reconciler";

let wipFiber = null;
let hookIndex = 0;

function setWipFiber(fiber) {
  wipFiber = fiber;
}

function resetHooks() {
  wipFiber.hooks = [];
  //   setHookIndex(0);
}
function setHookIndex(index) {
  hookIndex = index;
}

function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : [],
  };

  const actions = hook.queue;
  actions.forEach((action) => {
    hook.state = action(hook.state);
    // remove action from queue

    // if queue is empty, reset hook
    if (hook.queue.length === 0) {
      resetHooks();
    }
  });

  actions.length = 0;

  const setState = (action) => {
    hook.queue.push(action);
    scheduleUpdate();
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

function useEffect(callback, dependencies) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    callback: callback,
    dependencies: dependencies ? dependencies : [],
    called: oldHook ? oldHook.called : false,
  };

  const hasChanged = dependencies
    ? dependencies.some((dep, i) => !Object.is(dep, oldHook?.dependencies?.[i]))
    : true;
  const isEmpty = !dependencies || dependencies.length === 0;

  if (isEmpty && !hook.called) {
    hook.callback();
    hook.called = true;
  } else if (hasChanged) {
    hook.callback();
  }
  wipFiber.hooks.push(hook);
  hookIndex++;
}

function scheduleUpdate() {
  setWipRoot(currentRoot);
  setNextUnitOfWork(wipRoot);

  setDeletions([]);
}

export {
  useState,
  useEffect,
  scheduleUpdate,
  setWipFiber,
  wipFiber,
  setHookIndex,
  resetHooks,
};

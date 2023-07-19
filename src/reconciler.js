import { createDom, updateDom } from "./dom";
import { setWipFiber, resetHooks, setHookIndex } from "./hooks";

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = [];

function setNextUnitOfWork(fiber) {
  nextUnitOfWork = fiber;
}

function setWipRoot(root) {
  if (!root) return;
  wipRoot = {
    dom: root.dom,
    props: root.props,
    alternate: root,
  };
}

function setDeletions(deletionsArray) {
  deletions = deletionsArray;
}

function commitRoot() {
  //   pendingEffects.forEach((it) => it());
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
    return;
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

function render(element, container) {
  setWipRoot({
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  });

  setDeletions([]);
  setNextUnitOfWork(wipRoot);
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    setNextUnitOfWork(performUnitOfWork(nextUnitOfWork));
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
    // loop on all fiber hooks and add them to pendingEffects
    // console.log(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }

  return null;
}

function updateFunctionComponent(fiber) {
  setWipFiber(fiber);
  setHookIndex(0);
  resetHooks();
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children.flat());
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children.flat());
}

function createFiber(element, parentFiber) {
  return {
    type: element.type,
    props: element.props,
    dom: null,
    parent: parentFiber,
    alternate: null,
    effectTag: "PLACEMENT",
    sibling: null,
  };
}

function updateFiber(oldFiber, element, parentFiber) {
  return {
    type: oldFiber.type,
    props: element.props,
    dom: oldFiber.dom,
    parent: parentFiber,
    alternate: oldFiber,
    effectTag: "UPDATE",
    sibling: null,
  };
}

function deleteFiber(fiber) {
  fiber.effectTag = "DELETION";
  deletions.push(fiber);
}

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate?.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType) {
      newFiber = updateFiber(oldFiber, element, wipFiber);
    }
    if (element && !sameType) {
      newFiber = createFiber(element, wipFiber);
    }
    if (oldFiber && !sameType) {
      deleteFiber(oldFiber);
    }

    oldFiber = oldFiber?.sibling;

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

export {
  render,
  setWipRoot,
  setDeletions,
  setNextUnitOfWork,
  nextUnitOfWork,
  currentRoot,
  deletions,
  wipRoot,
};

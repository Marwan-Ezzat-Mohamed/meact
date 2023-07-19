import { render } from "./src/reconciler";
import { useState, useEffect } from "./src/hooks";
import { createElement } from "./src/element";

const Meact = {
  render,
  useState,
  useEffect,
  createElement,
};

export { render, useState, useEffect, createElement };

export default Meact;

"use strict";

const depots = [
  { name: "A · oranžové depo", color: "#c87943", border: "#a15a30", letter: "A" },
  { name: "B · modré depo", color: "#50839c", border: "#36657c", letter: "B" },
  { name: "C · zelené depo", color: "#789455", border: "#526d38", letter: "C" }
];
const schedule = [0, 1, 2, 1, 0, 2, 0, 1];
const routeButtons = [...document.querySelectorAll("[data-route]")];
const paths = depots.map((_, index) => document.getElementById(`route-${index}`));
const wagon = document.getElementById("wagon");
const wagonBody = document.getElementById("wagon-body");
const wagonLetter = document.getElementById("wagon-letter");
const dispatch = document.getElementById("dispatch");
const status = document.getElementById("game-status");
const yardState = document.getElementById("yard-state");
const scoreLabel = document.getElementById("score");
const deliveredLabel = document.getElementById("delivered");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let selectedRoute = 0;
let currentWagon = 0;
let delivered = 0;
let score = 0;
let phase = "ready";
let animation = null;

function setDispatchLabel(label) {
  dispatch.textContent = label;
  const arrow = document.createElement("span");
  arrow.textContent = "→";
  arrow.setAttribute("aria-hidden", "true");
  dispatch.append(arrow);
}

function selectRoute(index) {
  selectedRoute = index;
  routeButtons.forEach((button, route) => {
    button.setAttribute("aria-pressed", String(route === index));
    paths[route].classList.toggle("selected", route === index);
  });
  document.getElementById("switch-arrow").setAttribute("transform", `rotate(${index === 0 ? 0 : index === 1 ? 45 : 90} 350 195)`);
}

function showWagon() {
  const depot = depots[schedule[currentWagon]];
  wagonBody.setAttribute("fill", depot.color);
  wagonBody.setAttribute("stroke", depot.border);
  wagonLetter.textContent = depot.letter;
  wagon.setAttribute("transform", "translate(160 195)");
  wagon.style.visibility = "visible";
}

function setRouteControlsDisabled(disabled) {
  routeButtons.forEach(button => { button.disabled = disabled; });
}

function finishDelivery() {
  animation = null;
  const correct = selectedRoute === schedule[currentWagon];
  const destination = depots[schedule[currentWagon]];
  if (correct) {
    delivered += 1;
    score += 100;
  }
  currentWagon += 1;
  deliveredLabel.textContent = String(delivered);
  scoreLabel.textContent = String(score).padStart(3, "0");
  dispatch.disabled = false;
  if (currentWagon === schedule.length) {
    phase = "finished";
    yardState.textContent = "SMĚNA DOKONČENA";
    wagon.style.visibility = "hidden";
    setDispatchLabel("Další směna");
    setRouteControlsDisabled(true);
    status.textContent = `Směna hotová! Správně doručeno ${delivered} z 8 vagonů. Skóre: ${score} bodů. ${delivered === 8 ? "Čistá trať. Perfektní práce!" : "Každá směna je trénink. Zkus to znovu!"}`;
    return;
  }
  phase = "playing";
  setRouteControlsDisabled(false);
  showWagon();
  yardState.textContent = `VAGON ${currentWagon + 1} Z 8 NA PŘÍJEZDU`;
  status.textContent = `${correct ? "Správné depo! +100 bodů." : `Tenhle vagon patřil do depa ${destination.letter}. Nevadí, jedeme dál.`} Další vagon: ${depots[schedule[currentWagon]].name}. Vyber výhybku a odešli ho.`;
}

function sendWagon() {
  phase = "moving";
  dispatch.disabled = true;
  setRouteControlsDisabled(true);
  yardState.textContent = "VAGON NA CESTĚ";
  status.textContent = `Vagon ${depots[schedule[currentWagon]].letter} jede na kolej ${depots[selectedRoute].letter}…`;
  const path = paths[selectedRoute];
  const length = path.getTotalLength();
  const startOffset = 40;
  const duration = reducedMotion.matches ? 0 : 1300;
  let started = null;
  function frame(time) {
    if (started === null) started = time;
    const progress = duration === 0 ? 1 : Math.min((time - started) / duration, 1);
    const distance = startOffset + (length - startOffset) * progress;
    const point = path.getPointAtLength(distance);
    const next = path.getPointAtLength(Math.min(distance + 1, length));
    const angle = Math.atan2(next.y - point.y, next.x - point.x) * 180 / Math.PI;
    wagon.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
    if (progress < 1) animation = requestAnimationFrame(frame);
    else finishDelivery();
  }
  animation = requestAnimationFrame(frame);
}

function resetGame() {
  if (animation !== null) cancelAnimationFrame(animation);
  animation = null;
  selectedRoute = 0;
  currentWagon = 0;
  delivered = 0;
  score = 0;
  phase = "ready";
  deliveredLabel.textContent = "0";
  scoreLabel.textContent = "000";
  dispatch.disabled = false;
  setRouteControlsDisabled(false);
  selectRoute(0);
  showWagon();
  setDispatchLabel("Spustit směnu");
  yardState.textContent = "ČEKÁME NA DISPEČERA";
  status.textContent = "Nádraží je tvoje. Spusť směnu a doveď 8 vagonů do správných dep.";
}

routeButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (phase === "moving" || phase === "finished") return;
    selectRoute(Number(button.dataset.route));
    if (phase === "playing") {
      status.textContent = `Vagon: ${depots[schedule[currentWagon]].name}. Výhybka: ${depots[selectedRoute].name}. Připraveno k odeslání.`;
    }
  });
});

dispatch.addEventListener("click", () => {
  if (phase === "moving") return;
  if (phase === "finished") resetGame();
  if (phase === "ready") {
    phase = "playing";
    yardState.textContent = "VAGON 1 Z 8 NA PŘÍJEZDU";
    status.textContent = `První vagon: ${depots[schedule[currentWagon]].name}. Vyber odpovídající výhybku a odešli ho.`;
    setDispatchLabel("Odeslat vagon");
    return;
  }
  sendWagon();
});

document.getElementById("reset").addEventListener("click", resetGame);

"use strict";

// global values for managing player/game state and storing DOM element refs
const { dom, player } = require("../src/globals.js").globals;

// this function wraps the travelDirection information from the database with
// the functionality needed to actually allow the player to travel in that
// direction, and returns a more useful travelDirection object that includes an
// interactive element to put in the output that the player can click on to move
function travelDirection(travelDirection) {
  let travelDirObj = Object.assign({}, travelDirection);
  let element = document.createElement("span");

  element.classList.add("interactive");
  element.dataset.descriptor = travelDirection.movementDescriptor;
  element.dataset.target = travelDirection.target;
  element.dataset.waitTime = travelDirection.waitTime;
  element.innerText = travelDirection.name;

  // when this element is clicked on, the player should move to the correct new
  // location and time should pass accordingly
  element.onclick = travelDirClick;

  // okay, we built an interactive element with a mega onclick handler so add
  // it to the returned travelDirection object ready to be displayed in the view
  travelDirObj['element'] = element;

  return travelDirObj;
}

module.exports = travelDirection;

// clicking an element in the view that represents a Travel Direction enables
// the player to move in that direction, updating their position and the time
// that has passed
function travelDirClick() {
  if (!player.checkRef()) { return false }

  const travelDirection = this.dataset;
  const newLoc = travelDirection.target;

  if (newLoc) {
    // all existing interactive elements should stop being interactive once
    // one is clicked - those choices are no longer available to the player
    dom.deactivateAllInteractiveEls();

    // show the movementDescriptor in the output area
    const movementDescEl = document.createElement("p");
    movementDescEl.innerText = travelDirection.descriptor;
    dom.outputEl.appendChild(movementDescEl);

    // display a wait indicator to show the time taken for this travel
    const waitTime = parseInt(travelDirection.waitTime, 10);
    let count = 1;

    let interval = window.setInterval(function() {
      dom.appendWaitIndicatorToOutputEl();

      // wait until waitTime is up before actually completing this travel
      count++;
      if (count >= waitTime) {
        // travel takes time, so update the player's ticksPassed value with
        // the amount of ticks taken by this action, as well as updating the
        // player's location value to match their arrival destination
        player.increaseTicksPassedBy(waitTime);
        player.setLocationTo(newLoc);
        // playerRef.child("ticksPassed").once("value").then((snapshot) => {
        //   let currentTicks = parseInt(snapshot.val(), 10) || 0;
        //   let newTotalTicks = currentTicks + waitTime;

        //   playerRef.update({location: newLoc, ticksPassed: newTotalTicks});
        // });

        window.clearInterval(interval);
      }
    }, 1000);
  }
}

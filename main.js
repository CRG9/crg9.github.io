let timelineArray = [];
let id = 1;

const timelineModuleCreator = (moduleDescription, moduleName, moduleDateRange) => {
    return {
        _selected: false,
        _id: id++,
        _moduleDescription: moduleDescription,
        _moduleName: moduleName,
        _moduleDateRange: moduleDateRange,
        set moduleDescription(newDescription) {
            this._moduleDescription = newDescription;
        },
        set moduleName(newName) {
            this._moduleName = newName;
        },
        set moduleDateRange(newDateRange) {
            this._moduleDateRange = newDateRange;
        },
        set selected(isSelected) {
            this._selected = isSelected;
        },
    };
};

// --- DOM Element Selections ---
const nameInput = document.querySelector("#name");
const descriptionInput = document.querySelector("#description_1");
const dateRangeInput = document.querySelector("#date_range");
const moduleAdder = document.querySelector(".module-adder");
const moduleForm = document.querySelector("#module-form");
const selectedModule = document.querySelector(".selected-module");
const deleteButton = document.querySelector(".delete-module");
const resetButton = document.querySelector(".reset-timeline");
const confirmationModal = document.querySelector("#confirmation-modal");
const yesButton = document.querySelector("#yes-button");
const noButton = document.querySelector("#no-button");
const editButton = document.querySelector(".edit-module");
// ** NEW: Selectors for the arrow buttons **
const moveForwardBtn = document.querySelector("#move-forward-btn");
const moveBackwardBtn = document.querySelector("#move-backward-btn");

let existingModules = document.querySelectorAll(".module");


// --- Reusable Function for Reordering ---
// This new function contains the logic to move a module.
// Both the keyboard and the buttons will use this.
function moveModule(direction) {
    const selectedIndex = timelineArray.findIndex(
        (module) => module._selected === true
    );

    if (selectedIndex === -1) {
        return; // Do nothing if no module is selected
    }

    const selectedObject = timelineArray[selectedIndex];

    // Perform the swap in the data array
    if (direction === "forward" && selectedIndex < timelineArray.length - 1) {
        const nextObject = timelineArray[selectedIndex + 1];
        timelineArray[selectedIndex + 1] = selectedObject;
        timelineArray[selectedIndex] = nextObject;
    } else if (direction === "backward" && selectedIndex > 0) {
        const prevObject = timelineArray[selectedIndex - 1];
        timelineArray[selectedIndex - 1] = selectedObject;
        timelineArray[selectedIndex] = prevObject;
    } else {
        return; // Don't redraw if at the beginning or end
    }

    // Redraw the timeline and re-select the module that was moved
    generateVisibleModules();
    const allModules = document.querySelectorAll('.module:not(.module-adder)');
    allModules.forEach(moduleDiv => {
        if (moduleDiv.dataset.id == selectedObject._id) {
            moduleDiv.classList.add('selected');
        }
    });
}


// --- Keyboard Event Listener (Simplified) ---
// This now calls our reusable moveModule function.
document.addEventListener("keydown", function (event) {
    const isNarrowScreen = window.matchMedia("(max-width: 768px)").matches;
    let direction = null;

    if (isNarrowScreen) {
        if (event.key === "ArrowDown" || event.key === "ArrowRight") direction = "forward";
        if (event.key === "ArrowUp" || event.key === "ArrowLeft") direction = "backward";
    } else {
        if (event.key === "ArrowRight" || event.key === "ArrowUp") direction = "forward";
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") direction = "backward";
    }

    if (direction) {
        event.preventDefault();
        moveModule(direction);
    }
});


// --- Functions for Adding and Displaying Modules ---

function showFields() {
    moduleAdder.querySelector(".plus").classList.add("hidden");
    moduleAdder.querySelector(".add-module-instruction").classList.add("hidden");
    moduleAdder.querySelector("#name").classList.remove("hidden");
    moduleAdder.querySelector("#description_1").classList.remove("hidden");
    moduleAdder.querySelector("#date_range").classList.remove("hidden");
    moduleAdder.querySelector("#add-module-button").classList.remove("hidden");
}

function addModule() {
    const moduleName = nameInput.value;
    const moduleDescription = descriptionInput.value;
    const moduleDateRange = dateRangeInput.value;

    if (!moduleName || !moduleDescription || !moduleDateRange) {
        alert("Please fill in all fields before adding a module.");
        return;
    }

    const newModule = timelineModuleCreator(
        moduleDescription,
        moduleName,
        moduleDateRange
    );
    timelineArray.push(newModule);
    generateVisibleModules();
}

function generateVisibleModules() {
  const timelineContainer = document.querySelector(".timeline-container");
  
  const createdModules = timelineContainer.querySelectorAll(".module:not(.module-adder)");
  createdModules.forEach(module => {
    module.remove();
  });
  
  timelineArray.forEach((moduleData) => {
    const moduleDiv = document.createElement("div");
    moduleDiv.classList.add("module");
    moduleDiv.dataset.id = moduleData._id;
    moduleDiv.dataset.name = moduleData._moduleName;
    moduleDiv.dataset.description = moduleData._moduleDescription;
    moduleDiv.dataset.date = moduleData._moduleDateRange;

    moduleDiv.innerHTML = `
      <h3>${moduleData._moduleName}</h3>
      <h4>${moduleData._moduleDescription}</h4>
      <h5>${moduleData._moduleDateRange}</h5>
    `;

    const moduleAdderEl = document.querySelector(".module-adder");
    timelineContainer.insertBefore(moduleDiv, moduleAdderEl);

    moduleDiv.onclick = toggleSelect;
  });
}


// --- Core Interaction Functions ---

function toggleSelect() {
    const clickedModuleId = this.dataset.id;
    const wasAlreadySelected = this.classList.contains("selected");
    const allModules = document.querySelectorAll(".module:not(.module-adder)");

    allModules.forEach(module => {
        module.classList.remove("selected");
    });

    timelineArray.forEach(moduleObj => {
        moduleObj._selected = false;
    });

    if (wasAlreadySelected) {
        // Deselecting: clear display and HIDE buttons
        selectedModule.querySelector("h3").textContent = "Name of Module";
        selectedModule.querySelector("h4").textContent = "Description of Module";
        selectedModule.querySelector("h5").textContent = "Date Range of Module";
        moveForwardBtn.style.display = "none";
        moveBackwardBtn.style.display = "none";
    } else {
        // Selecting: update display and SHOW buttons
        this.classList.add("selected");
        const clickedObject = timelineArray.find(module => module._id == clickedModuleId);
        if (clickedObject) {
            clickedObject._selected = true;
        }
        selectedModule.querySelector("h3").textContent = this.dataset.name;
        selectedModule.querySelector("h4").textContent = this.dataset.description;
        selectedModule.querySelector("h5").textContent = this.dataset.date;
        moveForwardBtn.style.display = "flex";
        moveBackwardBtn.style.display = "flex";
    }
}

function editModule() {
  const moduleToEditIndex = timelineArray.findIndex(
    (module) => module._selected === true
  );

  if (moduleToEditIndex === -1) {
    alert("Please select a module to edit.");
    return;
  }

  const moduleObject = timelineArray[moduleToEditIndex];

  selectedModule.innerHTML = `
    <form id="edit-form">
      <input type="text" id="edit-name" value="${moduleObject._moduleName}" placeholder="Name It!" required>
      <input type="text" id="edit-description" value="${moduleObject._moduleDescription}" placeholder="Describe It!" required>
      <input type="text" id="edit-date" value="${moduleObject._moduleDateRange}" placeholder="Date It!" required>
      <button type="submit" id="save-edit-button">Save Changes</button>
    </form>
  `;

  const editForm = document.querySelector("#edit-form");
  editForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const newName = document.querySelector("#edit-name").value;
    const newDescription = document.querySelector("#edit-description").value;
    const newDate = document.querySelector("#edit-date").value;

    moduleObject._moduleName = newName;
    moduleObject._moduleDescription = newDescription;
    moduleObject._moduleDateRange = newDate;

    generateVisibleModules();

    selectedModule.innerHTML = `
      <h3>${newName}</h3>
      <h4>${newDescription}</h4>
      <h5>${newDate}</h5>
    `;
    
    const allModules = document.querySelectorAll('.module:not(.module-adder)');
    allModules.forEach(moduleDiv => {
        if (moduleDiv.dataset.id == moduleObject._id) {
            moduleDiv.classList.add('selected');
        }
    });
  });
}

function deleteModule() {
    const moduleToDeleteIndex = timelineArray.findIndex(
        (module) => module._selected === true
    );
 
    if (moduleToDeleteIndex !== -1) {
        timelineArray.splice(moduleToDeleteIndex, 1);
        generateVisibleModules();
        selectedModule.querySelector("h3").textContent = "Name of Module";
        selectedModule.querySelector("h4").textContent = "Description of Module";
        selectedModule.querySelector("h5").textContent = "Date Range of Module";
        // Hide the move buttons after deletion
        moveForwardBtn.style.display = "none";
        moveBackwardBtn.style.display = "none";
    } else {
        alert("Please select a module to delete.");
    }
}

function resetTimeline() {
  confirmationModal.style.display = "flex";
}


// --- Event Listeners ---

moduleAdder.onclick = showFields;

moduleForm.addEventListener("submit", function(event) {
    event.preventDefault();
    addModule();
    moduleAdder.querySelector(".plus").classList.remove("hidden");
    moduleAdder.querySelector(".add-module-instruction").classList.remove("hidden");
    moduleAdder.querySelector("#name").classList.add("hidden");
    moduleAdder.querySelector("#description_1").classList.add("hidden");
    moduleAdder.querySelector("#date_range").classList.add("hidden");
    moduleAdder.querySelector("#add-module-button").classList.add("hidden");
    // Also reset the form fields
    moduleForm.reset();
});

existingModules.forEach((module) => {
    module.onclick = toggleSelect;
});

editButton.onclick = editModule;
deleteButton.onclick = deleteModule;
resetButton.onclick = resetTimeline;

noButton.onclick = function() {
  confirmationModal.style.display = "none";
};

yesButton.onclick = function() {
  timelineArray = [];
  generateVisibleModules();
  selectedModule.querySelector("h3").textContent = "Name of Module";
  selectedModule.querySelector("h4").textContent = "Description of Module";
  selectedModule.querySelector("h5").textContent = "Date Range of Module";
  confirmationModal.style.display = "none";
  // Hide the move buttons after reset
  moveForwardBtn.style.display = "none";
  moveBackwardBtn.style.display = "none";
};

// ** NEW: Event listeners for the arrow buttons **
moveForwardBtn.addEventListener("click", () => moveModule("forward"));
moveBackwardBtn.addEventListener("click", () => moveModule("backward"));

let timelineArray = [];
let id = 1;

const timelineModuleCreator = (moduleDescription, moduleName, moduleDateRange) => {
    return {
        _selected: false,
        _id: id++,
        _moduleDescription: moduleDescription,
        _moduleName: moduleName,
        _moduleDateRange: moduleDateRange,
        // Corrected setters to properly update the object's properties
        set moduleDescription(newDescription) {
            this._moduleDescription = newDescription;
        },
        set moduleName(newName) {
            this._moduleName = newName;
        },
        set moduleDateRange(newDateRange) {
            this._moduleDateRange = newDateRange;
        },
        // The selected setter is simplified as the toggle logic is elsewhere
        set selected(isSelected) {
            this._selected = isSelected;
        },
    };
};

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
//Makes each div with .module an interactable item under existingModules
let existingModules = document.querySelectorAll(".module");

document.addEventListener("keydown", function (event) {
  // 1. Find the index of the currently selected module
  const selectedIndex = timelineArray.findIndex(
    (module) => module._selected === true
  );

  // If no module is selected, do nothing
  if (selectedIndex === -1) {
    return;
  }

  // 2. NEW: Check if the screen is narrow (matches our CSS breakpoint)
  const isNarrowScreen = window.matchMedia("(max-width: 768px)").matches;

  let moveForward = false; // Move to a higher index (visually down/right)
  let moveBackward = false; // Move to a lower index (visually up/left)

  // 3. NEW: Apply different key logic based on screen size
  if (isNarrowScreen) {
    // On a NARROW screen, the layout is a vertical column.
    // Down arrow moves it FORWARD in the array (down the list).
    moveForward = event.key === "ArrowDown" || event.key === "ArrowRight";
    // Up arrow moves it BACKWARD in the array (up the list).
    moveBackward = event.key === "ArrowUp" || event.key === "ArrowLeft";
  } else {
    // On a WIDE screen, the layout is a horizontal row.
    // Right arrow moves it FORWARD in the array (to the right).
    moveForward = event.key === "ArrowRight" || event.key === "ArrowUp";
    // Left arrow moves it BACKWARD in the array (to the left).
    moveBackward = event.key === "ArrowLeft" || event.key === "ArrowDown";
  }

  // If a relevant key was pressed, proceed with the move
  if (moveForward || moveBackward) {
    event.preventDefault(); // Prevent the page from scrolling

    const selectedObject = timelineArray[selectedIndex];

    // 4. Perform the swap in the timelineArray
    if (moveForward && selectedIndex < timelineArray.length - 1) {
      // Swap with the next item
      const nextObject = timelineArray[selectedIndex + 1];
      timelineArray[selectedIndex + 1] = selectedObject;
      timelineArray[selectedIndex] = nextObject;
    } else if (moveBackward && selectedIndex > 0) {
      // Swap with the previous item
      const prevObject = timelineArray[selectedIndex - 1];
      timelineArray[selectedIndex - 1] = selectedObject;
      timelineArray[selectedIndex] = prevObject;
    }

    // 5. Redraw the timeline to show the new order
    generateVisibleModules();

    // 6. Re-apply the 'selected' class to the module that was just moved
    const allModules = document.querySelectorAll('.module:not(.module-adder)');
    allModules.forEach(moduleDiv => {
      if (moduleDiv.dataset.id == selectedObject._id) {
          moduleDiv.classList.add('selected');
      }
    });
  }
});

//This shows the input fields once the addModule item is clicked (hence, preparing to add a module)
function showFields() {
    moduleAdder.querySelector(".plus").classList.add("hidden");
    moduleAdder.querySelector(".add-module-instruction").classList.add("hidden");
    moduleAdder.querySelector("#name").classList.remove("hidden");
    moduleAdder.querySelector("#description_1").classList.remove("hidden");
    moduleAdder.querySelector("#date_range").classList.remove("hidden");
    moduleAdder.querySelector("#add-module-button").classList.remove("hidden");
}

moduleAdder.onclick = showFields;


//Submits the form data to create a new module, then returns the addModule item back to its original state.
moduleForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevents the form from submitting and reloading the page
    addModule();
    moduleAdder.querySelector(".plus").classList.remove("hidden");
    moduleAdder.querySelector(".add-module-instruction").classList.remove("hidden");
    moduleAdder.querySelector("#name").classList.add("hidden");
    moduleAdder.querySelector("#description_1").classList.add("hidden");
    moduleAdder.querySelector("#date_range").classList.add("hidden");
    moduleAdder.querySelector("#add-module-button").classList.add("hidden");
});

//Setting a piece of data for each input item from the form onto each module created
existingModules.forEach((module) => {
    module._moduleName = module.dataset.name;
    module._moduleDescription = module.dataset.description;
    module._moduleDateRange = module.dataset.date;
});

function addModule() {
    // Get the values from the input fields
    const moduleName = nameInput.value;
    const moduleDescription = descriptionInput.value;
    const moduleDateRange = dateRangeInput.value;

    // Use a guard clause to ensure all fields are filled
    if (!moduleName || !moduleDescription || !moduleDateRange) {
        alert("Please fill in all fields before adding a module.");
        return; // Exit the function
    }

    const newModule = timelineModuleCreator(
        moduleDescription,
        moduleName,
        moduleDateRange
    );
    timelineArray.push(newModule);

    // You can now log the array to confirm the new module has been added
    console.log(timelineArray); 
    generateVisibleModules();

    existingModules = document.querySelectorAll(".module");
}

function generateVisibleModules() {
  const timelineContainer = document.querySelector(".timeline-container");
  
  // Select all modules that have been created and remove them
  const createdModules = timelineContainer.querySelectorAll(".module:not(.module-adder)");
  createdModules.forEach(module => {
    module.remove();
  });
  
  // Now, iterate through your data array and create new modules
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

    // Append the newly created module before the module-adder
    const moduleAdder = document.querySelector(".module-adder");
    timelineContainer.insertBefore(moduleDiv, moduleAdder);

    // Re-attach the event listener
    moduleDiv.onclick = toggleSelect;
  });
}

function toggleSelect() {
    // 'this' refers to the clicked module div
    const clickedModuleId = this.dataset.id;
    
    // Check if the item clicked was already selected.
    const wasAlreadySelected = this.classList.contains("selected");

    // --- Part 1: Reset Everything ---
    // Get the most up-to-date list of all modules
    const allModules = document.querySelectorAll(".module:not(.module-adder)");

    // Remove the 'selected' class from all module divs
    allModules.forEach(module => {
        module.classList.remove("selected");
    });

    // Set the '_selected' property to false for all objects in the array
    timelineArray.forEach(moduleObj => {
        moduleObj._selected = false;
    });

    // --- Part 2: Apply the New State ---
    if (wasAlreadySelected) {
        // If it was already selected, the user is deselecting it.
        // The reset above has already handled this. Now just clear the display.
        selectedModule.querySelector("h3").textContent = "Name of Module";
        selectedModule.querySelector("h4").textContent = "Description of Module";
        selectedModule.querySelector("h5").textContent = "Date Range of Module";
    } else {
        // If it was not selected, we now select it.
        // Visually select the clicked module
        this.classList.add("selected");
        
        // Find the corresponding object in the data array and update its property
        const clickedObject = timelineArray.find(module => module._id == clickedModuleId);
        if (clickedObject) {
            clickedObject._selected = true;
        }

        // Update the display with the clicked module's data
        selectedModule.querySelector("h3").textContent = this.dataset.name;
        selectedModule.querySelector("h4").textContent = this.dataset.description;
        selectedModule.querySelector("h5").textContent = this.dataset.date;
    }
}

existingModules.forEach((module) => {
    module.onclick = toggleSelect;
});

function editModule() {
  // 1. Find the index and the object of the selected module
  const moduleToEditIndex = timelineArray.findIndex(
    (module) => module._selected === true
  );

  // If no module is selected, show an alert and exit the function
  if (moduleToEditIndex === -1) {
    alert("Please select a module to edit.");
    return;
  }

  const moduleObject = timelineArray[moduleToEditIndex];

  // 2. Create an HTML form pre-filled with the module's current data
  //    and inject it into the 'selected-module' container.
  selectedModule.innerHTML = `
    <form id="edit-form">
      <input type="text" id="edit-name" value="${moduleObject._moduleName}" placeholder="Name It!" required>
      <input type="text" id="edit-description" value="${moduleObject._moduleDescription}" placeholder="Describe It!" required>
      <input type="text" id="edit-date" value="${moduleObject._moduleDateRange}" placeholder="Date It!" required>
      <button type="submit" id="save-edit-button">Save Changes</button>
    </form>
  `;

  // 3. Listen for the submission of the newly created form
  const editForm = document.querySelector("#edit-form");
  editForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevents the page from reloading on submit

    // 4. Get the new, edited values from the form fields
    const newName = document.querySelector("#edit-name").value;
    const newDescription = document.querySelector("#edit-description").value;
    const newDate = document.querySelector("#edit-date").value;

    // 5. Update the data in the timelineArray object
    moduleObject._moduleName = newName;
    moduleObject._moduleDescription = newDescription;
    moduleObject._moduleDateRange = newDate;

    // 6. Redraw all the modules in the main timeline to reflect the changes
    generateVisibleModules();

    // 7. Change the form back into the standard display, now with the updated info
    selectedModule.innerHTML = `
      <h3>${newName}</h3>
      <h4>${newDescription}</h4>
      <h5>${newDate}</h5>
    `;
    
    // 8. Re-apply the 'selected' class to the module that was just edited
    const allModules = document.querySelectorAll('.module:not(.module-adder)');
    allModules.forEach(moduleDiv => {
        if (moduleDiv.dataset.id == moduleObject._id) {
            moduleDiv.classList.add('selected');
        }
    });
  });
}

editButton.onclick = editModule;


function deleteModule() {
    const moduleToDeleteIndex = timelineArray.findIndex(
        (module) => module._selected === true
    );
 
    if (moduleToDeleteIndex !== -1) {
        // Remove the item from the data array
        timelineArray.splice(moduleToDeleteIndex, 1);
        
        // **Crucial Update:** Re-render the modules to show the deletion
        generateVisibleModules();

        // Clear the selected module display
        selectedModule.querySelector("h3").textContent = "Name of Module";
        selectedModule.querySelector("h4").textContent = "Description of Module";
        selectedModule.querySelector("h5").textContent = "Date Range of Module";
 
    } else {
        alert("Please select a module to delete.");
    }
}

deleteButton.onclick = deleteModule;

function changeOrder() {

}



function resetTimeline() {
  confirmationModal.style.display = "flex";
}

// 3. Assign your function to the resetButton's click event
resetButton.onclick = resetTimeline;

// 4. The "No" button's function is simply to hide the pop-up
noButton.onclick = function() {
  confirmationModal.style.display = "none";
};

// 5. The "Yes" button's function contains the actual reset logic
yesButton.onclick = function() {
  // Clear the data array
  timelineArray = [];

  // Clear the DOM by re-rendering with the empty array
  generateVisibleModules();

  // Clear the 'selected module' display
  selectedModule.querySelector("h3").textContent = "Name of Module";
  selectedModule.querySelector("h4").textContent = "Description of Module";
  selectedModule.querySelector("h5").textContent = "Date Range of Module";

  // Hide the pop-up
  confirmationModal.style.display = "none";
};

resetButton.onclick = resetTimeline; 
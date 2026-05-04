console.log("spc_admin_panel.js");

const Frequency = {
    Weekly: "Weekly",
    OneTime: "One Time"
}

const Day = {
    Sunday: "Sunday",
    Monday: "Monday",
    Tuesday: "Tuesday",
    Wednesday: "Wednesday",
    Thursday: "Thursday",
    Friday: "Friday",
    Saturday: "Saturday"
}

const DayArray = [
    Day.Sunday,
    Day.Monday,
    Day.Tuesday,
    Day.Wednesday,
    Day.Thursday,
    Day.Friday,
    Day.Saturday
];

/**
 * Example Schema of MassTimes:
 */
// let MassTimes = [
//     {
//         ID: Date.now(), //for tracking updates
//         Frequency: Frequency.Weekly,
//         Day: Day.Sunday,
//         Date: undefined,
//         Time: "19:00",
//         CancelleddUntil: undefined, //The UI does this by occurance, but we should calculate the moment that future occurance happens so we don't have to store when the user clicked buttons
//         DeletedUntil: undefined,
//         AdditionalNotes: "Only 1 door will be unlocked, etc."
//     },
//     {
//         ID: Date.now(),
//         Frequency: Frequency.Weekly,
//         Day: Day.Sunday,
//         Date: undefined,
//         Time: "11:30",
//         CancelleddUntil: '2026-05-04T00:00:00.000Z', // Note: timezones!
//         DeletedUntil: undefined,
//         AdditionalNotes: "Only 1 door will be unlocked, etc."
//     },
//     {
//         ID: Date.now(),
//         Frequency: Frequency.OneTime,
//         Day: undefined,
//         Date: '2026-05-03',
//         Time: "19:00",
//         CancelleddUntil: undefined, //The UI does this by occurance, but we should calculate the moment that future occurance happens so we don't have to store when the user clicked buttons
//         DeletedUntil: undefined,
//         AdditionalNotes: "Chrism Mass at <a href='#google-maps' >St. Sebastian Church, 476 Mull Ave., Akron</a>"
//     }
// ];

// This object is only used for the editing process. The Add Mass Time uses the original object to add a new time without saving other edits. This also means the other pending edits will be dropped
const MassTimes = [];
const MassTimesUpdates = [];

function LoadRawJson() {
    const rawJson = document.querySelector("#ms-json").value;
    const parsedJson = JSON.parse(rawJson === "" ? "[]" : rawJson);
    parsedJson.forEach(j => MassTimes.push(j));
}

function HandleDayOfWeekDateHiding(selectedFrequency, commonAncestorSelector) {
    const dayOfWeekClass = "ms-day-of-week";
    const dateClass = "ms-date";
    const dayOfWeekSelector = `${commonAncestorSelector} .${dayOfWeekClass}, ${commonAncestorSelector} [for='${dayOfWeekClass}']`;
    const dateSelector = `${commonAncestorSelector} .${dateClass}, ${commonAncestorSelector} [for='${dateClass}']`;
    if(selectedFrequency === Frequency.Weekly) {
        document.querySelectorAll(dayOfWeekSelector).forEach(e => {
            e.style.display = "inline-block";
        });
        document.querySelectorAll(dateSelector).forEach(e => {
            e.style.display = "none";
        });
    } else if(selectedFrequency === Frequency.OneTime) {
        document.querySelectorAll(dayOfWeekSelector).forEach(e => {
            e.style.display = "none";
        });
        document.querySelectorAll(dateSelector).forEach(e => {
            e.style.display = "inline-block";
        });
    } else {
        document.querySelectorAll(dayOfWeekSelector).forEach(e => {
            e.style.display = "none";
        });
        document.querySelectorAll(dateSelector).forEach(e => {
            e.style.display = "none";
        });
    }
}

function GenerateFrequencyDropdownOptions(parent, commonAncestorSelector) {
    Object.values(Frequency).forEach(f => {
        const frequencyOption = document.createElement("OPTION");
        frequencyOption.setAttribute("value", f);
        frequencyOption.innerText = f;
        parent.appendChild(frequencyOption);
    });

    parent.addEventListener("change", (e) => {
        HandleDayOfWeekDateHiding(e.target.value, commonAncestorSelector);
    });
}

function GenerateDayOfWeekDropdownOptions(parent) {
    Object.values(Day).forEach(f => {
        const dayOption = document.createElement("OPTION");
        dayOption.setAttribute("value", f);
        dayOption.innerText = f;
        parent.appendChild(dayOption);
    });
}

function InitializeAddMassTimeForm() {
    const frequencySelect = document.querySelector("#ms-frequency");
    GenerateFrequencyDropdownOptions(frequencySelect, "#ms-add-time-fs");
    HandleDayOfWeekDateHiding(undefined, "#ms-add-time-fs");

    const daySelect = document.querySelector("#ms-day-of-week");
    GenerateDayOfWeekDropdownOptions(daySelect);

    const addButton = document.querySelector("#ms-add-button");
    addButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const newFrequency = document.querySelector("#ms-frequency").value;
        const newMassTime = {
            ID: Date.now(),
            Frequency: newFrequency,
            Day: newFrequency === Frequency.OneTime ? undefined : document.querySelector("#ms-day-of-week").value,
            Date: newFrequency === Frequency.Weekly ? undefined : document.querySelector("#ms-date").value,
            Time: document.querySelector("#ms-time").value,
            AdditionalNotes: document.querySelector("#ms-additional-notes").value,
            CancelleddUntil: undefined,
            DeletedUntil: undefined,
        };

        const rawJson = document.querySelector("#ms-json").value;
        const originalJson = JSON.parse(rawJson === "" ? "[]" : rawJson);
        originalJson.push(newMassTime);
        document.querySelector("#ms-json").innerText = JSON.stringify(originalJson);
        SaveMassTimes();
    });

    document.querySelector("#ms-add-loading-indicator").remove();
    document.querySelectorAll("#ms-add-time-fs select, #ms-add-time-fs input, #ms-add-time-fs button").forEach(f => {
        f.removeAttribute("disabled");
    });
    document.querySelector("#ms-add-time-fs").style.display = "inline-block";
}

function InitializeEditMassTimeFormTable() {
    const parent = document.querySelector("#ms-tbody");
    MassTimes.forEach(m => {
        parent.appendChild(CreateOneRow(m));
        HandleDayOfWeekDateHiding(m.Frequency, "#ms-row-" + m.ID);
        MassTimesUpdates.push({
            ID: m.ID,
            Frequency: m.Frequency,
            Date: m.Date,
            Day: m.Day,
            Time: m.Time,
            AdditionalNotes: m.AdditionalNotes
        });
    });
    if(MassTimes.length == 0) {
        document.querySelector("#ms-existing-loading-indicator").innerText = "None yet!";
    } else {
        document.querySelector("#ms-existing-loading-indicator").remove();
    }
}

function AddSaveFieldEventListener(formElement, fieldName, fieldValueFunc, currentID) {
    formElement.addEventListener("change", (e) => {
        const currentIndex = MassTimesUpdates.findIndex(u => u.ID === currentID);
        if(currentIndex !== -1) {
            MassTimesUpdates[currentIndex][fieldName] = fieldValueFunc ? fieldValueFunc() : e.target.value;
        }
        else {
            console.error(`Could not find ID '${currentID}' in list of Mass Times. Cannot update.`);
        }

        const currentSaveIndicator = document.querySelector(`#ms-save-state-${currentID}`);
        if(AnyDifferencesOnThisRow(currentID)) {
            currentSaveIndicator.innerText = "Pending unsaved changes";
            currentSaveIndicator.classList.remove("s");
            currentSaveIndicator.classList.add("p");
        } else {
            currentSaveIndicator.innerText = "Saved!";
            currentSaveIndicator.classList.remove("p");
            currentSaveIndicator.classList.add("s");
        }
    });
}
function AnyDifferencesOnThisRow(ID) {
    const o = MassTimes.filter(m => m.ID === ID)[0];
    const u = MassTimesUpdates.filter(m => m.ID === ID)[0];

    return o.Frequency !== u.Frequency
        || o.Date !== u.Date
        || o.Day !== u.Day
        || o.Time !== u.Time
        || o.AdditionalNotes !== u.AdditionalNotes
        || o.CancelledUntil !== u.CancelledUntil
        || o.DeletedUntil !== u.DeletedUntil;
}

function CreateOneRow(mt) {
    const row = document.createElement("TR");
    row.id = "ms-row-" + mt.ID;
    const time = document.createElement("TD");

    const frequencyDropdown = document.createElement("SELECT");
    frequencyDropdown.classList.add("ms-frequency");
    const frequencyPlaceholder = document.createElement("OPTION");
    frequencyPlaceholder.innerText = "Select Mass frequency";
    frequencyPlaceholder.setAttribute("disabled", undefined);
    frequencyPlaceholder.style.display = "none";
    frequencyPlaceholder.value = "-1";
    frequencyDropdown.appendChild(frequencyPlaceholder);
    GenerateFrequencyDropdownOptions(frequencyDropdown, "#" + row.id);
    frequencyDropdown.value = mt.Frequency;
    AddSaveFieldEventListener(frequencyDropdown, "Frequency", null, mt.ID);

    const dayDropdown = document.createElement("SELECT");
    dayDropdown.classList.add("ms-day-of-week");
    const dayPlaceholder = document.createElement("OPTION");
    dayPlaceholder.innerText = "Select a day...";
    dayPlaceholder.setAttribute("disabled", undefined);
    dayPlaceholder.setAttribute("selected", undefined);
    dayPlaceholder.style.display = "none";
    dayPlaceholder.value = "-1";
    dayDropdown.appendChild(dayPlaceholder);
    GenerateDayOfWeekDropdownOptions(dayDropdown);
    if(mt.Day)
        dayDropdown.value = mt.Day;
    AddSaveFieldEventListener(dayDropdown, "Day", null, mt.ID);

    const datePicker = document.createElement("INPUT");
    datePicker.classList.add("ms-date");
    datePicker.setAttribute("type", "date");    
    if(mt.Date)
        datePicker.value = mt.Date;
    AddSaveFieldEventListener(datePicker, "Date", null, mt.ID);

    const timePicker = document.createElement("INPUT");
    timePicker.classList.add("ms-time");
    timePicker.setAttribute("type", "time");
    timePicker.value = mt.Time;
    AddSaveFieldEventListener(timePicker, "Time", null, mt.ID);

    time.appendChild(frequencyDropdown);
    
    const spanOn = document.createElement("SPAN");
    spanOn.innerText = " on ";
    time.appendChild(spanOn);
    
    time.appendChild(dayDropdown);
    time.appendChild(datePicker);

    const spanAt = document.createElement("SPAN");
    spanAt.innerText = " at ";
    time.appendChild(spanAt);
    
    time.appendChild(timePicker);

    row.appendChild(time);
    
    const cancel = document.createElement("TD");
    GenerateCheckboxLabelAndDropdown(cancel, mt, "cancel", "Cancel", "CancelledUntil", "Indefinitely", 10, "CancelleddUntil", frequencyDropdown);
    // TODO translate "mt.CancelledUntil" into the proper UI here, and back again

    row.appendChild(cancel);

    const additionalNotes = document.createElement("TD");
    const additionalNotesInput = document.createElement("INPUT");
    additionalNotesInput.classList.add("ms-additional-notes");
    additionalNotesInput.setAttribute("type", "text");
    additionalNotesInput.value = mt.AdditionalNotes;
    additionalNotes.appendChild(additionalNotesInput);

    row.appendChild(additionalNotes);

    const _delete = document.createElement("TD");
    GenerateCheckboxLabelAndDropdown(_delete, mt, "delete", "Delete", "DeletedUntil", "Permanently", 10, "DeletedUntil", frequencyDropdown);

    // TODO translate "mt.DeletedUtil" into the proper UI here, and back again
    row.appendChild(_delete);

    const saveState = document.createElement("TD");
    saveState.id = `ms-save-state-${mt.ID}`;
    saveState.classList.add("s");
    saveState.innerText = "Saved!";

    row.appendChild(saveState);

    return row;
}

function GenerateCheckboxLabelAndDropdown(parent, mt, slugForClasses, labelText, fieldName, firstDropdownText, numOtherOptions, jsonField, frequencyDropdown) {
    const checkbox = document.createElement("INPUT");
    checkbox.classList.add(`ms-${slugForClasses}`);
    checkbox.setAttribute("type", "checkbox");
    checkbox.id = `ms-${slugForClasses}-${mt.ID}`;
    checkbox.addEventListener("change", (e) => {
        if(e.target.checked) {
            document.querySelector(`#ms-row-${mt.ID} .ms-${slugForClasses}-dropdown`).removeAttribute("disabled");
        } else {
            document.querySelector(`#ms-row-${mt.ID} .ms-${slugForClasses}-dropdown`).setAttribute("disabled", undefined);
        }
    });
    parent.appendChild(checkbox);
    AddSaveFieldEventListener(checkbox, fieldName, () => {
        if(checkbox.checked) {
            return NumOccurancesToUntilDate(document.querySelector(`#ms-row-${mt.ID} .ms-${slugForClasses}-dropdown`).value, mt.ID);
        } else {
            return undefined;
        }
    }, mt.ID);

    const label = document.createElement("LABEL");
    label.classList = `ms-${slugForClasses}-label`;
    label.innerText = labelText;
    parent.appendChild(label);
    const lengthDropdown = document.createElement("SELECT");
    lengthDropdown.classList = `ms-${slugForClasses}-dropdown`;
    lengthDropdown.setAttribute("disabled", undefined);
    const optionOne = document.createElement("OPTION");
    optionOne.innerText = firstDropdownText;
    optionOne.value = "-1";
    lengthDropdown.appendChild(optionOne);
    for(var i = 1; i <= numOtherOptions; i++) {
        const nextOption = document.createElement("OPTION");
        nextOption.innerText = `Next ${i} occurance` + (i > 1 ? "s" : "");
        nextOption.value = `${i}`;
        lengthDropdown.appendChild(nextOption);
    }
    frequencyDropdown.addEventListener("change", (e) => {
        if(e.target.value === Frequency.OneTime) {
            document.querySelector(`#ms-row-${mt.ID} .ms-${slugForClasses}-dropdown`).style.display = "none";
        } else {
            document.querySelector(`#ms-row-${mt.ID} .ms-${slugForClasses}-dropdown`).style.display = "inline-block";
        }
    });
    if(mt.Frequency === Frequency.OneTime) {
        lengthDropdown.style.display = "none";
    }

    if(mt[jsonField] !== undefined) {
        const dateDiff = mt[jsonField] - new Date();
        const daysAway = dateDiff / (1000 * 60 * 60 * 24);
        if(daysAway > 0) {
            lengthDropdown.value = `${Math.ceil(daysAway / 7)}`;
        }
    }

    parent.appendChild(lengthDropdown);
    AddSaveFieldEventListener(lengthDropdown, fieldName, () => {
        return NumOccurancesToUntilDate(document.querySelector(`#ms-row-${mt.ID} .ms-${slugForClasses}-dropdown`).value, mt.ID);
    }, mt.ID);
}

function NumOccurancesToUntilDate(numOccurances, ID) {
    if(MassTimesUpdates.filter(m => m.ID === ID)[0].Frequency === Frequency.OneTime || numOccurances == "-1") {
        return null; //convention, will interpret to mean lasts forever (as opposed to undefined)
    } else {
        let overshoot = new Date((new Date()).setDate((new Date()).getDate() + (7 * numOccurances)));
        // Slightly convoluted but to make sure we always move backwards from the overshoot, probably can be simplified
        let safety = 6;
        while(safety > 0 && overshoot.getDay() !== DayArray.indexOf(MassTimesUpdates.filter(m => m.ID === ID)[0].Day)) {
            overshoot = new Date(overshoot - (1000 * 60 * 60 * 24));
            safety--;
        }
        return overshoot;
    }
}

function InitializePreview() {

}

// Saves whatever is currently in the raw JSON textarea element
function SaveMassTimes() {
    PurgeStaleMassTimes();
    if(ValidateNewMassTimesObject()) {
        document.querySelector("#submit")?.click();
    }
}

// Remove mass times that have been permanently deleted or one-time mass times whos date has passed
function PurgeStaleMassTimes() {
    //TODO
}

// Validation Rules
// - No One-Time dates in the past
// - No times in the past (only applies if the date is today)
// - No 2 mass times at the same exact time (regardless of frequency, so you'll need to calculate)
//   - Unless one of those 2 masses are either cancelled or deleted
function ValidateNewMassTimesObject() {
    const frequencyField = document.querySelector("#ms-frequency");
    const dayField = document.querySelector("#ms-day-of-week");
    const dateField = document.querySelector("#ms-date");
    const timeField = document.querySelector("#ms-time");
    const notesField = document.querySelector("#ms-additional-notes");

    const allFields = [ frequencyField, dayField, dateField, timeField, notesField ];
    allFields.forEach(f => f.setCustomValidity("")); //reset validation
    
    if(frequencyField.value === Frequency.OneTime) {
        // One-Time dates must be today or later
        if(dateField !== undefined && (new Date((new Date()).toLocaleDateString())) > (new Date(dateField.value + "T00:00:00"))) {
            dateField.setCustomValidity("This date should be set to the future");
        }

        //If date is today, time must be in the future ("T00:00:00" stuff to account for timezone issues)
        const nowTime = Intl.DateTimeFormat("en-US", {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(new Date());

        if(dateField !== undefined && (new Date(dateField.value + "T00:00:00")).toLocaleDateString() === (new Date()).toLocaleDateString()
            && nowTime >= timeField.value) {
            timeField.setCustomValidity("Since the selected date is today, this time must be set to the future");
        }
    }

    if(frequencyField.value === "-1") {
        frequencyField.setCustomValidity("Please select a frequency");
    }
    if(frequencyField.value === Frequency.Weekly && dayField.value === "-1") {
        dayField.setCustomValidity("Please select a day of the week");
    }
    if(frequencyField.value === Frequency.OneTime && dateField.value === "") {
        dateField.setCustomValidity("Plase select a date");
    }
    if(timeField.value === "") {
        timeField.setCustomValidity("Plase select a time");
    }

    allFields.forEach(f => {
        f.checkVisibility();
        console.log({ f, valid: f.reportValidity() });
    });

    return !allFields.some(f => !f.reportValidity());
}


function LoadMassTimeObject(rawJson) {
    SyncFrontend();
}

function SyncFrontend() {
    
}

function CalculateJson() {
    const output = document.getElementsByName("spc_masstimes_json");
}

LoadRawJson();
InitializeAddMassTimeForm();
InitializeEditMassTimeFormTable();
InitializePreview();
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

function LoadRawJson() {
    const rawJson = document.querySelector("#ms-json").value;
    const parsedJson = JSON.parse(rawJson === "" ? "[]" : rawJson);
    parsedJson.forEach(j => MassTimes.push(j));
}

function InitializeAddMassTimeForm() {
    const frequencySelect = document.querySelector("#ms-frequency");
    Object.values(Frequency).forEach(f => {
        const frequencyOption = document.createElement("OPTION");
        frequencyOption.setAttribute("value", f);
        frequencyOption.innerText = f;
        frequencySelect.appendChild(frequencyOption);
    });
    frequencySelect.addEventListener("change", (e) => {
        if(e.target.value === Frequency.Weekly) {
            document.querySelector("#ms-day-of-week").removeAttribute("disabled");
            document.querySelector("#ms-date").setAttribute("disabled", undefined);
        } else if(e.target.value === Frequency.OneTime) {
            document.querySelector("#ms-day-of-week").setAttribute("disabled", undefined);
            document.querySelector("#ms-date").removeAttribute("disabled");
        } else {
            document.querySelector("#ms-day-of-week").setAttribute("disabled", undefined);
            document.querySelector("#ms-date").setAttribute("disabled", undefined);
        }
    });

    const daySelect = document.querySelector("#ms-day-of-week");
    Object.values(Day).forEach(f => {
        const dayOption = document.createElement("OPTION");
        dayOption.setAttribute("value", f);
        dayOption.innerText = f;
        daySelect.appendChild(dayOption);
    });

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
}

function InitializeEditMassTimeFormTable() {
    MassTimes.forEach(m => {
        
    });
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
    if(dayField.value === "-1") {
        dayField.setCustomValidity("Please select a day of the week");
    }
    if(dateField.value === "") {
        dateField.setCustomValidity("Plase select a date");
    }
    if(timeField.value === "") {
        timeField.setCustomValidity("Plase select a time");
    }

    allFields.forEach(f => {
        f.checkVisibility();
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
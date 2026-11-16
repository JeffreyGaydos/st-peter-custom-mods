const Frequency = {
    Weekly: "Weekly",
    OneTime: "One Time",
    RawText: "Raw Text"
};

//Used by the Admin Pannel as well to update the preview in real-time
function RenderPreview(json) {
    const purgedJson = PurgeStaleMassTimes(json);
    const allPreviews = document.querySelectorAll("spc_mass_times");
    allPreviews.forEach((preview) => {
        preview.innerHTML = ""; //clear any previous render
        if(purgedJson.length > 0) {
            let previousListVal = false;
            var listP = undefined;
            for(var i = 0; i < purgedJson.length; i++) {
                if((purgedJson[i].List === true || purgedJson[i].List === undefined) && !previousListVal) {
                    listP = document.createElement("UL");
                } else if(purgedJson[i].List === false) {
                    if(listP) {
                        preview.appendChild(listP);
                        listP = undefined; //We are no longer inside a UL element
                    }
                }
                const listE = purgedJson[i].List === false ? document.createElement("P") : document.createElement("LI");
                const niceDate = purgedJson[i].Frequency === Frequency.OneTime ? new Date(purgedJson[i].Date).toLocaleDateString("en", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }) : undefined;
                const frequencyDay = purgedJson[i].Frequency === Frequency.Weekly ? `Every ${purgedJson[i].Day}` : `${niceDate}`;
                const timeString = new Date(`2000-01-01 ${purgedJson[i].Time}`).toLocaleTimeString({ hour: "short" }).replace(/:00 (?=[AP]M)/, " ");
                const isCancelled = purgedJson[i].CancelledUntil ? new Date() < new Date(new Date(purgedJson[i].CancelledUntil).toISOString().split("T")[0] + "T23:59:59") : purgedJson[i].CancelledUntil === null;
                const isDeleted = purgedJson[i].DeletedUntil ? new Date() < new Date(new Date(purgedJson[i].DeletedUntil).toISOString().split("T")[0] + "T23:59:59") : purgedJson[i].DeletedUntil === null;
                const cancelStartString = isCancelled ? '<span style="text-decoration: line-through">' : '';
                const cancelEndString = isCancelled ? '</span><span style="font-weight: 600; color: red"> CANCELLED</span>' : '';
                listE.innerHTML = `${cancelStartString}${frequencyDay} at ${timeString}${cancelEndString}${purgedJson[i].AdditionalNotes}`
                if(!isDeleted) {
                    if(purgedJson[i].List === false) {
                        preview.appendChild(listE);
                    } else {
                        listP.appendChild(listE);
                    }
                }

                previousListVal = purgedJson[i].List ?? true;
            }
            if(purgedJson[purgedJson.length - 1].List !== false) {
                preview.appendChild(listP);
            }
        }
    });
}

// Remove mass times that have been permanently deleted or one-time mass times whos date has passed
function PurgeStaleMassTimes(jsonToPurgeFrom) {
    const idsToPurge = [];
    jsonToPurgeFrom.forEach(mt => {
        if(mt.DeletedUntil === null) {
            idsToPurge.push(mt.ID);
        }
        if(mt.Frequency === Frequency.OneTime && new Date(`${mt.Date} ${mt.Time}`) < new Date()) {
            idsToPurge.push(mt.ID);
        }
    });

    return jsonToPurgeFrom.filter(mt => !idsToPurge.includes(mt.ID));
}

//Other plugin components that rely on this code to fire should call this code again after it has completed it's own execution. That way we don't have to worry about ordering these different components executions
function RefreshAllMassTimePreviews() {
    if(document.querySelector("spc_mass_times") && document.querySelector("#spc_masstimes_json")) {
        const rawJson = document.querySelector("#spc_masstimes_json").innerHTML;
        RenderPreview(JSON.parse(rawJson));
    }
}

RefreshAllMassTimePreviews();
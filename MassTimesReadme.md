# Mass Times System

Since knowing the mass times is important, it's likely there will be multiple places where the mass time is visible. This system is intended to unify how we display mass times across the website.

## Adding a new Mass Time

First, find the form section titled "Add a New Mass Time"

Then select the Frequency. The form will change depending on the frequency value you select. This field is required. Once you've selected a frequency, the form should display either a a date picker or a dropdown to select the day of the week (not both).

Once the rest of the form is filled out, click the "Add this Mass Time" button. Note that the preview window will NOT update when adding a mass time. Note that One-Time mass times must be scheduled for the future, as those that have passed are automatically removed.

## Editing a Mass Time

There are a few ways to edit an existing mass time. Any edits made to mass times will appear in the preview window before saving, but will not appear on the live website until you click the "Save Edits" button.

### Order

Since Mass times are displayed in a list, you can re-order them depending on preference. The output does not automatically order the mass times in any particular way. Click the up arrow to swap that mass time with the one above it, and click the down arrow for the converse operation.

### Time

Use this section to update the timing of the mass time. Note that changing fields here may reset other previously-set parts of the mass time, at which point you will need to re-enter those values if desired. For example, if you switch the day from Sunday to Saturday, and the mass time is currently Cancelled for any amount of time, those fields will reset to being uncancelled.

### Cancel

This section should be used when you want to keep the mass time visible but apply a strikethrough style to it and an indication that the mass time is cancelled. Selecting a number of occurances is useful for if you only need to cancel the mass time for 1 week. Note that if you are using a One-Time frequency mass time, the dropdown to select the length of time to cancel will disappear, indicating that you can only permanently cancel a One-Time mass time.

### Additional Notes

This section will add text after the mass time. HTML is supported so if something more custom is needed, additional notes is a good "back door" into the system. As a result, you must be careful when editing this field as it can break the UI of the website if bad HTML code is added.

### Delete

This section is how you delete or hide a mass time. Selecting to delete permanently means that the mass time will be removed entirely from both the display and the settings, so this action cannot be undone. Deleting for a number of occurances only hides the mass time from the UI, after which it will re-appear. Note that if you are using a One-Time frequency mass time, the dropdown to select the length of time to delete will disappear, indicating that you can only permanently delete a One-Time mass time.

### Is Actually Saved

This helpful column simply tells you if the row matches what is already saved. If you make edits and don't save, the website will not update, so use this column to check if you've saved or not.
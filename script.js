const CLOUD_NAME = "djqmdd52k";
const UPLOAD_PRESET = "ar_magnet_preset";
const SHEET_NAME = "Sheet1";

function onFormSubmit(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const responses = e.values; 
  if (!responses) return;

  const productId = responses[1].toLowerCase().trim();
  const fileUrl = responses[2]; 

  try {
    const fileId = fileUrl.split('id=')[1];
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;
    const payload = {
      file: blob,
      upload_preset: UPLOAD_PRESET,
      public_id: productId 
    };

    const options = {
      method: 'post',
      payload: payload,
      muteHttpExceptions: true // THIS ALLOWS US TO SEE THE ERROR
    };

    const response = UrlFetchApp.fetch(cloudinaryUrl, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.secure_url) {
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 3).setValue(result.secure_url);
      console.log("SUCCESS! Link saved: " + result.secure_url);
    } else {
      // THIS WILL NOW SHOW UP IN YOUR EXECUTION LOGS
      console.error("CLOUDINARY REJECTED UPLOAD: " + response.getContentText());
    }

  } catch (error) {
    console.error("SCRIPT ERROR: " + error.toString());
  }
}
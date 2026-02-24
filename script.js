// 1. YOUR SETTINGS
const CLOUD_NAME = "djqmdd52k"; //
const UPLOAD_PRESET = "ar_magnet_preset"; //
const SHEET_NAME = "Sheet1"; //

// Use the ID from your spreadsheet URL to prevent "null" errors
const SPREADSHEET_ID = "1D9iDoodeWwd4JBMER5KfCa5mPwfxFGaq"; //

function onFormSubmit(e) {
  // Use openById to ensure the script always finds your specific sheet
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID); //
  const sheet = ss.getSheetByName(SHEET_NAME); //
  
  const responses = e.values; 
  if (!responses) {
    console.error("No data received from form submission."); //
    return;
  }

  // Column B is responses[1] (Product ID), Column C is where the file link starts
  const productId = responses[1].toLowerCase().trim(); //
  const fileUrl = responses[2]; //

  try {
    // 2. EXTRACT FILE FROM GOOGLE DRIVE
    const fileId = fileUrl.split('id=')[1]; //
    const file = DriveApp.getFileById(fileId); //
    const blob = file.getBlob(); //

    // 3. THE "HANDSHAKE" WITH CLOUDINARY
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`; //
    
    const payload = {
      file: blob,
      upload_preset: UPLOAD_PRESET,
      public_id: productId // This names the video after your product ID
    };

    const options = {
      method: 'post',
      payload: payload,
      muteHttpExceptions: true // Allows us to see the specific error if it fails
    };

    const response = UrlFetchApp.fetch(cloudinaryUrl, options); //
    const result = JSON.parse(response.getContentText()); //
    
    // 4. UPDATE COLUMN C WITH THE REAL LINK
    if (result.secure_url) {
      const lastRow = sheet.getLastRow(); //
      // This puts the link in Row (last), Column 3 (C)
      sheet.getRange(lastRow, 3).setValue(result.secure_url); //
      console.log("SUCCESS: Automated AR link created: " + result.secure_url); //
    } else {
      console.error("CLOUDINARY REJECTED UPLOAD: " + response.getContentText()); //
    }

  } catch (error) {
    console.error("SCRIPT AUTOMATION ERROR: " + error.toString()); //
  }
}
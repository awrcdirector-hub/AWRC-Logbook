export async function GET() {
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim() || "1K6APM8cVQMW3_oTneRyjDy7H8VRYOpyDPWMjpJKjpaw";

  return Response.redirect(`https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`, 302);
}

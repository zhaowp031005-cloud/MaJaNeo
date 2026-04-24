export const authCookieName = "majaneo_auth";

export function isAuthed(cookieValue: string | undefined) {
  return cookieValue === "1";
}

export function isPasscodeValid(passcode: string) {
  return passcode === "MT920325";
}

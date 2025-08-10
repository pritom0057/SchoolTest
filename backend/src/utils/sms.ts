export async function sendOtpSms(_to: string, otp: string) {
  // Hook your SMS provider here
  console.log(`[SMS MOCK] OTP: ${otp}`);
}

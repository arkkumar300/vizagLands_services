// Send OTP via SmartPing SMS Gateway
export const sendSMS = async (mobile, otp) => {
  const message = encodeURIComponent(
    `Welcome to VMRDAPlots! Use ${otp} to securely verify your user login and access trusted real estate properties, plots, and investment opportunities today. VIZAGLANDS`
  );

  const url = `https://pgapi.smartping.ai/fe/api/v1/send?username=vizagland.trans&password=Tmhc6&unicode=true&from=VIZLAN&to=${mobile}&text=${message}&dltContentId=1707177824442347734`;

  try {
    const response = await fetch(url);

    return await response.text(); // SmartPing returns plain text
  } catch (error) {
    console.error("SMS sending failed:", error);
    throw error;
  }
};
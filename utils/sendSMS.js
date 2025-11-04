const axios = require("axios");
const xml2js = require("xml2js");

const sendSMS = async (recipient, message) => {
  const username = process.env.MOBITEL_USERNAME;
  const password = process.env.MOBITEL_PASSWORD;
  const customer = process.env.MOBITEL_CUSTOMER || "QATest";
  const sender = process.env.MOBITEL_SENDER || "QATest";
  const apiUrl = process.env.MOBITEL_API_URL;

  console.log("📡 MOBITEL ENV:", { username, password, apiUrl });

  if (!username || !password || !apiUrl) {
    throw new Error("Missing Mobitel SMS credentials");
  }

  // ✅ Format recipient to 94XXXXXXXXX
  let mobile = recipient;
  if (mobile.startsWith("0")) mobile = "94" + mobile.slice(1);
  else if (!mobile.startsWith("94")) mobile = "94" + mobile;

  // 🧩 Correct SOAP XML request body (Mobitel Enterprise Format)
  const soapBody = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:esms="http://www.mobitel.lk/esms/">
      <soapenv:Header/>
      <soapenv:Body>
        <esms:sendMessages>
          <esms:username>${username}</esms:username>
          <esms:password>${password}</esms:password>
          <esms:customer>${customer}</esms:customer>
          <esms:from>${sender}</esms:from>
          <esms:messageData>
            <esms:message>
              <esms:recipient>${mobile}</esms:recipient>
              <esms:messageText>${message}</esms:messageText>
            </esms:message>
          </esms:messageData>
        </esms:sendMessages>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const { data } = await axios.post(apiUrl, soapBody, {
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
        SOAPAction: "urn:sendMessages",
      },
      timeout: 15000,
    });

    // Parse SOAP XML response
    const parsed = await xml2js.parseStringPromise(data, { explicitArray: false });
    const result =
      parsed?.["soapenv:Envelope"]?.["soapenv:Body"]?.["ns1:sendMessagesResponse"]?.return ||
      parsed?.["Envelope"]?.["Body"]?.["sendMessagesResponse"]?.return;

    if (result && result.toLowerCase().includes("ok")) {
      console.log(`✅ SMS sent successfully to ${recipient}`);
      return true;
    } else {
      console.error("❌ SMS failed:", result || data);
      throw new Error("SMS sending failed");
    }
  } catch (err) {
    console.error("❌ Failed to send SMS:", err.message);
    throw new Error("Failed to send SMS");
  }
};

module.exports = sendSMS;

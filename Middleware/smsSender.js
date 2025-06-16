const TeleSignSDK = require('telesignsdk');

module.exports = async (phone) => {
    const customerId = "AE7560CC-836B-4634-894E-4A061555025A";
    const apiKey = "m8gJ+7ZQb6RXYyuuLnj+Wpaqsmfvdmx+vMot+j9AQq+lDhrXLNJnan/ZK5olGj+v//1dsKFLLPrWHtB0Sz0G7w==";
    const rest_endpoint = "https://rest-api.telesign.com";
    const timeout = 10 * 1000;

    const client = new TeleSignSDK(
        customerId,
        apiKey,
        rest_endpoint,
        timeout // optional
    );

    const phoneTypeVOIP = "5";

    console.log("## PhoneIDClient.phoneID ##");

    function messageCallback(error, responseBody) {
        if (error === null) {
            console.log(`Phone ID response for phone number: ${phone}` +
                ` => code: ${responseBody['status']['code']}` +
                `, description: ${responseBody['status']['description']}`);

            if (responseBody['status']['code'] === 200) {
                if (responseBody['phone_type']['code'] === phoneTypeVOIP) {
                    console.log("Phone type in request is VOIP");
                } else {
                    console.log("Phone type in request is not VOIP");
                }
            }
        } else {
            console.error("Unable to get Phone ID. " + error);
        }
    }
    client.phoneid.phoneID(messageCallback, phoneNumber);

}
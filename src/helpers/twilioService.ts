import Twilio from 'twilio';
import getMessage from '../i18n';

const accountSID = process.env.TWILIO_ACCOUNT_SID || ""
const authToken = process.env.TWILIO_AUTH_TOKEN || ""
const from = process.env.TWILIO_PHONE_NUMBER || ""

const client = Twilio(accountSID,authToken);

class TwilioService{
    /**
     * Send OTP to a given phone number
     * @param to - recipient phone number (with country code, e.g. +911234567890)
     * @param otp - OTP to send
     */

    constructor(){
        this.SendOtp = this.SendOtp.bind(this);
    }

    async SendOtp(to:string,otp:string | number):Promise<boolean>{
        try{
            const message = await client.messages.create({
                to,
                from,
                body:`Your OTP is ${otp}`
            })
            console.log("Twilio Message SID:", message.sid);
            return true;
        }catch(error:any){
            throw new Error(error);
        }
    }
}

export default new TwilioService();
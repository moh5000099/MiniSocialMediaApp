import nodemailer from 'nodemailer'
export const sendEmail = async({to="",message="",subject=""})=>{
    let transporter = nodemailer.createTransport({
        host:'localhost',
        port:586,
        secure:false,
        service:'gmail',
        auth:{
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASSWORD
        }
    });
    let info = await transporter.sendMail({
        from: 'myMail@mine.com',
        to,
        subject,
        html:message
    });
    console.log(info);
    if(info.accepted.length){
        return true;
    }
    return false;
}
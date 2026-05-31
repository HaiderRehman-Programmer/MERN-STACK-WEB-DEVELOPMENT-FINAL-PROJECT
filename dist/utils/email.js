"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (options) => {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    const testAccount = await nodemailer_1.default.createTestAccount();
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"LMS Support" <support@lmsplatform.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
    });
    console.log("📩 Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("🔗 Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map
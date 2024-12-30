const mailer = {
  sendVerificationEmail: async (email, verificationLink) => {
    console.log(`Sending verification email to ${email} with link: ${verificationLink}`);
  }
};

module.exports = mailer;

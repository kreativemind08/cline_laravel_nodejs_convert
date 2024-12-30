const User = require('./models/User')

module.exports = {
  createUser: async (req, res) => {
    try {
      const user = await User.create(req.body)
      res.status(201).send(user)
    } catch (error) {
      console.error(error);
      res.status(500).send(error)
    }
  },
  promotionRegister: async (req, res) => {
    try {
      const user = await User.create(req.body)
      res.status(201).send(user)
    } catch (error) {
      console.error(error);
      res.status(500).send(error)
    }
  },
  adminRegister: async (req, res) => {
    try {
      const user = await User.create(req.body);
      res.status(201).send(user)
    } catch (error) {
      console.error(error);
      res.status(500).send(error)
    }
  },
  login: async (req, res) => {
    try {
      const user = await User.findOne({ where: { email: req.body.email } });
      if (user) {
        // Add password comparison logic here
        res.status(200).send(user)
      } else {
        res.status(404).send('Admin not found')
      }
    } catch (error) {
      console.error(error)
      res.status(500).send(error);
    }
  },
  adminLogin: async (req, res) => {
    try {
      const user = await User.findOne({ where: { email: req.body.email, type: 'admin' } });
      if (user) {
        // Add password comparison logic here
        res.status(200).send(user)
      } else {
        res.status(404).send('Admin not found')
      }
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  },
  logout: (req, res) => {
    res.status(200).send('logout')
  },
  verifyAccount: async (req, res) => {
    try {
      const user = await User.findOne({ where: { verification_token: req.params.token } });
      if (user) {
        user.verified = true;
        await user.save();
        res.status(200).send('Account verified');
      } else {
        res.status(404).send('Invalid verification token')
      }
    } catch (error) {
      console.error(error)
      res.status(500).send(error)
    }
  },
  forgotPasswordEmail: async (req, res) => {
    // Implement forgot password logic
    res.send('forgotPasswordEmail');
  },
  resetPassword: async (req, res) => {
    // Implement reset password logic
    res.send('resetPassword');
  },
  getCustomers: async (req, res) => {
    try {
      const users = await User.findAll({ where: { type: 'user' } });
      res.status(200).send(users);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  },
  getUsers: async (req, res) => {
    try {
      const users = await User.findAll();
      res.status(200).send(users);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  },
  uploadAvatar: async (req, res) => {
    // Implement upload avatar logic
    res.send('uploadAvatar');
  }
};

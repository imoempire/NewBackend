const UserModel = require("../Model/User");
const jwt = require("jsonwebtoken");
const cloudinary = require("../helper/imageUpload");
const {
  generateToken,
  mailTransport,
  generateMailTemplate,
} = require("../helper/Mail");
const VerificationModel = require("../Model/Verification");
const {isValidObjectId} = require('mongoose')

exports.createUser = async (req, res) => {
  const { fullname, email, password } = req.body;
  // Check if the user already exists
  const isNewUser = await UserModel.isThisEmailInUse(email);
  if (!isNewUser)
    return res.json({
      success: false,
      message: "This email is already in use, try sign-in",
    });
  const newUser = await UserModel({
    fullname,
    email,
    password,
  });

  const OTP = generateToken();
  const verify = new VerificationModel({
    owner: newUser._id,
    token: OTP,
  });

  await verify.save();
  await newUser.save();

  const newName = newUser._id;

  mailTransport().sendMail({
    from: "emailverification@gmail.com",
    to: newUser.email,
    subject: "Verify your email account",
    html: generateMailTemplate(OTP, newName),
  });

  res.json({ success: true, user: {
     fullname: newUser.fullname,
     email: newUser.email,
     password: newUser.password,
     verified: newUser.verified,
     id: newUser._id,
  },
  tokens: verify,
 });
};

exports.EmailVerification = async (req, res) => {
   const { userId, otp} = req.body;
   if (!userId || !otp.trim())
     return res.status(400).json({
       success: false,
       error: "incorrect code",
     });
   if (!isValidObjectId(userId))
     return res.status(400).json({
       success: false,
       error: "incorrect object id",
     });
   const user = await UserModel.findById(userId);
   if (!user)
     return res.status(400).json({
       success: false,
       error: "user is not found",
     });
   if (user.verified)
     return res.status(400).json({
       success: false,
       error: "This account is already verified",
     });
   const pin = await VerificationModel.findOne({ owner: userId });
   if (!pin)
     return res.status(400).json({
       success: false,
       error: "User not found",
     });
   const isMatched = await pin.compareToken(otp);
   if (!isMatched)
     return res.status(400).json({
       success: false,
       error: "Please provide a valid token",
     });
 
   user.verified = true;
 
   await VerificationModel.findByIdAndDelete(pin._id);
   await user.save();
 
   const name = user.name;
 
   mailTransport().sendMail({
     from: "emailverification@gmail.com",
     to: user.email,
     subject: "Verify your email account",
     html: plainMailTemplate(
       "Email Verified Successfully",
       "Thanks for connecting with us",
       name
     ),
   });
   
   res.json({
     success: false,
     message: "Email Verified Successfuly",
     user: {
       name: user.name,
       email: user.email,
       verified: user.verified,
       id: user.user_id,
     },
   });
 };
 

// Sign In controller
exports.userSignIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user)
    return res.json({
      success: false,
      message: "user not found, with the given email!",
    });

  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return res.json({
      success: false,
      message: "email / password does not match!",
    });

  const secret = process.env.JWT_SECRET;
  const token = jwt.sign({ userId: user._id }, secret, {
    expiresIn: "1d",
  });

  let oldTokens = user.tokens || [];
  if (oldTokens.length) {
    oldTokens = oldTokens.filter((t) => {
      const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
      if (timeDiff < 86400) {
        return t;
      }
    });
  }

  await UserModel.findByIdAndUpdate(user._id, {
    tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
  });

  const userInfo = {
    fullname: user.fullname,
    email: user.email,
    avatar: user.avatar ? user.avatar : "",
  };

  res.json({ success: true, user: userInfo, token });
};

exports.uploadProfile = async (req, res) => {
  const { user } = req;
  if (!user)
    return res
      .status(401)
      .json({ success: false, message: "unauthorized access!" });

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: `${user._id}_profile`,
      width: 500,
      height: 500,
      crop: "fill",
    });

    await UserModel.findByIdAndUpdate(
      user._id,
      { avatar: result.url },
      { new: true }
    );
    res
      .status(201)
      .json({ success: true, message: "Your profile has updated!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "server error, try after some time" });
    console.log("Error while uploading profile image", error.message);
  }
};

exports.signOut = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization fail!" });
    }

    const tokens = req.user.tokens;
    console.log(tokens);
    const newTokens = tokens.filter((t) => t.token !== token);

    await UserModel.findByIdAndUpdate(req.user._id, { tokens: newTokens });
    res.json({ success: true, message: "Sign out successfully!" });
  }
};

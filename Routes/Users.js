const express = require("express");
const { createUser, userSignIn, signOut, uploadProfile, EmailVerification } = require("../controllers/Users");
const { isAuth } = require("../Middlewares/auth");
const {
  validateUserSignUp,
  userValidation,
  validateUserSignIn,
} = require("../Middlewares/Validate");
const router = express.Router();
const multer = require('multer');
const { verifyEmail } = require("../controllers/Verify");

// UserProile routes
router.post("/create-user", validateUserSignUp, userValidation, createUser);
//  Email verification
router.post('/verify', EmailVerification);
router.post('/sign-in', validateUserSignIn, userValidation, userSignIn);
router.post('/sign-out', isAuth, signOut);
// Image routes
const storage = multer.diskStorage({});
const fileFilter = (req, file, cb) => {
   if (file.mimetype.startsWith('image')) {
     cb(null, true);
   } else {
     cb('invalid image file!', false);
   }
 };
const uploads = multer({ storage, fileFilter });
router.post(
   '/upload-profile',
   isAuth,
   uploads.single('profile'),
   uploadProfile
 ); 



 
module.exports = router;
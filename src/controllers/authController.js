import models from '../models/index.js';
import { generateToken } from '../middleware/auth.js';
import moment from 'moment';

const { Client, Admin } = models;

const DEMO_PHONE = "9999999999";
const DEMO_OTP = "333333";


const generateOTP=async (phone)=> {
  try {
    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length !== 10) {
      return {
        success: false,
        message: 'Phone number must be 10 digits'
      };
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = moment().add(10, 'minutes').toDate();
    
    // Save OTP to database
    const user = await Client.findOne({  where: { phoneNumber: cleanPhone } });
    
      user.otp = otp;
      user.otp_expiry = otpExpiry;
      await user.save();
    
    // Log OTP to console (for development)
    console.log('='.repeat(50));
    console.log(`📱 OTP for ${cleanPhone}: ${otp}`);
    console.log(`⏱️  Expires at: ${otpExpiry.toLocaleTimeString()}`);
    console.log('='.repeat(50));
    
    return {
      success: true,
      message: 'OTP generated successfully',
      otp: otp, // Return OTP for development
      phone: cleanPhone,
      expires_at: otpExpiry
    };
  } catch (error) {
    console.error('OTP generation error:', error);
    return {
      success: false,
      message: 'Failed to generate OTP',
      error: error.message
    };
  }
}

const verifyOTP=async (phone, otp)=> {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    
    const user = await Client.findOne({  where: { phoneNumber: cleanPhone } });
    
    if (!user) {
      return {
        success: false,
        message: 'User not found. Please register first.'
      };
    }
    
    // Check if OTP exists
    if (!user.otp || !user.otp_expiry) {
      return {
        success: false,
        message: 'No OTP generated. Please request a new OTP.'
      };
    }
    
    // Check if OTP is expired
    if (moment().isAfter(user.otp_expiry)) {
      // Clear expired OTP
      user.otp = null;
      user.otp_expiry = null;
      await user.save();
      
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.'
      };
    }
    
    // Verify OTP
    if (user.otp !== otp) {
      // Track failed attempts
      const failedAttempts = user.failed_otp_attempts || 0;
      user.failed_otp_attempts = failedAttempts + 1;
      await user.save();
      
      if (failedAttempts >= 3) {
        return {
          success: false,
          message: 'Too many failed attempts. OTP has been reset.'
        };
      }
      
      return {
        success: false,
        message: 'Invalid OTP'
      };
    }
    
    // Clear OTP after successful verification
    user.otp = null;
    user.otp_expiry = null;
    user.failed_otp_attempts = 0;
    user.is_verified = true;
    user.last_otp_verified = new Date();
    await user.save();
    
    return {
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: user.id,
        phone: user.phoneNumber,
        email: user.email,
        is_verified: true
      }
    };
  } catch (error) {
    console.error('OTP verification error:', error);
    return {
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    };
  }
}

// Resend OTP

const resendClientOTP=(phone)=> {
  return generateOTP(phone);
}

// Validate OTP format
const isValidOTP=(otp)=> {
  return /^\d{6}$/.test(otp);
}

// Generate OTP for testing
const  generateTestOTP=()=> {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check if OTP is expired
const isOTPExpired=(expiryTime)=> {
  return moment().isAfter(expiryTime);
}

export const registerAdmin = async (req, res) => {
  try {
    const { fullName, phoneNumber, email, password } = req.body;

    const existingAdmin = await Admin.findOne({
      where: { email }
    });

    if (existingAdmin) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const admin = await Admin.create({
      fullName,
      phoneNumber,
      email,
      password,
    });

    const adminData = admin.toJSON();
    delete adminData.password;

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: adminData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const registerClient = async (req, res) => {
  try {
    const { fullName, phoneNumber, email, password, role } = req.body;

    const existingClient = await Client.findOne({
      where: { email }
    });

    if (existingClient) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const client = await Client.create({
      fullName,
      phoneNumber,
      email,
      password,
      role: role || 'owner',
      postLimit: 2
    });

    const token = generateToken({
      id: client.id,
      email: client.email,
      type: 'client',
      role: client.role
    });

    const clientData = client.toJSON();
    delete clientData.password;

    res.status(201).json({
      message: 'Client registered successfully',
      token,
      client: clientData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login with phone OTP
export const loginWithPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, "");

    // ✅ DEMO ACCOUNT BYPASS
    if (cleanPhone === DEMO_PHONE) {
      let user = await Client.findOne({
        where: { phoneNumber: cleanPhone },
      });

      // Create demo user if not exists
      if (!user) {
        user = await Client.create({
          phoneNumber: cleanPhone,
          is_verified: true,
        });
      }

      return res.json({
        success: true,
        message: "Demo OTP ready",
        phone: cleanPhone,
        otp: DEMO_OTP,
        isNewUser: false,
        expires_at: "2099-12-31T23:59:59Z",
        // ❗ Do NOT send OTP in production
      });
    }

    // 🔹 Normal User Flow

    let user = await Client.findOne({
      where: { phoneNumber: cleanPhone },
    });

    let isNewUser = false;

    // Create user if not exists
    if (!user) {
      user = await Client.create({
        phoneNumber: cleanPhone,
        is_verified: false,
      });

      isNewUser = true;
    }
    // Check if account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Generate OTP
    const otpResult = await generateOTP(cleanPhone);

    if (!otpResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate OTP",
      });
    }

    return res.json({
      success: true,
      message: "OTP sent to your phone",
      phone: cleanPhone,
      isNewUser,
      otp: otpResult.otp, // ⚠️ DEV ONLY
      expires_at: otpResult.expires_at,
    });
  } catch (error) {
    console.error("Phone login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Verify phone OTP login
export const verifyPhoneLogin = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required",
      });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, "");

    // ✅ DEMO ACCOUNT OTP BYPASS
    if (cleanPhone === DEMO_PHONE && otp === DEMO_OTP) {
      let user = await Client.findOne({
        where: { phoneNumber: cleanPhone },
      });

      // Create demo user if not exists
      if (!user) {
        user = await Client.create({
          phoneNumber: cleanPhone,
          is_verified: true,
        });
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        type: "client",
        role: user.role,
      });

      return res.json({
        success: true,
        message: "Demo login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phoneNumber,
          full_name: user.fullName,
          role: user.role,
          is_verified: user.is_verified,
          profilePic: user.profilePic,
        },
      });
    }

    // Verify OTP
    const result = await verifyOTP(cleanPhone, otp);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // Get user
    const user = await Client.findOne({
      where: { phoneNumber: cleanPhone },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      type: "client",
      role: user.role,
    });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phoneNumber,
        full_name: user.fullName,
        role: user.role,
        is_verified: user.is_verified,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("Phone login verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

  // Resend OTP
  export const resendOTP=async (req, res)=> {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
      }
      
      // Clean phone number
      const cleanPhone = phone.replace(/\D/g, '');
      
      // Check if user exists
      const user = await Client.findOne({  where: { phoneNumber: cleanPhone } });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Generate OTP
      const result = await resendClientOTP(cleanPhone);
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json({
        success: true,
        message: 'New OTP sent to your phone',
        phone: cleanPhone,
        otp: result.otp, // Include OTP in development
        expires_at: result.expires_at
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

export const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find client by email
    const client = await Client.findOne({ where: { email } });

    if (!client) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await client.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check account status
    if (client.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Generate JWT token
    const token = generateToken({
      id: client.id,
      email: client.email,
      type: 'client',
      role: client.role
    });

    // Clean up client data
    const clientData = client.toJSON();
    delete clientData.password;

    // ✅ Always return after sending a response
    return res.status(200).json({
      message: 'Login successful',
      token,
      client: clientData
    });

  } catch (error) {
    console.error('Login error:', error);

    // ✅ Return ensures no further execution after error response
    return res.status(500).json({
      error: 'Something went wrong while logging in',
      details: error.message
    });
  }
};


export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await admin.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      type: 'admin'
    });

    const adminData = admin.toJSON();
    delete adminData.password;

    res.json({
      message: 'Admin login successful',
      token,
      admin: adminData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

package com.livemart.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    public void sendOTPEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("noreply.livemart@gmail.com");
            helper.setTo(toEmail);
            helper.setSubject("Live MART - Email Verification OTP");
            
            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 32px; }
                        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
                        .content { padding: 40px 30px; }
                        .content h2 { color: #333; margin-top: 0; }
                        .content p { color: #666; line-height: 1.6; font-size: 15px; }
                        .otp-box { background: #f8f9fa; border: 3px dashed #667eea; padding: 30px; margin: 30px 0; text-align: center; border-radius: 10px; }
                        .otp-label { color: #666; font-size: 14px; margin-bottom: 10px; }
                        .otp-code { font-size: 42px; font-weight: bold; color: #667eea; letter-spacing: 10px; font-family: 'Courier New', monospace; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
                        .warning p { margin: 5px 0; color: #856404; font-size: 14px; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }
                        .footer p { margin: 5px 0; }
                        ul { padding-left: 20px; }
                        ul li { color: #666; margin: 8px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🛒 Live MART</h1>
                            <p>Email Verification</p>
                        </div>
                        <div class="content">
                            <h2>Welcome to Live MART!</h2>
                            <p>Thank you for registering with us. To complete your registration and verify your email address, please use the One-Time Password (OTP) below:</p>
                            
                            <div class="otp-box">
                                <div class="otp-label">Your OTP Code:</div>
                                <div class="otp-code">""" + otp + """
                                </div>
                            </div>
                            
                            <div class="warning">
                                <p><strong>⚠️ Important Security Information:</strong></p>
                                <ul style="margin: 10px 0;">
                                    <li>This OTP is valid for <strong>10 minutes only</strong></li>
                                    <li>Never share this code with anyone, including Live MART staff</li>
                                    <li>If you didn't request this verification, please ignore this email</li>
                                </ul>
                            </div>
                            
                            <p>Once verified, you'll be able to:</p>
                            <ul>
                                <li>Browse thousands of products</li>
                                <li>Place orders with fast delivery</li>
                                <li>Track your orders in real-time</li>
                                <li>Enjoy exclusive deals and offers</li>
                            </ul>
                            
                            <p style="margin-top: 30px;">Best regards,<br><strong>The Live MART Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>&copy; 2025 Live MART. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """;
            
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            System.out.println("✅ OTP Email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP email to " + toEmail);
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send OTP email. Please check your email configuration.");
        }
    }
    
    public void sendWelcomeEmail(String toEmail, String userName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("noreply.livemart@gmail.com");
            helper.setTo(toEmail);
            helper.setSubject("🎉 Welcome to Live MART!");
            
            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 32px; }
                        .content { padding: 40px 30px; }
                        .content h2 { color: #333; margin-top: 0; }
                        .content p { color: #666; line-height: 1.6; font-size: 15px; }
                        .button { display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                        .features { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .features ul { padding-left: 20px; margin: 10px 0; }
                        .features li { color: #666; margin: 10px 0; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Welcome to Live MART!</h1>
                        </div>
                        <div class="content">
                            <h2>Hi """ + userName + """
                            ,</h2>
                            <p>Congratulations! Your account has been successfully verified. Welcome to the Live MART family!</p>
                            
                            <div class="features">
                                <p><strong>What you can do now:</strong></p>
                                <ul>
                                    <li>✅ Browse thousands of quality products</li>
                                    <li>🚚 Place orders with fast home delivery</li>
                                    <li>📦 Track your orders in real-time</li>
                                    <li>💰 Enjoy exclusive deals and offers</li>
                                    <li>⭐ Rate and review products</li>
                                </ul>
                            </div>
                            
                            <p style="text-align: center; margin: 30px 0;">
                                <a href="http://localhost:8080/login" class="button">Start Shopping Now →</a>
                            </p>
                            
                            <p>We're excited to serve you and make your shopping experience amazing!</p>
                            <p style="margin-top: 30px;">Best regards,<br><strong>The Live MART Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>Need help? Contact us at support@livemart.com</p>
                            <p>&copy; 2025 Live MART. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """;
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("✅ Welcome email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send welcome email (non-critical): " + e.getMessage());
            // Don't throw exception for welcome email - it's not critical
        }
    }
}

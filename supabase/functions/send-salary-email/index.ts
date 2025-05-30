import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import sgMail from 'npm:@sendgrid/mail';

serve(async (req) => {
  try {
    const { email, name, month, year, amount } = await req.json();
    
    // Initialize SendGrid with your API key
    sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY') || '');

    const msg = {
      to: email,
      from: 'austin@relevant-research.com', // Replace with your verified sender
      subject: 'Salary Payment Notification',
      text: `Dear ${name},\n\nYour salary for ${month} ${year} has been processed. Amount: $${amount}\n\nBest regards,\nHR Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Salary Payment Notification</h2>
          <p>Dear ${name},</p>
          <p>Your salary for ${month} ${year} has been processed.</p>
          <p style="font-size: 18px; font-weight: bold;">Amount: $${amount}</p>
          <p>Best regards,<br>HR Team</p>
        </div>
      `,
    };

    await sgMail.send(msg);

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
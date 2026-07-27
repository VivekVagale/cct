# Formspree Setup Instructions

To enable email submissions for the booking form, follow these steps:

## 1. Create a Formspree Account
- Visit https://formspree.io
- Sign up with your email or log in

## 2. Create a New Form
- Click "Create Form" or "New Form"
- Choose a name (e.g., "Cold Chain Theory Bookings")
- Select your email address to receive submissions

## 3. Get Your Form ID
- After creating the form, you'll see a form ID in the format: `f/xxxxxxxxxx`
- Copy this ID

## 4. Update the Booking Form
- Open `client/src/components/BookingSection.tsx`
- Find the line: `const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {`
- Replace `YOUR_FORM_ID` with your actual Formspree ID
- Example: `https://formspree.io/f/f1a2b3c4d5e6f7g8`

## 5. Test the Form
- Visit your website
- Fill out the booking form
- Click "Send Project Inquiry"
- Check your email for the submission

## Optional: Configure Formspree Settings
- Add custom redirect URL after form submission
- Set up email notifications
- Add custom fields if needed

For more help, visit: https://formspree.io/help

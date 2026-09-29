# E-LMIS

Responsive React implementation of the Ethiopian Labor Market Information System landing page, built with Vite.

## Getting started

```bash
npm install
npm run dev
```

## Structure

```text
src/
  assets/                 Images extracted from the original page
  components/landing/     Page sections and applicant directory
  data/                   Applicant sample data
  hooks/                   Landing page interactions
  pages/                   Home page composition
  styles/                  Landing page styles
  App.jsx
  main.jsx
```

## Registration uploads and Firestore

The Firebase web configuration and shared SDK instances are in `src/lib/firebase.js`. A completed signup creates an Email/Password Firebase Authentication account, uploads the profile photo and documents to Cloudinary, then creates an `applications/{id}` Firestore document. Applicant data is grouped into `personalInformation`, `address`, `contact`, `jobPreferences`, `salaryBenefits`, and `documents`. Each uploaded file record stores its secure Cloudinary URL, public ID, original filename, content type, and size.

Set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` in `.env.local` and create an unsigned upload preset restricted to the accepted file types and size. Copy `.env.example` to `.env.local`, fill both values from Cloudinary, then restart Vite. Never put the Cloudinary API secret in a `VITE_` variable or frontend code. Registration document uploads require these settings.

Enable Email/Password Authentication and create the Firestore database in the Firebase console. Deploy the Firestore rules to the configured project:

```bash
firebase deploy --project e-lmis-b416e --only firestore:rules
```

The rules allow an applicant to create/read their own application. Staff access requires the Firebase Auth custom claim `admin: true`; assign that claim from a trusted Admin SDK environment. The current OTP screen is still a mock and does not send or verify a real SMS code.

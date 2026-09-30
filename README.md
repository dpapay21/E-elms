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

Cloudinary settings are in the ignored `.env.local` file. For a new environment, copy `.env.example` to `.env.local` and set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`, then restart Vite. The preset must allow unsigned uploads and accept JPG, PNG, and PDF files up to 10 MB. Never put the Cloudinary API secret in a `VITE_` variable or frontend code.

Enable Email/Password Authentication and create the Firestore database in the Firebase console. Deploy the Firestore rules to the configured project:

```bash
firebase deploy --project e-lmis-b416e --only firestore:rules
```

Applicants can create and read their own application. Admin access uses a manually managed Firestore allowlist document, and admin accounts authenticate through Firebase Authentication. To set up the admin user:

1. In Firebase Console for `e-lmis-b416e`, create the user `deksiman721@gmail.com` under **Authentication → Users**. The main login form uses the email and password; successful sign-in routes to the protected admin area. The direct `/admin` sign-in also accepts email or phone alias `0960625242`. Set the password in Firebase Authentication; do not store it in Firestore or frontend code.
2. Copy that user's Firebase Auth UID. In **Firestore Database → Data**, create an `admins` collection and a document whose document ID is that UID. Add `enabled` as a boolean `true` and `email` as the user's email.
3. Publish the updated `firestore.rules` from this repository in **Firestore Database → Rules**.

Sign in with the admin email and password to open the protected dashboard; you can also go directly to `/admin`. New registrations appear as `submitted`. Accepting one updates its status and writes a limited public profile to `publicApplicants`, which feeds the landing page's applicant section. Rejecting one marks it `rejected` and removes its public profile. Private application details and Cloudinary document URLs stay in `applications` for admin review and applicant access.

The OTP screen is still a mock and does not send or verify a real SMS code.

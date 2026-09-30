import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase.js";

export function watchApplications(onData, onError) {
  return onSnapshot(
    collection(db, "applications"),
    (snapshot) => {
      const applications = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      applications.sort((left, right) => {
        const leftTime = left.createdAt?.toMillis?.() || 0;
        const rightTime = right.createdAt?.toMillis?.() || 0;
        return rightTime - leftTime;
      });
      onData(applications);
    },
    onError,
  );
}

function toPublicApplicant(application, id) {
  const personal = application.personalInformation || {};
  const preferences = application.jobPreferences || {};
  const salary = application.salaryBenefits || {};
  const photoUrl = application.documents?.profilePhoto?.url || '';
  const name = [personal.firstName, personal.middleName, personal.lastName].filter(Boolean).join(" ").trim();

  return {
    name: name || "Applicant",
    job: preferences.jobTitle || "Not specified",
    country: preferences.targetCountries?.[0] || "Not specified",
    pay: Number(salary.monthlySalary) || 0,
    photoUrl,
    status: "accepted",
    reference: id,
    reviewedAt: serverTimestamp(),
  };
}

export async function syncApprovedApplicantPhotos(applications) {
  if (!auth.currentUser) return;
  const approved = applications.filter((application) =>
    application.status === "accepted" && application.documents?.profilePhoto?.url,
  );
  await Promise.all(approved.map(async (application) => {
    const applicantRef = doc(db, "publicApplicants", application.id);
    const current = await getDoc(applicantRef);
    const photoUrl = application.documents.profilePhoto.url;
    if (current.exists()) {
      if (current.data().photoUrl !== photoUrl) await setDoc(applicantRef, { photoUrl }, { merge: true });
      return;
    }
    await setDoc(applicantRef, toPublicApplicant(application, application.id));
  }));
}

export async function decideApplication(application, decision) {
  if (!auth.currentUser) throw new Error("Your admin session has expired. Sign in again.");
  if (!['accepted', 'rejected'].includes(decision)) throw new Error("Choose accept or reject.");

  const batch = writeBatch(db);
  const applicationRef = doc(db, "applications", application.id);
  const publicApplicantRef = doc(db, "publicApplicants", application.id);
  batch.update(applicationRef, {
    status: decision,
    reviewedBy: auth.currentUser.uid,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (decision === "accepted") {
    batch.set(publicApplicantRef, toPublicApplicant(application, application.id));
  } else {
    batch.delete(publicApplicantRef);
  }

  await batch.commit();
}

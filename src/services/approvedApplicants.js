import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase.js";

export function watchApprovedApplicants(onData, onError) {
  return onSnapshot(
    query(collection(db, "publicApplicants"), where("status", "==", "accepted")),
    (snapshot) => {
      const applicants = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      applicants.sort((left, right) => {
        const leftTime = left.reviewedAt?.toMillis?.() || 0;
        const rightTime = right.reviewedAt?.toMillis?.() || 0;
        return rightTime - leftTime;
      });
      onData(applicants.map((applicant) => ({
        ...applicant,
        placed: applicant.reviewedAt?.toDate?.().toLocaleDateString() || "Recently approved",
      })));
    },
    onError,
  );
}

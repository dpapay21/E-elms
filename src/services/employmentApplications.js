import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase.js";
import { ACCEPTED_UPLOAD_TYPES, MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_LABEL } from "../constants/uploads.js";
const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() || "dwfz6c6x0";
const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() || "my_app_emlis";

async function uploadApplicationFile(file, applicationId, group) {
  if (!file) return null;
  if (!ACCEPTED_UPLOAD_TYPES.has(file.type) || file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error(`${file.name} must be a JPG, PNG, or PDF no larger than ${MAX_UPLOAD_SIZE_LABEL}.`);
  }

  if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
    throw new Error("Cloudinary upload is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryUploadPreset);
  formData.append("folder", `applications/${applicationId}/${group}`);
  let response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudinaryCloudName)}/auto/upload`, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error?.message || "network error"}`);
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.secure_url || !result.public_id) {
    throw new Error(`Cloudinary upload failed: ${result.error?.message || "the upload service rejected the file"}`);
  }
  return {
    provider: "cloudinary",
    url: result.secure_url,
    publicId: result.public_id,
    fileName: file.name,
    contentType: file.type,
    size: file.size,
  };
}

/** Uploads applicant documents, then writes the completed application to Firestore. */
export async function submitEmploymentApplication(registration) {
  const user = auth.currentUser;
  if (!user) throw new Error("Your account session expired. Please sign in again.");

  const { documents = {}, workStatus, ...values } = registration;
  const applicationRef = doc(collection(db, "applications"));
  const files = [
      { file: documents.photo, group: "profile" },
      { file: documents.addressDocument, group: "address" },
      { file: documents.idFront, group: "identity" },
      { file: documents.idBack, group: "identity" },
      ...(documents.educationCertificates || []).map((file) => ({ file, group: "education" })),
  ];
  const results = await Promise.all(files.map(({ file, group }) =>
      uploadApplicationFile(file, applicationRef.id, group)
  ));
  const [profilePhoto, addressDocument, idFront, idBack, ...educationCertificates] = results;

  const application = {
      ownerUid: user.uid,
      ownerEmail: user.email || values.email || "",
      status: "submitted",
      workStatus: workStatus || "",
      personalInformation: {
        firstName: values.firstName || "",
        middleName: values.middleName || "",
        lastName: values.lastName || "",
        amSom: values.amSom || "",
        amFatherName: values.amFatherName || "",
        amGrandfatherName: values.amGrandfatherName || "",
        gender: values.gender || "",
        birthDate: values.birthDate || "",
        maritalStatus: values.maritalStatus || "",
        disability: values.disability || "",
        nationality: values.nationality || "",
        workingHours: values.workingHours || "",
        civilServant: Boolean(values.civilServant),
      },
      address: {
        region: values.region || "",
        city: values.city || "",
        kebele: values.kebele || "",
        houseNumber: values.houseNumber || "",
        residence: values.residence || "",
      },
      contact: {
        phoneNumber: values.phoneNumber || "",
        email: values.email || user.email || "",
        poBox: values.poBox || "",
      },
      jobPreferences: {
        jobTitle: values.jobTitle || "",
        targetCountries: values.targetCountries || [],
        cities: Object.fromEntries((values.targetCountries || []).map((country) => [country, values[`city_${country}`] || ""])),
        contractType: values.contractType || "",
        contractLength: values.contractLength || "",
        workingHoursPerWeek: values.jobWorkingHours || "",
      },
      salaryBenefits: {
        monthlySalary: values.monthlySalary || "",
        workingHoursPerWeek: values.salaryHours || "",
        accommodation: values.accommodation || "",
        transport: values.transport || "",
        food: values.food || "",
      },
      documents: { profilePhoto, addressDocument, idFront, idBack, educationCertificates },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
  };

  await setDoc(applicationRef, application);
  return { id: applicationRef.id };
}

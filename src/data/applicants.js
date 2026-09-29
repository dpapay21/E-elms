const source = [
  ['Abel Tesfaye Kebede', 'Mason', 'Qatar', 3500], ['Selamawit Girma', 'Nurse Assistant', 'Saudi Arabia', 2900],
  ['Dawit Bekele', 'Security Guard', 'Canada', 3500], ['Hiwot Mengistu', 'Housekeeper', 'UAE', 1800],
  ['Yared Solomon', 'Electrician', 'Qatar', 3200], ['Bethlehem Assefa', 'Sales Representative', 'Canada', 4500],
  ['Kalkidan Wolde', 'Laundry Attendant', 'Canada', 3300], ['Mulugeta Haile', 'Driver', 'Kuwait', 2200],
  ['Tigist Alemayehu', 'Housekeeper', 'Canada', 2700], ['Fitsum Negash', 'Welder', 'Oman', 2600],
  ['Rediet Abera', 'Cashier', 'UAE', 2100], ['Samuel Getachew', 'Plumber', 'Qatar', 3000],
  ['Liya Tadesse', 'Caregiver', 'Canada', 3600], ['Nahom Desta', 'Cook', 'Saudi Arabia', 2400],
  ['Eden Yohannes', 'Hotel Receptionist', 'UAE', 2500], ['Biniyam Lemma', 'Carpenter', 'Qatar', 2900],
  ['Marta Demissie', 'Tailor', 'Kuwait', 1900], ['Robel Gebre', 'Forklift Operator', 'Bahrain', 2700],
  ['Saron Belay', 'Cleaner', 'Oman', 1700], ['Henok Tsegaye', 'Painter', 'Saudi Arabia', 2300],
  ['Aster Kidane', 'Kitchen Assistant', 'Canada', 3100], ['Yonatan Worku', 'Mechanic', 'UAE', 3400],
  ['Zewditu Mamo', 'Nurse', 'Saudi Arabia', 4200], ['Amanuel Tilahun', 'Farm Worker', 'Canada', 3000],
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const applicants = source.map(([name, job, country, pay], id) => {
  const date = 2026 * 12 + 8 - Math.floor(id / 3);
  return {
    id, name, job, country, pay,
    placed: `${months[date % 12]} ${Math.floor(date / 12)}`,
    reference: `LMIS-${2400 - id}`,
  };
});

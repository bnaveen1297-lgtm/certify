import type { Participant } from "./csv-fields"

export const MOCK_PARTICIPANTS: Participant[] = [
  { title: "Mr.", name: "Arjun Kumar", gender: "Male", affiliation: "Sairam Matric Hr. Sec. School, Thiruvarur", points: "9.5", rounds: "11", position: "1st", category: "Open" },
  { title: "Ms.", name: "Priya Sharma", gender: "Female", affiliation: "Delhi Public School, Chennai", points: "9", rounds: "11", position: "2nd", category: "Open" },
  { title: "Master", name: "Ravi Shankar", gender: "Male", affiliation: "Brilliant Star H.S. School", points: "8.5", rounds: "11", position: "3rd", category: "Open" },
  { title: "Ms.", name: "Sneha Reddy", gender: "Female", affiliation: "Kendriya Vidyalaya, Hyderabad", points: "8", rounds: "11", position: "1st", category: "Under-18 Girls" },
  { title: "Mr.", name: "Vikram Singh", gender: "Male", affiliation: "St. Joseph's School, Mumbai", points: "8", rounds: "11", position: "4th", category: "Open" },
  { title: "Master", name: "Anand Krishnan", gender: "Male", affiliation: "Chess Academy, Kochi", points: "7.5", rounds: "11", position: "5th", category: "Open" },
  { title: "Ms.", name: "Kavitha Nair", gender: "Female", affiliation: "Holy Cross School, Trichy", points: "7.5", rounds: "11", position: "2nd", category: "Under-18 Girls" },
  { title: "Mr.", name: "Meetansh Dixit", gender: "Male", affiliation: "AGCA Chess Academy", points: "9.5", rounds: "11", position: "1st", category: "Main" },
  { title: "Mr.", name: "Gajendra Singh", gender: "Male", affiliation: "City Chess Club, Chhindwara", points: "9.5", rounds: "11", position: "2nd", category: "Main" },
  { title: "Mr.", name: "Nikhil Jain", gender: "Male", affiliation: "Gujarat State Chess Association", points: "7", rounds: "9", position: "3rd", category: "Open" },
  { title: "Selvi", name: "S. Shakthipriya", gender: "Female", affiliation: "Sairam Matric Hr. Sec. School, Thiruvarur", points: "4", rounds: "4", position: "5th", category: "Under-18 Girls" },
  { title: "Mr.", name: "Rajesh Patel", gender: "Male", affiliation: "Lions Club Chess Academy, Gujarat", points: "6.5", rounds: "9", position: "6th", category: "Open" },
  { title: "Ms.", name: "Deepa Lakshmi", gender: "Female", affiliation: "Tamil Nadu State Chess Assoc.", points: "7", rounds: "11", position: "3rd", category: "Under-18 Girls" },
  { title: "Master", name: "Siddharth Menon", gender: "Male", affiliation: "Kerala Chess Club", points: "6", rounds: "11", position: "7th", category: "Open" },
  { title: "Mr.", name: "Abhishek Rao", gender: "Male", affiliation: "Karnataka State Chess Assoc.", points: "5.5", rounds: "11", position: "8th", category: "Open" },
  { title: "Ms.", name: "Pooja Gupta", gender: "Female", affiliation: "DAV Public School, Delhi", points: "5", rounds: "11", position: "4th", category: "Under-14 Girls" },
  { title: "Master", name: "Karthik Raman", gender: "Male", affiliation: "Coimbatore Chess Academy", points: "5", rounds: "11", position: "9th", category: "Open" },
  { title: "Mr.", name: "Suresh Kumar", gender: "Male", affiliation: "Madurai Chess Club", points: "4.5", rounds: "11", position: "10th", category: "Open" },
  { title: "Ms.", name: "Aarti Mishra", gender: "Female", affiliation: "MP State Chess Association", points: "4", rounds: "11", position: "5th", category: "Under-14 Girls" },
  { title: "Master", name: "Dev Prasad", gender: "Male", affiliation: "FIDE Chess School, Bangalore", points: "3.5", rounds: "11", position: "1st", category: "Under-10 Boys" },
]

export const MOCK_EVENT = {
  tournamentName: "1st AGCA International FIDE Rated Classical Chess Tournament 2025",
  venue: "Olympic Stadium, Chhindwara, M.P.",
  startDate: "15/01/2025",
  endDate: "20/01/2025",
  isSingleDay: false,
  totalRounds: "11",
}

export const SAMPLE_CSV = `Title,Name,Gender,School/Club/Affiliation,Points,Rounds,Position,Category
Mr.,Arjun Kumar,Male,"Sairam Matric Hr. Sec. School, Thiruvarur",9.5,11,1st,Open
Ms.,Priya Sharma,Female,"Delhi Public School, Chennai",9,11,2nd,Open
Master,Ravi Shankar,Male,Brilliant Star H.S. School,8.5,11,3rd,Open
Ms.,Sneha Reddy,Female,"Kendriya Vidyalaya, Hyderabad",8,11,1st,Under-18 Girls
Mr.,Vikram Singh,Male,"St. Joseph's School, Mumbai",8,11,4th,Open`

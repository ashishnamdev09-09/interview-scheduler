export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Interview {
  id: number;
  title: string;
  description: string;
  scheduledTime: string;
  interviewerId: number;
  intervieweeId: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  interviewer?: User;
  interviewee?: User;
  googleMeet?: GoogleMeet;
}

export interface GoogleMeet {
  id: number;
  meetLink: string;
  scheduledTime: string;
  interviewId: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

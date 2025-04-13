export interface User {
  id?: number;
  username: string;
  email: string;
}

export interface Interview {
  id?: number;
  interviewer: User;
  interviewee: User;
  title?: string;
  description?: string;
  dateTime: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  googleMeetLink?: string;
}

export interface GoogleMeet {
  id?: number;
  interviewId: number;
  meetLink: string;
  joinCode?: string;
}

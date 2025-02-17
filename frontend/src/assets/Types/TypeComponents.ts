 export interface userType {
     username: string
     password: string
 }

 export interface taskType {
     id: number
     name: string
     description: string
     board_id: number
 }

 export interface LoginPageProps {
     login: () => void;
 }

 export interface HomePageProps {
     logout: () => void;
 }
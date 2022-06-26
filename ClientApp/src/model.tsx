export enum Roles {
    CRE = 1,
    Student = 2,
    CR = 3
}
export interface ResponeData {
    error: number;
    message: string;
}
export interface User {
    username: string;
    fullName: string;
    email: string;
    roleName: string;
    roleID: number;
}
export interface Student extends User {
    studentID: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    phone: string;
    major: string;
    fieldName: string;
    cV_URL: string;
    ojtStatus: boolean;
    username:string;
}
export interface Company {
    companyID: number;
    companyName: string;
    address: string;
    phone: string;
    email: string
    webSite: string;
    careerField: Field[];
    fieldName: number;
    introduction: string;
    description: string;
    imageURL: string
    activeStatus: boolean;
    applyPosition: string;
}
export interface Field {
    fieldID: number;
    fieldName: string;
}
export interface Request {
    changeDate: Date;
    companyID: string;
    crE_ID:number;
    createDate: string;
    processNote: string;
    purpose: string;
    requestID: number;
    requestStatus: number;
    requestTitle: string;
    requestType: number;
    statusName: string;
    studentID: string;
    fullName:string;
    companyName:string;
}
export interface Recruitment
{
    studentID: string;
    fullName:string;
    termNumber:number;
    companyID:number;
    companyName:string,
    recruitmentStatus:number;
    statusName:string
}
export interface Report {
    termNumber: number;
    termName: string;
    studentID: string;
    fullName: string;
    companyID: number;
    companyName: string;
    cR_ID: number;
    evaluate: string;
    attendance:number;
    attitude:number;
    grade: number;
}
export interface Term
{
    termNumber:number;
    termName:string;
    startDate:string;
    endDate:string;
    requestDueDate:string;
    termStatus:boolean;
}
export interface StudentGradeInput extends Student {
    attendance?: number;
    attitude?: number;
    grade?: number;
}
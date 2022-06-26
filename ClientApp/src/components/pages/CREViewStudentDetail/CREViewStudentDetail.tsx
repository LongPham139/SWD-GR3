import './CREViewStudentDetail.css';
import React, { FC, Component, useEffect, useState } from 'react'
import { NavLink, RouteComponentProps, useHistory } from 'react-router-dom';
import { Report, ResponeData, Student, StudentGradeInput } from '../../../model';
interface Props extends RouteComponentProps<{ id: string }> {

}
const CREViewStudentDetail: FC<Props> = props => {
    const [student, setStudent] = useState<Student>();
    const [report, setReport] = useState<Report>();
    useEffect(() => {
        fetch('/api/cre/students/profile/' + props.match.params.id).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData & { student: Student, result: Report }>).then(data => {
                    console.log(data);
                    if (data.error == 0) {
                        setStudent(data.student);
                        setReport(data.result);
                    }
                });
            }
        })
    }, [props.match.params.id]);
    return (
        <div id='CREViewStudentDetail'>
            <div id="content">
                <div className="row">
                    <div className="student-personal">
                        <h3 className="student-personal-name">{student?.fullName}</h3>
                        <div className="student-personal-avt">
                            <img src="images/blankAvt.jpg" alt="student's avatar" />
                        </div>
                        <div className="m-24">
                            <div className="row-student student-personal-info">
                                <p>Birth</p>
                                <p>{new Date(student?.dateOfBirth as string).toDateString()}</p>
                            </div>
                            <div className="row-student student-personal-info">
                                <p>CV</p>
                                <p><a className="student-personal-cv" href={'/api/cre/student/cv/' + student?.studentID} download>Click here to get CV</a></p>
                            </div>
                        </div>
                    </div>
                    <div className="student-description">
                        <h3 className="student-description-heading">student information</h3>
                        <div className="student-description-body">
                            <div className="row-student">
                                <div className="col-four-title">
                                    Full Name
                                </div>
                                <div className="col-four-content col-left">{student?.fullName}</div>
                                <div className="col-four-title col-right">Gender</div>
                                <div className="col-four-content">{student?.gender}</div>
                            </div>
                            <div className="row-student">
                                <div className="col-four-title">
                                    Roll Number
                                </div>
                                <div className="col-four-content col-left">{student?.studentID}</div>
                                <div className="col-four-title col-right">Major</div>
                                <div className="col-four-content">{student?.fieldName}</div>
                            </div>
                            <div className="about">
                                <span>Email</span>
                                <div className="student-detail-about">{student?.email}</div>
                            </div>
                            <div className="about">
                                <span>Address</span>
                                <div className="student-detail-about">{student?.address}</div>
                            </div>
                            <div className="clear">
                                <div className="col-haft phone">
                                    <span>Phone</span>
                                    <div className="student-detail-about">{student?.phone}</div>
                                </div>
                                <p className="col-haft company-name">
                                {
                                    (() => {
                                        const total = report?.attendance as number + (report?.attitude as number) + (report?.grade as number);
                                        if (report?.companyName == null) {
                                            return 'Student haven\'t go to OJT yet';
                                        }
                                        else {
                                            if (report.attendance != null && report.attitude != null && report.grade != null) {
                                                if (total < 150) {
                                                    return [<span style={{ color: '#D14848' }}>Failed <span></span></span>,<span>OJT at {report.companyName}</span>] 
                                                }
                                                else
                                                {
                                                    return [<span style={{ color: '#62AA7A' }}>Passed <span></span></span>,<span> OJT at {report.companyName}</span>] 
                                                }
                                            }
                                            return 'Are going to OJT at ' + report?.companyName;
                                        }
                                    })()
                                }
                                </p>
                            </div>
                            <div className="clear">
                                <div className="grade">
                                    <span>Attendance</span>
                                    <p>{report?.attendance}</p>
                                </div>
                                <div className="grade">
                                    <span>Attitude</span>
                                    <p>{report?.attitude}</p>
                                </div>
                                <div className="grade">
                                    <span>Progress</span>
                                    <p>{report?.grade}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CREViewStudentDetail

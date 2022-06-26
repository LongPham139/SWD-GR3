import './CRViewStudentDetail.css';
import React, { FC, useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom';
import { Report, ResponeData, Student } from '../../../model';
interface Props extends RouteComponentProps<{ id: string }> {

}
const CRViewStudentDetail: FC<Props> = props => {
    const [student, setStudent] = useState<Student>();
    const [report, setReport] = useState<Report>();
    useEffect(() => {
        fetch('/api/cr/students/profile/' + props.match.params.id).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData & { student: Student, report: Report }>).then(data => {
                    if (data.error == 0) {
                        setStudent(data.student);
                        setReport(data.report);
                    }
                });
            }
        })

    }, []);
    return (
        <div id='CRViewStudentDetail'>
            <div id="content">
                <div className="row-student">
                    <div className="student-personal body-color">
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
                                <p><a className="student-personal-cv" href={'/api/cr/student/cv/' + student?.studentID} download>Click here to get CV</a></p>
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
                                <div className="col-four-title pl-40">Gender</div>
                                <div className="col-four-content">{student?.gender}</div>
                            </div>
                            <div className="row-student">
                                <div className="col-four-title">
                                    Roll Number
                                </div>
                                <div className="col-four-content col-left">{student?.studentID}</div>
                                <div className="col-four-title pl-40">Major</div>
                                <div className="col-four-content">{student?.fieldName}</div>
                            </div>
                            <div className="about">
                                <span>Email</span>
                                <div className="student-detail-about">{student?.email}</div>
                            </div>
                            <div className="about">
                                <span>Address</span>
                                <p className="student-detail-about">{student?.address}</p>
                            </div>
                            <div className="clear">
                                <div className="col-haft phone">
                                    <span>Phone</span>
                                    <div className="student-detail-about">{student?.phone}</div>
                                </div>
                                <p className="col-haft company-name">
                                    {
                                        (() => {
                                            const attendance = (report?.attendance as number), attitude = (report?.attitude as number), grade = (report?.grade as number);
                                            const total = attendance + attitude + grade;
                                            if (report?.attendance == null || report?.attitude == null || report?.grade == null) {
                                                return <td style={{ color: '#0066B2', textAlign: 'center' }}>Not graded</td>;
                                            }
                                            if (total < 150) {
                                                return <td style={{ color: '#D14848' }}>Failed</td>;
                                            }
                                            if (total >= 150) {
                                                if (attendance > 0 && attitude > 0 && grade > 0) {
                                                    return <td style={{ color: '#227818' }}>Passed</td>;
                                                }
                                                return <td style={{ color: '#D14848' }}>Failed</td>;
                                            }
                                        }
                                        )()
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

export default CRViewStudentDetail

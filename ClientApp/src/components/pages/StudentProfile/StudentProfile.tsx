import './StudentProfile.css';
import React, { FC, FormEvent, useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom';
import { Report, ResponeData, Student, User } from '../../../model';
import MessageBox from '../../modules/popups/MessageBox/MessageBox';
interface Props extends RouteComponentProps {
}
const StudentProfile: FC<Props> = props => {
    const [student, setStudent] = useState<Student>();
    const [report, setReport] = useState<Report>();
    const [message, setMessage] = useState('');
    const updateProfileSubmit = (e: FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        fetch('/api/student/profile/update',
            {
                method: "POST",
                body: formData
            }).then(res => {
                if (res.ok) {
                    (res.json() as Promise<ResponeData>).then(data => {
                        if (data.error == 0) {
                            setMessage('Profile has been updated');
                        }
                        else {
                            setMessage(data.message);
                        }
                    });
                }
                else {
                    setMessage('Some thing when wrong, please try again');
                }
            })
    }
    const getDateFormated = (date: string) => {
        const sa = new Date(date).toISOString().substr(0, 10);
        return sa;
    }
    useEffect(() => {
        fetch('/api/student/profile').then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData & { student: Student, result: Report }>).then(data => {
                    if (data.error == 0) {
                        setStudent(data.student);
                        setReport(data.result);
                    }
                });
            }
        });
    }, []);


    return (
        <div id='StudentProfile'>
            {
                message != '' ?
                    <MessageBox message={message} setMessage={setMessage} title={"Information"}></MessageBox>
                    :
                    null
            }
            <div id="content">
                <form onSubmit={updateProfileSubmit}>

                    <div className="student-profile">
                        <div className="student-avt col-left-student">
                            <img src="images/blankAvt.jpg" alt="student avatar" />
                        </div>
                        <div className="student-profile-info col-right">
                            <div className="row-student-profile">
                                <span>Full name</span>
                                <input className="col-info" name='fullname' pattern={'[^\\d!@#$%^&*()_+-=]*$'} required defaultValue={student?.fullName}></input>
                            </div>
                            <div className="row-student-profile">
                                <span>Student ID</span>
                                <div className="col-id">{student?.studentID}</div>
                            </div>
                            <div className="row-student-profile">
                                <div className="col-haft"><a href='/api/student/profile/cv' download>Click here to show CV</a></div>
                            </div>
                            <div className="line">
                                <div className="line-title"><i className="fas fa-user"></i> About</div>
                            </div>
                        </div>
                    </div>
                    <div className="student-detail">
                        <div className="student-work col-left-student">
                            <div className="divide">
                                <div className="divide-name">Work</div>
                                <div className="divide-line"></div>
                            </div>
                            <div className="work-title">Training industry</div>
                            <div className="training-list">
                                <div className="training-item">
                                    <p className="training-name">{student?.fieldName}</p>
                                </div>
                            </div>
                            <p className="ojt-company">
                                {
                                    (() => {
                                        const total = report?.attendance as number + (report?.attitude as number) + (report?.grade as number);
                                        if (report?.companyName == null) {
                                            return 'Student haven\'t go to OJT yet';
                                        }
                                        else {
                                            if (report.attendance != null && report.attitude != null && report.grade != null) {
                                                if (student?.ojtStatus == false) {
                                                    return [<span>Failed </span>,<span>OJT at {report.companyName}</span>] 
                                                }
                                                else
                                                {
                                                    return [<span>Passed </span>,<span>OJT at {report.companyName}</span>] 
                                                }
                                            }
                                            return 'Are going to OJT at ' + report?.companyName;
                                        }
                                    })()
                                }
                            </p>
                            <div className="grade">
                                <span>Attendance</span>
                                <span className="grade-report">{report?.attendance}</span>
                            </div>
                            <div className="grade">
                                <span>Attitude</span>
                                <span className="grade-report">{report?.attitude}</span>
                            </div>
                            <div className="grade">
                                <span>Progress</span>
                                <span className="grade-report">{report?.grade}</span>
                            </div>
                        </div>
                        <div className="student-about col-right">
                            <div className="about-title">contact information</div>
                            <div className="row-student-profile">
                                <span>FPTU email</span>
                                <div className="col-info"><span>{student?.email}</span></div>
                            </div>
                            <div className="row-student-profile">
                                <span>Phone</span>
                                <div className="col-info"><input type="text" defaultValue={student?.phone} required minLength={10} maxLength={10} name='phone' /></div>
                            </div>
                            <div className="row-student-profile">
                                <span>Address</span>
                                <div className="col-info"><input type="text" defaultValue={student?.address} name='address' required /></div>
                            </div>
                            <div className="about-title">basic information</div>
                            <div className="row-student-profile">
                                <span>Birth day</span>
                                <input className="col-info" type='date' name='dateofbirth' required defaultValue={student?.dateOfBirth == null ? '' : getDateFormated(student.dateOfBirth)}></input>
                            </div>
                            <div className="row-student-profile">
                                <span>Gender</span>
                                <div className="col-info">{student?.gender}</div>
                            </div>
                            <div className="row-student-profile">
                                <span>CV (.pdf)</span>
                                <div className="col-info edit-cv"><input type='file' accept={'.pdf'} name='cv' /></div>
                            </div>
                            <div className="btn-interact">
                                <button className="btn btn-save">Save changes</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>

    )
}

export default StudentProfile
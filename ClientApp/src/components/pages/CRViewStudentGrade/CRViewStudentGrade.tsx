import './CRViewStudentGrade.css';
import React, { ChangeEvent, ChangeEventHandler, FC, FormEvent, useEffect, useState } from 'react'
import { NavLink, RouteComponentProps, useHistory } from 'react-router-dom';
import { ResponeData, Student } from '../../../model';
import MessageBox from '../../modules/popups/MessageBox/MessageBox';
import Loader from '../../modules/Loader/Loader';
interface Props extends RouteComponentProps<{ page: string, name: string }> {

}
interface StudentGradeInput extends Student {
    attendance?: number;
    attitude?: number;
    grade?: number;
}
interface StudentObjectRequest {
    studentID: string;
    attendance: number | null;
    attitude: number | null;
    progress: number | null;
    [key: string]: string | number | null;
}
const CRViewStudentGrade: FC<Props> = props => {
    const history = useHistory();
    const [pages, setPages] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [studentGradeInput, setStudentGradeInput] = useState<StudentGradeInput[]>([]);
    const [isModified, setIsModified] = useState('');
    const [message, setMessage] = useState('');
    const getStudents = () => {
        const currentPage = parseInt(props.match.params.page);
        const currentSearch = props.match.params.name != null ? props.match.params.name : "";
        fetch('/api/cr/students/' + currentPage + '/' + currentSearch).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData & { requestList: Student[], maxPage: number }>).then(data => {
                    if (data.error == 0) {
                        setStudentGradeInput(data.requestList);

                        let startPage = 1, endPage = 5;
                        if (currentPage > 3) {
                            startPage = currentPage - 3;
                            endPage = currentPage + 3;
                        }
                        if (endPage > data.maxPage) {
                            endPage = data.maxPage;
                        }
                        const cPages: number[] = [];
                        for (let i = startPage; i <= endPage; i++) {
                            cPages.push(i);
                        }
                        setPages(cPages);
                    }
                });
            }
        });
    }
    const searchSubmit = (e: FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        history.push('/cr/students/1/' + formData.get('search'));
    }
    const studentGradeInputOnChange = (e: ChangeEvent<HTMLInputElement>, propertyName: string, student: Student) => {
        setIsModified('display');
        const studentIndex = studentGradeInput.indexOf(student);
        let newValue: number = parseInt(e.target.value);
        if (newValue <= 100 && newValue >= 0) {
            setStudentGradeInput(
                [
                    ...studentGradeInput.slice(0, studentIndex),
                    { ...student, [propertyName]: newValue },
                    ...studentGradeInput.slice(studentIndex + 1)
                ]);
        }
        else {
        }
    }
    const studentImportGradeOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        const element = e.target as HTMLInputElement;
        setLoading(true);
        if (element.files && element.files[0]) {
            const file = element.files[0];
            file.text().then(csv => {
                let valid = false;
                var lines = csv.split("\r\n");
                if (lines.length == 1 && lines[0] == csv) {
                    lines = csv.split('\n');
                }
                const jsonRequestObject: StudentObjectRequest[] = [];
                var headers = lines[0].split(",");
                if (headers.length == 1 && headers[0] == lines[0]) {
                    headers = lines[0].split(';');
                }
                if (headers[0] != "StudentID" || headers[1] != 'Attendence' || headers[2] != 'Attitude' || headers[3] != 'Progress') {
                    setMessage('CSV file doesn\'t have right format');
                    setLoading(false);
                    return;
                }
                for (var i = 1; i < lines.length; i++) {
                    var currentline = lines[i].split(",");
                    if (currentline.length == 1 && currentline[i] == lines[i]) {
                        currentline = lines[i].split(';');
                    }
                    if (currentline.length == 4) {
                        if (currentline[1].match('\\d+') && currentline[2].match('\\d+') && currentline[3].match('\\d+')) {
                            const attendance = parseInt(currentline[1]), attitude = parseInt(currentline[2]), progress = parseInt(currentline[3]);
                            if (attendance > 100 || attitude > 100 || progress > 100) {
                                setMessage('Mark must between 0 and 100');
                                setLoading(false);
                                return;
                            }
                            var obj: StudentObjectRequest = { studentID: currentline[0], attendance: attendance, attitude: attitude, progress: progress };
                            jsonRequestObject.push(obj);
                            valid = true;
                        }
                        else {
                            valid = false;
                            break;
                        }
                    }
                }
                if (valid) {
                    fetch('/api/cr/reports/evaluate',
                        {
                            headers:
                            {
                                "Content-Type": "application/json"
                            },
                            method: "POST",
                            body: JSON.stringify(jsonRequestObject)
                        }).then(res => {
                            if (res.ok) {
                                (res.json() as Promise<ResponeData>).then(data => {
                                    if (data.error == 0) {
                                        getStudents();
                                        setMessage('Students\'s grade have been uploaded');
                                    }
                                    else {
                                        setMessage(data.message);
                                    }
                                });
                            }
                            else {
                                setMessage('Something wrong happened, can\'t upload grade');
                            }
                            setLoading(false);
                        });
                }
                else {
                    setMessage('CSV file doesn\'t have right format, make sure you fill all information and use LF format for your csv file');
                    setLoading(false);
                }
            });
        }
    }
    const uploadGrade = () => {
        const jsonRequestObject: StudentObjectRequest[] = [];
        studentGradeInput.map(item => {
            if (item.attendance != null && item.attitude != null && item.grade != null) {
                jsonRequestObject.push
                    (
                        {
                            attendance: item.attendance,
                            attitude: item.attitude,
                            progress: item.grade,
                            studentID: item.studentID
                        }
                    );
            }
        });

        fetch('/api/cr/reports/evaluate',
            {
                headers:
                {
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(jsonRequestObject)
            }).then(res => {
                if (res.ok) {
                    (res.json() as Promise<ResponeData>).then(data => {
                        if (data.error == 0) {
                            setMessage('Students\'s grade have been uploaded');
                        }
                        else {
                            setMessage(data.message);
                        }
                    });
                }
                else {
                    setMessage('Something wrong happened, can\'t upload grade');
                }
            })
    }
    useEffect(() => {
        getStudents();
        setIsModified('');
    }, [props.location.pathname]);

    return (
        <div id="CRViewStudentGrade">
            {
                loading ?
                    <Loader></Loader>
                    :
                    null
            }
            {
                message != '' ?
                    <MessageBox message={message} setMessage={setMessage} title='Information'></MessageBox>
                    :
                    null
            }
            <div id="content">
                <form onSubmit={searchSubmit}>
                    <div className="search-bar">
                        <i className="fas fa-search search--bar--icon search-icon"></i>
                        <input type="text" className="search-input" placeholder="Search student's name" name='search' required />
                        <i className="fas fa-times-circle clear-icon"></i>
                        <button className="btn btn-search"><i className="fas fa-search search-icon"></i> Search</button>
                    </div>
                </form>
                <table className="table">
                    <tr className="table-title">
                        <th rowSpan={2}>Roll Number</th>
                        <th rowSpan={2}>Student's Name</th>
                        <th colSpan={4}>Rating</th>
                        <th rowSpan={2}>Status</th>
                    </tr>
                    <tr className="rating-title">
                        <td>Attendence</td>
                        <td>Attitude</td>
                        <td>Progress</td>
                        <td>Total</td>
                    </tr>
                    {
                        studentGradeInput.map(item =>
                            <tr className="row1">
                                <td className="col-grade"><NavLink to={'/cr/student/' + item.studentID} tabIndex={-1}>{item.studentID}</NavLink></td>
                                <td className="col-grade" tabIndex={-1}>{item.fullName}</td>
                                <td className="row1-title"><input className="primary-background" type="number" max='100' min='0' value={item.attendance == null ? '' : item.attendance} onChange={(e) => studentGradeInputOnChange(e, 'attendance', item)} /></td>
                                <td className="row1-title"><input className="primary-background" type="number" max='100' min='0' value={item.attitude == null ? '' : item.attitude} onChange={(e) => studentGradeInputOnChange(e, 'attitude', item)} /></td>
                                <td className="row1-title"><input className="primary-background" type="number" max='100' min='0' value={item.grade == null ? '' : item.grade} onChange={(e) => studentGradeInputOnChange(e, 'grade', item)} /></td>
                                <td className="row1-title"><input className="primary-background" type="number" readOnly value={item.attendance as number + (item.attitude as number) + (item.grade as number)} tabIndex={-1} /></td>
                                <td className='row1-title col-status'>
                                    {
                                        (() => {
                                            const attendance = (item.attendance as number), attitude = (item.attitude as number), grade = (item.grade as number);
                                            const total =  attendance + attitude + grade;
                                            if (item.attendance == null || item.attitude == null || item.grade == null) {
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
                                </td>
                            </tr>
                        )

                    }

                </table>
                <div className="tasks-grade">

                    <div className={"csv display"}>
                        <h3>import form csv</h3>
                        <div className="csv-link">
                            <p>csv file</p>
                            <div className="block">
                                <div className="csv-file">
                                    <input type='file' accept={'.csv'} onChange={studentImportGradeOnChange} />
                                </div>
                                <a href='/files/example.csv'>Download example</a>
                            </div>
                        </div>
                    </div>
                    <div className="paging">
                        <button className="paging-btn pre-btn"><i className="fas fa-angle-double-left"></i></button>
                        {
                            pages.map(item =>
                                <NavLink to={'/cr/students/' + item} className="page-number">{item}</NavLink>
                            )
                        }
                        <button className="paging-btn next-btn"><i className="fas fa-angle-double-right"></i></button>
                    </div>
                    <div className={"export-link display"}>
                        <a href="/api/cr/markcsv">Export To CSV</a>
                        <div className={"upload-grade " + isModified}>
                            <button onClick={uploadGrade}>Submit</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default CRViewStudentGrade
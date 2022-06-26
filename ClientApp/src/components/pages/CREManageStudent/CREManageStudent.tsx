import QueryString from 'qs';
import './CREManageStudent.css';
import React, { ChangeEvent, FC, FormEvent, useEffect, useState } from 'react'
import { RouteComponentProps, useHistory } from 'react-router'
import { NavLink } from 'react-router-dom';
import { Field, ResponeData, Student } from '../../../model';
import MessageBox from '../../modules/popups/MessageBox/MessageBox';
import Loader from '../../modules/Loader/Loader';
interface Props extends RouteComponentProps<{ page: string }> {

}
interface InsertStudentObject {
    fullName: string;
    email: string;
    dateOfBirth: Date;
    gender: string;
    address: string;
    phone: string;
    major: number;
    studentID: string;
}
const CREManageStudent: FC<Props> = props => {
    const history = useHistory();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [student, setStudent] = useState<Student>();
    const [pages, setPages] = useState<number[]>([1]);
    const [field, setField] = useState<Field[]>([]);
    const [showModal, setShowModal] = useState('');
    const [message, setMessage] = useState('');
    const [fieldID, setFieldID] = useState<string>('1');
    const [gender, setGender] = useState('Male');
    const [search, setSearch] = useState('');
    const getDateFormated = (date: string) => {
        const sa = new Date(date).toISOString().substr(0, 10);
        return sa;
    }
    const getStudents = () => {
        const currentPage = parseInt(props.match.params.page);
        const searchProp = QueryString.parse(props.location.search.replace('?', '')) as { search: string, major: string };
        const currentSearch = searchProp.search == undefined ? '' : searchProp.search;
        const currentMajor = searchProp.major == undefined ? '0' : searchProp.major;
        setSearch(currentSearch);
        fetch('/api/cre/students/' + currentPage + '?search=' + currentSearch + '&major=' + currentMajor).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData & { studentList: Student[], maxPage: number }>).then(data => {
                    if (data.error == 0) {
                        setStudents(data.studentList);

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
    const updateStudentInputOnChange = (property: string, newValue: string, student: Student) => {
        setStudent({
            ...student,
            [property]: newValue
        })
    }
    useEffect(() => {
        getStudents();
        if (field.length == 0) {
            fetch('/api/auth/field').then(res => {
                if (res.ok) {
                    (res.json() as Promise<ResponeData & { fields: Field[] }>).then(data => {
                        if (data.error == 0) {
                            setField(data.fields);
                        }
                    });
                }
            });
        }
    }, [props.location.pathname, props.location.search]);
    const studentInsertOnchange = (e: ChangeEvent<HTMLInputElement>) => {
        const jsonObj: InsertStudentObject[] = [];
        if (e.target.files && e.target.files[0]) {
            setLoading(true);
            e.target.files[0].text().then(text => {
                let valid = false;
                let lines = text.split('\r\n');
                if (lines.length == 1 && lines[0] == text) {
                    lines = text.split('\n');
                }
                const genderList = ["Female", "Male"];
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i] == '') {
                        break;
                    }
                    valid = false;
                    let values = lines[i].split(',');
                    if (values.length != 8) {
                        values = lines[i].split(';');
                    }
                    if (values.length == 8) {
                        const studentID = values[0], fullName = values[1], email = values[2], birth = values[3], gender = values[4], phone = values[5], majorText = values[6], address = values[7];
                        if (studentID == '' || fullName == '' || email == '' || birth == '' || gender == '' || phone == '' || majorText == '' || address == '') {
                            break;
                        }
                        if (email.match("^[a-z]{1}[a-z0-9]+[a-z]{2}[0-9]{6,8}@fpt.edu.vn$")) {
                            const dateBirth = new Date(birth);
                            if (dateBirth) {
                                if ((new Date().getFullYear() - dateBirth.getFullYear()) >= 18) {
                                    if (genderList.indexOf(gender) >= 0) {
                                        if (phone.length < 11) {
                                            const cField = field.find(f => f.fieldName.trim() == majorText.trim());
                                            if (cField) {
                                                valid = true;
                                                jsonObj.push(
                                                    {
                                                        address: address,
                                                        dateOfBirth: dateBirth,
                                                        email: email,
                                                        fullName: fullName,
                                                        gender: gender,
                                                        major: cField.fieldID,
                                                        phone: phone,
                                                        studentID: studentID
                                                    }
                                                );
                                            }
                                            else {
                                                setMessage('Major "' + majorText + '"is not exsit');
                                            }
                                        }
                                        else {
                                            setMessage('Phone doesn\'t have right format');
                                        }
                                    }
                                    else {
                                        setMessage('Gender must be "Male" or "Female" only"');
                                    }
                                }
                                else {
                                    setMessage('Student age must be or older than 18');
                                }
                            }
                            else {
                                setMessage('Date of birth doesn\'t have right format');
                            }
                        }
                        else {
                            setMessage('Email doesn\'t have right format');
                        }
                    }
                    else
                    {
                        setMessage("CSV file doesn't have right format");
                    }
                    if (!valid) {
                        break;
                    }
                }

                if (valid) {
                    fetch('/api/cre/students/new',
                        {
                            headers:
                            {
                                "Content-Type": 'application/json'
                            },
                            method: "POST",
                            body: JSON.stringify(jsonObj)
                        }).then(res => {
                            if (res.ok) {
                                (res.json() as Promise<ResponeData>).then(data => {
                                    if (data.error == 0) {
                                        setMessage('Upload student\'s information successfully');
                                    }
                                    else {
                                        setMessage(data.message);
                                    }
                                    getStudents();
                                    setLoading(false);
                                });
                            }
                        })
                }
                else {
                    setLoading(false);
                }
            });
        }


    }
    const updateStudentSubmit = (e: FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        formData.set('accountstatus', 'true');
        const birth = new Date(formData.get('dateofbirth') as string);
        if ((new Date().getFullYear() - birth.getFullYear()) >= 18) {
            fetch('/api/cre/students/update',
                {
                    method: "POST",
                    body: formData

                }).then(res => {
                    if (res.ok) {
                        (res.json() as Promise<ResponeData>).then(data => {
                            if (data.error == 0) {
                                setMessage('Student has been updated');
                                setShowModal('');
                                getStudents()
                            }
                        });
                    }
                });
        }
        else
        {
            setMessage('Student age must be or older than 18');
        }
    }
    const deleteStudent = (username: string) => {
        setLoading(true);
        fetch('/api/cre/students/remove/' + username).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData>).then(data => {
                    if (data.error == 0) {
                        setMessage('Student has been delete');
                        getStudents();
                    }
                    else {
                        setMessage(data.message);
                    }
                    setLoading(false);
                });
            }
        });
    }
    const searchSubmit = (e: FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        history.push('/cre/manage/students/1?search=' + formData.get('search') + '&major=' + formData.get('field'));
    }
    return (
        <div id="CREManageStudent">
            <div id="content">
                {
                    loading ?
                        <Loader></Loader>
                        :
                        null
                }
                {
                    message != '' ?
                        <MessageBox message={message} setMessage={setMessage} title='inasd'></MessageBox>
                        :
                        null
                }
                <div>
                    <form onSubmit={searchSubmit} className="clear">
                        <input className="search-bar" placeholder="Search student's name" type="text" name='search' />
                        <button className="btn-search" type='submit'>Search</button>
                        <div className="csv">
                            <h3>import form csv</h3>
                            <div className="csv-link">
                                <p>csv file</p>
                                <div className="block">
                                    <div className="csv-file">
                                        <input type='file' accept={'.csv'} onChange={studentInsertOnchange} />
                                    </div>
                                    <a href="/files/student-insert-example.csv">Download example</a>
                                </div>
                            </div>
                        </div>
                        <select className="filter-select" name="field">
                            <option value='0'>All</option>
                            {
                                field.map(item =>
                                    <option value={item.fieldID}>{item.fieldName}</option>
                                )
                            }
                        </select>
                    </form>
                </div>

                <table className="table-student">
                    <thead>
                        <tr className="table-student-title">
                            <th className="col1">Roll number</th>
                            <th className="col2">Name</th>
                            <th className="col3">Major</th>
                            <th className="col4">Email</th>
                            <th className="col5">Phone</th>
                            <th className="col6">Edit</th>
                            <th className="col7">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            students.map(item =>
                                <tr className="table-student-info">
                                    <td className="col1">{item.studentID}</td>
                                    <td className="col2">{item.fullName}</td>
                                    <td className="col3">{item.fieldName}</td>
                                    <td className="col4">{item.email}</td>
                                    <td className="col5">{item.phone}</td>
                                    <td className="col6"><button className="btn-edit" onClick={() => { setShowModal('display'); setStudent(item); setGender(item.gender as string); setFieldID(field.find(f => f.fieldName == item.fieldName)?.fieldID as unknown as string) }}>Edit</button></td>
                                    <td className="col7"><button className="btn-delete" onClick={() => deleteStudent(item.username)}>Delete</button></td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
                <div className="flexbox">

                    <div className="paging">
                        <button className="paging-btn pre-btn"><i className="fas fa-angle-double-left"></i></button>
                        {
                            pages.map(item =>
                                <NavLink to={'/cre/manage/students/' + item + '?search=' + search} className="page-number">{item}</NavLink>
                            )
                        }
                        <button className="paging-btn next-btn"><i className="fas fa-angle-double-right"></i></button>
                    </div>
                    <div></div>
                </div>
                {/*modal*/}
                <div className={'modal ' + showModal}>
                    <div className="modal-content js-modal-content">
                        <div className="modal-header">
                            <span className="close-modal" onClick={() => setShowModal('')}>
                                <i className="fas fa-times"></i>
                            </span>
                            <div className=" row modal-title">
                            </div>
                        </div>
                        <div className="modal-container">
                            <form onSubmit={updateStudentSubmit}>
                                <input type="hidden" name='studentid' value={student?.studentID} />
                                <div className="row">
                                    <div className="col-haft">
                                        <p>Roll number</p>
                                        <p className="student-id">{student?.studentID}</p>
                                    </div>
                                    <div className="col-haft">

                                        <p>Gender</p>
                                        <select name="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-haft">
                                    <p>Name</p>
                                    <input type="text" required pattern={'[^\\d!@#$%^&*()_+-=]*$'} name='fullname' value={student?.fullName} onChange={(e) => updateStudentInputOnChange('fullName', e.target.value, student as Student)} />
                                </div>
                                <div className="col-haft">
                                    <p>Username</p>
                                    <input name='username' required value={student?.username} onChange={(e) => updateStudentInputOnChange('username', e.target.value, student as Student)}></input>
                                </div>
                                <div className="col-haft">
                                    <p>Date of birth</p>
                                    <input className="birth" type="date" name='dateofbirth' required value={student?.dateOfBirth == null ? '' : getDateFormated(student.dateOfBirth)} onChange={(e) => updateStudentInputOnChange('dateOfBirth', e.target.value, student as Student)} />
                                </div>
                                <div className="col-haft">
                                    <p>Phone</p>
                                    <input type="text" name='phone' minLength={10} maxLength={10} pattern='\d+' required value={student?.phone} onChange={(e) => updateStudentInputOnChange('phone', e.target.value, student as Student)} />
                                </div>
                                <div className="col-haft">
                                    <p>Address</p>
                                    <input type="text" name='address' value={student?.address} required onChange={(e) => updateStudentInputOnChange('address', e.target.value, student as Student)} />
                                </div>
                                <div className="col-haft">
                                    <p>Major</p>
                                    <select name="major" value={fieldID} onChange={(e) => setFieldID((e.target.value) as string)}>
                                        {
                                            field.map(item =>
                                                <option value={item.fieldID}>{item.fieldName}</option>
                                            )
                                        }
                                    </select>
                                </div>
                                <div className="col-haft">
                                    <p>Email</p>
                                    <input type="email" name='email' required value={student?.email} onChange={(e) => updateStudentInputOnChange('email', e.target.value, student as Student)} />
                                </div>
                                <div className="col-haft right">
                                    <button className="btn-submit" type='submit'>Submit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CREManageStudent

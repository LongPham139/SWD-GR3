import './CRViewStudent.css';
import React, { FC, useEffect, useState } from 'react'
import { NavLink, RouteComponentProps, useHistory } from 'react-router-dom';
import { Student, ResponeData } from '../../../model';
import QueryString from 'qs';
interface Props extends RouteComponentProps {

}
const CRViewStudent: FC<Props> = props => {
    const [students, setStudents] = useState<Student[]>([]);
    const [pages, setPages] = useState<number[]>([]);
    const [term, setTerm] = useState<number>(1);
    const [company, setCompany] = useState<number>(1);

    const [search, setSearch] = useState('');
    const history = useHistory();
    useEffect(() => {
        const searchProp = QueryString.parse(props.location.search.replace("?", "")) as { company: string, page: string, term: string };
        const currentCompany: number = searchProp.company != null ? parseInt(searchProp.company) : 1;
        const currentPage: number = searchProp.page != null ? parseInt(searchProp.page) : 1;
        const currentTerm: number = searchProp.term != null ? parseInt(searchProp.term) : 1;

        fetch('/api/cr/students/' + currentPage).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData & { requestList: Student[] }>).then(data => {
                    console.log(data);
                    if (data.error == 0) {
                        setStudents(data.requestList);
                    }
                });
            }
        })
    }, [props.location.search]);
    return (
        <div id='CRViewStudent'>
            <div id="content">
                <div className="search-bar">
                    <i className="fas fa-search search--bar--icon search-icon"></i>
                    <input type="text" className="search-input" placeholder="Search student's id" />
                    <i className="fas fa-times-circle clear-icon"></i>
                    <button className="btn btn-search"><i className="fas fa-search search-icon"></i> Search</button>
                </div>
                <div className="filter">
                    <div className="majors filter--item filter--select">Majors <i className="fas fa-sort-down"></i>
                        <div id="majors-dropdown">
                            <option className="majors-item" value="All">All</option>
                        </div>
                    </div>

                    <div>
                        <table className="table">
                            <tr className="table-title">
                                <td>Roll Number</td>
                                <td>Student's Name</td>
                                <td>Other</td>
                            </tr>
                            {
                                students.map(item =>
                                    [<tr className="item">
                                        <td rowSpan={2} >{item.studentID}</td>
                                        <td rowSpan={2} >{item.fullName}</td>
                                        <td>
                                            <button className="details-button" onClick={() => history.push('/cr/student/' + item.studentID)} >Details</button>
                                        </td>
                                    </tr>,
                                    <tr className="item">
                                        <td>
                                            <button className="upload-button">Upload Grades</button>
                                        </td>
                                    </tr>]
                                )
                            }
                        </table>
                        <div className="paging">
                            <button className="paging-btn pre-btn"><i className="fas fa-angle-double-left"></i></button>
                            <div className="page-number">1</div>
                            <button className="paging-btn next-btn"><i className="fas fa-angle-double-right"></i></button>
                        </div>
                        <div className="view">
                            <p>If you want to see the scores of all students: </p>
                            <a>
                                <NavLink to={'/cr/studentgrades'}>Click here</NavLink>
                            </a>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}
export default CRViewStudent

import './CREViewStudent.css';
import React, { FC, FormEvent, useEffect, useState } from 'react'
import { NavLink, RouteComponentProps, useHistory } from 'react-router-dom';
import { Report, ResponeData, Term } from '../../../model';
import QueryString from 'qs';
interface Props extends RouteComponentProps<{ page: string, term: string }> {

}
const CREViewStudent: FC<Props> = props => {
    const [students, setStudents] = useState<Report[]>([]);
    const [pages, setPages] = useState<number[]>([]);

    const [search, setSearch] = useState('');
    const [termNumber, setTermNumber] = useState<number>(0);
    const [termName, setTermName] = useState('');
    const history = useHistory();
    const searchSubmit = (e: FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        history.push('/cre/students/' + termNumber + '/1' + '?search=' + formData.get('search'));
    }
    useEffect(() => {
        const searchProp = QueryString.parse(props.location.search.replace("?", "")) as { search: string, termNumber: string, page: string };
        const currentSearch: string = searchProp.search != null ? searchProp.search : "";
        const currentPage: number = parseInt(props.match.params.page);
        const currentTerm: number = parseInt(props.match.params.term);
        setTermNumber(currentTerm);
        setSearch(currentSearch);
        fetch('/api/cre/reports/' + currentPage + '/' + currentTerm + "?search=" + currentSearch).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData & { studentList: Report[], maxPage: number, term: Term }>).then(data => {
                    if (data.error == 0) {
                        setStudents(data.studentList);
                        setTermName(data.term.termName);
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
                })
            }
        });
    }, [props.location.pathname, props.location.search]);
    return (
        <div id="CREViewStudent">
            <div id="content">
                <div className="vertical-algin">
                    <h3 className="content-heading">student list ojt</h3>
                    <div className="cr-search">
                        <form className="search-form" onSubmit={searchSubmit}>
                            Search <input className="cr-search-bar" type="text" name="search" placeholder="Student name" required /><i className="fas fa-search vertical-algin"></i>
                        </form>
                    </div>
                </div>
                <div className="semeter">
                    <h3>semeter:</h3>
                    <div className="semeter-name">{termName}</div>
                </div>
                <div id="student-list">
                    <table className="table">
                        <tr>
                            <th className="col2" rowSpan={2}>Roll number</th>
                            <th className="col3" rowSpan={2}>Student name</th>
                            <th className="col4" rowSpan={2}>Company applied</th>
                            <th className="col5" colSpan={4}>rating </th>
                            <th className='col1' rowSpan={2}>Status</th>
                        </tr>
                        <tr className="grade-title">
                            <td className="col6">attendance</td>
                            <td className="col7">attitude</td>
                            <td className="col8">progress</td>
                            <td className="col9">total</td>
                        </tr>
                        {
                            students.map(item =>
                                <tr className="grade-item">
                                    <td className="col2 student-roll"><NavLink to={'/cre/studentdetail/' + item.studentID}>{item.studentID}</NavLink></td>
                                    <td className="col3">{item.fullName}</td>
                                    <td className="col4">{item.companyName}</td>
                                    <td className="col6 grade-input"><input readOnly value={item.attendance == null ? '' : item.attendance} /></td>
                                    <td className="col7 grade-input"><input readOnly value={item.attitude == null ? '' : item.attitude} /></td>
                                    <td className="col8 grade-input"><input readOnly value={item.grade == null ? '' : item.grade} /></td>
                                    <td className="col9 grade-input"><input readOnly value={item.attendance + item.attitude + item.grade} /></td>
                                    {
                                        (() => {
                                            const attendance = (item.attendance as number), attitude = (item.attitude as number), grade = (item.grade as number);
                                            const total = attendance + attitude + grade;
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
                                </tr>
                            )
                        }
                    </table>
                    <div className="flexbox">
                        <div></div>
                        <div className="paging">
                            <button className="paging-btn pre-btn"><i className="fas fa-angle-double-left"></i></button>
                            {
                                pages.map(item =>
                                    <NavLink className='page-number' to={'/cre/students/' + termNumber + '/' + item + '?search=' + search}>{item}</NavLink>
                                )
                            }
                            <button className="paging-btn next-btn"><i className="fas fa-angle-double-right"></i></button>
                        </div>
                        <a href="/api/cre/reports/download" download className="export-student">Export student list</a>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default CREViewStudent
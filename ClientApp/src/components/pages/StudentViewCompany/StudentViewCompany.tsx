import './StudentViewCompany.css';
import React, { FC, FormEvent, useEffect, useState } from 'react'
import { NavLink, RouteComponentProps, useHistory } from 'react-router-dom';
import QueryString from 'qs';
import { Company, Field, Report, ResponeData, Term } from '../../../model';
import MessageBox from '../../modules/popups/MessageBox/MessageBox';
interface Props extends RouteComponentProps<{ page: string, field: string }> {

}
const StudentViewCompany: FC<Props> = props => {
    const [comapanies, setComapanies] = useState<Company[]>([]);
    const [company, setCompany] = useState<Company | null>(null);
    const [majors, setMajors] = useState<Field[]>([]);
    const [term, setTerm] = useState<Term>();
    const [showRecuit, setShowRecuit] = useState('');
    const [report, setReport] = useState<Report | null>();
    const history = useHistory();

    const [filed, setFiled] = useState(0);
    const [search, setSearch] = useState('');
    const [pages, setPages] = useState<number[]>([]);
    const [message, setMessage] = useState('');
    const getDateFormated = (dateString: string) => {
        if (dateString != null) {
            const date = new Date(dateString);
            if (date != null) {
                let day = date.getDate().toString(), month = date.getUTCMonth().toString(), year = date.getUTCFullYear().toString();
                if (date.getMonth() < 10) {
                    month = '0' + date.getMonth();
                }
                if (date.getDate() < 10) {
                    day = '0' + date.getDate();
                }
                const result = year + '-' + month + '-' + day;
                return result;
            }
        }
        return '';

    }

    const searchSubmit = (e: FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const formField = formData.get('field') != null ? formData.get('field') : 0;
        const formName = formData.get('search') != null ? formData.get('search') : '';
        history.push('/student/companies?page=1&field=' + formField + '&name=' + formName);
        setSearch(formData.get('search') as string);
    }
    const applyToCompany = (company: Company) => {
        const formData = new FormData();
        formData.append('requestType', '1');
        formData.append('requestTitle', 'Register');
        formData.append('companyId', company.companyID.toString());
        formData.append('purpose', 'Register to ' + company.companyName + ' for OJT');
        fetch('/api/student/requests/create',
            {
                method: "POST",
                body: formData
            }).then(res => {
                console.log(res);
                if (res.ok) {
                    (res.json() as Promise<ResponeData>).then(data => {
                        console.log(data);
                        if (data.error == 0) {
                            history.push('/student/history/1');
                        }
                        if (data.error == 1) {
                            setMessage("Can't create another request while processing");
                            setShowRecuit('');
                        }
                        else {
                            setMessage(data.message);
                            setShowRecuit('');
                        }
                    });
                }
            });
    }
    const transferCompany = (company: Company) => {
        const formData = new FormData();
        formData.append('requestType', '2');
        formData.append('requestTitle', 'Transfer');
        formData.append('companyId', company.companyID.toString());
        formData.append('purpose', 'Transfer to ' + company.companyName + ' for OJT');
        fetch('/api/student/requests/create',
            {
                method: "POST",
                body: formData
            }).then(res => {
                console.log(res);
                if (res.ok) {
                    (res.json() as Promise<ResponeData>).then(data => {
                        console.log(data);
                        if (data.error == 0) {
                            history.push('/student/history/1');
                        }
                        else {
                            hideRecuitment();
                            setMessage(data.message);
                        }
                    });
                }
            });
    }
    const showRecuitment = (comany: Company) => {
        fetch('/api/student/company/' + comany.companyID).then(res => {
            console.log(res);
            if (res.ok) {
                (res.json() as Promise<ResponeData & { company: Company, report: Report }>).then(data => {
                    if (data.error == 0) {
                        setShowRecuit('display');
                        setCompany(data.company);
                        setReport(data.report);
                    }
                });
            }
        });
    }
    const hideRecuitment = () => {
        setShowRecuit('');
    }


    useEffect(() => {
        const searchProp = QueryString.parse(props.location.search.replace("?", "")) as { name: string, page: string, field: string };
        const currentSearch: string = searchProp.name != null ? searchProp.name : "";
        const currentPage: number = searchProp.page != null ? parseInt(searchProp.page) : 1;
        const currentField: number = searchProp.field != null ? parseInt(searchProp.field) : 0;
        setFiled(currentField);
        setSearch(currentSearch);

        fetch('/api/student/companies/' + currentPage + '/' + currentField + '?search=' + currentSearch).then(res => {
            if (res.ok) {
                console.log(res);
                (res.json() as Promise<ResponeData & { companyList: Company[], maxPage: number, term: Term, report:Report }>).then(data => {
                    if (data.error == 0) {
                        setComapanies(data.companyList);
                        setTerm(data.term);
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
                        window.scroll(
                            {
                                top: 0,
                                left: 0,
                                behavior: "smooth"
                            });
                    }
                });
            }
        });

        if (majors.length == 0) {
            fetch('/api/auth/field').then(res => {
                if (res.ok) {
                    (res.json() as Promise<ResponeData & { fields: Field[] }>).then(data => {
                        if (data.error == 0) {
                            setMajors(data.fields);
                        }
                    });
                }
            });
        }

        window.onclick = (e: MouseEvent) => {
            const modal = document.getElementsByClassName('modal')[0] as HTMLDivElement;
            if (e.target == modal) {
                hideRecuitment();
            }
        }
    }, [props.location.search]);
    return (
        <div id='StudentViewCompany'>
            {
                message != '' ?
                    <MessageBox message={message} setMessage={setMessage} title='sdf'></MessageBox>
                    :
                    null
            }
            <div id="content">
                <form onSubmit={searchSubmit}>
                    <div className="search-bar">
                        <i className="fas fa-search search--bar--icon search-icon"></i>
                        <input type="text" className="search-input" name='search' placeholder="Search for jobs, companies" />
                        <i className="fas fa-times-circle clear-icon" onClick={(e) => history.push('/companies')}></i>
                        <button className="btn btn-search"><i className="fas fa-search search-icon"></i> Search</button>
                    </div>
                    <div className="cover">
                        <div className="ojt-date">
                            <div>
                                <span>Start Date </span>
                                <span>{getDateFormated(term?.startDate as string)}</span>
                            </div>
                            <div>
                                <span>Request due date </span>
                                <span>{getDateFormated(term?.requestDueDate as string)}</span>
                            </div>
                            <div>
                                <span>End date </span>
                                <span>{getDateFormated(term?.endDate as string)}</span>
                            </div>
                        </div>
                        <div className="filter">
                            <select className="majors filter--item filter--select" name='field'>Majors <i className="fas fa-sort-down"></i>
                                <option className="majors-item" value={0} defaultChecked>All</option>
                                {
                                    majors.map(item =>
                                        <option className="majors-item" value={item.fieldID}>{item.fieldName}</option>
                                    )
                                }
                            </select>
                        </div>
                    </div>
                </form>

                <div className="company-list">

                    {
                        comapanies.map(item =>
                            <div className="company-item">
                                <div className="company-logo">
                                    <img src={item.imageURL} alt="logo-company" onClick={() => { showRecuitment(item); }} />
                                </div>
                                <div className="company-info" onClick={() => { showRecuitment(item); }}>
                                    <p className="company-name">{item.companyName}</p>
                                    <p className="company-place">{item.address}</p>
                                    <p className="recruitment-description">Major: <span></span>
                                    {
                                        item.careerField.map(field =>
                                            <span>{field.fieldName + ', '}</span>
                                            )
                                    }
                                    </p>
                                    {
                                        item.applyPosition != null ? item.applyPosition.split('\n').slice(0, 2).map(item =>
                                            <p className="recruitment-description">{item}</p>
                                        )
                                            :
                                            null
                                    }
                                    <p style={{ color: '#1765b3' }}>Click to show more</p>
                                </div>
                            </div>
                        )
                    }


                </div>
                <div className="paging">
                    <button className="paging-btn pre-btn"><i className="fas fa-angle-double-left"></i></button>
                    {
                        pages.map(item =>
                            <NavLink className='page-number' to={'/student/companies?page=' + item + '&field=' + filed + '&name=' + search}>{item}</NavLink>
                        )
                    }
                    <button className="paging-btn next-btn"><i className="fas fa-angle-double-right"></i></button>
                </div>
            </div>




            <div className={'modal ' + showRecuit}>
                <div className="modal-content js-modal-content">
                    <div className="modal-header">
                        <span className="close-modal" onClick={hideRecuitment}>
                            <i className="fas fa-times"></i>
                        </span>
                        <div className=" row modal-title">
                            <div className="col-haft"><img className="modal-company-logo" src={company?.imageURL} alt="comapny-logo" /></div>
                            <div className="company-introduction col-haft">
                                <h3 className="popup-company-name">{company?.companyName}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="modal-container">
                        <div className="company-infor">
                            <p className="company-infor-title">Website</p>
                            <a href={company?.webSite} className="company-infor-detail js-website">{company?.webSite}</a>
                        </div>
                        <div className="company-infor">
                            <p className="company-infor-title">Industry requirement</p>
                            <p className="company-infor-detail js-industry">{company?.fieldName}</p>
                        </div>
                        <div className="company-infor">
                            <p className="company-infor-title">Workplace</p>
                            <p className="company-infor-detail js-workplace">{company?.address}</p>
                        </div>
                        <div className="company-infor">
                            <p className="company-infor-title">Company introduction</p>
                            <div className="company-infor-desc">
                                <span>
                                    {
                                        company?.introduction == null ?
                                            null
                                            :
                                            company?.introduction.split('\n').map(item => {
                                                return (

                                                    <span>
                                                        {item}
                                                        <br />
                                                    </span>
                                                )
                                            })
                                    }
                                </span>
                            </div>
                        </div>
                        <div className="company-infor">
                            <p className="company-infor-title">Job</p>
                            <div className="company-infor-desc">
                                <div className="introduction-content">
                                    {
                                        company?.applyPosition == null ?
                                            null
                                            :
                                            company?.applyPosition.split('\n').map(item => {
                                                return (
                                                    <span>
                                                        {item}
                                                        <br />
                                                        <br />
                                                    </span>
                                                )
                                            })
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="company-infor">
                            <div className="company-infor-desc">
                                <span className="introduction-content">
                                    {
                                        company?.description == null ?
                                            null
                                            :
                                            company?.description.split('\n').map(item => {
                                                return (
                                                    <span>
                                                        {item}
                                                        <br />
                                                        <br />
                                                    </span>
                                                )
                                            })
                                    }
                                </span>
                            </div>
                        </div>
                        <div className="divide">
                            <div className="divide-name">Contact information</div>
                            <div className="divide-line"></div>
                        </div>
                        <div className="recruiting-details">
                            <div className="col1">Phone:</div>
                            <div className="col2 js-phone">{company?.phone}</div>
                        </div>
                        <div className="recruiting-details">
                            <div className="col1">Email:</div>
                            <div className="col2 js-email">{company?.email}</div>
                        </div>
                        <div className="btn-interact">
                            {
                                report == null ?
                                    <button className="btn btn-apply" onClick={() => applyToCompany((company as Company))}>apply</button>
                                    :
                                    report.companyID == company?.companyID ?
                                    null
                                    :
                                    <button className="btn btn-transfer" onClick={() => transferCompany(company as Company)}>transfer</button>
                            }
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default StudentViewCompany

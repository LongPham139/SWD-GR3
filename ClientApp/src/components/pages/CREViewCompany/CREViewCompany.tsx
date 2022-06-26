import './CREViewCompany.css';
import React, { FC, FormEvent, useEffect, useState } from 'react'
import { NavLink, RouteComponentProps, useHistory } from 'react-router-dom';
import { Company, Field, ResponeData } from '../../../model';
import QueryString from 'qs';
import MessageBox from '../../modules/popups/MessageBox/MessageBox';
interface Props extends RouteComponentProps {

}
const CREViewCompany: FC<Props> = props => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [company, setCompany] = useState<Company>();
    const [majors, setMajors] = useState<Field[]>([]);
    const [pages, setPages] = useState<number[]>([]);
    const [showModal, setShowModal] = useState('');

    const [search, setSearch] = useState('');
    const [field, setField] = useState<number>(0);
    const [message, setMessage] = useState('');
    const history = useHistory();
    const getCompanies = (currentPage: number, currentSearch: string, currentField: number) => {
        fetch('/api/cre/companies/' + currentPage + '/' + currentSearch + '?field=' + currentField).then(res => {
            if (res.ok) {
                console.log(res);
                (res.json() as Promise<ResponeData & { companyList: Company[], maxPage: number }>).then(data => {
                    console.log(data);
                    if (data.error == 0) {
                        setCompanies(data.companyList);
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
                })
            }
        });
    }
    const searchSubmit = (e: FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        history.push('/cre/companies?name=' + formData.get('search'));
    }
    const deleteCompany = (companyID: string) => {
        const searchProp = QueryString.parse(props.location.search.replace("?", "")) as { name: string, page: string, field: string };
        const currentSearch: string = searchProp.name != null ? searchProp.name : "";
        const currentPage: number = searchProp.page != null ? parseInt(searchProp.page) : 1;
        const currentField: number = searchProp.field != null ? parseInt(searchProp.field) : 0;
        fetch('/api/cre/companies/delete/' + companyID).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData>).then(data => {
                    if (data.error == 0) {
                        getCompanies(currentPage, currentSearch, currentField);
                    }
                    else {
                        setMessage(data.message);
                    }
                });
            }
        });
    }
    useEffect(() => {
        const searchProp = QueryString.parse(props.location.search.replace("?", "")) as { name: string, page: string, field: string };
        const currentSearch: string = searchProp.name != null ? searchProp.name : "";
        const currentPage: number = searchProp.page != null ? parseInt(searchProp.page) : 1;
        const currentField: number = searchProp.field != null ? parseInt(searchProp.field) : 0;
        setField(currentField);
        setSearch(currentSearch);
        getCompanies(currentPage, currentSearch, currentField);
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
        const modal = document.getElementsByClassName('modal')[0] as HTMLDivElement;
        window.onclick = (e : MouseEvent) =>
        {
            if (e.target == modal) {
                setShowModal('');
            }
        }
    }, [props.location.search]);
    return (
        <div id='CREViewCompany'>
            <div id='content'>
                {
                    message != '' ?
                        <MessageBox message={message} setMessage={setMessage} title='Information'></MessageBox>
                        :
                        null
                }
                <div className="vertical-algin">
                    <h3 className="content-heading">company list</h3>
                    <div className="cr-search">
                        <form onSubmit={searchSubmit}>
                            Search <input className="cr-search-bar" type="text" name="search" placeholder="Company name" required /><i className="fas fa-search vertical-algin"></i>
                        </form>
                    </div>
                </div>
                <div className="clear"></div>
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
                <div className="content-title">
                    <p className="col2">company name</p>
                    <p className="col3">address</p>
                    <p></p>
                    <p></p>
                </div>
                <div id="company-list">
                    {
                        companies.map(item =>
                            <div className="company-item">
                                <p className="col2">{item.companyName}</p>
                                <p className="col3">{item.address}</p>
                                <button className="col4 btn js-btn-detail" onClick={() => { setShowModal('display'); setCompany(item) }}>detail</button>
                                <button className="col5 btn js-btn-delete" onClick={() => deleteCompany(item.companyID.toString())}>delete</button>
                            </div>
                        )
                    }
                    <div className="paging">
                        <button className="paging-btn pre-btn"><i className="fas fa-angle-double-left"></i></button>
                        {
                            pages.map(item =>
                                <NavLink className='page-number' to={'/cre/companies?page=' + item + '&field=' + field + '&name=' + search}>{item}</NavLink>
                            )
                        }
                        <button className="paging-btn next-btn"><i className="fas fa-angle-double-right"></i></button>
                    </div>
                </div>
            </div>

            <div className={'modal ' + showModal}>
                <div className="modal-content js-modal-content">
                    <div className="modal-header">
                        <span className="close-modal" onClick={() => setShowModal('')}>
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
                                {
                                    company?.introduction != null ?
                                        company.introduction.split('\n').map(item =>
                                            <span>{item}</span>
                                        )
                                        :
                                        null
                                }
                            </div>
                        </div>
                        <div className="company-infor">
                            <p className="company-infor-title">Job position</p>
                            <div className="company-infor-desc">
                                {
                                    company?.applyPosition != null ?
                                        company.applyPosition.split('\n').map(item =>
                                            [<span>{item}</span>, <br></br>, <br></br>]
                                            
                                        )
                                        :
                                        null
                                }
                            </div>
                        </div>
                        <div className="company-infor">
                            <div className="company-infor-desc">
                            {
                                    company?.description != null ?
                                        company.description.split('\n').map(item =>
                                            [<span>{item}</span>, <br></br>, <br></br>]
                                        )
                                        :
                                        null
                                }
                            </div>
                        </div>
                        <div className="divide">
                            <div className="divide-name">Contact information</div>
                            <div className="divide-line"></div>
                        </div>
                        <div className="recruiting-details">
                            <div className="modal-col1">Phone:</div>
                            <div className="modal-col2 js-phone">{company?.phone}</div>
                        </div>
                        <div className="recruiting-details">
                            <div className="modal-col1">Email:</div>
                            <div className="modal-col2 js-email">{company?.email}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CREViewCompany
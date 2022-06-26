import './CRECompanyRegister.css';
import React, { FC, useEffect, useState } from 'react'
import { NavLink, RouteComponentProps, useHistory } from 'react-router-dom';
import { Company, Recruitment, ResponeData } from '../../../model';
interface Props extends RouteComponentProps<{ page: string }> {

}
const CRECompanyRegister: FC<Props> = props => {
    const history = useHistory();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [company, setCompany] = useState<Company>();
    const [pages, setPages] = useState<number[]>([]);
    const [showModal, setShowModal] = useState('');
    const getCompanies = () => {
        const currentPage = parseInt(props.match.params.page);
        fetch('/api/cre/companies/activate/' + currentPage).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData & { companyList: Company[], maxPage: number }>).then(data => {
                    console.log(data)
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
                        console.log(cPages);
                        console.log(data.maxPage);
                        setPages(cPages.length > 0 ? cPages : [1]);
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
    const processRequest = (companyID: string, status: number) => {
        fetch('/api/cre/activate/' + companyID + '/' + status).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData>).then(data => {
                    if (data.error == 0) {
                        getCompanies();
                    }
                });
            }
        })
    }
    useEffect(() => {
        getCompanies();
    }, [props.location.pathname]);
    return (
        <div id='CRECompanyRegister'>
            <div id="content">
                <div className="vertical-algin">
                    <h3 className="content-heading">registered company list</h3>
                </div>
                <div className="content-title">
                    <p className="col2">company name</p>
                    <p className="col3">address</p>
                    <p className="col4"></p>
                </div>
                <div id="company-list">
                    {
                        companies.map(item =>
                            <div className="company-item">
                                <p className="col2">{item.companyName}</p>
                                <p className="col3">{item.address}</p>
                                <div className="col4">
                                    <button className="btn btn-detail" onClick={() => { setShowModal('display'); setCompany(item) }}>detail</button>
                                    <button className="btn btn-middle" onClick={() => processRequest(item.companyID.toString(), 1)}>accept</button>
                                    <button className="btn btn-delete" onClick={() => processRequest(item.companyID.toString(), 2)}>decline</button>
                                </div>
                            </div>
                        )
                    }
                </div>
                <div className="paging">
                    <button className="paging-btn pre-btn"><i className="fas fa-angle-double-left"></i></button>
                    {
                        pages.map(item =>
                            <NavLink to={'/cr/requests/' + item} className="page-number">{item}</NavLink>
                        )
                    }
                    <button className="paging-btn next-btn"><i className="fas fa-angle-double-right"></i></button>
                </div>
            </div>


            <div className={'modal ' + showModal}>
                <div className="modal-content js-modal-content">
                    <div className="modal-header">
                        <span className="close-modal" onClick={() => setShowModal('')}>
                            <i className="fas fa-times"></i>
                        </span>
                        <div className=" row modal-title">
                            <div className="company-introduction col-haft">
                                <h3 className="company-name">{company?.companyName}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="modal-container">
                        <div className="company-infor">
                            <p className="company-infor-title">Website</p>
                            <p className="company-infor-detail js-website">{company?.webSite}</p>
                        </div>
                        <div className="company-infor">
                            <p className="company-infor-title">Industry requirement</p>
                            <p className="company-infor-detail js-industry">{company?.fieldName}</p>
                        </div>
                        <div className="company-infor">
                            <p className="company-infor-title">Workplace</p>
                            <p className="company-infor-detail js-workplace">{company?.address}</p>
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

export default CRECompanyRegister

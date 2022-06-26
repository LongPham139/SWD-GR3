import './CRViewRequest.css';
import React, { FC, useEffect, useState } from 'react'
import { NavLink, RouteComponentProps, useHistory } from 'react-router-dom';
import { Recruitment, ResponeData } from '../../../model';
interface Props extends RouteComponentProps<{ page: string }> {

}
const CRViewRequest: FC<Props> = props => {
    const history = useHistory();
    const [requests, setRequests] = useState<Recruitment[]>([]);
    const [pages, setPages] = useState<number[]>([]);
    const getRequest = () =>
    {
        const currentPage = parseInt(props.match.params.page);
        fetch('/api/cr/requests/' + currentPage).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData & { requestList: Recruitment[], maxPage: number }>).then(data => {
                    console.log(data)
                    if (data.error == 0) {
                        setRequests(data.requestList);
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
    const processRequest = (studentID: string, status: number) => {
        fetch('/api/cr/requests/process/' + studentID + '/' + status).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData>).then(data => {
                    if (data.error == 0) {
                        getRequest();
                    }
                });
            }
        })
    }
    useEffect(() => {
        getRequest();
    }, []);
    return (
        <div id='CRViewRequest'>
            <div id="content">
                    <h3 className="content-heading">application list</h3>
                    <div className="cr-search">
                        <p>Search</p> <input className="cr-search-bar" type="text" name="cr-search" /><i className="fas fa-search vertical-algin"></i>
                    </div>
                <div className="content-title">
                    <p style={{ flexGrow: 0.4 }}>student name</p>
                    <p style={{ flexGrow: 1 }}>roll number</p>
                    <p></p>
                    <p></p>
                    <p></p>
                </div>
                <div id="student-list">
                    {
                        requests.map(item =>
                            <div className="student-item">
                                <p className="col2">{item.fullName}</p>
                                <p className="col3">{item.studentID}</p>
                                <button className="col4 btn js-btn-detail btn-detail" onClick={() => history.push('/cr/student/'+ item.studentID)}>detail</button>
                                <button className="col5 btn js-btn-delete btn-accept" onClick={() => processRequest(item.studentID, 1)}>accept</button>
                                <button className="col6 btn js-btn-delete btn-delete" onClick={() => processRequest(item.studentID, 2)}>decline</button>
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
        </div>
    )
}

export default CRViewRequest

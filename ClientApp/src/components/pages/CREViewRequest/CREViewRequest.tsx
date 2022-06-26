import './CREViewRequest.css';
import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { Request, ResponeData } from '../../../model';
import { NavLink } from 'react-router-dom';
import MessageBox from '../../modules/popups/MessageBox/MessageBox';
interface Props extends RouteComponentProps<{ page: string }> {

}
const CREViewRequest: FC<Props> = props => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [request, setRequest] = useState<Request | null>(null);
    const [pages, setPages] = useState<number[]>([]);
    const [showRequestDetailClass, setShowRequestDetailClass] = useState('');
    const [message, setMessage] = useState('');
    const [showSelectAllClass, setShowSelectAllClass] = useState('');
    const [processNote, setProcessNote] = useState('');
    const showRequestDetail = (request: Request) => {
        fetch('/api/cre/request/detail/' + request.requestID).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData & { request: Request }>).then(data => {
                    if (data.error == 0) {
                        setRequest(data.request);
                        setShowRequestDetailClass('display');
                    }
                });
            }
        })
    }
    const hideRequestDetail = () => {
        setShowRequestDetailClass('');
    }
    const getRequests = (currentPage: number) => {
        fetch('/api/cre/requests/' + currentPage).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData & { maxPage: number, requestList: Request[] }>).then(data => {
                    if (data.error == 0) {
                        setRequests(data.requestList);
                        let startPage = 1, endPage = 5;
                        if (currentPage > 3) {
                            startPage = currentPage - 3;
                            endPage = currentPage + 4;
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
    }
    const processRequest = (request: Request, status: number) => {
        request.requestStatus = status;
        request.processNote = processNote;
        fetch('/api/cre/request',
            {
                headers:
                {
                    "Content-Type": "application/json"
                },
                method: 'POST',
                body: JSON.stringify(request)
            }).then(res => {
                if (res.ok) {
                    (res.json() as Promise<ResponeData>).then(data => {
                        if (data.error == 0) {
                            setRequests(requests.filter(r => r.requestID != request.requestID));
                        }
                        else {
                            setMessage(data.message);
                        }
                        setShowRequestDetailClass('');
                    });
                }
            });
    }

    const checkShowSelectAllOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setShowSelectAllClass('display');
        }
        else {
            setShowSelectAllClass('');
        }
    }
    useEffect(() => {
        const currentPage = parseInt(props.match.params.page);
        getRequests(currentPage);
    }, [props.location.pathname]);
    return (
        <div id="CREViewRequest">
            {
                message != '' ?
                    <MessageBox message={message} setMessage={setMessage} title='Information'></MessageBox> :
                    null
            }
            <div id="content">
                <div className="content-heading">
                    <h3>request list</h3>
                    <select className="types filter--item filter--select" defaultValue='0'>Types
                        <option className="types-item" value="0">All</option>
                        <option className="types-item" value="1">Register</option>
                        <option className="types-item" value="2">Transfer</option>
                        <option className="types-item" value="3">Cancel</option>
                    </select>
                </div>
                <div className="row-selected">
                    <input type="checkbox" id="checkboxAll" name="selectedAll" value="all" onChange={checkShowSelectAllOnChange} /> <span className="checkbox-title">Select All</span>
                    <div className={"btn-interact " + showSelectAllClass}>
                        <button className="btn-accept">accept</button>
                        <button className="btn-decline">decline</button>
                    </div>
                </div>
                <div className="request-list">
                    <div className="request-title">
                        <div className="col2">type</div>
                        <div className="col3">student id</div>
                        <div className="col4">student name</div>
                        <div className="col5">apply company</div>
                        <div className="col6"></div>
                    </div>
                    {
                        requests.map(item =>
                            <div className="request-item">
                                <div className="col2"><span className="request-status">{item.requestTitle}</span></div>
                                <div className="col3">{item.studentID}</div>
                                <div className="col4">{item.fullName}</div>
                                <div className="col5">{item.companyName}</div>
                                <div className="col6"><button className="btn-detail" onClick={() => showRequestDetail(item)}>detail</button></div>
                            </div>
                        )
                    }
                </div>
                <div className="paging">
                    <button className="paging-btn pre-btn"><i className="fas fa-angle-double-left"></i></button>
                    {
                        pages.map(item =>
                            <NavLink to={'/cre/requests/' + item} className='page-number'>{item}</NavLink>
                        )
                    }
                    <button className="paging-btn next-btn"><i className="fas fa-angle-double-right"></i></button>
                </div>




                <div className={'recruitment js-recruitment ' + showRequestDetailClass}>
                    <div className="recruitment-content js-recruitment-content" >
                        <div className="recruitment-header">
                            <span className="close-recruitment js-recruitment-close" onClick={hideRequestDetail}>
                                <i className="fas fa-times"></i>
                            </span>
                            <div className="recruitment-title">
                                <h2>request detail</h2>
                                <div className="underline"></div>
                            </div>
                        </div>
                        <form className="recruitment-container" onSubmit={(e) => e.preventDefault()}>
                            <div className="recruitment-body">
                                <div className="row-popup-detail">
                                    <div className="popup-col1 col--5">type</div>
                                    <div className="popup-col2 col--5">student name</div>
                                    <div className="popup-col3 col--5">student id</div>
                                    <div className="popup-col4 col--5">term</div>
                                    <div className="popup-col5 col--5">company name</div>

                                </div>
                                <div className="row-popup-detail student-information">
                                    <div className="popup-col1 col--5 js-request-status"><span className="request-status">{request?.requestTitle}</span></div>
                                    <div className="popup-col2 col--5 js-student-name">{request?.fullName}</div>
                                    <div className="popup-col3 col--5 js-student-id">{request?.studentID}</div>
                                    <div className="popup-col4 col--5 js-term">sp2021</div>
                                    <div className="popup-col5 col--5 js-term">{request?.companyName}</div>
                                </div>
                                
                                <div className="desc-title">
                                    <p>Process note</p>
                                    <textarea className="description-input" name="processnote" value={processNote} onChange={e => setProcessNote(e.target.value)} cols={30} rows={4}></textarea>
                                </div>
                                <div className="btn-popup-interact display">
                                    <button className="btn btn-popup btn-accept" onClick={() => processRequest(request as Request, 2)}>accept</button>
                                    <button className="btn btn-popup btn-decline" onClick={() => processRequest(request as Request, 3)}>decline</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>



            </div>
        </div>
    )
}

export default CREViewRequest
import './StudentRequestHistory.css';
import React, { FC, useEffect, useState } from 'react'
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { Request, ResponeData } from '../../../model';
interface Props extends RouteComponentProps<{ page: string }> {

}
const StudentRequestHistory: FC<Props> = props => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [pages, setPages] = useState<number[]>([]);
    useEffect(() => {
        const currentPage: number = parseInt(props.match.params.page);
        fetch('/api/student/requests/' + props.match.params.page).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData & { maxPage: number, requests: Request[] }>).then(data => {
                    console.log(data.requests);
                    if (data.error == 0) {
                        setRequests(data.requests);

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
    }, [props.location.pathname]);
    return (
        <div id='StudentRequestHistory'>
            <div id="content">
                <h3>request list</h3>
                <table className="table-request">
                    <tr className="content-heading">
                        <th className="col1">Purpose</th>
                        <th className="col2">Create date</th>
                        <th className="col3">Process note</th>
                        <th className="col4">Status</th>
                        <th className="col5">Change Status Time</th>
                    </tr>
                    {
                        requests.map(item =>
                            <tr className="content-item">
                                <td className="col col1 purpose">{item.purpose}</td>
                                <td className="col col2 create-date">{new Date(item.createDate).toDateString()}</td>
                                <td className="col col3 process-note">{item.processNote}</td>
                                <td className="col col4 status">{item.statusName}</td>
                                <td className="col col5 change-time">{item.changeDate == null ? "" : new Date(item.changeDate).toDateString()}</td>
                            </tr>
                        )
                    }
                </table>
                <div className="paging">
                    <button className="paging-btn pre-btn"><i className="fas fa-angle-double-left"></i></button>
                    {
                        pages.map(item =>
                            <NavLink className='page-number' to={'/student/history/'+item}>{item}</NavLink>
                            )
                    }
                    <button className="paging-btn next-btn"><i className="fas fa-angle-double-right"></i></button>
                </div>
            </div>
        </div>
    )
}

export default StudentRequestHistory

import './CREOJTCreation.css';
import React, { FC, FormEvent, useEffect, useState } from 'react';
import { NavLink, RouteComponentProps, useHistory } from 'react-router-dom';
import {ResponeData, Term } from '../../../model';
import MessageBox from '../../modules/popups/MessageBox/MessageBox';
interface Props extends RouteComponentProps<{page:string}> {

}
const CREOJTCreation: FC<Props> = props => {
    const [pages, setPages] = useState<number[]>([1]);
    const [updateMode, setUpdateMode] = useState(false);
    const [message, setMessage] = useState('');
    const [terms, setterms] = useState<Term[]>([]);
    const [termName, setTermName] = useState('');
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [requestDueDate, setRequestDueDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [termNumber, setTermNumber] = useState<number>(0);
    const getDateFormated = (date: Date) => {
        if (date != null) {
            let day = date.getDate().toString(), month = (date.getMonth()+1).toString(), year = date.getFullYear().toString();
            if ((date.getMonth()+1) < 10) {
                month = '0' + (date.getMonth()+1);
            }
            if (date.getDate() < 10) {
                day = '0'+ date.getDate();
            }
            const result = year + '-' + month + '-' + day;
            console.log(result);
            return result;
        }
        return '';
    }
    const setUpdateTerm = (term:Term) =>
    {
        setUpdateMode(true);
        setStartDate(new Date(term.startDate));
        setRequestDueDate(new Date(term.requestDueDate));
        setEndDate(new Date(term.endDate));
        setTermName(term.termName);
        setTermNumber(term.termNumber);
    }
    const setExitUpdateTerm = () =>
    {
        setUpdateMode(false);
        setStartDate(new Date());
        setRequestDueDate(new Date(new Date()));
        setEndDate(new Date());
        setTermName('');
    }
    const getTerms = () =>
    {
        const currentPage = parseInt(props.match.params.page);
        fetch('/api/cre/terms/'+currentPage).then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData & { termList: Term[], maxPage:number }>).then(data => {
                    setterms(data.termList);
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
                    setOJTDate(new Date());
                });
            }
        });
    }
    const createOJTSubmit = (e: FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        if (updateMode) {
            formData.set('termnumber', termNumber.toString());
            fetch('/api/cre/update',
            {
                method: "POST",
                body: formData
            }).then(res => {
                if (res.ok) {
                    console.log(res);
                    (res.json() as Promise<ResponeData>).then(data => {
                        if (data.error == 0) {
                            setMessage('Term has been updated');
                            getTerms();
                        }
                        else
                        {
                            setMessage(data.message);
                        }
                    });
                }
            });
        }
        else
        {
            fetch('/api/cre/create',
            {
                method: "POST",
                body: formData
            }).then(res => {
                if (res.ok) {
                    console.log(res);
                    (res.json() as Promise<ResponeData>).then(data => {
                        if (data.error == 0) {
                            setMessage('A new term has been created');
                            getTerms();
                        }
                        else
                        {
                            setMessage(data.message);
                        }
                    });
                }
            });
        }
    }
    const setOJTDate = (date :Date) =>
    {
        console.log(date.getMonth());
        setStartDate(date);
        var request = new Date(date);
        request.setDate(date.getDate() + 15);
        setRequestDueDate(request);
        var end = new Date(date);
        end.setDate(date.getDate() + 120);
        setEndDate(end);
    }
    useEffect(() => {
        getTerms();
    }, []);
    return (
        <div id='CREOJTCreation'>
            {
                message != '' ?
                    <MessageBox message={message} setMessage={setMessage} title={'Information'}></MessageBox>
                    :
                    null
            }
            <div id="content">
                <div className="ojt-content js-ojt-content">
                    <form onSubmit={createOJTSubmit}>
                        <div className="ojt-header">
                            <div className="ojt-title">
                                <span>OJT</span> Semester Creation
                            </div>
                            <div className="row-ojt ojt-information">
                                <div className="col-four-ojt">
                                    Semester<br />
                                    <input type="text" className="ojt-semester ojt-input" required name='termname' value={termName} onChange={(e) => setTermName(e.target.value)} />
                                </div>
                                <div className="col-four-ojt">
                                    Start date<br />
                                    <input type="date" className="ojt-start-date ojt-input" required name='startdate' value={getDateFormated(startDate)} onChange={(e) => setOJTDate(new Date(e.target.value))}/>
                                </div>
                                <div className="col-four-ojt">
                                    End request date<br />
                                    <input type="date" className="ojt-end-date ojt-input" required readOnly name='requestduedate' value={getDateFormated(requestDueDate)}/>
                                </div>
                                <div className="col-four-ojt">
                                    End date<br />
                                    <input type="date" className="ojt-end-date ojt-input" required readOnly name='enddate' value={getDateFormated(endDate)}/>
                                </div>
                            </div>

                        </div>
                        <div className="ojt-container">
                            <div className="company-title">
                                <div className="col2">Semeter name</div>
                                <div className="col3">Start date</div>
                                <div className="col4">End request date</div>
                                <div className="col5">End date</div>
                            </div>
                            <div className="company-list">
                                {
                                    terms.map(item =>
                                        <div className="company-item">
                                            <NavLink to={'/cre/students/1/' + item.termNumber} className="col2">{item.termName}</NavLink>
                                            
                                            <div className="col3" onClick={() => setUpdateTerm(item)}>{getDateFormated(new Date(item.startDate))}</div>
                                            <div className="col4" onClick={() => setUpdateTerm(item)}>{getDateFormated(new Date(item.requestDueDate))}</div>
                                            <div className="col5" onClick={() => setUpdateTerm(item)}>{getDateFormated(new Date(item.endDate))}</div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className="flexbox">
                            <div></div>
                            <div className="paging">
                                <button className="paging-btn pre-btn"><i className="fas fa-angle-double-left"></i></button>
                                {
                                    pages.map(item =>
                                        <NavLink to={'/cre/ojt/'+item} className="page-number">{item}</NavLink>
                                        )
                                }
                                <button className="paging-btn next-btn"><i className="fas fa-angle-double-right"></i></button>
                            </div>
                            <div className="btn-cover">
                                <button type='submit' className="btn-ojt-create" style={updateMode ? {background : '#2C5282'} : {}}>
                                    {
                                        updateMode ?
                                        'Update' 
                                        :
                                        'Create'
                                    }
                                </button>
                                {
                                    updateMode ?
                                    <button type='reset' className="btn-ojt-create" style={{marginLeft : '10px'}} onClick={() => setExitUpdateTerm()}>Exit</button>
                                    :
                                    null
                                }
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CREOJTCreation
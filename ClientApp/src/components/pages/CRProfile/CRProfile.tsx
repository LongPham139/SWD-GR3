import './CRProfile.css';
import React, { FC, FormEvent, useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom';
import { Company, Field, ResponeData } from '../../../model';
import MessageBox from '../../modules/popups/MessageBox/MessageBox';
interface Props extends RouteComponentProps {

}
const CRViewProfile: FC<Props> = props => {
    const [company, setCompany] = useState<Company>();
    const [message, setMessage] = useState('');
    const [fields, setFields] = useState<Field[]>([]);
    const [companyField, setCompanyField] = useState<Field[]>([]);
    const [image, setImage] = useState('');
    const [avlaibleField, setAvlaibleField] = useState<Field[]>([]);
    const imageOnChange = (e: HTMLInputElement) => {
        if (e.files && e.files[0]) {
            setImage(URL.createObjectURL(e.files[0]));
        }
    }
    const fieldOnChange = (oldField: Field, newFieldID: number) => {
        if (oldField.fieldID != newFieldID) {
            if (companyField.find(f => f.fieldID == newFieldID) == undefined) {
                const index = companyField.indexOf(oldField);
                setCompanyField([...companyField.slice(0, index), fields.find(f => f.fieldID == newFieldID) as Field, ...companyField.slice(index + 1)])
            }
        }

    }
    const addNewField = () => {
        const avalible: Field[] = [];
        for (let i = 0; i < fields.length; i++) {
            const element = fields[i];
            const ele = companyField.find(f => f.fieldID == element.fieldID);
            if (ele == undefined) {
                avalible.push(element);
            }
        }
        if (avalible.length > 0) {
            setCompanyField([...companyField, avalible[0]]);
            setAvlaibleField([...avlaibleField.slice(1)]);
        }
    }
    const removeField = (field: Field) => {
        if (companyField.length > 1) {
            const index = companyField.indexOf(field);
            setCompanyField([...companyField.slice(0, index), ...companyField.slice(index + 1)])
        }
    }
    const updateCompanySubmit = (e: FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        fetch('/api/cr/company/field',
            {
                headers:
                {
                    "Content-Type": "application/json"
                },
                method: 'POST',
                body: JSON.stringify(companyField)
            }).then(data => {
                fetch('/api/cr/company/update',
                    {
                        method: "POST",
                        body: formData
                    }).then(res => {
                        if (res.ok) {
                            (res.json() as Promise<ResponeData>).then(data => {
                                if (data.error == 0) {
                                    setMessage('Update information successfully');
                                }
                                else {
                                    setMessage(data.message);
                                }
                            });
                            setMessage("Something went wrong, please try again");
                        }
                    });
            });
    }
    const getCompany = () => {
        fetch('/api/cr/company').then(res => {
            if (res.ok) {
                (res.json() as Promise<ResponeData & { company: Company, fields: Field[] }>).then(data => {
                    console.log(data.company);
                    if (data.error == 0) {
                        setCompany(data.company);
                        setImage(data.company.imageURL);
                        setFields(data.fields);
                        setCompanyField(data.company.careerField);
                        const avalible: Field[] = [];
                        for (let i = 0; i < data.fields.length; i++) {
                            const element = data.fields[i];
                            const ele = companyField.find(f => f.fieldID == element.fieldID);
                            if (ele == undefined) {
                                avalible.push(element);
                            }
                        }
                        //setAvlaibleField([...avlaibleField, ...avalible]);
                    }
                });
            }
        });
    }
    useEffect(() => {
        if (fields.length == 0) {
            fetch('/api/auth/field').then(res => {
                if (res.ok) {
                    (res.json() as Promise<ResponeData & { fields: Field[] }>).then(data => {
                        if (data.error == 0) {
                            setFields(data.fields);
                        }
                    });
                }
            });
        }
        getCompany();
        window.onclick = () => {
            setMessage('');
        }
    }, []);
    return (
        <div id='CRProfile'>
            <div id="content">
                {
                    message != '' ?
                        <MessageBox message={message} setMessage={setMessage} title='Information' ></MessageBox>
                        :
                        null
                }
                <form onSubmit={updateCompanySubmit}>
                    <div className="company-profile">
                        <div className="company-logo col-left">
                            <img src={image} alt="" />
                        </div>
                        <div className="company-profile-info col-right">
                            <div className="block">
                                <div className="logo">
                                    <input className="edit-logo" type="file" accept='image' name='image' onChange={(e) => imageOnChange(e.target)} />
                                </div>
                                <div className="industry-list">
                                    {
                                        companyField.map(item =>
                                            <div className="middle">
                                                <i className="fas fa-minus-circle industry-sub" onClick={() => removeField(item)}></i>
                                                <select className="industry-item" value={item.fieldID} onChange={(e) => fieldOnChange(item, parseInt(e.target.value))}>
                                                    {
                                                        fields.map(field =>
                                                            <option value={field.fieldID}>{field.fieldName}</option>
                                                        )
                                                    }
                                                </select>
                                            </div>
                                        )
                                    }
                                    <div className="block industry-add">
                                        <i className="fas fa-plus-circle" onClick={addNewField}></i>
                                    </div>

                                </div>
                            </div>
                            <div className="row-profile">
                                <span>Company name</span>
                                <input className="col-info" name='companyname' required defaultValue={company?.companyName}></input>
                            </div>
                            <div className="row-profile">
                                <span>Website</span>
                                <input className="col-info website" type='url' required name='website' defaultValue={company?.webSite}></input>
                            </div>
                        </div>
                    </div>
                    <div className="company-detail clear">
                        <input type="hidden" name='email' defaultValue={company?.email} />
                        <div className="divide">
                            <div className="divide-name">contact information</div>
                            <div className="divide-line"></div>
                        </div>
                        <div className="row-detail clear">
                            <span>Phone</span>
                            <input className="col-input" type="text" pattern='\d+' minLength={10} maxLength={10} name='phone' required defaultValue={company?.phone} />
                        </div>
                        <div className="row-detail clear">
                            <span>Workplace</span>
                            <input className="col-input" type="text" name='address' required defaultValue={company?.address} />
                        </div>
                        <div className="row-detail clear">
                            <span>Company email</span>
                            <h5 className="col-input">{company?.email}</h5>
                        </div>
                        <div className="divide">
                            <div className="divide-name">introduction</div>
                            <div className="divide-line"></div>
                        </div>
                        <div className="row-profile">
                            <textarea name="introduction" defaultValue={company?.introduction} rows={10}></textarea>
                        </div>
                        <div className="divide">
                            <div className="divide-name">Job posison</div>
                            <div className="divide-line"></div>
                        </div>
                        <div className="row-profile">
                            <textarea name="applyposition" defaultValue={company?.applyPosition} rows={10}></textarea>
                        </div>
                        <div className="divide">
                            <div className="divide-name">description</div>
                            <div className="divide-line"></div>
                        </div>
                        <div className="row-profile">
                            <textarea name="description" defaultValue={company?.description} rows={10}></textarea>
                        </div>
                        <div className="btn-interact">
                            <button className="btn btn-save" type='submit'>Save changes</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CRViewProfile
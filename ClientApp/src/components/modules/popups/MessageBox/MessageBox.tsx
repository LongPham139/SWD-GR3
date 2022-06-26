import './MessageBox.css';
import React, { Dispatch, FC, SetStateAction } from 'react';
interface Props {
    message: string;
    title: string;
    setMessage: Dispatch<SetStateAction<string>>
}
const MessageBox: FC<Props> = props => {
    return (
        <div>
            <div className="msg-request">
                <h4 className="msg-content">{props.message}</h4>
                <button className="msg-close" onClick={() => props.setMessage('')}><i className="fas fa-times"></i></button>
            </div>
        </div>
    )
}

export default MessageBox

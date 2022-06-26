import './Footer.css';
import React, { FC } from 'react'
interface Props {

}
const Footer: FC<Props> = props => {
    return (
        <div id='Footer'>
            <footer id="footer">
                <h3 className="title-content">phân hiệu trường đại học fpt tại thành phố hồ chí minh</h3>
                <div className="contact-list">
                    <div className="contact-item">
                        <p className="contact-name">
                            số điện thoại
                        </p>
                        <p className="contact-description">
                            0934-177-713
                        </p>
                    </div>
                    <div className="contact-item">
                        <p className="contact-name">
                            email
                        </p>
                        <p className="contact-description">
                            qhdn.fuhcm@fe.edu.vn
                        </p>
                    </div>
                    <div className="contact-item">
                        <p className="contact-name">
                            địa chỉ
                        </p>
                        <p className="contact-description">
                            Lô E2a-7, Đường D1 Khu Công nghệ cao, P. Long Thạnh Mỹ, Q.9, TP. Hồ Chí Minh
                        </p>
                    </div>
                    <div className="contact-item">
                        <p className="contact-name">
                            mạng xã hội
                        </p>
                        <div className="contact-description">
                            <i className="fab fa-instagram contact-social--link"></i>
                            <i className="fab fa-facebook-square contact-social--link"></i>
                            <i className="fab fa-twitter contact-social--link"></i>
                            <i className="fab fa-pinterest contact-social--link"></i>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Footer

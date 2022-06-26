import './Index.css'
import React, { FC } from 'react'
interface Props {

}
const Index: FC<Props> = props => {
    return (
        <div id='Index'>
            <div id="content">
                <img className="content-banner" src="images/banner2-min.jpg" alt="banner" />
                <div className="partner">
                    <img className="partner-logo" src="images/partners.PNG" alt="partner" />
                </div>
            </div>
        </div>
    )
}

export default Index

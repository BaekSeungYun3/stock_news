import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faMinus } from '@fortawesome/free-solid-svg-icons';
import './StockHeader.css';

const StockHeader = ({ latestStock }) => {
    
    const formatTime = (time) => {
        const hours = time.slice(0, 2);
        const minutes = time.slice(2, 4);
        const seconds = time.slice(4, 6);
        return `${hours}:${minutes}:${seconds}`;
    };

    const formatNumber = (number) => number.toLocaleString();

    const getPriceDifferenceInfo = (priceDifference, comparisonCode) => {
        const absPriceDifference = Math.abs(priceDifference);
        let text;
        let color;
        let icon;

        switch (comparisonCode) {
            case 1: // 상한
            case 2: // 상승
                text = formatNumber(priceDifference);
                color = 'red';
                icon = faArrowUp;
                break;
            case 3: // 보합
                text = formatNumber(priceDifference);
                color = 'white';
                icon = faMinus;
                break;
            case 4: // 하한
            case 5: // 하락
                text = formatNumber(absPriceDifference);
                color = 'blue';
                icon = faArrowDown;
                break;
            default:
                text = formatNumber(priceDifference);
                color = 'white';
                icon = faMinus;
        }

        return { text, color, icon };
    };

    const priceDifference = latestStock ? parseInt(latestStock.priceDifference, 10) : 0;
    const comparisonCode = latestStock ? parseInt(latestStock.comparisonCode, 10) : null; // 문자열을 정수로 변환
    const { text: priceDifferenceText, color: priceDifferenceColor, icon: priceDifferenceIcon } = getPriceDifferenceInfo(priceDifference, comparisonCode);

    return (
        <div className="latest-stock-info">
            &nbsp;&nbsp;삼성전자 005930
            <br />
            {latestStock ? (
                <table>
                    <tbody>
                        <tr>
                            <td rowSpan="2">
                                현재 가격&nbsp;|&nbsp;
                                <span style={{ color: priceDifferenceColor }}>
                                    {latestStock.price.toLocaleString()}원
                                    <br />
                                    <span style={{ color: 'white' }}>전일대비&nbsp;</span>
                                    <span style={{ marginLeft: '5px', color: priceDifferenceColor }}>
                                        {priceDifferenceText && <FontAwesomeIcon icon={priceDifferenceIcon} />}
                                        {priceDifferenceText && ` ${priceDifferenceText}원`}
                                    </span>
                                </span>
                            </td>
                            <td>거래시간&nbsp;|&nbsp;{formatTime(latestStock.timestamp)}</td>
                            <td>누적 거래량&nbsp;|&nbsp;{latestStock.cumulativeVolume.toLocaleString()} 주</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ color: 'green' }}>시가&nbsp;|&nbsp;{latestStock.openingPrice.toLocaleString()}원</td>
                            <td style={{ color: 'red' }}>고가&nbsp;|&nbsp;{latestStock.highPrice.toLocaleString()}원</td>
                            <td style={{ color: 'blue' }}>저가&nbsp;|&nbsp;{latestStock.lowPrice.toLocaleString()}원</td>
                        </tr>
                    </tbody>
                </table>
            ) : (
                <p>로딩 중...</p>
            )}
        </div>
    );
};

export default StockHeader;

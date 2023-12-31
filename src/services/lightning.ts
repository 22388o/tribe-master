import React, { useEffect } from "react"
import {  
    sendPayment,
    receivePayment,
    BOLT11,
} from "@breeztech/react-native-breez-sdk";

try {
    const invoice = await receivePayment({
        amountMsat: 0, 
        description: "Invoice for sats"
    })
} catch (error) {
    console.log(error)
}

const bolt11 = await receiveBolt12 ({
try {
    const payment = await sendPayment(bolt11, 3000)
} catch (error) {
    console.log(error)
}

import React, { useEffect } from "react"
import {  
    sendPayment,
    receivePayment,
} from "@breeztech/react-native-breez-sdk";

try {
    const invoice = await receivePayment({
        amountMsat: 3_000_000, 
        description: "Invoice for 3000 sats"
    })
} catch (error) {
    console.log(error)
}

const bolt11 = "..."
try {
    const payment = await sendPayment(bolt11, 3000)
} catch (error) {
    console.log(error)
}

import { NextApiRequest, NextApiResponse } from "next";

export default async function actionData(req:NextApiRequest,res:NextApiResponse){
 const {hash,ip_address,action} = req.query
 const response:any = await fetch(`${process.env.API_URL}/file?hash=${hash}&ip_address=${ip_address}&action=${action}`)
 const data = await response.json()
 res.send(data)
}
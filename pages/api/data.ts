import { NextApiRequest, NextApiResponse } from "next";

export default async function apiData(req:NextApiRequest,res:NextApiResponse){
 const {hash,referer} = req.query
 if (referer == process.env.REFERER){
     const response:any = await fetch(`${process.env.API_URL}/file?hash=${hash}`)
     const data = await response.json()
     res.send(data)
 } else {
     res.send({"message":"Access Denied"})
 }
}

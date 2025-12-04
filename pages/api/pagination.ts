import { NextApiRequest, NextApiResponse } from "next";

export default async function apiPagination(req:NextApiRequest,res:NextApiResponse){
    const {page,uuid,sort} = req.query
    if (uuid == process.env.UUID_SECRET){
        const response:any = await fetch(`${process.env.API_URL}/recent/search?ref_secret=${process.env.REF_SECRET}&page=${page}&sort=${sort}`)
        const data = await response.json()
        res.send(data)
    } else {
        res.send({"message":"Access Denied"})
    }
}

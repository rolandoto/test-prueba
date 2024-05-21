const {response, json, query} = require('express')

const GetHotels =async(req,res=response) =>{

    try {
        const response = await fetch(`https://hotels.cloudbeds.com/api/v1.1/getHotels`, {
            method: "GET",
            headers: { 'Content-type': 'application/json',
            'Authorization': `Bearer cbat_IQWnqN9nTQLBc1mqd8DrCK8CiKbYjXiV` }
        });

        if (response.status === 401) {
            return res.status(401).json({ ok: false });
        }

        const data = await response.json();

        return res.status(201).json({
            ok:true,
            data
        })

    } catch (error) {
        return res.status(401).json({
            ok:false
        })
    }

}
module.exports ={
    GetHotels
}
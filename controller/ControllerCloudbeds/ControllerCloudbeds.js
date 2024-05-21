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

const GetHotelsbyID =async(req,res=response) =>{

    const {id} = req.params

    try {

    const response = await fetch(`https://api.cloudbeds.com/api/v1.1/getHotelDetails?propertyID=${id}`, {
            method: "GET",
            headers: { 'Content-type': 'application/json',
            'Authorization': `Bearer cbat_IQWnqN9nTQLBc1mqd8DrCK8CiKbYjXiV` }
        });

        if (response.status === 401) {
            return res.status(401).json({ ok: false });
        }
        
        const {data} = await response.json();

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

const GetReservationBypropertyID =async(req,res=response) =>{

    const {id} = req.params

    try {

    const response = await fetch(`https://api.cloudbeds.com/api/v1.1/getReservations?propertyID=${id}`, {
            method: "GET",
            headers: { 'Content-type': 'application/json',
            'Authorization': `Bearer cbat_IQWnqN9nTQLBc1mqd8DrCK8CiKbYjXiV` }
        });

        if (!response) {
            // If access is denied, return 401 status code
            if (response.status === 401) {
                return res.status(401).json({ ok: false });
            }
            // For other errors, return 500 status code
            return res.status(401).json({ ok: false });
        }

        const {data} = await response.json();

        if(!data){
            return res.status(401).json({
                ok:false
            })
        }

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
    GetHotels,
    GetHotelsbyID,
    GetReservationBypropertyID
}
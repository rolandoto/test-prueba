const { response, query } = require("express");
const { pool } = require("../database/connection");
const fetch = require("node-fetch");
const moment = require("moment/moment");
const { FechaFormato } = require("../middleweres/FechaFormato");
const axios = require("axios");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const uuid = require("uuid");

const GetRooms = async (req, res = response) => {
  const { id } = req.params;

  try {
        const query = await pool.query(
          "SELECT OcasioTarifa, HoraAdicional ,Fecha_today, rooms.id as idTipoHabitacion,rooms.name as nombre, Habitaciones.ID as id, Habitaciones.ID_Tipo_habitaciones, Habitaciones.ID_Tipo_estados, Habitaciones.Numero as title, ID_estado_habitacion, MAX(RoomOcasionales.Time_ingreso) as Time_ingreso, MAX(RoomOcasionales.Time_salida) as Time_salida, RoomOcasionales.Fecha FROM Habitaciones LEFT JOIN RoomOcasionales ON RoomOcasionales.ID_habitacion = Habitaciones.ID AND RoomOcasionales.Fecha = CURDATE() AND RoomOcasionales.valid =1 INNER join rooms ON rooms.id = Habitaciones.ID_Tipo_habitaciones WHERE Habitaciones.ID_Hotel=? GROUP BY Habitaciones.id ORDER BY Habitaciones.ID DESC;",
          [id]
        );


      const queryOne =   query.map((element) => {
          const roomObject = {
            title: `${element.title} ${element.nombre}`,
            id: element.id,
            ID_Tipo_estados: element.ID_Tipo_estados,
            ID_Tipo_habitaciones: element.idTipoHabitacion,
            ID_estado_habiatcion: element.ID_estado_habitacion, // Obtenemos el parent del mapa// Establecemos root: true en el primer elemento del grupo
            Time_ingreso: element.Time_ingreso,
            Time_salida: element.Time_salida,
            Fecha: element.Fecha,
            Numero:element.title,
            Fecha_today:element.Fecha_today,
            tarifaOcasioanal:element.OcasioTarifa,
            HoraAdicional:element.HoraAdicional
          };
          return roomObject;
        });

    const flattenedRooms = queryOne
      .sort((a, b) => a.Numero - b.Numero);

    

    if (flattenedRooms.length === 0) {
      return res.status(401).json({
        ok: false,
      });
    }

    res.status(201).json({
      ok: true,
      query: flattenedRooms,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
      msg: "comuniquese con el administrador",
    });
  }
};

const PostRoomDetailUpdate = async (req, res = response) => {
  const { ID_estado_habitacion, id } = req.body;

  try {
    let data = {
      ID_estado_habitacion,
    };

    let dataResevation ={
      ID_Tipo_Estados_Habitaciones:6
    }

    if(ID_estado_habitacion ==0){

      const to = await pool.query("SELECT * FROM `Reservas` WHERE `ID_Habitaciones` = ? AND `ID_Tipo_Estados_Habitaciones` = 2",[id])
      const result = to[0]?.ID;

      await pool.query("DELETE FROM web_checking WHERE ID_Reserva = ?", [result]);
      await pool.query("DELETE FROM Reservas WHERE ID = ?", [result]);
      
      await pool.query(
        "UPDATE Habitaciones SET ? WHERE ID = ?",
        [data, id],
        (err, customer) => {
          if (err) {
            return res.status(401).json({
              ok: false,
              msg: "Error al insertar datos",
            });
          }  
            const insertSecondQuery = async () => {
            pool.query(
              "UPDATE Reservas set ? WHERE ID_Tipo_Estados_Habitaciones = 1 and ID_Habitaciones =? ",
              [dataResevation, id],
              (err, customer) => {
                if (err) {
                  return res.status(401).json({
                    ok: false,
                    msg: "error al insertar datos",
                  });
                } else {
                  return res.status(201).json({
                    ok: true,
                  });
                }
              }
            );
          };
          insertSecondQuery();
        }
      );

    }else if(ID_estado_habitacion ==5){

      const to = await pool.query("SELECT * FROM `Reservas` WHERE `ID_Habitaciones` = ? AND `ID_Tipo_Estados_Habitaciones` = 2",[id])
      const result = to[0]?.ID;

      await pool.query("DELETE FROM web_checking WHERE ID_Reserva = ?", [result]);
      await pool.query("DELETE FROM Reservas WHERE ID = ?", [result]);
      
      await pool.query(
        "UPDATE Habitaciones SET ? WHERE ID = ?",
        [data, id],
        (err, customer) => {
          if (err) {
            return res.status(401).json({
              ok: false,
              msg: "Error al insertar datos",
            });
          }  
            const insertSecondQuery = async () => {
            pool.query(
              "UPDATE Reservas set ? WHERE ID_Tipo_Estados_Habitaciones = 1 and ID_Habitaciones =? ",
              [dataResevation, id],
              (err, customer) => {
                if (err) {
                  return res.status(401).json({
                    ok: false,
                    msg: "error al insertar datos",
                  });
                } else {
                  return res.status(201).json({
                    ok: true,
                  });
                }
              }
            );
          };
          insertSecondQuery();
        }
      );

    }else{

    await pool.query(
      "UPDATE Habitaciones SET ? WHERE ID = ?",
      [data, id],
      (err, customer) => {
        if (err) {
          return res.status(401).json({
            ok: false,
            msg: "Error al insertar datos",
          });
        } else {
          return res.status(201).json({
            ok: true,
          });
        }
      }
    );
    }

  } catch (error) {
    return res.status(401).json({
      ok: false,
    });
  }
};

const validateAvaible = async (req, res = response) => {
  const {
    desde,
    hasta,
    habitaciones,
    disponibilidad,
    id_estados_habitaciones,
    ID_Canal,
    Adultos,
    Ninos,
    ID_Talla_mascota,
    Infantes,
    Noches,
    Observacion,
    huespe,
    valor,
    ID_Tipo_Forma_pago,
    abono,
    valor_habitacion,
    Tipo_persona,
    valor_dia_habitacion,
    resepcion,
    link,
    id_hotel,
    nowOne,
    ID_facturacion,
    id_user
  } = req.body;

  const date1 = new Date(desde);
  const date2 = new Date(hasta);

  try {
    if (date1 > date2) {
      return res.status(201).json({
        msg: "no puede ser mayor de la fecha",
        ok: false,
      });
    }


    const resultado = await pool.query(
      "SELECT COUNT(*) AS Num_Reservas FROM Reservas WHERE ID_Habitaciones = ? AND Reservas.ID_Tipo_Estados_Habitaciones !=6 AND Reservas.ID_Tipo_Estados_Habitaciones !=7 AND ((Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio >= ? AND Fecha_final <=  ?))",
      [disponibilidad, desde, desde, hasta, hasta, desde, hasta]
    );

    if (resultado[0].Num_Reservas == 0) {
      let desdeSinHora = desde.split(" ", 1);
      let hastaSinHora = hasta.split(" ", 1);

      //const reservation = await pool.query("SELECT Reservas.ID_Habitaciones,  Reservas.ID, Reservas.Codigo_reserva FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones =? AND Reservas.Fecha_inicio BETWEEN ? AND ? OR Reservas.Fecha_final BETWEEN ? AND ?",[habitaciones, desde, hasta, desde, hasta])
      const reservation = await pool.query(
        "SELECT * FROM Lista_Fechas_Reservada INNER JOIN Habitaciones ON Lista_Fechas_Reservada.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones = ? AND Lista_Fechas_Reservada.Date > ? AND  Lista_Fechas_Reservada.Date <= ? GROUP BY Lista_Fechas_Reservada.ID_Habitaciones",
        [habitaciones, desdeSinHora, hastaSinHora]
      );

      //disponibilidad
      const avaible = await pool.query(
        "SELECT ID  FROM Habitaciones WHERE ID_Tipo_habitaciones = ? ",
        [habitaciones]
      );

      let result1 = avaible.map((index) => {
        return index.ID;
      });

      var n1 = 20000;
      var n2 = 10000;
      var numero = Math.floor(Math.random() * (n1 - (n2 - 1))) + n2;

      let id_disponible = disponibilidad;

      if (reservation.length == 0) {
        id_disponible = id_disponible;
      }

      const data = {
        ID_Usuarios: 1,
        ID_Habitaciones: parseInt(id_disponible.toString()),
        ID_Talla_mascota: ID_Talla_mascota,
        Codigo_reserva: numero,
        Adultos: Adultos,
        Ninos: Ninos,
        Infantes: Infantes,
        Fecha_inicio: desde,
        Fecha_final: hasta,
        Noches: Noches,
        Descuento: 0,
        ID_Canal: ID_Canal,
        ID_Tipo_Estados_Habitaciones: id_estados_habitaciones,
        Observacion: Observacion,
      };

      const to = await pool.query("INSERT INTO Reservas set ?", data);

      const queryResult = await pool.query(
        "SELECT MAX(ID) as max FROM Reservas"
      );
      const result = queryResult[0].max;
   
      const newReservation = {
        ID_Tipo_estados: 2,
      };

      await pool.query("UPDATE Habitaciones set ? WHERE ID = ?", [
        newReservation,
        data.ID_Habitaciones,
      ]);

      for (let i = 0; i < huespe?.length; i++) {
        if (i == 0) {
          const date = {
            ID_Reserva: parseInt(result.toString()),
            ID_Tipo_documento: huespe[i]?.Tipo_documento,
            Num_documento: huespe[i]?.Num_documento,
            Nombre: huespe[i]?.Nombre,
            Apellido: huespe[i]?.Apellido,
            Fecha_nacimiento: huespe[i]?.Fecha_nacimiento,
            Celular: huespe[i]?.Celular,
            Correo: huespe[i]?.Correo,
            Ciudad: huespe[i]?.Ciudad,
            ID_Prefijo: huespe[i]?.Nacionalidad,
            Tipo_persona: Tipo_persona,
            Firma: 0,
            Iva: 2,
            ID_facturacion:""
          };

          const toone = pool.query(
            "INSERT INTO  web_checking set ?",
            date,
            (q_err, q_res) => {
              if (q_err)
                return res.status(401).json({
                  ok: false,
                });
            }
          );
        }

          const huep = {
            ID_Reserva: parseInt(result.toString()),
            ID_Tipo_documento: huespe[i]?.Tipo_documento,
            ID_Tipo_genero: 1,
            Num_documento: huespe[i]?.Num_documento,
            Nombre: huespe[i]?.Nombre,
            Apellido: huespe[i]?.Apellido,
            Fecha_nacimiento: huespe[i]?.Fecha_nacimiento,
            Celular: huespe[i]?.Celular,
            Correo: huespe[i]?.Correo,
            Ciudad: huespe[i]?.Ciudad,
            ID_Prefijo: huespe[i]?.Nacionalidad,
          };

      

        const totwo = pool.query(
          "INSERT INTO  Huespedes  set ?",
          huep,
          (q_err, q_res) => {
            if (q_err)
              return res.status(401).json({
                ok: false,
                msg: "error de web huespedes",
              });
          }
        );
      }

      const pay = {
        ID_Reserva: parseInt(result.toString()),
        ID_Motivo: 1,
        ID_Tipo_Forma_pago,
        Valor: valor,
        Abono: abono,
        Valor_habitacion: valor_habitacion,
        valor_dia_habitacion: valor_dia_habitacion,
        pago_valid: 1,
      };

      const tothre = pool.query("INSERT INTO  Pagos  set ?", pay);

      const dataPayAbono = {
        ID_Reserva: parseInt(result.toString()),
        Abono: abono,
        Fecha_pago: nowOne,
        Tipo_forma_pago: ID_Tipo_Forma_pago,
        Nombre_recepcion: resepcion,
      };

      if (abono > 0) {
        const payAbono = pool.query(
          "INSERT INTO  Pago_abono  set ?",
          dataPayAbono
        );
      }

      return res.status(201).json({
        ok: true,
        codigo: parseInt(result.toString())
      });
    } else {
      return res.status(401).json({
        ok: false,
      });
    }
  } catch (error) {

    res.status(401).json({
      ok: false,
      msg: "comuniquese con el administrador ",
    });
  }
};

async function postApiWhasatapp({
  to,
  nombre,
  codigo,
  link,
  resepcion,
  addres,
}) {
  const formData = new URLSearchParams();
  formData.append("body", "check_reserva_v3");
  formData.append(
    "token",
    "1c38cf1f1b92656924501747a458e4a6b5ac30306d29ed668f9bd8f99f2832fc6ee451"
  );
  formData.append("instance", "268");
  formData.append("to", to);
  formData.append("language", "es");
  formData.append("type", "text");

  const parametros = [
    { type: "text", text: `${nombre}` },
    { type: "text", text: `${codigo}` },
    { type: "text", text: `${resepcion}` },
    { type: "text", text: `${addres}` },
  ];

  formData.append("parameters", JSON.stringify(parametros));
  try {
    const response = await fetch(
      "https://whatslight.com/manager/ajax/chat_api.ajax.php",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Response is not ok");
    }

    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    console.log(error);
  }
}

const insertReservaRecepcion = async (req, res = response) => {
  try {
    return res.status(201).json({
      ok: true,
    });
  } catch (error) {
    return res.status(401).json({
      ok: false,
    });
  }
};

const getTypePet = async (req, res = response) => {
  try {
    const query = await pool.query(
      "SELECT ID, Talla as nombre FROM Talla_mascota"
    );

    res.status(201).json({
      ok: true,
      query,
    });
  } catch (error) {
    res.status(201).json({
      ok: false,
    });
  }
};

const getReserva = async (req, res = response) => {
  const { id } = req.params;
  const {type} = req.body

  try {
    if(type){
      const response = await pool.query(
        `SELECT web_checking.ID_facturacion, web_checking.Celular,Prefijo_number.codigo ,Prefijo_number.nombre as nacionalidad, web_checking.Num_documento, web_checking.Nombre,web_checking.Apellido, Reservas.ID_Canal, Reservas.Noches,Reservas.Adultos,Reservas.Ninos, Reservas.ID_Tipo_Estados_Habitaciones ,Habitaciones.Numero, Reservas.ID, Reservas.ID_Habitaciones, Reservas.Codigo_reserva, Reservas.Fecha_inicio, Reservas.Fecha_final,Reservas.Observacion, Habitaciones.ID_Tipo_estados , Pagos.Valor_habitacion,Pagos.Abono,Pagos.valor_dia_habitacion FROM Reservas INNER JOIN Habitaciones ON Habitaciones.ID = Reservas.ID_Habitaciones INNER join web_checking on web_checking.ID_Reserva = Reservas.id INNER JOIN Pagos on Pagos.ID_Reserva = Reservas.id INNER join Prefijo_number on Prefijo_number.ID = web_checking.ID_Prefijo WHERE Habitaciones.ID_Hotel =? and Pagos.pago_valid =1 and Reservas.ID_Tipo_Estados_Habitaciones = 6 and Reservas.ID_Tipo_Estados_Habitaciones != 7 and  MONTH(Reservas.Fecha_inicio) BETWEEN 1 AND 7;  `,
         [id]
       );
       const promises = [];
        

       for (let i = 0; i < response.length; i++) {
       
         promises.push({
           Num_Room: response[i].Numero,
           Codigo_reservaOne: `X14A-${response[i].Num_documento}${response[i].ID}`,
           Observation: response[i].Observacion,
           Noches: response[i].Noches,
           Adultos: response[i].Adultos,
           Ninos: response[i].Ninos,
           Title: `${response[i].Numero} ${response[i].Nombre} ${response[i].Apellido}`,
           ID: response[i].ID,
           ID_Habitaciones: response[i].ID_Habitaciones,
           Codigo_reserva: response[i].Codigo_reserva,
           Fecha_inicio: response[i].Fecha_inicio,
           Fecha_final: response[i].Fecha_final,
           ID_Tipo_estados: response[i].ID_Tipo_Estados_Habitaciones,
           Nombre: response[i].Nombre,
           Document: response[i].Num_documento,
           Last_name: response[i].Apellido,
           Valor_habitacion: response[i].Valor_habitacion,
           abono: response[i].Abono,
           Celular: response[i].Celular,
           codigo: response[i].codigo,
           nacionalidad: response[i].nacionalidad,
           valor_dia_habitacion: response[i].valor_dia_habitacion,
           ID_facturacion:response[i].ID_facturacion,
           ID_Canal:response[i].ID_Canal
         });
       }
 

       const query = await Promise.all(promises);
   
       return res.status(201).json({
         ok: true,
         query,
       });
      
    }else{
      const response = await pool.query(
        `SELECT web_checking.ID_facturacion, Reservas.ID_Canal, web_checking.Celular,Prefijo_number.codigo ,Prefijo_number.nombre as nacionalidad, web_checking.Num_documento, web_checking.Nombre,web_checking.Apellido, Reservas.Noches,Reservas.Adultos,Reservas.Ninos, Reservas.ID_Tipo_Estados_Habitaciones ,Habitaciones.Numero, Reservas.ID, Reservas.ID_Habitaciones, Reservas.Codigo_reserva, Reservas.Fecha_inicio, Reservas.Fecha_final,Reservas.Observacion, Habitaciones.ID_Tipo_estados , Pagos.Valor_habitacion,Pagos.Abono,Pagos.valor_dia_habitacion FROM Reservas INNER JOIN Habitaciones ON Habitaciones.ID = Reservas.ID_Habitaciones INNER join web_checking on web_checking.ID_Reserva = Reservas.id INNER JOIN Pagos on Pagos.ID_Reserva = Reservas.id INNER join Prefijo_number on Prefijo_number.ID = web_checking.ID_Prefijo WHERE Habitaciones.ID_Hotel =? and Pagos.pago_valid =1 and Reservas.ID_Tipo_Estados_Habitaciones != 6 and Reservas.ID_Tipo_Estados_Habitaciones != 7  `,
         [id]
       );
   
       const promises = [];
   
       for (let i = 0; i < response.length; i++) {
       
         promises.push({
           Num_Room: response[i].Numero,
           Codigo_reservaOne: `X14A-${response[i].Num_documento}${response[i].ID}`,
           Observation: response[i].Observacion,
           Noches: response[i].Noches,
           Adultos: response[i].Adultos,
           Ninos: response[i].Ninos,
           Title: `${response[i].Numero} ${response[i].Nombre} ${response[i].Apellido}`,
           ID: response[i].ID,
           ID_Habitaciones: response[i].ID_Habitaciones,
           Codigo_reserva: response[i].Codigo_reserva,
           Fecha_inicio: response[i].Fecha_inicio,
           Fecha_final: response[i].Fecha_final,
           ID_Tipo_estados: response[i].ID_Tipo_Estados_Habitaciones,
           Nombre: response[i].Nombre,
           Document: response[i].Num_documento,
           Last_name: response[i].Apellido,
           Valor_habitacion: response[i].Valor_habitacion,
           abono: response[i].Abono,
           Celular: response[i].Celular,
           codigo: response[i].codigo,
           nacionalidad: response[i].nacionalidad,
           valor_dia_habitacion: response[i].valor_dia_habitacion,
           ID_facturacion:response[i].ID_facturacion,
           ID_Canal:response[i].ID_Canal
         });
       }
 
       const query = await Promise.all(promises);
       

       return res.status(201).json({
         ok: true,
         query,
       });
    }
      
   
  } catch (error) {
    res.status(201).json({
      ok: false,
    });
  }
};

const PostReserva = async (req, res = response) => {
  const { id } = req.params;
  const {type} = req.body

  const desde ="2023-11-20 15:00:00"
  const hasta = "2023-11-26 15:00:00"

  try {

      const response = await pool.query(
       `SELECT web_checking.Celular,Prefijo_number.codigo ,Prefijo_number.nombre as nacionalidad, web_checking.Num_documento, web_checking.Nombre,web_checking.Apellido, Reservas.Noches,Reservas.Adultos,Reservas.Ninos, Reservas.ID_Tipo_Estados_Habitaciones ,Habitaciones.Numero, Reservas.ID, Reservas.ID_Habitaciones, Reservas.Codigo_reserva, Reservas.Fecha_inicio, Reservas.Fecha_final,Reservas.Observacion, Habitaciones.ID_Tipo_estados , Pagos.Valor_habitacion,Pagos.Abono,Pagos.valor_dia_habitacion FROM Reservas INNER JOIN Habitaciones ON Habitaciones.ID = Reservas.ID_Habitaciones INNER join web_checking on web_checking.ID_Reserva = Reservas.id INNER JOIN Pagos on Pagos.ID_Reserva = Reservas.id INNER join Prefijo_number on Prefijo_number.ID = web_checking.ID_Prefijo WHERE Habitaciones.ID_Hotel =? and Pagos.pago_valid =1 and Reservas.ID_Tipo_Estados_Habitaciones = 0 and  ((Fecha_inicio <= ? AND Fecha_inicio >=  ?) OR (Fecha_inicio <= ? AND Fecha_inicio >=  ?) OR (Fecha_inicio >= ? AND Fecha_inicio <=  ?))`,
        [id,desde, hasta, desde, hasta, desde, hasta]
      );
  
      const promises = [];
  
      for (let i = 0; i < response.length; i++) {
        const daytBefore = moment(response[i].Fecha_final)
          .utc()
          .format("YYYY/MM/DD");
  
        const now = moment().format("YYYY/MM/DD");
  
        var fechaInicio = new Date(daytBefore).getTime();
        var fechaFin = new Date(now).getTime();
  
        var diff = fechaFin - fechaInicio;
  
        const day = diff / (1000 * 60 * 60 * 24);
  
        promises.push({
          Num_Room: response[i].Numero,
          Codigo_reservaOne: `X14A-${response[i].Num_documento}${response[i].ID}`,
          Observation: response[i].Observacion,
          Noches: response[i].Noches,
          Adultos: response[i].Adultos,
          Ninos: response[i].Ninos,
          Title: `${response[i].Numero} ${response[i].Nombre} ${response[i].Apellido}`,
          ID: response[i].ID,
          ID_Habitaciones: response[i].ID_Habitaciones,
          Codigo_reserva: response[i].Codigo_reserva,
          Fecha_inicio: response[i].Fecha_inicio,
          Fecha_final: response[i].Fecha_final,
          ID_Tipo_estados: response[i].ID_Tipo_Estados_Habitaciones,
          Nombre: response[i].Nombre,
          Document: response[i].Num_documento,
          Last_name: response[i].Apellido,
          Valor_habitacion: response[i].Valor_habitacion,
          abono: response[i].Abono,
          Celular: response[i].Celular,
          codigo: response[i].codigo,
          nacionalidad: response[i].nacionalidad,
          valor_dia_habitacion: response[i].valor_dia_habitacion,
        });
      }

      const query = await Promise.all(promises);
  
      return res.status(201).json({
        ok: true,
        query,
      });
  
  } catch (error) {
    res.status(201).json({
      ok: false,
    });
  }
};

const PruebaGet = (req, res = response) => {
  try {
    const prueba = query.pool(
      "SELECT ID, Codigo_reserva FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones = 2 AND Habitaciones.ID_Tipo_estados == 1 AND Reservas.Fecha_inicio >= 2022-10-9 AND Reservas.Fecha_final <= 2022-10-16"
    );

    return res.status(201).json({
      ok: true,
    });
  } catch (error) {
    res.status(201).json({
      ok: false,
    });
  }
};

const GetCanales = async (req, res = response) => {
  try {
    const query = await pool.query("SELECT * FROM Canales");

    res.status(201).json({
      ok: true,
      query,
    });
  } catch (error) {
    res.status(201).json({
      ok: false,
    });
  }
};

/*const avaibleRecection =async(req,res=response) =>{

    const  {desde,hasta,habitaciones} = req.body

    const date1 = new Date(desde)
    const date2 = new  Date(hasta)

    var prueba=  desde.split(" ",1).toString()
    var pruebaone=  hasta.split(" ",1).toString()
    
    var fechaInicio = new Date(prueba)
    var fechaFin = new Date(pruebaone)
    
    const fecha_final = []
                
    while(fechaFin.getTime() >= fechaInicio.getTime()){
        fechaInicio.setDate(fechaInicio.getDate() + 1);
           fecha_final.push(fechaInicio.getFullYear() + '/' + (fechaInicio.getMonth() + 1) + '/' + fechaInicio.getDate())
    }

    try {

        if(date1 >date2){
            return  res.status(201).json({
                msg:"no puede ser mayor de la fecha",
                ok:false,
            })
        }
        //reservas
        let desdeSinHora = desde.split(' ', 1);
        let hastaSinHora = hasta.split(' ', 1);


       const reservation = await pool.query("SELECT ID_Habitaciones FROM Lista_Fechas_Reservada INNER JOIN Habitaciones ON Lista_Fechas_Reservada.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones = ? AND Lista_Fechas_Reservada.Date >= ?  AND  Lista_Fechas_Reservada.Date <= ? AND Proceso = 1  GROUP BY Lista_Fechas_Reservada.ID_Habitaciones",[habitaciones, desdeSinHora, hastaSinHora])
       const reservatioone = await pool.query("SELECT ID_Habitaciones FROM Reservas WHERE Reservas.Fecha_inicio >= ? AND Reservas.Fecha_final <= ?",[desde, hasta])
       
       //const totalValue = fecha_final?.length==2 ? reservatioone :reservation

        //disponibilidad
        const avaible =  await pool.query("SELECT ID  FROM Habitaciones WHERE ID_Tipo_habitaciones = ? ",[habitaciones]) 

        const avaibleList =[]
        
        let listHabitacionesOcupadas = new Array();
        if ( reservation.length > 0 || reservatioone.length > 0 ) {
             
            reservation.forEach( dato => {
                listHabitacionesOcupadas.push(dato);
            });

            reservatioone.forEach(dato => {
                if ( listHabitacionesOcupadas.indexOf(dato) == -1) {
                    listHabitacionesOcupadas.push(dato);
                }
            });
            
        } 

        if(avaible.length > reservation.length ){

            const ray = []

            for(let i =0;i<avaible.length;i++){
                for(let e =0;e<avaible.length;e++){
                    if( avaible[i]?.ID  != listHabitacionesOcupadas[i]?.ID_Habitaciones){
                        ray.push(avaible[i].ID)
                    }else{
                    
                    }
                }
            }

            ray.filter((x, i) =>{
                if(ray.indexOf(x) === i){
                    avaibleList.push(x)
                }
            });
            
        }

 
        const queryDefinid = []
        
        for(let i = 0;i<avaibleList.length;i++){
          const totalHabiatacion =  await pool.query("SELECT * FROM `Habitaciones` WHERE ID = ?",[avaibleList[i]])

          totalHabiatacion.forEach(element =>{
                queryDefinid.push({
                    ID:element.ID,
                    ID_Hotel:element.ID_Hotel,
                    ID_Tipo_habitaciones:element.ID_Tipo_habitaciones,
                    ID_Tipo_estados:element.ID_Tipo_estados,
                    Numero:element.Numero
                })
          })

        }
    


        if(avaibleList.length ==0){
          return  res.status(401).json({
                ok:false,
                msg:"no se encontro nada"
            })
        }

         res.status(201).json({
                ok:true,
                queryDefinid
            })
        
    } catch (error) {
        console.log(error)

        res.status(401).json({
            ok:false
        })
    }
}
*/

const roomAvaible = async (req, res = response) => {
  const { desde, hasta, habitaciones, ID_Habitaciones } = req.body;

  try {
    const date1 = new Date(desde);
    const date2 = new Date(hasta);

    console.log(desde)

    if (date1 > date2) {
      return res.status(401).json({
        msg: "no puede ser mayor de la fecha",
        ok: false,
      });
    }

  
    const resultado = await pool.query(
      "SELECT COUNT(*) AS Num_Reservas FROM Reservas WHERE ID_Habitaciones = ? AND Reservas.ID_Tipo_Estados_Habitaciones !=6 AND Reservas.ID_Tipo_Estados_Habitaciones !=7 AND ((Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio >= ? AND Fecha_final <=  ?))",
      [ID_Habitaciones, desde, desde, hasta, hasta, desde, hasta]
    );

    if (resultado[0].ID_estado_habitacion === 2) {
      return res.status(401).json({
        ok: res.status(401),
      });
    }
    if (resultado[0].Num_Reservas === 0) {
      return res.status(201).json({
        ok: true,
      });
    } else {
      return res.status(401).json({
        ok: false,
      });
    }
  } catch (e) {
    return res.status(401).json({
      ok: false,
    });
  }
};

const updateDetailReserva = async (req, res = response) => {
  const {
    desde,
    hasta,
    habitaciones,
    ID_Habitaciones,
    id,
    dayOne,
    valor_dia_habitacion,
  } = req.body;

  const valorEstadia = dayOne * valor_dia_habitacion;

  try {
    const validate = await pool.query(
      "SELECT Reservas.ID_Tipo_Estados_Habitaciones from Reservas  WHERE Reservas.ID = ?",
      [id]
    );

    const FechaIniFormato = FechaFormato({ desde: desde });
    const FechaFinaFormato = FechaFormato({ desde: hasta });

    if (FechaFinaFormato.fechaFormateada > FechaIniFormato.fechaFormateada) {
      if (validate[0].ID_Tipo_Estados_Habitaciones == 1) {
        return res.status(401).json({
          ok: false,
        });
      }

      if (validate[0].ID_Tipo_Estados_Habitaciones == 3) {
        const fecha = desde;
        const fechaObj = new Date(fecha);
        const anio = fechaObj.getFullYear();
        const mes = fechaObj.getMonth() + 1; // sumamos 1 ya que los meses en JS empiezan en 0 (enero = 0)
        const dia = fechaObj.getDate();

        const fechaFormateada = `${anio}-${mes
          .toString()
          .padStart(2, "0")}-${dia.toString().padStart(2, "0")} 15:00:00`;

        const resultado = await pool.query(
          "SELECT COUNT(*) AS Num_Reservas FROM Reservas WHERE ID_Habitaciones = ? AND Reservas.ID_Tipo_Estados_Habitaciones !=6 ((Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio >= ? AND Fecha_final <=  ?))",
          [
            ID_Habitaciones,
            fechaFormateada,
            fechaFormateada,
            hasta,
            hasta,
            fechaFormateada,
            hasta,
          ]
        );

        if (resultado[0].Num_Reservas === 0) {
          const newCustomer = {
            Fecha_final: hasta,
            Noches: dayOne,
          };
          let data = {
            Valor_habitacion: valorEstadia,
            Valor: valorEstadia,
          };

          await pool.query("UPDATE Reservas set ? WHERE id = ?", [
            newCustomer,
            id,
          ]);

          await pool.query("UPDATE Pagos set ? WHERE ID_Reserva = ?", [
            data,
            id,
          ]);

          return res.status(201).json({
            ok: true,
          });
        } else {
          return res.status(401).json({
            ok: false,
          });
        }
      } else if (validate[0].ID_Tipo_Estados_Habitaciones == 0) {
        const fecha = desde;
        const fechaObj = new Date(fecha);
        const anio = fechaObj.getFullYear();
        const mes = fechaObj.getMonth() + 1; // sumamos 1 ya que los meses en JS empiezan en 0 (enero = 0)
        const dia = fechaObj.getDate();

        const fechaFormateada = `${anio}-${mes
          .toString()
          .padStart(2, "0")}-${dia.toString().padStart(2, "0")} 15:00:00`;

        const resultado = await pool.query(
          "SELECT COUNT(*) AS Num_Reservas FROM Reservas WHERE ID_Habitaciones = ? AND ((Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio >= ? AND Fecha_final <=  ?))",
          [
            ID_Habitaciones,
            fechaFormateada,
            fechaFormateada,
            hasta,
            hasta,
            fechaFormateada,
            hasta,
          ]
        );

        if (resultado[0].Num_Reservas === 0) {
          const newCustomer = {
            Fecha_final: hasta,
            Noches: dayOne,
          };
          let data = {
            Valor_habitacion: valorEstadia,
            Valor: valorEstadia,
          };

          await pool.query("UPDATE Reservas set ? WHERE id = ?", [
            newCustomer,
            id,
          ]);

          await pool.query("UPDATE Pagos set ? WHERE ID_Reserva = ?", [
            data,
            id,
          ]);

          return res.status(201).json({
            ok: true,
          });
        } else {
          return res.status(401).json({
            ok: false,
          });
        }
      } else if (validate[0].ID_Tipo_Estados_Habitaciones == 2) {
        const fecha = desde;
        const fechaObj = new Date(fecha);
        const anio = fechaObj.getFullYear();
        const mes = fechaObj.getMonth() + 1; // sumamos 1 ya que los meses en JS empiezan en 0 (enero = 0)
        const dia = fechaObj.getDate();

        const fechaFormateada = `${anio}-${mes
          .toString()
          .padStart(2, "0")}-${dia.toString().padStart(2, "0")} 15:00:00`;

        const resultado = await pool.query(
          "SELECT COUNT(*) AS Num_Reservas FROM Reservas WHERE ID_Habitaciones = ? AND ((Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio >= ? AND Fecha_final <=  ?))",
          [
            ID_Habitaciones,
            fechaFormateada,
            fechaFormateada,
            hasta,
            hasta,
            fechaFormateada,
            hasta,
          ]
        );

        if (resultado[0].Num_Reservas === 0) {
          const newCustomer = {
            Fecha_final: hasta,
            Noches: dayOne,
          };

          await pool.query("UPDATE Reservas set ? WHERE id = ?", [
            newCustomer,
            id,
          ]);

          return res.status(201).json({
            ok: true,
          });
        } else {
          return res.status(401).json({
            ok: false,
          });
        }
      }
    } else {
      if (validate[0].ID_Tipo_Estados_Habitaciones == 3) {
        const newCustomer = {
          Fecha_final: hasta,
          Noches: dayOne,
        };
        let data = {
          Valor_habitacion: valorEstadia,
          Valor: valorEstadia,
          Abono: valorEstadia,
        };

        await pool.query("UPDATE Reservas set ? WHERE id = ?", [
          newCustomer,
          id,
        ]);

        await pool.query("UPDATE Pagos set ? WHERE ID_Reserva = ?", [data, id]);

        return res.status(201).json({
          ok: true,
        });
      } else if (validate[0].ID_Tipo_Estados_Habitaciones == 0) {
        const newCustomer = {
          Fecha_final: hasta,
          Noches: dayOne,
        };
        let data = {
          Valor_habitacion: valorEstadia,
          Valor: valorEstadia,
        };

        await pool.query("UPDATE Reservas set ? WHERE id = ?", [
          newCustomer,
          id,
        ]);

        await pool.query("UPDATE Pagos set ? WHERE ID_Reserva = ?", [data, id]);

        return res.status(201).json({
          ok: true,
        });
      } else {
        return res.status(401).json({
          ok: false,
        });
      }
    }
  } catch (e) {
    return res.status(401).json({
      ok: false,
    });
  }
};

const updateDetailReservaTypeRoom = async (req, res = response) => {
  const { desde, hasta, ID_Habitaciones, id, ID_Tipo_habitaciones, RoomById } =
    req.body;

  try {
    const fecha = desde;
    const fechaObj = new Date(fecha);
    const anio = fechaObj.getFullYear();
    const mes = fechaObj.getMonth() + 1; // sumamos 1 ya que los meses en JS empiezan en 0 (enero = 0)
    const dia = fechaObj.getDate();

    const fechaFormateadaDesde = `${anio}-${mes
      .toString()
      .padStart(2, "0")}-${dia.toString().padStart(2, "0")} 15:00:00`;

    const fechaOne = hasta;
    const fechaObjOne = new Date(fechaOne);
    const anioOne = fechaObjOne.getFullYear();
    const mesOne = fechaObjOne.getMonth() + 1; // sumamos 1 ya que los meses en JS empiezan en 0 (enero = 0)
    const diaOne = fechaObjOne.getDate();

    const fechaFormateadaHasta = `${anioOne}-${mesOne
      .toString()
      .padStart(2, "0")}-${diaOne.toString().padStart(2, "0")} 13:00:00`;

    const resultado = await pool.query(
      "SELECT COUNT(*) AS Num_Reservas FROM Reservas WHERE ID_Habitaciones = ? AND ((Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio >= ? AND Fecha_final <=  ?))",
      [
        ID_Habitaciones,
        fechaFormateadaDesde,
        fechaFormateadaDesde,
        fechaFormateadaHasta,
        fechaFormateadaHasta,
        fechaFormateadaDesde,
        fechaFormateadaHasta,
      ]
    );

    const Reservation = await pool.query(
      "SELECT Reservas.Noches, Habitaciones.ID_Tipo_habitaciones,Reservas.ID_Tipo_Estados_Habitaciones from Reservas INNER JOIN  Habitaciones on Reservas.ID_Habitaciones = Habitaciones.ID  WHERE  Reservas.ID = ?",
      [id]
    );

    if (resultado[0].Num_Reservas === 0) {
      if (Reservation[0].ID_Tipo_Estados_Habitaciones == 3) {
        const newCustomer = {
          ID_Habitaciones: ID_Habitaciones,
        };
        await pool.query("UPDATE Reservas set ? WHERE id = ?", [
          newCustomer,
          id,
        ]);

        return res.status(201).json({
          ok: true,
        });
      } else if (Reservation[0].ID_Tipo_Estados_Habitaciones == 0) {
        if (Reservation[0].ID_Tipo_habitaciones == ID_Tipo_habitaciones) {
          const newCustomer = {
            ID_Habitaciones: ID_Habitaciones,
          };
          await pool.query("UPDATE Reservas set ? WHERE id = ?", [
            newCustomer,
            id,
          ]);

          return res.status(201).json({
            ok: true,
          });
        } else {
          const newCustomer = {
            ID_Habitaciones: ID_Habitaciones,
          };

          await pool.query("UPDATE Reservas set ? WHERE id = ?", [
            newCustomer,
            id,
          ]);

          return res.status(201).json({
            ok: true,
          });
        }
      } else {
        return res.status(401).json({
          ok: false,
        });
      }
    } else {
      return res.status(401).json({
        ok: false,
      });
    }
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const getDetailReservation = async (req, res = response) => {
  const { id } = req.params;

  try {

    const query = await pool.query(
      "SELECT web_checking.id_prod_card, tableName.City, web_checking.Direcion,web_checking.check_digit,web_checking.Ciudad, Pagos.Retention, web_checking.ID as huesped, rooms.name as nombre_habitacion, web_checking.ID_facturacion, web_checking.ID_Reserva as ID_RESERVA,Reservas.Observacion,Canales.Nombre as Canales_Nombre, web_checking.Tipo_persona as tipo_persona, web_checking.ID as id_persona,web_checking.Foto_documento_adelante,web_checking.Foto_documento_atras,web_checking.Pasaporte,web_checking.Iva, web_checking.Firma, Reservas.ID_Habitaciones, Habitaciones.ID_Tipo_habitaciones, Habitaciones.Numero, Talla_mascota.Talla, Reservas.Codigo_reserva, Reservas.Adultos, Reservas.Ninos, Reservas.Infantes, Reservas.Fecha_inicio, Reservas.Fecha_final, Reservas.Noches, Reservas.Descuento, Reservas.Placa,Reservas.ID_Tipo_Estados_Habitaciones AS Estado, web_checking.ID_Tipo_documento, web_checking.Num_documento, web_checking.Nombre, web_checking.Apellido, web_checking.Fecha_nacimiento, web_checking.Celular, web_checking.Correo, web_checking.Ciudad, Tipo_Forma_pago.Nombre as forma_pago, Pagos.Valor as valor_pago, Pagos.Valor_habitacion as valor_habitacion , Pagos.Abono as valor_abono,Pagos.valor_dia_habitacion, Prefijo_number.nombre as nacionalidad,Prefijo_number.codigo , Pagos.ID as ID_pago, Habitaciones.ID_estado_habitacion,web_checking.ID_facturacion FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN Talla_mascota ON Reservas.ID_Talla_mascota = Talla_mascota.ID INNER JOIN web_checking ON web_checking.ID_Reserva = Reservas.ID INNER JOIN Canales ON Canales.id= Reservas.ID_Canal INNER JOIN Pagos on Reservas.ID = Pagos.ID_Reserva INNER  join Tipo_Forma_pago on Pagos.ID_Tipo_Forma_pago = Tipo_Forma_pago.ID INNER  JOIN  Prefijo_number on web_checking.ID_Prefijo = Prefijo_number.ID INNER JOIN rooms  on rooms.id = Habitaciones.ID_Tipo_habitaciones LEFT JOIN tableName on tableName.ID = web_checking.Ciudad  WHERE Reservas.ID = ? AND Pagos.pago_valid=1 ORDER  by web_checking.ID  DESC;",
      [id]
    );

    if (query.length == 0) {
      return res.status(401).json({
        ok: false,
        msg: "no se encontro ninguna informacion",
      });
    }

    return res.status(201).json({
      ok: true,
      query,
    });
  } catch (error) {
    return res.status(401).json({
      ok: false,
      msg: "comunicase con el administrador",
    });
  }
};

const postCleanlineRooms = (req, res = response) => {};

const getCountry = async (req, res = response) => {
  const query = await pool.query("SELECT * FROM  Prefijo_number");

  res.status(201).json({
    ok: true,
    query,
  });
};

const updateDetailReservation = async (req, res = response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    await pool.query("UPDATE web_checking SET ? WHERE ID = ?", [data, id]);
    await pool.query("UPDATE web_checking SET ? WHERE ID_Reserva = ?", [
      data,
      id,
    ]);

    res.status(201).json({ ok: true });
  } catch (error) {
  
    res.status(500).json({ ok: false });
  }
};

const updateDetailPagos = async (req, res = response) => {
  const { id } = req.params;

  const data = req.body;

  try {
    let dataTwo = {
      Abono: data.Abono,
      Valor: data.Valor,
      Valor_habitacion: data.Valor_habitacion,
    };

    let dataOne = {
      ID_Reserva: id,
      Abono: data.AbonoOne,
      Fecha_pago: data.Fecha_pago,
    };

    await pool.query("INSERT INTO  Pago_abono  set ?", dataOne);

    await pool.query("UPDATE Pagos set ? WHERE ID_Reserva = ?", [dataTwo, id]);

    res.status(201).json({
      ok: true,
    });
  } catch (error) {
   
    res.status(401).json({
      ok: false,
    });
  }
};

const getdetailhuespedes = async (req, res = response) => {
  const { id } = req.params;

  try {
    const link = await pool.query(
      "SELECT Huespedes.ID_Tipo_documento, Huespedes.Correo, Huespedes.Celular, Huespedes.ID as huespedes, Prefijo_number.nombre, Huespedes.Nombre,Huespedes.Apellido,Huespedes.Ciudad,Huespedes.Fecha_nacimiento, Prefijo_number.nombre,Huespedes.ID_Reserva,Huespedes.ID_Tipo_documento,Huespedes.Num_documento, Pagos.Valor_habitacion,Pagos.Abono,Reservas.ID_Habitaciones,Habitaciones.ID_Tipo_habitaciones, Tipo_Forma_pago.Nombre AS nombre_pago from Huespedes INNER JOIN Prefijo_number ON Huespedes.ID_Prefijo = Prefijo_number.ID INNER JOIN Pagos on Huespedes.ID_Reserva = Pagos.ID_Reserva INNER JOIN Reservas ON Huespedes.ID_Reserva = Reservas.ID INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN Tipo_Forma_pago ON Pagos.ID_Tipo_Forma_pago = Tipo_Forma_pago.ID WHERE Huespedes.ID = ? ORDER by Huespedes.ID DESC",
      [id]
    );

    res.status(201).json({
      ok: true,
      link,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
      msg: "comuniquese",
    });
  }
};

const postdetailUpdate = async (req, res = response) => {
  const { id } = req.params;
  const data = req.body;

  try {
    await pool.query("UPDATE Huespedes set ? WHERE ID = ?", [data, id]);
    res.status(201).json({
      ok: true,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

  const getRoomdetalle = async (req, res = response) => {
    const { id } = req.params;

    try {
      const avaible = await pool.query(
        "SELECT ID,Numero  FROM Habitaciones WHERE ID_Tipo_habitaciones = ? ",
        [id]
      );

      res.status(201).json({
        ok: true,
        query: avaible,
      });
    } catch (error) {
      res.status(401).json({
        ok: false,
      });
    }
  };

const uploadImage = async (req, res = response) => {
  var matches = req.body.base64image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
    response = {};

  try {
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

  const insertCartReservation = async (req, res = response) => {
    const {
      Cart,
      ID_Reserva,
      ID_Hoteles,
      Fecha_compra,
      Nombre_recepcion,
      ID_user,
    } = req.body;

    try {
      for (const cartItem of Cart) {
        const data = {
          ID_Reserva,
          Nombre: cartItem?.Nombre,
          Precio: cartItem?.Precio,
          Cantidad: cartItem?.quantity,
          ID_Categoria: cartItem?.id_categoria,
          ID_product: cartItem?.ID,
          ID_Hoteles,
          Fecha_compra,
          Forma_pago: 1,
          Nombre_recepcion,
          img_product: cartItem?.img,
        };
  
        const id = cartItem.ID;
        const dataone = {
          Cantidad: cartItem?.Cantidad - cartItem?.quantity,
        };
  
        await new Promise((resolve, reject) => {
          pool.query('INSERT INTO Carrito_reserva SET ?', data, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });

        await new Promise((resolve, reject) => {
          pool.query('UPDATE Productos SET ? WHERE ID = ?', [dataone, id], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });

      }
  
      return res.status(200).json({
        ok: true,
        msg: "Datos insertados correctamente"
      });
  
     
       /**
        * 
        *  const insertSecondQuery = async() => {
                await pool.query('UPDATE Productos SET ? WHERE ID = ?', [dataone, id], (err, customer) => {
                  if(err){
                    return res.status(401).json({
                         ok:false,
                         msg:"error al insertar datos"
                    })
                  }
                })
              }
              insertSecondQuery()
            }
        * 
        */
        /**await pool.query("INSERT INTO Carrito_reserva SET ?", data);
        // Updating the 'Productos' table
        await pool.query("UPDATE Productos SET ? WHERE ID = ?", [dataone, id]);
        */

    
    } catch (error) {
      return res.status(401).json({
        ok: false,
      });
    }
  };

const insertCartStore = async (req, res = response) => {
  const {
    Cart,
    ID_Reserva,
    ID_hotel,
    Fecha_compra,
    Nombre_persona,
    Forma_pago,
    Num_documento,
    Nombre_recepcion,
    ID_user,
  } = req.body;

  try {

    

    for (const cartItem of Cart) {
      const data = {
        ID_Reserva,
        Nombre: cartItem?.Nombre,
        Precio: cartItem?.Precio,
        Cantidad: cartItem?.quantity,
        ID_Categoria: cartItem?.id_categoria,
        ID_product: cartItem?.ID,
        ID_hotel,
        Fecha_compra,
        Nombre_persona,
        Forma_pago,
        Num_documento,
        Nombre_recepcion,
      };

      const id = cartItem.ID;

      const dataone = {
        Cantidad: cartItem?.Cantidad - cartItem?.quantity,
      };

      await new Promise((resolve, reject) => {
        pool.query('INSERT INTO carrito_tienda SET ?', data, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      await new Promise((resolve, reject) => {
        pool.query('UPDATE Productos SET ? WHERE ID = ?', [dataone, id], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });


     /* await pool.query("INSERT INTO carrito_tienda SET ?", data);
      await pool.query("UPDATE Productos SET ? WHERE ID = ?", [dataone, id]);
      */
    }

    return res.status(201).json({
      ok: true,
    });
  } catch (error) {
  
    return res.status(401).json({
      ok: false,
      error: 'Failed to process the request.',
    });
  }
};

const occasionalCartRoomInsertion =async(req, res = response) =>{
  const {
    ID_habitacion,
    Cart,
    ID_Hoteles,
    Fecha_compra,
    ID_user}  = req.body
      
  try {

    for (let i = 0; i < Cart.length; i++) {
      const data = {
        ID_habitacion: ID_habitacion,
        Nombre: Cart[i]?.Nombre,
        Precio: Cart[i]?.Precio,
        Cantidad: Cart[i]?.quantity,
        ID_Categoria:Cart[i]?.id_categoria,
        ID_Hoteles:ID_Hoteles,
        Fecha_compra:Fecha_compra,
        Forma_pago:1,
        ID_user:ID_user,
        ID_product: Cart[i]?.ID,
        Pago_deuda:0,
        img_product: Cart[i]?.img,
      } 

    await pool.query("INSERT INTO  Carrito_room  set ?", data);

    const id = Cart[i].ID;

    let dataone = {
      Cantidad: Cart[i]?.Cantidad - Cart[i]?.quantity,
    };

    await pool.query("UPDATE Productos set ? WHERE ID = ?", [dataone, id]);

    }
    return res.status(201).json({
      ok:true
    })

  } catch (error) {
    console.log("error")
  }
}

const getCartReservaction = async (req, res = response) => {
  const { id } = req.params;

  try {
    const query = await pool.query(
      "SELECT Tipo_Forma_pago.Nombre as forma_pago, Carrito_reserva.Nombre_recepcion, Carrito_reserva.ID, Carrito_reserva.Nombre as Nombre_producto,Carrito_reserva.ID_Categoria,Carrito_reserva.Cantidad,Carrito_reserva.Precio,Carrito_reserva.Fecha_compra ,Tipo_categoria.Nombre,Carrito_reserva.pago_deuda,Carrito_reserva.Forma_pago , Carrito_reserva.img_product FROM Carrito_reserva INNER JOIN Tipo_categoria on Carrito_reserva.ID_Categoria = Tipo_categoria.ID INNER JOIN Tipo_Forma_pago on Tipo_Forma_pago.ID = Carrito_reserva.Forma_pago WHERE Carrito_reserva.ID_Reserva = ?",
      id
    );

    if (query.length == 0) {
      return res.status(201).json({
        ok: false,
      });
    }

    res.status(201).json({
      ok: true,
      query,
    });
  } catch (error) {
    return res.status(401).json({
      ok: false,
    });
  }
};

const getDetailChecking = async (req, res = response) => {
  const { id } = req.params;

  try {
    const query = await pool.query(
      "SELECT Huespedes.Correo, Huespedes.Celular, Huespedes.ID as huespedes, Prefijo_number.nombre, Huespedes.Nombre,Huespedes.Apellido,Huespedes.Ciudad,Huespedes.Fecha_nacimiento, Prefijo_number.nombre,Huespedes.ID_Reserva,Huespedes.ID_Tipo_documento,Huespedes.Num_documento    from Huespedes INNER JOIN Prefijo_number ON Huespedes.ID_Prefijo = Prefijo_number.ID WHERE ID_Reserva = ? ORDER by Huespedes.ID DESC",
      [id]
    );

    if (query.length == 0) {
      return res.status(201).json({
        ok: false,
      });
    }

    res.status(201).json({
      ok: true,
      query,
    });
  } catch (error) {
    return res.status(401).json({
      ok: false,
    });
  }
};

const handAddHuespe = async (req, res = response) => {
  const { id } = req.params;
  const { huespe, data, dataPay } = req.body;

  try {
    const huep = {
      ID_Reserva: id,
      ID_Tipo_documento: huespe.Tipo_documento,
      ID_Tipo_genero: 1,
      Num_documento: huespe.Num_documento,
      Nombre: huespe.Nombre,
      Apellido: huespe.Apellido,
      Fecha_nacimiento: huespe.Fecha_nacimiento,
      Celular: huespe.Celular,
      Correo: huespe.Correo,
      Ciudad: huespe.Ciudad,
      ID_Prefijo: huespe.Nacionalidad,
    };

    const totwo = await pool.query("INSERT INTO  Huespedes  set ?", huep);

    let isEmpty = Object.entries(data).length === 0;

    if (!isEmpty) {
      return await pool.query("UPDATE Reservas set ? WHERE Reservas.ID  = ?", [
        data,
        id,
      ]);
    }

    if (!dataPay) {
      const insertUdaete = await pool.query(
        "UPDATE Pagos set ? WHERE Pagos.ID_Reserva  = ?",
        [dataPay, id]
      );
      return insertUdaete;
    }

    res.status(201).json({
      ok: true,
    });
  } catch (error) {
    console.log("error");
    res.status(401).json({
      ok: false,
    });
  }
};

const HuespeCount = async (req, res = response) => {
  const { id } = req.params;

  try {
    const query = await pool.query(
      "SELECT Habitaciones.ID_Tipo_habitaciones,Habitaciones.Numero, Habitaciones.id FROM `Reservas` INNER join Habitaciones on Reservas.ID_Habitaciones = Habitaciones.ID where Habitaciones.ID_Hotel = ? group by Habitaciones.ID",
      [id]
    );

    const queyeOne = await pool.query(
      "SELECT Habitaciones.ID_Tipo_habitaciones,Habitaciones.Numero, Habitaciones.id , Pagos.Valor_habitacion FROM `Reservas` INNER join Habitaciones on Reservas.ID_Habitaciones = Habitaciones.ID INNER join Pagos on  Pagos.ID_Reserva = Reservas.ID  where Habitaciones.ID_Hotel = ?",
      [id]
    );

    if (query.length == 0) {
      return res.status(401).json({
        ok: false,
      });
    }

    return res.status(201).json({
      ok: true,
      query,
      queyeOne,
    });
  } catch (error) {
    return res.status(401).json({
      ok: false,
    });
  }
};

const handResolution = async (req, res = response) => {
  try {
    const query = await pool.query("SELECT * FROM Resolucion_pms");

    res.status(201).json({
      ok: true,
      query,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const handUpdateResoluction = async (req, res = response) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const query = await pool.query("UPDATE Resolucion_pms set ? WHERE ID =?", [
      data,
      id,
    ]);

    res.status(201).json({
      ok: true,
      query,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const handUpdateStatus = async (req, res = response) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const query = await pool.query(
      "UPDATE Reservas set ? WHERE Reservas.ID = ?",
      [data, id]
    );

    return res.status(201).json({
      ok: true,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const handDeleteReserva = async (req, res = response) => {

  const { id } = req.params;

  try {

    const data ={
      ID_Tipo_Estados_Habitaciones:7
    }

    await pool.query("UPDATE  Reservas  set ? WHERE ID = ?", [
      data,
      id
    ]);
  
    return res.status(201).json({
      ok: true,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const handReservationChekin = async (req, res = response) => {
  const { id } = req.params;

  try {
    const query = await pool.query(
      "SELECT web_checking.Nombre as title, web_checking.ID_Reserva as id, web_checking.Apellido as Apellido,Habitaciones.Numero from Reservas INNER JOIN web_checking on Reservas.ID = web_checking.ID_Reserva INNER join Habitaciones on Habitaciones.ID = Reservas.ID_Habitaciones WHERE Reservas.ID_Tipo_Estados_Habitaciones = 3 and Habitaciones.ID_Hotel =?",
      [id]
    );

    const data = await pool.query("SELECT rooms.id as id_tipoHabitacion, rooms.name as nombre, rooms.price as precio, rooms.price_people as precio_persona,  rooms.people as persona , rooms.max_people as max_persona FROM accommodation JOIN rooms ON rooms.id = accommodation.id_room WHERE accommodation.id_hotel = ?;"
    ,[id]
    )

    const roomMap = new Map(); 

    let parent = 1; // Inicializamos el valor de parent en 1

    const rayRoom = await Promise.all(
      data.map(async (room) => {
        const query = await pool.query(
          "SELECT ID, ID_Hotel, ID_Tipo_habitaciones, ID_Tipo_estados, Numero, ID_estado_habitacion FROM Habitaciones WHERE  Habitaciones.ID_Tipo_habitaciones = ? AND Habitaciones.ID_estado_habitacion = 7",
          [room.id_tipoHabitacion]
        );

        let isFirstInGroup = true; // Variable para rastrear el primer elemento en cada grupo

        return query.map((element) => {
          const idTipoHabitacion = element.ID_Tipo_habitaciones;

          // Verificamos si ya tenemos un parent asignado para este ID_Tipo_habitaciones
          if (!roomMap.has(idTipoHabitacion)) {
            roomMap.set(idTipoHabitacion, parent); // Asignamos un nuevo parent si no existe uno para este ID_Tipo_habitaciones
          }

          const roomObject = {
            ID:element.ID,
            title:`${element.Numero} ${room.nombre}`,
            ID_Tipo_habitaciones: idTipoHabitacion,
            ID_estado_habiatcion: element.ID_estado_habitacion,
            parent: roomMap.get(idTipoHabitacion), // Obtenemos el parent del mapa
            root: isFirstInGroup, // Establecemos root: true en el primer elemento del grup
          };

          if (isFirstInGroup) {
            isFirstInGroup = false;
            parent++;
          }
          return roomObject;
        });
      })
    );

    const queryHabitaciones = rayRoom
      .flat()
      .sort((a, b) => a.ID_Tipo_habitaciones - b.ID_Tipo_habitaciones);

    res.status(201).json({
      ok: true,
      query,
      queryHabitaciones
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const handInformeAuditoria = async (req, res = response) => {
  const { id } = req.params;
  const { fecha } = req.body;

  console.log(fecha)

  try {
    const queryOne = await pool.query(
      "SELECT web_checking.ID_Tipo_documento, Carrito_reserva.Precio as total,Tipo_Forma_pago.ID as Forma_pago, Carrito_reserva.ID_Categoria as categoria,  Habitaciones.Numero,Pagos.Valor_habitacion, Tipo_Forma_pago.Nombre as Tipo_pago, web_checking.Nombre AS Nombre_Person, web_checking.Apellido, web_checking.Num_documento, Reservas.ID  as ID_reserva,Carrito_reserva.Nombre as Nombre_producto,Carrito_reserva.ID_Categoria,Carrito_reserva.Cantidad,Carrito_reserva.Precio,Carrito_reserva.Fecha_compra ,Tipo_categoria.Nombre as nombre_categoria, Pagos.Valor_habitacion FROM Carrito_reserva INNER JOIN Tipo_categoria on Carrito_reserva.ID_Categoria = Tipo_categoria.ID INNER join Reservas on Carrito_reserva.ID_Reserva = Reservas.ID  INNER JOIN Pagos on Reservas.ID = Pagos.ID_Reserva INNER join web_checking on Reservas.ID = web_checking.ID_Reserva INNER JOIN Tipo_Forma_pago on Carrito_reserva.Forma_pago = Tipo_Forma_pago.ID INNER join Habitaciones on Reservas.ID_Habitaciones = Habitaciones.ID WHERE Carrito_reserva.pago_deuda =1 and Carrito_reserva.Fecha_compra =?  and Carrito_reserva.ID_Hoteles  =? GROUP by Carrito_reserva.ID;",
      [fecha, id]
    );
    const queryTwo = await pool.query(
      "SELECT  SUM(carrito_tienda.Precio) as total,Tipo_Forma_pago.ID as Forma_pago, carrito_tienda.ID_Categoria as categoria, carrito_tienda.Nombre_persona, carrito_tienda.Num_documento,  Tipo_Forma_pago.Nombre as Tipo_pago,carrito_tienda.ID_Reserva,carrito_tienda.Nombre, carrito_tienda.Precio,carrito_tienda.Cantidad,carrito_tienda.ID_hotel, carrito_tienda.Fecha_compra FROM carrito_tienda INNER join Tipo_Forma_pago  on  carrito_tienda.Forma_pago = Tipo_Forma_pago.ID  WHERE Fecha_compra = ?  and ID_hotel=?   GROUP BY carrito_tienda.ID",
      [fecha, id]
    );

    const queryThree = await pool.query(
      "SELECT SUM(Carrito_room.Precio) as total,Carrito_room.Forma_pago as Forma_pago, Carrito_room.ID_Categoria as categoria, Carrito_room.ID_user,users.name, Tipo_Forma_pago.Nombre as Tipo_pago,Carrito_room.Nombre, Carrito_room.Precio,Carrito_room.Cantidad,Carrito_room.ID_Hoteles, Carrito_room.Fecha_compra FROM Carrito_room INNER join Tipo_Forma_pago on Carrito_room.Forma_pago = Tipo_Forma_pago.ID INNER join users on users.id = Carrito_room.ID_user WHERE Fecha_compra =? and Carrito_room.ID_Hoteles=? and Carrito_room.Pago_deuda =1 GROUP BY Carrito_room.ID;",
      [fecha, id]
    );

   /* const roomById = await axios.post(
      `https://grupo-hoteles.com/api/getTypeRoomsByIDHotel?id_hotel=${id}`,
      {},
      {
        headers: { "Content-type": "application/json" },
        timeout: 1000, // tiempo de espera de 5 segundos
      }
    );
*/
    const response = await pool.query("SELECT rooms.id as id_tipoHabitacion, rooms.name as nombre, rooms.price as precio, rooms.price_people as precio_persona,  rooms.people as persona , rooms.max_people as max_persona FROM accommodation JOIN rooms ON rooms.id = accommodation.id_room WHERE accommodation.id_hotel = ?;"
    ,[id]
    )

  /*  const result = await pool.query(
      "SELECT   Pago_abono.Abono as abono,  Pago_abono.Fecha_pago, Reservas.ID as ID_reserva, Habitaciones.Numero,Habitaciones.ID ,Tipo_Forma_pago.Nombre  ,Reservas.Fecha_inicio, Pagos.Valor_habitacion,Reservas.Codigo_reserva,web_checking.Num_documento,web_checking.Nombre  as Nombre_Person,web_checking.Apellido,web_checking.Iva ,web_checking.Tipo_persona from Reservas INNER join Pagos on Reservas.id = Pagos.ID_Reserva INNER join Habitaciones on Reservas.ID_Habitaciones = Habitaciones.id INNER join web_checking on web_checking.ID_Reserva = Reservas.id  INNER JOIN  Pago_abono on  Reservas.id = Pago_abono.ID_Reserva INNER join Tipo_Forma_pago on Tipo_Forma_pago.ID = Pago_abono.Tipo_Forma_pago WHERE   Pago_abono.Fecha_pago=? and Habitaciones.ID_Hotel= ?",
      [fecha, id]
    );
*/
    const groupedData = [];

    const groupedOcasional = [];

    for (let i = 0; i < response?.length; i++) {
      const id_habitacion = response[i].id_tipoHabitacion;
      const re = await pool.query(
        "SELECT Reservas.Ninos,Reservas.Adultos, Pagos.valor_dia_habitacion, web_checking.ID_Tipo_documento, Pago_abono.Tipo_forma_pago, Pago_abono.Abono as abono,  Pago_abono.Fecha_pago, Reservas.ID as ID_reserva, Habitaciones.Numero,Habitaciones.ID ,Tipo_Forma_pago.Nombre  ,Reservas.Fecha_inicio, Reservas.Codigo_reserva,web_checking.Num_documento,web_checking.Nombre  as Nombre_Person,web_checking.Apellido,web_checking.Iva ,web_checking.Tipo_persona from Reservas INNER join Habitaciones on Reservas.ID_Habitaciones = Habitaciones.id INNER join web_checking on web_checking.ID_Reserva = Reservas.id  INNER JOIN  Pago_abono on  Reservas.id = Pago_abono.ID_Reserva INNER join Tipo_Forma_pago on Tipo_Forma_pago.ID = Pago_abono.Tipo_Forma_pago INNER JOIN Pagos  on Pagos.ID_Reserva = web_checking.ID_Reserva WHERE  Pagos.pago_valid =1 and Habitaciones.ID_Tipo_habitaciones = ? and    Pago_abono.Fecha_pago=? and Habitaciones.ID_Hotel= ?;",
        [id_habitacion, fecha, id]
      );

      for (const date of re) {
        groupedData.push({
          ID: date.ID,
          abono: date.abono,
          nino:date.Ninos,
          adult:date.Adultos,
          valor_habtiacion:date.valor_dia_habitacion,
          Fecha_pago: date.Fecha_pago,
          ID_reserva: date.ID_reserva,
          Numero: date.Numero,
          Nombre: date.Nombre,
          Fecha_inicio: date.Fecha_inicio,
          Valor_habitacion: date.Valor_habitacion,
          Codigo_reserva: date.Codigo_reserva,
          Num_documento: date.Num_documento,
          Nombre_Person: date.Nombre_Person,
          Apellido: date.Apellido,
          Iva: date.Iva,
          Tipo_persona: date.Tipo_persona,
          Habitacion: response[i].nombre,
          Forma_pago: date.Tipo_forma_pago,
          ID_Tipo_documento:date.ID_Tipo_documento
        });
      }
    }

    for (let i = 0; i < response?.length; i++) {
      const id_habitacion = response[i].id_tipoHabitacion;
      const res = await pool.query(
        "SELECT RoomOcasionales.ID, Habitaciones.Numero, RoomOcasionales.ID_hotel,RoomOcasionales.ID_habitacion,RoomOcasionales.Abono ,Tipo_Forma_pago.Nombre ,RoomOcasionales.Fecha ,Tipo_Forma_pago.ID as ID_forma_pago,RoomOcasionales.Time_ingreso,RoomOcasionales.Time_salida, users.name from Habitaciones INNER JOIN  RoomOcasionales  on RoomOcasionales.ID_habitacion = Habitaciones.ID INNER join Tipo_Forma_pago on Tipo_Forma_pago.ID = RoomOcasionales.Tipo_forma_pago INNER join users on users.id = RoomOcasionales.id_user WHERE Habitaciones.ID_Tipo_habitaciones = ? and   RoomOcasionales.Fecha =? and Habitaciones.ID_Hotel= ? ",
        [id_habitacion, fecha, id]
      ); 

      for (const date of res) {
        groupedOcasional.push({
          ID: date.ID,
          Numero: date.Numero,
          Habitacion: response[i].nombre,
          Abono: date.Abono,
          Tipo_forma_pago: date.Nombre,
          Fecha:date.Fecha,
          Forma_pago:date.ID_forma_pago,
          username:date.name,
          Time_ingreso:date.Time_ingreso,
          Time_salida:date.Time_salida
        });
      }
    }

    res.status(201).json({
      ok: true,
      result: groupedData,
      groupedOcasional,
      queryTwo,
      queryOne,
      queryThree
    });
  } catch (error) {
    res.status(201).json({
      ok: false,
    });
  }
};

const handInformeCamarera = async (req, res = response) => {
  const { id } = req.params;
  const { fecha } = req.body;

  try {
    const FechaIncio = `${fecha}`;
    const FechaFinal = `${fecha}`;

    const query = await pool.query(
      "SELECT Habitaciones.ID,  Habitaciones.ID_estado_habitacion as ID_Tipo_Estados_Habitaciones,   Reservas.Fecha_final, Reservas.Adultos,  Reservas.Fecha_final,  Reservas.Ninos,   Reservas.Noches,  web_checking.nombre,   web_checking.Apellido,  Habitaciones.Numero,  Habitaciones.ID as id_habitaciones,  CASE  WHEN Habitaciones.ID_estado_habitacion = 0 THEN 'Disponible' WHEN Habitaciones.ID_estado_habitacion = 5 THEN 'Sucia'  WHEN Habitaciones.ID_estado_habitacion = 2 THEN 'Bloqueada'  ELSE 'Ocupada'  END as Estado_Habitacio FROM  Reservas  INNER JOIN   web_checking ON web_checking.ID_Reserva = Reservas.id  INNER JOIN  Habitaciones ON Habitaciones.ID = Reservas.ID_Habitaciones  WHERE  (Reservas.ID_Tipo_Estados_Habitaciones = 3 OR Habitaciones.ID_estado_habitacion = 0 or Habitaciones.ID_estado_habitacion=5 or Habitaciones.ID_estado_habitacion=2 )  AND Habitaciones.ID_Hotel = ? GROUP BY  Habitaciones.ID;",
      [id,
      ]
    );

    const result = query
    .sort((a, b) => a.Numero - b.Numero);

    res.status(201).json({
      ok: true,
      result,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const handRoomToSell = async (req, res = response) => {
  const { id } = req.params;
  const { fechaInicio, fechaFinal } = req.body;

  try {
   /* const roomById = await axios.post(
      `https://grupo-hoteles.com/api/getTypeRoomsByIDHotel?id_hotel=${id}`,
      {},
      {
        headers: { "Content-type": "application/json" },
        timeout: 1000, // tiempo de espera de 5 segundos
      }
    );

*/

    const response = await pool.query("SELECT rooms.id as id_tipoHabitacion, rooms.name as nombre, rooms.price as precio, rooms.price_people as precio_persona,  rooms.people as persona , rooms.max_people as max_persona FROM accommodation JOIN rooms ON rooms.id = accommodation.id_room WHERE accommodation.id_hotel = ?;"
      ,[id]
    )

    const FechaInicio = `${fechaInicio}`;
    const FechaFinal =`${fechaFinal}`

    const dates = [];
    let currentDate = moment(FechaInicio);
    while (currentDate <= moment(FechaFinal)) {
      dates.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "days");
    }

    const groupedData = {};

    for (let i = 0; i < response?.length; i++) {
      const id_habitacion = response[i].id_tipoHabitacion;

      for (const date of dates) {
        const FechaInicio = `${date} 15:00:00`;
     
        const query = await pool.query(
          "SELECT GREATEST( (SELECT COUNT(*) FROM Habitaciones WHERE ID_Tipo_habitaciones = ? AND ID_estado_habitacion != 2) - (SELECT COUNT(*) FROM Reservas INNER JOIN web_checking ON web_checking.ID_Reserva = Reservas.id INNER JOIN Habitaciones ON Habitaciones.ID = Reservas.ID_Habitaciones WHERE Habitaciones.ID_Tipo_habitaciones = ? AND Habitaciones.ID_estado_habitacion != 2 AND Reservas.ID_Tipo_Estados_Habitaciones !=7 and  Reservas.ID_Tipo_Estados_Habitaciones != 6 and ( (Fecha_inicio >= ? AND Fecha_inicio < ?) OR (Fecha_final >? AND Fecha_final <=?) OR (Fecha_inicio <= ? AND Fecha_final >=?) )), 0) AS total_disponible;",
          [
            id_habitacion,
            id_habitacion,
            FechaInicio,
            FechaInicio,
            FechaInicio,
            FechaInicio,
            FechaInicio,
            FechaInicio,
          ]
        );

        const availableRooms = query[0].total_disponible;
   
        if (!groupedData[date]) {
          groupedData[date] = [];
        }

        groupedData[date].push({
          Room: response[i].nombre,
          disponible: availableRooms,
          fecha: date,
        });
      }
    }

    const groupedDataWithoutDates = Object.values(groupedData).map(
      (groupedData) => {
        return groupedData.map((data) => {
          return {
            Room: data.Room,
            disponible: data.disponible,
            fecha: data.fecha,
          };
        });
      }
    );

    const query = await Promise.all(groupedDataWithoutDates);

    res.status(201).json({
      ok: true,
      groupedDataWithoutDates: query,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const handPayStoreReservation = async (req, res = response) => {
  const { id } = req.params;
  const { data } = req.body;

  const dataOne = {
    Forma_pago: data.Forma_pago,
    Fecha_compra: data.Fecha_compra,
    pago_deuda: 1,
  };

  const dataThree = {
    Pago_deuda: 1,
  };

  try {
    await pool.query("UPDATE Carrito_reserva set ? WHERE ID = ?", [
      dataOne,
      id,
    ]);

    await pool.query("UPDATE KPI set ? WHERE ID_product = ?", [dataThree, id]);
    res.status(201).json({
      ok: true,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const handAlltotalReservation = async (req, res = response) => {
  const { fecha } = req.body;
  const { id } = req.params;

  

  try {
    const FechaInicio = `${fecha} 13:00:00`;
    const FechaFinal = `${fecha} 15:00:00`;
    console.log(FechaInicio)
    console.log(FechaFinal)

    const RoomBusyById = await pool.query(
      "SELECT COUNT(*) AS Num_Reservas,Reservas.id FROM Reservas INNER JOIN Habitaciones on Reservas.ID_Habitaciones  = Habitaciones.ID WHERE Reservas.ID_Tipo_Estados_Habitaciones =3 AND  Habitaciones.ID_Hotel = ?  AND ((Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio >= ? AND Fecha_final <=  ?))",
      [
        id,
        FechaInicio,
        FechaFinal,
        FechaFinal,
        FechaInicio,
        FechaInicio,
        FechaFinal,
      ]
    );

    const RoomReservationbyId = await pool.query(
      "SELECT COUNT(*) AS Num_Reservas,Reservas.id FROM Reservas INNER JOIN Habitaciones on Reservas.ID_Habitaciones  = Habitaciones.ID WHERE Reservas.ID_Tipo_Estados_Habitaciones =0 AND Habitaciones.ID_Hotel = ?  AND ((Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio >= ? AND Fecha_final <=  ?))",
      [
        id,
        FechaFinal,
        FechaFinal,
        FechaFinal,
        FechaFinal,
        FechaFinal,
        FechaFinal,
      ]
    );

    const TotalHuespedById = await pool.query(
      "SELECT COUNT(*) AS Num_Reservas,Reservas.id FROM Reservas INNER JOIN Habitaciones on Reservas.ID_Habitaciones  = Habitaciones.ID INNER JOIN  Huespedes on Huespedes.ID_Reserva = Reservas.ID WHERE Habitaciones.ID_Hotel =? AND Reservas.ID_Tipo_Estados_Habitaciones =3 AND  ((Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio >= ? AND Fecha_final <=  ?))",
      [
        id,
        FechaFinal,
        FechaFinal,
        FechaFinal,
        FechaFinal,
        FechaFinal,
        FechaFinal,
      ]
    );

    const query = await pool.query(
      "SELECT  Reservas.ID as ID_reserva, Habitaciones.Numero,Habitaciones.ID ,Tipo_Forma_pago.Nombre as Tipo_pago ,Reservas.Fecha_inicio, Pagos.Valor_habitacion,Reservas.Codigo_reserva,web_checking.Num_documento,web_checking.Nombre  as Nombre_Person,web_checking.Apellido,web_checking.Iva ,web_checking.Tipo_persona from Reservas INNER join Pagos on Reservas.id = Pagos.ID_Reserva INNER join Habitaciones on Reservas.ID_Habitaciones = Habitaciones.id INNER join web_checking on web_checking.ID_Reserva = Reservas.id INNER join Tipo_Forma_pago on Pagos.ID_Tipo_Forma_pago = Tipo_Forma_pago.ID WHERE Reservas.ID_Tipo_Estados_Habitaciones=3 and Reservas.Fecha_inicio = ? and Habitaciones.ID_Hotel=  ? group by Habitaciones.ID",
      [FechaInicio, id]
    );

    const querythree = await pool.query(
      "SELECT Reservas.ID as ID_reserva, Habitaciones.Numero,Habitaciones.ID ,Tipo_Forma_pago.Nombre as Tipo_pago ,Reservas.Fecha_inicio, Pagos.Valor_habitacion,Reservas.Codigo_reserva,web_checking.Num_documento,web_checking.Nombre as Nombre_Person,web_checking.Apellido,web_checking.Iva ,web_checking.Tipo_persona from Reservas INNER join Pagos on Reservas.id = Pagos.ID_Reserva INNER join Habitaciones on Reservas.ID_Habitaciones = Habitaciones.id INNER join web_checking on web_checking.ID_Reserva = Reservas.id INNER join Tipo_Forma_pago on Pagos.ID_Tipo_Forma_pago = Tipo_Forma_pago.ID WHERE Reservas.ID_Tipo_Estados_Habitaciones=1 and Reservas.Fecha_inicio = ? and Habitaciones.ID_Hotel=  ? group by Habitaciones.ID",
      [FechaInicio, id]
    );

    const queryOne = await pool.query(
      "SELECT  SUM(Carrito_reserva.Precio) as total, Habitaciones.Numero,Pagos.Valor_habitacion, Tipo_Forma_pago.Nombre as Tipo_pago, web_checking.Nombre AS Nombre_Person, web_checking.Apellido, web_checking.Num_documento, Reservas.ID  as ID_reserva,Carrito_reserva.Nombre as Nombre_producto,Carrito_reserva.ID_Categoria,Carrito_reserva.Cantidad,Carrito_reserva.Precio,Carrito_reserva.Fecha_compra ,Tipo_categoria.Nombre as nombre_categoria, Pagos.Valor_habitacion FROM Carrito_reserva INNER JOIN Tipo_categoria on Carrito_reserva.ID_Categoria = Tipo_categoria.ID INNER join Reservas on Carrito_reserva.ID_Reserva = Reservas.ID  INNER JOIN Pagos on Reservas.ID = Pagos.ID_Reserva INNER join web_checking on Reservas.ID = web_checking.ID_Reserva INNER JOIN Tipo_Forma_pago on Carrito_reserva.Forma_pago = Tipo_Forma_pago.ID INNER join Habitaciones on Reservas.ID_Habitaciones = Habitaciones.ID WHERE Carrito_reserva.pago_deuda =1 and Carrito_reserva.Fecha_compra = ? GROUP by Carrito_reserva.ID",
      fecha
    );

    const queryTwo = await pool.query(
      "SELECT SUM(carrito_tienda.Precio) as total, carrito_tienda.Nombre_persona, carrito_tienda.Num_documento,  Tipo_Forma_pago.Nombre as Tipo_pago,carrito_tienda.ID_Reserva,carrito_tienda.Nombre, carrito_tienda.Precio,carrito_tienda.Cantidad,carrito_tienda.ID_hotel, carrito_tienda.Fecha_compra FROM carrito_tienda INNER join Tipo_Forma_pago  on  carrito_tienda.Forma_pago = Tipo_Forma_pago.ID  WHERE Fecha_compra = ?  and ID_hotel=?   GROUP BY carrito_tienda.ID",
      [fecha, id]
    );

    const promise = [];

    const groupedById = {};

    // Agrupar array1 por ID
    query.forEach((item) => {
      if (!groupedById[item.ID_reserva]) {
        groupedById[item.ID_reserva] = {};
      }
      Object.assign(groupedById[item.ID_reserva], item);
    });

    // Agrupar array2 por ID y combinar los objetos existentes
    querythree.forEach((item) => {
      if (groupedById[item.ID_reserva]) {
        Object.assign(groupedById[item.ID_reserva], item);
      } else {
        groupedById[item.ID_reserva] = item;
      }
    });

    const result = Object.values(groupedById);

    let count = 0;
    for (let i = 0; i < result?.length; i++) {
      if (result[i].Tipo_persona == "empresa") {
        const totalwith = (parseInt(result[i].Valor_habitacion) * 19) / 100;
        const total = totalwith + parseInt(result[i].Valor_habitacion);
        count += total;
      } else if (result[i].Iva == 1) {
        const totalwith = (parseInt(result[i].Valor_habitacion) * 19) / 100;
        const total = totalwith + parseInt(result[i].Valor_habitacion);
        count += total;
      } else {
        count += parseInt(result[i].Valor_habitacion);
      }
    }

    const priceInformeStore = queryTwo?.reduce((acum, current) => {
      return acum + parseInt(current.total);
    }, 0);

    const priceInformeStoreOne = queryOne?.reduce((acum, current) => {
      return acum + parseInt(current.total);
    }, 0);

    const totalDay = count + priceInformeStore + priceInformeStoreOne;

    res.status(201).json({
      ok: true,
      RoomBusyById,
      RoomReservationbyId,
      TotalHuespedById,
      totalDay: {
        totalDay,
        priceInformeStore,
      },
    });
  } catch (error) {
    res.status(201).json({
      ok: false,
    });
  }
};

const handChangeRoom = (req, res = response) => {
  try {
    res.status(201).json({
      ok: true,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const handCleanRoom = async (req, res = response) => {
  const { id } = req.params;
  const {
    desde,
    hasta,
    ID_Habitaciones,
    ID_Tipo_Estados_Habitaciones,
    Nombre,
  } = req.body;

  try {
    const resultado = await pool.query(
      "SELECT COUNT(*) AS Num_Reservas,Reservas.id FROM Reservas WHERE ID_Habitaciones = ? AND ((Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio >= ? AND Fecha_final <=  ?))",
      [ID_Habitaciones, desde, desde, hasta, hasta, desde, hasta]
    );

    if (resultado[0].Num_Reservas === 0) {
      var n1 = 2000;
      var n2 = 1000;
      var numero = Math.floor(Math.random() * (n1 - (n2 - 1))) + n2;

      let id_disponible = ID_Habitaciones;

      const data = {
        ID_Usuarios: 1,
        ID_Habitaciones: parseInt(id_disponible.toString()),
        ID_Talla_mascota: 3,
        Codigo_reserva: numero,
        Adultos: 0,
        Ninos: 0,
        Infantes: 0,
        Fecha_inicio: desde,
        Fecha_final: hasta,
        Noches: 0,
        Descuento: 0,
        ID_Canal: 1,
        ID_Tipo_Estados_Habitaciones,
        Observacion: "dsasadsadsadsa",
      };

      const to = await pool.query("INSERT INTO Reservas set ?", data);

      const query1 = await pool.query("SELECT MAX(ID) as max FROM Reservas");

      const result = query1.map((index) => {
        return index.max;
      });

      const date = {
        ID_Reserva: parseInt(result.toString()),
        ID_Tipo_documento: 2,
        Num_documento: 1043654,
        Nombre,
        Apellido: "",
        Fecha_nacimiento: "2000-01-01",
        Celular: 121212,
        Correo: "rosdasdsa",
        Ciudad: "medellin",
        ID_Prefijo: 472,
        Tipo_persona: "persona",
      };

      const toone = await pool.query("INSERT INTO  web_checking set ?", date);

      const huep = {
        ID_Reserva: parseInt(result.toString()),
        ID_Tipo_documento: 2,
        ID_Tipo_genero: 1,
        Num_documento: 1043654,
        Nombre: Nombre,
        Apellido: "",
        Fecha_nacimiento: "2000-01-01",
        Celular: 121212,
        Correo: "rosdasdsa",
        Ciudad: "medellin",
        ID_Prefijo: 472,
      };

      const totwo = pool.query(
        "INSERT INTO  Huespedes  set ?",
        huep,
        (q_err, q_res) => {
          if (q_err)
            return res.status(401).json({
              ok: false,
              msg: "error de web huespedes",
            });
        }
      );

      const pay = {
        ID_Reserva: parseInt(result.toString()),
        ID_Motivo: 1,
        ID_Tipo_Forma_pago: 1,
        Valor: 0,
        Abono: 0,
        Valor_habitacion: 0,
        valor_dia_habitacion: 0,
      };

      const tothre = pool.query("INSERT INTO  Pagos  set ?", pay);

      return res.status(201).json({
        ok: true,
      });
    } else {
      return res.status(401).json({
        ok: false,
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(401).json({
      ok: false,
    });
  }
};

const handInformaSotore = async (req, res = response) => {
  const { id } = req.params;

  try {
    const query = await pool.query(
      " SELECT ID_Tipo_categoria, ID, Precio_compra, Nombre, Cantidad, Cantidad_inicial, Precio, (Cantidad_inicial - Cantidad) AS ventas , (Cantidad * Precio) as Total  FROM Productos WHERE  ID_Hoteles = ? ",
      [id]
    );

    res.status(201).json({
      ok: true,
      query,
    });
  } catch (error) {
    k;
    res.status(401).json({
      ok: false,
    });
  }
};

const handUpdateCreateReservation = (req, res = response) => {
  try {
    res.status(201).json({
      ok: true,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const notiticar = (req, res) => {
  res.status(201).json({
    ok: true,
  });
};

const byIdProduct = async (req, res = response) => {
  const { id } = req.params;
  const { ID_producto } = req.body;

  try {
    const query = await pool.query(
      "SELECT carrito_tienda.Precio,   carrito_tienda.Fecha_compra, carrito_tienda.ID_product, carrito_tienda.Cantidad,carrito_tienda.Nombre FROM   carrito_tienda    WHERE carrito_tienda.ID_hotel=  ? AND  carrito_tienda.ID_product =?",
      [id, ID_producto]
    );

    const queryOne = await pool.query(
      "SELECT Carrito_reserva.Precio,  Carrito_reserva.Fecha_compra,Carrito_reserva.ID_product,Carrito_reserva.Cantidad , Carrito_reserva.Nombre FROM Carrito_reserva WHERE Carrito_reserva.ID_Hoteles = ? AND Carrito_reserva.ID_product = ?",
      [id, ID_producto]
    );

    res.status(201).json({
      ok: true,
      query,
      queryOne,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const handValidDian = async (req, res = response) => {
  const options = new chrome.Options();
  options.addArguments("--headless"); // Ejecutar en modo headless

  // Crear el driver de Selenium
  const driver = new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  // Maximizar ventana
  driver.manage().window().maximize();

  // Navegar a la página web
  driver.get(
    "https://muisca.dian.gov.co/WebRutMuisca/DefConsultaEstadoRUT.faces"
  );

  // Buscar un elemento por su id y almacenarlo en una variable
  const usuario = driver.findElement(
    By.xpath('//*[@id="vistaConsultaEstadoRUT:formConsultaEstadoRUT:numNit"]')
  );

  usuario.sendKeys("890903938", Key.ENTER);

  // Esperar hasta que se carguen los resultados de la búsqueda
  driver.wait(
    until.elementLocated(
      By.xpath(
        '//*[@id="vistaConsultaEstadoRUT:formConsultaEstadoRUT"]/table[2]/tbody/tr[2]/td/table/tbody/tr[1]'
      )
    ),
    5000
  );

  const datosObtenidos = await driver.findElements(
    By.xpath(
      '//*[@id="vistaConsultaEstadoRUT:formConsultaEstadoRUT"]/table[2]/tbody/tr[2]/td/table/tbody/tr'
    )
  );

  const table = [];

  for (let i = 0; i < datosObtenidos.length; i += 3) {
    // Volver a buscar el elemento antes de obtener su texto
    const nombreElement = await driver.findElement(
      By.xpath(
        '//*[@id="vistaConsultaEstadoRUT:formConsultaEstadoRUT"]/table[2]/tbody/tr[2]/td/table/tbody/tr[' +
          (i + 1) +
          "]/td[1]"
      )
    );
    const fechaElement = await driver.findElement(
      By.xpath(
        '//*[@id="vistaConsultaEstadoRUT:formConsultaEstadoRUT"]/table[2]/tbody/tr[2]/td/table/tbody/tr[' +
          (i + 1) +
          "]/td[2]"
      )
    );
    const plazoElement = await driver.findElement(
      By.xpath(
        '//*[@id="vistaConsultaEstadoRUT:formConsultaEstadoRUT"]/table[2]/tbody/tr[2]/td/table/tbody/tr[' +
          (i + 1) +
          "]/td[3]"
      )
    );

    table.push({
      NOMBRE: await nombreElement.getText(),
      FECHA_EFECTIVA: await fechaElement.getText(),
      PLAZO_INHABILITACION: await plazoElement.getText(),
    });
  }

  // Cerrar el driver
  driver.quit();

  res.status(201).json({
    ok: true,
  });
};

const handInsertPayAbono = async (req, res = response) => {
  const {
    ID_pago,
    ID_Reserva,
    PayAbono,
    Fecha_pago,
    Tipo_forma_pago,
    Nombre_recepcion,
  } = req.body.data;

  const data = {
    ID_Reserva,
    Abono: PayAbono,
    Fecha_pago,
    Tipo_forma_pago,
    Nombre_recepcion,
  };


  try {
    if (!Tipo_forma_pago) {
      return res.status(401).json({
        ok: false,
      });
    }


    const ByIdReserva = await pool.query("SELECT * FROM `Pagos` WHERE ID = ?", [
      ID_pago,
    ]);

    let acum = 0;

    for (let i = 0; i < ByIdReserva?.length; i++) {
      acum += parseInt(ByIdReserva[i].Abono);
    }

    const dataOne = {
      Abono: acum + parseInt(PayAbono),
    };

    await pool.query("INSERT INTO Pago_abono SET ?", data, (err, customer) => {
      if (err) {
        console.log(err)
        return res.status(401).json({
          ok: false,
          msg: "error al insertar datos",
        });
      } else {
        const insertSecondQuery = async () => {
          pool.query(
            "UPDATE Pagos set ? WHERE ID = ?",
            [dataOne, ID_pago],
            (err, customer) => {
              if (err) {
                return res.status(401).json({
                  ok: false,
                  msg: "error al insertar datos",
                });
              } else {
                return res.status(201).json({
                  ok: true,
                });
              }
            }
          );
        };
        insertSecondQuery();
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(201).json({
      ok: false,
    });
  }
};

const getpayABono = async (req, res = response) => {
  const { id } = req.params;

  try {
    const query = await pool.query(
      "SELECT Pago_abono.Valid_Dian, Pago_abono.ID,web_checking.Iva,web_checking.Tipo_persona, Pago_abono.Nombre_recepcion, Pago_abono.ID_Reserva,Pago_abono.Abono,Pago_abono.Fecha_pago,Tipo_Forma_pago.Nombre FROM `Pago_abono` INNER JOIN Tipo_Forma_pago on Pago_abono.Tipo_Forma_pago = Tipo_Forma_pago.ID INNER JOIN web_checking ON Pago_abono.ID_Reserva = web_checking.ID_Reserva WHERE Pago_abono.ID_Reserva = ?",
      [id]
    );

    res.status(201).json({
      ok: true,
      query,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const roomAvaibleInformeConsolidado = async (req, res = response) => {
  const { id } = req.params;

  const { fecha } = req.body;

  try {
    const FechaInicio = `${fecha} 15:00:00`;

    const RoomBusyById = await pool.query(
      "SELECT COUNT(*) AS Num_Reservas,Reservas.id FROM Reservas INNER JOIN Habitaciones on Reservas.ID_Habitaciones  = Habitaciones.ID WHERE   Habitaciones.ID_Hotel = ?  AND ((Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio >= ? AND Fecha_final <=  ?))",
      [
        id,
        FechaInicio,
        FechaInicio,
        FechaInicio,
        FechaInicio,
        FechaInicio,
        FechaInicio,
      ]
    );

    const RoomAvaible = await pool.query(
      "SELECT COUNT(*) AS Num_Disponibles FROM Habitaciones WHERE Habitaciones.ID_Hotel = ? AND Habitaciones.ID NOT IN ( SELECT Habitaciones.ID FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Hotel = ? AND ( (Fecha_inicio <= ? AND Fecha_final >= ?) OR (Fecha_inicio <= ? AND Fecha_final >= ?) OR (Fecha_inicio >= ?  AND Fecha_final <=  ?) ) )",
      [
        id,
        id,
        FechaInicio,
        FechaInicio,
        FechaInicio,
        FechaInicio,
        FechaInicio,
        FechaInicio,
      ]
    );

  
    const response = await pool.query("SELECT rooms.id as id_tipoHabitacion, rooms.name as nombre, rooms.price as precio, rooms.price_people as precio_persona,  rooms.people as persona , rooms.max_people as max_persona FROM accommodation JOIN rooms ON rooms.id = accommodation.id_room WHERE accommodation.id_hotel = ?;"
    ,[id]
  )

    const roomByIdIDtypeRoom = [];

    for (let i = 0; i < response?.length; i++) {
      const id_habitacion = response[i].id_tipoHabitacion;

      const roomPay = await pool.query(
        "SELECT web_checking.Iva, web_checking.Tipo_persona, Habitaciones.ID_Tipo_habitaciones, ROUND( SUM( CASE WHEN web_checking.Iva = 1 THEN (Pago_abono.Abono ) ELSE Pago_abono.Abono END ), 0 ) AS Total_Abono, COUNT(DISTINCT Reservas.ID) AS Cantidad_Habitaciones FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN Pago_abono ON Reservas.id = Pago_abono.ID_Reserva INNER JOIN web_checking ON web_checking.ID_Reserva = Reservas.id WHERE Habitaciones.ID_Hotel = ? AND Pago_abono.Fecha_pago = ? AND Habitaciones.ID_Tipo_habitaciones = ?",
        [id, fecha, id_habitacion]
      );

      const abono = roomPay[0].Total_Abono || 0;

      const room = roomPay[0].Cantidad_Habitaciones || 0;

      const iva = roomPay[0].Iva || 0;

      const tipo_persona = roomPay[0].Tipo_persona || 0;

      roomByIdIDtypeRoom.push({
        room: response[i].nombre,
        abono,
        cantidad: room,
        Iva: iva,
        tipo_persona: tipo_persona,
      });
    }


    const roomByIdIDtypeRoomoOcasioanales = [];

    for (let i = 0; i < response?.length; i++) {
      const id_habitacion = response[i].id_tipoHabitacion;
      const roomPay = await pool.query(
        "SELECT RoomOcasionales.Abono,  COUNT(RoomOcasionales.ID) AS Cantidad_Habitaciones ,ROUND( SUM(RoomOcasionales.Abono), 0 ) AS Total_Abono   from RoomOcasionales INNER JOIN Habitaciones on Habitaciones.ID = RoomOcasionales.ID_habitacion  WHERE RoomOcasionales.Fecha =? and RoomOcasionales.ID_hotel =?  and Habitaciones.ID_Tipo_habitaciones =?",
        [ fecha,id, id_habitacion]
      );


      const abono = roomPay[0].Total_Abono || 0;
     


      const room = roomPay[0].Cantidad_Habitaciones || 0;

      roomByIdIDtypeRoomoOcasioanales.push({
        room: response[i].nombre,
        abono,
        cantidad: room,
      });
    }


   
    const totalEfectivo = await pool.query(
      "SELECT Tipo_Forma_pago.Nombre,Tipo_Forma_pago.ID , Pago_abono.Abono, ROUND(SUM(CASE WHEN web_checking.Iva = 1 THEN (Pago_abono.Abono * 19 / 100 + Pago_abono.Abono) ELSE Pago_abono.Abono END), 0) AS Total_Abono FROM `Pago_abono` INNER JOIN Tipo_Forma_pago on Pago_abono.Tipo_forma_pago = Tipo_Forma_pago.ID INNER JOIN Reservas on Pago_abono.ID_Reserva = Reservas.id INNER JOIN Habitaciones on Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN web_checking on web_checking.ID_Reserva = Reservas.ID WHERE Habitaciones.ID_Hotel = ? and Pago_abono.Fecha_pago = ? and Pago_abono.Tipo_forma_pago =1;  ",
      [id, fecha]
    );

    const tarjetadebito = await pool.query(
      "SELECT Tipo_Forma_pago.Nombre,Tipo_Forma_pago.ID , Pago_abono.Abono, ROUND(SUM(CASE WHEN web_checking.Iva = 1 THEN (Pago_abono.Abono * 19 / 100 + Pago_abono.Abono) ELSE Pago_abono.Abono END), 0) AS Total_Abono FROM `Pago_abono` INNER JOIN Tipo_Forma_pago on Pago_abono.Tipo_forma_pago = Tipo_Forma_pago.ID INNER JOIN Reservas on Pago_abono.ID_Reserva = Reservas.id INNER JOIN Habitaciones on Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN web_checking on web_checking.ID_Reserva = Reservas.ID WHERE Habitaciones.ID_Hotel = ? and Pago_abono.Fecha_pago = ? and Pago_abono.Tipo_forma_pago =6 ",
      [id, fecha]
    );

    const tarjetaCredito = await pool.query(
      "SELECT Tipo_Forma_pago.Nombre,Tipo_Forma_pago.ID , Pago_abono.Abono, ROUND(SUM(CASE WHEN web_checking.Iva = 1 THEN (Pago_abono.Abono * 19 / 100 + Pago_abono.Abono) ELSE Pago_abono.Abono END), 0) AS Total_Abono FROM `Pago_abono` INNER JOIN Tipo_Forma_pago on Pago_abono.Tipo_forma_pago = Tipo_Forma_pago.ID INNER JOIN Reservas on Pago_abono.ID_Reserva = Reservas.id INNER JOIN Habitaciones on Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN web_checking on web_checking.ID_Reserva = Reservas.ID WHERE Habitaciones.ID_Hotel = ? and Pago_abono.Fecha_pago = ? and Pago_abono.Tipo_forma_pago =7",
      [id, fecha]
    );

    const totalOtherMedios = await pool.query(
      "SELECT Tipo_Forma_pago.Nombre,Tipo_Forma_pago.ID , Pago_abono.Abono, ROUND(SUM(CASE WHEN web_checking.Iva = 1 THEN (Pago_abono.Abono * 19 / 100 + Pago_abono.Abono) ELSE Pago_abono.Abono END), 0) AS Total_Abono FROM `Pago_abono` INNER JOIN Tipo_Forma_pago on Pago_abono.Tipo_forma_pago = Tipo_Forma_pago.ID INNER JOIN Reservas on Pago_abono.ID_Reserva = Reservas.id INNER JOIN Habitaciones on Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN web_checking on web_checking.ID_Reserva = Reservas.ID WHERE Habitaciones.ID_Hotel = ? and Pago_abono.Fecha_pago = ? and Pago_abono.Tipo_forma_pago !=1; ",
      [id, fecha]
    );

    const carrtoTendaEfectivo = await pool.query(
      "SELECT sum(Precio)  AS Total_Abono , Tipo_Forma_pago.Nombre as forma_pago , Fecha_compra, Precio , Cantidad ,Tipo_categoria.Nombre as nombre_categoria, carrito_tienda.Nombre ,carrito_tienda.ID_Categoria from carrito_tienda INNER JOIN Tipo_categoria on Tipo_categoria.ID = carrito_tienda.ID_Categoria INNER JOIN Tipo_Forma_pago on Tipo_Forma_pago.ID = carrito_tienda.Forma_pago WHERE carrito_tienda.ID_hotel = ? AND carrito_tienda.Fecha_compra = ? and carrito_tienda.Forma_pago =1;",
      [id, fecha]
    );

    const carrtoTendaEfectivoOne = await pool.query(
      "SELECT sum(Precio)  AS Total_Abono , Tipo_Forma_pago.Nombre as forma_pago , Fecha_compra, Precio , Cantidad ,Tipo_categoria.Nombre as nombre_categoria, carrito_tienda.Nombre ,carrito_tienda.ID_Categoria from carrito_tienda INNER JOIN Tipo_categoria on Tipo_categoria.ID = carrito_tienda.ID_Categoria INNER JOIN Tipo_Forma_pago on Tipo_Forma_pago.ID = carrito_tienda.Forma_pago WHERE carrito_tienda.ID_hotel = ? AND carrito_tienda.Fecha_compra = ? and carrito_tienda.Forma_pago !=1;",
      [id, fecha]
    );

    const carrtoTendaEfectivoTwo = await pool.query(
      "SELECT sum(Precio)  AS Total_Abono , Tipo_Forma_pago.Nombre as forma_pago , Fecha_compra, Precio , Cantidad ,Tipo_categoria.Nombre as nombre_categoria, carrito_tienda.Nombre ,carrito_tienda.ID_Categoria from carrito_tienda INNER JOIN Tipo_categoria on Tipo_categoria.ID = carrito_tienda.ID_Categoria INNER JOIN Tipo_Forma_pago on Tipo_Forma_pago.ID = carrito_tienda.Forma_pago WHERE carrito_tienda.ID_hotel = ? AND carrito_tienda.Fecha_compra = ? and carrito_tienda.Forma_pago =6;",
      [id, fecha]
    );

    const carrtoTendaEfectivoThree = await pool.query(
      "SELECT sum(Precio)  AS Total_Abono , Tipo_Forma_pago.Nombre as forma_pago , Fecha_compra, Precio , Cantidad ,Tipo_categoria.Nombre as nombre_categoria, carrito_tienda.Nombre ,carrito_tienda.ID_Categoria from carrito_tienda INNER JOIN Tipo_categoria on Tipo_categoria.ID = carrito_tienda.ID_Categoria INNER JOIN Tipo_Forma_pago on Tipo_Forma_pago.ID = carrito_tienda.Forma_pago WHERE carrito_tienda.ID_hotel = ? AND carrito_tienda.Fecha_compra = ? and carrito_tienda.Forma_pago =7;",
      [id, fecha]
    );

    const carrtoTenda = await pool.query(
      "SELECT Fecha_compra, Precio , Cantidad ,Tipo_categoria.Nombre as nombre_categoria, carrito_tienda.Nombre ,carrito_tienda.ID_Categoria from carrito_tienda INNER JOIN  Tipo_categoria on Tipo_categoria.ID  = carrito_tienda.ID_Categoria  WHERE carrito_tienda.ID_hotel = ? AND carrito_tienda.Fecha_compra = ?",
      [id, fecha]
    );

    const carroReserva = await pool.query(
      "SELECT Fecha_compra, Precio , Cantidad ,Tipo_categoria.Nombre as nombre_categoria, Carrito_reserva.Nombre ,Carrito_reserva.ID_Categoria from Carrito_reserva INNER JOIN Tipo_categoria on Tipo_categoria.ID = Carrito_reserva.ID_Categoria WHERE Carrito_reserva.ID_Hoteles = ? AND Carrito_reserva.Fecha_compra = ? and Carrito_reserva.pago_deuda = 1 ",
      [id, fecha]
    );

    const carroReservaEfectivo = await pool.query(
      "SELECT sum(Precio) AS Total_Abono, Fecha_compra, Precio , Cantidad ,Tipo_categoria.Nombre as nombre_categoria, Carrito_reserva.Nombre ,Carrito_reserva.ID_Categoria from Carrito_reserva INNER JOIN Tipo_categoria on Tipo_categoria.ID = Carrito_reserva.ID_Categoria INNER JOIN Tipo_Forma_pago on Tipo_Forma_pago.ID = Carrito_reserva.Forma_pago WHERE Carrito_reserva.ID_Hoteles = ? AND Carrito_reserva.Fecha_compra = ? and Carrito_reserva.pago_deuda = 1 and Carrito_reserva.Forma_pago !=1; ",
      [id, fecha]
    );

    const carroReservaEfectivoOne = await pool.query(
      "SELECT sum(Precio) AS Total_Abono, Fecha_compra, Precio , Cantidad ,Tipo_categoria.Nombre as nombre_categoria, Carrito_reserva.Nombre ,Carrito_reserva.ID_Categoria from Carrito_reserva INNER JOIN Tipo_categoria on Tipo_categoria.ID = Carrito_reserva.ID_Categoria INNER JOIN Tipo_Forma_pago on Tipo_Forma_pago.ID = Carrito_reserva.Forma_pago WHERE Carrito_reserva.ID_Hoteles = ? AND Carrito_reserva.Fecha_compra = ? and Carrito_reserva.pago_deuda = 1 and Carrito_reserva.Forma_pago != 1; ",
      [id, fecha]
    );

    const carroReservaEfectivoTwo = await pool.query(
      "SELECT sum(Precio) AS Total_Abono, Fecha_compra, Precio , Cantidad ,Tipo_categoria.Nombre as nombre_categoria, Carrito_reserva.Nombre ,Carrito_reserva.ID_Categoria from Carrito_reserva INNER JOIN Tipo_categoria on Tipo_categoria.ID = Carrito_reserva.ID_Categoria INNER JOIN Tipo_Forma_pago on Tipo_Forma_pago.ID = Carrito_reserva.Forma_pago WHERE Carrito_reserva.ID_Hoteles = ? AND Carrito_reserva.Fecha_compra = ? and Carrito_reserva.pago_deuda = 1 and Carrito_reserva.Forma_pago =6; ",
      [id, fecha]
    );

    const carroReservaEfectivoThree = await pool.query(
      "SELECT sum(Precio) AS Total_Abono, Fecha_compra, Precio , Cantidad ,Tipo_categoria.Nombre as nombre_categoria, Carrito_reserva.Nombre ,Carrito_reserva.ID_Categoria from Carrito_reserva INNER JOIN Tipo_categoria on Tipo_categoria.ID = Carrito_reserva.ID_Categoria INNER JOIN Tipo_Forma_pago on Tipo_Forma_pago.ID = Carrito_reserva.Forma_pago WHERE Carrito_reserva.ID_Hoteles = ? AND Carrito_reserva.Fecha_compra = ? and Carrito_reserva.pago_deuda = 1 and Carrito_reserva.Forma_pago =7; ",
      [id, fecha]
    );

    res.status(201).json({
      ok: true,
      roomByIdIDtypeRoom,
      roomByIdIDtypeRoomoOcasioanales,
      RoomBusyById,
      RoomAvaible,
      totalEfectivo,
      totalOtherMedios,
      tarjetadebito,
      tarjetaCredito,
      carrtoTenda,
      carroReserva,
      carrtoTendaEfectivo,
      carrtoTendaEfectivoOne,
      carroReservaEfectivo,
      carroReservaEfectivoOne,
      carrtoTendaEfectivoTwo,
      carrtoTendaEfectivoThree,
      carroReservaEfectivoTwo,
      carroReservaEfectivoThree,
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
    });
  }
};

const AccountErrings = async (req, res = response) => {
  try {
    const { id } = req.params;

    const { fecha } = req.body;

   /* const roomById = await axios.post(
      `https://grupo-hoteles.com/api/getTypeRoomsByIDHotel?id_hotel=${id}`,
      {},
      {
        headers: { "Content-type": "application/json" },
        timeout: 1000, // tiempo de espera de 5 segundos
      }
    );

    const response = roomById.data;*/
    
    const response = await pool.query("SELECT rooms.id as id_tipoHabitacion, rooms.name as nombre, rooms.price as precio, rooms.price_people as precio_persona,  rooms.people as persona , rooms.max_people as max_persona FROM accommodation JOIN rooms ON rooms.id = accommodation.id_room WHERE accommodation.id_hotel = ?;"
    ,[id]
    )
    

    const roomByIdIDtypeRoom = [];

    for (let i = 0; i < response?.length; i++) {
      const id_habitacion = response[i].id_tipoHabitacion;

      const query = await pool.query(
        "SELECT Reservas.ID, Carrito_reserva.Fecha_compra, Carrito_reserva.Cantidad, Carrito_reserva.Precio,Carrito_reserva.Nombre,  Habitaciones.Numero , Carrito_reserva.pago_deuda,Carrito_reserva.Precio FROM Carrito_reserva   INNER JOIN Reservas  on  Reservas.id  = Carrito_reserva.ID_Reserva  INNER JOIN  Habitaciones  on Habitaciones.ID = Reservas.ID_Habitaciones  WHERE  Habitaciones.ID_Hotel = ?  and  Carrito_reserva.Fecha_compra = ?  AND Habitaciones.ID_Tipo_habitaciones =? and Carrito_reserva.pago_deuda = 0 ",
        [id, fecha, id_habitacion]
      );

      query.forEach((element) => {
        roomByIdIDtypeRoom.push({
          room: response[i].nombre,
          pago_deuda: element.pago_deuda,
          numero: element.Numero,
          precio: element.Precio,
          nombreRoom: element.Nombre,
          cantidad: element.Cantidad,
          fecha: element.Fecha_compra,
          codigo: element.ID,
        });
      });
    }

    if (roomByIdIDtypeRoom.length == 0) {
      return res.status(401).json({
        ok: false,
      });
    }

    res.status(201).json({
      ok: true,
      roomByIdIDtypeRoom,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const informationByIdHotel = async (req, res = response) => {
  const { id } = req.params;

  try {
    const query = await pool.query(
      "SELECT * FROM `Information_hotels` WHERE Information_hotels.id_hotel = ?",
      [id]
    );

    res.status(201).json({
      ok: true,
      query,
    });
  } catch (error) {
    res.status(401);
  }
};

const InformeMovimiento = async (req, res = response) => {
  const { id } = req.params;

  const { Nombre_recepcion, Fecha, Movimiento,Valor_habitacion,Codigo_reserva } = req.body;

  console.log(Codigo_reserva)

  const data = {
    Nombre_recepcion,
    Fecha,
    ID_hotel: id,
    Movimiento,
    Valor_habitacion,
    Codigo_reserva
  };

  try {
    await pool.query(
      "INSERT INTO Informe_movimiento set ?",
      data,
      (err, customer) => {
        if (err) {
          return res.status(401).json({
            ok: false,
            msg: "error al insertar datos",
          });
        } else {
          return res.status(201).json({
            ok: true,
          });
        }
      }
    );
    res.status(201).json({
      ok: true,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const PostInformeMovimiento = async (req, res = response) => {
  const { id } = req.params;

  const { fecha } = req.body;

  try {
    const query = await pool.query(
      "SELECT Informe_movimiento.Fecha, Informe_movimiento.Nombre_recepcion, Canales.Nombre, Informe_movimiento.ID,Informe_movimiento.Movimiento,Valor_habitacion,Informe_movimiento.Codigo_reserva FROM Informe_movimiento LEFT JOIN Reservas on Reservas.ID   = Informe_movimiento.Codigo_reserva  LEFT JOIN Canales on Canales.ID = Reservas.ID_Canal  WHERE ID_hotel = ?  ORDER BY Nombre_recepcion ",
      [id, fecha]
    );

    if (query.length == 0) {
      return res.status(401).json({
        ok: false,
      });
    }

    res.status(201).json({
      ok: true,
      query,
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const updateReservationPunter = async (req, res = response) => {
  const { Fecha_final, id, countSeguro,type } = req.body;


  try {
    const queryImnformation = await pool.query(
      "SELECT ID_Habitaciones,Fecha_final ,Fecha_inicio,Adultos,Ninos from  Reservas  WHERE ID = ?",
      [id]
    );

    const datainform = queryImnformation[0];

    const ID_Habitaciones = datainform.ID_Habitaciones;

    const dateTime = datainform.Fecha_final;
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const desde = `${year}-${month}-${day} 15:00:00`; // aqui es la inversa de la fecha porque  aqui comienza la fecha
    const hasta = `${Fecha_final} 13:00:00`; //aqui termine la fehca donde yo quiero entender

    const dateTimeOne = datainform.Fecha_inicio;
    const dateOne = new Date(dateTimeOne);
    const yearOne = dateOne.getFullYear();
    const monthONe = String(dateOne.getMonth() + 1).padStart(2, "0");
    const dayONe = String(dateOne.getDate()).padStart(2, "0");
    const desdeONe = `${yearOne}-${monthONe}-${dayONe} 15:00:00`; // aqui es la inversa de la fecha porque  aqui comienza la fecha

    const hastaValid =  `${year}-${month}-${day}`;
    const desdeValid =`${yearOne}-${monthONe}-${dayONe}`; 

    var fecha1 = new Date(desde);
    var fecha2 = new Date(hasta);
    var fecha3 = new Date(desdeONe);

    var fechaini = new Date(`${yearOne}-${monthONe}-${dayONe}`);
    var fechafin = new Date(`${Fecha_final}`);
    var diasdif = fechafin.getTime() - fechaini.getTime();
    var contdias = Math.round(diasdif / (1000 * 60 * 60 * 24));

    let data = {
      Fecha_final: `${Fecha_final} 13:00:00`, // donde llega la fecha donde me quiero entender
      Noches: contdias,
    };

    var fechainiCheck = new Date(`${fecha1}`);
    var fechafinCheck = new Date(`${fecha2}`);
    var diasdifCheck = fechainiCheck.getTime()- fechafinCheck.getTime()
    var contdiasCheck = Math.round(diasdifCheck / (1000 * 60 * 60 * 24));

    const queryPay = await pool.query(
      "SELECT valor_dia_habitacion FROM Pagos  WHERE ID_Reserva =? and  pago_valid=1",
      [id]
    );

    const Payinform = queryPay[0];

    const totalHuespedCount =
      (parseInt(datainform.Adultos) + parseInt(datainform.Ninos)) * parseInt(countSeguro);

    const totalPay =
      (parseInt(Payinform.valor_dia_habitacion) + parseInt(totalHuespedCount)) *
      contdias;

    const dataPay = {
      Valor_habitacion: totalPay,
    };

    let dataBefore = {
      Fecha_inicio: `${Fecha_final} 15:00:00`, // donde llega la fecha donde me quiero entender
      Noches: contdiasCheck,
    };

    const totalPayCheck =
    (parseInt(Payinform.valor_dia_habitacion) + parseInt(totalHuespedCount)) *
    contdiasCheck;

    const dataPayCheck = {
      Valor_habitacion: totalPayCheck,
    };

    if (hastaValid == Fecha_final && type =="subir") {
      return  res.status(401).json({
         ok: false,
       });
    }
    
    if (desdeValid == Fecha_final) {
     return  res.status(401).json({
        ok: false,
      });

   
    } else if (fecha3 > fecha2 && type =="subir" ) {

      const desdeBefore = `${Fecha_final} 15:00:00`

      const hastaBefore = `${yearOne}-${monthONe}-${dayONe} 13:00:00`;

      const resultadoCheckBefore = await pool.query(
        "SELECT COUNT(*) AS Num_Reservas, Reservas.id, Habitaciones.ID_estado_habitacion FROM Reservas INNER JOIN Habitaciones on Habitaciones.ID = Reservas.ID_Habitaciones WHERE ID_Habitaciones = ? AND  Reservas.ID_Tipo_Estados_Habitaciones !=6 and Reservas.ID_Tipo_Estados_Habitaciones !=7 AND  ((Fecha_inicio <= ? AND Fecha_final >= ?) OR (Fecha_inicio <= ? AND Fecha_final >= ?) OR (Fecha_inicio >= ? AND Fecha_final <= ?)) ",
        [ID_Habitaciones, desdeBefore, desdeBefore, hastaBefore, hastaBefore, desdeBefore, hastaBefore]
      );

      if (resultadoCheckBefore[0].Num_Reservas > 0) {
        return res.status(401).json({
          ok: false,
        });
      }
     
      await pool.query(
        "UPDATE Reservas SET ? WHERE ID = ?",
        [dataBefore, id],
        (err, customer) => {
          if (err) {
            return res.status(401).json({
              ok: false,
              msg: "Error al insertar datos",
            });
          } else {
            const insertSecondQuery = async () => {
              pool.query(
                "UPDATE Pagos set ? WHERE ID_Reserva = ?",
                [dataPayCheck, id],
                (err, customer) => {
                  if (err) {
                    return res.status(401).json({
                      ok: false,
                      msg: "error al insertar datos",
                    });
                  } else {
                    return res.status(201).json({
                      ok: true,
                    });
                  }
                }
              );
            };
            insertSecondQuery();
          }
        }
      );

    }else if(fecha2 > fecha3 && type =="subir" ){
     
      await pool.query(
        "UPDATE Reservas SET ? WHERE ID = ?",
        [dataBefore, id],
        (err, customer) => {
          if (err) {
            return res.status(401).json({
              ok: false,
              msg: "Error al insertar datos",
            });
          } else {
            const insertSecondQuery = async () => {
              pool.query(
                "UPDATE Pagos set ? WHERE ID_Reserva = ?",
                [dataPayCheck, id],
                (err, customer) => {
                  if (err) {
                    return res.status(401).json({
                      ok: false,
                      msg: "error al insertar datos",
                    });
                  } else {
                    return res.status(201).json({
                      ok: true,
                    });
                  }
                }
              );
            };
            insertSecondQuery();
          }
        }
      );
    } else if (fecha1 > fecha2 && type =="bajar"  ) {
     
      
      await pool.query(
        "UPDATE Reservas SET ? WHERE ID = ?",
        [data, id],
        (err, customer) => {
          if (err) {
            return res.status(401).json({
              ok: false,
              msg: "Error al insertar datos",
            });
          } else {
            const insertSecondQuery = async () => {
              pool.query(
                "UPDATE Pagos set ? WHERE ID_Reserva = ?",
                [dataPay, id],
                (err, customer) => {
                  if (err) {
                    return res.status(401).json({
                      ok: false,
                      msg: "error al insertar datos",
                    });
                  } else {
                    return res.status(201).json({
                      ok: true,
                    });
                  }
                }
              );
            };
            insertSecondQuery();
          }
        }
      );
    } else if(fecha1 < fecha2  && type =="bajar"  ) {
     
      const resultadoCheck = await pool.query(
        "SELECT COUNT(*) AS Num_Reservas, Reservas.id, Habitaciones.ID_estado_habitacion FROM Reservas INNER JOIN Habitaciones on Habitaciones.ID = Reservas.ID_Habitaciones WHERE ID_Habitaciones = ? AND  Reservas.ID_Tipo_Estados_Habitaciones !=6 and Reservas.ID_Tipo_Estados_Habitaciones !=7 AND  ((Fecha_inicio <= ? AND Fecha_final >= ?) OR (Fecha_inicio <= ? AND Fecha_final >= ?) OR (Fecha_inicio >= ? AND Fecha_final <= ?)) ",
        [ID_Habitaciones, desde, desde, hasta, hasta, desde, hasta]
      );
    
      if (resultadoCheck[0].Num_Reservas > 0) {
        return res.status(401).json({
          ok: false,
        });
      }
     
      if (resultadoCheck[0].Num_Reservas == 0) {
        await pool.query(
          "UPDATE Reservas SET ? WHERE ID = ?",
          [data, id],
          (err, customer) => {
            if (err) {
              return res.status(401).json({
                ok: false,
                msg: "Error al insertar datos",
              });
            } else {
              const insertSecondQuery = async () => {
                pool.query(
                  "UPDATE Pagos set ? WHERE ID_Reserva = ?",
                  [dataPay, id],
                  (err, customer) => {
                    if (err) {
                      return res.status(401).json({
                        ok: false,
                        msg: "error al insertar datos",
                      });
                    } else {
                      return res.status(201).json({
                        ok: true,
                      });
                    }
                  }
                );
              };
              insertSecondQuery();
            }
          }
        );
      }
    }
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const updateChangeTypreRange = async (req, res = response) => {
  const { desde, hasta, ID_Habitaciones, id, ID_estado_habiatcion } = req.body;

  const valid = await pool.query(
    "SELECT  * from Reservas WHERE Reservas.ID =?",
    [id]
  );

  const idhabitacionesEstado = valid[0]?.ID_Tipo_Estados_Habitaciones;
  const idhabtiaciones = valid[0]?.ID_Habitaciones;

  

  const query = await pool.query(
    "SELECT Habitaciones.ID_Hotel,Reservas.ID_Tipo_Estados_Habitaciones from Reservas INNER JOIN Habitaciones on Habitaciones.ID = Reservas.ID_Habitaciones WHERE Habitaciones.ID = ? AND Reservas.ID_Tipo_Estados_Habitaciones =3",
    [ID_Habitaciones]
  );

  //  if(query.length > 0){
  //    console.log("error")
  //    return res.status(401).json({
  //      ok:false
  //    })
  //  }

  try {
    let data = {
      ID_Habitaciones,
      Fecha_inicio: desde,
      Fecha_final: hasta,
    };

    const resultado = await pool.query(
      "SELECT COUNT(*) AS Num_Reservas, Reservas.id, Habitaciones.ID_estado_habitacion FROM Reservas INNER JOIN Habitaciones on Habitaciones.ID = Reservas.ID_Habitaciones WHERE ID_Habitaciones = ? AND  Reservas.ID_Tipo_Estados_Habitaciones !=6 and Reservas.ID_Tipo_Estados_Habitaciones !=7 AND  ((Fecha_inicio <= ? AND Fecha_final >= ?) OR (Fecha_inicio <= ? AND Fecha_final >= ?) OR (Fecha_inicio >= ? AND Fecha_final <= ?))  ",
      [ID_Habitaciones, desde, desde, hasta, hasta, desde, hasta]
    );

    if (resultado[0].ID_estado_habitacion === 2) {
      return res.status(401).json({
        ok: false,
        message: "No se puede mover la reserva en ninguna dirección",
      });
    }

    if (resultado[0].Num_Reservas === 0) {
   
      if (idhabitacionesEstado == 3) {
        let data = {
          ID_estado_habitacion: 5,
        };
        await pool.query("UPDATE Habitaciones set ? WHERE ID = ?", [
          data,
          idhabtiaciones,
        ]);
    
        let dataOne = {
          ID_estado_habitacion: 3,
        };
        await pool.query("UPDATE Habitaciones set ? WHERE ID = ?", [
          dataOne,
          ID_Habitaciones,
        ]);
      }
      await pool.query(
        "UPDATE Reservas SET ? WHERE ID = ?",
        [data, id],
        (err, customer) => {
          if (err) {
            return res.status(401).json({
              ok: false,
              message: "Error al insertar datos",
            });
          } else {
            return res.status(201).json({
              ok: true,
              message: "Se actualizó la reserva",
            });
          }
        }
      );
    } else {
      const existingReservations = await pool.query(
        "SELECT Fecha_inicio, Fecha_final FROM Reservas WHERE ID_Habitaciones = ?",
        [ID_Habitaciones]
      );

      const isAdjacent = existingReservations.some((reservation) => {
        const reservationStartDate = moment(reservation.Fecha_inicio).startOf(
          "day"
        );
        const reservationEndDate = moment(reservation.Fecha_final).startOf(
          "day"
        );
        const selectedStartDate = moment(desde).startOf("day");
        const selectedEndDate = moment(hasta).startOf("day");

        return (
          (reservationEndDate.diff(selectedStartDate, "days") === 1 &&
            reservationEndDate.diff(selectedEndDate, "days") === 0) ||
          (reservationStartDate.diff(selectedEndDate, "days") === -1 &&
            reservationStartDate.diff(selectedStartDate, "days") === 0)
        );
      });
      if (isAdjacent) {
        console.log("fecha")
        return res.status(401).json({
          ok: false,
          message: "Puede mover la reserva en cualquier dirección",
        });
      } else {
        return res.status(401).json({
          ok: false,
          message: "No se puede mover la reserva a ninguna dirección",
        });
      }
    }
  } catch (e) {
    return res.status(401).json({
      ok: false,
      message: "Error al procesar la solicitud",
    });
  }
};

const handChangeFormapago = async (req, res = response) => {
  const { ID, Tipo_forma_pago } = req.body;

  let data = {
    Tipo_forma_pago,
  };

  try {
    if (!Tipo_forma_pago) {
      return res.status(401).json({
        ok: false,
      });
    }

    await pool.query(
      "UPDATE Pago_abono SET ? WHERE ID = ?",
      [data, ID],
      (err, customer) => {
        if (err) {
          return res.status(401).json({
            ok: false,
            msg: "Error al actualizar datos",
          });
        } else {
          return res.status(201).json({
            ok: true,
          });
        }
      }
    );
  } catch (error) {
    res.status(401).json({
      ok: false,
    });
  }
};

const getReservationSearch = async (req, res = response) => {
  try {
    const response = await pool.query(
      "SELECT web_checking.ID_Reserva as ID_Reserva, Habitaciones.ID_Tipo_habitaciones, web_checking.Celular,web_checking.ID_Tipo_documento as ID_documento,Prefijo_number.codigo ,Prefijo_number.nombre as nacionalidad, web_checking.Num_documento, Habitaciones.ID_Hotel, web_checking.Nombre,web_checking.Apellido, Reservas.Noches,Reservas.Adultos,Reservas.Ninos, Reservas.ID_Tipo_Estados_Habitaciones ,Habitaciones.Numero, Reservas.ID, Reservas.ID_Habitaciones, Reservas.Codigo_reserva, Reservas.Fecha_inicio, Reservas.Fecha_final,Reservas.Observacion, Habitaciones.ID_Tipo_estados , Pagos.Valor_habitacion,Pagos.Abono FROM Reservas INNER JOIN Habitaciones ON Habitaciones.ID = Reservas.ID_Habitaciones INNER join web_checking on web_checking.ID_Reserva = Reservas.id INNER JOIN Pagos on Pagos.ID_Reserva = Reservas.id INNER join Prefijo_number on Prefijo_number.ID = web_checking.ID_Prefijo WHERE Reservas.ID_Tipo_Estados_Habitaciones = 0;"
    );

    const promises = [];

    for (let i = 0; i < response.length; i++) {
      promises.push({
        Num_Room: response[i].Numero,
        codigobyId: response[i].ID_Reserva,
        Codigo_reservaOne: `X14A-${response[i].Num_documento}${response[i].ID}`,
        Observation: response[i].Observacion,
        Noches: response[i].Noches,
        Adultos: response[i].Adultos,
        Ninos: response[i].Ninos,
        Title: `${response[i].Numero} ${response[i].Nombre} ${response[i].Apellido}`,
        ID: response[i].ID,
        ID_Habitaciones: response[i].ID_Habitaciones,
        Codigo_reserva: response[i].Codigo_reserva,
        Fecha_inicio: response[i].Fecha_inicio,
        Fecha_final: response[i].Fecha_final,
        ID_Tipo_estados: response[i].ID_Tipo_Estados_Habitaciones,
        Nombre: response[i].Nombre,
        Document: response[i].Num_documento,
        Last_name: response[i].Apellido,
        Valor_habitacion: response[i].Valor_habitacion,
        abono: response[i].Abono,
        Celular: response[i].Celular,
        codigo: response[i].codigo,
        nacionalidad: response[i].nacionalidad,
        ID_document: response[i].ID_documento,  
        ID_hotel: response[i].ID_Hotel,
        ID_tipo_habitaciones: response[i].ID_Tipo_habitaciones,
      });
    }

    const query = await Promise.all(promises);

    res.status(201).json({
      ok: true,
      query,
    });
  } catch (error) {
    console.log("error");
    res.status(401).json({
      ok: false,
    });
  }
};

const UploadFile = async (req, res = response) => {
  const { id } = req.body;

  try {
    const files = req.files;

    if (!files || files.length !== 2) {
      return res.status(401).json({
        ok: false,
        msg: "Debe seleccionar dos imágenes",
      });
    }

    const rutaAdelante =
      "https://test-prueba-production.up.railway.app/public/" +
      files[0].filename;
    const rutaAtras =
      "https://test-prueba-production.up.railway.app/public/" +
      files[1].filename;

    let data = {
      Foto_documento_adelante: rutaAdelante,
      Foto_documento_atras: rutaAtras,
    };

    await pool.query(
      "UPDATE web_checking SET ? WHERE ID_Reserva = ?",
      [data, id],
      (err, customer) => {
        if (err) {
          return res.status(401).json({
            ok: false,
            msg: "Error al actualizar datos",
          });
        } else {
          return res.status(201).json({
            ok: true,
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(401).json({
      ok: false,
    });
  }
};

const UploadFileSignature = async (req, res = response) => {
  const { id } = req.body;

  try {
    const { myFile } = req.body;

    if (!myFile) {
      return res.status(401).json({
        ok: false,
        msg: "Debe seleccionar una imagen",
      });
    }

    let data = {
      Pasaporte: myFile,
    };

    await pool.query(
      "UPDATE web_checking SET ? WHERE ID_Reserva = ?",
      [data, id],
      (err, customer) => {
        if (err) {
          return res.status(401).json({
            ok: false,
            msg: "Error al actualizar datos",
          });
        } else {
          return res.status(201).json({
            ok: true,
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(401).json({
      ok: false,
    });
  }
};

const ValidCheckingAll = async (req, res = response) => {
  const { id } = req.params;

  const query = await pool.query(
    "SELECT Habitaciones.ID_Hotel,Reservas.ID_Tipo_Estados_Habitaciones from Reservas INNER JOIN Habitaciones on Habitaciones.ID = Reservas.ID_Habitaciones WHERE Habitaciones.ID = ? AND Reservas.ID_Tipo_Estados_Habitaciones =3",
    [id]
  );

  if (query.length > 0) {
    return res.status(401).json({
      ok: false,
    });
  }

  return res.status(201).json({
    ok: true,
  });
};

const KPIgetUser = async (req, res = response) => {
  const { month, year, idUser, ID_hotel } = req.body;

  try {
    const query = await pool.query(
      "SELECT * FROM KPI WHERE MONTH(Fecha_venta) = ? AND YEAR(Fecha_venta) = ? and ID_user =? and ID_hotel =?  and Pago_deuda =1",
      [month, year, idUser, ID_hotel]
    );

    return res.status(201).json({
      ok: true,
      query,
    });
  } catch (error) {
    return res.status(401)({
      ok: false,
    });
  }
};

const KpiTop = async (req, res = response) => {
  try {
    const query = await pool.query(
      "SELECT APP_colaboradores.id, APP_colaboradores.name, APP_colaboradores.lastName, APP_colaboradores.foto AS APP, KPI.ID_user, users.id AS user_id, KPI.Cantidad, KPI.Precio, COALESCE(SUM(KPI.Cantidad_comision), 0) AS Total_Cantidad_comision FROM users INNER JOIN APP_colaboradores ON APP_colaboradores.id_user = users.id LEFT JOIN KPI ON KPI.ID_user = users.id WHERE APP_colaboradores.status = 0 AND users.id_permissions = 2 GROUP BY users.id ORDER BY Total_Cantidad_comision DESC;"
    );

    return res.status(201).json({
      ok: true,
      query,
    });
  } catch (error) {
    return res.status(401)({
      ok: false,
    });
  }
};

const GetPublicidad = async (req, res = response) => {
  try {
    const query = await pool.query("select * from PopUpPms");

    return res.status(201).json({
      ok: true,
      query,
    });
  } catch (error) {
    return res.status(401)({
      ok: false,
    });
  }
};

const searchUsersaved = async (req, res = response) => {
  const { serchvalue, type } = req.body;

  try {
    const searchTerm = serchvalue;

    if (serchvalue.length === 0) {
      return res.json({
        ok: false,
        message: "No se encontraron usuarios",
      });
    }

    switch (type) {
      case "document":
        const queryString =
          "SELECT web_checking.ID ,web_checking.ID_Reserva,web_checking.Num_documento,web_checking.Nombre,web_checking.Apellido,web_checking.Fecha_nacimiento,web_checking.Celular,web_checking.Correo,web_checking.Ciudad,Prefijo_number.ID as id_nacionalidad, web_checking.ID_Tipo_documento FROM web_checking  INNER JOIN  Prefijo_number  on Prefijo_number.ID  = web_checking.ID_Prefijo WHERE Num_documento LIKE ? GROUP BY web_checking.Num_documento LIMIT 1;";

        const querySeach = await pool.query(
          queryString,
          [`%${searchTerm}%`],
          (error, results) => {
            if (error) {
              return res.status(401).json({
                ok: false,
              });
            } else {
              if (results.length == 0) {
                return res.json({
                  ok: false,
                });
              }
              return res.status(201).json({
                ok: true,
                results,
              });
            }
          }
        );
      case "username":
        const queryStringUsername =
          "SELECT web_checking.ID ,web_checking.ID_Reserva,web_checking.Num_documento,web_checking.Nombre,web_checking.Apellido,web_checking.Fecha_nacimiento,web_checking.Celular,web_checking.Correo,web_checking.Ciudad FROM web_checking WHERE Nombre LIKE ? GROUP BY web_checking.Num_documento LIMIT 10 ";

        const querySeachUsername = await pool.query(
          queryStringUsername,
          [`%${searchTerm}%`],
          (error, results) => {
            if (error) {
              return res.status(401).json({
                ok: false,
              });
            } else {
              return res.status(201).json({
                ok: true,
                results,
              });
            }
          }
        );
      default:
        return res.json({
          status: false,
          message: "No se encontraron usuarios",
        });
    }
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: "No se encontraron usuarios",
    });
  }
};

const postInsetRoomsOcasional = async (req, res = response) => {
  const {
    ID_habitacion,
    Fecha,
    Fecha_today,
    Time_ingreso,
    Time_salida,
    id_user,
    Hora_adicional,
    Persona_adicional,
    Tipo_forma_pago,
    Abono,
    ID_hotel
  } = req.body;

  let dataOne = {
    valid: 0,
  };

  let data = {
    ID_habitacion,
    Fecha,
    Fecha_today,
    Time_ingreso,
    Time_salida,
    id_user,
    Hora_adicional,
    Persona_adicional,
    Tipo_forma_pago,
    Abono,
    valid: 1,
    ID_hotel
  };



  try {
   await  pool.query(
      "UPDATE RoomOcasionales set ? WHERE ID_habitacion = ?",
      [dataOne, ID_habitacion],
      (err, customer) => {
        if (err) {
          return res.status(401).json({
            ok: false,
          });
        } else {
          const insertSecondQuery = async () => {

              await pool.query(
                "INSERT INTO RoomOcasionales set ?",
                data,
                (err, customer) => {
                  if (err) {
                    return res.status(401).json({
                      ok: false,
                      msg: "error al insertar datos",
                    });
                  } else {
                    return res.status(201).json({
                      ok: true,
                    });
                  }
                }
              );
          };

          insertSecondQuery();
        }
      }
    );
  } catch (error) {
    return res.status(401).json({
      ok: false,
    });
  }
};

const getRoomsOcasionalesDetail = async (req, res = response) => {
  
  const { id } = req.body;

  try {

    const query =  await  pool.query("SELECT Carrito_room.ID, Carrito_room.Nombre as nombre_product ,Carrito_room.Precio,Carrito_room.Cantidad,Carrito_room. ID_Categoria,Carrito_room.Fecha_compra,Carrito_room.Pago_deuda ,Carrito_room.Forma_pago,Carrito_room.ID_user,Carrito_room.ID_product, Carrito_room.img_product ,Tipo_Forma_pago.Nombre as Nombre_forma_pago,APP_colaboradores.foto from Carrito_room inner JOIN Tipo_Forma_pago on Tipo_Forma_pago.ID = Carrito_room.Forma_pago INNER join APP_colaboradores on APP_colaboradores.id_user = Carrito_room.ID_user WHERE Carrito_room.Fecha_compra = CURDATE() and Carrito_room.ID_habitacion = ?;",[id])

    if(query.length == 0){
      return res.status(401).json({
        msg:"No encontrado",
        ok:false
      })
    }

    return res.status(201).json({
      ok:true,
      query
    })
   
  
  } catch (error) {
    return res.status(401)({
      ok: false,
    });
  }
};


const occasionalUpdateProductData =async(req, res = response) => {

  const {Tipo_forma_pago,selectedItems} = req.body

  try {

    const updatePromises = selectedItems.map(async (char) => {
      let dataone = {
        Pago_deuda: 1,
        Forma_pago:Tipo_forma_pago
      };
  
      await pool.query("UPDATE Carrito_room SET ? WHERE ID = ?", [dataone, char]);
    });

    await Promise.all(updatePromises);

    return res.status(201).json({
      ok:true
    })
    
  } catch (error) {

    return res.status(401).json({
      ok:false
    })

  }

}

const getReservationContabilidad=async(req, res = response) =>{

  const {id}  = req.params

  try {

  const queryResonse = await pool.query(
    `SELECT web_checking.residualsArray, web_checking.ID_Reserva as ID_RESERVA,Reservas.Observacion,Canales.Nombre as Canales_Nombre, web_checking.Tipo_persona as tipo_persona, web_checking.ID as id_persona,web_checking.Foto_documento_adelante,web_checking.Foto_documento_atras,web_checking.Pasaporte,web_checking.Iva, web_checking.Firma, Reservas.ID_Habitaciones, Habitaciones.ID_Tipo_habitaciones, Habitaciones.Numero, Talla_mascota.Talla, Reservas.Codigo_reserva, Reservas.Adultos, Reservas.Ninos, Reservas.Infantes, Reservas.Fecha_inicio, Reservas.Fecha_final, Reservas.Noches, Reservas.Descuento, Reservas.Placa,Reservas.ID_Tipo_Estados_Habitaciones AS Estado, web_checking.ID_Tipo_documento, web_checking.Num_documento, web_checking.Nombre, web_checking.Apellido, web_checking.Fecha_nacimiento, web_checking.Celular, web_checking.Correo, web_checking.Ciudad, Tipo_Forma_pago.Nombre as forma_pago, Pagos.Valor as valor_pago, Pagos.Valor_habitacion as valor_habitacion , Pagos.Abono as valor_abono,Pagos.valor_dia_habitacion, Prefijo_number.nombre as nacionalidad,Prefijo_number.codigo , Pagos.ID as ID_pago, Habitaciones.ID_estado_habitacion FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN Talla_mascota ON Reservas.ID_Talla_mascota = Talla_mascota.ID INNER JOIN web_checking ON web_checking.ID_Reserva = Reservas.ID INNER JOIN Canales ON Canales.id= Reservas.ID_Canal INNER JOIN Pagos on Reservas.ID = Pagos.ID_Reserva INNER  join Tipo_Forma_pago on Pagos.ID_Tipo_Forma_pago = Tipo_Forma_pago.ID INNER  JOIN  Prefijo_number on web_checking.ID_Prefijo = Prefijo_number.ID  WHERE Habitaciones.ID_Hotel= ? and Pagos.pago_valid=1 and Reservas.ID_Tipo_Estados_Habitaciones =6 and web_checking.residualsArray =0  ORDER  by web_checking.ID  DESC;`,
     [id]
   );

   if(queryResonse.length ==0){
    return res.status(401).json({
      msg:"no se encontro nada",
      ok:false
    })
   }

  const query = await Promise.all(queryResonse);

  const flattenedRooms = query.flat()

    return res.status(201).json({
      ok:true,
      query:flattenedRooms
    })  
  } catch (error) {
    
    return res.status(401).json({
      ok:false
    })

  }

}

const postChangeResdian =async(req, res = response) =>{

  const {id,resdian} = req.body

  let data = {
    residualsArray:resdian
  };

  try {

    await  pool.query(
      "UPDATE web_checking set ? WHERE ID_Reserva = ?",
      [data, id],
      (err, customer) => {
        if (err) {
          return res.status(401).json({
            ok: false,
          });
        }{
          return res.status(201).json({
            ok:true
          })
        }
      }
    )
  } catch (error) {
    return res.status(401).json({
      ok:false
    })
  }
}


const getReservaSendingContabilidad=async(req, res = response) =>{

  const {id}  = req.params

  try {

  
    const queryResonse = await pool.query(
      `SELECT web_checking.residualsArray, web_checking.ID_Reserva as ID_RESERVA,Reservas.Observacion,Canales.Nombre as Canales_Nombre, web_checking.Tipo_persona as tipo_persona, web_checking.ID as id_persona,web_checking.Foto_documento_adelante,web_checking.Foto_documento_atras,web_checking.Pasaporte,web_checking.Iva, web_checking.Firma, Reservas.ID_Habitaciones, Habitaciones.ID_Tipo_habitaciones, Habitaciones.Numero, Talla_mascota.Talla, Reservas.Codigo_reserva, Reservas.Adultos, Reservas.Ninos, Reservas.Infantes, Reservas.Fecha_inicio, Reservas.Fecha_final, Reservas.Noches, Reservas.Descuento, Reservas.Placa,Reservas.ID_Tipo_Estados_Habitaciones AS Estado, web_checking.ID_Tipo_documento, web_checking.Num_documento, web_checking.Nombre, web_checking.Apellido, web_checking.Fecha_nacimiento, web_checking.Celular, web_checking.Correo, web_checking.Ciudad, Tipo_Forma_pago.Nombre as forma_pago, Pagos.Valor as valor_pago, Pagos.Valor_habitacion as valor_habitacion , Pagos.Abono as valor_abono,Pagos.valor_dia_habitacion, Prefijo_number.nombre as nacionalidad,Prefijo_number.codigo , Pagos.ID as ID_pago, Habitaciones.ID_estado_habitacion FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN Talla_mascota ON Reservas.ID_Talla_mascota = Talla_mascota.ID INNER JOIN web_checking ON web_checking.ID_Reserva = Reservas.ID INNER JOIN Canales ON Canales.id= Reservas.ID_Canal INNER JOIN Pagos on Reservas.ID = Pagos.ID_Reserva INNER  join Tipo_Forma_pago on Pagos.ID_Tipo_Forma_pago = Tipo_Forma_pago.ID INNER  JOIN  Prefijo_number on web_checking.ID_Prefijo = Prefijo_number.ID  WHERE Habitaciones.ID_Hotel= ? and Pagos.pago_valid=1 and Reservas.ID_Tipo_Estados_Habitaciones =6 and web_checking.residualsArray =1  ORDER  by web_checking.ID  DESC;`,
       [id]
     );
  
     if(queryResonse.length ==0){
      return res.status(401).json({
        msg:"no se encontro nada",
        ok:false
      })
     }

     const flattenedRooms = queryResonse.flat()

    return res.status(201).json({
      ok:true,
      query:flattenedRooms
    }) 
    
  } catch (error) {
    return res.status(401).json({
      ok:false
    })
  }

}


const GetFacturacion=async(req, res = response) =>{

  try {
    const queryResonse = await pool.query(
      `SELECT id, name_people FROM APP_FORM_FACTURE`,
     );
      
     return res.status(201).json({
      ok:true,
      query:queryResonse
     })
    
  } catch (error) {
    return res.status(401).json({
      ok:false
    })
  }

}


const PostFacturacion=async(req, res = response) =>{

  const {id} = req.params

  try {
    const queryResonse = await pool.query(`SELECT id, type_people ,num_id,name_people,apellido_people , number_people, direccion_people,email_people FROM APP_FORM_FACTURE WHERE id =?`,[id]);
      
     return res.status(201).json({
      ok:true,
      query:queryResonse
     })
    
  } catch (error) {
    return res.status(401).json({
      ok:false
    })
  }

}

const GetDocument =async(req, res = response) =>{

  try {

    const query = await pool.query("SELECT ID_document_dian, id as ID,min_type as Type, type as nombre FROM APP_type_document; ")

    return res.status(201).json({
      ok:true,
      query
     })
    
  } catch (error) {
      return res.status(401).json({
      ok:false
     })
    
  }

}


const PostTypeRoomsByIDHotelid_hotel =async(req, res = response) =>{

  const {id} =  req.params

  try {

    const query = await pool.query("SELECT rooms.id as id_tipoHabitacion, rooms.name as nombre, rooms.price as precio, rooms.price_people as precio_persona,  rooms.people as persona , rooms.max_people as max_persona FROM accommodation JOIN rooms ON rooms.id = accommodation.id_room WHERE accommodation.id_hotel = ?;"
    ,[id]
    )

    return res.status(201).json({
      ok:true,
      query 
     })
    
  } catch (error) {
      return res.status(401).json({
      ok:false
     })
    
  }

}

const GetSouvenir =async(req, res = response) =>{

  try {

    const query = await pool.query("SELECT ID_Tipo_categoria, Nombre,Cantidad,Precio FROM `Productos` WHERE Productos.ID_Hoteles = 4 AND Productos.ID_Tipo_categoria = 3;")

    return res.status(201).json({
      ok:true,
      query 
     })
    
  } catch (error) {
      return res.status(401).json({
      ok:false
     }) 
  }
}


const  proxyTraOne=async(req, res = response) =>{

  const {body,token} = req.body

  try {
    const response = await fetch('https://pms.mincit.gov.co/one/', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
     body:JSON.stringify(body)
    });
    const responseData = await response.json();

    console.log({"one":responseData})

   if(!responseData.code){
    return res.status(401).json({
      ok:false,
      responseData
    })
   }
    return res.status(201).json({
      ok: true,
      responseData
    });
  } catch (error) {
   
    return res.status(401).json({
      ok:false
    })
  }
  
}


const  proxyTraTwo=async(req, res = response) =>{

  const {body,token} = req.body
  console.log({"two":body})
  try {
    const response = await fetch('https://pms.mincit.gov.co/two/', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
     body:JSON.stringify(body)
    });
    const responseData = await response.json();
    
   if(!responseData.code){
    return res.status(401).json({
      ok:false,
      responseData
    })
   }
    return res.status(201).json({
      ok: true,
      responseData
    });
  } catch (error) {
   
    return res.status(401).json({
      ok:false
    })
  }
}

const InsertPdfFacturacionsigo=async(req, res = response) =>{

  const {id, id_sigo,id_user,fecha} = req.body

  try {

    /*;*/

    const roomPay = await pool.query(
      "SELECT SUM(Pago_abono.Abono) as Total_Abono FROM Pago_abono WHERE  Pago_abono.Valid_Dian=0 and Pago_abono.ID_Reserva =?",
      [id]
    );

    const abono = roomPay[0].Total_Abono || 0;

    if(!abono){
      return res.status(401).json({
        ok:false,
        msg:"noso puede facturar en numero 0"
      })
    }else{

      let dataDian ={
        Fecha:fecha,
        id_user,
        Abono:abono,
        ID_facturacion:id_sigo,
        ID_Reserva:id
      }
  
      await pool.query('INSERT INTO Dian_facturacion_register set ?', dataDian, (err, customer) => {
        if(err){
            return res.status(401).json({
                 ok:false,
                 msg:"error al insertar datos"
            })
         }else{
            const insertSecondQuery = async() => {
  
              let data = {
                Valid_Dian:1
              }
  
                pool.query('UPDATE Pago_abono set ? WHERE ID_Reserva = ?', [data,id], (err, customer) => {
                    if (err) {
                        return res.status(401).json({
                            ok: false,
                            msg: "error al insertar datos"
                        });
                    } else {

                      const insertSecondQuery = async() =>{

                        let dataThird = {
                          ID_facturacion:123456
                        };

                        await  pool.query(
                          "UPDATE web_checking set ? WHERE ID_Reserva = ?",
                          [dataThird,id],
                          (err, customer) => {
                            if (err) {
                              return res.status(401).json({
                                ok: false,
                              });
                            }{
                              return res.status(201).json({
                                ok:true
                              })
                            }
                          }
                        )
                      }

                      insertSecondQuery()

                    }
                });
                 
            }
            insertSecondQuery();
         }
      })
    }

  
   return  res.status(201).json({
    ok:true
   })
    
  } catch (error) {
    return res.status(401).json({
      ok:false
    })
  }
  
}

const ReservationClean=async(req, res = response) =>{
  const {
    desde,
    hasta,
    habitaciones,
    disponibilidad,
    username
  } = req.body;

 
  try {

    const date1 = new Date(desde);
    const date2 = new Date(hasta);
  
    if (date1 > date2) {
      return res.status(201).json({
        msg: "no puede ser mayor de la fecha",
        ok: false,
      });
    }

    const resultado = await pool.query(
      "SELECT COUNT(*) AS Num_Reservas FROM Reservas WHERE ID_Habitaciones = ? AND Reservas.ID_Tipo_Estados_Habitaciones !=6 AND Reservas.ID_Tipo_Estados_Habitaciones !=7 AND ((Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio >= ? AND Fecha_final <=  ?))",
      [disponibilidad, desde, desde, hasta, hasta, desde, hasta]
    );

    if (resultado[0].Num_Reservas == 0) {
      let desdeSinHora = desde.split(" ", 1);
      let hastaSinHora = hasta.split(" ", 1);

      //const reservation = await pool.query("SELECT Reservas.ID_Habitaciones,  Reservas.ID, Reservas.Codigo_reserva FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones =? AND Reservas.Fecha_inicio BETWEEN ? AND ? OR Reservas.Fecha_final BETWEEN ? AND ?",[habitaciones, desde, hasta, desde, hasta])
      const reservation = await pool.query(
        "SELECT * FROM Lista_Fechas_Reservada INNER JOIN Habitaciones ON Lista_Fechas_Reservada.ID_Habitaciones = Habitaciones.ID WHERE Habitaciones.ID_Tipo_habitaciones = ? AND Lista_Fechas_Reservada.Date > ? AND  Lista_Fechas_Reservada.Date <= ? GROUP BY Lista_Fechas_Reservada.ID_Habitaciones",
        [habitaciones, desdeSinHora, hastaSinHora]
      );

      var n1 = 20000;
      var n2 = 10000;
      var numero = Math.floor(Math.random() * (n1 - (n2 - 1))) + n2;

      let id_disponible = disponibilidad;

      if (reservation.length == 0) {
        id_disponible = id_disponible;
      }

      const data = {
        ID_Usuarios: 1,
        ID_Habitaciones: parseInt(id_disponible.toString()),
        ID_Talla_mascota: 0,
        Codigo_reserva: numero,
        Adultos: 0,
        Ninos: 0,
        Infantes: 0,
        Fecha_inicio: desde,
        Fecha_final: hasta,
        Noches: 1,
        Descuento: 0,
        ID_Canal: 0,
        ID_Tipo_Estados_Habitaciones: 2,
        Observacion: "",
      };

      const to = await pool.query("INSERT INTO Reservas set ?", data);

      const queryResult = await pool.query(
        "SELECT MAX(ID) as max FROM Reservas"
      );
      const result = queryResult[0].max;
   
      const newReservation = {
        ID_Tipo_estados: 2,
      };

      await pool.query("UPDATE Habitaciones set ? WHERE ID = ?", [
        newReservation,
        data.ID_Habitaciones,
      ]);


      for (let i = 0;i<1;i++) {
          const date = {
            ID_Reserva: parseInt(result?.toString()),
            ID_Tipo_documento: 5,
            Num_documento: "",
            Nombre:`Bloqueada ${username}`,
            Apellido:"",
            Fecha_nacimiento: "2000-02-02",
            Celular: "3213132132",
            Correo: "ibarrantes@gadventures.com",
            Ciudad: "medellin",
            ID_Prefijo: "734",
            Tipo_persona: "persona",
            Firma: 0,
            Iva: 2,
            ID_facturacion:""
        };

          const toone = pool.query(
            "INSERT INTO  web_checking set ?",
            date,
            (q_err, q_res) => {
              if (q_err)
                return res.status(401).json({
                  ok: false,
                });
            }
          );
      }

      const pay = {
        ID_Reserva: parseInt(result.toString()),
        ID_Motivo: 1,
        ID_Tipo_Forma_pago:0,
        Valor: 0,
        Abono: 0,
        Valor_habitacion: 0,
        valor_dia_habitacion: 0,
        pago_valid: 1,
      };

      const tothre = pool.query("INSERT INTO  Pagos  set ?", pay);

      const queryOne = await pool.query(
        "SELECT web_checking.Nombre ,web_checking.Apellido, web_checking.Celular, Prefijo_number.codigo ,web_checking.Num_documento,web_checking.ID_Reserva FROM web_checking INNER JOIN Prefijo_number on web_checking.ID_Prefijo = Prefijo_number.ID WHERE web_checking.ID_Reserva =?",
        [parseInt(result.toString())]
      );

      return res.status(201).json({
        ok: true,
      });
    } else {
      console.log("kdnaskjdhsa")
      return res.status(401).json({
        ok: false,
      });
    }
  } catch (error) {
    console.log("error global")
    return res.status(401).json({
      ok: false,
      msg: "comuniquese con el administrador ",
    });
  }
}

const HandDasboard =async(req, res = response) => {

  const {idHotel,fecha} = req.body

  console.log(fecha)

  try {

    const FechaInicio = `${fecha} 13:00:00`;
    const FechaFinal =  `${fecha} 15:00:00`;

    const RoomBusyById = await pool.query(
      "SELECT COUNT(*) AS Num_Reservas,Reservas.id FROM Reservas INNER JOIN Habitaciones on Reservas.ID_Habitaciones  = Habitaciones.ID WHERE Reservas.ID_Tipo_Estados_Habitaciones =3 AND  Habitaciones.ID_Hotel = ?  AND ((Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio >= ? AND Fecha_final <=  ?))",
      [
        idHotel,
        FechaInicio,
        FechaFinal,
        FechaFinal,
        FechaInicio,
        FechaInicio,
        FechaFinal,
      ]
    );

    const RoomBlock = await pool.query(
      "SELECT COUNT(*) AS Num_Reservas,Reservas.id FROM Reservas INNER JOIN Habitaciones on Reservas.ID_Habitaciones  = Habitaciones.ID WHERE Reservas.ID_Tipo_Estados_Habitaciones =2 AND  Habitaciones.ID_Hotel = ?  AND ((Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio <= ? AND Fecha_final >=  ?) OR (Fecha_inicio >= ? AND Fecha_final <=  ?))",
      [
        idHotel,
        FechaInicio,
        FechaFinal,
        FechaFinal,
        FechaInicio,
        FechaInicio,
        FechaFinal,
      ]
    );

    const totalRoomsQuery = await pool.query("SELECT COUNT(*) AS Total_Habitaciones FROM Habitaciones WHERE ID_Hotel = ?", [idHotel]);

    const totalRooms = totalRoomsQuery[0].Total_Habitaciones;
    const occupiedRooms = RoomBusyById[0].Num_Reservas;
    const occupancyPercentage = (occupiedRooms / totalRooms * 100) 
    let tasaOcupacionRedondeada = Math.round(occupancyPercentage);

    const occupiedRoomsBlock = RoomBlock[0].Num_Reservas;
    const occupancyPercentageBlcok = (occupiedRoomsBlock / totalRooms * 100) 
    let tasaOcupacionRedondeadaBlock = Math.round(occupancyPercentageBlcok);
 
    const habitacionesDisponibles = totalRooms - (occupiedRooms + occupiedRoomsBlock);

  // Calcula el porcentaje de disponibilidad
    const porcentajeDisponibilidad = (habitacionesDisponibles / totalRooms) * 100;
    let tasaDisponibilidad = Math.round(porcentajeDisponibilidad);

  return   res.status(201).json({
    ok:true,
    Occupation:tasaOcupacionRedondeada,
    Block:tasaOcupacionRedondeadaBlock,
    Available:tasaDisponibilidad,
    NumReservation:occupiedRooms,
    NumBlock:occupiedRoomsBlock,
    NumAvailable:habitacionesDisponibles
  })

  } catch (error) {

    return res.status(401).json({
      ok:false
    })
  }
}

const HandUpdateUserRoles= async(req, res = response) => {

    const {id_permissions,id} =req.body

    let data = {
      id_permissions:id_permissions
    };
    
    try {
    await  pool.query(
      "UPDATE users set ? WHERE id = ?",
      [data,id],
      (err, customer) => {
        if (err) {
          return res.status(401).json({
            ok: false,
          });
        }{
          return res.status(201).json({
            ok:true
          })
        }
      }
    )
    } catch (error) {
      return res.status(401).json({
        ok:false
      })
    }
}


const GetMetricasInformeMonthHotel =async(req, res = response) => {

  const { fecha,id } = req.body;

  try { 

    var fechaOne = new Date(fecha);
 
    var numero_year = fechaOne.getFullYear() 
    var numero_mes =  fechaOne.getUTCMonth() + 1;

    const queryOne = await pool.query(
      "SELECT web_checking.ID_Reserva,  web_checking.ID_Tipo_documento, SUM(Carrito_reserva.Precio) as total_mes,  Carrito_reserva.Precio as total,Tipo_Forma_pago.ID as Forma_pago, Carrito_reserva.ID_Categoria as categoria,  Habitaciones.Numero,Pagos.Valor_habitacion, Tipo_Forma_pago.Nombre as Tipo_pago, web_checking.Nombre AS Nombre_Person, web_checking.Apellido, web_checking.Num_documento, Reservas.ID  as ID_reserva,Carrito_reserva.Nombre as Nombre_producto,Carrito_reserva.ID_Categoria,Carrito_reserva.Cantidad,Carrito_reserva.Precio,Carrito_reserva.Fecha_compra ,Tipo_categoria.Nombre as nombre_categoria, Pagos.Valor_habitacion FROM Carrito_reserva INNER JOIN Tipo_categoria on Carrito_reserva.ID_Categoria = Tipo_categoria.ID INNER join Reservas on Carrito_reserva.ID_Reserva = Reservas.ID  INNER JOIN Pagos on Reservas.ID = Pagos.ID_Reserva INNER join web_checking on Reservas.ID = web_checking.ID_Reserva INNER JOIN Tipo_Forma_pago on Carrito_reserva.Forma_pago = Tipo_Forma_pago.ID INNER join Habitaciones on Reservas.ID_Habitaciones = Habitaciones.ID WHERE Pagos.pago_valid=1 and Carrito_reserva.pago_deuda =1 and  month( Carrito_reserva.Fecha_compra)=? and YEAR( Carrito_reserva.Fecha_compra) =?  and Carrito_reserva.ID_Hoteles  =? GROUP by  Carrito_reserva.Fecha_compra   ORDER BY  Carrito_reserva.Fecha_compra ASC;",
      [numero_mes,numero_year, id]
    );
   
    const queryTwo = await pool.query(
      "SELECT SUM(carrito_tienda.Precio) as total,Tipo_Forma_pago.ID as Forma_pago, carrito_tienda.ID_Categoria as categoria, carrito_tienda.Nombre_persona, carrito_tienda.Num_documento, Tipo_Forma_pago.Nombre as Tipo_pago,carrito_tienda.ID_Reserva,carrito_tienda.Nombre, carrito_tienda.Precio,carrito_tienda.Cantidad,carrito_tienda.ID_hotel, carrito_tienda.Fecha_compra FROM carrito_tienda INNER join Tipo_Forma_pago on carrito_tienda.Forma_pago = Tipo_Forma_pago.ID WHERE month( carrito_tienda.Fecha_compra)=? and YEAR( carrito_tienda.Fecha_compra) = ? AND ID_hotel=? GROUP BY carrito_tienda.Fecha_compra   ORDER BY   carrito_tienda.Fecha_compra ASC;",
      [numero_mes,numero_year, id]
    );

    const queryThree = await pool.query(
      "SELECT SUM(Carrito_room.Precio) as total,Carrito_room.Forma_pago as Forma_pago, Carrito_room.ID_Categoria as categoria, Carrito_room.ID_user,users.name, Tipo_Forma_pago.Nombre as Tipo_pago,Carrito_room.Nombre, Carrito_room.Precio,Carrito_room.Cantidad,Carrito_room.ID_Hoteles, Carrito_room.Fecha_compra FROM Carrito_room INNER join Tipo_Forma_pago on Carrito_room.Forma_pago = Tipo_Forma_pago.ID INNER join users on users.id = Carrito_room.ID_user WHERE Month( Carrito_room.Fecha_compra)=? and YEAR( Carrito_room.Fecha_compra) = ?  and Carrito_room.ID_Hoteles=? and Carrito_room.Pago_deuda =1 GROUP BY Carrito_room.ID  ORDER BY  Carrito_room.ID ASC;",
      [numero_mes,numero_year, id]
    );
   
    const Totalhospedaje = await pool.query(
      "SELECT web_checking.ID_Tipo_documento, Pago_abono.Tipo_forma_pago,SUM( Pago_abono.Abono) as abono, Pago_abono.Fecha_pago, Reservas.ID as ID_reserva, Habitaciones.Numero,Habitaciones.ID ,Tipo_Forma_pago.Nombre ,Reservas.Fecha_inicio, Reservas.Codigo_reserva,web_checking.Num_documento,web_checking.Nombre as Nombre_Person,web_checking.Apellido,web_checking.Iva ,web_checking.Tipo_persona from Reservas INNER join Habitaciones on Reservas.ID_Habitaciones = Habitaciones.id INNER join web_checking on web_checking.ID_Reserva = Reservas.id INNER JOIN Pago_abono on Reservas.id = Pago_abono.ID_Reserva INNER join Tipo_Forma_pago on Tipo_Forma_pago.ID = Pago_abono.Tipo_Forma_pago WHERE Month( Pago_abono.Fecha_pago)=? and YEAR( Pago_abono.Fecha_pago) = ? and Habitaciones.ID_Hotel= ? GROUP by Pago_abono.Fecha_pago  ORDER BY  Pago_abono.Fecha_pago ASC",
      [ numero_mes,numero_year, id]
    );

    const Ocasionales = await pool.query(
      "SELECT SUM(RoomOcasionales.Abono) as total, RoomOcasionales.ID, Habitaciones.Numero, RoomOcasionales.ID_hotel,RoomOcasionales.ID_habitacion,RoomOcasionales.Abono ,Tipo_Forma_pago.Nombre ,RoomOcasionales.Fecha ,Tipo_Forma_pago.ID as ID_forma_pago,RoomOcasionales.Time_ingreso,RoomOcasionales.Time_salida, users.name from Habitaciones INNER JOIN  RoomOcasionales  on RoomOcasionales.ID_habitacion = Habitaciones.ID INNER join Tipo_Forma_pago on Tipo_Forma_pago.ID = RoomOcasionales.Tipo_forma_pago INNER join users on users.id = RoomOcasionales.id_user WHERE Month( RoomOcasionales.Fecha)=? and YEAR( RoomOcasionales.Fecha) = ?  and Habitaciones.ID_Hotel= ? GROUP by  RoomOcasionales.Fecha    ORDER BY  RoomOcasionales.Fecha  ASC ",
      [numero_mes,numero_year, id]
    );
    
    const response = await pool.query("SELECT rooms.id as id_tipoHabitacion, rooms.name as nombre, rooms.price as precio, rooms.price_people as precio_persona,  rooms.people as persona , rooms.max_people as max_persona FROM accommodation JOIN rooms ON rooms.id = accommodation.id_room WHERE accommodation.id_hotel = ?;"
    ,[id]
  )

    const roomByIdIDtypeRoom = [];
    const roomByIdIDtypeRoomTwoPerson = [];
    const roomByIdIDtypeRoomTwoPersonThre = [];
    const roomByIdIDtypeRoomTwoPersonFour = [];
    const roomByIdIDtypeRoomTwoPersonFive = []
    const roomByIdIDtypeRoomTwoPersonSix = []
    const  roomByIdIDtypeRoomDian =[]


    

    for (let i = 0; i < response?.length; i++) {
      const id_habitacion = response[i].id_tipoHabitacion;

      const roomPay = await pool.query(
        "SELECT web_checking.Iva, web_checking.Tipo_persona, Habitaciones.ID_Tipo_habitaciones, ROUND( SUM( Pago_abono.Abono  ), 0 ) AS Total_Abono, COUNT(DISTINCT Reservas.ID) AS Cantidad_Habitaciones FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN Pago_abono ON Reservas.id = Pago_abono.ID_Reserva INNER JOIN web_checking ON web_checking.ID_Reserva = Reservas.id WHERE YEAR(Reservas.Fecha_inicio) = ? AND Month(Reservas.Fecha_inicio) = ? and Habitaciones.ID_Hotel = ? and   DAYOFWEEK(Reservas.Fecha_inicio) BETWEEN 1 AND 4 AND  Reservas.Adultos = 1 and Habitaciones.ID_Tipo_habitaciones=?",
        [numero_year,numero_mes, id,id_habitacion]
      );

      const abono = roomPay[0].Total_Abono || 0;

      const room = roomPay[0].Cantidad_Habitaciones || 0;

      roomByIdIDtypeRoom.push({
        room: response[i].nombre,
        abono,
        cantidad: room,
      });

      const roomPayTwoPerson = await pool.query(
        "SELECT web_checking.Iva, web_checking.Tipo_persona, Habitaciones.ID_Tipo_habitaciones, ROUND( SUM( Pago_abono.Abono  ), 0 ) AS Total_Abono, COUNT(DISTINCT Reservas.ID) AS Cantidad_Habitaciones FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN Pago_abono ON Reservas.id = Pago_abono.ID_Reserva INNER JOIN web_checking ON web_checking.ID_Reserva = Reservas.id WHERE YEAR(Reservas.Fecha_inicio) = ? AND Month(Reservas.Fecha_inicio) = ? and Habitaciones.ID_Hotel = ? and   DAYOFWEEK(Reservas.Fecha_inicio) BETWEEN 1 AND 4 AND  Reservas.Adultos = 2 and Habitaciones.ID_Tipo_habitaciones=? ",
        [numero_year,numero_mes, id,id_habitacion]
      );
      
      const abonoTwoPerson = roomPayTwoPerson[0].Total_Abono || 0;

      const roomTwoPerson = roomPayTwoPerson[0].Cantidad_Habitaciones || 0;

      roomByIdIDtypeRoomTwoPerson.push({
        room: response[i].nombre,
        abono:abonoTwoPerson,
        cantidad: roomTwoPerson,
      });

      const roomPayTwoPersonThree = await pool.query(
        "SELECT web_checking.Iva, web_checking.Tipo_persona, Habitaciones.ID_Tipo_habitaciones, ROUND( SUM( Pago_abono.Abono  ), 0 ) AS Total_Abono, COUNT(DISTINCT Reservas.ID) AS Cantidad_Habitaciones FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN Pago_abono ON Reservas.id = Pago_abono.ID_Reserva INNER JOIN web_checking ON web_checking.ID_Reserva = Reservas.id WHERE YEAR(Reservas.Fecha_inicio) = ? AND Month(Reservas.Fecha_inicio) = ? and Habitaciones.ID_Hotel = ? and   DAYOFWEEK(Reservas.Fecha_inicio) BETWEEN 5 AND 7 AND  Reservas.Adultos = 1 and Habitaciones.ID_Tipo_habitaciones=? ",
        [numero_year,numero_mes, id,id_habitacion]
      );

      const abonoTwoPersonThree = roomPayTwoPersonThree[0].Total_Abono || 0;

      const roomTwoPersonThree = roomPayTwoPersonThree[0].Cantidad_Habitaciones || 0;

      roomByIdIDtypeRoomTwoPersonThre.push({
        room: response[i].nombre,
        abono:abonoTwoPersonThree,
        cantidad: roomTwoPersonThree,
      });

      
      
      const roomPayTwoPersonFour = await pool.query(
        "SELECT web_checking.Iva, web_checking.Tipo_persona, Habitaciones.ID_Tipo_habitaciones, ROUND( SUM( Pago_abono.Abono  ), 0 ) AS Total_Abono, COUNT(DISTINCT Reservas.ID) AS Cantidad_Habitaciones FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN Pago_abono ON Reservas.id = Pago_abono.ID_Reserva INNER JOIN web_checking ON web_checking.ID_Reserva = Reservas.id WHERE YEAR(Reservas.Fecha_inicio) = ? AND Month(Reservas.Fecha_inicio) = ? and Habitaciones.ID_Hotel = ? and   DAYOFWEEK(Reservas.Fecha_inicio) BETWEEN 5 AND 7 AND  Reservas.Adultos = 2 and Habitaciones.ID_Tipo_habitaciones=?  ",
        [numero_year,numero_mes, id,id_habitacion]
      );
      const abonoTwoPersonFour = roomPayTwoPersonFour[0].Total_Abono || 0;
      const roomTwoPersonFour = roomPayTwoPersonFour[0].Cantidad_Habitaciones || 0;
      roomByIdIDtypeRoomTwoPersonFour.push({
        room: response[i].nombre,
        abono:abonoTwoPersonFour,
        cantidad: roomTwoPersonFour,
      });

      const roomPayTwoPersonFive = await pool.query(
        "SELECT web_checking.Iva, web_checking.Tipo_persona, Habitaciones.ID_Tipo_habitaciones, ROUND( SUM( Pago_abono.Abono  ), 0 ) AS Total_Abono, COUNT(DISTINCT Reservas.ID) AS Cantidad_Habitaciones FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN Pago_abono ON Reservas.id = Pago_abono.ID_Reserva INNER JOIN web_checking ON web_checking.ID_Reserva = Reservas.id WHERE YEAR(Reservas.Fecha_inicio) = ? AND Month(Reservas.Fecha_inicio) = ? and Habitaciones.ID_Hotel = ? and   DAYOFWEEK(Reservas.Fecha_inicio) BETWEEN 1 AND 4 AND  Reservas.Adultos != 1 and Reservas.Adultos != 2 and Habitaciones.ID_Tipo_habitaciones=?  ",
        [numero_year,numero_mes, id,id_habitacion]
      );

      const abonoTwoPersonFive = roomPayTwoPersonFive[0].Total_Abono || 0;
      const roomTwoPersonFive = roomPayTwoPersonFive[0].Cantidad_Habitaciones || 0;
      roomByIdIDtypeRoomTwoPersonFive.push({
        room: response[i].nombre,
        abono:abonoTwoPersonFive,
        cantidad: roomTwoPersonFive,
      });

      const roomPayTwoPersonSix = await pool.query(
        "SELECT web_checking.Iva, web_checking.Tipo_persona, Habitaciones.ID_Tipo_habitaciones, ROUND( SUM( Pago_abono.Abono  ), 0 ) AS Total_Abono, COUNT(DISTINCT Reservas.ID) AS Cantidad_Habitaciones FROM Reservas INNER JOIN Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID INNER JOIN Pago_abono ON Reservas.id = Pago_abono.ID_Reserva INNER JOIN web_checking ON web_checking.ID_Reserva = Reservas.id WHERE YEAR(Reservas.Fecha_inicio) = ? AND Month(Reservas.Fecha_inicio) = ? and Habitaciones.ID_Hotel = ? and   DAYOFWEEK(Reservas.Fecha_inicio) BETWEEN 5 AND 7 AND  Reservas.Adultos != 1 and Reservas.Adultos != 2 and Habitaciones.ID_Tipo_habitaciones=? ",
        [numero_year,numero_mes, id,id_habitacion]
      );



      const abonoTwoPersonSix = roomPayTwoPersonSix[0].Total_Abono || 0;
      const roomTwoPersonSix = roomPayTwoPersonSix[0].Cantidad_Habitaciones || 0;
      roomByIdIDtypeRoomTwoPersonSix.push({
        room: response[i].nombre,
        abono:abonoTwoPersonSix,
        cantidad: roomTwoPersonSix,
      });

      const TotalDian = await pool.query(
        `SELECT web_checking.Iva, web_checking.Tipo_persona, Habitaciones.ID_Tipo_habitaciones,  IF(web_checking.ID_facturacion <> "", ROUND(SUM(Pago_abono.Abono), 0), 0) AS Total_Abono,  COUNT(DISTINCT Reservas.ID) AS Cantidad_Habitaciones  FROM  Reservas  INNER JOIN   Habitaciones ON Reservas.ID_Habitaciones = Habitaciones.ID  INNER JOIN  Pago_abono ON Reservas.id = Pago_abono.ID_Reserva  INNER JOIN  web_checking ON web_checking.ID_Reserva = Reservas.id  WHERE  YEAR(Reservas.Fecha_inicio) = ?   AND MONTH(Reservas.Fecha_inicio) =?  AND Habitaciones.ID_Hotel = ? AND web_checking.ID_facturacion <> "" and Habitaciones.ID_Tipo_habitaciones=? `,
        [numero_year,numero_mes, id,id_habitacion]
      );

      const abonoDian = TotalDian[0].Total_Abono || 0;
      const roomdian = TotalDian[0].Cantidad_Habitaciones || 0;

      roomByIdIDtypeRoomDian.push({
        room: response[i].nombre,
        abono:abonoDian,
        cantidad: roomdian,
      });
    
    }

    return res.status(201).json({
      ok:true,
      queryOne,
      queryTwo,
      queryThree,
      Totalhospedaje,
      Ocasionales,
      roomByIdIDtypeRoom,
      roomByIdIDtypeRoomTwoPerson,
      roomByIdIDtypeRoomTwoPersonThre,
      roomByIdIDtypeRoomTwoPersonFour,
      roomByIdIDtypeRoomTwoPersonFive,
      roomByIdIDtypeRoomTwoPersonSix,
      roomByIdIDtypeRoomDian
    })
    
  } catch (error) {
    console.log(error)
    return res.status(401).json({
      ok:false
    })
  }
}

const GetFacturacionDianByIdReserva =async(req, res = response) =>{

  const {id} = req.params

  try {

    const  query = await  pool.query("SELECT APP_colaboradores.name, APP_colaboradores.lastName, Dian_facturacion_register.Fecha, Dian_facturacion_register.Abono ,Dian_facturacion_register.ID_facturacion FROM `Dian_facturacion_register` INNER JOIN APP_colaboradores on APP_colaboradores.id_user = Dian_facturacion_register.id_user WHERE Dian_facturacion_register.ID_Reserva =?"
      ,[id])

    return res.status(201).json({
      ok:true,
      query
    })
    
  } catch (error) {
   return res.status(401).json({
    ok:false
   }) 
  }
}

const InsertRegisterHuespedBreafast =async(req, res = response) =>{

  const {Id_user,id_huesped,Fecha,NumberDesayuno,Id_hotel,ID_Reserva} = req.body

  let data={
    Id_user,
    id_huesped,
    Fecha,
    NumberDesayuno,
    Id_hotel,
    ID_Reserva
  }

  try {
    await pool.query('INSERT INTO RegisterBreakfast set ?', data, (err, customer) => {
      if(err){
          return res.status(401).json({
               ok:false,
               msg:"error al insertar datos"
          })
      }else{
        return res.status(201).json({
          ok:true
        })
      }
    })
    
  } catch (error) {
    return res.status(401).json({
      ok:false
    })
  }
}


const Getbreakfast =async(req, res = response) =>{

  const {id} = req.params

  try {

    const  query = await  pool.query("SELECT ID,Id_user,id_huesped,Id_hotel,ID_Reserva,Fecha,NumberDesayuno FROM `RegisterBreakfast` WHERE ID_Reserva =?"
      ,[id])

    return res.status(201).json({
      ok:true,
      query
    })
    
  } catch (error) {
   return res.status(401).json({
    ok:false
   }) 
  }
}



const PostRoomOcasionalMonth =async(req, res = response) =>{

  const {fecha,id} = req.body

  var fechaOne = new Date(fecha);

  var numero_mes =  fechaOne.getUTCMonth() + 1;



  try {

    const response = await pool.query("SELECT rooms.id as id_tipoHabitacion, rooms.name as nombre, rooms.price as precio, rooms.price_people as precio_persona,  rooms.people as persona , rooms.max_people as max_persona FROM accommodation JOIN rooms ON rooms.id = accommodation.id_room WHERE accommodation.id_hotel = ?;"
    ,[id]
  )

    const query= []
    for (let i = 0; i < response?.length; i++) {
      const id_habitacion = response[i].id_tipoHabitacion;
      const res = await pool.query(
        "SELECT RoomOcasionales.ID, Habitaciones.Numero, RoomOcasionales.ID_hotel,RoomOcasionales.ID_habitacion,RoomOcasionales.Abono ,Tipo_Forma_pago.Nombre ,RoomOcasionales.Fecha ,Tipo_Forma_pago.ID as ID_forma_pago,RoomOcasionales.Time_ingreso,RoomOcasionales.Time_salida, users.name from Habitaciones INNER JOIN  RoomOcasionales  on RoomOcasionales.ID_habitacion = Habitaciones.ID INNER join Tipo_Forma_pago on Tipo_Forma_pago.ID = RoomOcasionales.Tipo_forma_pago INNER join users on users.id = RoomOcasionales.id_user WHERE Habitaciones.ID_Tipo_habitaciones =? and    MONTH( RoomOcasionales.Fecha) = ?  and Habitaciones.ID_Hotel= ?;",
        [id_habitacion, numero_mes, id]
      ); 

      for (const date of res) {
        query.push({
          ID: date.ID,
          Numero: date.Numero,
          Habitacion: response[i].nombre,
          Abono: date.Abono,
          Tipo_forma_pago: date.Nombre,
          Fecha:date.Fecha,
          Forma_pago:date.ID_forma_pago,
          username:date.name,
          Time_ingreso:date.Time_ingreso,
          Time_salida:date.Time_salida
        });
      }
    }
 
  return res.status(201).json({
    ok:true,
    query
  })


  } catch (error) {
    return res.status(201).json({
      ok:false
    })
  }

}


const HandDetalleHistory =async(req, res = response) =>{

  const {id} = req.params

  try {

  const userQuery = await pool.query ("SELECT * FROM `Informe_movimiento` WHERE `Codigo_reserva` LIKE ?",id)
    
  return res.status(201).json({
    ok:true,
    userQuery
  })

  } catch (error) {
    return res.status(201).json({
      ok:false
    })
  }

}



module.exports = {
  GetRooms,
  validateAvaible,
  insertReservaRecepcion,
  getTypePet,
  getReserva,
  PruebaGet,
  GetCanales,
  roomAvaible,
  getDetailReservation,
  postCleanlineRooms,
  getCountry,
  updateDetailReservation,
  updateDetailPagos,
  getdetailhuespedes,
  postdetailUpdate,
  updateDetailReserva,
  getRoomdetalle,
  uploadImage,
  insertCartReservation,
  getCartReservaction,
  getDetailChecking,
  handAddHuespe,
  HuespeCount,
  handResolution,
  handUpdateResoluction,
  handUpdateResoluction,
  handUpdateStatus,
  handDeleteReserva,
  handInformeAuditoria,
  handReservationChekin,
  handInformeCamarera,
  insertCartStore,
  handRoomToSell,
  handPayStoreReservation,
  updateDetailReservaTypeRoom,
  handAlltotalReservation,
  handChangeRoom,
  handCleanRoom,
  handInformaSotore,
  notiticar,
  handUpdateCreateReservation,
  byIdProduct,
  handValidDian,
  handInsertPayAbono,
  getpayABono,
  roomAvaibleInformeConsolidado,
  AccountErrings,
  informationByIdHotel,
  InformeMovimiento,
  PostInformeMovimiento,
  PostRoomDetailUpdate,
  updateReservationPunter,
  updateChangeTypreRange,
  handChangeFormapago,
  getReservationSearch,
  UploadFile,
  UploadFileSignature,
  ValidCheckingAll,
  KPIgetUser,
  KpiTop,
  GetPublicidad,
  searchUsersaved,
  postInsetRoomsOcasional,
  occasionalCartRoomInsertion,
  getRoomsOcasionalesDetail,
  occasionalUpdateProductData,
  PostReserva,
  getReservationContabilidad,
  postChangeResdian,
  getReservaSendingContabilidad,
  GetFacturacion,
  PostFacturacion,
  GetDocument,
  PostTypeRoomsByIDHotelid_hotel,
  GetSouvenir,
  proxyTraOne,
  proxyTraTwo,
  InsertPdfFacturacionsigo,
  ReservationClean,
  HandDasboard,
  HandUpdateUserRoles,
  GetMetricasInformeMonthHotel,
  GetFacturacionDianByIdReserva,
  InsertRegisterHuespedBreafast,
  Getbreakfast,
  PostRoomOcasionalMonth,
  HandDetalleHistory
};

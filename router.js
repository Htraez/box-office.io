const   express = require('express'),
        router = express.Router(),
        fs = require('fs-extra'),
        uuidv4 = require('uuidv4'),
        mysql = require('./mysql_config'),
        moment = require('moment');
        passport = require('./passport');

function checkAuthentication(req,res,next){
    if(req.isAuthenticated()){
        //req.isAuthenticated() will return true if user is logged in
        next();
    } else{
        res.redirect("/guest");
    }
}

router.all('/', checkAuthentication, (req, res) => {
    let reservationNo = req.query.reservationNo == '' ? undefined:req.query.reservationNo;
    let scheduleNo = req.query.scheduleNo == ''? undefined:req.query.scheduleNo;
    res.render('index', {
            auth: req.user.customerNo != null ? 1 : 2,
            data:{
                reservationSuccess: {
                    reservationNo: reservationNo,
                    scheduleNo: scheduleNo
                }
            }
    });
});

router.all('/guest', (req,res)=>{
    res.render('index', {
        auth: false
    });
});

router.get('/user', checkAuthentication, (req,res)=>{
    if(Object.keys(req.query).length==0){
        res.send(req.user);
    }else{
        let columns = '`'+req.query.columns.join().replace(/,/g,'`,`')+'`';
        if(req.query.columns.includes('*')) columns = '*';
        let table = req.user.customerNo == null ? 'staff' : 'customer';
        let searchField = req.user.customerNo == null ? 'StaffNo' : 'CustomerNo';
        let userNo = req.user.customerNo == null ? req.user.staffNo : req.user.customerNo;
        mysql.connect('SELECT '+columns+' FROM `'+table+'` WHERE `'+searchField+'`='+userNo+';')
        .then((resp)=>{
            if(resp.rows.length <= 0){
                //return
                res.sendStatus(404);
            }
            res.send({...req.user,...resp.rows[0]});
        })
        .catch((err)=>{
            console.log('error',err);
        });
    }
});

router.get('/movies', (req,res)=>{
    let status = req.query.status == '' ? undefined:req.query.status;
    let movieId = req.query.movieId == '' ? undefined:req.query.movieId;
    let columns = undefined;
    let movieDateStart = req.query.dateStart == '' ? undefined:req.query.dateStart;
    let movieDateStop = req.query.dateStop == '' ? undefined:req.query.dateStop;
    if(typeof req.query.columns != 'undefined'){
        columns = req.query.columns.length > 0 ? '`'+req.query.columns.join().replace(/,/g,'`,`')+'`':undefined;
    }
    let query = 'SELECT'+ (columns?columns:'*') 
                    + 'FROM `movie`' 
                    + (status||movieId ? 'WHERE':'') 
                    + (movieId ? '`MovieNo`='+movieId:'') 
                    + (status&&movieId || movieDateStart&&movieId ? 'AND':'') 
                    + (status=='show' ? '`MovieNo` IN (SELECT `MovieNo` FROM `schedule` WHERE `schedule`.`Date` >= "'+movieDateStart+'" ':' ') 
                    + (movieDateStart&&movieDateStop ? 'AND `schedule`.`Date` <= "'+movieDateStop+'") ':'')
                    + (movieDateStart&&!movieDateStop ? ') ':'')
                    + ';';
    mysql.connect(query)
    .then((resp)=>{
        if(resp.rows.length <= 0){
            //return
            res.sendStatus(404);
        }
        console.log('found',resp.rows.length,'movie(s)');
        res.send(resp.rows);
    })
    .catch((err)=>{
        console.log('error',err);
    });
});

router.get('/schedule', (req,res)=>{
    let status = req.query.status == '' ? undefined:req.query.status;
    let movieId = req.query.movieId == '' ? undefined:req.query.movieId;
    let date = req.query.date == '' ? undefined:req.query.date;
    let query = 'SELECT s.*,t.BranchNo,t.PlanName, b.BranchName, b.BranchAddress FROM `schedule` s '
                    + 'JOIN (SELECT * FROM theatre) AS t ON s.TheatreCode = t.TheatreCode '
                    + 'JOIN (SELECT * FROM branch) AS b ON t.BranchNo = b.BranchNo '
                    + 'WHERE `MovieNo`='+movieId+' ';
    if(date){
        query += "AND `Date` >= '"+date+"'";
    }
    mysql.connect(query)
    .then((resp)=>{
        if(resp.rows.length <= 0){
            //return
            res.sendStatus(404);
        }
        console.log('found',resp.rows.length,'schedule(s)');
        res.send(resp.rows);
    })
    .catch((err)=>{
        console.log('error',err);
    });
});

router.get('/plan', (req,res)=>{
    let theatreId = req.query.theatreId == '' ? undefined:req.query.theatreId;
    let query = "SELECT p.* FROM `plan` p,`theatre` t "
                    + "WHERE t.TheatreCode = '" + theatreId + "' "
                    + "AND p.PlanName = t.PlanName";
    mysql.connect(query)
    .then((resp)=>{
        if(resp.rows.length <= 0){
            //return
            res.sendStatus(404);
            return;
        }
        console.log('found',resp.rows.length,'theatre plan(s)');
        res.send(resp.rows);
    })
    .catch((err)=>{
        console.log('error',err);
    });
});

router.get('/reservation/customer', (req,res) => {
    let targetCustomer = req.query.customerId == '' ? undefined: req.query.customerId;
    if(targetCustomer){
        let query = "SELECT r.*, b.`BranchName`, m.*, s.`TheatreCode`, s.`Date` as PlayDate, s.`Time` as PlayTime, s.`Audio`, s.`Dimension`, s.`Subtitle`, i.`ReservationItem`, i.`SeatClass`, i.`SeatCode`, i.`FullPrice` "
                        +"FROM `reservation` r, `reservation_items` i, `movie` m, `schedule` s, `theatre` t, `branch` b "
                        +"WHERE r.`ReservationNo` = i.`ReservationNo` "
                        +"AND s.`ScheduleNo` = r.`ScheduleNo` "
                        +"AND t.`TheatreCode` = s.`TheatreCode` "
                        +"AND b.`BranchNo` = t.`BranchNo` "
                        +"AND m.`MovieNo` = s.`MovieNo` "
                        +"AND r.`CustomerNo` = "+targetCustomer+";";
        mysql.connect(query)
        .then((resp)=>{
            if(resp.rows.length <= 0){
                //return
                res.sendStatus(204);
                return;
            }
            console.log('found',resp.rows.length,'user reservation(s)');
            let byReservation = {}
            let byCreatedDate = {}
            resp.rows.forEach((row)=>{
                if(typeof byReservation[row.ReservationNo] == 'undefined') byReservation[row.ReservationNo] = [];
                byReservation[row.ReservationNo].push(row);
            });
            Object.keys(byReservation).forEach((reservationNo)=>{
                let mon_template = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                let date = new Date(byReservation[reservationNo][0].DateCreated);
                date = date.getDate()+'-'+(mon_template[date.getMonth()])+'-'+date.getFullYear();
                if(typeof byCreatedDate[date] == 'undefined') byCreatedDate[date] = [];
                byCreatedDate[date].push(byReservation[reservationNo]);
            });
            res.send(byCreatedDate);
        })
        .catch((err)=>{
            console.log('error',err);
        });
        return;
    }else{
        res.sendStatus(400);
        return;
    }
});

router.get('/reservation/:scheduleNo', (req,res)=>{
    let scheduleNo = req.params.scheduleNo;
    let query = "SELECT i.SeatClass, i.SeatCode, i.SeatRow, i.SeatCol FROM `reservation` r, `reservation_items` i "
                    +"WHERE r.`ReservationNo` = i.`ReservationNo` "
                    +"AND r.`ScheduleNo` = "+scheduleNo+";"
    mysql.connect(query)
    .then((resp)=>{
        if(resp.rows.length <= 0){
            //return
            res.send(null);
            return;
        }
        console.log('found',resp.rows.length,'reservation(s)');
        res.send(resp.rows);
    })
    .catch((err)=>{
        console.log('error',err);
    });
});

router.get('/coupon', (req,res)=>{
    console.log('user sent=>',req.query);
    let code = req.query.code == '' ? undefined:req.query.code;
    let query = "SELECT * FROM `coupon` "
                    + "WHERE `CouponCode`='"+code+"'";
    mysql.connect(query)
    .then((resp)=>{
        if(resp.rows.length <= 0){
            //return
            res.status(200).send([]);
            return;
        }
        console.log('found',resp.rows.length,'coupon with code "'+code+'"');
        res.send(resp.rows);
    })
    .catch((err)=>{
        console.log('error',err);
    });
});

router.get('/seatclass', (req,res)=>{
    let classNames = req.query.className == '' ? undefined:req.query.className;
    let query = "SELECT * FROM `seatclass` WHERE "
    let i = 0;
    classNames.forEach((className)=>{
        if(i>0) query += ' OR '
        query += "`ClassName`='"+className+"'";
        i++;
    }) 
    query+=";" 
    mysql.connect(query)
    .then((resp)=>{
        if(resp.rows.length <= 0){
            //return
            res.sendStatus(404);
        }
        console.log('found',resp.rows.length,'theatre plan(s)');
        res.send(resp.rows);
    })
    .catch((err)=>{
        console.log('error',err);
    });
});

router.post('/tickets', checkAuthentication, (req,res)=>{
    let seatList = req.body.seatCode;
    let movieNo = req.body.movieNo;
    let customerNo = req.body.customerNo;
    let scheduleNo = req.body.scheduleNo;
    let email = req.body.userEmail;
    let telephone = (typeof req.body.telephone != 'undefined') ? req.body.userTele:undefined;
    let couponCode = undefined;
    if(typeof req.body.coupon != 'undefined') {
        couponCode = (req.body.coupon!='') ? req.body.coupon.toUpperCase():null;
    }
    //identify issuer
    let correctUser = req.user.customerNo == req.body.customerNo;

    //initialize reservation
    let reservation = {
        ReservationKey: undefined,
        CustomerNo: customerNo,
        ScheduleNo: scheduleNo,
        CouponUsage: undefined,
        TicketList: []
    };

    //create reservation
    let query3 = "INSERT INTO `reservation` (`CustomerNo`, `ScheduleNo`, `DateCreated`) "
                    +"VALUES("+reservation.CustomerNo+", "+reservation.ScheduleNo+", CURRENT_TIMESTAMP);";
    
    mysql.connect(query3)
    .then((resp)=>{
        return resp.insertId;
    })
    //Create Reservation Items with reservationKey
    .then((reservationKey)=>{
        //get plan by schedule number
        let query4 = "SELECT p.* FROM `plan` p, `schedule` s, `theatre` t "
                        +"WHERE s.`ScheduleNo` = "+reservation.ScheduleNo+" "
                        +"AND t.`TheatreCode` = s.`TheatreCode` "
                        +"AND p.`PlanName` = t.`PlanName`;"
        return mysql.connect(query4)
        .then((resp)=>{
            if(resp.rows.length > 0){
                return resp.rows[0];
            }
        })
        .then((plan)=>{
            //get price for class
            let query5 = "SELECT * FROM `seatclass` WHERE ";
            for(let i=1;i<=4;i++){
                if(plan['SeatClass'+i]!=null) {
                    if(i>1) query5 += "OR ";
                    query5 += "ClassName = '"+plan['SeatClass'+i]+"' ";
                }
            }
            query5+=';';
            return mysql.connect(query5)
            .then((resp)=>{
                let reservationObj = reservation;
                reservationObj.ReservationKey = reservationKey;
                
                if(resp.rows.length > 0){
                    let classInfo = resp.rows;
                    // seat code to class, row, column
                    seatList.forEach((seatCode, i)=>{
                        // console.log(seatCode);
                        let row = seatCode.match(/[a-zA-Z]+/g)[0].charCodeAt(0)+26*(seatCode.match(/[a-zA-Z]+/g).length-1)-65; //start from 0
                        let classList = [];
                        let priceList = {};
                        for(let i=1;i<=4;i++){
                            if(plan['SeatClass'+i]!=null) classList = [...classList, ...Array.apply(null, Array(plan['NumberRow'+i])).map(function(){return plan['SeatClass'+i]})];
                            if(i <= classInfo.length) priceList[classInfo[i-1].ClassName] = classInfo[i-1].Price;
                        }

                        //reservationObj.reservationKey = reservationKey;
                        reservationObj.TicketList.push({
                            ReservationNo: reservationKey,
                            ReservationItem: i,
                            SeatCode: seatCode,
                            SeatClass: classList[row],
                            SeatRow: row,
                            SeatCol: parseInt(seatCode.match(/\d+/g)[0]),
                            FullPrice: priceList[classList[row]]
                        });
                    });
                    
                    return reservationObj;
                }
                //else throw error invalid seat class
            })
        })
    })
    //INSERT reservation item
    .then((reservations)=>{
        let query6 = "INSERT INTO reservation_items(`ReservationNo`, `ReservationItem`, `SeatCode`, `SeatClass`, `SeatRow`, `SeatCol`, `FullPrice`) VALUES";
        reservations.TicketList.forEach((item, i)=>{
            if(i>0) query6 += ",";
            query6 += "("+item.ReservationNo+","+item.ReservationItem+",'"+item.SeatCode+"','"+item.SeatClass+"',"+item.SeatRow+","+item.SeatCol+","+item.FullPrice+")";
        });
        query6 += ";"
        return mysql.connect(query6)
        .then((resp)=>{
            return {ticketItemResp:resp, reservationKey:reservations.reservationKey, reservationObj: reservations};
        });
    })
    //validate coupon
    .then((resp)=>{
        let reservationObj = resp.reservationObj;
        let query = "SELECT * FROM `coupon` "
                    + "WHERE `CouponCode`='"+couponCode+"';";
        //validate coupon (if found create coupon usage)
        return mysql.connect(query)
        .then((resp)=>{
            if(resp.rows.length <= 0 || couponCode==null){
                reservationObj.CouponUsage = null;
                // return null;
            }else{
                //console.log(reservationObj);
                let totalPrice = 0;
                reservationObj.TicketList.forEach((ticket)=>{
                    totalPrice+=ticket.FullPrice;
                });
                let coupon = resp.rows[0];
                let deduction = totalPrice*coupon.Discount;
                if(coupon.MaxDiscount != 0 && coupon.MaxDiscount != null) deduction = coupon.MaxDiscount;
                //validate requirement (if not pass return like is null)
                    //check coupon
                    let todayDate = new Date();
                    let expDate = new Date(coupon.EXPDate);
                    let expPass = todayDate < expDate;

                    let spendPass = totalPrice >= coupon.MinSpend;
                    let minSeatPass = reservationObj.TicketList.length >= coupon.MinSeat;
                    let availablePass = coupon.NoAvailable > 0;
                    //check coupon schedule
                    let schedulePass = true;
                    //check coupon seatclass
                    let seatClassPass = true;

                if(!(expPass && spendPass && minSeatPass && availablePass && schedulePass && seatClassPass)){
                    reservationObj.CouponUsage = null;
                }else{
                    //create coupon usage
                    let query1 = "INSERT INTO `couponusage` (`CouponUsageNo`, `ReservationNo`, `CouponCode`, `Deduction`)"
                                    +"VALUES (NULL, '"+reservationObj.ReservationKey+"', '"+coupon.CouponCode+"', "+deduction+");"
                    return mysql.connect(query1)
                    .then((resp)=>{
                        //read coupon usage no 
                        let couponUsageKey = resp.insertId;
                        reservationObj.CouponUsage = couponUsageKey;
                        reservationObj.Coupon = coupon;
                        return reservationObj;
                    });
                }
            }
            return reservationObj;
        })
    })
    //update coupon's NoAvailable
    .then((reservationObj)=>{
        if(typeof reservationObj.CouponUsage != 'undefined'){
            if(reservationObj.CouponUsage != null){
                let couponCode = reservationObj.Coupon.CouponCode;
                let noAvailable = reservationObj.Coupon.NoAvailable - 1;
                //decrement coupon NoAvailable
                let query2 = "UPDATE `coupon` SET `NoAvailable` = '"+noAvailable.toString(10)+"' "
                                +"WHERE `coupon`.`CouponCode` = '"+couponCode+"';";
                
                return mysql.connect(query2)
                .then((resp)=>{
                    return reservationObj;
                });
            }
        }
        return reservationObj;
    })
    //get ticketing result for user
    .then((ticketObj)=>{
        console.log('ticketing ALL SUCCESS')
        res.status(200).send(ticketObj);
    })
    .catch((err)=>{
        console.log('ticketing ERROR',err);
        res.sendStatus(500);
    });
    //console.log('==========\nTicket(s) Requested:\n('+seatList.length+' seat(s))\n', req.body,'\n==========\n');
});

router.post('/tickets/:ticketId/confirm', (req,res)=>{

});

//=======================

router.get('/fetchData/:table/:condition', (req,res) => {
    //เรียกใช้ด้วย /fetchData/ชื่อตารางที่ต้องการดึงข้อมูล/เงื่อนไข(เช่น PlanName=Branch01 ไม่มีเว้นวรรค)ถ้าไม่มีเงื่อนไขให้ใส่ none
    var sql = "SELECT * FROM `"+req.params.table+"` ",
        condition = req.params.condition.split("=");
    if(condition[0]!="none"){
        sql += "WHERE `"+condition[0]+"` = '"+condition[1]+"'";
    }
    //console.log(sql);
    mysql.connect(sql)
        .then((resp)=>{
            //console.log(resp);
            res.send(resp.rows);
        });
});

router.post('/seatclass', (req,res) => {
    var data = req.body;
    var use = 0;
    var sql = "INSERT INTO `seatclass` (`ClassName`, `Price`, `Couple`, `FreeFood`, `Width`, `Height`) VALUES";
    //console.log(data);
    //res.send(data);
    data.SeatClassData.forEach((value)=>{
        if(value.Detail){
            if(value.Detail=='Create'){
                sql += "('"+value.ClassName+"','"+ value.Price+"','"+value.Couple+"','"+value.FreeFood+"','"+value.Width+"','"+value.Height+"'),";
                use = 1;
            }
        }
        
    })
    sql = sql.substring(0, sql.length-1);
    if(use){
        mysql.connect(sql)
        .then((resp)=>{
            res.sendStatus(200);
        });
    }
    else res.sendStatus(200);
});


router.post('/plan/update', (req,res)=>{
    var data = req.body;
    var sql = "UPDATE `plan` SET `PlanName` = '"+data.newName+"' WHERE `plan`.`PlanName` = '"+data.oldName+"'";
    mysql.connect(sql)
        .then((resp)=>{
            res.sendStatus(200);
        })
        .catch((err)=>{
            //console.log('update plan ERROR',err);
            res.sendStatus(500);
        });
})

router.get('/plan/delete/:plan',(req,res)=>{
    var sql = "DELETE FROM `plan` WHERE `plan`.`PlanName` = '"+req.params.plan+"'";
    //console.log(sql);
    mysql.connect(sql)
        .then((resp)=>{
            res.sendStatus(200);
        })
        .catch((err)=>{
            //console.log('update plan ERROR',err);
            res.sendStatus(500);
        });
})

router.post('/plan', (req,res)=>{
    var data = req.body;
    //console.log(data);
    var sql = "INSERT INTO `plan` (`PlanName`, `PlanHeight`, `PlanWidth`, `SeatClass1`, `NumberRow1`, `SeatClass2`, `NumberRow2`, `SeatClass3`, `NumberRow3`, `SeatClass4`, `NumberRow4`) VALUES ('"+
                data.PlanName+"','"+ data.PlanHeight+"','"+data.PlanWidth+"','"+data.SeatClass1+"','"+data.NoRow1+"','"+data.SeatClass2+"','"+data.NoRow2+"','"+data.SeatClass3+"','"+data.NoRow3+"','"+data.SeatClass4+"','"+data.NoRow4+"')ON DUPLICATE KEY UPDATE PlanName=VALUES(PlanName),PlanName=VALUES(PlanName),PlanHeight=VALUES(PlanHeight),PlanWidth=VALUES(PlanWidth),SeatClass1=VALUES(SeatClass1),NumberRow1=VALUES(NumberRow1),SeatClass2=VALUES(SeatClass2),NumberRow2=VALUES(NumberRow2),SeatClass3=VALUES(SeatClass3),NumberRow3=VALUES(NumberRow3),SeatClass4=VALUES(SeatClass4),NumberRow4=VALUES(NumberRow4)";
    sql = sql.replace(/'undefined'/g, 'NULL');
    //console.log(sql);
    mysql.connect(sql)
        .then((resp)=>{
            var TheatreDelete = [];
            //console.log(resp);
            if(data.Theatre != null){
                var sqlInsert = "INSERT INTO `theatre`(`TheatreCode`, `BranchNo`, `PlanName`) VALUES ",
                sqlDelete = "DELETE FROM `theatre` WHERE `TheatreCode` IN (?)",
                callFunctionSql = [0,0]; //Insert and Update , Delete
                data.Theatre.forEach((value) => {
                    switch(value.Detail.Type){
                        case 'Update' : if(value.Detail.Old != value.Name){ TheatreDelete.push(value.Detail.Old); callFunctionSql[1]=1; } 
                        case 'Create' : sqlInsert += "('"+value.Name+"','"+value.Branch+"','"+data.PlanName+"'),"; callFunctionSql[0]=1; break;
                        case 'Delete' : TheatreDelete.push(value.Detail.Old); callFunctionSql[1]=1; break;
                    }
                });
                sqlInsert = sqlInsert.substring(0, sqlInsert.length-1);
                sqlInsert += "ON DUPLICATE KEY UPDATE TheatreCode=VALUES(TheatreCode), BranchNo=VALUES(BranchNo), PlanName=VALUES(PlanName)";
                callFunctionSql[1] ? sql = sqlDelete : sql = sqlInsert;
                if(callFunctionSql[0]||callFunctionSql[1]){
                    //console.log(sql);
                    mysql.connect(sql,TheatreDelete)
                        .then((resp)=>{
                            if(callFunctionSql[0]&&callFunctionSql[1]){
                                sql = sqlInsert;
                                mysql.connect(sql).then((resp)=>{
                                    //console.log(resp);
                                    res.send(resp);
                                });
                            }
                            else{
                                //console.log(resp);
                                res.send(resp.rows);
                            }
                        });
                }
                else res.send(resp);
            }else res.send(resp);
       });
});

router.post('/register',(req,res)=>{
    var data = req.body;
    var sql = "INSERT INTO `customer`( `FirstName`, `MidName`, `LastName`, `BirthDate`, `Age`, `Gender`, `CitizenID/PassportID`, `PhoneNumber`, `ImageURL`, `Address`, `Email`) VALUES";
    sql += " ('"+data.Detail.firstname+"','"+data.Detail.midname+"','"+data.Detail.lastname+"','"+data.Detail.birthday+"','"+data.Detail.age+"','"+data.Detail.gender+"','"+data.Detail.C_PId+"','"+data.Detail.phone+"','"+data.Detail.img+"','"+data.Detail.address+"','"+data.Detail.email+"')";
    mysql.connect(sql)
        .then((resp)=>{
            var sql = "INSERT INTO `users`(`Username`, `Password`, `CustomerNo.`, `StaffNo.`) VALUES";
            sql += "('"+data.user.username+"','"+data.user.password+"','"+resp.insertId+"',NULL)";
            console.log(sql);
            mysql.connect(sql)
                .then((resp=>{
                    res.sendStatus(200);
                }))
        })
    console.log(data);
})


//=======================

router.get('/shiftapplies/All',(req,res)=>{
    var sql = "SELECT * FROM `staff` s, `shiftapplies` sa, `shift` sh WHERE sa.ShiftNo = sh.ShiftNo AND sa.StaffNo = s.StaffNo";
    mysql.connect(sql)
        .then((resp)=>{
            res.send(resp.rows);
        })
})

// router.get('/staff/FirstName',(req,res)=>{

//     var sql = "SELECT Day, StartTime, EndTime FROM staff s, shiftapplies a,shift t WHERE t.ShiftNo = a.ShiftNo AND a.StaffNo = s.StaffNo AND s.StaffNo =;
//     console.log(sql);
    // mysql.connect(sql)
    //     .then((resp)=>{
    //         res.sendStatus(200);
    //     })
    //     .catch((err)=>{
    //         //console.log('update plan ERROR',err);
    //         res.sendStatus(500);
    //     });
//})

router.get('/staff/delete/:shift',(req,res)=>{
    var sql = "DELETE FROM `shift` WHERE `shift`.`ShiftNo` = "+req.params.shift+"";
    //console.log(sql);
    mysql.connect(sql)
        .then((resp)=>{
            res.sendStatus(200);
        })
        .catch((err)=>{
            //console.log('update plan ERROR',err);
            res.sendStatus(500);
        });
})

router.get('/staff/deleteshift/:shift',(req,res)=>{
    var sql = "DELETE FROM `shift` WHERE `shift`.`ShiftNo` = "+req.params.shift+"";
    //console.log(sql);
    mysql.connect(sql)
        .then((resp)=>{
            res.sendStatus(200);
        })
        .catch((err)=>{
            //console.log('update plan ERROR',err);
            res.sendStatus(500);
        });
})


router.get('/staff/deletename/:name',(req,res)=>{
    var sql = "DELETE FROM `staff` WHERE `staff`.`StaffNo` = "+req.params.name+"";
    //console.log(sql);
    mysql.connect(sql)
        .then((resp)=>{
            res.sendStatus(200);
        })
        .catch((err)=>{
            //console.log('update plan ERROR',err);
            res.sendStatus(500);
        });
})

router.post("/staff/update",(req,res)=>{
    var data = req.body;
    var sql = "INSERT INTO `shift` (`Day`, `StartTime`, `EndTime`) VALUES ('"+data.Day+"','"+ data.StartTime+"','"+data.EndTime+"')ON DUPLICATE KEY UPDATE Day=VALUES(Day),StartTime=VALUES(StartTime),EndTime=VALUES(EndTime)";
    console.log(sql);
})

router.post("/staff", (req, res) =>{
    var data = req.body;
    var sql = "INSERT INTO `staff` (`FirstName`, `MidName`, `LastName`, `BirthDay`, `CitizenID`, `Gender`, `HighestEdu`, `ImageURL`, `DateEmployed`, `Address`, `PhoneNumber`, `Marital`, `Position` , `BranchNo`) VALUES ('"+
                data.staff.FirstName+"','"+ data.staff.MidName+"','"+data.staff.LastName+"','"+data.staff.BirthDay+"','"+data.staff.CitizenID+"','"+data.staff.Gender+"','"+data.staff.HighestEdu+"','"+data.staff.ImageURL+"','"+data.staff.DateEmployed+"','"+data.staff.Address+"','"+data.staff.PhoneNumber+"','"+data.staff.Marital+"','"+data.staff.Position+"','"+data.staff.BranchNo+"')";
    mysql.connect(sql)
        .then((resp)=>{
            var insertID  = { staffid : resp.insertId , shiftid:""}
            var sql = "INSERT INTO `shift` (`Day`,`StartTime`,`EndTime`) VALUE";
                data.shift.forEach((value)=>{
                    var timestart = value.StartHH+":"+value.StartMM+":"+value.StartSS;
                    var timeend = value.EndHH+":"+value.EndMM+":"+value.EndSS;
                    sql += " ('"+value.Date+"','"+timestart+"','"+timeend+"'),";
                });
            sql = sql.substring(0,sql.length-1);
            console.log(sql);
            mysql.connect(sql)
            .then((resp)=>{
                    //console.log(resp);
                    insertID.shiftid = parseInt(resp.insertId);
                    var sql = "INSERT INTO `shiftapplies`(`StaffNo`, `ShiftNo`) VALUE";
                    for(var i=0; i<resp.rows.affectedRows;i++){
                        var real = insertID.shiftid+i;
                        sql += "('"+insertID.staffid+"','"+real+"'),"
                    }
                    sql = sql.substring(0,sql.length-1);
                    console.log(sql);
                    mysql.connect(sql)
                    .then((resp)=>{

                    })
                })
        })
    });

// router.all('/', (req, res) => {
//     console.log(req.user);
//     res.render('index');
// });

router.get('/admin', checkAuthentication, (req,res) => {
    res.render('admin',{auth:true});
});

router.post('/login', 
    passport.authenticate('local', { 
        successRedirect: '/',
        failureRedirect: '/?badlogin=true',
        failureFlash: true 
    }), (req,res) => {
    console.log('login route run!', req.body);
});
router.get('/logout', checkAuthentication, (req,res)=>{
    req.logout();
    res.redirect('/')
});

module.exports = router;

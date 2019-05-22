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
    res.render('index', {
            auth: req.user.customerNo != null ? 1 : 2
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
    if(typeof req.query.columns != 'undefined'){
        columns = req.query.columns.length > 0 ? '`'+req.query.columns.join().replace(/,/g,'`,`')+'`':undefined;
    }
    console.log(movieId)
    console.log(movieId!=undefined)
    let query = 'SELECT'+ (columns?columns:'*') 
                    + 'FROM `movie`' 
                    + (status||movieId ? 'WHERE':'') 
                    + (movieId!=undefined ? '`MovieNo`='+movieId:'') 
                    + (status&&movieId ? 'AND':'') 
                    + (status=='show' ? '`MovieNo` IN (SELECT `MovieNo` FROM `schedule`)':'') + ';';
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
    let query = 'SELECT s.*,t.BranchNo,t.PlanName, b.BranchName, b.BranchAddress FROM `schedule` s '
                    + 'JOIN (SELECT * FROM theatre) AS t ON s.TheatreCode = t.TheatreCode '
                    + 'JOIN (SELECT * FROM branch) AS b ON t.BranchNo = b.BranchNo '
                    + 'WHERE `MovieNo`='+movieId;
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
        }
        console.log('found',resp.rows.length,'theatre plan(s)');
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
        couponCode = (req.body.coupon!='') ? req.body.coupon.toUpperCase():undefined;
    }
    //identify issuer
    let correctUser = req.user.customerNo == req.body.customerNo;
    console.log(correctUser,req.user);

    //initialize ticket
    let reservation = {
        CustomerNo: customerNo,
        ScheduleNo: scheduleNo,
        CouponUsage: null,
        TicketList: []
    };

    //validate coupon
    if(couponCode){
        let query = "SELECT * FROM `coupon` "
                    + "WHERE `CouponCode`='"+couponCode+"'";
        mysql.connect(query)
        .then((resp)=>{
            if(resp.rows.length <= 0){
                reservation.CouponUsage = null;
            }else{
                let coupon = resp.rows[0];
                console.log(coupon);
                //create coupon usage
                let query1 = "INSERT INTO `couponusage` (`CouponUsageNo`, `ScheduleNo`, `CouponCode`)"
                                +"VALUES (NULL, '"+reservation.ScheduleNo+"', '"+coupon.CouponCode+"');"
                mysql.connect(query1)
                .then((resp, insertId)=>{
                    console.log(resp);
                    console.log(insertId);
                })
                .catch((err)=>{console.log('error',err);})
                // //read coupon usage no 
                // let query2 = "SELECT LAST_INSERT_ID();"
                // //decrement coupon NoAvailable
                // let query3 = "UPDATE `coupon` SET `NoAvailable` = '"+(coupon.NoAvailble-1).toString(10)+"'"
                //                 +"WHERE `coupon`.`CouponCode` = '"+coupon.CouponCode+"';";
                // //create reservation
                // let query4 = "INSERT INTO `reservation` (`ReservationNo`, `CustomerNo`, `ScheduleNo`, `DateCreated`, `Approve`, `CouponUsage`)"
                //                 +"VALUES ('', '"+reservation.customerNo+"', '1', CURRENT_TIMESTAMP, '0', '111')";
                
                // //create reservation items
                // mysql.connect(query1+query2)
                // .then((resp)=>{

                // });
                
            }
            
        })
        .catch((err)=>{
            console.log('error',err);
        });
    }

    //
    
    console.log('==========\nTicket(s) Requested:\n('+seatList.length+' seat(s))\n', req.body,'\n==========');
    res.redirect('/');
});

router.post('/tickets/:ticketId/confirm', (req,res)=>{

});

// v ==== CHANGE ROUTE NAME IMMEDIATELY! PLEASE STRICTLY COMPLY WITH THE REST-API CONVENTION!!! ==== v
// router.get('/fetchBranchData', (req,res) => {
//     var sql = "SELECT * FROM `branch`";
//     mysql.connect(sql)
//         .then((resp)=>{
//             //console.log(resp);
//             res.send(resp.rows);
//         });
// });


router.post('/fetchData',(req,res)=>{
    console.log(req.body);
    var sql = "SElECT * FROM `"+req.body.table+"`";
    mysql.connect(sql)
        .then((resp)=>{
            res.send(resp.rows);
        });
});
// v ==== BELOW IS REPEATING AN EXISTING ROUTE! ==== v
// router.get('/fetchSeatClasshData', (req,res) =>{
//     var sql = "SELECT * FROM `seatclass`";
//     mysql.connect(sql)
//         .then((resp)=>{
//             //console.log(resp);
//             res.send(resp.rows);
//         });
// });

// v ==== DO NOT DEFINE YOUR TEST ROUTE WITH THIS NAME! IT'S FOR WORKING ROUTE THIS WILL CREATE CONFLICT ==== v
// router.get('/seat', (req,res) => {
//     res.render('partials/seatclass');
// });

router.get('/branch', (req,res) => {
    res.render('partials/branch', {
        auth: false
    });
});

router.get('/addSchedule', (req,res) => {
    res.render('partials/schedule', {
        auth: false
    });
});
router.post('/seatAdd', (req,res) => {
    var data = req.body;
    var sql = "INSERT INTO `seatclass` (`ClassName`, `Price`, `Couple`, `FreeFood`, `Width`, `Height`) VALUES ('"+
                data.Name+"','"+ data.Price+"','"+data.Couple+"','"+data.FreeFood+"','"+data.Width/100+"','"+data.Height/100+"')";
    mysql.connect(sql)
        .then((resp)=>{
            console.log(resp);
            res.redirect('/seat');
        });
});
// v ==== CHANGE ROUTE NAME IMMEDIATELY! PLEASE STRICTLY COMPLY WITH THE REST-API CONVENTION!!! ==== v
// router.post('/seatAdd', (req,res) => {
//     var data = req.body;
//     var sql = "INSERT INTO `seatclass` (`ClassName`, `Price`, `Couple`, `FreeFood`, `Width`, `Height`) VALUES ('"+
//                 data.Name+"','"+ data.Price+"','"+data.Couple+"','"+data.FreeFood+"','"+data.Width/100+"','"+data.Height/100+"')";
//     mysql.connect(sql)
//         .then((resp)=>{
//             console.log(resp);
//             res.redirect('/seat');
//         });
// });

// v ==== DO NOT DEFINE YOUR TEST ROUTE WITH THIS NAME! IT'S FOR WORKING ROUTE ==== v
// router.get('/plan', (req,res)=>{
//     res.render('partials/plan');
// });

// v ==== CHANGE ROUTE NAME IMMEDIATELY! PLEASE STRICTLY COMPLY WITH THE REST-API CONVENTION!!! ==== v
// router.post('/planAdd', (req,res)=>{
//     var data = req.body;
//     console.log(data);
//     var sql = "INSERT INTO `plan` (`PlanName`, `PlanHeight`, `PlanWidth`, `SeatClass1`, `NumberRol1`, `SeatClass2`, `NumberRol2`, `SeatClass3`, `NumberRol3`, `SeatClass4`, `NumberRol4`) VALUES ('"+
//                 data.PlanName+"','"+ data.PlanHeight+"','"+data.PlanWidth+"','"+data.SeatClass1+"','"+data.NoRow1+"','"+data.SeatClass2+"','"+data.NoRow2+"','"+data.SeatClass3+"','"+data.NoRow3+"','"+data.SeatClass4+"','"+data.NoRow4+"')";
//     sql = sql.replace(/'undefined'/g, 'NULL');
//     console.log(sql);
//     mysql.connect(sql)
//         .then((resp)=>{
//             console.log(resp);
//             var sql = "INSERT INTO `theatre`(`TheatreCode`, `BranchNo`, `PlanName`) VALUES ";
//             data.Theatre.forEach((value) => {
//                 sql += "('"+value.Name+"','"+value.Branch+"','"+data.PlanName+"'),";
//             });
//             sql = sql.substring(0, sql.length-1);
//             mysql.connect(sql)
//                 .then((resp)=>{
//                     console.log(resp);
//                     res.redirect('/plan');
//                 });
            
//        });
    
//});

// v ==== CHANGE ROUTE NAME IMMEDIATELY! PLEASE STRICTLY COMPLY WITH THE REST-API CONVENTION!!! ==== v
// router.post('/theatreAdd', (req,res)=>{
//     var data = req.body;
//     var sql = "INSERT INTO `theatre`(`TheatreCode`, `BranchNo`, `PlanName`) VALUES ";
//     data.Theatre.forEach((value) => {
//         sql += "('"+value.Name+"','"+value.Branch+"','"+data.PlanName+"'),";
//     });
//     sql = sql.substring(0, sql.length-1);
//     console.log(sql);
//     // mysql.connect(sql)
//     //     .then((resp)=>{
//     //         console.log(resp);
//     //         res.redirect('/plan');
//     //     });
//     //console.log(data.Theater[0]);
    
// })

router.all('/', (req, res) => {
    console.log(req.user);
    res.render('index');
});

router.get('/admin', checkAuthentication, (req,res) => {
    res.render('admin');
});

router.post('/login', 
    passport.authenticate('local', { 
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true 
    }), (req,res) => {
    console.log('login route run!', req.body);
});
router.get('/logout', checkAuthentication, (req,res)=>{
    req.logout();
    res.redirect('/')
});

router.post('/branch', (req,res) => {
    var data = req.body;
    var sql = "INSERT INTO `branch` (`BranchName`, `BranchAddress`, `PhoneNumber`, `ManagerStaffNo`) VALUES ('"+
                data.Name+"','"+ data.Address+"','"+data.Phone+"','"+data.Manager+"')";
    mysql.connect(sql)
        .then((resp)=>{
            console.log(resp);
            res.redirect('/branch');
        });
    console.log(sql)
});

router.post('/addSchedule', (req,res) => {
    var data = req.body;
    // var sql = "INSERT INTO `schedule` (`MovieNo`, `TheatherCode`, `Date`, `Time`,`Audio`,`Dimension`,`Subtitle`) VALUES ('"+
    // data.movie+"','"+data.theater+"','"+data.Date+"','"+data.StartTime+":00"+"','"+data.Audio+"','"+data.AdDuration+"','"+data.SubTitle+"')";
    var sql = "INSERT INTO `schedule` (`MovieNo`, `TheatreCode`, `Date`, `Time`,`Audio`,`Dimension`,`Subtitle`) VALUES ('"+"1"+"','"+"EN-01"+"','"+data.Date+"','"+data.StartTime+":00"+"','"+data.Audio+"','"+data.AdDuration+"','"+data.SubTitle+"')";
    console.log(sql)
    mysql.connect(sql)
        .then((resp)=>{
            console.log(resp);
            res.redirect('/addSchedule');
        });
    console.log(sql)
});

module.exports = router;

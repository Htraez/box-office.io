var addshiftshow = [];
var shiftAppliesData = [];
var deleteshiftstaff = [];
var deletenamestaff = [];
var SelectStaffElement = [];

function staffForm(){
    $("#staffForm").show();
    $(".content-view").hide();
}

function cancelStaff(){
    $("#staffForm").hide();
    $(".content-view").show();
}

function next(){
    $("#staffForm").hide();
    $("#addShift").show();
}

function back(){
    $("#staffForm").show();
    $("#addShift").hide();
}

function back2(){
    pageRedirect();
}

function editbutton(){
    $(".content-view").hide();
    $("#addShift2").show();
}

function savedata(){
    var payload ={
        staff:{
            FirstName:$("#firstName").val(),
            MidName:$("#midName").val(),
            LastName:$("#lastName").val(),
            BirthDay:$("#birthday").val(),
            CitizenID:$("#citizenID").val(),
            Gender:$("#gender").val(),
            HighestEdu:$("#highestEdu").val(),
            ImageURL:$("#imageURL").val(),
            DateEmployed:$("#dateEmployed").val(),
            Address:$("#address").val(),
            PhoneNumber:$("#phone").val(),
            Marital:$("#marital").val(),
            Position:$("#position").val(),
            BranchNo:$("#branchNo").val(),
        },
        shift: [...addshiftshow]
    }
    if(payload.staff.FirstName&&payload.staff.LastName&&payload.staff.BirthDay&&payload.staff.CitizenID&&payload.staff.Gender&&payload.staff.HighestEdu&&payload.staff.ImageURL&&payload.staff.DateEmployed&&payload.staff.Address&&payload.staff.PhoneNumber&&payload.staff.Marital&&payload.staff.Position&&payload.staff.BranchNo){
        console.log(payload);
        $.post("/staff",payload,(res)=>{
            //ช่องว่างไว้ใส่ฟังก์ชันที่เราต้องการเรียกใช้หลังจากส่งข้อมูลเสร็จ
        });
    }
    else{
        console.log("Error");  }
    
}

function fetchbranchforstaff(){
    $.get('/fetchData/branch/none',(data)=>{
            data.forEach((value,key)=>{
            $("#branchNo").append('<option class="form-control-plaintext" value="'+value.BranchNo+'">'+value.BranchName+'</option>');
        })
    });
}

function assignshiftforstaff(){
    
    var temp = {
        Date: $('#date').val(),
        StartHH: $('#HHstartTime').val(),
        StartMM: $('#MMstartTime').val(),
        StartSS: $('#SSstartTime').val(),
        EndHH: $('#HHendTime').val(),
        EndMM: $('#MMendTime').val(),
        EndSS: $('#SSendTime').val()
    }
    if(temp.Date!=""&&temp.StartHH!=""&&temp.StartMM!=""&&temp.StartSS!=""&&temp.EndHH!=""&&temp.EndMM!=""&&temp.EndSS!=""){
        if(temp.StartHH<0||temp.StartHH>24||temp.StartMM<0||temp.StartMM>60||temp.StartSS<0||temp.StartSS>60||temp.EndHH<0||temp.EndHH>24||temp.EndMM<0||temp.EndMM>60||temp.EndSS<0||temp.EndSS>60){
        console.log("ERROR");
        }
        else{
            if(temp.StartHH<10||temp.StartMM<10||temp.StartSS<10||temp.EndHH<10||temp.EndMM<10||temp.EndSS<10){
                $('#HHstartTime').val()
            }
        console.log("OK");
        addshiftshow.push(temp);
        }
    }
    else{
        console.log("No data");
    }
    
    addtotable();
}

function addtotable(){
    $('#showdatetime').find("li").remove();
    addshiftshow.forEach((value)=>{
        var addshifttable = "<li><span>Date: '' </span>"+value.Date+" ''&emsp;&emsp;<span>Start : "+value.StartHH+":"+value.StartMM+":"+value.StartSS+" </span>&emsp; End : "+value.EndHH+":"+value.EndMM+":"+value.EndSS+"</li>"
        $('#showdatetime').append(addshifttable);   
    })
    
}


// function addListStaff(data) {
// data.forEach((value) => {
//     //var tableRowappend = '<tr class="default-mouse planTable" ><th style="border:1px solid white;" class="text-white pl-3" scope="col">'+value.PlanName+'</th></tr>'
//     var shifttableappend = "<li class='staffList' value='"+value.StaffNo+"'>"+value.FirstName+"&emsp;"+value.LastName+"</li>";
//     $("#listStaff").append(shifttableappend);
//     });
// //$('#Th'+nowTH).addClass('bg-secondary').siblings().removeClass('bg-secondary');
// }

// function getStaffList(){
//     $.get('/fetchData/staff/none',(data)=>{
//             addListStaff(data);
//     });
// }

//showstaffshift(data2)

// $(document).on("click",".staffList",function(event){
//     $('#detailstaff').show();
//     $.get('/fetchData/shiftapplies/StaffNo='+this.getAttribute("value"),(data)=>{
       
//         });
//     });
// })

// data.forEach((value)=>{
//     $.get('/fetchData/shift/ShiftNo='+value.ShiftNo,(data2)=>{
//         console.log(value.ShiftNo)
//         console.log(data2);
//         data2.forEach((value)=>{
//             var shiftdetail = "<li class='detailshift''>"+new Date(value.Day).getDate()+'/'+(new Date(value.Day).getMonth()+1)+'/'+new Date(value.Day).getFullYear()+"&emsp;"+value.StartTime+"&emsp;"+value.EndTime+"</li>";
//             $("#detailstaff").append(shiftdetail);
//         })
        
//         //showstaffshift(data2);

//     })

let shiftObj = {};
$.get('/shiftapplies/All',(data)=>{
    console.log(data);
    
    data.forEach((record)=>{
        if(typeof shiftObj[record.StaffNo] == 'undefined'){
            shiftObj[record.StaffNo] = [];
        }
        shiftObj[record.StaffNo].push(record);
    });
    console.log(shiftObj);
    
    Object.keys(shiftObj).forEach((staffNo)=>{
        let staffData = shiftObj[staffNo][0];
        var shifttableappend = "<li data-name='"+staffNo+"'>"+staffData.FirstName+' '+staffData.LastName+"</li>";
        $("#listStaff").append(shifttableappend);
        console.log(shiftObj);
        $("#listStaff").children().last().off('click').click(function(e){
            SelectStaffElement[0] = staffNo ;
            $(this).addClass('selected').siblings().removeClass('selected');
            let nameParent = $(this).data('name');
            deletenamestaff = nameParent;
            $('#detailstaff').show();
            $('#showdetailstaff').show();            
            $("#detailstaff li").siblings().hide(); // ซ่อน Sibling
            $("#detailstaff li[data-name='"+nameParent+"']").show(); // โชว์ children
            $('#button-name').show();
            
        });


        shiftObj[staffNo].forEach((shift, i)=>{
                var shiftdetail = "<li data-name='"+staffNo+"' data-shift='"+shift.ShiftNo+"'>Date: "+new Date(shift.Day).getDate()+'/'+(new Date(shift.Day).getMonth()+1)+'/'+new Date(shift.Day).getFullYear()+"&emsp; Start: "+shift.StartTime+"&emsp; End:"+shift.EndTime+"</li>";
                $("#detailstaff").append(shiftdetail);
                $("#detailstaff").children().last().hide(); //ซ่อนทั้งหมด
                $("#detailstaff").children().last().off('click').click(function(e){
                    SelectStaffElement[1] = shift.ShiftNo ;
                    $(this).addClass('selected').siblings().removeClass('selected');
                    // var data = $(this).data('shift');
                    // console.log(data);
                    // deleteshiftstaff = data;
                    // var selectshift = "<li data-shift='"+shift.data+"'>Date: "+new Date(shift.Day).getDate()+'/'+(new Date(shift.Day).getMonth()+1)+'/'+new Date(shift.Day).getFullYear()+"&emsp; Start: "+shift.StartTime+"&emsp; End:"+shift.EndTime+"</li>";
                    // $("#select-shift").append(selectshift);                   // $('#select-shift').show();
                    // $("#select-shift ").show();
                    // $("#detailstaff").children().last().click(function(e){
                        //let data = $(this).data('shift');
                        //console.log(data);
                        //var shiftselect = "<li data-shift='"+data.ShiftNo+"'>Date: "+new Date(data.Day).getDate()+'/'+(new Date(data.Day).getMonth()+1)+'/'+new Date(data.Day).getFullYear()+"&emsp; Start: "+data.StartTime+"&emsp; End:"+data.EndTime+"</li>";
                        //$('$select-shift').append(shiftselect);
                        //$("#detailstaff li[data-shift='"+data+"']").show();
                    //});
                });
                //
                // 

                // 
                // 
                // 
                    
                    
                    
                    //เปิดฟอร์ม
                    //render ข้อมูลจาก shift
                
                //});
        });
       // var addLastBottom = '<div class="mx-auto mt-3 text-center " id="button-name"><button type="button" class="btn-white mr-5" style="display: inline-block;" id="editshift">Edit</button><button type="button" class="btn-white" style="display: inline-block;" id="deleteshift">Delete</button></div>';
        //$("#detailstaff").append(addLastBottom);
    
    })
})

function pageRedirect() {
    window.location.href = "http://localhost:8000/admin";
} 

$(document).on("click","#deletename",function(event){
    $.get('/staff/deletename/'+deletenamestaff,(res)=>{
        pageRedirect();
    });
    console.log(deletenamestaff);
});

$(document).on("click","#deleteshift",function(event){
    event.stopPropagation();
    iziToast.show({
        position: "topCenter", 
        iconUrl: '/assets/images/load_placeholder.svg',
        title: 'Saving Data', 
        color: 'blue',
        message: 'Please Wait',
        timeout: false,
        overlay: true,
        close: false
    });
    $.get('/staff/deleteshift/'+SelectStaffElement[1],(res)=>{
        pageRedirect();
    });
    console.log(SelectStaffElement[1]);
});

function editshift(){
    staffForm();
    console.log(shiftObj[SelectStaffElement[0]]);
    var getdata = shiftObj[SelectStaffElement[0]];
    console.log(getdata);
    $("#firstName").val(getdata[0].FirstName);
    $("#midName").val(getdata[0].MidName.replace("undefined",""));
    $("#lastName").val(getdata[0].LastName);
    var date = new Date(getdata[0].BirthDay);
    var currentDate = date.toISOString().slice(0,10);
    $("#birthday").val(currentDate);
    $("#citizenID").val(getdata[0].CitizenID);
    $("#gender").val(getdata[0].Gender);
    $("#highestEdu").val(getdata[0].HighestEdu);
    $("#imageURL").val(getdata[0].ImageURL);
    date = new Date(getdata[0].DateEmployed);
    currentDate = date.toISOString().slice(0,10);
    $("#dateEmployed").val(currentDate);
    $("#address").val(getdata[0].Address);
    $("#phone").val(getdata[0].PhoneNumber);
    $("#marital").val(getdata[0].Marital);
    $("#position").val(getdata[0].Position);
    $("#branchNo").val(getdata[0].BranchNo);
     
    
    getdata.forEach((value)=>{
       // console.log(value);
        var start = value.StartTime.split(':');
        var end = value.EndTime.split(':');
        var temp = value.Day.split("T");
        var temp = {
            Date: temp[0],
            StartHH: start[0],
            StartMM: start[1],
            StartSS: start[2],
            EndHH: end[0],
            EndMM: end[1],
            EndSS: end[2]
        }
        console.log(temp);
        addshiftshow.push(temp);
    });
    addtotable()
}




$(document).on("click","#editname",editbutton);
$(document).on("click","#editshift",editshift);
$(document).on("click","#createstaffshift",staffForm);
$(document).on("click","#cancelStaff",cancelStaff);
$(document).on("click","#next",next);
$(document).on("click","#back",back);
fetchbranchforstaff();
//getStaffList();
$(document).on("click","#savedata",savedata);
$(document).on("click","#assignShift",assignshiftforstaff)
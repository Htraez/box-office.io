var addshiftshow = [];


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
    
    addtotable()
}

function addtotable(){
    $('#showdatetime').find("li").remove();
    addshiftshow.forEach((value)=>{
        var addshifttable = "<li><span>Date: '' </span>"+value.Date+" ''&emsp;&emsp;<span>Start : "+value.StartHH+":"+value.StartMM+":"+value.StartSS+" </span>&emsp; End : "+value.EndHH+":"+value.EndMM+":"+value.EndSS+"</li>"
        $('#showdatetime').append(addshifttable)   
    })
    
}

function addListStaff(data) {
data.forEach((value) => {
    //var tableRowappend = '<tr class="default-mouse planTable" ><th style="border:1px solid white;" class="text-white pl-3" scope="col">'+value.PlanName+'</th></tr>'
    var shifttableappend = "<li class='staffList'>"+value.FirstName+"&emsp;"+value.LastName+"</li>";
    $("#listStaff").append(shifttableappend);
    });
//$('#Th'+nowTH).addClass('bg-secondary').siblings().removeClass('bg-secondary');
}

function getStaffList(){
    $.get('/fetchData/staff/none',(data)=>{
            addListStaff(data);
    });
}

$(document).on("click","#createstaffshift",staffForm);
$(document).on("click","#cancelStaff",cancelStaff);
$(document).on("click","#next",next);
$(document).on("click","#back",back);
fetchbranchforstaff();
getStaffList();
$(document).on("click","#savedata",savedata);
$(document).on("click","#assignShift",assignshiftforstaff)
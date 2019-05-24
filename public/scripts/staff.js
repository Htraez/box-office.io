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
        shift:[
            
        ]
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
        StartHH: $('#HHstartTime').val(),
        StartHH: $('#HHstartTime').val(),
        EndHH: $('#HHendTime').val(),
        EndMM: $('#endTime').val(),
        EndSS: $('#endTime').val(),  
    }
    console.log("OK");
    addshiftshow.push(temp);
}

$(document).on("click","#createStaff",staffForm);
$(document).on("click","#cancelStaff",cancelStaff);
$(document).on("click","#next",next);
$(document).on("click","#back",back);
fetchbranchforstaff();
$(document).on("click","#savedata",savedata);
$(document).on("click","#assignShift",assignshiftforstaff)
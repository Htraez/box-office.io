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
            DateEmployed:$("#dateEmployed").val(),
            Address:$("#address").val(),
            PhoneNumber:$("#phone").val(),
            Marital:$("#marital").val(),
            Position:$("#position").val(),
            BranchNo:$("#branchNo").val(),
        },
        shift:[]
    }
    if(payload.staff.FirstName&&payload.staff.Address){
        console.log(payload);
        $.post("/staff",payload,(res)=>{
            //ช่องว่างไว้ใส่ฟังก์ชันที่เราต้องการเรียกใช้หลังจากส่งข้อมูลเสร็จ
        });
    }
    else{
        console.log("Error");  }
    
}

$(document).on("click","#createStaff",staffForm);
$(document).on("click","#cancelStaff",cancelStaff);
$(document).on("click","#next",next);
$(document).on("click","#back",back);

$(document).on("click","#savedata",savedata);